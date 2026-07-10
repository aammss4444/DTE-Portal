import { cn } from '../../utils/cn';
import { ChevronDown } from 'lucide-react';


export const Button = ({ children, variant = 'primary', size = 'md', className, ...props }) => {
  const variants = {
    primary: 'bg-white text-slate-900 hover:bg-slate-100 border border-slate-200 shadow-sm',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
    accent: 'bg-white text-slate-900 hover:bg-slate-100 border border-slate-200 shadow-sm',
    outline: 'border border-border bg-transparent hover:bg-muted text-foreground',
    ghost: 'bg-transparent hover:bg-muted text-foreground',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={cn(
        'flex items-center justify-center rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};


export const Input = ({ label, error, className, ...props }) => {
  return (
    <div className={cn('w-full', className)}>
      {label && <label className="block text-sm font-medium text-secondary mb-1.5">{label}</label>}
      <input
        className={cn(
          'w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-accent outline-none transition-all',
          error && 'border-red-500 focus:ring-red-500'
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{typeof error === 'object' ? (error.message || JSON.stringify(error)) : error}</p>}
    </div>
  );
};
export const Select = ({ label, options, children, error, className, icon: Icon, ...props }) => {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <select
          className={cn(
            'w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer hover:border-slate-300',
            Icon && 'pl-11',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
          )}
          {...props}
        >
          {options ? options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          )) : children}
        </select>

        {/* Custom Chevron */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
          <ChevronDown size={14} />
        </div>

        {/* Optional Leading Icon */}
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
            <Icon size={18} />
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 ml-1 text-[10px] font-bold text-red-500 uppercase tracking-tight italic animate-in fade-in slide-in-from-top-1">
          {typeof error === 'object' ? (error.message || JSON.stringify(error)) : error}
        </p>
      )}
    </div>
  );
};

// export const Select = ({ label, error, children, className, ...props }) => {
//   return (
//     <div className={cn('w-full', className)}>
//       {label && <label className="block text-sm font-medium text-secondary mb-1.5">{label}</label>}
//       <div className="relative">
//         <select
//           className={cn(
//             'w-full px-4 py-2 rounded-lg border border-border bg-background appearance-none focus:ring-2 focus:ring-accent outline-none transition-all pr-10',
//             error && 'border-red-500 focus:ring-red-500'
//           )}
//           {...props}
//         >
//           {children}
//         </select>
//         <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
//           <ChevronDown size={16} />
//         </div>
//       </div>
//       {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
//     </div>
//   );
// };
