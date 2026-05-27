import { api } from "./api.js";

export const conselhosService = {
  listar: async () => {
    const { data } = await api.get("/conselhos/buscar");
    return data;
  },
  obter: async (id) => {
    const { data } = await api.get("/conselhos/buscar", { params: { id } });
    if (Array.isArray(data)) return data.find((c) => c.id === id) || data[0];
    return data;
  },
  criar: async (payload) => {
    const { data } = await api.post("/conselhos/criar", { ...payload, ativo: true, status: "ATIVO" });
    return data;
  },
  atualizar: async (id, payload) => {
    const { data } = await api.put(`/conselhos/atualizar/${id}`, { ...payload, ativo: true });
    return data;
  },
  deletar: async (id) => {
    await api.delete(`/conselhos/deletar/${id}`);
  },
};