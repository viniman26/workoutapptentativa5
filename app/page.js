"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMuscleGroups() {
      try {
        const response = await fetch("/api/muscle-groups");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setMuscleGroups(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching muscle groups:", error);
        setError("Failed to load muscle groups. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchMuscleGroups();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: "20px",
      }}
    >
      <h1
        style={{
          fontSize: "24px",
          color: "#333",
          marginBottom: "20px",
          textAlign: "center",
          fontWeight: "600",
        }}
      >
        Muscle Groups
      </h1>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            color: "#666",
          }}
        >
          Loading...
        </div>
      ) : error ? (
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            color: "#dc3545",
            backgroundColor: "#fff",
            borderRadius: "8px",
            margin: "20px auto",
            maxWidth: "300px",
          }}
        >
          {error}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "12px",
            maxWidth: "390px",
            margin: "0 auto",
          }}
        >
          {muscleGroups.map((group) => (
            <div
              key={group.id}
              style={{
                backgroundColor: "white",
                padding: "16px",
                borderRadius: "12px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                border: "1px solid rgba(0,0,0,0.05)",
              }}
            >
              <h2
                style={{
                  margin: "0",
                  fontSize: "18px",
                  fontWeight: "500",
                  color: "#2c3e50",
                }}
              >
                {group.name}
              </h2>
              {group.description && (
                <p
                  style={{
                    margin: "8px 0 0",
                    color: "#666",
                    fontSize: "14px",
                    lineHeight: "1.4",
                  }}
                >
                  {group.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
