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
  KeyResult, 
  CreateKeyResultData, 
  UpdateKeyResultData,
  CreateCheckinData,
  UpdateCheckinData,
  Checkin
} from '@/types/key-results';

interface KeyResultListProps {
  objectiveId: string;
  objectiveTitle: string;
}

const KeyResultList: React.FC<KeyResultListProps> = ({
  objectiveId,
  objectiveTitle,
}) => {
  const { isOwner, isAdmin } = usePermissions();
  const canCreateKeyResult = isOwner || isAdmin;
  
  const { 
    keyResults, 
    total, 
    isLoading, 
    isCreating,
    isUpdating,
    isDeleting,
    createKeyResult,
    updateKeyResult,
    deleteKeyResult,
    refetch 
  } = useKeyResults(objectiveId);

  const [showKeyResultForm, setShowKeyResultForm] = useState(false);
  const [editingKeyResult, setEditingKeyResult] = useState<KeyResult | null>(null);
  
  // Estados para check-ins
  const [showCheckinForm, setShowCheckinForm] = useState(false);
  const [selectedKeyResult, setSelectedKeyResult] = useState<KeyResult | null>(null);
  const [editingCheckin, setEditingCheckin] = useState<Checkin | null>(null);

  // Hook de check-ins (só ativa quando necessário)
  const { 
    createCheckin,
    updateCheckin,
    isCreating: isCreatingCheckin,
    isUpdating: isUpdatingCheckin
  } = useCheckins(selectedKeyResult?.id || '');

  const handleCreateKeyResult = async (data: CreateKeyResultData) => {
    await createKeyResult(data);
    setShowKeyResultForm(false);
  };

  const handleUpdateKeyResult = async (data: UpdateKeyResultData) => {
    if (editingKeyResult) {
      await updateKeyResult(editingKeyResult.id, data);
      setEditingKeyResult(null);
    }
  };

  const handleEditKeyResult = (keyResult: KeyResult) => {
    setEditingKeyResult(keyResult);
    setShowKeyResultForm(true);
  };

  const handleDeleteKeyResult = async (keyResultId: string) => {
    await deleteKeyResult(keyResultId);
  };

  const handleCloseForm = () => {
    setShowKeyResultForm(false);
    setEditingKeyResult(null);
  };

  // Funções para check-ins
  const handleAddCheckin = (keyResultId: string) => {
    const keyResult = keyResults.find(kr => kr.id === keyResultId);
    if (keyResult) {
      setSelectedKeyResult(keyResult);
      setEditingCheckin(null);
      setShowCheckinForm(true);
    }
  };

  const handleCreateCheckin = async (data: CreateCheckinData) => {
    if (selectedKeyResult) {
      await createCheckin(data);
      setShowCheckinForm(false);
      setSelectedKeyResult(null);
    }
  };

  const handleUpdateCheckinAndKeyResult = async (checkinData: UpdateCheckinData, keyResultData?: UpdateKeyResultData) => {
    if (editingCheckin && selectedKeyResult) {
      await updateCheckin(editingCheckin.id, checkinData);
      
      if (keyResultData) {
        await updateKeyResult(selectedKeyResult.id, keyResultData);
      }
      
      setShowCheckinForm(false);
      setEditingCheckin(null);
      setSelectedKeyResult(null);
    }
  };

  const handleCloseCheckinForm = () => {
    setShowCheckinForm(false);
    setSelectedKeyResult(null);
    setEditingCheckin(null);
  };

  // Calcular estatísticas dos Key Results
  const stats = {
    total: keyResults.length,
    completed: keyResults.filter(kr => kr.status === 'COMPLETED').length,
    onTrack: keyResults.filter(kr => kr.status === 'ON_TRACK').length,
    atRisk: keyResults.filter(kr => kr.status === 'AT_RISK').length,
    behind: keyResults.filter(kr => kr.status === 'BEHIND').length,
    averageProgress: keyResults.length > 0 
      ? Math.round(keyResults.reduce((acc, kr) => acc + kr.progress, 0) / keyResults.length)
      : 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Key Results
          </h2>
          <p className="text-sm text-gray-600">
            Objetivo: {objectiveTitle}
          </p>
        </div>
        
        {canCreateKeyResult && (
          <Button onClick={() => setShowKeyResultForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Key Result
          </Button>
        )}
      </div>

      {/* Estatísticas */}
      {keyResults.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completed} concluídos
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
                Atrasados
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Key Results */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loading text="Carregando Key Results..." />
        </div>
      ) : keyResults.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum Key Result encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                Comece criando Key Results para medir o progresso deste objetivo.
              </p>
              {canCreateKeyResult && (
                <Button onClick={() => setShowKeyResultForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Key Result
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {keyResults.map((keyResult) => (
            <KeyResultCard
              key={keyResult.id}
              keyResult={keyResult}
              onEdit={handleEditKeyResult}
              onDelete={handleDeleteKeyResult}
              onAddCheckin={handleAddCheckin}
            />
          ))}
        </div>
      )}

      {/* Formulário de Key Result */}
      <KeyResultForm
        open={showKeyResultForm}
        onOpenChange={handleCloseForm}
        keyResult={editingKeyResult}
        onSubmit={editingKeyResult ? handleUpdateKeyResult : handleCreateKeyResult}
        isLoading={isCreating || isUpdating}
      />

      {/* Formulário de Check-in */}
      {selectedKeyResult && (
        <CheckinForm
          open={showCheckinForm}
          onOpenChange={handleCloseCheckinForm}
          keyResult={selectedKeyResult}
          checkin={editingCheckin}
          onSubmitCheckin={editingCheckin ? 
            (data) => handleUpdateCheckinAndKeyResult(data as UpdateCheckinData) : 
            handleCreateCheckin
          }
          onUpdateKeyResult={async (data) => {
            await updateKeyResult(selectedKeyResult.id, data);
          }}
          isLoading={isCreatingCheckin || isUpdatingCheckin}
        />
      )}
    </div>
  );
};

export default KeyResultList; 