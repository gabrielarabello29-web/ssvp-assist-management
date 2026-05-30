import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Table from "@/components/Table/index.jsx";
import { conselhosService } from "@/services/conselhos.js";
import { extractErrorMessage } from "@/services/api.js";
import "./style.css";

export default function GestorConselhos() {
  const [list, setList] = useState([]);
  const [editing, setEditing] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { nome: "", cidade: "", dataFundacao: "" },
  });

  const load = () => conselhosService.listar().then(setList).catch((e) => toast.error(extractErrorMessage(e)));
  useEffect(() => { load(); }, []);

  const openNew = () => { reset({ nome: "", cidade: "", dataFundacao: "" }); setEditing({}); };
  const openEdit = (r) => { reset({ nome: r.nome || "", cidade: r.cidade || "", dataFundacao: r.dataFundacao || "" }); setEditing(r); };

  const onSubmit = async (values) => {
    try {
      if (editing?.id) { await conselhosService.atualizar(editing.id, values); toast.success("Conselho atualizado"); }
      else { await conselhosService.criar(values); toast.success("Conselho criado"); }
      setEditing(null); load();
    } catch (e) { toast.error(extractErrorMessage(e)); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Excluir este conselho?")) return;
    try { await conselhosService.deletar(id); toast.success("Excluído"); load(); }
    catch (e) { toast.error(extractErrorMessage(e)); }
  };

  const columns = [
    { key: "nome", header: "Nome" },
    { key: "cidade", header: "Cidade", render: (r) => r.cidade || r.localidade || "—" },
    { key: "dataFundacao", header: "Fundação", render: (r) => r.dataFundacao || r.fundacao || "—" },
    {
      key: "ativo", header: "Status",
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
          <Button size="icon" variant="outline" onClick={() => openEdit(r)} title="Editar"><Pencil className="h-4 w-4" /></Button>
          <Button size="icon" variant="outline" onClick={() => handleDelete(r.id)} title="Excluir"><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Conselhos</h1>
          <p className="page-subtitle">Conselhos particulares cadastrados.</p>
        </div>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Novo conselho</Button>
      </div>
      <Table columns={columns} data={list} emptyMessage="Nenhum conselho cadastrado." />

      {editing && (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{editing.id ? "Editar conselho" : "Novo conselho"}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nome *</Label>
                <Input {...register("nome", { required: "Informe o nome" })} />
                {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Cidade</Label>
                <Input {...register("cidade")} />
              </div>
              <div className="space-y-1.5">
                <Label>Data de fundação</Label>
                <Input type="date" {...register("dataFundacao")} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}