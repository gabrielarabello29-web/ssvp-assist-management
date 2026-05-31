import { useState } from "react";
import { Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  HandHeart,
  UserPlus,
} from "lucide-react";
import Sidebar from "@/components/Sidebar/index.jsx";
import Header from "@/components/Header/index.jsx";

const items = [
  { to: "/gestor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/gestor/conselhos", label: "Conselhos", icon: Building2 },
  { to: "/gestor/conferencias", label: "Conferências", icon: HandHeart },
  { to: "/gestor/assistidos", label: "Assistidos", icon: Users },
  { to: "/gestor/usuarios", label: "Usuários", icon: UserPlus },
];

export default function GestorLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <Sidebar items={items} open={open} onClose={() => setOpen(false)} title="SSVP" subtitle="Painel do Gestor" />
      <div className="lg:pl-64">
        <Header onMenuClick={() => setOpen(true)} />
        <main className="p-4 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}