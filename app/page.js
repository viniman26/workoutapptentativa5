"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const [editingPlan, setEditingPlan] = useState(null);
  const [editPlanName, setEditPlanName] = useState("");

  useEffect(() => {
    fetchWorkoutPlans();
  }, []);

  async function fetchWorkoutPlans() {
    try {
      const response = await fetch("/api/workout-plans");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setWorkoutPlans(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching workout plans:", error);
      setError("Failed to load workout plans. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreatePlan(e) {
    e.preventDefault();
    try {
      const response = await fetch("/api/workout-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newPlanName }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newPlan = await response.json();
      setWorkoutPlans([...workoutPlans, newPlan]);
      setNewPlanName("");
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating workout plan:", error);
      setError("Failed to create workout plan. Please try again.");
    }
  }

  async function handleEditPlan(e) {
    e.preventDefault();
    try {
      const response = await fetch("/api/workout-plans", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingPlan.id,
          name: editPlanName,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedPlan = await response.json();
      setWorkoutPlans(
        workoutPlans.map((plan) =>
          plan.id === updatedPlan.id ? updatedPlan : plan
        )
      );
      setShowEditModal(false);
      setEditingPlan(null);
      setEditPlanName("");
    } catch (error) {
      console.error("Error updating workout plan:", error);
      setError("Failed to update workout plan. Please try again.");
    }
  }

  async function handleDeletePlan(planId) {
    if (!confirm("Are you sure you want to delete this workout plan?")) {
      return;
    }

    try {
      const response = await fetch(`/api/workout-plans?id=${planId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setWorkoutPlans(workoutPlans.filter((plan) => plan.id !== planId));
    } catch (error) {
      console.error("Error deleting workout plan:", error);
      setError("Failed to delete workout plan. Please try again.");
    }
  }

  function openEditModal(plan) {
    setEditingPlan(plan);
    setEditPlanName(plan.name);
    setShowEditModal(true);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "390px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h1
            style={{
              fontSize: "24px",
              color: "#333",
              margin: 0,
              fontWeight: "600",
            }}
          >
            Workout Plans
          </h1>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              backgroundColor: "#007AFF",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "14px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            Create Plan
          </button>
        </div>

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
              margin: "20px 0",
            }}
          >
            {error}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "12px",
            }}
          >
            {workoutPlans.map((plan) => (
              <div
                key={plan.id}
                style={{
                  backgroundColor: "white",
                  padding: "16px",
                  borderRadius: "12px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  border: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h2
                    style={{
                      margin: "0",
                      fontSize: "18px",
                      fontWeight: "500",
                      color: "#2c3e50",
                      flex: 1,
                    }}
                    onClick={() => console.log("Navigate to plan:", plan.id)}
                  >
                    {plan.name}
                  </h2>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                    }}
                  >
                    <button
                      onClick={() => openEditModal(plan)}
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        color: "#007AFF",
                        padding: "4px 8px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        color: "#dc3545",
                        padding: "4px 8px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "390px",
            }}
          >
            <h2
              style={{
                margin: "0 0 16px",
                fontSize: "20px",
                color: "#333",
              }}
            >
              Create New Workout Plan
            </h2>
            <form onSubmit={handleCreatePlan}>
              <input
                type="text"
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
                placeholder="Enter plan name"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  marginBottom: "16px",
                  fontSize: "16px",
                }}
                required
              />
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    backgroundColor: "white",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#007AFF",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "390px",
            }}
          >
            <h2
              style={{
                margin: "0 0 16px",
                fontSize: "20px",
                color: "#333",
              }}
            >
              Edit Workout Plan
            </h2>
            <form onSubmit={handleEditPlan}>
              <input
                type="text"
                value={editPlanName}
                onChange={(e) => setEditPlanName(e.target.value)}
                placeholder="Enter plan name"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  marginBottom: "16px",
                  fontSize: "16px",
                }}
                required
              />
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPlan(null);
                    setEditPlanName("");
                  }}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    backgroundColor: "white",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#007AFF",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
