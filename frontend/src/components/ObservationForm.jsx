import React, { useState } from "react";

export default function ObservationForm({ onSubmit }) {
  const [form, setForm] = useState({
    species_name: "",
    common_name: "",
    date_observed: "",
    location: "",
    notes: "",
    observer: "",
    image: null,
    image_url: "",
  });
  const [imagePreview, setImagePreview] = useState(null);

  function handleChange(e) {
    const { name, value, files } = e.target;
    if (name === "image" && files.length > 0) {
      setForm({ ...form, image: files[0], image_url: "" });
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setForm({ ...form, [name]: value });
      if (name === "image_url") {
        setForm((prev) => ({ ...prev, image: null }));
        setImagePreview(value);
      }
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (
      !form.species_name.trim() ||
      !form.common_name.trim() ||
      !form.date_observed ||
      !form.location.trim()
    ) {
      alert("Please fill all required fields.");
      return;
    }
    onSubmit(form);
    setForm({
      species_name: "",
      common_name: "",
      date_observed: "",
      location: "",
      notes: "",
      observer: "",
      image: null,
      image_url: "",
    });
    setImagePreview(null);
  }

  return (
    <section aria-label="Submit Biodiversity Observation">
      <h2>Submit Observation</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "10px" }}>
        <input
          type="text"
          name="species_name"
          placeholder="Species Name (scientific)"
          value={form.species_name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="common_name"
          placeholder="Common Name"
          value={form.common_name}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="date_observed"
          value={form.date_observed}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="location"
          placeholder="Location (e.g. Margalla Hills)"
          value={form.location}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="observer"
          placeholder="Observer Name"
          value={form.observer}
          onChange={handleChange}
        />
        <textarea
          name="notes"
          placeholder="Notes"
          value={form.notes}
          onChange={handleChange}
          rows={3}
        />
        <label htmlFor="image-upload" style={{ cursor: "pointer", color: "#3a5a40", fontWeight: "600" }}>
          Upload Image (optional)
        </label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          name="image"
          onChange={handleChange}
          style={{ display: "block" }}
        />
        <input
          type="url"
          name="image_url"
          placeholder="Or provide image URL"
          value={form.image_url}
          onChange={handleChange}
        />
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            style={{ maxWidth: "150px", borderRadius: "8px", marginBottom: "10px" }}
          />
        )}

        <button type="submit">Submit Observation</button>
      </form>
    </section>
  );
}
