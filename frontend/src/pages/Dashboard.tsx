import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardStatsCards from '@/components/dashboard/DashboardStatsCards';
import ObjectiveFilters from '@/components/objectives/ObjectiveFilters';
import ObjectiveCard from '@/components/objectives/ObjectiveCard';
import ObjectiveForm from '@/components/objectives/ObjectiveForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useObjectives, useObjectiveFilters } from '@/hooks/use-objectives';
import { usePermissions } from '@/hooks/use-auth';
import { 
  LayoutDashboard, 
  Plus, 
  Target, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Loading } from '@/components/ui/loading';
import ErrorBoundary from '@/components/ui/error-boundary';
import type { Objective, CreateObjectiveData, UpdateObjectiveData } from '@/types/objectives';

const Dashboard = () => {
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

  return (
    <ErrorBoundary>
      <div className="container py-6 px-4 md:px-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="bg-nobug-100 p-2 rounded-lg">
              <LayoutDashboard className="h-5 w-5 text-nobug-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          </div>
          
          
        </div>
        
        {/* Cards de Estatísticas e Progresso */}
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl p-4 shadow-sm mb-8">
          <DashboardStatsCards />
        </div>

        {/* Header dos Objetivos */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Objetivos</h2>
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

        {/* Footer */}
        <div className="mt-16 mb-4 text-xs text-gray-500">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 border-t border-gray-200 pt-4">
            <p>Sistema integrado com backend API</p>
            <p className="text-nobug-600 font-medium">Desenvolvido por Nobug Tecnologia</p>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;
