import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { AssistidoForm } from "@/components/assistido/AssistidoForm";
import { assistidoService } from "@/services/assistidoService";
import { extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/_authenticated/assistidos/editar/$id")({
  component: EditarAssistidoPage,
});

function EditarAssistidoPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { isGestor } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["assistido", id],
    queryFn: () => assistidoService.obter(id),
  });

  const mutation = useMutation({
    mutationFn: assistidoService.atualizar.bind(null, id),
    onSuccess: () => {
      toast.success("Assistido atualizado");
      qc.invalidateQueries({ queryKey: ["assistidos"] });
      qc.invalidateQueries({ queryKey: ["assistido", id] });
      navigate({ to: "/assistidos/$id", params: { id } });
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });

  if (!isGestor) return <div className="text-sm text-muted-foreground">Sem permissão.</div>;
  if (isLoading) return <LoadingSpinner label="Carregando..." />;
  if (!data) return <div className="text-sm text-destructive">Assistido não encontrado.</div>;

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Editar assistido"
        description={data.dadosPessoais?.nome}
        actions={
          <Button variant="outline" onClick={() => navigate({ to: "/assistidos" })}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        }
      />
      <AssistidoForm
        initial={data}
        onSubmit={(d) => mutation.mutate(d)}
        submitting={mutation.isPending}
        submitLabel="Salvar alterações"
      />
    </div>
  );
}