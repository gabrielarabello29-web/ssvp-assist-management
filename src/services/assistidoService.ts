import { api } from "@/lib/api";
import type { Assistido, AssistidoPayload } from "@/types";

export const assistidoService = {
  listar: async (): Promise<Assistido[]> => {
    const { data } = await api.get<Assistido[]>("/assistidos/buscar");
    return data;
  },
  obter: async (id: string): Promise<Assistido> => {
    const { data } = await api.get<Assistido | Assistido[]>("/assistidos/buscar", {
      params: { id },
    });
    if (Array.isArray(data)) {
      const found = data[0];
      if (!found) throw new Error("Assistido não encontrado");
      return found;
    }
    return data;
  },
  criar: async (payload: AssistidoPayload): Promise<Assistido> => {
    const { data } = await api.post<Assistido>("/assistidos/criar", payload);
    return data;
  },
  atualizar: async (id: string, payload: AssistidoPayload): Promise<Assistido> => {
    const { data } = await api.put<Assistido>(`/assistidos/atualizar/${id}`, payload);
    return data;
  },
  deletar: async (id: string): Promise<void> => {
    await api.delete(`/assistidos/deletar/${id}`);
  },
};