import os
import pandas as pd
from sentence_transformers import SentenceTransformer
import faiss
import torch
from transformers import pipeline
from PIL import Image

UPLOAD_FOLDER = "uploads"
DATA_FOLDER = "data"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(DATA_FOLDER, exist_ok=True)

# Load observations CSV
def load_observations():
    path = os.path.join(DATA_FOLDER, "observations.csv")
    if os.path.exists(path):
        return pd.read_csv(path)
    return pd.DataFrame(columns=["observation_id", "species_name", "common_name", "date_observed",
                                 "location", "image_url", "notes", "observer"])

# Save a new observation row to CSV
def save_observation(row_dict):
    df = load_observations()
    df = pd.concat([df, pd.DataFrame([row_dict])], ignore_index=True)
    df.to_csv(os.path.join(DATA_FOLDER, "observations.csv"), index=False)

# Load knowledge base text snippets (split by double newline)
def load_knowledge_base():
    path = os.path.join(DATA_FOLDER, "knowledge_base.txt")
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            content = f.read()
        return [snippet.strip() for snippet in content.split("\n\n") if snippet.strip()]
    return []

# Initialize Sentence Transformer model for embeddings (choose a small model for speed)
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

# Build or update FAISS index from knowledge base + observation notes
def build_faiss_index():
    knowledge_texts = load_knowledge_base()
    df_obs = load_observations()
    notes = df_obs["notes"].dropna().astype(str).tolist()

    corpus = knowledge_texts + notes

    embeddings = embedding_model.encode(corpus, convert_to_numpy=True, show_progress_bar=False)
    dimension = embeddings.shape[1]

    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)

    return index, corpus

# Initialize global FAISS index + corpus
FAISS_INDEX, FAISS_CORPUS = build_faiss_index()

# Query similar texts for RAG
def query_similar_texts(query, top_k=5):
    global FAISS_INDEX, FAISS_CORPUS
    query_emb = embedding_model.encode([query], convert_to_numpy=True)
    distances, indices = FAISS_INDEX.search(query_emb, top_k)
    return [FAISS_CORPUS[idx] for idx in indices[0]]

# Load HuggingFace text-generation pipeline (you can change model here)
text_generator = pipeline("text2text-generation", model="google/flan-t5-small", device=0 if torch.cuda.is_available() else -1)

# Generate augmented answer using retrieved context + user query
def generate_answer(context_snippets, user_query):
    prompt = "Context: " + " ".join(context_snippets) + "\nQuestion: " + user_query + "\nAnswer:"
    response = text_generator(prompt, max_length=150, do_sample=False)
    return response[0]['generated_text']

# Save uploaded image file and return path
def save_uploaded_image(file_storage):
    filename = file_storage.filename
    save_path = os.path.join(UPLOAD_FOLDER, filename)
    file_storage.save(save_path)
    return save_path

# Add these functions to your backend/utils.py file

