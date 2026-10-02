import React, { useState } from 'react';
import {
  Sliders,
  Shield,
  ShieldAlert,
  PhoneOff,
  Radio,
  KeyRound,
  Lock,
  Server,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Edit,
} from 'lucide-react';
import { useVocalShield } from '../context/VocalShieldContext';

export const DefensePolicyView: React.FC = () => {
  const { policies, openPolicyEditor, updateDefensePolicies, resetPoliciesToDefault } =
    useVocalShield();

  const [testRisk, setTestRisk] = useState<number>(86);

  const isTerminated = testRisk >= policies.autoTerminateThreshold;
  const isMfa = testRisk >= policies.stepUpMfaThreshold;
  const isWhisper = testRisk >= policies.whisperAlertThreshold;

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Open Button */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Autonomous Telecom Threat Mitigation Framework</span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Enterprise Voice Defense Policies &amp; Thresholds
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time policy configuration governing inbound SIP session drops, supervisory whisper alerts,
            and cryptographic MFA prompts during phone-based customer interactions.
          </p>
          <div className="text-[11px] text-slate-500 font-mono mt-2">
            Last policy update: {policies.lastUpdated.substring(0, 10)} by {policies.updatedBy}
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={resetPoliciesToDefault}
            className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={openPolicyEditor}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-cyan-600/20 transition-all"
          >
            <Edit className="w-4 h-4" />
            <span>Open Policies to Make Changes</span>
          </button>
        </div>
      </div>

      {/* Grid of Key Thresholds Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Auto Terminate */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
              <PhoneOff className="w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold font-mono text-rose-400">
              {policies.autoTerminateThreshold}%
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">SIP Auto-Drop Threshold</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated disconnect of telephone trunk session when synthetic confidence exceeds this bound.
            </p>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full"
              style={{ width: `${policies.autoTerminateThreshold}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>Safety Margin: 15%</span>
            <span>Target: PBX SBC</span>
          </div>
        </div>

        {/* Step-Up MFA */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30">
              <KeyRound className="w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold font-mono text-blue-400">
              {policies.stepUpMfaThreshold}%
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Cryptographic Push MFA</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Transmits FIDO2 push verification to customer mobile app before permitting password or PIN reset.
            </p>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full"
              style={{ width: `${policies.stepUpMfaThreshold}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>Trigger: Suspicious Pitch</span>
            <span>Method: Out-of-Band</span>
          </div>
        </div>

        {/* Whisper Alert */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Radio className="w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold font-mono text-amber-400">
              {policies.whisperAlertThreshold}%
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Operator Whisper Alert</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Sub-100ms auditory alert injected into call center headset notifying agent of synthetic voice risk.
            </p>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full"
              style={{ width: `${policies.whisperAlertThreshold}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>Latency: &lt;60ms</span>
            <span>Channel: In-ear SIP</span>
          </div>
        </div>

      </div>

      {/* Interactive Testing Sandbox */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Live Policy Decision Engine Sandbox</span>
            </h3>
            <p className="text-xs text-slate-400">
              Drag the simulated risk slider to test how current policies respond to inbound voice calls
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400">Tested Voice Risk: </span>
            <span className="font-mono text-lg font-bold text-cyan-300">{testRisk}%</span>
          </div>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={testRisk}
          onChange={(e) => setTestRisk(parseInt(e.target.value))}
          className="w-full accent-cyan-400 h-2.5 bg-slate-800 rounded-lg cursor-pointer"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div
            className={`p-3.5 rounded-xl border flex items-center space-x-3 transition-all ${
              isWhisper
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                : 'bg-slate-950/60 border-slate-800/80 text-slate-500'
            }`}
          >
            <Radio className="w-5 h-5 shrink-0" />
            <div className="text-xs">
              <div className="font-bold">Operator Whisper Alert</div>
              <div className="text-[11px] opacity-80">
                {isWhisper
                  ? `TRIGGERED (Risk ${testRisk}% &ge; ${policies.whisperAlertThreshold}%)`
                  : 'Inactive'}
              </div>
            </div>
          </div>

          <div
            className={`p-3.5 rounded-xl border flex items-center space-x-3 transition-all ${
              isMfa
                ? 'bg-blue-950/40 border-blue-500/50 text-blue-200'
                : 'bg-slate-950/60 border-slate-800/80 text-slate-500'
            }`}
          >
            <KeyRound className="w-5 h-5 shrink-0" />
            <div className="text-xs">
              <div className="font-bold">Step-Up Push MFA</div>
              <div className="text-[11px] opacity-80">
                {isMfa
                  ? `TRIGGERED (Risk ${testRisk}% &ge; ${policies.stepUpMfaThreshold}%)`
                  : 'Inactive'}
              </div>
            </div>
          </div>

          <div
            className={`p-3.5 rounded-xl border flex items-center space-x-3 transition-all ${
              isTerminated
                ? 'bg-rose-950/50 border-rose-500/60 text-rose-200'
                : 'bg-slate-950/60 border-slate-800/80 text-slate-500'
            }`}
          >
            <PhoneOff className="w-5 h-5 shrink-0" />
            <div className="text-xs">
              <div className="font-bold">Auto-Drop Call Session</div>
              <div className="text-[11px] opacity-80">
                {isTerminated
                  ? `EXECUTED (Risk ${testRisk}% &ge; ${policies.autoTerminateThreshold}%)`
                  : 'Allowed to Proceed'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance & Architecture Status Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight">
          Active Telecom Integration &amp; Compliance Enforcements
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Zero Raw Audio Retention (DPDP Act / GDPR)</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                {policies.dpdpActComplianceZeroAudio ? 'ENFORCED' : 'DISABLED'}
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Audio data is processed purely in volatile edge RAM and permanently scrubbed.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center space-x-2">
                <Server className="w-4 h-4 text-cyan-400" />
                <span>Edge Inference DSP Processing Mode</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                {policies.edgeInferenceMode ? 'ACTIVE' : 'DISABLED'}
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Integrated Switch: {policies.telecomProvider}
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Wire Transfer Voice Liveness Floor</span>
              </span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                ${policies.wireTransferFloorLimit.toLocaleString()} USD
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Any voice-authorized wire or transfer above this limit requires dual-spectral validation.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>STIR/SHAKEN International Spoofing Shield</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800/60">
                {policies.blockInternationalSpoofing ? 'ACTIVE' : 'DISABLED'}
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Calls presenting domestic CIDs through foreign unauthenticated transit switches are flagged.
            </p>
          </div>

        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={openPolicyEditor}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 text-xs font-bold rounded-lg border border-slate-700 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Open Full Policy Editor to Make Changes</span>
          </button>
        </div>
      </div>

    </div>
  );
};
