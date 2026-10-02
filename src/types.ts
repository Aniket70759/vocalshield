export type VerdictType =
  | 'Synthetic Clone'
  | 'Neural Vocoder Artifact'
  | 'Authentic Human'
  | 'Replay Attack'
  | 'Suspicious Jitter';

export type SynthesizerType =
  | 'ElevenLabs v2'
  | 'ElevenLabs v3'
  | 'OpenAI TTS-1-HD'
  | 'XTTS-v2'
  | 'Tortoise-TTS'
  | 'Bark-Small'
  | 'HiFi-GAN'
  | 'VALL-E Neural'
  | 'RVC Voice Conversion'
  | 'ChatTTS Neural'
  | 'StyleTTS-2'
  | 'None (Authentic Human)'
  | string;

export type AuditStatus =
  | 'Under Review'
  | 'Confirmed Deepfake'
  | 'Cleared Authentic'
  | 'Escalated to SOC';

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

export interface AcousticMetrics {
  pitchJitter: number; // in %
  shimmer: number; // in dB
  spectralFlatness: number; // 0 to 1
  harmonicNoiseRatio: number; // in dB
  phaseCoherence: number; // in %
  breathPauseNaturalness: number; // in %
  formantContinuity: number; // in %
}

export interface VoiceDetectionAudit {
  id: string;
  audioName: string;
  audioDuration: string;
  isAiVoice: boolean;
  aiProbability: number; // 0 - 100
  humanProbability: number; // 0 - 100
  confidenceScore: number; // 0 - 100
  verdict: VerdictType;
  detectedSynthesizer: SynthesizerType;
  auditHash: string;
  userEmail: string;
  status: AuditStatus;
  riskLevel: RiskLevel;
  notes: string;
  timestamp: string;
  callerChannel: string;
  acousticMetrics: AcousticMetrics;
  audioUrl?: string;
  anomalies?: string[];
  forensicExplanation?: string;
  recommendedCountermeasure?: string;
  detectionEngine?: 'aasist-onnx' | 'gemini-multimodal' | 'acoustic-dsp-engine' | 'ensemble';
  lastModified?: string;
  modifiedBy?: string;
}

export interface DefensePolicyConfig {
  autoTerminateThreshold: number; // 0 - 100
  whisperAlertThreshold: number; // 0 - 100
  stepUpMfaThreshold: number; // 0 - 100
  requireSupervisorSignoff: boolean;
  blockInternationalSpoofing: boolean;
  dpdpActComplianceZeroAudio: boolean;
  edgeInferenceMode: boolean;
  telecomProvider: string;
  wireTransferFloorLimit: number;
  voiceprintDriftTolerance: number; // in %
  lastUpdated: string;
  updatedBy: string;
}

export type ThreatAlertStatus = 'Active Threat' | 'Mitigated' | 'False Positive' | 'Under Review';
export type AlertPriority = 'critical' | 'high' | 'medium' | 'low';
export type AlertType = 'threat' | 'warn' | 'info' | 'mfa';

export interface ThreatAlertLog {
  id: string;
  title: string;
  detail: string;
  type: AlertType;
  status: ThreatAlertStatus;
  priority: AlertPriority;
  sourceLine: string;
  detectedRisk: number;
  recommendedAction: string;
  timestamp: string;
  assignedAnalyst: string;
  incidentActionTaken?: string;
  notes?: string;
  audioAuditId?: string;
  lastModified?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  badgeId: string;
}
