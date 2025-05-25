
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User } from '@/types/user';

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSave: (userId: string, data: { name: string; email: string; password?: string }) => void;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  open,
  onOpenChange,
  user,
  onSave,
}) => {
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Atualiza valores ao trocar de usuário
  React.useEffect(() => {
    setName(user?.name ?? '');
    setEmail(user?.email ?? '');
    setPassword('');
    setConfirmPassword('');
    setPasswordError('');
  }, [user]);

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords if a new password was provided
    if (password) {
      if (password.length < 6) {
        setPasswordError('A senha deve ter pelo menos 6 caracteres');
        return;
      }
      
      if (password !== confirmPassword) {
        setPasswordError('As senhas não coincidem');
        return;
      }
    }

    const userData = {
      name,
      email,
      ...(password ? { password } : {}), // Only include password if it was changed
    };

    onSave(user.id, userData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Altere os dados do membro da equipe.
            </DialogDescription>
          </DialogHeader>
          <div>
            <label htmlFor="edit-name" className="text-sm font-medium">
              Nome Completo
            </label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="edit-email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          
          <div className="border-t pt-3 mt-3">
            <h3 className="text-sm font-medium mb-2">Alterar senha</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="edit-password" className="text-sm font-medium">
                  Nova senha
                </label>
                <Input
                  id="edit-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="Deixe em branco para manter a senha atual"
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="edit-confirm-password" className="text-sm font-medium">
                  Confirmar senha
                </label>
                <Input
                  id="edit-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="Confirme a nova senha"
                  className="mt-1"
                />
              </div>
              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
