import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

// Função para decodificar JWT sem verificar assinatura
const decodeJWT = (token: string): any => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.log('Erro ao decodificar JWT:', error);
    return null;
  }
};

// Função para verificar se token está expirado
const isTokenExpired = (token: string): boolean => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};

// Função para obter tempo restante em minutos
const getTimeUntilExpiration = (token: string): number => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return 0;
  
  const currentTime = Math.floor(Date.now() / 1000);
  const timeLeft = decoded.exp - currentTime;
  return Math.max(0, Math.floor(timeLeft / 60)); // em minutos
};

export const useTokenChecker = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastWarningTime = useRef<number>(0);
  const hasShownFinalWarning = useRef<boolean>(false);

  const forceLogout = () => {
    console.log('🔑 useTokenChecker: Forçando logout por token expirado');
    
    // Limpar dados
    localStorage.removeItem('nobugOkrToken');
    localStorage.removeItem('nobugOkrRefreshToken');
    localStorage.removeItem('nobugOkrUser');
    
    // Toast final
    toast.error('🔒 Sessão Expirada - Redirecionando', {
      description: 'Sua sessão expirou. Redirecionando para login...',
      duration: 3000,
      position: 'top-center'
    });
    
    // Redirecionar
    setTimeout(() => {
      window.location.href = '/login';
    }, 1500);
  };

  const checkTokenStatus = () => {
    const token = localStorage.getItem('nobugOkrToken');
    
    if (!token) {
      // Sem token, parar verificação
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Verificar se token está expirado
    if (isTokenExpired(token)) {
      console.log('🔑 useTokenChecker: Token expirado detectado');
      forceLogout();
      return;
    }

    // Verificar tempo restante
    const minutesLeft = getTimeUntilExpiration(token);
    const currentTime = Date.now();
    
    console.log(`🕐 Token expira em ${minutesLeft} minutos`);

    // Avisar quando restam 10 minutos (apenas uma vez a cada 5 minutos)
    if (minutesLeft <= 10 && minutesLeft > 5) {
      if (currentTime - lastWarningTime.current > 300000) { // 5 minutos
        lastWarningTime.current = currentTime;
        
        toast.warning('⏰ Sessão Expirando em Breve', {
          description: `Sua sessão expira em ${minutesLeft} minutos. Considere salvar seu trabalho.`,
          duration: 8000,
          position: 'top-center'
        });
      }
    }

    // Aviso final quando restam 5 minutos ou menos
    if (minutesLeft <= 5 && minutesLeft > 0 && !hasShownFinalWarning.current) {
      hasShownFinalWarning.current = true;
      
      toast.error('🚨 Sessão Expirando AGORA!', {
        description: `Sua sessão expira em ${minutesLeft} minuto(s)! Salve seu trabalho e faça login novamente.`,
        duration: 12000,
        position: 'top-center',
        action: {
          label: '🔄 Renovar Agora',
          onClick: () => {
            window.location.reload(); // Força reload para tentar renovar
          }
        }
      });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('nobugOkrToken');
    
    if (token) {
      // Verificar imediatamente
      checkTokenStatus();
      
      // Verificar a cada 2 minutos
      intervalRef.current = setInterval(checkTokenStatus, 120000); // 2 minutos
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    checkTokenStatus
  };
}; 