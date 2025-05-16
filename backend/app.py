from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import uuid
from utils import (load_observations, save_observation, load_knowledge_base,
                   query_similar_texts, generate_answer, save_uploaded_image, build_faiss_index)

app = Flask(__name__)
CORS(app)

app.config['UPLOAD_FOLDER'] = "uploads"
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# In-memory observations cache, refreshed on start
observations = load_observations().to_dict(orient='records')

# FAISS index initialized globally
FAISS_INDEX, FAISS_CORPUS = build_faiss_index()

@app.route("/api/observations", methods=["GET"])
def get_observations():
    return jsonify(observations)

@app.route("/api/submit", methods=["POST"])
def submit_observation():
    # Handle multipart form for image upload
    if 'image' in request.files:
        image_file = request.files['image']
        image_path = save_uploaded_image(image_file)
        image_url = f"/uploads/{os.path.basename(image_path)}"
    else:
        image_url = request.json.get("image_url", "")

    data = request.form if request.form else request.json

    new_obs = {
        "observation_id": str(uuid.uuid4())[:8].upper(),
        "species_name": data.get("species_name", "").strip(),
        "common_name": data.get("common_name", "").strip(),
        "date_observed": data.get("date_observed", "").strip(),
        "location": data.get("location", "").strip(),
        "image_url": image_url,
        "notes": data.get("notes", "").strip(),
        "observer": data.get("observer", "Anonymous").strip() or "Anonymous"
    }

    # Append to in-memory + CSV file
    observations.append(new_obs)
    save_observation(new_obs)

    # Rebuild FAISS index with new data
    global FAISS_INDEX, FAISS_CORPUS
    FAISS_INDEX, FAISS_CORPUS = build_faiss_index()

    return jsonify({"message": "Observation submitted", "observation": new_obs}), 201

@app.route("/api/ai-species-id", methods=["POST"])
def ai_species_id():
    # This endpoint expects a JSON with image_url or multipart image file
    # For demo: simple hardcoded mock
    return jsonify({
        "suggestions": [
            {"species_name": "Aquila rapax", "common_name": "Tawny Eagle", "confidence": 0.92},
            {"species_name": "Buceros bicornis", "common_name": "Great Hornbill", "confidence": 0.87},
        ]
    })

@app.route("/uploads/<filename>")
def serve_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route("/api/qa", methods=["POST"])
def qa():
    user_question = request.json.get("question", "").strip()
    if not user_question:
        return jsonify({"error": "Empty question"}), 400

    # Retrieve top-k relevant text snippets for RAG
    retrieved = query_similar_texts(user_question, top_k=5)
    # Generate answer using LLM augmented by context
    answer = generate_answer(retrieved, user_question)
    return jsonify({"answer": answer})

@app.route("/api/gamification", methods=["GET"])
def gamification():
    from collections import Counter
    cnt = Counter(obs.get("observer", "Anonymous") for obs in observations)
    if not cnt:
        return jsonify({"top_observer": "None", "submissions": 0})
    top, num = cnt.most_common(1)[0]
    return jsonify({"top_observer": top, "submissions": num})

if __name__ == "__main__":
    app.run(debug=True)
