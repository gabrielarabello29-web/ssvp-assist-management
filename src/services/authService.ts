import { api } from "@/lib/api";

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  type?: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  perfil?: string;
}

export const authService = {
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>("/auth/login", payload);
    return data;
  },
  register: async (payload: RegisterRequest): Promise<unknown> => {
    const { data } = await api.post("/auth/register", payload);
    return data;
  },
};