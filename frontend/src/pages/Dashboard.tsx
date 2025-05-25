import React, { useState, useCallback } from 'react';
import AddObjectiveDialog from '@/components/okr/add-objective-dialog';
import DashboardInfoCards from '@/components/okr/DashboardInfoCards';
import DashboardHeader from '@/components/okr/dashboard/dashboard-header';
import ObjectiveList from '@/components/okr/dashboard/objective-list';
import ExportReportButton from '@/components/okr/export-report-button';
import { useDashboardObjectives } from '@/hooks/use-dashboard-objectives';
import { useObjectivesFilter } from '@/hooks/use-objectives-filter';
import { Loader2, LayoutDashboard } from 'lucide-react';

const Dashboard = () => {
  const [isAddObjectiveDialogOpen, setIsAddObjectiveDialogOpen] = useState(false);
  
  const {
    objectives,
    isLoading,
    isProcessing,
    handleAddObjective,
    handleAddActivity,
    handleUpdateActivity,
    handleDeleteActivity,
    handleDeleteObjective,
    isUsingRemoteData
  } = useDashboardObjectives();

  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    userFilter,
    setUserFilter,
    filteredObjectives,
  } = useObjectivesFilter(objectives);

  const handleObjectiveSubmit = useCallback(async (data: { title: string; description: string }) => {
    const success = await handleAddObjective(data);
    if (success) {
      setIsAddObjectiveDialogOpen(false);
    }
  }, [handleAddObjective]);

  return (
    <div className="container py-6 px-4 md:px-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-6 animate-fade-in">
        <div className="bg-nobug-100 p-2 rounded-lg">
          <LayoutDashboard className="h-5 w-5 text-nobug-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      </div>
      
      <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl p-4 shadow-sm mb-8">
        <DashboardInfoCards objectives={filteredObjectives} />
      </div>
      
      <DashboardHeader
        onOpenAddDialog={() => setIsAddObjectiveDialogOpen(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        userFilter={userFilter}
        onUserFilterChange={setUserFilter}
        objectives={filteredObjectives}
      />
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white/60 rounded-xl border border-gray-100 shadow-sm">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground font-medium">Carregando objetivos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ObjectiveList
            objectives={filteredObjectives}
            isLoading={isLoading}
            isProcessing={isProcessing}
            onAddActivity={handleAddActivity}
            onUpdateActivity={handleUpdateActivity}
            onDeleteActivity={handleDeleteActivity}
            onDeleteObjective={handleDeleteObjective}
          />
        </div>
      )}
      
      <AddObjectiveDialog 
        open={isAddObjectiveDialogOpen}
        onOpenChange={setIsAddObjectiveDialogOpen}
        onAdd={handleObjectiveSubmit}
      />
      
      <div className="mt-16 mb-4 text-xs text-gray-500">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 border-t border-gray-200 pt-4">
          <p>
            {isUsingRemoteData 
              ? 'Sistema utilizando banco de dados remoto (Supabase)' 
              : 'Sistema utilizando armazenamento local (Zustand)'}
          </p>
          <p className="text-nobug-600 font-medium">Desenvolvido por Nobug Tecnologia</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
