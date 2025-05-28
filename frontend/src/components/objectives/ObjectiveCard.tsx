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
  Target, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  User, 
  Calendar,
  Plus,
  Activity,
  Settings
} from 'lucide-react';
import type { Objective } from '@/types/objectives';
import { usePermissions } from '@/hooks/use-auth';

interface ObjectiveCardProps {
  objective: Objective;
  onEdit?: (objective: Objective) => void;
  onDelete?: (objectiveId: string) => void;
  onManageKeyResults?: (objectiveId: string, objectiveTitle: string) => void;
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

const ObjectiveCard: React.FC<ObjectiveCardProps> = ({
  objective,
  onEdit,
  onDelete,
  onManageKeyResults,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { isOwner, isAdmin } = usePermissions();
  
  const statusConfig = getStatusConfig(objective.status);
  const canEdit = isOwner || isAdmin;
  const canDelete = isOwner || isAdmin;

  const handleDelete = () => {
    if (onDelete) {
      onDelete(objective.id);
    }
    setShowDeleteDialog(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <>
      <Card className={`hover:shadow-md transition-all duration-200 border-l-4 ${
        objective.status === 'COMPLETED' ? 'border-l-blue-500' :
        objective.status === 'ON_TRACK' ? 'border-l-green-500' :
        objective.status === 'AT_RISK' ? 'border-l-yellow-500' :
        objective.status === 'BEHIND' ? 'border-l-red-500' :
        'border-l-gray-500'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className={`p-2 rounded-full ${statusConfig.bgColor}`}>
                <Target className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-gray-900 truncate">
                  {objective.title}
                </h3>
                {objective.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {objective.description}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={statusConfig.color}>
                {statusConfig.label}
              </Badge>
              
              {(canEdit || canDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canEdit && onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(objective)}>
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
                {Math.round(objective.progress)}%
              </span>
            </div>
            <Progress value={objective.progress} className="h-2" />
          </div>

          {/* Informações adicionais */}
          <div className="space-y-2 text-sm text-gray-600">
            {objective.owner_name && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Responsável: {objective.owner_name}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Ciclo: {objective.cycle_name}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>
                {objective.key_results_count} Key Result{objective.key_results_count !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="text-xs text-gray-500 mt-3">
              Criado em {formatDate(objective.created_at)}
              {objective.updated_at !== objective.created_at && (
                <span> • Atualizado em {formatDate(objective.updated_at)}</span>
              )}
            </div>
          </div>

          {/* Botão gerenciar Key Results */}
          {onManageKeyResults && (
            <div className="mt-4 pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onManageKeyResults(objective.id, objective.title)}
                className="w-full"
              >
                <Settings className="h-4 w-4 mr-2" />
                Gerenciar Key Results
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
              Tem certeza que deseja excluir o objetivo "{objective.title}"?
              Esta ação não pode ser desfeita e todos os Key Results associados também serão removidos.
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

export default ObjectiveCard; 