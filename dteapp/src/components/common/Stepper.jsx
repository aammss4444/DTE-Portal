import React from 'react';
import { Check, Circle } from 'lucide-react';
import { cn } from '../../utils/cn';

const Stepper = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center w-full max-w-3xl mx-auto mb-12">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        
        return (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center relative flex-1">
              <div 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 z-10",
                  isCompleted ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : 
                  isActive ? "bg-white border-2 border-indigo-600 text-indigo-600 shadow-md" : 
                  "bg-white border-2 border-slate-200 text-slate-400"
                )}
              >
                {isCompleted ? <Check size={18} strokeWidth={3} /> : <span className="text-sm font-bold">{index + 1}</span>}
              </div>
              <div className="mt-3 text-center">
                <p className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  isActive ? "text-indigo-600" : isCompleted ? "text-slate-900" : "text-slate-400"
                )}>
                  {step.label}
                </p>
                <p className="text-[9px] font-medium text-slate-400 mt-0.5 whitespace-nowrap">
                  {step.description}
                </p>
              </div>
            </div>
            
            {index < steps.length - 1 && (
              <div className="w-full h-[2px] -mt-10 mx-2 bg-slate-100 relative">
                <div 
                  className="absolute top-0 left-0 h-full bg-indigo-600 transition-all duration-700 ease-in-out"
                  style={{ width: isCompleted ? '100%' : '0%' }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Stepper;
