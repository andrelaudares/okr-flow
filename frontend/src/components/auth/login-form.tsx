import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useUsers } from "@/hooks/use-users";
import { supabase } from "@/integrations/supabase/client";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const { users, isAdmin } = useUsers();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // First try to find user in local users store
      const localUser = users.find(u => u.email === email && u.password === password);
      
      if (localUser) {
        console.log("Local auth successful for user:", localUser.email);
        
        // Check if user is active
        if (localUser.active === false) {
          throw new Error("Usuário inativo. Entre em contato com um administrador.");
        }

        // Login successful with local auth
        login({
          id: localUser.id,
          name: localUser.name,
          email: localUser.email,
        });
        
        toast.success("Login realizado com sucesso!");
        navigate("/dashboard");
        return;
      }
      
      // If not found locally, try Supabase authentication
      console.log("Attempting Supabase authentication for:", email);
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (authError) {
        console.error("Supabase auth error:", authError);
        throw new Error("Credenciais inválidas. Verifique seu email e senha.");
      } 
      
      if (authData.session) {
        const userData = {
          id: authData.user?.id || '',
          name: authData.user?.user_metadata?.name || '',
          email: authData.user?.email || '',
        };
        
        console.log("Supabase auth successful for user:", userData.email);
        
        login(userData);
        
        toast.success("Login realizado com sucesso!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Falha no login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-card">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
        <CardDescription className="text-center">
          Entre com suas credenciais para acessar o sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                E-mail
              </label>
              <Input
                id="email"
                type="email"
                placeholder="nome@exemplo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Senha
                </label>
                <Link 
                  to="/reset-password" 
                  className="text-sm text-nobug-600 hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button disabled={isLoading} className="w-full">
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="link" onClick={() => navigate("/register")}>
          Não tem uma conta? Cadastre-se
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
