import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/common/PageHeader";
import { conferenciaService, type ConferenciaPayload } from "@/services/conferenciaService";
import { conselhoService } from "@/services/conselhoService";
import { extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/_authenticated/conferencias/nova")({
  component: NovaConferenciaPage,
});

function NovaConferenciaPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { isGestor } = useAuth();
  const { data: conselhos = [] } = useQuery({
    queryKey: ["conselhos"],
    queryFn: conselhoService.listar,
  });

  const { register, handleSubmit, control, formState: { errors } } = useForm<ConferenciaPayload>({
    defaultValues: { nome: "", conselhoParticularId: "" },
  });

  const mutation = useMutation({
    mutationFn: (data: ConferenciaPayload) => conferenciaService.criar(data),
    onSuccess: () => {
      toast.success("Conferência criada");
      qc.invalidateQueries({ queryKey: ["conferencias"] });
      navigate({ to: "/conferencias" });
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });

  if (!isGestor) {
    return <div className="text-sm text-muted-foreground">Sem permissão.</div>;
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Nova conferência"
        actions={
          <Button variant="outline" onClick={() => navigate({ to: "/conferencias" })}>
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
            <div className="space-y-1.5">
              <Label>Conselho *</Label>
              <Controller
                control={control}
                name="conselhoParticularId"
                rules={{ required: "Selecione o conselho" }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {conselhos.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.conselhoParticularId && (
                <p className="text-xs text-destructive">{errors.conselhoParticularId.message}</p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate({ to: "/conferencias" })}>
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