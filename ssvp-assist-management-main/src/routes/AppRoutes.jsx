import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "@/components/PrivateRoute/index.jsx";
import Login from "@/pages/Login/index.jsx";
import GestorLayout from "@/pages/gestor/Layout.jsx";
import VoluntarioLayout from "@/pages/voluntario/Layout.jsx";
import { useAuth } from "@/context/AuthContext.jsx";

import GestorDashboard from "@/pages/gestor/Dashboard/index.jsx";
import GestorAssistidos from "@/pages/gestor/Assistidos/index.jsx";
import GestorAssistidoForm from "@/pages/gestor/AssistidoForm/index.jsx";
import GestorConferencias from "@/pages/gestor/Conferencias/index.jsx";
import GestorConselhos from "@/pages/gestor/Conselhos/index.jsx";
import GestorUsuarios from "@/pages/gestor/Usuarios/index.jsx";

import VoluntarioDashboard from "@/pages/voluntario/Dashboard/index.jsx";
import VoluntarioAssistidos from "@/pages/voluntario/Assistidos/index.jsx";
import VoluntarioPerfil from "@/pages/voluntario/Perfil/index.jsx";

function HomeRedirect() {
  const { isAuthenticated, isGestor, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={isGestor ? "/gestor/dashboard" : "/voluntario/dashboard"} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/gestor"
        element={
          <PrivateRoute roles={["GESTOR"]}>
            <GestorLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<GestorDashboard />} />
        <Route path="assistidos" element={<GestorAssistidos />} />
        <Route path="assistidos/novo" element={<GestorAssistidoForm mode="create" />} />
        <Route path="assistidos/editar/:id" element={<GestorAssistidoForm mode="edit" />} />
        <Route path="conferencias" element={<GestorConferencias />} />
        <Route path="conselhos" element={<GestorConselhos />} />
        <Route path="usuarios" element={<GestorUsuarios />} />
      </Route>

      <Route
        path="/voluntario"
        element={
          <PrivateRoute roles={["VOLUNTARIO"]}>
            <VoluntarioLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<VoluntarioDashboard />} />
        <Route path="assistidos" element={<VoluntarioAssistidos />} />
        <Route path="perfil" element={<VoluntarioPerfil />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}