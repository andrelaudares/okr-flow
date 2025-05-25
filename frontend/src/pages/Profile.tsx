
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Lock, User as UserIcon, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useObjectives } from "@/hooks/use-objectives";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface UpdatedUser {
  id: string;
  name: string;
  email: string;
  password?: string;
}

const Profile = () => {
  const { user, login } = useAuth();
  const { toast } = useToast();
  const { updateAssigneeNames } = useObjectives();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [originalName, setOriginalName] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setOriginalName(user.name || "");
    }
  }, [user]);

  if (!user) {
    // Redirect to login if not authenticated
    navigate("/login");
    return null;
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate name
    if (name.trim().length < 3) {
      toast({ 
        title: "Nome deve ter pelo menos 3 caracteres.", 
        variant: "destructive" 
      });
      setLoading(false);
      return;
    }

    const updatedUser: UpdatedUser = { 
      ...user, 
      name 
    };

    // Update assignee names if name changed
    if (originalName !== name) {
      updateAssigneeNames(originalName, name);
    }

    // Handle password update
    if (password) {
      if (password.length < 6) {
        toast({ 
          title: "Senha deve ter pelo menos 6 caracteres.", 
          variant: "destructive" 
        });
        setLoading(false);
        return;
      }
      if (password !== passwordConfirm) {
        toast({ 
          title: "As senhas não coincidem.", 
          variant: "destructive" 
        });
        setLoading(false);
        return;
      }
      // Update password in user object (for demo purposes)
      updatedUser.password = password;
    }
    
    // Save to localStorage
    localStorage.setItem("nobugOkrUser", JSON.stringify(updatedUser));
    
    // Atualiza o estado de autenticação com o usuário atualizado
    login(updatedUser);
    
    setOriginalName(name); // Update original name after save

    // Reset password fields
    setPassword("");
    setPasswordConfirm("");

    toast({ 
      title: "Perfil atualizado com sucesso!" 
    });
    setLoading(false);
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <UserIcon className="w-6 h-6 text-primary" /> Meu Perfil
      </h1>
      
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
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
            
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-4">Alterar senha</h3>
              <div className="space-y-4">
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
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
