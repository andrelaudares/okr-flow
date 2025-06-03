import { useEffect, useRef } from 'react';
import { api, showWarningToast } from '@/lib/api';

interface TokenStatus {
  valid: boolean;
  expired: boolean;
  expires_soon?: boolean;
  expires_in_minutes?: number;
  message: string;
}

export const useTokenMonitor = () => {
  const lastWarningRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkTokenStatus = async (): Promise<TokenStatus | null> => {
    try {
      const response = await api.get('/auth/token-status');
      return response.data;
    } catch (error) {
      console.log('Erro ao verificar status do token:', error);
      return null;
    }
  };

  const showExpirationWarning = (expiresInMinutes: number) => {
    const currentTime = Date.now();
    const timeSinceLastWarning = currentTime - lastWarningRef.current;
    
    // Mostrar aviso apenas a cada 5 minutos para não spammar
    if (timeSinceLastWarning < 300000) { // 5 minutos
      return;
    }

    lastWarningRef.current = currentTime;

    if (expiresInMinutes <= 5) {
      showWarningToast(
        'Sessão Expirando!', 
        `Sua sessão expira em ${Math.max(1, Math.round(expiresInMinutes))} minuto(s). Salve seu trabalho e faça login novamente em breve.`
      );
    } else if (expiresInMinutes <= 10) {
      showWarningToast(
        'Sessão Expirando em Breve', 
        `Sua sessão expira em ${Math.round(expiresInMinutes)} minutos. Considere fazer login novamente em breve.`
      );
    }
  };

  useEffect(() => {
    const startMonitoring = () => {
      // Verificar a cada 3 minutos
      intervalRef.current = setInterval(async () => {
        const status = await checkTokenStatus();
        
        if (status?.expires_soon && status.expires_in_minutes !== undefined) {
          showExpirationWarning(status.expires_in_minutes);
        }
      }, 180000); // 3 minutos
    };

    // Verificação inicial após 1 minuto
    const initialTimeout = setTimeout(() => {
      checkTokenStatus().then(status => {
        if (status?.expires_soon && status.expires_in_minutes !== undefined) {
          showExpirationWarning(status.expires_in_minutes);
        }
      });
      
      startMonitoring();
    }, 60000); // 1 minuto

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      clearTimeout(initialTimeout);
    };
  }, []);

  return {
    checkTokenStatus,
  };
}; 