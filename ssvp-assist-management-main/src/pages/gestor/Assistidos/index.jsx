import { useEffect, useState } from "react";
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
  const [filtered, setFiltered] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const navigate = useNavigate();

  const load = () => {
    setLoading(true);

    assistidosService
      .listar()
      .then((data) => {
        setList(data);
        setFiltered(data);
      })
      .catch((e) => toast.error(extractErrorMessage(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const termo = q.trim();

    if (!termo) {
      setFiltered(list);
      return;
    }

    const assistidoEncontrado = list.find(
      (a) => a.nome?.toLowerCase() === termo.toLowerCase()
    );

    if (assistidoEncontrado) {
      assistidosService
        .obter(assistidoEncontrado.id)
        .then((assistido) => {
          setFiltered(assistido ? [assistido] : []);
        })
        .catch(() => {
          setFiltered([]);
        });

      return;
    }

    setFiltered(
      list.filter((a) =>
        (a.nome || "")
          .toLowerCase()
          .includes(termo.toLowerCase())
      )
    );
  }, [q, list]);

  const openDetails = async (id) => {
    try {
      setLoadingDetails(true);

      const data = await assistidosService.obter(id);

      setDetails(data);
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Deseja realmente excluir este assistido?")) return;

    try {
      await assistidosService.deletar(id);
      toast.success("Assistido excluído");
      load();
    } catch (e) {
      toast.error(extractErrorMessage(e));
    }
  };

  const columns = [
    {
      key: "nome",
      header: "Nome",
      render: (r) => (
        <button
          type="button"
          className="text-blue-600 hover:underline"
          onClick={() => openDetails(r.id)}
        >
          {r.nome || "—"}
        </button>
      ),
    },
    {
      key: "profissao",
      header: "Profissão",
      render: (r) => r.profissao || "—",
    },
    {
      key: "conferencia",
      header: "Conferência",
      render: (r) => r.conferencia || "—",
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <span
          className={`badge ${r.status ? "badge-success" : "badge-muted"
            }`}
        >
          {r.status ? "Ativo" : "Inativo"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="row-actions">
          <Button
            size="icon"
            variant="outline"
            onClick={() =>
              navigate(`/gestor/assistidos/editar/${r.id}`)
            }
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="outline"
            onClick={() => handleDelete(r.id)}
            title="Excluir"
          >
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
          <p className="page-subtitle">
            Gerencie os assistidos cadastrados.
          </p>
        </div>

        <Button asChild>
          <Link to="/gestor/assistidos/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo assistido
          </Link>
        </Button>
      </div>

      <div className="search-bar relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          placeholder="Buscar por nome..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>

      <Table
        columns={columns}
        data={filtered}
        emptyMessage={
          loading
            ? "Carregando..."
            : "Nenhum assistido encontrado."
        }
      />

      {details && (
        <div
          className="modal-backdrop"
          onClick={() => setDetails(null)}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modal-title">
              Dados do Assistido
            </h2>

            {loadingDetails ? (
              <p>Carregando...</p>
            ) : (
              <div className="space-y-2">
                <p><strong>Nome:</strong> {details.nome || "—"}</p>
                <p><strong>Cônjuge:</strong> {details.conjuge || "—"}</p>
                <p><strong>Endereço:</strong> {details.endereco || "—"}</p>
                <p><strong>Data de Nascimento:</strong> {details.dataNascimento || "—"}</p>
                <p><strong>Estado Civil:</strong> {details.estadoCivil || "—"}</p>
                <p><strong>Religião:</strong> {details.religiao || "—"}</p>
                <p><strong>Profissão:</strong> {details.profissao || "—"}</p>
                <p><strong>Situação Moradia:</strong> {details.situacaoMoradia || "—"}</p>
                <p><strong>Quantidade Trabalhadores:</strong> {details.quantidadeTrabalhadores ?? "—"}</p>
                <p><strong>Renda Familiar:</strong> {details.rendaFamiliar ?? "—"}</p>
                <p><strong>Renda Líquida:</strong> {details.rendaLiquida ?? "—"}</p>
                <p><strong>Valor Aluguel:</strong> {details.valorAluguel ?? "—"}</p>
                <p><strong>Quantidade Alfabetizados:</strong> {details.quantidadeAlfabetizados ?? "—"}</p>
                <p><strong>Catequese/Crisma:</strong> {details.situacaoCatequeseCrisma || "—"}</p>
                <p><strong>Participação Igreja:</strong> {details.participacaoIgrejaCatolica || "—"}</p>
                <p><strong>Problema Saúde:</strong> {details.problemaSaude || "—"}</p>
                <p><strong>Outras Informações:</strong> {details.outrasInformacoes || "—"}</p>
                <p><strong>Conferência:</strong> {details.conferencia || "—"}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  {details.status ? "Ativo" : "Inativo"}
                </p>
              </div>
            )}

            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => setDetails(null)}
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}