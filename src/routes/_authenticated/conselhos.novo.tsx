import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { conselhoService, type ConselhoPayload } from "@/services/conselhoService";
import { extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/_authenticated/conselhos/novo")({
  component: NovoConselhoPage,
});

function NovoConselhoPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { isGestor } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<ConselhoPayload>();

  const mutation = useMutation({
    mutationFn: (data: ConselhoPayload) => conselhoService.criar(data),
    onSuccess: () => {
      toast.success("Conselho criado");
      qc.invalidateQueries({ queryKey: ["conselhos"] });
      navigate({ to: "/conselhos" });
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });

  if (!isGestor) {
    return (
      <div className="text-sm text-muted-foreground">
        Você não tem permissão para criar conselhos.
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Novo conselho"
        description="Cadastre um novo conselho particular."
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