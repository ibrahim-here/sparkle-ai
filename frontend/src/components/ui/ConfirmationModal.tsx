import React from 'react';
import { X, AlertCircle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] glass border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Glow Effect */}
        <div className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-[80px] opacity-20 ${
          variant === 'danger' ? 'bg-red-500' : 'bg-primary'
        }`} />
        
        <div className="relative p-8">
          <div className="flex items-start justify-between mb-6">
            <div className={`p-3 rounded-2xl ${
              variant === 'danger' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-primary/10 text-primary border border-primary/20'
            }`}>
              <AlertCircle size={28} />
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-2 mb-8">
            <h3 className="text-2xl font-black text-white tracking-tight leading-none uppercase">
              {title}
            </h3>
            <p className="text-white/40 font-medium text-sm leading-relaxed">
              {message}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl glass hover:bg-white/10 transition-all font-bold text-white/70 hover:text-white text-sm uppercase tracking-widest"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-6 py-4 rounded-2xl transition-all font-black text-sm uppercase tracking-widest shadow-lg ${
                variant === 'danger' 
                  ? 'bg-red-500 text-white shadow-red-500/20 hover:bg-red-600' 
                  : 'bg-primary text-white shadow-primary/20 hover:opacity-90'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
