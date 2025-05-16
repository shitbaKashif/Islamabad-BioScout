# BioScout Islamabad

**AI for Community Biodiversity & Sustainable Insights**  
*Event Theme:* AI for a Sustainable Future  
*Event Date:* May 16th, 2025  
*Location Focus:* Islamabad & Surrounding Regions (Margalla Hills National Park), Pakistan

---

## Project Overview

**BioScout Islamabad** is an AI-powered web platform designed to empower local communities in Islamabad and nearby ecological areas to monitor, document, and conserve biodiversity. The platform serves as a community-driven biodiversity database, featuring AI-assisted species identification and a smart Q&A system powered by Retrieval-Augmented Generation (RAG).

Our goal is to support conservation efforts aligned with the United Nations Sustainable Development Goals (SDG 13: Climate Action & SDG 15: Life on Land), by encouraging environmental awareness and enabling data-driven decision-making for ecosystem protection.

---

## Key Features

### 1. Community Biodiversity Observation Hub
- **Data Submission:** Simple and intuitive interface for users to submit observations including:
  - Species name (common or scientific)
  - Date and location of observation (text or map pin within Islamabad and surroundings)
  - Image upload of the observed species
  - Additional notes about behavior or habitat
- **Data Viewing:** View submitted observations as an interactive list and map.
- **AI-Powered Species Identification:**  
  Integrates pre-trained image recognition models to suggest species based on user-uploaded images, with confidence scores and clear AI attribution.
- **Gamification:** Recognition mechanism such as 'Top Observer' badges to incentivize participation.

### 2. RAG-Enhanced Biodiversity Q&A System
- **Natural Language Queries:** Users can ask questions about local biodiversity in plain English.
- **Knowledge Base:** Curated text snippets and community observation data form the searchable knowledge base.
- **Retrieval Mechanism:** Keyword-based and semantic search retrieve relevant context.
- **Augmented Generation:** Pre-trained Large Language Models generate insightful responses based on retrieved information.

---

## Dataset

- **Biodiversity Observations:**  
  2,000+ realistic, region-specific biodiversity records with detailed fields: observation ID, species scientific/common names, date, location, image URL, and descriptive notes.
- **Knowledge Base Snippets:**  
  3-5 curated documents covering flora, fauna, threats, and conservation efforts in Islamabad and Margalla Hills.

---

## Technical Stack

- **Frontend:** React.js / HTML / CSS (or Streamlit for rapid prototyping)  
- **Backend:** Python Flask (API and data management)  
- **Database:** CSV-based file storage (scalable to SQLite/PostgreSQL)  
- **AI Integration:**  
  - Species identification via pre-trained models or API (mocked if needed)  
  - RAG using keyword/embedding search and free-tier LLM APIs (Hugging Face, Google Gemini, etc.)

---

## Installation & Setup

1. Clone the repository  
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
