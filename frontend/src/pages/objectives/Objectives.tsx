import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Search, 
  Filter, 
  Target,
  Calendar,
  User,
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import ObjectiveForm from '@/components/objectives/ObjectiveForm';
import { useObjectives, useObjectiveFilters } from '@/hooks/use-objectives';
import { usePermissions } from '@/hooks/use-auth';
import { Loading } from '@/components/ui/loading';
import type { 
  Objective, 
  CreateObjectiveData, 
  UpdateObjectiveData 
} from '@/types/objectives';

const Objectives = () => {
  const navigate = useNavigate();
  const { isOwner, isAdmin, canCreateObjectives } = usePermissions();
  const canCreateObjective = canCreateObjectives;
  
  const { filters, updateFilter, clearFilters, nextPage, prevPage } = useObjectiveFilters();
  const { 
    objectives, 
    total, 
    hasMore, 
    isLoading, 
    isCreating,
    isUpdating,
    createObjective,
    updateObjective,
    deleteObjective
  } = useObjectives(filters);

  const [showObjectiveForm, setShowObjectiveForm] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);

  const handleCreateObjective = async (data: CreateObjectiveData) => {
    await createObjective(data);
    setShowObjectiveForm(false);
  };

  const handleUpdateObjective = async (data: UpdateObjectiveData) => {
    if (editingObjective) {
      await updateObjective(editingObjective.id, data);
      setEditingObjective(null);
    }
  };

  const handleEditObjective = (objective: Objective) => {
    setEditingObjective(objective);
    setShowObjectiveForm(true);
  };

  const handleDeleteObjective = async (objectiveId: string) => {
    await deleteObjective(objectiveId);
  };

  const handleCloseForm = () => {
    setShowObjectiveForm(false);
    setEditingObjective(null);
  };

  const handleManageKeyResults = (objectiveId: string, objectiveTitle: string) => {
    navigate(`/objectives/${objectiveId}/key-results`);
  };

  const currentPage = Math.floor((filters.offset || 0) / (filters.limit || 50)) + 1;
  const totalPages = Math.ceil(total / (filters.limit || 50));

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { color: 'bg-blue-100 text-blue-800', label: 'Concluído' };
      case 'ON_TRACK':
        return { color: 'bg-green-100 text-green-800', label: 'No Prazo' };
      case 'AT_RISK':
        return { color: 'bg-yellow-100 text-yellow-800', label: 'Em Risco' };
      case 'BEHIND':
        return { color: 'bg-red-100 text-red-800', label: 'Atrasado' };
      case 'PLANNED':
        return { color: 'bg-gray-100 text-gray-800', label: 'Planejado' };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: status };
    }
  };

  if (isLoading) {
    return (
      <div className="container py-6 px-4 md:px-6 max-w-7xl mx-auto">
        <Loading text="Carregando objetivos..." />
      </div>
    );
  }

  return (
    <div className="container py-6 px-4 md:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Objetivos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os objetivos da sua empresa
          </p>
        </div>
        
        {canCreateObjective && (
          <Button onClick={() => setShowObjectiveForm(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Novo Objetivo
          </Button>
        )}
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Input
                placeholder="Buscar objetivos..."
                value={filters.search || ''}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="w-full"
              />
            </div>
            {/* Adicionar mais filtros aqui se necessário */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearFilters}>
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Objetivos */}
      <div className="grid gap-6">
        {objectives.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum objetivo encontrado
                </h3>
                <p className="text-gray-600 mb-4">
                  {canCreateObjective 
                    ? "Comece criando seu primeiro objetivo." 
                    : "Aguarde a criação de objetivos pelo administrador."
                  }
                </p>
                {canCreateObjective && (
                  <Button onClick={() => setShowObjectiveForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Objetivo
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          objectives.map((objective) => {
            const statusConfig = getStatusConfig(objective.status);
            return (
              <Card key={objective.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Informações principais */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-2">
                            {objective.title}
                          </h3>
                          {objective.description && (
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {objective.description}
                            </p>
                          )}
                        </div>
                        <Badge className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                      </div>

                      {/* Progresso */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Progresso</span>
                          <span className="text-sm font-semibold">
                            {objective.progress?.toFixed(1) || 0}%
                          </span>
                        </div>
                        <Progress value={objective.progress || 0} className="h-2" />
                      </div>

                      {/* Metadados */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        {objective.owner_name && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{objective.owner_name}</span>
                          </div>
                        )}
                        {objective.cycle_name && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{objective.cycle_name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>{objective.key_results_count || 0} Key Results</span>
                        </div>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex flex-col gap-2 lg:w-48">
                      <Button
                        variant="outline"
                        onClick={() => handleManageKeyResults(objective.id, objective.title)}
                        className="w-full"
                      >
                        <Target className="h-4 w-4 mr-2" />
                        Ver Key Results
                      </Button>
                      
                      {(isOwner || isAdmin) && (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => handleEditObjective(objective)}
                            className="w-full"
                            disabled={isUpdating}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDeleteObjective(objective.id)}
                            className="w-full"
                            disabled={isUpdating}
                          >
                            Excluir
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">
            Página {currentPage} de {totalPages} • {total} objetivo(s) total
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={prevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
            <Button
              variant="outline"
              onClick={nextPage}
              disabled={!hasMore}
            >
              Próxima
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal de Formulário */}
      {showObjectiveForm && (
        <ObjectiveForm
          open={showObjectiveForm}
          onOpenChange={(open) => {
            if (!open) handleCloseForm();
          }}
          objective={editingObjective}
          onSubmit={editingObjective ? handleUpdateObjective : handleCreateObjective}
          isLoading={editingObjective ? isUpdating : isCreating}
        />
      )}
    </div>
  );
};

export default Objectives; 