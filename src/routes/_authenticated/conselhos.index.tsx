import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Eye, Ban, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { conselhoService } from "@/services/conselhoService";
import { useAuth } from "@/context/AuthContext";
import { extractErrorMessage } from "@/lib/api";
import type { Conselho } from "@/types";

export const Route = createFileRoute("/_authenticated/conselhos/")({
  component: ConselhosPage,
});

function ConselhosPage() {
  const { isGestor } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [toDelete, setToDelete] = useState<Conselho | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["conselhos"],
    queryFn: conselhoService.listar,
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => conselhoService.deletar(id),
    onSuccess: () => {
      toast.success("Conselho desativado");
      qc.invalidateQueries({ queryKey: ["conselhos"] });
      setToDelete(null);
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });

  const columns: Column<Conselho>[] = [
    { key: "nome", header: "Nome", render: (r) => <span className="font-medium">{r.nome}</span> },
    { key: "cidade", header: "Cidade", render: (r) => r.cidade ?? "—" },
    {
      key: "fund",
      header: "Fundação",
      render: (r) =>
        r.dataFundacao ? new Date(r.dataFundacao).toLocaleDateString("pt-BR") : "—",
    },
    { key: "status", header: "Status", render: (r) => <StatusBadge ativo={r.ativo} /> },
    {
      key: "acoes",
      header: "Ações",
      className: "w-32 text-right",
      render: (r) => (
        <div className="flex justify-end gap-1">
          <Button size="icon" variant="ghost" onClick={() => navigate({ to: "/conferencias" })} title="Ver conferências">
            <Eye className="h-4 w-4" />
          </Button>
          {isGestor && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigate({ to: "/conselhos/editar/$id", params: { id: r.id } })}
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
              title="Desativar"
              className="text-destructive hover:text-destructive"
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
        title="Conselhos"
        description="Conselhos particulares cadastrados."
        actions={
          isGestor && (
            <Button asChild>
              <Link to="/conselhos/novo">
                <Plus className="mr-2 h-4 w-4" /> Novo conselho
              </Link>
            </Button>
          )
        }
      />
      <DataTable
        columns={columns}
        data={data}
        loading={isLoading}
        rowKey={(r) => r.id}
        emptyTitle="Nenhum conselho cadastrado"
        emptyDescription={isGestor ? "Cadastre o primeiro conselho particular." : undefined}
      />
      <ConfirmModal
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Desativar conselho?"
        description={`O conselho "${toDelete?.nome}" será desativado.`}
        destructive
        confirmLabel="Desativar"
        loading={deleteMut.isPending}
        onConfirm={() => toDelete && deleteMut.mutate(toDelete.id)}
      />
    </div>
  );
}