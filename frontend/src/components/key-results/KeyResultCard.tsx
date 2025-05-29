import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Activity, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  User, 
  Target,
  Plus,
  TrendingUp,
  Percent,
  Hash,
  DollarSign,
  CheckCircle
} from 'lucide-react';
import type { KeyResult } from '@/types/key-results';
import { usePermissions } from '@/hooks/use-auth';

interface KeyResultCardProps {
  keyResult: KeyResult;
  onEdit?: (keyResult: KeyResult) => void;
  onDelete?: (keyResultId: string) => void;
  onAddCheckin?: (keyResultId: string) => void;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'PLANNED':
      return { label: 'Planejado', color: 'bg-gray-100 text-gray-800', bgColor: 'bg-gray-50' };
    case 'ON_TRACK':
      return { label: 'No Prazo', color: 'bg-green-100 text-green-800', bgColor: 'bg-green-50' };
    case 'AT_RISK':
      return { label: 'Em Risco', color: 'bg-yellow-100 text-yellow-800', bgColor: 'bg-yellow-50' };
    case 'BEHIND':
      return { label: 'Atrasado', color: 'bg-red-100 text-red-800', bgColor: 'bg-red-50' };
    case 'COMPLETED':
      return { label: 'Concluído', color: 'bg-blue-100 text-blue-800', bgColor: 'bg-blue-50' };
    default:
      return { label: status, color: 'bg-gray-100 text-gray-800', bgColor: 'bg-gray-50' };
  }
};

const getUnitIcon = (unit: string) => {
  switch (unit) {
    case 'PERCENTAGE':
      return <Percent className="h-4 w-4" />;
    case 'NUMBER':
      return <Hash className="h-4 w-4" />;
    case 'CURRENCY':
      return <DollarSign className="h-4 w-4" />;
    case 'BINARY':
      return <CheckCircle className="h-4 w-4" />;
    default:
      return <Target className="h-4 w-4" />;
  }
};

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

const KeyResultCard: React.FC<KeyResultCardProps> = ({
  keyResult,
  onEdit,
  onDelete,
  onAddCheckin,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { isOwner, isAdmin } = usePermissions();
  
  const statusConfig = getStatusConfig(keyResult.status);
  const canEdit = isOwner || isAdmin;
  const canDelete = isOwner || isAdmin;

  const handleDelete = () => {
    if (onDelete) {
      onDelete(keyResult.id);
    }
    setShowDeleteDialog(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <>
      <Card className={`hover:shadow-md transition-all duration-200 border-l-4 ${
        keyResult.status === 'COMPLETED' ? 'border-l-blue-500' :
        keyResult.status === 'ON_TRACK' ? 'border-l-green-500' :
        keyResult.status === 'AT_RISK' ? 'border-l-yellow-500' :
        keyResult.status === 'BEHIND' ? 'border-l-red-500' :
        'border-l-gray-500'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className={`p-2 rounded-full ${statusConfig.bgColor}`}>
                <Activity className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-gray-900 truncate">
                  {keyResult.title}
                </h3>
                {keyResult.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {keyResult.description}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={statusConfig.color}>
                {statusConfig.label}
              </Badge>
              
              {(canEdit || canDelete || onAddCheckin) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onAddCheckin && (
                      <DropdownMenuItem onClick={() => onAddCheckin(keyResult.id)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Check-in
                      </DropdownMenuItem>
                    )}
                    {canEdit && onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(keyResult)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                    )}
                    {canDelete && onDelete && (
                      <DropdownMenuItem 
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Progresso */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progresso</span>
              <span className="text-sm font-semibold text-gray-900">
                {Math.round(keyResult.progress)}%
              </span>
            </div>
            <Progress value={keyResult.progress} className="h-2" />
          </div>

          {/* Valores */}
          <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Inicial</div>
              <div className="font-medium text-sm flex items-center justify-center gap-1">
                {getUnitIcon(keyResult.unit)}
                {formatValue(keyResult.start_value, keyResult.unit)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Atual</div>
              <div className="font-medium text-sm flex items-center justify-center gap-1 text-blue-600">
                {getUnitIcon(keyResult.unit)}
                {formatValue(keyResult.current_value, keyResult.unit)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Meta</div>
              <div className="font-medium text-sm flex items-center justify-center gap-1 text-green-600">
                {getUnitIcon(keyResult.unit)}
                {formatValue(keyResult.target_value, keyResult.unit)}
              </div>
            </div>
          </div>

          {/* Informações adicionais */}
          <div className="space-y-2 text-sm text-gray-600">
            {keyResult.owner_name && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Responsável: {keyResult.owner_name}</span>
              </div>
            )}
            
            {keyResult.confidence_level && (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>Confiança: {Math.round(keyResult.confidence_level * 100)}%</span>
              </div>
            )}

            {keyResult.due_date && (
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span>Prazo: {new Date(keyResult.due_date).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
            
            <div className="text-xs text-gray-500 mt-3">
              Criado em {formatDate(keyResult.created_at)}
              {keyResult.updated_at !== keyResult.created_at && (
                <span> • Atualizado em {formatDate(keyResult.updated_at)}</span>
              )}
            </div>
          </div>

          {/* Botão check-in rápido */}
          {onAddCheckin && (
            <div className="mt-4 pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddCheckin(keyResult.id)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Registrar Check-in
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o Key Result "{keyResult.title}"?
              Esta ação não pode ser desfeita e todos os check-ins associados também serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default KeyResultCard; 