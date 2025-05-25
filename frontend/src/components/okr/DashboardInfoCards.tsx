
import React from "react";
import { CalendarDays, CalendarRange, CalendarPlus, Percent, CheckCircle, TrendingUp, TrendingDown, Target } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Objective } from "@/types/okr";
import { getRemainingQuarterDays, getRemainingYearDays } from "@/utils/dateUtils";

interface DashboardInfoCardsProps {
  objectives: Objective[];
}

const PERIODS = [
  { value: "todos", label: "Todos os períodos" },
  { value: "1", label: "1º Trimestre" },
  { value: "2", label: "2º Trimestre" },
  { value: "3", label: "3º Trimestre" },
  { value: "4", label: "4º Trimestre" },
];

const DashboardInfoCards: React.FC<DashboardInfoCardsProps> = ({ objectives }) => {
  // Calculate days remaining for trimester and year
  const diasTrimestre = getRemainingQuarterDays();
  const diasAno = getRemainingYearDays();
  const currentDate = new Date(); // Add the currentDate variable definition here
  const dataAtual = currentDate.toLocaleDateString('pt-BR');

  // Calcular evolução geral dos OKRs
  const progressoGeral = objectives.length > 0
    ? Math.round(objectives.reduce((acc, obj) => acc + obj.progress, 0) / objectives.length)
    : 0;
    
  // Calcular objetivos concluídos
  const objetivosConcluidos = objectives.filter(obj => obj.progress === 100).length;

  // Calcular % previsto com base na data atual
  const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
  const totalDaysInYear = 365 + (currentDate.getFullYear() % 4 === 0 ? 1 : 0);
  const daysPassed = Math.ceil((currentDate.getTime() - startOfYear.getTime()) / (1000 * 3600 * 24));
  const percentagePrevisto = Math.round((daysPassed / totalDaysInYear) * 100);
  
  // Determinar status do progresso
  const difference = progressoGeral - percentagePrevisto;
  let statusInfo;
  if (difference >= 10) {
    statusInfo = { label: "Adiantado", color: "text-green-600", bgColor: "bg-green-50", icon: <TrendingUp className="w-6 h-6 text-green-600" /> };
  } else if (difference >= -5) {
    statusInfo = { label: "Em dia", color: "text-blue-600", bgColor: "bg-blue-50", icon: <CheckCircle className="w-6 h-6 text-blue-600" /> };
  } else {
    statusInfo = { label: "Atrasado", color: "text-amber-600", bgColor: "bg-amber-50", icon: <TrendingDown className="w-6 h-6 text-amber-600" /> };
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <div className="bg-gradient-to-br from-blue-50 to-white flex items-center gap-3 rounded-lg border border-blue-100 p-4 shadow-sm hover:shadow-md transition-all">
        <div className="p-2 rounded-full bg-blue-100 text-blue-600">
          <CalendarDays className="w-6 h-6" />
        </div>
        <div>
          <div className="text-sm text-gray-500 font-medium">Trimestre</div>
          <div className="font-bold text-lg text-gray-800">{diasTrimestre} dias</div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-purple-50 to-white flex items-center gap-3 rounded-lg border border-purple-100 p-4 shadow-sm hover:shadow-md transition-all">
        <div className="p-2 rounded-full bg-purple-100 text-purple-600">
          <CalendarRange className="w-6 h-6" />
        </div>
        <div>
          <div className="text-sm text-gray-500 font-medium">Ano</div>
          <div className="font-bold text-lg text-gray-800">{diasAno} dias</div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-green-50 to-white flex items-center gap-3 rounded-lg border border-green-100 p-4 shadow-sm hover:shadow-md transition-all">
        <div className="p-2 rounded-full bg-green-100 text-green-600">
          <CalendarPlus className="w-6 h-6" />
        </div>
        <div>
          <div className="text-sm text-gray-500 font-medium">Data atual</div>
          <div className="font-bold text-lg text-gray-800">{dataAtual}</div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-indigo-50 to-white flex items-center gap-3 rounded-lg border border-indigo-100 p-4 shadow-sm hover:shadow-md transition-all">
        <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
          {statusInfo.icon}
        </div>
        <div>
          <div className="text-sm text-gray-500 font-medium">Evolução</div>
          <div className="font-bold text-lg text-gray-800">
            {progressoGeral}% <span className="text-xs font-normal text-gray-500">de {percentagePrevisto}% previsto</span>
          </div>
          <div className="text-xs mt-1">
            <span className={`${statusInfo.color} font-medium`}>{statusInfo.label}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-amber-50 to-white flex items-center gap-3 rounded-lg border border-amber-100 p-4 shadow-sm hover:shadow-md transition-all">
        <div className="p-2 rounded-full bg-amber-100 text-amber-600">
          <Target className="w-6 h-6" />
        </div>
        <div>
          <div className="text-sm text-gray-500 font-medium">Objetivos</div>
          <div className="font-bold text-lg text-gray-800">{objectives.length}</div>
          <div className="text-xs mt-1 text-gray-500">
            {objetivosConcluidos} concluídos / {objectives.length} total
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardInfoCards;
