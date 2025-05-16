import React, { useState } from "react";

export default function ImageClassifier() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [classificationType, setClassificationType] = useState("plant");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle file selection and create image preview
  const handleFileChange = (e) => {
    setResult(null);
    setError(null);
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Handle classification type change
  const handleClassificationChange = (e) => {
    setClassificationType(e.target.value);
    setResult(null);
    setError(null);
  };

  // Handle form submission to backend for classification
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedFile) {
      setError("Please select an image to upload.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("classification_type", classificationType);

    try {
      const response = await fetch("http://localhost:5000/api/classify-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to classify image.");
      }

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setResult(null);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err.message || "An error occurred while classifying the image.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      aria-label="AI Image Classifier"
      style={{
        maxWidth: "600px",
        margin: "40px auto",
        padding: "25px",
        backgroundColor: "#e0f2f1",
        borderRadius: "15px",
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#004d40",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "25px" }}>
        Upload an Image for AI Identification
      </h2>

      <form onSubmit={handleSubmit} style={{ textAlign: "center" }}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ marginRight: "10px" }}>
            <input
              type="radio"
              name="classification_type"
              value="plant"
              checked={classificationType === "plant"}
              onChange={handleClassificationChange}
            />{" "}
            Plant
          </label>
          <label>
            <input
              type="radio"
              name="classification_type"
              value="animal"
              checked={classificationType === "animal"}
              onChange={handleClassificationChange}
            />{" "}
            Animal
          </label>
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #004d40",
            marginBottom: "20px",
            cursor: "pointer",
          }}
        />
        <br />
        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: loading ? "#00796b99" : "#00796b",
            color: "white",
            padding: "10px 25px",
            border: "none",
            borderRadius: "10px",
            fontSize: "1rem",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background-color 0.3s ease",
          }}
        >
          {loading ? "Classifying..." : "Classify Image"}
        </button>
      </form>

      {/* Image Preview */}
      {previewUrl && (
        <div
          style={{
            marginTop: "30px",
            textAlign: "center",
          }}
        >
          <img
            src={previewUrl}
            alt="Selected preview"
            style={{
              maxWidth: "100%",
              maxHeight: "350px",
              borderRadius: "12px",
              boxShadow: "0 6px 15px rgba(0, 77, 64, 0.3)",
            }}
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p
          style={{
            color: "#b00020",
            marginTop: "20px",
            textAlign: "center",
            fontWeight: "600",
          }}
        >
          {error}
        </p>
      )}

      {/* AI Classification Result */}
      {result && (
        <section
          style={{
            marginTop: "40px",
            backgroundColor: "#a7ffeb",
            borderRadius: "15px",
            padding: "25px",
            boxShadow: "0 6px 18px rgba(0, 77, 64, 0.3)",
            color: "#004d40",
          }}
        >
          <h3 style={{ marginBottom: "15px", textAlign: "center" }}>
            AI Classification Result
          </h3>
          <p style={{ fontSize: "1.1rem" }}>
            <strong>Species:</strong> {result.species_name || "Unknown"}
          </p>
          <p style={{ fontSize: "1.1rem" }}>
            <strong>Confidence:</strong>{" "}
            {result.confidence !== undefined
              ? (result.confidence * 100).toFixed(1) + "%"
              : "N/A"}
          </p>
          <p style={{ fontSize: "1.1rem" }}>
            <strong>Reasoning:</strong> {result.explanation || "No explanation provided."}
          </p>
        </section>
      )}
    </section>
  );
}
