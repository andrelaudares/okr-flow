import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import KeyResultCard from './KeyResultCard';
import KeyResultForm from './KeyResultForm';
import CheckinForm from '../checkins/CheckinForm';
import { useKeyResults } from '@/hooks/use-key-results';
import { useCheckins } from '@/hooks/use-checkins';
import { usePermissions } from '@/hooks/use-auth';
import { 
  Plus, 
  Activity, 
  Target,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Loading } from '@/components/ui/loading';
import type { 
  Meta, 
  CreateMetaData, 
  UpdateMetaData,
  CreateCheckinData,
  UpdateCheckinData,
  Checkin
} from '@/types/key-results';

interface MetaListProps {
  objectiveId: string;
  objectiveTitle: string;
}

const MetaList: React.FC<MetaListProps> = ({
  objectiveId,
  objectiveTitle,
}) => {
  const { isOwner, isAdmin } = usePermissions();
  const canCreateMeta = isOwner || isAdmin;
  
  const { 
    keyResults: metas, 
    total, 
    isLoading, 
    isCreating,
    isUpdating,
    isDeleting,
    createKeyResult: createMeta,
    updateKeyResult: updateMeta,
    deleteKeyResult: deleteMeta,
    refetch 
  } = useKeyResults(objectiveId);

  const [showMetaForm, setShowMetaForm] = useState(false);
  const [editingMeta, setEditingMeta] = useState<Meta | null>(null);
  
  // Estados para check-ins
  const [showCheckinForm, setShowCheckinForm] = useState(false);
  const [selectedMeta, setSelectedMeta] = useState<Meta | null>(null);
  const [editingCheckin, setEditingCheckin] = useState<Checkin | null>(null);

  // Hook de check-ins (só ativa quando necessário)
  const { 
    createCheckin,
    updateCheckin,
    isCreating: isCreatingCheckin,
    isUpdating: isUpdatingCheckin
  } = useCheckins(selectedMeta?.id || '');

  const handleCreateMeta = async (data: CreateMetaData) => {
    await createMeta(data);
    setShowMetaForm(false);
  };

  const handleUpdateMeta = async (data: UpdateMetaData) => {
    if (editingMeta) {
      await updateMeta(editingMeta.id, data);
      setEditingMeta(null);
    }
  };

  const handleEditMeta = (meta: Meta) => {
    setEditingMeta(meta);
    setShowMetaForm(true);
  };

  const handleDeleteMeta = async (metaId: string) => {
    await deleteMeta(metaId);
  };

  const handleCloseForm = () => {
    setShowMetaForm(false);
    setEditingMeta(null);
  };

  // Funções para check-ins
  const handleAddCheckin = (metaId: string) => {
    const meta = metas.find(m => m.id === metaId);
    if (meta) {
      setSelectedMeta(meta);
      setEditingCheckin(null);
      setShowCheckinForm(true);
    }
  };

  const handleCreateCheckin = async (data: CreateCheckinData) => {
    if (selectedMeta) {
      await createCheckin(data);
      setShowCheckinForm(false);
      setSelectedMeta(null);
    }
  };

  const handleUpdateCheckinAndMeta = async (checkinData: UpdateCheckinData, metaData?: UpdateMetaData) => {
    if (editingCheckin && selectedMeta) {
      await updateCheckin(editingCheckin.id, checkinData);
      
      if (metaData) {
        await updateMeta(selectedMeta.id, metaData);
      }
      
      setShowCheckinForm(false);
      setEditingCheckin(null);
      setSelectedMeta(null);
    }
  };

  const handleCloseCheckinForm = () => {
    setShowCheckinForm(false);
    setSelectedMeta(null);
    setEditingCheckin(null);
  };

  // Calcular estatísticas das Metas
  const stats = {
    total: metas.length,
    completed: metas.filter(m => m.status === 'COMPLETED').length,
    onTrack: metas.filter(m => m.status === 'ON_TRACK').length,
    atRisk: metas.filter(m => m.status === 'AT_RISK').length,
    behind: metas.filter(m => m.status === 'BEHIND').length,
    averageProgress: metas.length > 0 
      ? Math.round(metas.reduce((acc, m) => acc + m.progress, 0) / metas.length)
      : 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Metas
          </h2>
          <p className="text-sm text-gray-600">
            Objetivo: {objectiveTitle}
          </p>
        </div>
        
        {canCreateMeta && (
          <Button onClick={() => setShowMetaForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Meta
          </Button>
        )}
      </div>

      {/* Estatísticas */}
      {metas.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completed} concluídas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progresso</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageProgress}%</div>
              <p className="text-xs text-muted-foreground">
                Média geral
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">No Prazo</CardTitle>
              <div className="h-4 w-4 rounded-full bg-green-500"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.onTrack}</div>
              <p className="text-xs text-muted-foreground">
                {stats.atRisk} em risco
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atenção</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.behind}</div>
              <p className="text-xs text-muted-foreground">
                Atrasadas
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Metas */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loading text="Carregando Metas..." />
        </div>
      ) : metas.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma Meta encontrada
              </h3>
              <p className="text-gray-600 mb-4">
                Comece criando Metas para medir o progresso deste objetivo.
              </p>
              {canCreateMeta && (
                <Button onClick={() => setShowMetaForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Meta
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {metas.map((meta) => (
            <KeyResultCard
              key={meta.id}
              keyResult={meta}
              onEdit={handleEditMeta}
              onDelete={handleDeleteMeta}
              onAddCheckin={handleAddCheckin}
            />
          ))}
        </div>
      )}

      {/* Formulário de Meta */}
      <KeyResultForm
        open={showMetaForm}
        onOpenChange={handleCloseForm}
        keyResult={editingMeta}
        onSubmit={editingMeta ? handleUpdateMeta : handleCreateMeta}
        isLoading={isCreating || isUpdating}
      />

      {/* Formulário de Check-in */}
      {selectedMeta && (
        <CheckinForm
          open={showCheckinForm}
          onOpenChange={handleCloseCheckinForm}
          keyResult={selectedMeta}
          checkin={editingCheckin}
          onSubmitCheckin={editingCheckin ? 
            (data) => handleUpdateCheckinAndMeta(data as UpdateCheckinData) : 
            handleCreateCheckin
          }
          onUpdateKeyResult={async (data) => {
            await updateMeta(selectedMeta.id, data);
          }}
          isLoading={isCreatingCheckin || isUpdatingCheckin}
        />
      )}
    </div>
  );
};

// Manter compatibilidade com nome antigo
export const KeyResultList = MetaList;

export default MetaList; 