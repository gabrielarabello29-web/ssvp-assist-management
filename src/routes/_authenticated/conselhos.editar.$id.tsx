import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { conselhoService, type ConselhoPayload } from "@/services/conselhoService";
import { extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/_authenticated/conselhos/editar/$id")({
  component: EditarConselhoPage,
});

function EditarConselhoPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { isGestor } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["conselho", id],
    queryFn: () => conselhoService.obter(id),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ConselhoPayload>();

  useEffect(() => {
    if (data) {
      reset({
        nome: data.nome,
        cidade: data.cidade ?? "",
        dataFundacao: data.dataFundacao ? data.dataFundacao.slice(0, 10) : "",
      });
    }
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (payload: ConselhoPayload) => conselhoService.atualizar(id, payload),
    onSuccess: () => {
      toast.success("Conselho atualizado");
      qc.invalidateQueries({ queryKey: ["conselhos"] });
      qc.invalidateQueries({ queryKey: ["conselho", id] });
      navigate({ to: "/conselhos" });
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });

  if (!isGestor) return <div className="text-sm text-muted-foreground">Sem permissão.</div>;
  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Editar conselho"
        actions={
          <Button variant="outline" onClick={() => navigate({ to: "/conselhos" })}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        }
      />
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nome">Nome *</Label>
              <Input id="nome" {...register("nome", { required: "Informe o nome" })} />
              {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="cidade">Cidade</Label>
                <Input id="cidade" {...register("cidade")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dataFundacao">Data de fundação</Label>
                <Input id="dataFundacao" type="date" {...register("dataFundacao")} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate({ to: "/conselhos" })}>
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {mutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}