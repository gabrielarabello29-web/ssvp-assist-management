import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Eye, Pencil, Ban, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { assistidoService } from "@/services/assistidoService";
import { conferenciaService } from "@/services/conferenciaService";
import { useAuth } from "@/context/AuthContext";
import { extractErrorMessage } from "@/lib/api";
import type { Assistido } from "@/types";

const PAGE_SIZE = 10;

export const Route = createFileRoute("/_authenticated/assistidos/")({
  component: AssistidosPage,
});

function AssistidosPage() {
  const { isGestor } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "ativo" | "inativo">("all");
  const [conferenciaFilter, setConferenciaFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<Assistido | null>(null);

  const { data: assistidos = [], isLoading } = useQuery({
    queryKey: ["assistidos"],
    queryFn: assistidoService.listar,
  });
  const { data: conferencias = [] } = useQuery({
    queryKey: ["conferencias"],
    queryFn: () => conferenciaService.listar(),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => assistidoService.deletar(id),
    onSuccess: () => {
      toast.success("Assistido desativado");
      qc.invalidateQueries({ queryKey: ["assistidos"] });
      setToDelete(null);
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });

  const filtered = useMemo(() => {
    return assistidos.filter((a) => {
      const nameOk = a.dadosPessoais?.nome?.toLowerCase().includes(search.toLowerCase());
      const statusOk =
        status === "all" || (status === "ativo" ? a.ativo : !a.ativo);
      const confId = a.conferencia?.id ?? a.conferenciaId;
      const confOk = conferenciaFilter === "all" || confId === conferenciaFilter;
      return nameOk && statusOk && confOk;
    });
  }, [assistidos, search, status, conferenciaFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageData = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const columns: Column<Assistido>[] = [
    {
      key: "nome",
      header: "Nome",
      render: (r) => <span className="font-medium">{r.dadosPessoais?.nome}</span>,
    },
    {
      key: "nasc",
      header: "Nascimento",
      render: (r) =>
        r.dadosPessoais?.dataNascimento
          ? new Date(r.dadosPessoais.dataNascimento).toLocaleDateString("pt-BR")
          : "—",
    },
    {
      key: "conf",
      header: "Conferência",
      render: (r) => r.conferencia?.nome ?? "—",
    },
    { key: "status", header: "Status", render: (r) => <StatusBadge ativo={r.ativo} /> },
    {
      key: "acoes",
      header: "Ações",
      className: "w-36 text-right",
      render: (r) => (
        <div className="flex justify-end gap-1">
          <Button size="icon" variant="ghost" onClick={() => navigate({ to: "/assistidos/$id", params: { id: r.id } })} title="Ver">
            <Eye className="h-4 w-4" />
          </Button>
          {isGestor && (
            <Button size="icon" variant="ghost" onClick={() => navigate({ to: "/assistidos/editar/$id", params: { id: r.id } })} title="Editar">
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {isGestor && r.ativo && (
            <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setToDelete(r)} title="Desativar">
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
        title="Assistidos"
        description="Pessoas e famílias acompanhadas pelas conferências."
        actions={
          isGestor && (
            <Button asChild>
              <Link to="/assistidos/novo">
                <Plus className="mr-2 h-4 w-4" /> Novo assistido
              </Link>
            </Button>
          )
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v as typeof status); setPage(1); }}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="ativo">Ativos</SelectItem>
            <SelectItem value="inativo">Inativos</SelectItem>
          </SelectContent>
        </Select>
        <Select value={conferenciaFilter} onValueChange={(v) => { setConferenciaFilter(v); setPage(1); }}>
          <SelectTrigger><SelectValue placeholder="Conferência" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as conferências</SelectItem>
            {conferencias.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={pageData}
        loading={isLoading}
        rowKey={(r) => r.id}
        emptyTitle="Nenhum assistido encontrado"
        emptyDescription="Ajuste os filtros ou cadastre um novo assistido."
      />

      {filtered.length > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Página {currentPage} de {totalPages} — {filtered.length} registros
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setPage((p) => p - 1)}>
              Anterior
            </Button>
            <Button size="sm" variant="outline" disabled={currentPage === totalPages} onClick={() => setPage((p) => p + 1)}>
              Próxima
            </Button>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Desativar assistido?"
        description={`"${toDelete?.dadosPessoais?.nome}" será desativado.`}
        destructive
        confirmLabel="Desativar"
        loading={deleteMut.isPending}
        onConfirm={() => toDelete && deleteMut.mutate(toDelete.id)}
      />
    </div>
  );
}