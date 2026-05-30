import { api } from "./api.js";

export const assistidosService = {
  listar: async () => {
    const { data } = await api.get("/assistidos/buscar");
    return data;
  },
  obter: async (id) => {
    const { data } = await api.get("/assistidos/buscar", { params: { id } });
    if (Array.isArray(data)) return data[0];
    return data;
  },
  criar: async (payload) => {
    const body = { ...payload, ativo: true, status: "ATIVO", situacao: "ATIVO" };
    const { data } = await api.post("/assistidos/criar", body);
    if (data?.id && data?.ativo === false) {
      try { await api.put(`/assistidos/atualizar/${data.id}`, { ...body, id: data.id, ativo: true }); } catch {}
    }
    return data;
  },
  atualizar: async (id, payload) => {
    const { data } = await api.put(`/assistidos/atualizar/${id}`, { ...payload, ativo: true });
    return data;
  },
  deletar: async (id) => {
    await api.delete(`/assistidos/deletar/${id}`);
  },
};