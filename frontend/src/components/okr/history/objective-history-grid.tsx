
import React, { useState } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ProgressChart from './charts/progress-chart';
import { ObjectiveHistoryData } from '@/hooks/history/use-okr-history';

interface ObjectiveHistoryGridProps {
  objectiveHistory: ObjectiveHistoryData[];
}

const ObjectiveHistoryGrid: React.FC<ObjectiveHistoryGridProps> = ({
  objectiveHistory,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'individual'>('grid');
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string>(
    objectiveHistory[0]?.objective.id || ''
  );

  const selectedObjective = objectiveHistory.find(
    (item) => item.objective.id === selectedObjectiveId
  );

  // Array of colors for different objectives
  const colors = [
    '#1E88E5', // Blue
    '#43A047', // Green
    '#FB8C00', // Orange
    '#8E24AA', // Purple
    '#D81B60', // Pink
    '#00ACC1', // Teal
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Histórico por Objetivo</h2>
        <Tabs 
          value={viewMode} 
          onValueChange={(value) => setViewMode(value as 'grid' | 'individual')}
          className="w-[400px]"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="grid">Visualização em Grid</TabsTrigger>
            <TabsTrigger value="individual">Objetivo Individual</TabsTrigger>
          </TabsList>
          
          <TabsContent value="grid" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {objectiveHistory.slice(0, 6).map((item, index) => (
                <ProgressChart
                  key={item.objective.id}
                  data={item.progressHistory}
                  title={item.objective.title}
                  color={colors[index % colors.length]}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="individual" className="mt-6">
            <div className="mb-4">
              <Select
                value={selectedObjectiveId}
                onValueChange={setSelectedObjectiveId}
              >
                <SelectTrigger className="w-full md:w-[300px]">
                  <SelectValue placeholder="Selecione um objetivo" />
                </SelectTrigger>
                <SelectContent>
                  {objectiveHistory.map((item) => (
                    <SelectItem key={item.objective.id} value={item.objective.id}>
                      {item.objective.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedObjective && (
              <div className="mt-4">
                <ProgressChart
                  data={selectedObjective.progressHistory}
                  title={selectedObjective.objective.title}
                  color="#1E88E5"
                />

                <div className="mt-6 p-4 bg-white rounded-lg border">
                  <h3 className="font-medium mb-2">Detalhes do Objetivo</h3>
                  <p className="text-gray-700 mb-4">{selectedObjective.objective.description}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Progresso Atual</span>
                      <p className="text-lg font-semibold">{selectedObjective.objective.progress}%</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Atividades</span>
                      <p className="text-lg font-semibold">{selectedObjective.objective.activities.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ObjectiveHistoryGrid;
