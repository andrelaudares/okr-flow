
import React, { useMemo } from 'react';
import { Objective } from '@/types/okr';
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { ObjectivesTableProps } from './history-props';

const ObjectivesTable: React.FC<ObjectivesTableProps> = ({ data, objectives = [] }) => {
  // Use provided objectives or try to extract from history data
  const tableData = useMemo(() => {
    if (objectives && objectives.length > 0) {
      return objectives;
    }
    
    // If no objectives provided, try to extract from history data
    if (data && data.length > 0) {
      // Create a map to deduplicate objectives from history data
      const objectivesMap = new Map();
      
      data.forEach(point => {
        if (point.objectiveId && point.objectiveTitle) {
          if (!objectivesMap.has(point.objectiveId)) {
            objectivesMap.set(point.objectiveId, {
              id: point.objectiveId,
              title: point.objectiveTitle,
              description: '',
              progress: point.value,
              createdAt: new Date().toISOString(),
              activities: []
            });
          }
        }
      });
      
      return Array.from(objectivesMap.values());
    }
    
    return [];
  }, [objectives, data]);

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Objetivos e Atividades</h2>
      <div className="bg-white rounded-lg border shadow-sm">
        <Table>
          <TableCaption>Lista de objetivos e suas atividades relacionadas</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Objetivo</TableHead>
              <TableHead className="w-[200px]">Criado em</TableHead>
              <TableHead>Progresso</TableHead>
              <TableHead className="text-right">Atividades</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((objective) => (
              <TableRow key={objective.id}>
                <TableCell className="font-medium">
                  <div>
                    <div className="font-semibold">{objective.title}</div>
                    <div className="text-sm text-gray-500">{objective.description}</div>
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(objective.createdAt || '').toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={objective.progress} className="h-2 w-[100px]" />
                    <span className="text-sm">{objective.progress}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-medium">{objective.activities.length}</span>
                    <span className="text-sm text-gray-500">
                      {objective.activities.filter(a => a.progress === 100).length} concluídas
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ObjectivesTable;
