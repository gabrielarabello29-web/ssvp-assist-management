import { useAuth } from "@/context/AuthContext.jsx";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./style.css";

export default function VoluntarioPerfil() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground mb-1">Meu perfil</h1>
      <p className="text-sm text-muted-foreground mb-5">Dados da sua conta.</p>
      <div className="profile-card space-y-1">
        <div className="profile-row"><span className="label">Nome</span><span className="value">{user?.nome || "—"}</span></div>
        <div className="profile-row"><span className="label">E-mail</span><span className="value">{user?.email || "—"}</span></div>
        <div className="profile-row"><span className="label">Perfil</span><span className="value">{user?.role || "—"}</span></div>
        <div className="pt-4">
          <Button variant="outline" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" /> Sair</Button>
        </div>
      </div>
    </div>
  );
}