"use client";

import BottomNavigation from "../components/BottomNavigation";

export default function ExercisesPage() {
  return (
    <div
      style={{
        maxWidth: "100%",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        paddingBottom: "80px",
      }}
    >
      <header
        style={{
          backgroundColor: "#6B46C1",
          padding: "16px",
          color: "white",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "24px" }}>Exercises</h1>
        </div>
      </header>

      <main
        style={{
          maxWidth: "800px",
          margin: "16px auto",
          padding: "0 16px",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "20px",
            textAlign: "center",
            color: "#666",
          }}
        >
          Coming soon...
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
