import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Lock, User as UserIcon, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Profile = () => {
  const { user, getCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar nome
      if (name.trim().length < 3) {
        toast.error("Nome deve ter pelo menos 3 caracteres.");
        return;
      }

      // Atualizar nome via API
      await api.put(`/api/users/${user.id}`, { name });
      
      // Atualizar dados locais
      await getCurrentUser();
      
      toast.success("Perfil atualizado com sucesso!");
      
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error(error.response?.data?.detail || "Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);

    try {
      // Validações
      if (!currentPassword) {
        toast.error("Senha atual é obrigatória");
        return;
      }

      if (password.length < 6) {
        toast.error("Nova senha deve ter pelo menos 6 caracteres");
        return;
      }

      if (password !== passwordConfirm) {
        toast.error("As senhas não coincidem");
        return;
      }

      // Chamar API para alterar senha
      await api.post("/api/auth/change-password", {
        current_password: currentPassword,
        new_password: password
      });

      // Limpar campos
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirm("");

      toast.success("Senha alterada com sucesso!");

    } catch (error: any) {
      console.error("Erro ao alterar senha:", error);
      toast.error(error.response?.data?.detail || "Erro ao alterar senha");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <UserIcon className="w-6 h-6 text-primary" /> Meu Perfil
      </h1>
      
      <div className="grid gap-6 max-w-2xl mx-auto">
        {/* Formulário de dados pessoais */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="profile-name" className="text-sm font-medium">
                  Nome
                </label>
                <div className="flex">
                  <UserIcon className="w-5 h-5 text-muted-foreground mr-2 self-center" />
                  <Input
                    id="profile-name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    autoComplete="name"
                    placeholder="Seu nome completo"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="profile-email" className="text-sm font-medium">
                  Email
                </label>
                <div className="flex">
                  <Mail className="w-5 h-5 text-muted-foreground mr-2 self-center" />
                  <Input
                    id="profile-email"
                    value={email}
                    disabled
                    type="email"
                    className="bg-muted"
                  />
                </div>
                <p className="text-xs text-muted-foreground">O email não pode ser alterado</p>
              </div>
              
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Salvar alterações"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Formulário de mudança de senha */}
        <Card>
          <CardHeader>
            <CardTitle>Alterar Senha</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="current-password" className="text-sm font-medium flex items-center gap-1">
                  <Lock className="w-4 h-4" /> Senha atual
                </label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Digite a senha atual"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="new-password" className="text-sm font-medium flex items-center gap-1">
                  <Lock className="w-4 h-4" /> Nova senha
                </label>
                <Input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Digite a nova senha"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="confirm-password" className="text-sm font-medium">
                  Confirme a nova senha
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordConfirm}
                  onChange={e => setPasswordConfirm(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Confirme a nova senha"
                />
              </div>
              
              <Button type="submit" disabled={passwordLoading} className="w-full">
                {passwordLoading ? "Alterando senha..." : "Alterar senha"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
