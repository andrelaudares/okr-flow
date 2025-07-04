import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Flag, ArrowLeft, Eye, EyeOff, Lock, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { useResetPassword } from '@/hooks/use-reset-password';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isLoading, message, error, requestReset, updatePassword } = useResetPassword();
  
  // Verificar se é um reset via token (usuário clicou no email)
  // Tokens podem vir via query params (?access_token=...) ou hash (#access_token=...)
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [tokenType, setTokenType] = useState<string | null>(null);
  
  useEffect(() => {
    // Tentar capturar tokens dos query params primeiro
    let token = searchParams.get('access_token');
    let refresh = searchParams.get('refresh_token');
    let type = searchParams.get('type');
    
    // Se não encontrou nos query params, tentar no hash
    if (!token || !refresh) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      token = hashParams.get('access_token');
      refresh = hashParams.get('refresh_token');
      type = hashParams.get('type');
    }
    
    if (token && refresh) {
      setAccessToken(token);
      setRefreshToken(refresh);
      setTokenType(type);
      console.log('Tokens capturados:', { type, hasToken: !!token, hasRefresh: !!refresh });
    }
  }, [searchParams]);
  
  const isTokenReset = Boolean(accessToken && refreshToken);
  
  // Estados para o formulário
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Estados de UI
  const [success, setSuccess] = useState(false);

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Função para solicitar reset de senha
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await requestReset(email);
    if (success) {
      setSuccess(true);
    }
  };

  // Função para definir nova senha
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      return;
    }

    if (newPassword !== confirmPassword) {
      return;
    }

    if (!accessToken || !refreshToken) {
      return;
    }

    const success = await updatePassword({
      access_token: accessToken,
      refresh_token: refreshToken,
      new_password: newPassword
    });
    
    if (success) {
      setSuccess(true);
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
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
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-nobug-600 to-nobug-500 bg-clip-text text-transparent mb-2">
            NOBUG OKRs
          </h1>
          <p className="text-center text-gray-500">
            {isTokenReset ? 'Definir nova senha' : 'Recuperar senha'}
          </p>
        </div>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {isTokenReset ? 'Nova Senha' : 'Esqueceu sua senha?'}
          </CardTitle>
          <CardDescription>
            {isTokenReset 
              ? `Digite sua nova senha abaixo ${tokenType ? `(Tipo: ${tokenType})` : ''}`
              : 'Digite seu email para receber instruções de recuperação'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mensagens de sucesso/erro */}
          {message && (
            <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && !isTokenReset ? (
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <p className="text-sm text-gray-600">
                Verifique seu email para continuar com a recuperação da senha.
              </p>
            </div>
          ) : success && isTokenReset ? (
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <p className="text-sm text-gray-600">
                Senha atualizada! Redirecionando para o login...
              </p>
            </div>
          ) : (
            <form onSubmit={isTokenReset ? handleUpdatePassword : handleRequestReset} className="space-y-4">
              {!isTokenReset ? (
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu.email@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Digite sua nova senha"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirme sua nova senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Processando...' : isTokenReset ? 'Atualizar Senha' : 'Enviar Email'}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-sm text-nobug-600 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para o login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
