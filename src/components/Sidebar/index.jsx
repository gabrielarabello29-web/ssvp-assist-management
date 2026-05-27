import { NavLink, useNavigate } from "react-router-dom";
import { Heart, LogOut, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext.jsx";
import "./style.css";

export default function Sidebar({ items, open, onClose, title = "SSVP", subtitle = "Painel" }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${open ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand"><Heart className="h-5 w-5" /></div>
          <div className="leading-tight flex-1">
            <p className="text-sm font-semibold text-white">{title}</p>
            <p className="text-[11px] opacity-60">{subtitle}</p>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-300" aria-label="Fechar">
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="sidebar-nav">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="sidebar-link w-full">
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>
    </>
  );
}