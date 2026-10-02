import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldAlert,
  Save,
  Trash2,
  PhoneOff,
  KeyRound,
  Radio,
  CheckCircle,
  Clock,
  User,
  AlertTriangle,
} from 'lucide-react';
import { useVocalShield } from '../context/VocalShieldContext';
import { AlertPriority, ThreatAlertLog, ThreatAlertStatus } from '../types';

export const AlertDetailModal: React.FC = () => {
  const { selectedAlertToEdit, closeAlertEditor, updateThreatAlert, deleteThreatAlert, showToast } =
    useVocalShield();

  const [formData, setFormData] = useState<ThreatAlertLog | null>(null);

  useEffect(() => {
    if (selectedAlertToEdit) {
      setFormData({ ...selectedAlertToEdit });
    }
  }, [selectedAlertToEdit]);

  if (!selectedAlertToEdit || !formData) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    updateThreatAlert(formData);
    closeAlertEditor();
  };

  const handleActionClick = (actionName: string) => {
    const updatedNotes = formData.incidentActionTaken
      ? `${formData.incidentActionTaken} | ${actionName} (${new Date().toLocaleTimeString()})`
      : `${actionName} (${new Date().toLocaleTimeString()})`;

    setFormData({
      ...formData,
      status: actionName.includes('Drop') || actionName.includes('Challenge') ? 'Mitigated' : formData.status,
      incidentActionTaken: updatedNotes,
    });

    showToast(`Executed Action: ${actionName}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                  {formData.id}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {formData.sourceLine}
                </span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight mt-0.5">
                {formData.title}
              </h2>
            </div>
          </div>

          <button
            onClick={closeAlertEditor}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <form id="alert-edit-form" onSubmit={handleSave} className="space-y-5">
            
            {/* Incident Details Card */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Forensic Detail &amp; Trigger:</span>
                <span className="font-mono font-bold text-rose-400">
                  Detected Risk: {formData.detectedRisk}%
                </span>
              </div>
              <p className="text-slate-200 leading-relaxed font-sans text-sm">
                {formData.detail}
              </p>
              <div className="pt-2 flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>Captured: {formData.timestamp}</span>
              </div>
            </div>

            {/* Change Status & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Triage Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as ThreatAlertStatus,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="Active Threat">Active Threat</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Mitigated">Mitigated</option>
                  <option value="False Positive">False Positive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Severity Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: e.target.value as AlertPriority,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Assigned Analyst */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Assigned Forensic Analyst
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.assignedAnalyst}
                  onChange={(e) =>
                    setFormData({ ...formData, assignedAnalyst: e.target.value })
                  }
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Recommended & Action Taken */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mitigation Action History / Analyst Notes
              </label>
              <textarea
                rows={3}
                value={formData.incidentActionTaken || ''}
                onChange={(e) =>
                  setFormData({ ...formData, incidentActionTaken: e.target.value })
                }
                placeholder="Log actions executed, customer callbacks, or trunk disconnect reasons..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            {/* Quick Action Trigger Buttons */}
            <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
              <span className="text-xs font-bold text-slate-300">
                Execute Immediate Counter-Measures:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleActionClick('Force PBX SIP Session Disconnect')}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-lg transition-colors text-left"
                >
                  <PhoneOff className="w-3.5 h-3.5 shrink-0" />
                  <span>Force Drop Line</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleActionClick('Transmit FIDO2 Mobile Push Challenge')}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 border border-blue-800/60 rounded-lg transition-colors text-left"
                >
                  <KeyRound className="w-3.5 h-3.5 shrink-0" />
                  <span>Push MFA Challenge</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleActionClick('Inject Agent Whisper Warning')}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60 rounded-lg transition-colors text-left"
                >
                  <Radio className="w-3.5 h-3.5 shrink-0" />
                  <span>Inject Whisper Alert</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleActionClick('Mark Verified False Positive')}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 rounded-lg transition-colors text-left"
                >
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Clear as Verified</span>
                </button>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <button
            type="button"
            onClick={() => deleteThreatAlert(formData.id)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 border border-rose-900/60 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Dismiss Alert</span>
          </button>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={closeAlertEditor}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="alert-edit-form"
              className="inline-flex items-center space-x-2 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Incident Changes</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