def get_active_challenges(username, observations):
    """
    Generates active challenges for a user based on their observation history.
    
    Args:
        username (str): The username of the user
        observations (list): List of all observations
        
    Returns:
        list: List of challenge objects with progress information
    """
    # Get user's observations
    user_observations = [obs for obs in observations 
                        if obs.get("observer", "").lower() == username.lower()]
    
    # Get user stats to determine appropriate challenges
    observation_count = len(user_observations)
    species_count = len(set(obs.get("species_name", "") for obs in user_observations))
    location_count = len(set(obs.get("location", "") for obs in user_observations))
    
    # Create challenges based on user's current level
    challenges = []
    
    # Daily streak challenge (everyone gets this)
    challenges.append({
        "id": "daily-streak",
        "title": "Daily Observer",
        "description": "Submit at least one observation every day for 5 consecutive days",
        "icon": "📅",
        "progress": calculate_current_streak(user_observations),
        "target": 5,
        "rewards": ["'Weekly Watcher' badge", "25% rank boost for the week"],
        "expiresIn": "6 days"
    })
    
    # Beginner challenges
    if observation_count < 20:
        challenges.append({
            "id": "beginner-species",
            "title": "Species Explorer",
            "description": "Document 10 different species",
            "icon": "🔎",
            "progress": species_count,
            "target": 10,
            "rewards": ["'Naturalist Novice' badge", "50 points"],
            "expiresIn": "30 days"
        })
        
        challenges.append({
            "id": "beginner-location",
            "title": "Location Scout",
            "description": "Visit and document 5 different locations",
            "icon": "🗺️",
            "progress": location_count,
            "target": 5,
            "rewards": ["'Explorer Initiate' badge", "40 points"],
            "expiresIn": "30 days"
        })
    
    # Intermediate challenges
    elif observation_count < 50:
        most_observed_location = get_most_observed_location(user_observations)
        
        location_observation_count = sum(1 for obs in user_observations 
                                        if most_observed_location in obs.get("location", ""))
        
        challenges.append({
            "id": "intermediate-diversity",
            "title": "Biodiversity Champion",
            "description": "Document 20 different species",
            "icon": "🦉",
            "progress": species_count,
            "target": 20,
            "rewards": ["'Biodiversity Guardian' badge", "100 points"],
            "expiresIn": "60 days"
        })
        
        challenges.append({
            "id": "location-master",
            "title": "Location Master",
            "description": f"Document 15 observations at {most_observed_location}",
            "icon": "📍",
            "progress": location_observation_count,
            "target": 15,
            "rewards": ["'Area Specialist' badge", "75 points"],
            "expiresIn": "45 days"
        })
    
    # Advanced challenges
    else:
        rare_species = get_rare_species_list()
        rare_species_observed = sum(1 for obs in user_observations 
                                    if obs.get("species_name", "") in rare_species)
        
        challenges.append({
            "id": "rare-species",
            "title": "Rare Finds",
            "description": "Document 5 rare or endangered species",
            "icon": "💎",
            "progress": rare_species_observed,
            "target": 5,
            "rewards": ["'Conservation Hero' badge", "250 points", "Featured on homepage"],
            "expiresIn": "90 days"
        })
        
        challenges.append({
            "id": "community-leader",
            "title": "Community Leader",
            "description": "Reach #1 rank in weekly observations",
            "icon": "👑",
            "progress": 1 if is_weekly_leader(username, observations) else 0,
            "target": 1,
            "rewards": ["'Community Champion' badge", "300 points"],
            "expiresIn": "7 days"
        })
    
    # Seasonal challenge (everyone gets this)
    current_season = get_current_season()
    seasonal_species = get_seasonal_species(current_season)
    seasonal_observed = sum(1 for obs in user_observations 
                           if obs.get("species_name", "") in seasonal_species)
    
    challenges.append({
        "id": f"{current_season.lower()}-specialist",
        "title": f"{current_season} Specialist",
        "description": f"Document 8 {current_season} species",
        "icon": get_season_icon(current_season),
        "progress": seasonal_observed,
        "target": 8,
        "rewards": [f"'{current_season} Naturalist' badge", "150 points"],
        "expiresIn": get_season_end()
    })
    
    return challenges

def calculate_current_streak(observations):
    """
    Calculate the current streak of consecutive days with observations
    """
    # Implementation similar to calculate_consecutive_days() but for current streak only
    # For now, return a simulated value
    return 3

def get_most_observed_location(observations):
    """
    Get the location with the most observations from a user
    """
    from collections import Counter
    location_counts = Counter(obs.get("location", "") for obs in observations)
    return location_counts.most_common(1)[0][0] if location_counts else "Margalla Hills"

def get_rare_species_list():
    """
    Get a list of rare or endangered species in the region
    """
    # Simplified example - in a real implementation, this would come from a database
    return [
        "Panthera pardus", # Leopard
        "Manis crassicaudata", # Indian Pangolin
        "Gyps bengalensis", # White-rumped Vulture
        "Haliaeetus leucoryphus", # Pallas's Fish Eagle
        "Ovis vignei", # Urial
        "Buceros bicornis", # Great Hornbill
        "Lutra lutra", # Eurasian Otter
        "Hyaena hyaena", # Striped Hyena
        "Felis chaus", # Jungle Cat
        "Canis aureus", # Golden Jackal
    ]

