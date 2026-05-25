import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { assistidoService } from "@/services/assistidoService";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/_authenticated/assistidos/$id")({
  component: AssistidoDetailPage,
});

function Row({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value || "—"}</span>
    </div>
  );
}

function AssistidoDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { isGestor } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ["assistido", id],
    queryFn: () => assistidoService.obter(id),
  });

  if (isLoading) return <LoadingSpinner label="Carregando..." />;
  if (error || !data) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        Não foi possível carregar o assistido.
      </div>
    );
  }

  const dp = data.dadosPessoais ?? ({} as typeof data.dadosPessoais);
  const sf = data.situacaoFamiliar ?? ({} as typeof data.situacaoFamiliar);
  const si = data.situacaoIgrejaSaude ?? ({} as typeof data.situacaoIgrejaSaude);

  return (
    <div>
      <PageHeader
        title={dp.nome || "Assistido"}
        description="Ficha completa do assistido."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate({ to: "/assistidos" })}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
            {isGestor && (
              <Button asChild>
                <Link to="/assistidos/editar/$id" params={{ id: data.id }}>
                  <Pencil className="mr-2 h-4 w-4" /> Editar
                </Link>
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Dados pessoais</CardTitle></CardHeader>
          <CardContent>
            <Row label="Nome" value={dp.nome} />
            <Row label="Cônjuge" value={dp.conjuge} />
            <Row label="Endereço" value={dp.endereco} />
            <Row label="Nascimento" value={dp.dataNascimento ? new Date(dp.dataNascimento).toLocaleDateString("pt-BR") : ""} />
            <Row label="Estado civil" value={dp.estadoCivil} />
            <Row label="Religião" value={dp.religiao} />
            <Row label="Profissão" value={dp.profissao} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Situação familiar</CardTitle></CardHeader>
          <CardContent>
            <Row label="Situação moradia" value={sf.situacaoMoradia} />
            <Row label="Trabalhadores" value={sf.quantidadeTrabalhadores} />
            <Row label="Renda familiar" value={`R$ ${sf.rendaFamiliar ?? 0}`} />
            <Row label="Renda líquida" value={`R$ ${sf.rendaLiquida ?? 0}`} />
            <Row label="Aluguel" value={`R$ ${sf.valorAluguel ?? 0}`} />
            <Row label="Alfabetizados" value={sf.quantidadeAlfabetizados} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Saúde e Igreja</CardTitle></CardHeader>
          <CardContent>
            <Row label="Catequese / Crisma" value={si.situacaoCatequeseCrisma} />
            <Row label="Participação Igreja" value={si.participacaoIgrejaCatolica} />
            <Row label="Problema de saúde" value={si.problemaSaude} />
            <Row label="Observações" value={si.outrasInformacoes} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Vínculo</CardTitle></CardHeader>
          <CardContent>
            <Row label="Conferência" value={data.conferencia?.nome} />
            <div className="flex items-center justify-between py-2 text-sm">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge ativo={data.ativo} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}