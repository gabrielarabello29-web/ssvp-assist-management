import { useState } from "react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { conferenciaService } from "@/services/conferenciaService";
import type { AssistidoPayload } from "@/types";
import { cn } from "@/lib/utils";

const steps = [
  "Dados pessoais",
  "Situação familiar",
  "Saúde e igreja",
  "Conferência",
  "Revisão",
] as const;

interface Props {
  initial?: Partial<AssistidoPayload>;
  onSubmit: (data: AssistidoPayload) => void;
  submitting?: boolean;
  submitLabel?: string;
}

const empty: AssistidoPayload = {
  dadosPessoais: {
    nome: "",
    conjuge: "",
    endereco: "",
    dataNascimento: "",
    estadoCivil: "",
    religiao: "",
    profissao: "",
  },
  situacaoFamiliar: {
    quantidadeTrabalhadores: 0,
    rendaFamiliar: 0,
    rendaLiquida: 0,
    valorAluguel: 0,
    quantidadeAlfabetizados: 0,
    situacaoMoradia: "",
  },
  situacaoIgrejaSaude: {
    situacaoCatequeseCrisma: "",
    participacaoIgrejaCatolica: "",
    problemaSaude: "",
    outrasInformacoes: "",
  },
  conferenciaId: "",
};

export function AssistidoForm({ initial, onSubmit, submitting, submitLabel = "Salvar" }: Props) {
  const [step, setStep] = useState(0);
  const { data: conferencias = [] } = useQuery({
    queryKey: ["conferencias"],
    queryFn: () => conferenciaService.listar(),
  });

  const form = useForm<AssistidoPayload>({
    defaultValues: { ...empty, ...initial, dadosPessoais: { ...empty.dadosPessoais, ...initial?.dadosPessoais }, situacaoFamiliar: { ...empty.situacaoFamiliar, ...initial?.situacaoFamiliar }, situacaoIgrejaSaude: { ...empty.situacaoIgrejaSaude, ...initial?.situacaoIgrejaSaude } },
    mode: "onTouched",
  });

  const { register, handleSubmit, control, trigger, getValues, formState: { errors } } = form;

  const stepFields: Array<Array<Parameters<typeof trigger>[0]>[number]> = [
    ["dadosPessoais.nome"],
    [],
    [],
    ["conferenciaId"],
    [],
  ];

  const next = async () => {
    const fields = stepFields[step] ?? [];
    const ok = fields.length ? await trigger(fields as never) : true;
    if (ok) setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const submit: SubmitHandler<AssistidoPayload> = (data) => {
    const normalized: AssistidoPayload = {
      ...data,
      situacaoFamiliar: {
        ...data.situacaoFamiliar,
        quantidadeTrabalhadores: Number(data.situacaoFamiliar.quantidadeTrabalhadores) || 0,
        rendaFamiliar: Number(data.situacaoFamiliar.rendaFamiliar) || 0,
        rendaLiquida: Number(data.situacaoFamiliar.rendaLiquida) || 0,
        valorAluguel: Number(data.situacaoFamiliar.valorAluguel) || 0,
        quantidadeAlfabetizados: Number(data.situacaoFamiliar.quantidadeAlfabetizados) || 0,
      },
    };
    onSubmit(normalized);
  };

  return (
    <Card>
      <CardContent className="p-6">
        {/* Stepper */}
        <ol className="mb-8 flex flex-wrap items-center gap-2">
          {steps.map((label, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <li key={label} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => i < step && setStep(i)}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                    done && "border-success bg-success text-success-foreground",
                    active && "border-primary bg-primary text-primary-foreground",
                    !done && !active && "border-border bg-background text-muted-foreground",
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </button>
                <span className={cn("text-xs font-medium", active ? "text-foreground" : "text-muted-foreground")}>
                  {label}
                </span>
                {i < steps.length - 1 && <span className="mx-1 h-px w-6 bg-border" />}
              </li>
            );
          })}
        </ol>

        <form onSubmit={handleSubmit(submit)} className="space-y-5">
          {step === 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome *" error={errors.dadosPessoais?.nome?.message}>
                <Input {...register("dadosPessoais.nome", { required: "Informe o nome" })} />
              </Field>
              <Field label="Cônjuge">
                <Input {...register("dadosPessoais.conjuge")} />
              </Field>
              <Field label="Endereço" className="sm:col-span-2">
                <Input {...register("dadosPessoais.endereco")} />
              </Field>
              <Field label="Data de nascimento">
                <Input type="date" {...register("dadosPessoais.dataNascimento")} />
              </Field>
              <Field label="Estado civil">
                <Input {...register("dadosPessoais.estadoCivil")} placeholder="Solteiro, Casado..." />
              </Field>
              <Field label="Religião">
                <Input {...register("dadosPessoais.religiao")} />
              </Field>
              <Field label="Profissão">
                <Input {...register("dadosPessoais.profissao")} />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Situação da moradia" className="sm:col-span-2">
                <Input {...register("situacaoFamiliar.situacaoMoradia")} placeholder="Própria, alugada, cedida..." />
              </Field>
              <Field label="Qtd. trabalhadores">
                <Input type="number" min={0} {...register("situacaoFamiliar.quantidadeTrabalhadores", { valueAsNumber: true })} />
              </Field>
              <Field label="Qtd. alfabetizados">
                <Input type="number" min={0} {...register("situacaoFamiliar.quantidadeAlfabetizados", { valueAsNumber: true })} />
              </Field>
              <Field label="Renda familiar (R$)">
                <Input type="number" step="0.01" min={0} {...register("situacaoFamiliar.rendaFamiliar", { valueAsNumber: true })} />
              </Field>
              <Field label="Renda líquida (R$)">
                <Input type="number" step="0.01" min={0} {...register("situacaoFamiliar.rendaLiquida", { valueAsNumber: true })} />
              </Field>
              <Field label="Valor do aluguel (R$)">
                <Input type="number" step="0.01" min={0} {...register("situacaoFamiliar.valorAluguel", { valueAsNumber: true })} />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Catequese / Crisma">
                <Input {...register("situacaoIgrejaSaude.situacaoCatequeseCrisma")} />
              </Field>
              <Field label="Participação na Igreja">
                <Input {...register("situacaoIgrejaSaude.participacaoIgrejaCatolica")} />
              </Field>
              <Field label="Problema de saúde" className="sm:col-span-2">
                <Textarea rows={3} {...register("situacaoIgrejaSaude.problemaSaude")} />
              </Field>
              <Field label="Outras informações" className="sm:col-span-2">
                <Textarea rows={3} {...register("situacaoIgrejaSaude.outrasInformacoes")} />
              </Field>
            </div>
          )}

          {step === 3 && (
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
          )}

          {step === 4 && <Review values={getValues()} conferenciaNome={conferencias.find((c) => c.id === getValues("conferenciaId"))?.nome} />}

          <div className="flex justify-between gap-2 pt-4">
            <Button type="button" variant="outline" onClick={prev} disabled={step === 0}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
            {step < steps.length - 1 ? (
              <Button type="button" onClick={next}>
                Próximo <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={submitting}>
                <Save className="mr-2 h-4 w-4" />
                {submitting ? "Salvando..." : submitLabel}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  children,
  error,
  className,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Review({ values, conferenciaNome }: { values: AssistidoPayload; conferenciaNome?: string }) {
  const Item = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between gap-4 border-b border-border py-1.5 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value || "—"}</span>
    </div>
  );
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-lg border border-border p-4">
        <h4 className="mb-2 text-sm font-semibold">Dados pessoais</h4>
        <Item label="Nome" value={values.dadosPessoais.nome} />
        <Item label="Cônjuge" value={values.dadosPessoais.conjuge} />
        <Item label="Endereço" value={values.dadosPessoais.endereco} />
        <Item label="Nascimento" value={values.dadosPessoais.dataNascimento} />
        <Item label="Estado civil" value={values.dadosPessoais.estadoCivil} />
        <Item label="Religião" value={values.dadosPessoais.religiao} />
        <Item label="Profissão" value={values.dadosPessoais.profissao} />
      </div>
      <div className="rounded-lg border border-border p-4">
        <h4 className="mb-2 text-sm font-semibold">Situação familiar</h4>
        <Item label="Moradia" value={values.situacaoFamiliar.situacaoMoradia} />
        <Item label="Trabalhadores" value={values.situacaoFamiliar.quantidadeTrabalhadores} />
        <Item label="Alfabetizados" value={values.situacaoFamiliar.quantidadeAlfabetizados} />
        <Item label="Renda familiar" value={`R$ ${values.situacaoFamiliar.rendaFamiliar}`} />
        <Item label="Renda líquida" value={`R$ ${values.situacaoFamiliar.rendaLiquida}`} />
        <Item label="Aluguel" value={`R$ ${values.situacaoFamiliar.valorAluguel}`} />
      </div>
      <div className="rounded-lg border border-border p-4">
        <h4 className="mb-2 text-sm font-semibold">Saúde e igreja</h4>
        <Item label="Catequese / Crisma" value={values.situacaoIgrejaSaude.situacaoCatequeseCrisma} />
        <Item label="Participação" value={values.situacaoIgrejaSaude.participacaoIgrejaCatolica} />
        <Item label="Saúde" value={values.situacaoIgrejaSaude.problemaSaude} />
        <Item label="Observações" value={values.situacaoIgrejaSaude.outrasInformacoes} />
      </div>
      <div className="rounded-lg border border-border p-4">
        <h4 className="mb-2 text-sm font-semibold">Vínculo</h4>
        <Item label="Conferência" value={conferenciaNome} />
      </div>
    </div>
  );
}