import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import {
  clearToken,
  getToken,
  setToken,
  setUnauthorizedHandler,
} from "@/lib/api";
import { authService } from "@/services/authService";
import type { AuthUser, JwtPayload, Perfil } from "@/types";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: Perfil) => boolean;
  isGestor: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const decodeUser = (token: string): AuthUser | null => {
  try {
    const payload = jwtDecode<JwtPayload>(token);
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    const role: Perfil =
      payload.role ||
      payload.perfil ||
      ((payload.roles?.[0] as Perfil) ?? undefined) ||
      ((payload.authorities?.[0]?.replace("ROLE_", "") as Perfil) ?? "VOLUNTARIO");
    return {
      email: payload.email || payload.sub || "",
      nome: payload.nome,
      role,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      const decoded = decodeUser(token);
      if (decoded) setUser(decoded);
      else clearToken();
    }
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => logout());
  }, [logout]);

  const login = useCallback(async (email: string, senha: string) => {
    const res = await authService.login({ email, senha });
    setToken(res.token);
    const decoded = decodeUser(res.token);
    setUser(decoded);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      hasRole: (role: Perfil) => user?.role === role,
      isGestor: user?.role === "GESTOR",
    }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}