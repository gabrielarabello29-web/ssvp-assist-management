import { api } from "@/lib/api";
import type { Conferencia } from "@/types";

export interface ConferenciaPayload {
  nome: string;
  conselhoParticularId: string;
  ativo?: boolean;
}

export const conferenciaService = {
  listar: async (conselhoId?: string): Promise<Conferencia[]> => {
    const { data } = await api.get<Conferencia[]>("/conferencias/buscar", {
      params: conselhoId ? { conselhoId } : undefined,
    });
    return data;
  },
  obter: async (id: string): Promise<Conferencia> => {
    const { data } = await api.get<Conferencia | Conferencia[]>("/conferencias/buscar", { params: { id } });
    if (Array.isArray(data)) {
      const found = data.find((c) => c.id === id) ?? data[0];
      if (!found) throw new Error("Conferência não encontrada");
      return found;
    }
    return data;
  },
  criar: async (payload: ConferenciaPayload): Promise<Conferencia> => {
    const { data } = await api.post<Conferencia>("/conferencias/criar", { ...payload, ativo: true, status: "ATIVO" });
    if (data?.id && data.ativo === false) {
      try {
        const updated = await conferenciaService.atualizar(data.id, { ...payload, ativo: true });
        return updated;
      } catch {
        return data;
      }
    }
    return data;
  },
  atualizar: async (id: string, payload: ConferenciaPayload): Promise<Conferencia> => {
    const { data } = await api.put<Conferencia>(`/conferencias/atualizar/${id}`, { ...payload, ativo: payload.ativo ?? true });
    return data;
  },
  deletar: async (id: string): Promise<void> => {
    await api.delete(`/conferencias/deletar/${id}`);
  },
};
