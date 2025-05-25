
import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Percent, Calendar, Activity, Target, CheckCircle } from 'lucide-react';
import { Objective } from '@/types/okr';
import { SummaryMetricsProps } from './history-props';

const SummaryMetrics: React.FC<SummaryMetricsProps> = ({ 
  data = [], 
  objectives = [], 
  overallProgress = 0 
}) => {
  // Calculate metrics based on objectives
  const totalObjectives = objectives.length;
  
  // Calculate completed objectives (progress = 100%)
  const completedObjectives = objectives.filter(obj => obj.progress === 100).length;
  
  const totalActivities = objectives.reduce(
    (sum, obj) => sum + obj.activities.length, 
    0
  );
  
  const completedActivities = objectives.reduce(
    (sum, obj) => sum + obj.activities.filter(a => a.progress === 100).length, 
    0
  );
  
  const completionRate = totalActivities > 0 
    ? Math.round((completedActivities / totalActivities) * 100) 
    : 0;
  
  // Calculate percentage expected based on current date in the year
  const percentagePrevisto = useMemo(() => {
    const currentDate = new Date();
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const totalDaysInYear = 365 + (currentDate.getFullYear() % 4 === 0 ? 1 : 0);
    const daysPassed = Math.ceil((currentDate.getTime() - startOfYear.getTime()) / (1000 * 3600 * 24));
    return Math.round((daysPassed / totalDaysInYear) * 100);
  }, []);
  
  // Calculate progress status (ahead, on track, behind)
  const progressStatus = useMemo(() => {
    const difference = overallProgress - percentagePrevisto;
    if (difference >= 10) return { status: 'ahead', label: 'Adiantado', color: 'text-green-600', bgColor: 'bg-green-50', icon: <TrendingUp className="h-6 w-6 text-green-600" /> };
    if (difference >= -5) return { status: 'on-track', label: 'Em dia', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: <CheckCircle className="h-6 w-6 text-blue-600" /> };
    return { status: 'behind', label: 'Atrasado', color: 'text-amber-600', bgColor: 'bg-amber-50', icon: <TrendingDown className="h-6 w-6 text-amber-600" /> };
  }, [overallProgress, percentagePrevisto]);

  // Calculate trend (whether progress is up from last month)
  const progressTrend = useMemo(() => {
    if (data && data.length >= 2) {
      const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const lastIndex = sortedData.length - 1;
      const lastButOneIndex = lastIndex - 1;
      return sortedData[lastIndex].value >= sortedData[lastButOneIndex].value;
    }
    return Math.random() > 0.3; // Fallback
  }, [data]);

  const progressChange = useMemo(() => {
    if (data && data.length >= 2) {
      const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const lastIndex = sortedData.length - 1;
      const lastButOneIndex = lastIndex - 1;
      return Math.abs(sortedData[lastIndex].value - sortedData[lastButOneIndex].value);
    }
    return Math.round(Math.random() * 10); // Fallback
  }, [data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Progresso Geral</p>
            <p className="text-2xl font-bold mt-1">
              {overallProgress}% <span className="text-xs font-normal text-gray-500">de {percentagePrevisto}% previsto</span>
            </p>
          </div>
          <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${progressStatus.bgColor}`}>
            {progressStatus.icon}
          </div>
        </div>
        <div className="mt-3 text-sm flex items-center">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${progressStatus.bgColor} ${progressStatus.color}`}>
            {progressStatus.label}
          </span>
          <span className="text-gray-500 ml-2">
            {progressStatus.status === 'on-track' ? 'em relação ao previsto' : 
             progressStatus.status === 'ahead' ? `+${overallProgress - percentagePrevisto}% que o previsto` :
             `${overallProgress - percentagePrevisto}% que o previsto`}
          </span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">% Previsto</p>
            <p className="text-2xl font-bold mt-1">{percentagePrevisto}%</p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
            <Percent className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="mt-3 text-sm">
          <span className="text-gray-500">Baseado no calendário anual</span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Objetivos</p>
            <p className="text-2xl font-bold mt-1">{totalObjectives}</p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
            <Target className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="mt-3 text-sm">
          <span className="text-gray-500">
            {completedObjectives} concluídos / {totalObjectives} total
          </span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Taxa de Conclusão</p>
            <p className="text-2xl font-bold mt-1">{completionRate}%</p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-purple-50 flex items-center justify-center">
            <Activity className="h-6 w-6 text-purple-600" />
          </div>
        </div>
        <div className="mt-3 text-sm">
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div 
              className="bg-purple-500 h-1.5 rounded-full" 
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <span className="text-gray-500 text-xs mt-1 block">Das atividades planejadas</span>
        </div>
      </div>
    </div>
  );
};

export default SummaryMetrics;
