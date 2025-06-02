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
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { useUsers } from '@/hooks/use-users';
import type { Meta, CreateMetaData, UpdateMetaData } from '@/types/key-results';

interface MetaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keyResult?: Meta | null;
  onSubmit: (data: CreateMetaData | UpdateMetaData) => Promise<void>;
  isLoading?: boolean;
}

export type KeyResultFormProps = MetaFormProps;

const unitOptions = [
  { value: 'PERCENTAGE', label: 'Porcentagem (%)', example: 'Ex: 85%' },
  { value: 'NUMBER', label: 'Número', example: 'Ex: 1000 usuários' },
  { value: 'CURRENCY', label: 'Moeda (R$)', example: 'Ex: R$ 50.000' },
];

const MetaForm: React.FC<MetaFormProps> = ({
  open,
  onOpenChange,
  keyResult,
  onSubmit,
  isLoading = false,
}) => {
  const { users } = useUsers();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_value: 100,
    start_value: 0,
    current_value: 0,
    unit: 'PERCENTAGE' as 'PERCENTAGE' | 'NUMBER' | 'CURRENCY' | 'BINARY',
    confidence_level: 0.8,
    owner_id: '',
    due_date: '',
  });

  const isEditing = !!keyResult;

  // Reset form when dialog opens/closes or keyResult changes
  useEffect(() => {
    if (open) {
      if (keyResult) {
        // Editing mode
        setFormData({
          title: keyResult.title,
          description: keyResult.description || '',
          target_value: keyResult.target_value,
          start_value: keyResult.start_value,
          current_value: keyResult.current_value,
          unit: keyResult.unit,
          confidence_level: keyResult.confidence_level || 0.8,
          owner_id: keyResult.owner_id || '',
          due_date: keyResult.due_date || '',
        });
      } else {
        // Creating mode
        setFormData({
          title: '',
          description: '',
          target_value: 100,
          start_value: 0,
          current_value: 0,
          unit: 'PERCENTAGE',
          confidence_level: 0.8,
          owner_id: '',
          due_date: '',
        });
      }
    }
  }, [open, keyResult]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    if (formData.target_value <= 0) {
      toast.error('Valor meta deve ser maior que zero');
      return;
    }

    if (formData.unit === 'PERCENTAGE' && formData.target_value > 100) {
      toast.error('Para porcentagem, o valor meta não pode ser maior que 100%');
      return;
    }

    try {
      if (isEditing) {
        // Update Meta
        const updateData: UpdateMetaData = {
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          target_value: formData.target_value,
          current_value: formData.current_value,
          confidence_level: formData.confidence_level,
          owner_id: formData.owner_id === 'none' ? undefined : formData.owner_id || undefined,
          due_date: formData.due_date,
        };
        await onSubmit(updateData);
      } else {
        // Create Meta
        const createData: CreateMetaData = {
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          target_value: formData.target_value,
          unit: formData.unit,
          start_value: formData.start_value,
          current_value: formData.current_value,
          confidence_level: formData.confidence_level,
          owner_id: formData.owner_id === 'none' ? undefined : formData.owner_id || undefined,
          due_date: formData.due_date,
        };
        await onSubmit(createData);
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar Meta:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const getUnitLabel = (unit: string) => {
    const option = unitOptions.find(opt => opt.value === unit);
    return option?.label || unit;
  };

  const getMaxValue = () => {
    switch (formData.unit) {
      case 'PERCENTAGE':
        return 100;
      default:
        return 999999;
    }
  };

  const getStep = () => {
    switch (formData.unit) {
      case 'PERCENTAGE':
        return 0.01;
      case 'CURRENCY':
        return 0.01;
      default:
        return 0.01;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Meta' : 'Nova Meta'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Atualize as informações da Meta.'
              : 'Crie uma nova Meta para medir o progresso do objetivo.'
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
              placeholder="Ex: Aumentar conversão de vendas"
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
              placeholder="Descreva como este resultado será medido..."
              rows={3}
            />
          </div>

          {/* Unidade - apenas na criação */}
          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="unit">Tipo de Medição *</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => handleInputChange('unit', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {unitOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.example}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Valores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Valor Inicial - apenas na criação */}
            {!isEditing && (
              <div className="space-y-2">
                <Label htmlFor="start_value">Valor Inicial</Label>
                <Input
                  id="start_value"
                  type="number"
                  value={formData.start_value}
                  onChange={(e) => handleInputChange('start_value', Number(e.target.value))}
                  min={0}
                  max={getMaxValue()}
                  step={getStep()}
                />
                <p className="text-xs text-gray-500">
                  Valor no início ({getUnitLabel(formData.unit)})
                </p>
              </div>
            )}

            {/* Valor Atual */}
            <div className="space-y-2">
              <Label htmlFor="current_value">Valor Atual</Label>
              <Input
                id="current_value"
                type="number"
                value={formData.current_value}
                onChange={(e) => handleInputChange('current_value', Number(e.target.value))}
                min={0}
                max={getMaxValue()}
                step={getStep()}
              />
              <p className="text-xs text-gray-500">
                Valor atual ({getUnitLabel(formData.unit)})
              </p>
            </div>

            {/* Valor Meta */}
            <div className="space-y-2">
              <Label htmlFor="target_value">Valor Meta *</Label>
              <Input
                id="target_value"
                type="number"
                value={formData.target_value}
                onChange={(e) => handleInputChange('target_value', Number(e.target.value))}
                min={0.01}
                max={getMaxValue()}
                step={getStep()}
                required
                disabled={isEditing} // Meta não pode ser alterada na edição
              />
              <p className="text-xs text-gray-500">
                Meta a atingir ({getUnitLabel(formData.unit)})
              </p>
            </div>
          </div>

          {/* Nível de Confiança */}
          <div className="space-y-2">
            <Label htmlFor="confidence_level">
              Nível de Confiança: {Math.round(formData.confidence_level * 100)}%
            </Label>
            <Slider
              value={[formData.confidence_level]}
              onValueChange={(value) => handleInputChange('confidence_level', value[0])}
              max={1}
              min={0}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Quão confiante você está de que este resultado será alcançado?
            </p>
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

          {/* Prazo */}
          <div className="space-y-2">
            <Label htmlFor="due_date">Prazo</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => handleInputChange('due_date', e.target.value)}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading 
                ? (isEditing ? 'Salvando...' : 'Criando...') 
                : (isEditing ? 'Salvar Alterações' : 'Criar Meta')
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

// Manter compatibilidade com nome antigo
export const KeyResultForm = MetaForm;

export default MetaForm; 