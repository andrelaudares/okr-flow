
import { HistoryDataPoint, DateRangeFilter } from './types';
import { addMonths, addWeeks, startOfMonth, startOfWeek, isAfter } from 'date-fns';

/**
 * Filter history data based on date range
 */
export const filterByDateRange = (
  historyData: HistoryDataPoint[], 
  dateRange: DateRangeFilter
): HistoryDataPoint[] => {
  if (!historyData || historyData.length === 0 || dateRange === 'all') {
    return historyData;
  }

  const now = new Date();
  let cutoffDate: Date;

  switch (dateRange) {
    case 'last7days':
      cutoffDate = addWeeks(now, -1);
      break;
    case 'last30days':
      cutoffDate = addMonths(now, -1);
      break;
    case 'last90days':
      cutoffDate = addMonths(now, -3);
      break;
    case 'thisWeek':
      cutoffDate = startOfWeek(now);
      break;
    case 'thisMonth':
      cutoffDate = startOfMonth(now);
      break;
    default:
      return historyData;
  }

  return historyData.filter(item => {
    const itemDate = new Date(item.date);
    return isAfter(itemDate, cutoffDate);
  });
};
