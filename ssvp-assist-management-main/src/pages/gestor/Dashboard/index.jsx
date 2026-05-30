import { useEffect, useState } from "react";
import { Users, Building2, HandHeart, Activity } from "lucide-react";
import Card from "@/components/Card/index.jsx";
import { assistidosService } from "@/services/assistidos.js";
import { conferenciasService } from "@/services/conferencias.js";
import { conselhosService } from "@/services/conselhos.js";
import { extractErrorMessage } from "@/services/api.js";
import { toast } from "sonner";
import "./style.css";

export default function Dashboard() {
  const [stats, setStats] = useState({ assistidos: 0, conferencias: 0, conselhos: 0, ativos: 0 });

  useEffect(() => {
    Promise.all([
      assistidosService.listar().catch(() => []),
      conferenciasService.listar().catch(() => []),
      conselhosService.listar().catch(() => []),
    ])
      .then(([a, c, co]) => {
        setStats({
          assistidos: a.length,
          conferencias: c.length,
          conselhos: co.length,
          ativos: a.filter((x) => x.ativo).length,
        });
      })
      .catch((e) => toast.error(extractErrorMessage(e)));
  }, []);

  return (
    <div>
      <h1 className="dash-title">Dashboard</h1>
      <p className="dash-subtitle">Visão geral do sistema.</p>
      <div className="dash-grid">
        <Card label="Assistidos" value={stats.assistidos} icon={Users} />
        <Card label="Assistidos ativos" value={stats.ativos} icon={Activity} />
        <Card label="Conferências" value={stats.conferencias} icon={HandHeart} />
        <Card label="Conselhos" value={stats.conselhos} icon={Building2} />
      </div>
    </div>
  );
}