import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { authService } from "@/services/auth.js";
import { extractErrorMessage } from "@/services/api.js";

export default function GestorUsuarios() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nome: "",
      email: "",
      senha: "",
      perfil: "VOLUNTARIO",
    },
  });

  const onSubmit = async (values) => {
    try {
      await authService.register(values);

      toast.success("Usuário criado com sucesso");

      reset();
    } catch (e) {
      toast.error(extractErrorMessage(e));
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Usuários</h1>
          <p className="page-subtitle">
            Cadastro de usuários do sistema.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-lg border p-6 bg-card"
      >
        <div>
          <Label>Nome</Label>

          <Input
            {...register("nome", {
              required: "Informe o nome",
            })}
          />

          {errors.nome && (
            <p className="text-xs text-destructive">
              {errors.nome.message}
            </p>
          )}
        </div>

        <div>
          <Label>E-mail</Label>

          <Input
            type="email"
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

        <div>
          <Label>Senha</Label>

          <Input
            type="password"
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

        <div>
          <Label>Perfil</Label>

          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
            {...register("perfil")}
          >
            <option value="VOLUNTARIO">
              Voluntário
            </option>

            <option value="GESTOR">
              Gestor
            </option>
          </select>
        </div>

        <Button type="submit">
          <UserPlus className="mr-2 h-4 w-4" />
          Criar Usuário
        </Button>
      </form>
    </div>
  );
}