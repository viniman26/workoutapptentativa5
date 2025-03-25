"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import BottomNavigation from "./components/BottomNavigation";
import Header from "./components/Header";
import { Plus, Edit2, Trash2 } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [macrocycles, setMacrocycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const [editingPlan, setEditingPlan] = useState(null);
  const [editPlanName, setEditPlanName] = useState("");
  const [selectedMacrocycle, setSelectedMacrocycle] = useState("");
  const [editSelectedMacrocycle, setEditSelectedMacrocycle] = useState("");

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    } else {
      fetchWorkoutPlans();
      fetchMacrocycles();
    }
  }, [user, router]);

  async function fetchMacrocycles() {
    try {
      const response = await fetch("/api/macrocycles");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMacrocycles(data);
    } catch (error) {
      console.error("Error fetching macrocycles:", error);
    }
  }

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
        body: JSON.stringify({
          name: newPlanName,
          macrocycleId: selectedMacrocycle || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newPlan = await response.json();
      setWorkoutPlans([...workoutPlans, newPlan]);
      setNewPlanName("");
      setSelectedMacrocycle("");
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
          macrocycleId: editSelectedMacrocycle || null,
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
      setEditSelectedMacrocycle("");
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

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f7fafc",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />
      <main
        style={{
          flex: 1,
          padding: "20px",
          paddingBottom: "80px", // Espaço para a navegação inferior
        }}
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>Loading...</div>
        ) : error ? (
          <div style={{ color: "red", textAlign: "center", padding: "20px" }}>
            {error}
          </div>
        ) : workoutPlans.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <p style={{ color: "#666", marginBottom: "16px" }}>
              No workout plans yet
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                backgroundColor: "#6B46C1",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Create your first plan
            </button>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {workoutPlans.map((plan) => (
              <div
                key={plan.id}
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "16px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h2
                      style={{
                        margin: "0",
                        fontSize: "18px",
                        fontWeight: "500",
                        color: "#2c3e50",
                      }}
                    >
                      {plan.name}
                    </h2>
                    {plan.macrocycle && (
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: "14px",
                          color: "#666",
                        }}
                      >
                        Macrocycle:{" "}
                        {macrocycles.find((m) => m.id === plan.macrocycle)
                          ?.name || plan.macrocycle}
                      </p>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                    }}
                  >
                    <button
                      onClick={() => {
                        setEditingPlan(plan);
                        setEditPlanName(plan.name);
                        setEditSelectedMacrocycle(plan.macrocycle || "");
                        setShowEditModal(true);
                      }}
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        padding: "8px",
                        cursor: "pointer",
                        color: "#666",
                      }}
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        padding: "8px",
                        cursor: "pointer",
                        color: "#666",
                      }}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNavigation />
    </div>
  );
}
