import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext.jsx";
import "./style.css";

export default function Header({ onMenuClick }) {
  const { user } = useAuth();
  const initials = (user?.nome || user?.email || "U")
    .split(/[\s@.]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("") || "U";

  return (
    <header className="app-header">
      <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
        <Menu className="h-5 w-5" />
      </Button>
      <div className="hidden lg:block" />
      <div className="app-header-user">
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">{user?.nome || user?.email || "Usuário"}</p>
          <p className="text-xs text-muted-foreground">{user?.role}</p>
        </div>
        <div className="app-header-avatar">{initials}</div>
      </div>
    </header>
  );
}