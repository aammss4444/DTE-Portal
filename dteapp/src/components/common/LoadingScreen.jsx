import { Loader2 } from 'lucide-react';

const LoadingScreen = ({ message = 'Loading system...' }) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center">
      <div className="relative">
        {/* Outer Glow */}
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
        
        {/* Spinner */}
        <div className="relative flex flex-col items-center space-y-6">
          <div className="relative h-20 w-20">
            <Loader2 className="h-20 w-20 text-primary animate-spin" strokeWidth={1.5} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 bg-primary/10 rounded-full border border-primary/20 animate-ping" />
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-bold tracking-tight text-foreground animate-in fade-in slide-in-from-bottom-3 duration-700">
              {message}
            </h2>
            <div className="mt-2 flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Brand Identity */}
      <div className="absolute bottom-12 flex flex-col items-center opacity-40">
        <p className="text-xs font-bold uppercase tracking-[0.2em]">Department of Technical Education</p>
        <p className="text-[10px] font-medium mt-1 uppercase tracking-widest">Portal Governance System</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
