import { api } from "@/lib/api";
import type { Conselho } from "@/types";

export interface ConselhoPayload {
  nome: string;
  cidade?: string;
  dataFundacao?: string;
}

export const conselhoService = {
  listar: async (): Promise<Conselho[]> => {
    const { data } = await api.get<Conselho[]>("/conselhos/buscar");
    return data;
  },
  criar: async (payload: ConselhoPayload): Promise<Conselho> => {
    const { data } = await api.post<Conselho>("/conselhos/criar", payload);
    return data;
  },
  deletar: async (id: string): Promise<void> => {
    await api.delete(`/conselhos/deletar/${id}`);
  },
};