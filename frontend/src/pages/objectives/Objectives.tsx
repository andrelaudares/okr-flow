import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ObjectiveFilters from '@/components/objectives/ObjectiveFilters';
import ObjectiveCard from '@/components/objectives/ObjectiveCard';
import ObjectiveForm from '@/components/objectives/ObjectiveForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useObjectives, useObjectiveFilters } from '@/hooks/use-objectives';
import { usePermissions } from '@/hooks/use-auth';
import { 
  Target, 
  Plus, 
  TrendingUp, 
  Calendar,
  FileText,
  ChevronLeft,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { Loading } from '@/components/ui/loading';
import type { Objective, CreateObjectiveData, UpdateObjectiveData } from '@/types/objectives';

const Objectives = () => {
  const navigate = useNavigate();
  const { isOwner, isAdmin } = usePermissions();
  const canCreateObjective = isOwner || isAdmin;
  
  const { filters, updateFilter, clearFilters, nextPage, prevPage } = useObjectiveFilters();
  const { 
    objectives, 
    total, 
    hasMore, 
    stats,
    isLoading, 
    isLoadingStats,
    isCreating,
    isUpdating,
    isDeleting,
    createObjective,
    updateObjective,
    deleteObjective,
    refetch 
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

  return (
    <div className="container py-6 px-4 md:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6 animate-fade-in">
        <div className="bg-nobug-100 p-2 rounded-lg">
          <Target className="h-5 w-5 text-nobug-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Objetivos</h1>
      </div>

      {/* Estatísticas */}
      {stats && !isLoadingStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Objetivos</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_objectives}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completed_count} concluídos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats.average_progress)}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.in_progress_count} em andamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">No Prazo</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.by_status.ON_TRACK}</div>
              <p className="text-xs text-muted-foreground">
                {stats.by_status.AT_RISK} em risco
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Planejados</span>
                  <span className="font-medium">{stats.by_status.PLANNED}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Atrasados</span>
                  <span className="font-medium text-red-600">{stats.by_status.BEHIND}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header dos Objetivos */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Lista de Objetivos</h2>
          <p className="text-sm text-gray-600">
            {total > 0 ? `${total} objetivo${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}` : 'Nenhum objetivo encontrado'}
          </p>
        </div>
        
        {canCreateObjective && (
          <Button onClick={() => setShowObjectiveForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Objetivo
          </Button>
        )}
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <ObjectiveFilters
            filters={filters}
            onFilterChange={updateFilter}
            onClearFilters={clearFilters}
          />
        </CardContent>
      </Card>

      {/* Lista de Objetivos */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loading text="Carregando objetivos..." />
        </div>
      ) : objectives.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum objetivo encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                {Object.keys(filters).some(key => filters[key as keyof typeof filters])
                  ? 'Tente ajustar os filtros para encontrar objetivos.'
                  : 'Comece criando seu primeiro objetivo.'}
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
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {objectives.map((objective) => (
              <ObjectiveCard
                key={objective.id}
                objective={objective}
                onEdit={handleEditObjective}
                onDelete={handleDeleteObjective}
                onManageKeyResults={handleManageKeyResults}
              />
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <div className="text-sm text-gray-600">
                Página {currentPage} de {totalPages} • {total} objetivo{total !== 1 ? 's' : ''} no total
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextPage}
                  disabled={!hasMore}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Formulário de Objetivo */}
      <ObjectiveForm
        open={showObjectiveForm}
        onOpenChange={handleCloseForm}
        objective={editingObjective}
        onSubmit={editingObjective ? handleUpdateObjective : handleCreateObjective}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
};

export default Objectives; 