def is_weekly_leader(username, all_observations):
    """
    Check if a user is the weekly leader in observations
    """
    from datetime import datetime, timedelta
    from collections import Counter
    
    # Get observations from the past week
    one_week_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
    recent_observations = [obs for obs in all_observations 
                           if obs.get("date_observed", "") >= one_week_ago]
    
    # Count observations by user
    user_counts = Counter(obs.get("observer", "Anonymous") for obs in recent_observations)
    
    # Check if this user is the top contributor
    if not user_counts:
        return False
    
    top_user, _ = user_counts.most_common(1)[0]
    return top_user.lower() == username.lower()

def get_current_season():
    """
    Get the current season based on the date
    """
    from datetime import datetime
    
    month = datetime.now().month
    
    if 3 <= month <= 5:
        return "Spring"
    elif 6 <= month <= 8:
        return "Summer"
    elif 9 <= month <= 11:
        return "Autumn"
    else:
        return "Winter"

def get_seasonal_species(season):
    """
    Get a list of species that are particularly relevant in the given season
    """
    # Simplified example - in a real implementation, this would come from a database
    seasonal_species = {
        "Spring": [
            "Hirundo rustica", # Barn Swallow
            "Psittacula krameri", # Rose-ringed Parakeet
            "Francolinus pondicerianus", # Grey Francolin
            "Columba livia", # Rock Pigeon
            "Alcedo atthis", # Common Kingfisher
            "Pavo cristatus", # Indian Peafowl
            "Dendrocygna javanica", # Lesser Whistling Duck
            "Aythya fuligula", # Tufted Duck
        ],
        "Summer": [
            "Aquila rapax", # Tawny Eagle
            "Buceros bicornis", # Great Hornbill
            "Milvus migrans", # Black Kite
            "Macaca mulatta", # Rhesus Macaque
            "Varanus bengalensis", # Bengal Monitor
            "Naja naja", # Indian Cobra
            "Hystrix indica", # Indian Crested Porcupine
            "Herpestes edwardsii", # Indian Grey Mongoose
        ],
        "Autumn": [
            "Panthera pardus", # Common Leopard
            "Canis aureus", # Golden Jackal
            "Axis axis", # Chital Deer
            "Tragelaphus scriptus", # Bushbuck
            "Paradoxurus hermaphroditus", # Asian Palm Civet
            "Felis chaus", # Jungle Cat
            "Ceryle rudis", # Pied Kingfisher
            "Strix aluco", # Tawny Owl
        ],
        "Winter": [
            "Phoenicurus ochruros", # Black Redstart
            "Haliaeetus leucoryphus", # Pallas's Fish Eagle
            "Gyps bengalensis", # White-rumped Vulture
            "Lutra lutra", # Eurasian Otter
            "Manis crassicaudata", # Indian Pangolin
            "Ovis vignei", # Urial
            "Alcedo atthis", # Common Kingfisher
            "Dendrocygna javanica", # Lesser Whistling Duck
        ]
    }
    
    return seasonal_species.get(season, [])

def get_season_icon(season):
    """
    Get an emoji icon for the given season
    """
    icons = {
        "Spring": "🌸",
        "Summer": "☀️",
        "Autumn": "🍂",
        "Winter": "❄️"
    }
    
    return icons.get(season, "🌱")

def get_season_end():
    """
    Get an estimate of when the current season ends
    """
    from datetime import datetime
    
    month = datetime.now().month
    day = datetime.now().day
    
    if 3 <= month <= 5:  # Spring
        days_left = (31 - day) if month == 5 else (31 - day + 30) if month == 4 else (31 - day + 30 + 31)
        return f"{days_left} days"
    elif 6 <= month <= 8:  # Summer
        days_left = (31 - day) if month == 8 else (31 - day + 31) if month == 7 else (31 - day + 31 + 30)
        return f"{days_left} days"
    elif 9 <= month <= 11:  # Autumn
        days_left = (30 - day) if month == 11 else (30 - day + 31) if month == 10 else (30 - day + 31 + 30)
        return f"{days_left} days"
    else:  # Winter
        if month == 12:
            return f"{31 - day + 31 + 28} days"
        else:  # month == 1 or 2
            return f"{28 - day} days" if month == 2 else f"{28 - day + 31} days"