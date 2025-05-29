import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useUsers } from '@/hooks/use-users';
import type { Objective, CreateObjectiveData, UpdateObjectiveData } from '@/types/objectives';

interface ObjectiveFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  objective?: Objective | null;
  onSubmit: (data: CreateObjectiveData | UpdateObjectiveData) => Promise<void>;
  isLoading?: boolean;
}

const ObjectiveForm: React.FC<ObjectiveFormProps> = ({
  open,
  onOpenChange,
  objective,
  onSubmit,
  isLoading = false,
}) => {
  const { users } = useUsers();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    owner_id: '',
    status: 'PLANNED' as 'PLANNED' | 'ON_TRACK' | 'AT_RISK' | 'BEHIND' | 'COMPLETED',
  });

  const isEditing = !!objective;

  // Reset form when dialog opens/closes or objective changes
  useEffect(() => {
    if (open) {
      if (objective) {
        // Editing mode
        setFormData({
          title: objective.title,
          description: objective.description || '',
          owner_id: objective.owner_id || '',
          status: objective.status,
        });
      } else {
        // Creating mode
        setFormData({
          title: '',
          description: '',
          owner_id: '',
          status: 'PLANNED',
        });
      }
    }
  }, [open, objective]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    try {
      if (isEditing) {
        // Update objective
        const updateData: UpdateObjectiveData = {
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          status: formData.status,
        };
        await onSubmit(updateData);
      } else {
        // Create objective - sem cycle_id
        const submitData = {
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          owner_id: formData.owner_id === 'none' ? undefined : formData.owner_id || undefined,
        };
        await onSubmit(submitData);
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar objetivo:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Objetivo' : 'Novo Objetivo'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Atualize as informações do objetivo.'
              : 'Crie um novo objetivo para acompanhar o progresso da sua equipe.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Ex: Aumentar satisfação do cliente"
              required
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descreva o objetivo em detalhes..."
              rows={3}
            />
          </div>

          {/* Responsável */}
          <div className="space-y-2">
            <Label htmlFor="owner_id">Responsável</Label>
            <Select
              value={formData.owner_id}
              onValueChange={(value) => handleInputChange('owner_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um responsável (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem responsável específico</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status - apenas na edição */}
          {isEditing && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANNED">Planejado</SelectItem>
                  <SelectItem value="ON_TRACK">No Prazo</SelectItem>
                  <SelectItem value="AT_RISK">Em Risco</SelectItem>
                  <SelectItem value="BEHIND">Atrasado</SelectItem>
                  <SelectItem value="COMPLETED">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading 
                ? (isEditing ? 'Salvando...' : 'Criando...') 
                : (isEditing ? 'Salvar Alterações' : 'Criar Objetivo')
              }
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ObjectiveForm; 