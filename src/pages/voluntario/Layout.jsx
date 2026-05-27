import { useState } from "react";
import { Outlet } from "react-router-dom";
import { LayoutDashboard, Users, UserCircle } from "lucide-react";
import Sidebar from "@/components/Sidebar/index.jsx";
import Header from "@/components/Header/index.jsx";

const items = [
  { to: "/voluntario/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/voluntario/assistidos", label: "Assistidos", icon: Users },
  { to: "/voluntario/perfil", label: "Perfil", icon: UserCircle },
];

export default function VoluntarioLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <Sidebar items={items} open={open} onClose={() => setOpen(false)} title="SSVP" subtitle="Voluntário" />
      <div className="lg:pl-64">
        <Header onMenuClick={() => setOpen(true)} />
        <main className="p-4 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}