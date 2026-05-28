import { api } from "./api.js";

export const authService = {
  login: async ({ email, senha }) => {
    const { data } = await api.post("/auth/login", { email, senha });
    return data; // { token }
  },
  register: async ({ nome, email, senha, perfil }) => {
    const { data } = await api.post("/auth/registrar", { 
      email, 
      senha, 
      tipoUsuario: perfil 
    });
    return data;
  },
};
