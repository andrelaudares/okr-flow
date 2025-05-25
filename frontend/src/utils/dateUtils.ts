
/**
 * Formats a date to a string format dd/mm/yyyy
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('pt-BR');
};

/**
 * Calculates the number of days remaining in the current quarter
 */
export const getRemainingQuarterDays = (): number => {
  const currentDate = new Date();
  const currentQuarter = Math.floor(currentDate.getMonth() / 3);
  const endOfQuarter = new Date(currentDate.getFullYear(), (currentQuarter + 1) * 3, 0);
  
  // Calculate the difference in days
  const diffTime = endOfQuarter.getTime() - currentDate.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 3600 * 24)));
};

/**
 * Calculates the number of days remaining in the current year
 */
export const getRemainingYearDays = (): number => {
  const currentDate = new Date();
  const endOfYear = new Date(currentDate.getFullYear(), 11, 31);
  
  // Calculate the difference in days
  const diffTime = endOfYear.getTime() - currentDate.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 3600 * 24)));
};
