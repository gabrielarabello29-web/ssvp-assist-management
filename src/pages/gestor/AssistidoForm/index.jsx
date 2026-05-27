import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { assistidosService } from "@/services/assistidos.js";
import { conferenciasService } from "@/services/conferencias.js";
import { extractErrorMessage } from "@/services/api.js";
import "./style.css";

const defaults = {
  dadosPessoais: { nome: "", conjuge: "", endereco: "", dataNascimento: "", estadoCivil: "", religiao: "", profissao: "" },
  situacaoFamiliar: { quantidadeTrabalhadores: 0, rendaFamiliar: 0, rendaLiquida: 0, valorAluguel: 0, quantidadeAlfabetizados: 0, situacaoMoradia: "" },
  situacaoIgrejaSaude: { situacaoCatequeseCrisma: "", participacaoIgrejaCatolica: "", problemaSaude: "", outrasInformacoes: "" },
  conferenciaId: "",
};

export default function AssistidoForm({ mode = "create" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [conferencias, setConferencias] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({ defaultValues: defaults });

  useEffect(() => {
    conferenciasService.listar().then(setConferencias).catch((e) => toast.error(extractErrorMessage(e)));
  }, []);

  useEffect(() => {
    if (mode === "edit" && id) {
      assistidosService.obter(id)
        .then((a) => reset({
          dadosPessoais: { ...defaults.dadosPessoais, ...(a.dadosPessoais || {}) },
          situacaoFamiliar: { ...defaults.situacaoFamiliar, ...(a.situacaoFamiliar || {}) },
          situacaoIgrejaSaude: { ...defaults.situacaoIgrejaSaude, ...(a.situacaoIgrejaSaude || {}) },
          conferenciaId: a.conferenciaId || a.conferencia?.id || "",
        }))
        .catch((e) => toast.error(extractErrorMessage(e)));
    }
  }, [mode, id, reset]);

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      situacaoFamiliar: {
        ...values.situacaoFamiliar,
        quantidadeTrabalhadores: Number(values.situacaoFamiliar.quantidadeTrabalhadores) || 0,
        rendaFamiliar: Number(values.situacaoFamiliar.rendaFamiliar) || 0,
        rendaLiquida: Number(values.situacaoFamiliar.rendaLiquida) || 0,
        valorAluguel: Number(values.situacaoFamiliar.valorAluguel) || 0,
        quantidadeAlfabetizados: Number(values.situacaoFamiliar.quantidadeAlfabetizados) || 0,
      },
    };
    setSubmitting(true);
    try {
      if (mode === "edit") {
        await assistidosService.atualizar(id, payload);
        toast.success("Assistido atualizado");
      } else {
        await assistidosService.criar(payload);
        toast.success("Assistido cadastrado");
      }
      navigate("/gestor/assistidos");
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="page-header" style={{ marginBottom: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {mode === "edit" ? "Editar assistido" : "Novo assistido"}
          </h1>
          <p className="text-sm text-muted-foreground">Preencha os dados do assistido.</p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/gestor/assistidos"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="form-card space-y-2">
        <section className="form-section">
          <h3 className="form-section-title">Dados pessoais</h3>
          <div className="form-grid">
            <Field label="Nome *" error={errors.dadosPessoais?.nome?.message}>
              <Input {...register("dadosPessoais.nome", { required: "Informe o nome" })} />
            </Field>
            <Field label="Cônjuge"><Input {...register("dadosPessoais.conjuge")} /></Field>
            <Field label="Endereço" className="col-span-2"><Input {...register("dadosPessoais.endereco")} /></Field>
            <Field label="Data de nascimento"><Input type="date" {...register("dadosPessoais.dataNascimento")} /></Field>
            <Field label="Estado civil"><Input {...register("dadosPessoais.estadoCivil")} /></Field>
            <Field label="Religião"><Input {...register("dadosPessoais.religiao")} /></Field>
            <Field label="Profissão"><Input {...register("dadosPessoais.profissao")} /></Field>
          </div>
        </section>

        <section className="form-section">
          <h3 className="form-section-title">Situação familiar</h3>
          <div className="form-grid">
            <Field label="Situação da moradia" className="col-span-2"><Input {...register("situacaoFamiliar.situacaoMoradia")} /></Field>
            <Field label="Qtd. trabalhadores"><Input type="number" min={0} {...register("situacaoFamiliar.quantidadeTrabalhadores", { valueAsNumber: true })} /></Field>
            <Field label="Qtd. alfabetizados"><Input type="number" min={0} {...register("situacaoFamiliar.quantidadeAlfabetizados", { valueAsNumber: true })} /></Field>
            <Field label="Renda familiar (R$)"><Input type="number" step="0.01" min={0} {...register("situacaoFamiliar.rendaFamiliar", { valueAsNumber: true })} /></Field>
            <Field label="Renda líquida (R$)"><Input type="number" step="0.01" min={0} {...register("situacaoFamiliar.rendaLiquida", { valueAsNumber: true })} /></Field>
            <Field label="Valor do aluguel (R$)"><Input type="number" step="0.01" min={0} {...register("situacaoFamiliar.valorAluguel", { valueAsNumber: true })} /></Field>
          </div>
        </section>

        <section className="form-section">
          <h3 className="form-section-title">Saúde e igreja</h3>
          <div className="form-grid">
            <Field label="Catequese / Crisma"><Input {...register("situacaoIgrejaSaude.situacaoCatequeseCrisma")} /></Field>
            <Field label="Participação na Igreja"><Input {...register("situacaoIgrejaSaude.participacaoIgrejaCatolica")} /></Field>
            <Field label="Problema de saúde" className="col-span-2"><Textarea rows={3} {...register("situacaoIgrejaSaude.problemaSaude")} /></Field>
            <Field label="Outras informações" className="col-span-2"><Textarea rows={3} {...register("situacaoIgrejaSaude.outrasInformacoes")} /></Field>
          </div>
        </section>

        <section className="form-section">
          <h3 className="form-section-title">Vínculo</h3>
          <Field label="Conferência *" error={errors.conferenciaId?.message}>
            <Controller
              control={control}
              name="conferenciaId"
              rules={{ required: "Selecione a conferência" }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {conferencias.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
        </section>

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={submitting}>
            <Save className="mr-2 h-4 w-4" />
            {submitting ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children, error, className = "" }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}