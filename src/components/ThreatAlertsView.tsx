import React, { useState } from 'react';
import {
  BellRing,
  ShieldAlert,
  AlertTriangle,
  PhoneOff,
  KeyRound,
  Radio,
  Clock,
  ExternalLink,
  Plus,
  Filter,
  CheckCircle,
  Zap,
} from 'lucide-react';
import { useVocalShield } from '../context/VocalShieldContext';
import { AlertPriority, ThreatAlertLog, ThreatAlertStatus } from '../types';

export const ThreatAlertsView: React.FC = () => {
  const { threatAlerts, openAlertToEdit, addNewThreatAlert, searchQuery } = useVocalShield();

  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredAlerts = threatAlerts.filter((alert) => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.sourceLine.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getPriorityBadge = (priority: AlertPriority) => {
    switch (priority) {
      case 'critical':
        return 'bg-rose-950/80 text-rose-300 border-rose-800/80';
      case 'high':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/80';
      case 'medium':
        return 'bg-yellow-950/80 text-yellow-300 border-yellow-800/80';
      case 'low':
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getStatusBadge = (status: ThreatAlertStatus) => {
    switch (status) {
      case 'Active Threat':
        return 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse';
      case 'Under Review':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'Mitigated':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'False Positive':
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const handleSimulateAttack = () => {
    const attackNames = [
      'Inbound CFO Wire Request on PBX Line 09 (ElevenLabs Clone)',
      'Account Takeover Attempt via IVR Voice Reset (Vishing Bot)',
      'Synthetic Voiceprint Replay Attack during VIP Balance Inquiry',
      'International Route Spoofing with Zero Micro-Jitter (XTTS-v2)',
    ];
    const pickedTitle = attackNames[Math.floor(Math.random() * attackNames.length)];

    const newAlert: ThreatAlertLog = {
      id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
      title: pickedTitle,
      detail:
        'Acoustic energy distribution indicates synthetic vocoder harmonics. Fundamental frequency micro-jitter measured at 0.06% (below natural human vocal threshold of 0.8%).',
      type: 'threat',
      status: 'Active Threat',
      priority: 'critical',
      sourceLine: `Inbound SIP Line #${Math.floor(1 + Math.random() * 16)}`,
      detectedRisk: Math.floor(88 + Math.random() * 11),
      recommendedAction: 'Automated Session Termination + Analyst Review',
      timestamp: 'Just now',
      assignedAnalyst: 'Aniketh Siluveru',
    };

    addNewThreatAlert(newAlert);
  };

  return (
    <div className="space-y-4">
      
      {/* Header filter & Simulation button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
        
        <div className="flex items-center space-x-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400 font-medium">Triage Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:ring-1 focus:ring-cyan-500"
          >
            <option value="all">All Incidents</option>
            <option value="Active Threat">Active Threat</option>
            <option value="Under Review">Under Review</option>
            <option value="Mitigated">Mitigated</option>
            <option value="False Positive">False Positive</option>
          </select>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="text-slate-400">
            <strong>{filteredAlerts.length}</strong> incidents recorded
          </span>

          <button
            onClick={handleSimulateAttack}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600/90 hover:bg-rose-500 text-white font-semibold rounded-lg shadow-sm transition-colors"
            title="Inject simulated synthetic call into the PBX feed to test defense responses"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate Incoming Attack Call</span>
          </button>
        </div>

      </div>

      {/* Threat Cards List */}
      {filteredAlerts.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
          <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No active threat alerts matching filter</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            All current voice traffic conforms to baseline acoustic integrity models. Click &quot;Simulate Incoming Attack Call&quot; to test a deepfake event.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all shadow-sm group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                
                {/* Alert info */}
                <div className="flex items-start space-x-3.5 min-w-0">
                  <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 shrink-0 mt-0.5">
                    <ShieldAlert className="w-5 h-5" />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {alert.id}
                      </span>

                      {/* Status */}
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                          alert.status
                        )}`}
                      >
                        {alert.status}
                      </span>

                      {/* Priority */}
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full border uppercase ${getPriorityBadge(
                          alert.priority
                        )}`}
                      >
                        {alert.priority}
                      </span>

                      {/* Line */}
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                        {alert.sourceLine}
                      </span>

                      {/* Timestamp */}
                      <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{alert.timestamp}</span>
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white tracking-tight">
                      {alert.title}
                    </h3>

                    <p className="text-xs text-slate-300 line-clamp-2">
                      {alert.detail}
                    </p>

                    <div className="text-xs text-slate-400 flex items-center space-x-3 pt-1">
                      <span className="text-cyan-400 font-medium">
                        Recommended: {alert.recommendedAction}
                      </span>
                      {alert.incidentActionTaken && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400/90 text-[11px]">
                            Action Logged: {alert.incidentActionTaken}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Risk Gauge & Open to Make Changes Button */}
                <div className="flex items-center justify-between lg:justify-end space-x-4 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800/80 shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                      Detected Risk
                    </div>
                    <div className="text-base font-extrabold font-mono text-rose-400">
                      {alert.detectedRisk}%
                    </div>
                  </div>

                  {/* PROMINENT "OPEN TO MAKE CHANGES" BUTTON */}
                  <button
                    onClick={() => openAlertToEdit(alert)}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/40 hover:border-cyan-500 text-xs font-bold rounded-lg transition-all shadow-sm"
                    title="Open this threat incident to change status, assign analyst, or execute mitigation"
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
