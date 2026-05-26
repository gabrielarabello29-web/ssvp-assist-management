import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Ban, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { conferenciaService } from "@/services/conferenciaService";
import { conselhoService } from "@/services/conselhoService";
import { useAuth } from "@/context/AuthContext";
import { extractErrorMessage } from "@/lib/api";
import type { Conferencia } from "@/types";

export const Route = createFileRoute("/_authenticated/conferencias/")({
  component: ConferenciasPage,
});

function ConferenciasPage() {
  const { isGestor } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [filtroConselho, setFiltroConselho] = useState<string>("all");
  const [toDelete, setToDelete] = useState<Conferencia | null>(null);

  const { data: conselhos = [] } = useQuery({
    queryKey: ["conselhos"],
    queryFn: conselhoService.listar,
  });

  const { data = [], isLoading } = useQuery({
    queryKey: ["conferencias", filtroConselho],
    queryFn: () =>
      conferenciaService.listar(filtroConselho === "all" ? undefined : filtroConselho),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => conferenciaService.deletar(id),
    onSuccess: () => {
      toast.success("Conferência desativada");
      qc.invalidateQueries({ queryKey: ["conferencias"] });
      setToDelete(null);
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });

  const columns: Column<Conferencia>[] = [
    { key: "nome", header: "Nome", render: (r) => <span className="font-medium">{r.nome}</span> },
    {
      key: "conselho",
      header: "Conselho",
      render: (r) => r.conselho?.nome ?? r.conselhoNome ?? "—",
    },
    { key: "status", header: "Status", render: (r) => <StatusBadge ativo={r.ativo} /> },
    {
      key: "acoes",
      header: "Ações",
      className: "w-32 text-right",
      render: (r) => (
        <div className="flex justify-end gap-1">
          {isGestor && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigate({ to: "/conferencias/editar/$id", params: { id: r.id } })}
              title="Editar"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {isGestor && r.ativo && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setToDelete(r)}
              className="text-destructive hover:text-destructive"
              title="Desativar"
            >
              <Ban className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Conferências"
        description="Conferências vicentinas vinculadas aos conselhos."
        actions={
          isGestor && (
            <Button asChild>
              <Link to="/conferencias/nova">
                <Plus className="mr-2 h-4 w-4" /> Nova conferência
              </Link>
            </Button>
          )
        }
      />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="w-full max-w-xs">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Filtrar por conselho
          </label>
          <Select value={filtroConselho} onValueChange={setFiltroConselho}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os conselhos</SelectItem>
              {conselhos.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={isLoading}
        rowKey={(r) => r.id}
        emptyTitle="Nenhuma conferência encontrada"
      />

      <ConfirmModal
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Desativar conferência?"
        description={`A conferência "${toDelete?.nome}" será desativada.`}
        destructive
        confirmLabel="Desativar"
        loading={deleteMut.isPending}
        onConfirm={() => toDelete && deleteMut.mutate(toDelete.id)}
      />
    </div>
  );
}