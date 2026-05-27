import { api } from "./api.js";

export const conferenciasService = {
  listar: async () => {
    const { data } = await api.get("/conferencias/buscar");
    return data;
  },
  obter: async (id) => {
    const { data } = await api.get("/conferencias/buscar", { params: { id } });
    if (Array.isArray(data)) return data.find((c) => c.id === id) || data[0];
    return data;
  },
  criar: async (payload) => {
    const { data } = await api.post("/conferencias/criar", { ...payload, ativo: true, status: "ATIVO" });
    return data;
  },
  atualizar: async (id, payload) => {
    const { data } = await api.put(`/conferencias/atualizar/${id}`, { ...payload, ativo: true });
    return data;
  },
  deletar: async (id) => {
    await api.delete(`/conferencias/deletar/${id}`);
  },
};