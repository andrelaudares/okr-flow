import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, CheckCircle, AlertTriangle, Clock, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ObjectivesCount } from '@/types/dashboard';

interface ObjectivesCountCardProps {
  data: ObjectivesCount;
  isLoading?: boolean;
}

const ObjectivesCountCard: React.FC<ObjectivesCountCardProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Objetivos por Status</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusItems = [
    {
      label: 'Concluídos',
      count: data.completed,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      label: 'No Prazo',
      count: data.on_track,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      label: 'Em Risco',
      count: data.at_risk,
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      label: 'Atrasados',
      count: data.behind,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      label: 'Planejados',
      count: data.planned,
      icon: Clock,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    }
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Objetivos por Status</CardTitle>
        <Target className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Total */}
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-nobug-600">{data.total}</span>
          </div>

          {/* Status breakdown */}
          <div className="space-y-2">
            {statusItems.map((item) => {
              const Icon = item.icon;
              const percentage = data.total > 0 ? (item.count / data.total) * 100 : 0;
              
              return (
                <div key={item.label} className="flex items-center justify-between group">
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded ${item.bgColor}`}>
                      <Icon className={`h-3 w-3 ${item.color}`} />
                    </div>
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {item.count}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${item.color} ${item.borderColor} ${item.bgColor}`}
                    >
                      {percentage.toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Performance metrics */}
          <div className="pt-3 border-t border-gray-100 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Taxa de Conclusão</span>
              <span className="font-medium text-green-600">
                {data.completion_rate.toFixed(1)}%
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Taxa no Prazo</span>
              <span className="font-medium text-blue-600">
                {data.on_track_rate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ObjectivesCountCard; 