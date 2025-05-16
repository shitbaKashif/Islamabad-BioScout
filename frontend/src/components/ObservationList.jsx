import React from "react";

export default function ObservationList({ observations }) {
  return (
    <section aria-label="Biodiversity Observations List" style={{ marginBottom: "20px" }}>
      <h2>Observations List</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {observations.map((obs) => (
          <li key={obs.observation_id} style={{ borderBottom: "1px solid #ccc", padding: "10px 0" }}>
            <strong>{obs.common_name} ({obs.species_name})</strong> — <em>{obs.date_observed}</em> at <em>{obs.location}</em><br />
            Observer: <em>{obs.observer}</em><br />
            Notes: {obs.notes}<br />
            {obs.image_url && <img src={obs.image_url} alt={obs.common_name} style={{ maxWidth: "150px", borderRadius: "6px", marginTop: "5px" }} />}
          </li>
        ))}
      </ul>
    </section>
  );
}
