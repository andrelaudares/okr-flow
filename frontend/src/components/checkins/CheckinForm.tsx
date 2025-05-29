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
import type { 
  Checkin, 
  CreateCheckinData, 
  UpdateCheckinData,
  KeyResult,
  UpdateKeyResultData
} from '@/types/key-results';

interface CheckinFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keyResult: KeyResult;
  checkin?: Checkin | null;
  onSubmitCheckin: (data: CreateCheckinData | UpdateCheckinData) => Promise<void>;
  onUpdateKeyResult?: (data: UpdateKeyResultData) => Promise<void>;
  isLoading?: boolean;
}

const formatValue = (value: number, unit: string) => {
  switch (unit) {
    case 'PERCENTAGE':
      return `${value}%`;
    case 'CURRENCY':
      return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      }).format(value);
    case 'BINARY':
      return value === 1 ? 'Sim' : 'Não';
    default:
      return value.toString();
  }
};

const getMaxValue = (unit: string) => {
  switch (unit) {
    case 'PERCENTAGE':
      return 100;
    case 'BINARY':
      return 1;
    default:
      return 999999;
  }
};

const getStep = (unit: string) => {
  switch (unit) {
    case 'PERCENTAGE':
      return 0.01;
    case 'BINARY':
      return 1;
    case 'CURRENCY':
      return 0.01;
    default:
      return 0.01;
  }
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'PLANNED':
      return { 
        label: 'Planejado', 
        color: 'text-gray-800 bg-gray-100 border-gray-200',
        selectColor: 'text-gray-700'
      };
    case 'ON_TRACK':
      return { 
        label: 'No Prazo', 
        color: 'text-green-800 bg-green-100 border-green-200',
        selectColor: 'text-green-700'
      };
    case 'AT_RISK':
      return { 
        label: 'Em Risco', 
        color: 'text-yellow-800 bg-yellow-100 border-yellow-200',
        selectColor: 'text-yellow-700'
      };
    case 'BEHIND':
      return { 
        label: 'Atrasado', 
        color: 'text-red-800 bg-red-100 border-red-200',
        selectColor: 'text-red-700'
      };
    case 'COMPLETED':
      return { 
        label: 'Concluído', 
        color: 'text-blue-800 bg-blue-100 border-blue-200',
        selectColor: 'text-blue-700'
      };
    default:
      return { 
        label: status, 
        color: 'text-gray-800 bg-gray-100 border-gray-200',
        selectColor: 'text-gray-700'
      };
  }
};

