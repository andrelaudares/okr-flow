import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Eye, EyeOff, Loader2, Building, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Schema de validação
const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email inválido"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número"),
  cpf_cnpj: z
    .string()
    .min(1, "CPF ou CNPJ é obrigatório")
    .min(11, "CPF/CNPJ deve ter pelo menos 11 caracteres"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      cpf_cnpj: "",
    },
  });

  const formatCpfCnpj = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 11) {
      // Formato CPF: 000.000.000-00
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      // Formato CNPJ: 00.000.000/0000-00
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
      try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        cpf_cnpj: data.cpf_cnpj,
      });
      // O redirecionamento é feito automaticamente pelo hook useAuth
    } catch (error: any) {
      console.error("Register error:", error);
      // O erro já é tratado pelos interceptors da API
      // Mas vamos garantir uma mensagem amigável
      if (error.message) {
        toast.error(error.message);
      }
    }
  };

  const isFormLoading = isLoading || isSubmitting;

  return (
    <Card className="w-full max-w-md shadow-card">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Criar conta</CardTitle>
        <CardDescription className="text-center">
          Registre-se como proprietário da sua empresa
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
              Nome completo *
              </label>
              <div className="relative">
                <Input
                  id="name"
                  type="text"
                  placeholder="João da Silva"
                  {...register("name")}
                  className={`pl-10 ${errors.name ? "border-red-500" : ""}`}
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
            </div>

          <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
              E-mail *
              </label>
              <Input
                id="email"
                type="email"
                placeholder="nome@exemplo.com"
              {...register("email")}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="cpf_cnpj" className="text-sm font-medium">
              CPF ou CNPJ *
            </label>
            <div className="relative">
              <Input
                id="cpf_cnpj"
                type="text"
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                {...register("cpf_cnpj")}
                className={`pl-10 ${errors.cpf_cnpj ? "border-red-500" : ""}`}
                onChange={(e) => {
                  const formatted = formatCpfCnpj(e.target.value);
                  e.target.value = formatted;
                }}
              />
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            {errors.cpf_cnpj && (
              <p className="text-sm text-red-500">{errors.cpf_cnpj.message}</p>
            )}
          </div>

          <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
              Senha *
              </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                className={`pr-10 ${errors.password ? "border-red-500" : ""}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
            <p className="text-xs text-gray-500">
              A senha deve conter pelo menos 6 caracteres, incluindo 1 letra minúscula, 1 maiúscula e 1 número.
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={isFormLoading} 
            className="w-full"
          >
            {isFormLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registrando...
              </>
            ) : (
              "Criar conta de proprietário"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="link" onClick={() => navigate("/login")}>
          Já tem uma conta? Entrar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RegisterForm;
