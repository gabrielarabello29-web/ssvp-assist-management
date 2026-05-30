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
    const body = {
      ...payload,
      localidade: payload.cidade,
      fundacao: payload.dataFundacao,
      ativo: true,
      status: "ATIVO",
      situacao: "ATIVO",
    };
    const { data } = await api.post("/conselhos/criar", body);
    if (data?.id && data?.ativo === false) {
      try { await api.put(`/conselhos/atualizar/${data.id}`, { ...body, id: data.id, ativo: true }); } catch {}
    }
    return data;
  },
  atualizar: async (id, payload) => {
    const body = { ...payload, localidade: payload.cidade, fundacao: payload.dataFundacao, ativo: true };
    const { data } = await api.put(`/conselhos/atualizar/${id}`, body);
    return data;
  },
  deletar: async (id) => {
    await api.delete(`/conselhos/deletar/${id}`);
  },
};