import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  initialCurrentUser,
  initialDefensePolicy,
  initialThreatAlerts,
  initialVoiceAudits,
} from '../data/mockData';
import { DefensePolicyConfig, ThreatAlertLog, UserProfile, VoiceDetectionAudit } from '../types';

interface VocalShieldContextType {
  currentUser: UserProfile;
  audits: VoiceDetectionAudit[];
  policies: DefensePolicyConfig;
  threatAlerts: ThreatAlertLog[];
  activeTab: 'audits' | 'policies' | 'threats' | 'live-detector';
  setActiveTab: (tab: 'audits' | 'policies' | 'threats' | 'live-detector') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterRisk: string;
  setFilterRisk: (risk: string) => void;
  isQuickEditMode: boolean;
  setIsQuickEditMode: (val: boolean | ((prev: boolean) => boolean)) => void;

  // Audit open & edit
  selectedAuditToEdit: VoiceDetectionAudit | null;
  openAuditToEdit: (audit: VoiceDetectionAudit) => void;
  closeAuditEditor: () => void;
  updateAudit: (updatedAudit: VoiceDetectionAudit) => void;
  deleteAudit: (id: string) => void;
  addNewAudit: (audit: VoiceDetectionAudit) => void;

  // Threat alert open & edit
  selectedAlertToEdit: ThreatAlertLog | null;
  openAlertToEdit: (alert: ThreatAlertLog) => void;
  closeAlertEditor: () => void;
  updateThreatAlert: (updatedAlert: ThreatAlertLog) => void;
  deleteThreatAlert: (id: string) => void;
  addNewThreatAlert: (alert: ThreatAlertLog) => void;

  // Policy editor
  isPolicyEditorOpen: boolean;
  openPolicyEditor: () => void;
  closePolicyEditor: () => void;
  updateDefensePolicies: (updatedPolicy: DefensePolicyConfig) => void;
  resetPoliciesToDefault: () => void;
  resetAllData: () => void;

  // Notification toast
  toastMessage: { text: string; type: 'success' | 'info' | 'warn' } | null;
  showToast: (text: string, type?: 'success' | 'info' | 'warn') => void;
}

const VocalShieldContext = createContext<VocalShieldContextType | undefined>(undefined);

const AUDITS_STORAGE_KEY = 'vocalshield_audits_v1';
const POLICIES_STORAGE_KEY = 'vocalshield_policies_v1';
const THREATS_STORAGE_KEY = 'vocalshield_threats_v1';

