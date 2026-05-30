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
    const body = {
      ...payload,
      // aliases p/ id do conselho
      conselhoId: payload.conselhoParticularId || payload.conselhoId,
      conselhoParticularId: payload.conselhoParticularId || payload.conselhoId,
      ativo: true,
      status: "ATIVO",
      situacao: "ATIVO",
    };
    const { data } = await api.post("/conferencias/criar", body);
    if (data?.id && data?.ativo === false) {
      try { await api.put(`/conferencias/atualizar/${data.id}`, { ...body, id: data.id, ativo: true }); } catch {}
    }
    return data;
  },
  atualizar: async (id, payload) => {
    const body = {
      ...payload,
      conselhoId: payload.conselhoParticularId || payload.conselhoId,
      conselhoParticularId: payload.conselhoParticularId || payload.conselhoId,
      ativo: true,
    };
    const { data } = await api.put(`/conferencias/atualizar/${id}`, body);
    return data;
  },
  deletar: async (id) => {
    await api.delete(`/conferencias/deletar/${id}`);
  },
};