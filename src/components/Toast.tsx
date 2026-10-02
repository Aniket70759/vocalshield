import React from 'react';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { useVocalShield } from '../context/VocalShieldContext';

export const Toast: React.FC = () => {
  const { toastMessage } = useVocalShield();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div
        className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl border shadow-2xl text-xs font-semibold backdrop-blur-md ${
          toastMessage.type === 'success'
            ? 'bg-emerald-950/90 text-emerald-200 border-emerald-700/80 shadow-emerald-900/30'
            : toastMessage.type === 'warn'
            ? 'bg-amber-950/90 text-amber-200 border-amber-700/80 shadow-amber-900/30'
            : 'bg-cyan-950/90 text-cyan-200 border-cyan-700/80 shadow-cyan-900/30'
        }`}
      >
        {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
        {toastMessage.type === 'warn' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
        {toastMessage.type === 'info' && <Info className="w-4 h-4 text-cyan-400 shrink-0" />}
        <span>{toastMessage.text}</span>
      </div>
    </div>
  );
};
