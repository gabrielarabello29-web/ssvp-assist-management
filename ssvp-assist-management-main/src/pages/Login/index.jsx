import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Heart, LogIn } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAuth } from "@/context/AuthContext.jsx";
import { extractErrorMessage } from "@/services/api.js";

import "./style.css";

export default function Login() {
  const { login, isAuthenticated, isGestor } = useAuth();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      senha: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate(
        isGestor
          ? "/gestor/dashboard"
          : "/voluntario/dashboard",
        { replace: true }
      );
    }
  }, [isAuthenticated, isGestor, navigate]);

  const onSubmitLogin = async (values) => {
    setLoading(true);

    try {
      const u = await login(
        values.email,
        values.senha
      );

      toast.success("Login realizado com sucesso");

      navigate(
        u?.role === "GESTOR"
          ? "/gestor/dashboard"
          : "/voluntario/dashboard",
        { replace: true }
      );
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-brand">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Heart className="h-6 w-6" />
          </div>

          <div>
            <p className="text-lg font-semibold">
              SSVP
            </p>

            <p className="text-sm opacity-70">
              Sociedade São Vicente de Paulo
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-semibold leading-tight">
            Gerenciamento de Assistidos,
            Conferências e Conselhos
          </h2>

          <p className="mt-4 text-sm opacity-70">
            Plataforma institucional para
            coordenar o trabalho vicentino com
            agilidade e cuidado.
          </p>
        </div>

        <p className="text-xs opacity-60">
          © SSVP — Painel Administrativo
        </p>
      </div>

      <div className="login-form-wrap">
        <div className="login-card">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground">
              Entrar
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Acesse o painel com suas
              credenciais.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmitLogin)}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="email-login">
                E-mail
              </Label>

              <Input
                id="email-login"
                type="email"
                placeholder="voce@ssvp.org.br"
                {...register("email", {
                  required: "Informe o e-mail",
                })}
              />

              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="senha-login">
                Senha
              </Label>

              <Input
                id="senha-login"
                type="password"
                placeholder="••••••••"
                {...register("senha", {
                  required: "Informe a senha",
                })}
              />

              {errors.senha && (
                <p className="text-xs text-destructive">
                  {errors.senha.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              <LogIn className="mr-2 h-4 w-4" />

              {loading
                ? "Entrando..."
                : "Entrar"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Backend esperado em{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">
              http://localhost:8080
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}