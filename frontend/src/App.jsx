import React, { useEffect, useState } from "react";
import ObservationForm from "./components/ObservationForm";
import ObservationList from "./components/ObservationList";
import MapPage from "./components/MapPage";
import QASection from "./components/QASection";
import TopObserver from "./components/TopObserver";
import AnalyticsPanel from "./components/AnalyticsPanel";
import AboutUs from "./components/AboutUs";

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
    await res.json(); // Consume response
  }


  return (
    <>
      <header>
        <h1>BioScout Islamabad</h1>
        <h3>AI for Community Biodiversity & Sustainable Insights</h3>
        <p><em>Event Date: May 16th, 2025</em></p>
      </header>
      <main style={{ maxWidth: "900px", margin: "auto", padding: "10px" }}>
        <AboutUs />
        <ObservationForm onSubmit={handleSubmit} />
        <MapPage observations={observations} />
        <ObservationList observations={observations} />
        <QASection />
        <AnalyticsPanel />
        <TopObserver />
      </main>
    </>
  );
}
