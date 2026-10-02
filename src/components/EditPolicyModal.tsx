import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  Shield,
  PhoneOff,
  Radio,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  Server,
  DollarSign,
  Lock,
} from 'lucide-react';
import { useVocalShield } from '../context/VocalShieldContext';
import { DefensePolicyConfig } from '../types';

export const EditPolicyModal: React.FC = () => {
  const {
    isPolicyEditorOpen,
    closePolicyEditor,
    policies,
    updateDefensePolicies,
    resetPoliciesToDefault,
  } = useVocalShield();

  const [formData, setFormData] = useState<DefensePolicyConfig>({ ...policies });
  const [simulatedRisk, setSimulatedRisk] = useState<number>(78);

  useEffect(() => {
    if (isPolicyEditorOpen) {
      setFormData({ ...policies });
    }
  }, [isPolicyEditorOpen, policies]);

  if (!isPolicyEditorOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateDefensePolicies(formData);
    closePolicyEditor();
  };

  // Determine what would happen at simulatedRisk level
  const wouldTerminate = simulatedRisk >= formData.autoTerminateThreshold;
  const wouldMfa = simulatedRisk >= formData.stepUpMfaThreshold;
  const wouldWhisper = simulatedRisk >= formData.whisperAlertThreshold;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Telecom &amp; Banking Defense Policy Editor
              </h2>
              <p className="text-xs text-slate-400">
                Configure automated mitigation thresholds, PBX drop rules, and DPDP compliance
              </p>
            </div>
          </div>

          <button
            onClick={closePolicyEditor}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <form id="policy-edit-form" onSubmit={handleSave} className="space-y-6">
            
            {/* Live Policy Simulation Sandbox */}
            <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>Real-Time Threshold Simulation Sandbox</span>
                </span>
                <span className="text-xs font-mono font-bold text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                  Simulated Inbound Risk: {simulatedRisk}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={simulatedRisk}
                onChange={(e) => setSimulatedRisk(parseInt(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />

              <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                <div
                  className={`p-2.5 rounded-lg border flex flex-col items-center text-center transition-all ${
                    wouldWhisper
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-300 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-500'
                  }`}
                >
                  <Radio className="w-4 h-4 mb-1" />
                  <span className="font-bold">Whisper Alert</span>
                  <span className="text-[10px] opacity-80">(&ge; {formData.whisperAlertThreshold}%)</span>
                  <span className="mt-1 text-[11px] font-semibold">
                    {wouldWhisper ? 'ACTIVE' : 'STANDBY'}
                  </span>
                </div>

                <div
                  className={`p-2.5 rounded-lg border flex flex-col items-center text-center transition-all ${
                    wouldMfa
                      ? 'bg-blue-950/40 border-blue-500/50 text-blue-300 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-500'
                  }`}
                >
                  <KeyRound className="w-4 h-4 mb-1" />
                  <span className="font-bold">Step-Up Push MFA</span>
                  <span className="text-[10px] opacity-80">(&ge; {formData.stepUpMfaThreshold}%)</span>
                  <span className="mt-1 text-[11px] font-semibold">
                    {wouldMfa ? 'TRIGGERED' : 'STANDBY'}
                  </span>
                </div>

                <div
                  className={`p-2.5 rounded-lg border flex flex-col items-center text-center transition-all ${
                    wouldTerminate
                      ? 'bg-rose-950/40 border-rose-500/50 text-rose-300 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-500'
                  }`}
                >
                  <PhoneOff className="w-4 h-4 mb-1" />
                  <span className="font-bold">Auto-Drop Call</span>
                  <span className="text-[10px] opacity-80">(&ge; {formData.autoTerminateThreshold}%)</span>
                  <span className="mt-1 text-[11px] font-semibold">
                    {wouldTerminate ? 'DISCONNECTED' : 'ALLOWED'}
                  </span>
                </div>
              </div>
            </div>

            {/* Threshold Sliders */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Automated Defense Thresholds
              </h3>

              {/* Auto Terminate */}
              <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <PhoneOff className="w-4 h-4 text-rose-400" />
                    <div>
                      <div className="text-xs font-bold text-slate-200">
                        Automatic Call Termination Threshold
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Drop the SIP trunk session immediately if AI likelihood crosses this level
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-mono font-bold text-rose-400">
                    {formData.autoTerminateThreshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="98"
                  value={formData.autoTerminateThreshold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      autoTerminateThreshold: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-rose-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Step Up MFA */}
              <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <KeyRound className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="text-xs font-bold text-slate-200">
                        Step-Up Cryptographic MFA Challenge Threshold
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Prompt user with mobile biometric push / FIDO2 token before allowing banking actions
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-mono font-bold text-blue-400">
                    {formData.stepUpMfaThreshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="90"
                  value={formData.stepUpMfaThreshold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stepUpMfaThreshold: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-blue-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Whisper Alert */}
              <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Radio className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="text-xs font-bold text-slate-200">
                        Operator Whisper Alert Injection Threshold
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Play low-latency audio cue in call center agent earpiece: &quot;Warning: Synthetic Voice Suspected&quot;
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-mono font-bold text-amber-400">
                    {formData.whisperAlertThreshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="85"
                  value={formData.whisperAlertThreshold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      whisperAlertThreshold: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Financial & PBX Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Wire Transfer Floor Limit ($ USD)</span>
                </label>
                <input
                  type="number"
                  value={formData.wireTransferFloorLimit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      wireTransferFloorLimit: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-1 focus:ring-cyan-500"
                />
                <span className="text-[11px] text-slate-500">
                  Transfers exceeding this require voice liveness proof
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                  <Server className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Telecom PBX / SBC Gateway</span>
                </label>
                <select
                  value={formData.telecomProvider}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      telecomProvider: e.target.value,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="Twilio / Cisco Unified SIP Trunk">Twilio / Cisco Unified SIP Trunk</option>
                  <option value="Genesys Cloud Voice API">Genesys Cloud Voice API</option>
                  <option value="Asterisk / FreeSWITCH Enterprise SBC">Asterisk / FreeSWITCH Enterprise SBC</option>
                  <option value="AWS Amazon Connect SIP Gateway">AWS Amazon Connect SIP Gateway</option>
                </select>
                <span className="text-[11px] text-slate-500">
                  Target session border controller for auto mitigation
                </span>
              </div>
            </div>

            {/* Compliance & Security Toggles */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Regulatory Compliance &amp; Architectural Enforcements
              </h3>

              <div className="space-y-2">
                {/* DPDP Act */}
                <label className="flex items-start justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
                  <div className="pr-4">
                    <div className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Zero Raw Audio Retention (DPDP Act &amp; GDPR Mandate)</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Extract only ephemeral acoustic vector embeddings; permanently purge audio payloads within 50ms of classification.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.dpdpActComplianceZeroAudio}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dpdpActComplianceZeroAudio: e.target.checked,
                      })
                    }
                    className="mt-1 rounded border-slate-700 text-cyan-500 focus:ring-0 bg-slate-900"
                  />
                </label>

                {/* Edge Inference */}
                <label className="flex items-start justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
                  <div className="pr-4">
                    <div className="text-xs font-bold text-slate-200">
                      Edge Inference DSP Acceleration
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Run spectral flatness, shimmer, and formant tracking on customer premise SBC hardware without cloud latency.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.edgeInferenceMode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        edgeInferenceMode: e.target.checked,
                      })
                    }
                    className="mt-1 rounded border-slate-700 text-cyan-500 focus:ring-0 bg-slate-900"
                  />
                </label>

                {/* International Spoofing */}
                <label className="flex items-start justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
                  <div className="pr-4">
                    <div className="text-xs font-bold text-slate-200">
                      Block Non-STIR/SHAKEN International Spoofing Routes
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Auto-flag callers presenting domestic caller IDs routed through foreign non-attested transit trunks.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.blockInternationalSpoofing}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        blockInternationalSpoofing: e.target.checked,
                      })
                    }
                    className="mt-1 rounded border-slate-700 text-cyan-500 focus:ring-0 bg-slate-900"
                  />
                </label>

                {/* Supervisor Signoff */}
                <label className="flex items-start justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
                  <div className="pr-4">
                    <div className="text-xs font-bold text-slate-200">
                      Require Dual Supervisor Override for High-Risk Actions
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Any transaction approved following a flagged voice clone must receive two supervisor cryptographic signatures.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.requireSupervisorSignoff}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        requireSupervisorSignoff: e.target.checked,
                      })
                    }
                    className="mt-1 rounded border-slate-700 text-cyan-500 focus:ring-0 bg-slate-900"
                  />
                </label>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={resetPoliciesToDefault}
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Factory Baseline</span>
          </button>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={closePolicyEditor}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="policy-edit-form"
              className="inline-flex items-center space-x-2 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg shadow-md hover:shadow-cyan-500/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Apply &amp; Save Policy Changes</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
