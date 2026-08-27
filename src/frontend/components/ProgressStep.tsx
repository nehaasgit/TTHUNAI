import React from 'react';

interface ProgressStepProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressStep({ currentStep, totalSteps }: ProgressStepProps) {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="w-full space-y-2">
      {/* Progress Label */}
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
        <span>Question {currentStep} of {totalSteps}</span>
        <span className="text-blue-700 font-bold">{percentage}% Completed</span>
      </div>

      {/* Progress Bar Track */}
      <div className="h-2 bg-sky-150 rounded-full overflow-hidden flex gap-1">
        {[...Array(totalSteps)].map((_, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum <= currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div
              key={idx}
              className={`h-full flex-1 transition-all duration-300 rounded-full ${
                isCurrent 
                  ? 'bg-blue-600 animate-pulse' 
                  : isActive 
                    ? 'bg-blue-600' 
                    : 'bg-sky-150'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
