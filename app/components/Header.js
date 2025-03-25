"use client";

import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";

export default function Header() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <header
      style={{
        backgroundColor: "white",
        padding: "16px",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <h1
        style={{
          fontSize: "20px",
          fontWeight: "bold",
          color: "#2D3748",
        }}
      >
        Gym Workout
      </h1>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <span
          style={{
            color: "#4A5568",
            fontSize: "14px",
          }}
        >
          {user?.displayName}
        </span>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "#F56565",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "background-color 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "#E53E3E";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "#F56565";
          }}
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </header>
  );
}
