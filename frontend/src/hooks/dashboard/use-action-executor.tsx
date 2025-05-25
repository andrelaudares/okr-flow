
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useProcessingState } from './use-processing-state';

/**
 * A hook that provides functionality to safely execute actions
 */
export const useActionExecutor = () => {
  const { isProcessing, setIsProcessing, mountedRef, lastProcessingStartTime } = useProcessingState();

  /**
   * Execute an action safely with loading state and error handling
   */
  const executeAction = useCallback(async <T,>(
    action: () => Promise<T> | T,
    options: {
      successMessage?: string;
      errorMessage?: string;
      delay?: number;
    } = {}
  ): Promise<T | undefined> => {
    const {
      successMessage,
      errorMessage = 'Erro ao processar ação. Tente novamente.',
      delay = 300
    } = options;

    if (isProcessing) {
      console.log('Action execution blocked - already processing');
      return;
    }
    
    console.log('Action execution started', { 
      successMsg: !!successMessage, 
      delay 
    });
    
    // Use a local processing state to prevent race conditions
    if (mountedRef.current) {
      setIsProcessing(true);
      lastProcessingStartTime.current = Date.now();
    }
    
    try {
      // Executa a ação
      const result = await Promise.resolve(action());
      console.log('Action completed successfully');
      
      // Exibe mensagem de sucesso apenas se o componente estiver montado
      if (successMessage && mountedRef.current) {
        toast.success(successMessage);
      }
      
      return result;
    } catch (error) {
      console.error('Error executing action:', error);
      
      // Exibe mensagem de erro apenas se o componente estiver montado
      if (mountedRef.current) {
        toast.error(errorMessage);
      }
      
      return undefined;
    } finally {
      // Add small delay to prevent UI flickering
      // and ensure the state is always updated if component is still mounted
      setTimeout(() => {
        if (mountedRef.current) {
          console.log('Resetting processing state after action');
          setIsProcessing(false);
          lastProcessingStartTime.current = null;
        }
      }, delay);
    }
  }, [isProcessing, setIsProcessing, mountedRef, lastProcessingStartTime]);

  return {
    executeAction,
    isProcessing
  };
};
