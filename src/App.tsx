import React from 'react';
import { VocalShieldProvider, useVocalShield } from './context/VocalShieldContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { VoiceAuditsView } from './components/VoiceAuditsView';
import { DefensePolicyView } from './components/DefensePolicyView';
import { ThreatAlertsView } from './components/ThreatAlertsView';
import { LiveVoiceDetector } from './components/LiveVoiceDetector';
import { AuditDetailModal } from './components/AuditDetailModal';
import { EditPolicyModal } from './components/EditPolicyModal';
import { AlertDetailModal } from './components/AlertDetailModal';
import { Toast } from './components/Toast';

const DashboardContent: React.FC = () => {
  const { activeTab } = useVocalShield();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header />
      <Navigation />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'audits' && <VoiceAuditsView />}
        {activeTab === 'policies' && <DefensePolicyView />}
        {activeTab === 'threats' && <ThreatAlertsView />}
        {activeTab === 'live-detector' && <LiveVoiceDetector />}
      </main>

      {/* Modals for Opening Items to Make Changes */}
      <AuditDetailModal />
      <EditPolicyModal />
      <AlertDetailModal />

      {/* Feedback Toast */}
      <Toast />

      {/* Footer */}
      <footer className="border-t border-slate-850 py-4 px-6 text-center text-xs text-slate-500 bg-slate-950/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            VocalShield AI &bull; Enterprise Voice Biometric Integrity &amp; Telecom Deepfake Defense
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            DPDP Zero-Audio Retention Mandate Compliant &bull; SHA-256 Forensic Audit Chain
          </span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <VocalShieldProvider>
      <DashboardContent />
    </VocalShieldProvider>
  );
}
