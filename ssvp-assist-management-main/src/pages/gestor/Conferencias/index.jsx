import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Table from "@/components/Table/index.jsx";
import { conferenciasService } from "@/services/conferencias.js";
import { conselhosService } from "@/services/conselhos.js";
import { extractErrorMessage } from "@/services/api.js";
import "./style.css";

export default function GestorConferencias() {
  const [list, setList] = useState([]);
  const [conselhos, setConselhos] = useState([]);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {id} = edit
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: { nome: "", conselhoParticularId: "" },
  });

  const load = () => {
    conferenciasService.listar().then(setList).catch((e) => toast.error(extractErrorMessage(e)));
    conselhosService.listar().then(setConselhos).catch(() => {});
  };
  useEffect(load, []);

  const openNew = () => { reset({ nome: "", conselhoParticularId: "" }); setEditing({}); };
  const openEdit = (row) => {
    reset({ nome: row.nome || "", conselhoParticularId: row.conselho?.id || row.conselhoId || "" });
    setEditing(row);
  };

  const onSubmit = async (values) => {
    try {
      if (editing?.id) {
        await conferenciasService.atualizar(editing.id, values);
        toast.success("Conferência atualizada");
      } else {
        await conferenciasService.criar(values);
        toast.success("Conferência criada");
      }
      setEditing(null);
      setTimeout(load, 500);
    } catch (e) { toast.error(extractErrorMessage(e)); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Excluir esta conferência?")) return;
    try { await conferenciasService.deletar(id); toast.success("Excluída"); load(); }
    catch (e) { toast.error(extractErrorMessage(e)); }
  };

  // Função para obter dados do conselho relacionado
  const getConselhoData = (conferencia) => {
    const conselho = conselhos.find(c => c.id === conferencia.conselhoId || c.id === conferencia.conselhoParticularId);
    return conselho || {};
  };

  const columns = [
    { key: "nome", header: "Nome" },
    { key: "conselho", header: "Conselho", render: (r) => r.conselho?.nome || r.conselhoParticular?.nome || r.conselhoNome || "—" },
    { 
      key: "cidade", 
      header: "Cidade", 
      render: (r) => {
        const conselho = getConselhoData(r);
        return conselho.cidade || conselho.localidade || "—";
      }
    },
    { 
      key: "fundacao", 
      header: "Fundação", 
      render: (r) => {
        const conselho = getConselhoData(r);
        return conselho.dataFundacao || conselho.fundacao || "—";
      }
    },
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
          <h1 className="page-title">Conferências</h1>
          <p className="page-subtitle">Conferências vinculadas aos conselhos.</p>
        </div>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Nova conferência</Button>
      </div>
      <Table columns={columns} data={list} emptyMessage="Nenhuma conferência cadastrada." />

      {editing && (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{editing.id ? "Editar conferência" : "Nova conferência"}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nome *</Label>
                <Input {...register("nome", { required: "Informe o nome" })} />
                {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Conselho *</Label>
                <Controller
                  control={control}
                  name="conselhoParticularId"
                  rules={{ required: "Selecione um conselho" }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {conselhos.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.conselhoParticularId && <p className="text-xs text-destructive">{errors.conselhoParticularId.message}</p>}
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
