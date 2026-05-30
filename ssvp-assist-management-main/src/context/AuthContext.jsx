import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { authService } from "@/services/auth.js";
import { api, TOKEN_KEY, setUnauthorizedHandler } from "@/services/api.js";

const AuthContext = createContext(null);

function decodeUser(token) {
  try {
    const p = jwtDecode(token);
    if (p.exp && p.exp * 1000 < Date.now()) return null;
    const role =
      p.role ||
      p.perfil ||
      (Array.isArray(p.roles) && p.roles[0]) ||
      (Array.isArray(p.authorities) && p.authorities[0]?.replace?.("ROLE_", "")) ||
      "VOLUNTARIO";
    return {
      email: p.email || p.sub || "",
      nome: p.nome || "",
      role: String(role).toUpperCase(),
      exp: p.exp,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      const u = decodeUser(token);
      if (u) setUser(u);
      else localStorage.removeItem(TOKEN_KEY);
    }
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    window.location.href = "/login";
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => logout());
  }, [logout]);

  const login = useCallback(async (email, senha) => {
    const { token } = await authService.login({ email, senha });
    localStorage.setItem(TOKEN_KEY, token);
    const u = decodeUser(token);
    setUser(u);
    return u;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      isGestor: user?.role === "GESTOR",
      isVoluntario: user?.role === "VOLUNTARIO",
      login,
      logout,
    }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve estar dentro de AuthProvider");
  return ctx;
}