
import { DataPoint } from '../types/chart-types';

// Generate projected progress data points based on time elapsed in the year
export const generateProjectedData = (originalData: DataPoint[]) => {
  if (!originalData || originalData.length === 0) return [];
  
  return originalData.map(point => {
    const currentDate = new Date(point.date);
    
    // Calculate projected value based on current date's position in the year
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const endOfYear = new Date(currentDate.getFullYear(), 11, 31);
    const totalDaysInYear = (endOfYear.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24);
    const daysPassed = (currentDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24);
    const projectedValue = Math.round((daysPassed / totalDaysInYear) * 100);
    
    return {
      ...point,
      projected: projectedValue
    };
  });
};

// Calculate the current percentage based on day of year
export const calculateCurrentYearPercentage = () => {
  const currentDate = new Date();
  const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
  const endOfYear = new Date(currentDate.getFullYear(), 11, 31);
  const totalDaysInYear = (endOfYear.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24);
  const daysPassed = (currentDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24);
  return Math.round((daysPassed / totalDaysInYear) * 100);
};

// Calculate average progress
export const calculateAverage = (data: DataPoint[]) => {
  if (!data || data.length === 0) return 0;
  const sum = data.reduce((acc, item) => acc + item.value, 0);
  return Math.round(sum / data.length);
};
