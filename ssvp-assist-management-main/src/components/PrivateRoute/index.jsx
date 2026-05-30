import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext.jsx";

export default function PrivateRoute({ children, roles }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Carregando...
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (roles && roles.length && !roles.includes(user.role)) {
    const fallback = user.role === "GESTOR" ? "/gestor/dashboard" : "/voluntario/dashboard";
    return <Navigate to={fallback} replace />;
  }
  return children;
}