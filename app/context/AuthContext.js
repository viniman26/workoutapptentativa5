"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase";
import { Client } from "@notionhq/client";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function createUserInNotion(user) {
    try {
      const notion = new Client({
        auth: process.env.NEXT_PUBLIC_NOTION_TOKEN,
      });

      // Get the main page content
      const mainPage = await notion.pages.retrieve({
        page_id: process.env.NEXT_PUBLIC_NOTION_PAGE_ID,
      });

      // Find the Users database
      const children = await notion.blocks.children.list({
        block_id: mainPage.id,
      });

      const usersDatabase = children.results.find(
        (block) =>
          block.type === "child_database" &&
          block.child_database.title === "Users"
      );

      if (!usersDatabase) {
        console.error("Users database not found");
        return;
      }

      // Check if user already exists
      const existingUsers = await notion.databases.query({
        database_id: usersDatabase.id,
        filter: {
          property: "Email",
          email: {
            equals: user.email,
          },
        },
      });

      if (existingUsers.results.length === 0) {
        // Create new user
        await notion.pages.create({
          parent: {
            database_id: usersDatabase.id,
          },
          properties: {
            Name: {
              title: [
                {
                  text: {
                    content: user.displayName,
                  },
                },
              ],
            },
            Email: {
              email: user.email,
            },
            "Training Experience": {
              select: {
                name: "Beginner",
              },
            },
            "Available Time(Minutes per day)": {
              number: 60,
            },
            "Fitness Goal": {
              select: {
                name: "Hypertrophy",
              },
            },
          },
        });
      }
    } catch (error) {
      console.error("Error creating user in Notion:", error);
    }
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await createUserInNotion(result.user);
      return result;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loginWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
