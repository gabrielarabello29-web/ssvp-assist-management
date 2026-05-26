import { api } from "@/lib/api";
import type { Conselho } from "@/types";

export interface ConselhoPayload {
  nome: string;
  cidade?: string;
  dataFundacao?: string;
  ativo?: boolean;
}

export const conselhoService = {
  listar: async (): Promise<Conselho[]> => {
    const { data } = await api.get<Conselho[]>("/conselhos/buscar");
    return data;
  },
  obter: async (id: string): Promise<Conselho> => {
    const { data } = await api.get<Conselho | Conselho[]>("/conselhos/buscar", { params: { id } });
    if (Array.isArray(data)) {
      const found = data.find((c) => c.id === id) ?? data[0];
      if (!found) throw new Error("Conselho não encontrado");
      return found;
    }
    return data;
  },
  criar: async (payload: ConselhoPayload): Promise<Conselho> => {
    const { data } = await api.post<Conselho>("/conselhos/criar", { ...payload, ativo: true, status: "ATIVO" });
    // Garantir status ATIVO caso o backend ignore o campo no POST
    if (data?.id && data.ativo === false) {
      try {
        const updated = await conselhoService.atualizar(data.id, { ...payload, ativo: true });
        return updated;
      } catch {
        return data;
      }
    }
    return data;
  },
  atualizar: async (id: string, payload: ConselhoPayload): Promise<Conselho> => {
    const { data } = await api.put<Conselho>(`/conselhos/atualizar/${id}`, { ...payload, ativo: payload.ativo ?? true });
    return data;
  },
  deletar: async (id: string): Promise<void> => {
    await api.delete(`/conselhos/deletar/${id}`);
  },
};