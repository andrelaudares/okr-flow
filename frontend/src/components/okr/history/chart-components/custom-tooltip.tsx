import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChartTheme, lightTheme } from '../chart-utils/chart-theme';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  theme?: ChartTheme;
}

const CustomTooltip = ({ 
  active, 
  payload, 
  label, 
  theme = lightTheme 
}: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    // Try to parse date if it's a valid date string
    let formattedDate = label;
    try {
      const date = new Date(label);
      if (!isNaN(date.getTime())) {
        formattedDate = format(date, 'dd/MM/yyyy', { locale: ptBR });
      }
    } catch (e) {
      // Keep the original label if date parsing fails
    }
    
    return (
      <div 
        className="p-3 border rounded-xl shadow-lg" 
        style={{ 
          backgroundColor: theme.tooltipBackground,
          borderColor: theme.tooltipBorder,
          color: theme.textColor
        }}
      >
        <p className="text-sm font-medium mb-1" style={{ color: theme.textColor }}>
          {formattedDate}
        </p>
        <div className="space-y-1.5">
          {payload.map((entry: any) => (
            <p key={entry.name} className="text-sm flex items-center gap-2">
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="font-medium">{entry.name}:</span> 
              <span>{entry.name.includes('Progress') || entry.name.includes('Previsto') ? `${entry.value}%` : entry.value}</span>
            </p>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default CustomTooltip;
