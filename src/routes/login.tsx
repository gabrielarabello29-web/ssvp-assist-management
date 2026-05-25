import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Heart, LogIn } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { extractErrorMessage } from "@/lib/api";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

interface FormValues {
  email: string;
  senha: string;
}

function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { email: "", senha: "" } });

  useEffect(() => {
    if (isAuthenticated) navigate({ to: "/dashboard", replace: true });
  }, [isAuthenticated, navigate]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await login(values.email, values.senha);
      toast.success("Login realizado com sucesso");
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-sidebar-bg p-12 text-sidebar-fg lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Heart className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-semibold">SSVP</p>
            <p className="text-sm text-sidebar-muted">Sociedade São Vicente de Paulo</p>
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-semibold leading-tight">
            Gerenciamento de Assistidos, Conferências e Conselhos
          </h2>
          <p className="mt-4 text-sm text-sidebar-muted">
            Plataforma institucional para coordenar o trabalho vicentino com
            agilidade, transparência e cuidado.
          </p>
        </div>
        <p className="text-xs text-sidebar-muted">© SSVP — Painel Administrativo</p>
      </div>

      <div className="flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-2xl font-semibold text-foreground">Entrar</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Acesse o painel com suas credenciais.
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="voce@ssvp.org.br"
                {...register("email", { required: "Informe o e-mail" })}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="••••••••"
                {...register("senha", { required: "Informe a senha" })}
              />
              {errors.senha && (
                <p className="text-xs text-destructive">{errors.senha.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              <LogIn className="mr-2 h-4 w-4" />
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Backend esperado em <code className="rounded bg-muted px-1.5 py-0.5">http://localhost:8080</code>
          </p>
        </div>
      </div>
    </div>
  );
}