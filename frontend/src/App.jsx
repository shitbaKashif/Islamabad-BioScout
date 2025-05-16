import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ObservationForm from "./components/ObservationForm";
import ObservationList from "./components/ObservationList";
import MapPage from "./components/MapPage";
import QASection from "./components/QASection";
import TopObserver from "./components/TopObserver";
import AnalyticsPanel from "./components/AnalyticsPanel";
import AboutUs from "./components/AboutUs";
import ImageClassifier from "./components/ImageClassifier";

export default function App() {
  const [observations, setObservations] = useState([]);

  async function fetchObservations() {
    try {
      const res = await fetch("http://localhost:5000/api/observations");
      const data = await res.json();
      setObservations(data);
    } catch {
      setObservations([]);
    }
  }

  useEffect(() => {
    fetchObservations();
  }, []);

  async function handleSubmit(obs) {
    const formData = new FormData();
    formData.append("species_name", obs.species_name);
    formData.append("common_name", obs.common_name);
    formData.append("date_observed", obs.date_observed);
    formData.append("location", obs.location);
    formData.append("notes", obs.notes);
    formData.append("observer", obs.observer || "Anonymous");
    if (obs.image) {
      formData.append("image", obs.image);
    } else {
      formData.append("image_url", obs.image_url || "");
    }

    const res = await fetch("http://localhost:5000/api/submit", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Unknown submission error");
    }
    await res.json();
    // Refresh observations after submission
    fetchObservations();
  }

  return (
    <Router>
      <header
        style={{
          backgroundColor: "#004d40",
          color: "white",
          padding: "15px 30px",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          fontWeight: "bold",
          display: "flex",
          gap: "20px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>BioScout Islamabad</h1>
          <h4 style={{ margin: 0, fontWeight: "normal" }}>
            AI for Community Biodiversity & Sustainable Insights
          </h4>
          <p style={{ margin: 0, fontStyle: "italic" }}>Event Date: May 16th, 2025</p>
        </div>

        {/* Navigation Links */}
        <nav>
          <Link to="/" style={{ color: "white", textDecoration: "none", marginRight: "15px" }}>
            Home
          </Link>
          <Link to="/classify" style={{ color: "white", textDecoration: "none", marginRight: "15px" }}>
            AI Image Classifier
          </Link>
          <Link to="/about" style={{ color: "white", textDecoration: "none" }}>
            About Us
          </Link>
        </nav>
      </header>

      <main style={{ maxWidth: "900px", margin: "auto", padding: "10px" }}>
        <Routes>
          {/* Home Page: All main components */}
          <Route
            path="/"
            element={
              <>
                <AboutUs />
                <ObservationForm onSubmit={handleSubmit} />
                <MapPage observations={observations} />
                <ObservationList observations={observations} />
                <QASection />
                <AnalyticsPanel />
                <TopObserver />
              </>
            }
          />

          {/* AI Image Classifier Page */}
          <Route path="/classify" element={<ImageClassifier />} />

          {/* About Page */}
          <Route path="/about" element={<AboutUs />} />
        </Routes>
      </main>
    </Router>
  );
}
