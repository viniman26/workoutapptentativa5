"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Dumbbell, Activity, Settings, BarChart3 } from "lucide-react";

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const navigation = [
    {
      name: "My Workouts",
      href: "/",
      icon: Dumbbell,
    },
    {
      name: "Exercises",
      href: "/exercises",
      icon: Activity,
    },
    {
      name: "Progress",
      href: "/progress",
      icon: BarChart3,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "white",
        borderTop: "1px solid #eaeaea",
        display: "flex",
        justifyContent: "space-around",
        padding: "8px 0",
        boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.1)",
        zIndex: 1000,
      }}
    >
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <button
            key={item.name}
            onClick={() => router.push(item.href)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "4px 0",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              color: isActive ? "#6B46C1" : "#666",
              width: "25%",
              gap: "4px",
            }}
          >
            <item.icon size={24} />
            <span
              style={{
                fontSize: "12px",
                fontWeight: isActive ? "600" : "400",
              }}
            >
              {item.name}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
