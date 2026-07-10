import { X } from 'lucide-react';
import { Button } from './UIComponents';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative bg-background border border-border w-full rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 ${
        size === 'sm' ? 'max-w-md' :
        size === 'lg' ? 'max-w-3xl' :
        size === 'xl' ? 'max-w-5xl' :
        size === 'full' ? 'max-w-[90vw]' :
        'max-w-2xl'
      }`}>
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <Button variant="ghost" onClick={onClose} className="p-2 h-auto hover:bg-muted rounded-full">
            <X size={20} />
          </Button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
