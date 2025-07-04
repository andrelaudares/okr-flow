import { useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export interface ResetPasswordRequest {
  email: string;
}

export interface UpdatePasswordRequest {
  access_token: string;
  refresh_token: string;
  new_password: string;
}

export const useResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const clearMessages = () => {
    setMessage('');
    setError('');
  };

  const requestReset = async (email: string) => {
    if (!email) {
      setError('Email é obrigatório');
      return false;
    }

    setIsLoading(true);
    clearMessages();

    try {
      const response = await api.post('/api/auth/reset-password', { email });
      
      setMessage(response.data.message);
      toast.success('Email de reset enviado com sucesso!');
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Erro ao solicitar reset de senha';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (data: UpdatePasswordRequest) => {
    if (!data.new_password) {
      setError('Nova senha é obrigatória');
      return false;
    }

    if (data.new_password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    setIsLoading(true);
    clearMessages();

    try {
      const response = await api.post('/api/auth/update-password', data);
      
      setMessage('Senha atualizada com sucesso!');
      toast.success('Senha atualizada com sucesso!');
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Erro ao atualizar senha';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    message,
    error,
    clearMessages,
    requestReset,
    updatePassword
  };
}; 