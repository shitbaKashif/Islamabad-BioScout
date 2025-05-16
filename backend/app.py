from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from collections import Counter
import os
import uuid
import re
from utils import (load_observations, save_observation, load_knowledge_base,
                   query_similar_texts, generate_answer, save_uploaded_image, build_faiss_index)

app = Flask(__name__)
CORS(app)

app.config['UPLOAD_FOLDER'] = "uploads"
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

observations = load_observations().to_dict(orient='records')
FAISS_INDEX, FAISS_CORPUS = build_faiss_index()

@app.route("/api/observations", methods=["GET"])
def get_observations():
    return jsonify(observations)


@app.route("/api/submit", methods=["POST"])
def submit_observation():
    try:
        # Parse data from multipart/form-data or JSON
        if request.content_type.startswith('multipart/form-data'):
            data = request.form.to_dict()
            image_file = request.files.get('image')
            image_url = ""
            if image_file:
                image_path = save_uploaded_image(image_file)
                image_url = f"/uploads/{os.path.basename(image_path)}"
            else:
                image_url = data.get("image_url", "")
        else:
            data = request.json or {}
            image_url = data.get("image_url", "")

        # Validate required fields
        required = ["species_name", "common_name", "date_observed", "location"]
        missing = [field for field in required if not data.get(field)]
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

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

        observations.append(new_obs)
        save_observation(new_obs)

        # Update FAISS index with new data
        global FAISS_INDEX, FAISS_CORPUS
        FAISS_INDEX, FAISS_CORPUS = build_faiss_index()

        return jsonify({"message": "Observation submitted successfully!", "observation": new_obs}), 201

    except Exception as e:
        return jsonify({"error": f"Submission failed: {str(e)}"}), 500


@app.route("/api/ai-species-id", methods=["POST"])
def ai_species_id():
    # Placeholder for real AI model integration
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

    try:
        # Normalize question text
        query = user_question.lower()

        # Retrieve top relevant snippets from RAG
        retrieved_snippets = query_similar_texts(query, top_k=5)

        # Fallback: If no snippets retrieved, try simple keyword search in knowledge base + observations
        if not retrieved_snippets:
            kb = load_knowledge_base()
            obs_notes = [obs.get("notes", "") for obs in observations if obs.get("notes")]
            all_texts = kb + obs_notes

            keywords = re.findall(r"\w+", query)
            retrieved_snippets = []
            for text in all_texts:
                if any(kw in text.lower() for kw in keywords):
                    retrieved_snippets.append(text)
            retrieved_snippets = retrieved_snippets[:5]

        # If still empty, respond politely
        if not retrieved_snippets:
            return jsonify({"answer": "Sorry, I couldn't find relevant information. Please try asking differently."})

        # Generate an answer with the LLM augmented by retrieved context
        answer = generate_answer(retrieved_snippets, user_question)
        return jsonify({"answer": answer})

    except Exception as e:
        return jsonify({"answer": f"An error occurred while processing your question: {str(e)}"}), 500


@app.route("/api/gamification", methods=["GET"])
def gamification():
    from collections import Counter
    cnt = Counter(obs.get("observer", "Anonymous") for obs in observations)
    if not cnt:
        return jsonify({"top_observer": "None", "submissions": 0})
    top, num = cnt.most_common(1)[0]
    return jsonify({"top_observer": top, "submissions": num})

@app.route("/api/analytics", methods=["GET"])
def analytics():
    obs = observations  # In-memory observations list
    
    # Total observations
    total_obs = len(obs)
    
    # Top 5 observers by submissions
    observer_counts = Counter(o.get("observer", "Anonymous") for o in obs)
    top_observers = observer_counts.most_common(5)
    
    # Top 5 species observed (by common_name + species_name)
    species_counts = Counter(
        f"{o.get('common_name', 'Unknown')} ({o.get('species_name', 'Unknown')})" for o in obs
    )
    top_species = species_counts.most_common(5)
    
    # Top 5 popular locations
    location_counts = Counter(o.get("location", "Unknown") for o in obs)
    top_locations = location_counts.most_common(5)
    
    return jsonify({
        "total_observations": total_obs,
        "top_observers": [{"observer": o, "count": c} for o, c in top_observers],
        "top_species": [{"species": s, "count": c} for s, c in top_species],
        "top_locations": [{"location": l, "count": c} for l, c in top_locations],
    })


if __name__ == "__main__":
    app.run(debug=True)
