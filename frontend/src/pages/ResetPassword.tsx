import React, { useState } from 'react';
import { Flag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // TODO: Implementar reset de senha com a nova API
      // Por enquanto, apenas simula o envio
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Funcionalidade em desenvolvimento. Entre em contato com o administrador.");
      setResetSent(true);
    } catch (error: any) {
      toast.error("Erro ao enviar email de redefinição");
      console.error("Error in password reset:", error);
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
          <p className="text-center text-gray-500">Recupere sua senha</p>
        </div>
      </div>
      <div className="w-full max-w-md">
        <Card className="w-full max-w-md shadow-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Recuperar senha</CardTitle>
            <CardDescription className="text-center">
              {resetSent 
                ? "Funcionalidade em desenvolvimento" 
                : "Insira seu email para receber instruções de recuperação"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resetSent ? (
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
            ) : (
              <form onSubmit={handleResetPassword}>
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
                  <Button disabled={isLoading} className="w-full">
                    {isLoading ? "Enviando..." : "Enviar instruções"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
          {!resetSent && (
            <CardFooter className="flex justify-center">
              <Link to="/login" className="text-sm text-nobug-600 hover:underline">
                Voltar para o login
              </Link>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
