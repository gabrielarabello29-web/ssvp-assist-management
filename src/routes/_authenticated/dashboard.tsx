import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueries } from "@tanstack/react-query";
import {
  Users,
  Building2,
  HandHeart,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { assistidoService } from "@/services/assistidoService";
import { conferenciaService } from "@/services/conferenciaService";
import { conselhoService } from "@/services/conselhoService";
import type { Assistido, Conferencia, Conselho } from "@/types";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function StatCard({
  title,
  value,
  icon: Icon,
  tone = "primary",
  hint,
}: {
  title: string;
  value: number | string;
  icon: typeof Users;
  tone?: "primary" | "success" | "destructive" | "warning";
  hint?: string;
}) {
  const toneMap: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    destructive: "bg-destructive/10 text-destructive",
    warning: "bg-warning/10 text-warning",
  };
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${toneMap[tone]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardPage() {
  const results = useQueries({
    queries: [
      { queryKey: ["assistidos"], queryFn: assistidoService.listar },
      { queryKey: ["conferencias"], queryFn: () => conferenciaService.listar() },
      { queryKey: ["conselhos"], queryFn: conselhoService.listar },
    ],
  });
  const [assistidosQ, conferenciasQ, conselhosQ] = results;
  const loading = results.some((r) => r.isLoading);
  const error = results.find((r) => r.error)?.error;

  const assistidos: Assistido[] = assistidosQ.data ?? [];
  const conferencias: Conferencia[] = conferenciasQ.data ?? [];
  const conselhos: Conselho[] = conselhosQ.data ?? [];

  const ativos = assistidos.filter((a) => a.ativo).length;
  const inativos = assistidos.length - ativos;

  const barData = [
    { nome: "Conselhos", total: conselhos.length },
    { nome: "Conferências", total: conferencias.length },
    { nome: "Assistidos", total: assistidos.length },
  ];

  const pieData = [
    { name: "Ativos", value: ativos, color: "oklch(0.6 0.15 155)" },
    { name: "Inativos", value: inativos, color: "oklch(0.58 0.22 27)" },
  ];

  const recentes = [...assistidos].slice(-5).reverse();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão geral do sistema vicentino."
      />

      {error && (
        <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Não foi possível carregar os dados. Verifique se o backend está rodando em
          <code className="ml-1 rounded bg-destructive/10 px-1">http://localhost:8080</code>.
        </div>
      )}

      {loading ? (
        <LoadingSpinner label="Carregando indicadores..." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Assistidos" value={assistidos.length} icon={Users} tone="primary" />
            <StatCard title="Conferências" value={conferencias.length} icon={HandHeart} tone="warning" />
            <StatCard title="Conselhos" value={conselhos.length} icon={Building2} tone="primary" />
            <StatCard
              title="Ativos / Inativos"
              value={`${ativos} / ${inativos}`}
              icon={CheckCircle2}
              tone="success"
              hint="Assistidos"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Totais por entidade</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 250)" />
                    <XAxis dataKey="nome" stroke="oklch(0.5 0.03 250)" fontSize={12} />
                    <YAxis stroke="oklch(0.5 0.03 250)" fontSize={12} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="total" fill="oklch(0.48 0.16 255)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status dos Assistidos</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                {assistidos.length === 0 ? (
                  <EmptyState icon={XCircle} title="Sem dados" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {pieData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Assistidos recentes</CardTitle>
              <Link
                to="/assistidos"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Ver todos <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent>
              {recentes.length === 0 ? (
                <EmptyState title="Nenhum assistido cadastrado ainda" />
              ) : (
                <ul className="divide-y divide-border">
                  {recentes.map((a) => (
                    <li key={a.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {a.dadosPessoais?.nome}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {a.conferencia?.nome ?? "—"}
                        </p>
                      </div>
                      <StatusBadge ativo={a.ativo} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}