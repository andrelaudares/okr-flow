
import React, { useEffect, useRef, useState } from 'react';
import { Slider } from '@/components/ui/slider';

interface ActivityProgressSliderProps {
  progress: number;
  onProgressChange: (value: number[]) => void;
  disabled: boolean;
}

const ActivityProgressSlider: React.FC<ActivityProgressSliderProps> = ({
  progress,
  onProgressChange,
  disabled
}) => {
  const [localProgress, setLocalProgress] = useState(progress);
  const [isChanging, setIsChanging] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local state with prop when prop changes and not actively changing
  useEffect(() => {
    if (!isChanging) {
      setLocalProgress(progress);
    }
  }, [progress, isChanging]);

  // Clean up any timeout when component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const handleChange = (value: number[]) => {
    console.log('Slider change initiated', { value: value[0], isChanging });

    setLocalProgress(value[0]);
    setIsChanging(true);
    onProgressChange(value);

    // Clear previous timeout if any
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      console.log('Resetting isChanging after slider interaction');
      setIsChanging(false);
    }, 300);
  };

  // Determine the color class based on progress value
  const getProgressColor = () => {
    if (localProgress >= 80) return 'bg-green-500';
    if (localProgress >= 50) return 'bg-blue-500';
    if (localProgress >= 25) return 'bg-amber-500';
    return 'bg-gray-500';
  };

  return (
    <div className="mt-3">
      <div className="flex justify-between items-center text-xs mb-1">
        <span className="text-gray-600 font-medium">Progresso</span>
        <span className={`px-2 py-0.5 rounded-full ${
          localProgress >= 80 ? 'bg-green-100 text-green-700' :
          localProgress >= 50 ? 'bg-blue-100 text-blue-700' :
          localProgress >= 25 ? 'bg-amber-100 text-amber-700' :
          'bg-gray-100 text-gray-700'
        } font-medium`}>
          {localProgress}%
        </span>
      </div>
      <Slider 
        value={[localProgress]} 
        max={100} 
        step={5}
        onValueChange={handleChange}
        disabled={disabled}
        className="cursor-pointer"
      />
      <div className="w-full h-1 mt-1 rounded-full bg-gray-100">
        <div 
          className={`h-full rounded-full transition-all duration-300 ${getProgressColor()}`} 
          style={{ width: `${localProgress}%` }}
        />
      </div>
    </div>
  );
};

export default ActivityProgressSlider;
