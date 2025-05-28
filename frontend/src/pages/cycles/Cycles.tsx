import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Plus, 
  Play, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Clock,
  Target
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCycles } from '@/hooks/use-cycles';
import { usePermissions } from '@/hooks/use-auth';
import { Loading } from '@/components/ui/loading';
import { toast } from 'sonner';
import type { Cycle, CreateCycleData, UpdateCycleData } from '@/types/cycles';

const Cycles = () => {
  const { 
    cycles, 
    activeCycle, 
    isLoading, 
    isError, 
    isCreating,
    isUpdating,
    isActivating,
    isDeleting,
    createCycle, 
    updateCycle,
    activateCycle, 
    deleteCycle 
  } = useCycles();
  const { isOwner, isAdmin } = usePermissions();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCycle, setEditingCycle] = useState<Cycle | null>(null);
  const [formData, setFormData] = useState<CreateCycleData>({
    name: '',
    start_date: '',
    end_date: '',
  });

  const canManage = isOwner || isAdmin;

  const resetForm = () => {
    setFormData({ name: '', start_date: '', end_date: '' });
    setEditingCycle(null);
  };

  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.start_date || !formData.end_date) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await createCycle(formData);
      resetForm();
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Erro ao criar ciclo:', error);
    }
  };

  const handleEditCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCycle || !formData.name || !formData.start_date || !formData.end_date) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const updateData: UpdateCycleData = {
        name: formData.name,
        start_date: formData.start_date,
        end_date: formData.end_date,
      };
      
      await updateCycle(editingCycle.id, updateData);
      resetForm();
      setShowEditDialog(false);
    } catch (error) {
      console.error('Erro ao atualizar ciclo:', error);
    }
  };

  const openEditDialog = (cycle: Cycle) => {
    setEditingCycle(cycle);
    setFormData({
      name: cycle.name,
      start_date: cycle.start_date.split('T')[0], // Converter para formato de input date
      end_date: cycle.end_date.split('T')[0],
    });
    setShowEditDialog(true);
  };

  const handleActivateCycle = async (cycleId: string) => {
    if (window.confirm('Tem certeza que deseja ativar este ciclo? O ciclo atual será desativado.')) {
      try {
        await activateCycle(cycleId);
      } catch (error) {
        console.error('Erro ao ativar ciclo:', error);
      }
    }
  };

  const handleDeleteCycle = async (cycle: Cycle) => {
    if (cycle.is_active) {
      toast.error('Não é possível deletar o ciclo ativo');
      return;
    }

    if (window.confirm(`Tem certeza que deseja deletar o ciclo "${cycle.name}"?`)) {
      try {
        await deleteCycle(cycle.id);
      } catch (error) {
        console.error('Erro ao deletar ciclo:', error);
      }
    }
  };

  const getStatusBadge = (cycle: Cycle) => {
    switch (cycle.status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'PLANNED':
        return <Badge className="bg-blue-100 text-blue-800">Planejado</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-gray-100 text-gray-800">Concluído</Badge>;
      case 'EXPIRED':
        return <Badge className="bg-red-100 text-red-800">Expirado</Badge>;
      default:
        return <Badge variant="secondary">{cycle.status}</Badge>;
    }
  };

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-500">Erro ao carregar ciclos. Tente novamente.</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Recarregar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="h-8 w-8" />
              Gestão de Ciclos
            </h1>
            <p className="text-gray-600 mt-2">
              {canManage 
                ? "Gerencie os ciclos de OKR da sua empresa" 
                : "Visualize os ciclos de OKR"}
            </p>
          </div>
          
          {canManage && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Ciclo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Ciclo</DialogTitle>
                  <DialogDescription>
                    Defina um novo período para os OKRs da empresa.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateCycle} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cycle-name">Nome do Ciclo</Label>
                    <Input
                      id="cycle-name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Q1 2025, Trimestre 1, etc."
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Data de Início</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="end-date">Data de Fim</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? 'Criando...' : 'Criar Ciclo'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setShowCreateDialog(false);
                        resetForm();
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Dialog de Edição */}
      {canManage && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Ciclo</DialogTitle>
              <DialogDescription>
                Atualize as informações do ciclo.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditCycle} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-cycle-name">Nome do Ciclo</Label>
                <Input
                  id="edit-cycle-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Q1 2025, Trimestre 1, etc."
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-start-date">Data de Início</Label>
                  <Input
                    id="edit-start-date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-end-date">Data de Fim</Label>
                  <Input
                    id="edit-end-date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowEditDialog(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Ciclo Ativo */}
      {activeCycle && (
        <Card className="mb-6 border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Target className="h-5 w-5" />
              Ciclo Ativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nome</p>
                <p className="font-semibold">{activeCycle.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Período</p>
                <p className="font-medium">
                  {new Date(activeCycle.start_date).toLocaleDateString('pt-BR')} - {' '}
                  {new Date(activeCycle.end_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Progresso</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${activeCycle.progress_percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{activeCycle.progress_percentage}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Dias Restantes</p>
                <p className="font-semibold text-green-600">{activeCycle.days_remaining}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Ciclos */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Ciclos</CardTitle>
          <CardDescription>
            Histórico e gestão de todos os ciclos da empresa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loading text="Carregando ciclos..." />
          ) : cycles.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum ciclo encontrado</p>
              {canManage && (
                <Button onClick={() => setShowCreateDialog(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar primeiro ciclo
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {cycles.map((cycle) => (
                <div
                  key={cycle.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{cycle.name}</p>
                        {getStatusBadge(cycle)}
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(cycle.start_date).toLocaleDateString('pt-BR')} - {' '}
                        {new Date(cycle.end_date).toLocaleDateString('pt-BR')}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {cycle.days_total} dias total
                        </span>
                        <span className="text-xs text-gray-500">
                          {cycle.progress_percentage}% concluído
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {canManage && (
                    <div className="flex items-center gap-2">
                      {!cycle.is_active && cycle.status === 'PLANNED' && (
                        <Button
                          size="sm"
                          onClick={() => handleActivateCycle(cycle.id)}
                          disabled={isActivating}
                          className="flex items-center gap-1"
                        >
                          <Play className="h-3 w-3" />
                          Ativar
                        </Button>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openEditDialog(cycle)}
                            disabled={cycle.is_active}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          {!cycle.is_active && (
                            <DropdownMenuItem
                              onClick={() => handleDeleteCycle(cycle)}
                              className="text-red-600"
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Deletar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Cycles; 