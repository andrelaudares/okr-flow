import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Clock, RefreshCw, LogIn } from 'lucide-react';

interface SessionExpiredModalProps {
  open: boolean;
  onLogin: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({
  open,
  onLogin,
  onRefresh,
  isRefreshing = false
}) => {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
            <Clock className="h-6 w-6 text-orange-600" />
          </div>
          <AlertDialogTitle className="text-xl font-semibold">
            Sessão Expirada
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-muted-foreground">
            Por segurança, sua sessão expirou. Você pode tentar renovar automaticamente ou fazer login novamente.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Renovando...' : 'Renovar Sessão'}
          </Button>
          
          <Button
            onClick={onLogin}
            className="flex items-center gap-2"
          >
            <LogIn className="h-4 w-4" />
            Fazer Login
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SessionExpiredModal; 