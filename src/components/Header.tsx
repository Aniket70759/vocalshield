import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        
        {/* Brand only */}
        <div className="flex items-center space-x-3.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 shadow-lg shadow-cyan-500/20 text-white">
            <ShieldAlert className="w-5 h-5 text-white animate-pulse" />

            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-slate-900"></div>
          </div>

          <div>
            <span className="text-lg font-bold tracking-tight text-white">
              VocalShield<span className="text-cyan-400">.AI</span>
            </span>
          </div>
        </div>

      </div>
    </header>
  );
};
