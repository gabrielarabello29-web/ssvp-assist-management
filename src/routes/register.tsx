import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Heart, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { extractErrorMessage } from "@/lib/api";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

interface FormValues {
  nome: string;
  email: string;
  senha: string;
  confirmar: string;
  perfil: string;
}

function RegisterPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { nome: "", email: "", senha: "", confirmar: "", perfil: "VOLUNTARIO" },
  });

  useEffect(() => {
    if (isAuthenticated) navigate({ to: "/dashboard", replace: true });
  }, [isAuthenticated, navigate]);

  const senha = watch("senha");

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await authService.register({
        nome: values.nome,
        email: values.email,
        senha: values.senha,
        perfil: values.perfil,
      });
      toast.success("Cadastro realizado. Entrando...");
      try {
        await login(values.email, values.senha);
        navigate({ to: "/dashboard", replace: true });
      } catch {
        navigate({ to: "/login", replace: true });
      }
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
            Crie sua conta no painel vicentino
          </h2>
          <p className="mt-4 text-sm text-sidebar-muted">
            Cadastre-se para acompanhar assistidos, conferências e conselhos com
            agilidade e segurança.
          </p>
        </div>
        <p className="text-xs text-sidebar-muted">© SSVP — Painel Administrativo</p>
      </div>

      <div className="flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-2xl font-semibold text-foreground">Criar conta</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Preencha seus dados para começar.
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nome">Nome completo</Label>
              <Input
                id="nome"
                placeholder="Seu nome"
                {...register("nome", { required: "Informe o nome" })}
              />
              {errors.nome && (
                <p className="text-xs text-destructive">{errors.nome.message}</p>
              )}
            </div>
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
              <Label>Perfil</Label>
              <Controller
                control={control}
                name="perfil"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VOLUNTARIO">Voluntário</SelectItem>
                      <SelectItem value="GESTOR">Gestor</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="••••••••"
                {...register("senha", {
                  required: "Informe a senha",
                  minLength: { value: 6, message: "Mínimo de 6 caracteres" },
                })}
              />
              {errors.senha && (
                <p className="text-xs text-destructive">{errors.senha.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmar">Confirmar senha</Label>
              <Input
                id="confirmar"
                type="password"
                placeholder="••••••••"
                {...register("confirmar", {
                  required: "Confirme a senha",
                  validate: (v) => v === senha || "As senhas não conferem",
                })}
              />
              {errors.confirmar && (
                <p className="text-xs text-destructive">{errors.confirmar.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              <UserPlus className="mr-2 h-4 w-4" />
              {loading ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Já possui conta?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}