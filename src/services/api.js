import axios from "axios";

export const TOKEN_KEY = "ssvp_token";

export const api = axios.create({
  baseURL: "http://localhost:3000",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

api.interceptors.response.use(
  (resp) => resp,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (onUnauthorized) onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export const extractErrorMessage = (err) => {
  const data = err?.response?.data;
  return data?.message || data?.error || err?.message || "Erro ao comunicar com o servidor.";
};