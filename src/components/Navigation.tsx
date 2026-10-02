import React from 'react';
import { FileAudio, Shield, BellRing, Mic, Edit3 } from 'lucide-react';
import { useVocalShield } from '../context/VocalShieldContext';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, audits, threatAlerts, isQuickEditMode, setIsQuickEditMode } =
    useVocalShield();

  const activeAlertsCount = threatAlerts.filter((t) => t.status === 'Active Threat').length;

  return (
    <nav className="border-b border-slate-800 bg-slate-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-2">
          
          {/* Tab buttons */}
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              id="tab-live-detector"
              onClick={() => setActiveTab('live-detector')}
              className={`inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'live-detector'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30 ring-1 ring-cyan-400'
                  : 'text-cyan-300 hover:text-white hover:bg-cyan-950/60 border border-cyan-850'
              }`}
            >
              <Mic className="w-4 h-4 text-cyan-300" />
              <span>AI Voice Detector (Mic & Upload)</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-950 text-cyan-200 border border-cyan-800">
                Primary
              </span>
            </button>

            <button
              id="tab-audits"
              onClick={() => setActiveTab('audits')}
              className={`inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'audits'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileAudio className="w-4 h-4" />
              <span>Voice Audits & Forensics</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                {audits.length}
              </span>
            </button>

            <button
              id="tab-threats"
              onClick={() => setActiveTab('threats')}
              className={`inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'threats'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BellRing className="w-4 h-4" />
              <span>Threat Alerts & Incidents</span>
              {activeAlertsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800/80">
                  {activeAlertsCount}
                </span>
              )}
            </button>

            <button
              id="tab-policies"
              onClick={() => setActiveTab('policies')}
              className={`inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'policies'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Defense Policies</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                Active
              </span>
            </button>
          </div>

          {/* Quick-edit mode switch */}
          {activeTab === 'audits' && (
            <div className="flex items-center space-x-2 self-end sm:self-auto">
              <label className="flex items-center space-x-2 cursor-pointer bg-slate-950/80 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg text-xs transition-colors">
                <input
                  type="checkbox"
                  checked={isQuickEditMode}
                  onChange={(e) => setIsQuickEditMode(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0 focus:ring-offset-0 bg-slate-900"
                />
                <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-300 font-medium">Quick Inline Edit Mode</span>
              </label>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
};
