import { useEffect, useState } from "react";
import { Users, Activity } from "lucide-react";
import Card from "@/components/Card/index.jsx";
import { assistidosService } from "@/services/assistidos.js";
import { extractErrorMessage } from "@/services/api.js";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext.jsx";
import "./style.css";

export default function VoluntarioDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, ativos: 0 });

  useEffect(() => {
    assistidosService.listar()
      .then((a) => setStats({ total: a.length, ativos: a.filter((x) => x.ativo).length }))
      .catch((e) => toast.error(extractErrorMessage(e)));
  }, []);

  return (
    <div>
      <h1 className="v-dash-title">Olá, {user?.nome || user?.email}</h1>
      <p className="v-dash-sub">Visão geral dos assistidos.</p>
      <div className="v-dash-grid">
        <Card label="Total de assistidos" value={stats.total} icon={Users} />
        <Card label="Assistidos ativos" value={stats.ativos} icon={Activity} />
      </div>
    </div>
  );
}