"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function createUserInNotion(user) {
    try {
      console.log("AuthContext: Iniciando criação de usuário no Notion...");
      const response = await fetch("/api/auth/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user }),
      });

      const data = await response.json();
      console.log("AuthContext: Resposta da API:", data);

      if (!response.ok) {
        console.error("AuthContext: Erro na API:", data);
        throw new Error(data.error || data.details || "Failed to create user");
      }

      console.log("AuthContext: Usuário criado/atualizado com sucesso");
      return data;
    } catch (error) {
      console.error("AuthContext: Erro detalhado:", {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async function loginWithGoogle() {
    try {
      console.log("Iniciando login com Google...");
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });

      console.log("Configurando popup de autenticação...");
      const result = await signInWithPopup(auth, provider);
      console.log("Login bem sucedido:", result.user.email);

      await createUserInNotion(result.user);
      console.log("Usuário criado/atualizado no Notion");

      setUser(result.user);
      return result.user;
    } catch (error) {
      console.error("Erro detalhado no login:", {
        code: error.code,
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          await createUserInNotion(user);
        } catch (error) {
          console.error("Erro ao criar/atualizar usuário no Notion:", error);
        }
      }
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