export const VocalShieldProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser] = useState<UserProfile>(initialCurrentUser);
  const [activeTab, setActiveTab] = useState<'audits' | 'policies' | 'threats' | 'live-detector'>('live-detector');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [isQuickEditMode, setIsQuickEditMode] = useState<boolean>(false);

  // Audits state
  const [audits, setAudits] = useState<VoiceDetectionAudit[]>(() => {
    try {
      const saved = localStorage.getItem(AUDITS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return initialVoiceAudits;
  });

  // Policies state
  const [policies, setPolicies] = useState<DefensePolicyConfig>(() => {
    try {
      const saved = localStorage.getItem(POLICIES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return initialDefensePolicy;
  });

  // Threats state
  const [threatAlerts, setThreatAlerts] = useState<ThreatAlertLog[]>(() => {
    try {
      const saved = localStorage.getItem(THREATS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return initialThreatAlerts;
  });

  // Modal states
  const [selectedAuditToEdit, setSelectedAuditToEdit] = useState<VoiceDetectionAudit | null>(null);
  const [selectedAlertToEdit, setSelectedAlertToEdit] = useState<ThreatAlertLog | null>(null);
  const [isPolicyEditorOpen, setIsPolicyEditorOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warn' } | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(AUDITS_STORAGE_KEY, JSON.stringify(audits));
    } catch {
      // ignore
    }
  }, [audits]);

  useEffect(() => {
    try {
      localStorage.setItem(POLICIES_STORAGE_KEY, JSON.stringify(policies));
    } catch {
      // ignore
    }
  }, [policies]);

  useEffect(() => {
    try {
      localStorage.setItem(THREATS_STORAGE_KEY, JSON.stringify(threatAlerts));
    } catch {
      // ignore
    }
  }, [threatAlerts]);

  const showToast = (text: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Audit handlers
  const openAuditToEdit = (audit: VoiceDetectionAudit) => {
    setSelectedAuditToEdit(audit);
  };

  const closeAuditEditor = () => {
    setSelectedAuditToEdit(null);
  };

  const updateAudit = (updatedAudit: VoiceDetectionAudit) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    const finalAudit: VoiceDetectionAudit = {
      ...updatedAudit,
      lastModified: nowStr,
      modifiedBy: currentUser.name,
    };

    setAudits((prev) =>
      prev.map((item) => (item.id === finalAudit.id ? finalAudit : item))
    );

    // Also update if opened in modal
    if (selectedAuditToEdit?.id === finalAudit.id) {
      setSelectedAuditToEdit(finalAudit);
    }

    showToast(`Voice Audit ${finalAudit.id} updated successfully!`);
  };

  const deleteAudit = (id: string) => {
    setAudits((prev) => prev.filter((item) => item.id !== id));
    if (selectedAuditToEdit?.id === id) {
      setSelectedAuditToEdit(null);
    }
    showToast(`Audit record ${id} removed from forensic register.`, 'info');
  };

  const addNewAudit = (audit: VoiceDetectionAudit) => {
    setAudits((prev) => [audit, ...prev]);
    showToast(`New Voice Audit ${audit.id} logged and hashed!`);
  };

  // Threat Alert handlers
  const openAlertToEdit = (alert: ThreatAlertLog) => {
    setSelectedAlertToEdit(alert);
  };

  const closeAlertEditor = () => {
    setSelectedAlertToEdit(null);
  };

  const updateThreatAlert = (updatedAlert: ThreatAlertLog) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    const finalAlert: ThreatAlertLog = {
      ...updatedAlert,
      lastModified: nowStr,
    };

    setThreatAlerts((prev) =>
      prev.map((item) => (item.id === finalAlert.id ? finalAlert : item))
    );

    if (selectedAlertToEdit?.id === finalAlert.id) {
      setSelectedAlertToEdit(finalAlert);
    }

    showToast(`Threat Incident ${finalAlert.id} status modified!`);
  };

  const deleteThreatAlert = (id: string) => {
    setThreatAlerts((prev) => prev.filter((item) => item.id !== id));
    if (selectedAlertToEdit?.id === id) {
      setSelectedAlertToEdit(null);
    }
    showToast(`Threat Alert ${id} dismissed.`, 'info');
  };

  const addNewThreatAlert = (alert: ThreatAlertLog) => {
    setThreatAlerts((prev) => [alert, ...prev]);
    showToast(`Threat alert logged: ${alert.title}`, 'warn');
  };

  // Policy handlers
  const openPolicyEditor = () => {
    setIsPolicyEditorOpen(true);
  };

  const closePolicyEditor = () => {
    setIsPolicyEditorOpen(false);
  };

  const updateDefensePolicies = (updatedPolicy: DefensePolicyConfig) => {
    const finalPolicy: DefensePolicyConfig = {
      ...updatedPolicy,
      lastUpdated: new Date().toISOString(),
      updatedBy: `${currentUser.name} (${currentUser.role})`,
    };
    setPolicies(finalPolicy);
    showToast(`Defense Policies updated! Thresholds applied across SIP switches.`);
  };

  const resetPoliciesToDefault = () => {
    setPolicies({
      ...initialDefensePolicy,
      lastUpdated: new Date().toISOString(),
      updatedBy: currentUser.name,
    });
    showToast(`Defense Policies reset to enterprise baseline defaults.`, 'info');
  };

  const resetAllData = () => {
    setAudits(initialVoiceAudits);
    setPolicies(initialDefensePolicy);
    setThreatAlerts(initialThreatAlerts);
    try {
      localStorage.removeItem(AUDITS_STORAGE_KEY);
      localStorage.removeItem(POLICIES_STORAGE_KEY);
      localStorage.removeItem(THREATS_STORAGE_KEY);
    } catch {
      // ignore
    }
    showToast(`All forensic logs and policies reset to default dataset.`, 'info');
  };

  return (
    <VocalShieldContext.Provider
      value={{
        currentUser,
        audits,
        policies,
        threatAlerts,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        filterStatus,
        setFilterStatus,
        filterRisk,
        setFilterRisk,
        isQuickEditMode,
        setIsQuickEditMode,
        selectedAuditToEdit,
        openAuditToEdit,
        closeAuditEditor,
        updateAudit,
        deleteAudit,
        addNewAudit,
        selectedAlertToEdit,
        openAlertToEdit,
        closeAlertEditor,
        updateThreatAlert,
        deleteThreatAlert,
        addNewThreatAlert,
        isPolicyEditorOpen,
        openPolicyEditor,
        closePolicyEditor,
        updateDefensePolicies,
        resetPoliciesToDefault,
        resetAllData,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </VocalShieldContext.Provider>
  );
};

export const useVocalShield = () => {
  const context = useContext(VocalShieldContext);
  if (!context) {
    throw new Error('useVocalShield must be used within a VocalShieldProvider');
  }
  return context;
};
