import axios, { AxiosError, type AxiosInstance } from "axios";

const TOKEN_KEY = "ssvp_token";

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
};

export const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: () => void) => {
  onUnauthorized = fn;
};

api.interceptors.response.use(
  (resp) => resp,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearToken();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

export const extractErrorMessage = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; error?: string } | undefined;
    return (
      data?.message ||
      data?.error ||
      err.message ||
      "Erro ao comunicar com o servidor."
    );
  }
  if (err instanceof Error) return err.message;
  return "Erro inesperado.";
};