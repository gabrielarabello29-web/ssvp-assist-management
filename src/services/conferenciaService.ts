import { api } from "@/lib/api";
import type { Conferencia } from "@/types";

export interface ConferenciaPayload {
  nome: string;
  conselhoParticularId: string;
}

export const conferenciaService = {
  listar: async (conselhoId?: string): Promise<Conferencia[]> => {
    const { data } = await api.get<Conferencia[]>("/conferencias/buscar", {
      params: conselhoId ? { conselhoId } : undefined,
    });
    return data;
  },
  criar: async (payload: ConferenciaPayload): Promise<Conferencia> => {
    const { data } = await api.post<Conferencia>("/conferencias/criar", payload);
    return data;
  },
  deletar: async (id: string): Promise<void> => {
    await api.delete(`/conferencias/deletar/${id}`);
  },
};
