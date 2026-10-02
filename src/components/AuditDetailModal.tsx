import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  Save,
  Trash2,
  Play,
  Pause,
  Volume2,
  ShieldCheck,
  ShieldAlert,
  Hash,
  Clock,
  Sparkles,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { useVocalShield } from '../context/VocalShieldContext';
import {
  AuditStatus,
  RiskLevel,
  SynthesizerType,
  VerdictType,
  VoiceDetectionAudit,
} from '../types';

export const AuditDetailModal: React.FC = () => {
  const { selectedAuditToEdit, closeAuditEditor, updateAudit, deleteAudit, addNewThreatAlert } =
    useVocalShield();

  const [formData, setFormData] = useState<VoiceDetectionAudit | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const audioIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (selectedAuditToEdit) {
      setFormData({ ...selectedAuditToEdit });
      setIsPlaying(false);
      setAudioProgress(0);
    }
  }, [selectedAuditToEdit]);

  // Simulated audio playback progress
  useEffect(() => {
    if (isPlaying) {
      audioIntervalRef.current = window.setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 2.5;
        });
      }, 100);
    } else {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    }

    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, [isPlaying]);

  if (!selectedAuditToEdit || !formData) return null;

  const handleAiProbChange = (aiProb: number) => {
    const clampedAi = Math.max(0, Math.min(100, Math.round(aiProb * 10) / 10));
    const humanProb = Math.max(0, Math.min(100, Math.round((100 - clampedAi) * 10) / 10));
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            aiProbability: clampedAi,
            humanProbability: humanProb,
            isAiVoice: clampedAi >= 50,
          }
        : null
    );
  };

  const handleMetricChange = (metricKey: keyof typeof formData.acousticMetrics, value: number) => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            acousticMetrics: {
              ...prev.acousticMetrics,
              [metricKey]: value,
            },
          }
        : null
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    // Generate updated audit fingerprint
    const dummyHash = Array.from(
      formData.audioName + formData.verdict + formData.aiProbability + Date.now().toString()
    )
      .reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0)
      .toString(16)
      .padStart(64, 'a8f9c2e0b1d3');

    const finalRecord: VoiceDetectionAudit = {
      ...formData,
      auditHash: dummyHash.substring(0, 64),
    };

    updateAudit(finalRecord);
    closeAuditEditor();
  };

  const handlePromoteToThreat = () => {
    if (!formData) return;
    addNewThreatAlert({
      id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
      title: `Escalated Deepfake Case: ${formData.audioName}`,
      detail: `Analyst disposition: ${formData.verdict} identified with ${formData.aiProbability}% AI probability. Synthesizer: ${formData.detectedSynthesizer}. ${formData.notes}`,
      type: 'threat',
      status: 'Active Threat',
      priority: formData.riskLevel,
      sourceLine: formData.callerChannel,
      detectedRisk: formData.aiProbability,
      recommendedAction: 'Immediate carrier traceback and SIP block enforcement',
      timestamp: 'Just now',
      assignedAnalyst: formData.userEmail,
      audioAuditId: formData.id,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-xl ${
                formData.isAiVoice
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {formData.isAiVoice ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                  {formData.id}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {formData.callerChannel}
                </span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight mt-0.5">
                {formData.audioName}
              </h2>
            </div>
          </div>

          <button
            onClick={closeAuditEditor}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Simulated Audio Waveform & Player */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-slate-300 font-medium">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>Forensic Acoustic Waveform Preview</span>
                <span className="text-slate-500 font-mono">({formData.audioDuration})</span>
              </div>
              <span className="font-mono text-cyan-400">{Math.round(audioProgress)}%</span>
            </div>

            {/* Waveform visual bars */}
            <div className="h-16 flex items-center justify-between gap-1 px-2 bg-slate-900/80 rounded-lg border border-slate-800/60 overflow-hidden relative">
              {/* Progress fill overlay */}
              <div
                className="absolute left-0 top-0 bottom-0 bg-cyan-500/10 pointer-events-none transition-all duration-100"
                style={{ width: `${audioProgress}%` }}
              />

              {[
                35, 65, 80, 45, 95, 20, 55, 75, 90, 40, 60, 85, 30, 70, 95, 45, 65, 80,
                35, 50, 90, 60, 40, 85, 95, 70, 30, 45, 80, 60, 90, 40, 65, 85, 50, 35,
                75, 90, 60, 45, 80, 95, 40, 70, 85, 55, 30, 65, 90, 45,
              ].map((height, idx) => {
                const isPassed = (idx / 50) * 100 <= audioProgress;
                return (
                  <div
                    key={idx}
                    className={`w-1 rounded-full transition-all duration-150 ${
                      isPassed
                        ? formData.isAiVoice
                          ? 'bg-rose-400'
                          : 'bg-emerald-400'
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>

            {/* Audio Controls */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause Waveform' : 'Play Acoustic Inspection'}</span>
              </button>

              <div className="text-[11px] text-slate-400 flex items-center space-x-3">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <span>Sample Rate: 48 kHz</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                  <span>Format: Linear PCM / 24-bit</span>
                </span>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <form id="audit-edit-form" onSubmit={handleSave} className="space-y-6">
            
            {/* Primary Classification Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Verdict */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Forensic Verdict Classification
                </label>
                <select
                  value={formData.verdict}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      verdict: e.target.value as VerdictType,
                      isAiVoice: e.target.value !== 'Authentic Human',
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                >
                  <option value="Synthetic Clone">Synthetic Clone</option>
                  <option value="Neural Vocoder Artifact">Neural Vocoder Artifact</option>
                  <option value="Replay Attack">Replay Attack</option>
                  <option value="Suspicious Jitter">Suspicious Jitter</option>
                  <option value="Authentic Human">Authentic Human</option>
                </select>
              </div>

              {/* Identified Synthesizer */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Identified Neural Synthesizer
                </label>
                <select
                  value={formData.detectedSynthesizer}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      detectedSynthesizer: e.target.value as SynthesizerType,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                >
                  <option value="ElevenLabs v2">ElevenLabs v2</option>
                  <option value="XTTS-v2">XTTS-v2</option>
                  <option value="Tortoise-TTS">Tortoise-TTS</option>
                  <option value="Bark-Small">Bark-Small</option>
                  <option value="HiFi-GAN">HiFi-GAN</option>
                  <option value="VALL-E Neural">VALL-E Neural</option>
                  <option value="None (Authentic Human)">None (Authentic Human)</option>
                </select>
              </div>

              {/* Investigation Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Investigation Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as AuditStatus,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                >
                  <option value="Under Review">Under Review</option>
                  <option value="Confirmed Deepfake">Confirmed Deepfake</option>
                  <option value="Cleared Authentic">Cleared Authentic</option>
                  <option value="Escalated to SOC">Escalated to SOC</option>
                </select>
              </div>

            </div>

            {/* Risk & Probabilities Section */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Probability & Risk Severity Settings</span>
                </span>

                {/* Risk Level Badge Pill Select */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">Risk Severity:</span>
                  <select
                    value={formData.riskLevel}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        riskLevel: e.target.value as RiskLevel,
                      })
                    }
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-semibold text-slate-200"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              {/* AI Probability Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">
                    AI Synthetic Likelihood:{' '}
                    <span className="font-bold text-rose-400 font-mono">
                      {formData.aiProbability}%
                    </span>
                  </span>
                  <span className="text-slate-400">
                    Human Authenticity:{' '}
                    <span className="font-bold text-emerald-400 font-mono">
                      {formData.humanProbability}%
                    </span>
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={formData.aiProbability}
                  onChange={(e) => handleAiProbChange(parseFloat(e.target.value))}
                  className="w-full accent-rose-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Confidence Score Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">
                    Model Confidence Score:{' '}
                    <span className="font-bold text-cyan-400 font-mono">
                      {formData.confidenceScore}%
                    </span>
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="0.5"
                  value={formData.confidenceScore}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confidenceScore: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Deep Acoustic Metrics Adjusters */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">
                  Forensic Acoustic Descriptors (DSP Feature Vectors)
                </span>
                <span className="text-[11px] text-slate-400">
                  Low Jitter (&lt;0.5%) &amp; High Flatness characterize neural diffusion
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {/* Pitch Jitter */}
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Pitch Jitter:</span>
                    <span className="font-mono text-cyan-300">
                      {formData.acousticMetrics.pitchJitter}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="3.0"
                    step="0.01"
                    value={formData.acousticMetrics.pitchJitter}
                    onChange={(e) =>
                      handleMetricChange('pitchJitter', parseFloat(e.target.value))
                    }
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                  />
                </div>

                {/* Shimmer */}
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Amplitude Shimmer:</span>
                    <span className="font-mono text-cyan-300">
                      {formData.acousticMetrics.shimmer} dB
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="4.0"
                    step="0.05"
                    value={formData.acousticMetrics.shimmer}
                    onChange={(e) =>
                      handleMetricChange('shimmer', parseFloat(e.target.value))
                    }
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                  />
                </div>

                {/* Spectral Flatness */}
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Spectral Flatness:</span>
                    <span className="font-mono text-cyan-300">
                      {formData.acousticMetrics.spectralFlatness}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.99"
                    step="0.01"
                    value={formData.acousticMetrics.spectralFlatness}
                    onChange={(e) =>
                      handleMetricChange('spectralFlatness', parseFloat(e.target.value))
                    }
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                  />
                </div>

                {/* Phase Coherence */}
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Phase Coherence:</span>
                    <span className="font-mono text-cyan-300">
                      {formData.acousticMetrics.phaseCoherence}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="99"
                    step="1"
                    value={formData.acousticMetrics.phaseCoherence}
                    onChange={(e) =>
                      handleMetricChange('phaseCoherence', parseFloat(e.target.value))
                    }
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                  />
                </div>

                {/* Breath Naturalness */}
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Breath Naturalness:</span>
                    <span className="font-mono text-cyan-300">
                      {formData.acousticMetrics.breathPauseNaturalness}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="99"
                    step="1"
                    value={formData.acousticMetrics.breathPauseNaturalness}
                    onChange={(e) =>
                      handleMetricChange('breathPauseNaturalness', parseFloat(e.target.value))
                    }
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                  />
                </div>

                {/* Harmonic to Noise Ratio */}
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Harmonic-to-Noise:</span>
                    <span className="font-mono text-cyan-300">
                      {formData.acousticMetrics.harmonicNoiseRatio} dB
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="45"
                    step="0.5"
                    value={formData.acousticMetrics.harmonicNoiseRatio}
                    onChange={(e) =>
                      handleMetricChange('harmonicNoiseRatio', parseFloat(e.target.value))
                    }
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Analyst Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Forensic Notes &amp; Disposition Log
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Document observed vocoder artifacts, frequency spikes, operator action, or customer verification outcome..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>

            {/* Audit Hash & Metadata info */}
            <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-lg text-xs space-y-1 font-mono text-slate-400">
              <div className="flex items-center space-x-2">
                <Hash className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-300 font-semibold">Audit Fingerprint (SHA-256):</span>
                <span className="text-cyan-300/90 truncate">{formData.auditHash}</span>
              </div>
              <div className="flex items-center space-x-2 text-[11px]">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>Captured: {formData.timestamp}</span>
                {formData.lastModified && (
                  <span className="text-amber-400/80">• Last edited: {formData.lastModified}</span>
                )}
              </div>
            </div>

          </form>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => deleteAudit(formData.id)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 border border-rose-900/60 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Record</span>
            </button>

            {formData.isAiVoice && (
              <button
                type="button"
                onClick={handlePromoteToThreat}
                className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/60 rounded-lg transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Escalate as Active Threat Alert</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={closeAuditEditor}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="audit-edit-form"
              className="inline-flex items-center space-x-2 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg shadow-md hover:shadow-cyan-500/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes to Audit Record</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