const CheckinForm: React.FC<CheckinFormProps> = ({
  open,
  onOpenChange,
  keyResult,
  checkin,
  onSubmitCheckin,
  onUpdateKeyResult,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    value_at_checkin: keyResult.current_value,
    confidence_level_at_checkin: 0.8,
    notes: '',
    // Campos para atualizar a Key Result
    new_status: keyResult.status,
    update_key_result: false,
  });

  const isEditing = !!checkin;

  // Reset form when dialog opens/closes or checkin changes
  useEffect(() => {
    if (open) {
      if (checkin) {
        // Editing mode
        setFormData({
          value_at_checkin: checkin.value_at_checkin,
          confidence_level_at_checkin: checkin.confidence_level_at_checkin || 0.8,
          notes: checkin.notes || '',
          new_status: keyResult.status,
          update_key_result: false,
        });
      } else {
        // Creating mode
        setFormData({
          value_at_checkin: keyResult.current_value,
          confidence_level_at_checkin: 0.8,
          notes: '',
          new_status: keyResult.status,
          update_key_result: false,
        });
      }
    }
  }, [open, checkin, keyResult]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.value_at_checkin < 0) {
      toast.error('Valor não pode ser negativo');
      return;
    }

    if (keyResult.unit === 'BINARY' && (formData.value_at_checkin !== 0 && formData.value_at_checkin !== 1)) {
      toast.error('Para tipo Sim/Não, o valor deve ser 0 ou 1');
      return;
    }

    if (keyResult.unit === 'PERCENTAGE' && formData.value_at_checkin > 100) {
      toast.error('Para porcentagem, o valor não pode ser maior que 100%');
      return;
    }

    try {
      // Submeter check-in
      if (isEditing) {
        const updateData: UpdateCheckinData = {
          value_at_checkin: formData.value_at_checkin,
          confidence_level_at_checkin: formData.confidence_level_at_checkin,
          notes: formData.notes.trim() || undefined,
        };
        await onSubmitCheckin(updateData);
      } else {
        const createData: CreateCheckinData = {
          value_at_checkin: formData.value_at_checkin,
          confidence_level_at_checkin: formData.confidence_level_at_checkin,
          notes: formData.notes.trim() || undefined,
        };
        await onSubmitCheckin(createData);
      }

      // Atualizar Key Result se necessário
      if (formData.update_key_result && onUpdateKeyResult) {
        const keyResultUpdate: UpdateKeyResultData = {
          current_value: formData.value_at_checkin,
          confidence_level: formData.confidence_level_at_checkin,
        };

        // Adicionar status se mudou
        if (formData.new_status !== keyResult.status) {
          keyResultUpdate.status = formData.new_status as any;
        }

        await onUpdateKeyResult(keyResultUpdate);
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar check-in:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const progressPercentage = keyResult.target_value > 0 
    ? Math.min(100, (formData.value_at_checkin / keyResult.target_value) * 100)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Check-in' : 'Novo Check-in'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Atualize as informações do check-in.'
              : `Registre o progresso atual para "${keyResult.title}".`
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informações da Key Result */}
          <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">{keyResult.title}</h4>
              <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusConfig(keyResult.status).color}`}>
                {getStatusConfig(keyResult.status).label}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center p-2 bg-white rounded border">
                <span className="text-gray-500 block mb-1">Inicial</span>
                <div className="font-semibold text-gray-700">{formatValue(keyResult.start_value, keyResult.unit)}</div>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded border border-blue-200">
                <span className="text-blue-600 block mb-1">Atual</span>
                <div className="font-semibold text-blue-700">{formatValue(keyResult.current_value, keyResult.unit)}</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded border border-green-200">
                <span className="text-green-600 block mb-1">Meta</span>
                <div className="font-semibold text-green-700">{formatValue(keyResult.target_value, keyResult.unit)}</div>
              </div>
            </div>
          </div>

          {/* Valor do Check-in */}
          <div className="space-y-2">
            <Label htmlFor="value_at_checkin">Valor Atual *</Label>
            <Input
              id="value_at_checkin"
              type="number"
              value={formData.value_at_checkin}
              onChange={(e) => handleInputChange('value_at_checkin', Number(e.target.value))}
              min={0}
              max={getMaxValue(keyResult.unit)}
              step={getStep(keyResult.unit)}
              required
            />
            <div className="text-xs text-gray-500">
              Progresso: {Math.round(progressPercentage)}% da meta
            </div>
          </div>

          {/* Nível de Confiança */}
          <div className="space-y-2">
            <Label htmlFor="confidence_level">
              Nível de Confiança: {Math.round(formData.confidence_level_at_checkin * 100)}%
            </Label>
            <Slider
              value={[formData.confidence_level_at_checkin]}
              onValueChange={(value) => handleInputChange('confidence_level_at_checkin', value[0])}
              max={1}
              min={0}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Quão confiante você está sobre este progresso?
            </p>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Descreva o que foi feito, obstáculos encontrados, próximos passos..."
              rows={3}
            />
          </div>

          {/* Atualizar Key Result */}
          <div className="space-y-3 p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="update_key_result"
                checked={formData.update_key_result}
                onChange={(e) => handleInputChange('update_key_result', e.target.checked)}
                className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="update_key_result" className="text-sm font-medium text-blue-900">
                Atualizar Key Result com estes dados
              </Label>
            </div>
            
            {formData.update_key_result && (
              <div className="space-y-3 mt-3 p-3 bg-white rounded border">
                <div className="flex items-center justify-between">
                  <Label htmlFor="new_status" className="text-sm font-medium">Status Atual</Label>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusConfig(keyResult.status).color}`}>
                    {getStatusConfig(keyResult.status).label}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new_status" className="text-sm font-medium">Novo Status</Label>
                  <Select
                    value={formData.new_status}
                    onValueChange={(value) => handleInputChange('new_status', value)}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLANNED" className="text-gray-700">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                          Planejado
                        </div>
                      </SelectItem>
                      <SelectItem value="ON_TRACK" className="text-green-700">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          No Prazo
                        </div>
                      </SelectItem>
                      <SelectItem value="AT_RISK" className="text-yellow-700">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                          Em Risco
                        </div>
                      </SelectItem>
                      <SelectItem value="BEHIND" className="text-red-700">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          Atrasado
                        </div>
                      </SelectItem>
                      <SelectItem value="COMPLETED" className="text-blue-700">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          Concluído
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {formData.new_status !== keyResult.status && (
                    <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                      ✨ O status será alterado de "{getStatusConfig(keyResult.status).label}" para "{getStatusConfig(formData.new_status).label}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-6 border-t">
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium"
            >
              {isLoading 
                ? (isEditing ? 'Salvando...' : 'Registrando...') 
                : (isEditing ? 'Salvar Check-in' : 'Registrar Check-in')
              }
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CheckinForm; 