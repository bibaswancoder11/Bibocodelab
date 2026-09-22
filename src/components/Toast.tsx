import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-10 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => onDismiss(t.id)}
          className={`pointer-events-auto flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs shadow-xl transition-all animate-in slide-in-from-bottom-2 ${
            t.type === 'success'
              ? 'bg-[#101826] border-emerald-500/40 text-emerald-300'
              : t.type === 'error'
              ? 'bg-[#1a1016] border-rose-500/40 text-rose-300'
              : 'bg-[#121624] border-indigo-500/40 text-indigo-300'
          }`}
        >
          {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          {t.type === 'info' && <Info className="w-4 h-4 text-indigo-400 shrink-0" />}
          <span className="font-medium text-slate-100">{t.text}</span>
        </div>
      ))}
    </div>
  );
};
