import React, { useState } from 'react';
import { Flag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const ResetConfirmation = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("As senhas não correspondem");
      return;
    }
    
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // TODO: Implementar confirmação de reset de senha com a nova API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Funcionalidade em desenvolvimento. Entre em contato com o administrador.");
      navigate("/login");
    } catch (error: any) {
      toast.error("Erro ao redefinir a senha");
      console.error("Error in password reset confirmation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md mb-8 animate-fade-in">
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-full bg-gradient-to-br from-nobug-600 to-nobug-400 p-2 flex items-center justify-center shadow-lg">
              <Flag className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-nobug-600 to-nobug-500 bg-clip-text text-transparent mb-2">NOBUG OKRs</h1>
          <p className="text-center text-gray-500">Defina sua nova senha</p>
        </div>
      </div>
      <div className="w-full max-w-md">
        <Card className="w-full max-w-md shadow-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Nova senha</CardTitle>
            <CardDescription className="text-center">
              Funcionalidade em desenvolvimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-500">
                Esta funcionalidade está em desenvolvimento. 
                Por favor, entre em contato com o administrador do sistema.
              </p>
              <Button 
                onClick={() => navigate("/login")} 
                className="w-full"
              >
                Voltar para o login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetConfirmation;
