export type Perfil = "GESTOR" | "VOLUNTARIO" | "BENEFICIARIO";

export interface JwtPayload {
  sub?: string;
  email?: string;
  nome?: string;
  role?: Perfil;
  roles?: Perfil[] | string[];
  authorities?: string[];
  perfil?: Perfil;
  exp?: number;
}

export interface AuthUser {
  email: string;
  nome?: string;
  role: Perfil;
  exp?: number;
}

export interface Conselho {
  id: string;
  nome: string;
  cidade?: string;
  dataFundacao?: string;
  ativo: boolean;
}

export interface Conferencia {
  id: string;
  nome: string;
  ativo: boolean;
  conselho?: { id: string; nome: string } | null;
  conselhoId?: string;
  conselhoNome?: string;
}

export interface DadosPessoais {
  nome: string;
  conjuge?: string;
  endereco?: string;
  dataNascimento?: string;
  estadoCivil?: string;
  religiao?: string;
  profissao?: string;
}

export interface SituacaoFamiliar {
  quantidadeTrabalhadores: number;
  rendaFamiliar: number;
  rendaLiquida: number;
  valorAluguel: number;
  quantidadeAlfabetizados: number;
  situacaoMoradia: string;
}

export interface SituacaoIgrejaSaude {
  situacaoCatequeseCrisma?: string;
  participacaoIgrejaCatolica?: string;
  problemaSaude?: string;
  outrasInformacoes?: string;
}

export interface AssistidoPayload {
  dadosPessoais: DadosPessoais;
  situacaoFamiliar: SituacaoFamiliar;
  situacaoIgrejaSaude: SituacaoIgrejaSaude;
  conferenciaId: string;
}

export interface Assistido extends AssistidoPayload {
  id: string;
  ativo: boolean;
  conferencia?: { id: string; nome: string } | null;
}