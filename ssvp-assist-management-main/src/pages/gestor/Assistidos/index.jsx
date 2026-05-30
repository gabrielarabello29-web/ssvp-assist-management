import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Table from "@/components/Table/index.jsx";
import { assistidosService } from "@/services/assistidos.js";
import { extractErrorMessage } from "@/services/api.js";
import "./style.css";

export default function GestorAssistidos() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    assistidosService
      .listar()
      .then(setList)
      .catch((e) => toast.error(extractErrorMessage(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return list;
    return list.filter((a) => (a.dadosPessoais?.nome || "").toLowerCase().includes(t));
  }, [list, q]);

  const handleDelete = async (id) => {
    if (!confirm("Deseja realmente excluir este assistido?")) return;
    try {
      await assistidosService.deletar(id);
      toast.success("Assistido excluído");
      load();
    } catch (e) { toast.error(extractErrorMessage(e)); }
  };

  const columns = [
    { key: "nome", header: "Nome", render: (r) => r.dadosPessoais?.nome || "—" },
    { key: "profissao", header: "Profissão", render: (r) => r.dadosPessoais?.profissao || "—" },
    { key: "conferencia", header: "Conferência", render: (r) => r.conferencia?.nome || "—" },
    {
      key: "status", header: "Status",
      render: (r) => (
        <span className={`badge ${r.ativo ? "badge-success" : "badge-muted"}`}>
          {r.ativo ? "Ativo" : "Inativo"}
        </span>
      ),
    },
    {
      key: "actions", header: "",
      render: (r) => (
        <div className="row-actions">
          <Button size="icon" variant="outline" onClick={() => navigate(`/gestor/assistidos/editar/${r.id}`)} title="Editar">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={() => handleDelete(r.id)} title="Excluir">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Assistidos</h1>
          <p className="page-subtitle">Gerencie os assistidos cadastrados.</p>
        </div>
        <Button asChild>
          <Link to="/gestor/assistidos/novo"><Plus className="mr-2 h-4 w-4" /> Novo assistido</Link>
        </Button>
      </div>
      <div className="search-bar relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar por nome..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
      </div>
      <Table columns={columns} data={filtered} emptyMessage={loading ? "Carregando..." : "Nenhum assistido encontrado."} />
    </div>
  );
}
