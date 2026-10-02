import React from 'react';
import {
  FileAudio,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  Filter,
  Sliders,
  Sparkles,
  Play,
  Hash,
  Clock,
  ArrowUpDown,
  Plus,
} from 'lucide-react';
import { useVocalShield } from '../context/VocalShieldContext';
import { AuditStatus, RiskLevel, VerdictType, VoiceDetectionAudit } from '../types';

export const VoiceAuditsView: React.FC = () => {
  const {
    audits,
    openAuditToEdit,
    searchQuery,
    filterStatus,
    setFilterStatus,
    filterRisk,
    setFilterRisk,
    isQuickEditMode,
    updateAudit,
    setActiveTab,
  } = useVocalShield();

  // Filter and search
  const filteredAudits = audits.filter((audit) => {
    const matchesSearch =
      audit.audioName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audit.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audit.callerChannel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audit.detectedSynthesizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audit.verdict.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || audit.status === filterStatus;
    const matchesRisk = filterRisk === 'all' || audit.riskLevel === filterRisk;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'critical':
        return 'bg-rose-950/80 text-rose-300 border-rose-800/80';
      case 'high':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/80';
      case 'medium':
        return 'bg-yellow-950/80 text-yellow-300 border-yellow-800/80';
      case 'low':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80';
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Header controls bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
        
        {/* Filters */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-400 font-medium">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Filter Status:</span>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:ring-1 focus:ring-cyan-500"
          >
            <option value="all">All Statuses</option>
            <option value="Under Review">Under Review</option>
            <option value="Confirmed Deepfake">Confirmed Deepfake</option>
            <option value="Cleared Authentic">Cleared Authentic</option>
            <option value="Escalated to SOC">Escalated to SOC</option>
          </select>

          <div className="flex items-center space-x-1.5 text-slate-400 font-medium ml-2">
            <span>Risk Level:</span>
          </div>
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:ring-1 focus:ring-cyan-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Count & New button */}
        <div className="flex items-center justify-between sm:justify-end space-x-3 text-xs">
          <span className="text-slate-400 font-medium">
            Showing <strong className="text-slate-200">{filteredAudits.length}</strong> of{' '}
            <strong className="text-slate-200">{audits.length}</strong> audits
          </span>

          <button
            onClick={() => setActiveTab('live-detector')}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-600/90 hover:bg-cyan-500 text-white font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Analyze New Voice</span>
          </button>
        </div>

      </div>

      {/* Audits List */}
      {filteredAudits.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
          <FileAudio className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No matching voice audits found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try resetting your search query or status filter to see all audited voice calls.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredAudits.map((audit) => (
            <div
              key={audit.id}
              className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all shadow-sm group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                
                {/* Left side: status icon, title, meta */}
                <div className="flex items-start space-x-3.5 min-w-0">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                      audit.isAiVoice
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {audit.isAiVoice ? (
                      <ShieldAlert className="w-5 h-5" />
                    ) : (
                      <ShieldCheck className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {audit.id}
                      </span>

                      {/* Severity pill */}
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getRiskBadge(
                          audit.riskLevel
                        )}`}
                      >
                        {audit.riskLevel}
                      </span>

                      {/* Synthesizer pill */}
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800">
                        Synthesizer: {audit.detectedSynthesizer}
                      </span>

                      {/* Timestamp */}
                      <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{audit.timestamp}</span>
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white tracking-tight truncate">
                      {audit.audioName}
                    </h3>

                    <div className="text-xs text-slate-400 flex items-center space-x-3">
                      <span className="font-mono text-slate-400">{audit.callerChannel}</span>
                      <span>•</span>
                      <span>Duration: {audit.audioDuration}</span>
                      {audit.lastModified && (
                        <>
                          <span>•</span>
                          <span className="text-amber-400/90 text-[11px]">Edited by {audit.modifiedBy}</span>
                        </>
                      )}
                    </div>

                    {/* Forensic Notes Preview */}
                    <p className="text-xs text-slate-300 line-clamp-1 italic pt-0.5">
                      &quot;{audit.notes}&quot;
                    </p>
                  </div>
                </div>

                {/* Right side: AI prob meter, quick controls & OPEN BUTTON */}
                <div className="flex items-center justify-between lg:justify-end space-x-4 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800/80">
                  
                  {/* AI Likelihood Bar */}
                  <div className="text-right w-36 shrink-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400 text-[11px]">Synthetic Likelihood</span>
                      <span
                        className={`font-mono font-bold ${
                          audit.isAiVoice ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {audit.aiProbability}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          audit.isAiVoice ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${audit.aiProbability}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Conf: {audit.confidenceScore}%
                    </div>
                  </div>

                  {/* Inline Quick Edit (when enabled) */}
                  {isQuickEditMode && (
                    <div className="flex items-center space-x-2 shrink-0 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                      <select
                        value={audit.status}
                        onChange={(e) =>
                          updateAudit({ ...audit, status: e.target.value as AuditStatus })
                        }
                        className="bg-slate-900 border border-slate-700 text-xs rounded px-2 py-1 text-slate-200"
                        title="Inline quick-change status"
                      >
                        <option value="Under Review">Under Review</option>
                        <option value="Confirmed Deepfake">Confirmed Deepfake</option>
                        <option value="Cleared Authentic">Cleared Authentic</option>
                        <option value="Escalated to SOC">Escalated to SOC</option>
                      </select>
                    </div>
                  )}

                  {/* PROMINENT "OPEN TO MAKE CHANGES" BUTTON */}
                  <button
                    onClick={() => openAuditToEdit(audit)}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/40 hover:border-cyan-500 text-xs font-bold rounded-lg transition-all shadow-sm shrink-0"
                    title="Open this audit record to inspect acoustics, edit verdict, and make changes"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open to Make Changes</span>
                  </button>

                </div>

              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
