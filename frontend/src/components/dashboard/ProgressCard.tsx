import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target, CheckCircle } from 'lucide-react';
import TrendIndicator from './TrendIndicator';
import StatusColorBadge from './StatusColorBadge';
import ProgressBar from './ProgressBar';
import type { ProgressData } from '@/types/dashboard';

interface ProgressCardProps {
  data: ProgressData;
  isLoading?: boolean;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Progresso dos Objetivos</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded animate-pulse" />
            <div className="h-2 bg-gray-200 rounded animate-pulse" />
            <div className="flex justify-between">
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const variance = data.current_progress - data.expected_progress;
  const isAhead = variance > 0;
  const isBehind = variance < -10; // Considera atrasado se mais de 10% abaixo do esperado

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Progresso dos Objetivos</CardTitle>
        <div className="flex items-center gap-2">
          <StatusColorBadge status={data.status_color} />
          <Target className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progresso principal */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">
                {data.current_progress.toFixed(1)}%
              </span>
              <TrendIndicator 
                direction={data.trend_direction}
                percentage={data.trend_percentage}
                size="sm"
              />
            </div>
            
            <ProgressBar
              current={data.current_progress}
              expected={data.expected_progress}
              showComparison={true}
              size="lg"
            />
          </div>

          {/* Informações dos objetivos */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-1 text-gray-600 mb-1">
                <Target className="h-3 w-3" />
                <span>Atual</span>
              </div>
              <span className="font-medium">
                {data.current_progress.toFixed(1)}%
              </span>
            </div>
            
            <div>
              <div className="flex items-center gap-1 text-gray-600 mb-1">
                <CheckCircle className="h-3 w-3" />
                <span>Meta</span>
              </div>
              <span className="font-medium text-nobug-600">
                {data.expected_progress.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Variação e status */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Variação</span>
              <span className={`text-sm font-medium ${
                isAhead ? 'text-green-600' : isBehind ? 'text-red-600' : 'text-gray-900'
              }`}>
                {variance > 0 ? '+' : ''}{variance.toFixed(1)}%
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {isAhead 
                ? '🎯 Equipe está acima da meta esperada' 
                : isBehind 
                ? '⚠️ Progresso abaixo do esperado' 
                : '✅ Progresso dentro do esperado'
              }
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressCard; 