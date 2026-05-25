import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { AssistidoForm } from "@/components/assistido/AssistidoForm";
import { assistidoService } from "@/services/assistidoService";
import { extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/_authenticated/assistidos/novo")({
  component: NovoAssistidoPage,
});

function NovoAssistidoPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { isGestor } = useAuth();

  const mutation = useMutation({
    mutationFn: assistidoService.criar,
    onSuccess: () => {
      toast.success("Assistido cadastrado");
      qc.invalidateQueries({ queryKey: ["assistidos"] });
      navigate({ to: "/assistidos" });
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });

  if (!isGestor) return <div className="text-sm text-muted-foreground">Sem permissão.</div>;

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Novo assistido"
        description="Preencha as etapas para cadastrar."
        actions={
          <Button variant="outline" onClick={() => navigate({ to: "/assistidos" })}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        }
      />
      <AssistidoForm onSubmit={(d) => mutation.mutate(d)} submitting={mutation.isPending} submitLabel="Cadastrar" />
    </div>
  );
}