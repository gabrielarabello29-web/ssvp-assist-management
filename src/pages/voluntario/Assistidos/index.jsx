import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import Table from "@/components/Table/index.jsx";
import { assistidosService } from "@/services/assistidos.js";
import { extractErrorMessage } from "@/services/api.js";
import "./style.css";

export default function VoluntarioAssistidos() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    assistidosService.listar()
      .then(setList)
      .catch((e) => toast.error(extractErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return list;
    return list.filter((a) => (a.dadosPessoais?.nome || "").toLowerCase().includes(t));
  }, [list, q]);

  const columns = [
    { key: "nome", header: "Nome", render: (r) => r.dadosPessoais?.nome || "—" },
    { key: "endereco", header: "Endereço", render: (r) => r.dadosPessoais?.endereco || "—" },
    { key: "profissao", header: "Profissão", render: (r) => r.dadosPessoais?.profissao || "—" },
    { key: "conferencia", header: "Conferência", render: (r) => r.conferencia?.nome || "—" },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Assistidos</h1>
          <p className="page-subtitle">Consulta dos assistidos cadastrados.</p>
        </div>
      </div>
      <div className="search-bar relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar por nome..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
      </div>
      <Table columns={columns} data={filtered} emptyMessage={loading ? "Carregando..." : "Nenhum assistido encontrado."} />
    </div>
  );
}