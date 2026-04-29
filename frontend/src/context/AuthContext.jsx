import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loginMember } from "../utils/api";

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

const SESSION_KEY = "usra_session";

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);   // { _id, name, memberId, role, ... }
  const [loading, setLoading] = useState(true);   // true while rehydrating from storage

  // Rehydrate session on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  // Login: POST /auth/login  →  { user, token }
  const login = useCallback(async (memberId, dob) => {
    const { user: loggedIn, token } = await loginMember(memberId, dob);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(loggedIn));
    if (token) sessionStorage.setItem("usra_token", token);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem("usra_token");
    setUser(null);
  }, []);

  // Helpers
  const isAdmin       = user?.role === "admin";
  const isSelf        = (memberId) => user?.memberId === memberId;
  const canEdit       = (memberId) => !!user && (isAdmin || isSelf(memberId));

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isSelf, canEdit }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}