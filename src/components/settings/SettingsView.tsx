import React, { useState } from 'react';
import { 
  Settings, 
  Key, 
  Database, 
  ShieldCheck, 
  Download, 
  RotateCcw, 
  Check, 
  AlertCircle,
  HelpCircle,
  Cpu
} from 'lucide-react';
import { AppSettings, UserProfile } from '../../types';
import { SafetyBanner } from '../common/SafetyBanner';
import { exportDatabaseAsJson } from '../../services/storage';

interface SettingsViewProps {
  settings: AppSettings;
  userProfile: UserProfile;
  onSaveSettings: (settings: AppSettings) => void;
  onSaveUserProfile: (profile: UserProfile) => void;
  onResetDemoData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  userProfile,
  onSaveSettings,
  onSaveUserProfile,
  onResetDemoData,
}) => {
  const [apiKey, setApiKey] = useState(settings.geminiApiKey || '');
  const [useGemini, setUseGemini] = useState(settings.useGeminiIfAvailable);
  const [userName, setUserName] = useState(userProfile.name);
  const [userRole, setUserRole] = useState(userProfile.role);
  const [institution, setInstitution] = useState(userProfile.institution);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      geminiApiKey: apiKey.trim(),
      useGeminiIfAvailable: useGemini,
    });
    onSaveUserProfile({
      ...userProfile,
      name: userName.trim(),
      role: userRole.trim(),
      institution: institution.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportDatabaseAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medlens-clinical-database-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="settings-view" style={{ maxWidth: '800px' }}>
      <SafetyBanner compact />

      <div style={{ marginBottom: '1.25rem' }}>
        <h2>Application Settings & Privacy Governance</h2>
        <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
          Configure AI intelligence integrations, clinician credentials, data retention, and privacy boundaries
        </div>
      </div>

      <form onSubmit={handleSaveAll}>
        {/* Section 1: AI Integration Settings */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <div className="card-title-group">
              <Cpu size={18} className="card-title-icon" />
              <div>
                <h3>AI Processing Engine & Intelligence API</h3>
                <div style={{ fontSize: '0.74rem', color: 'var(--slate-500)' }}>
                  Configure Google Gemini multimodal extraction or utilize the built-in local clinical parser
                </div>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="gemini-key">
              Google Gemini API Key <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>(Optional for live multimodal calls)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Key size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
              <input
                id="gemini-key"
                type="password"
                className="form-input"
                style={{ paddingLeft: '2rem' }}
                placeholder="AIzaSy... (Leave empty to use built-in offline clinical engine)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <div className="form-hint">
              When an API key is provided, MedLens utilizes <code>gemini-2.5-flash</code> for multimodal extraction and non-diagnostic summaries.
              Without an API key, MedLens seamlessly runs on its deterministic, zero-dependency offline clinical parser.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.85rem' }}>
            <input
              type="checkbox"
              id="toggle-gemini"
              checked={useGemini}
              onChange={(e) => setUseGemini(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="toggle-gemini" style={{ fontSize: '0.82rem', color: 'var(--slate-700)', cursor: 'pointer' }}>
              Enable Gemini API when key is configured (falls back automatically to deterministic parser if offline or key missing)
            </label>
          </div>
        </div>

        {/* Section 2: Clinician User Profile */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <div className="card-title-group">
              <ShieldCheck size={18} className="card-title-icon" />
              <div>
                <h3>Reviewer Profile & Identity</h3>
                <div style={{ fontSize: '0.74rem', color: 'var(--slate-500)' }}>
                  Name and institution attributed to audit trails and human verification stamps
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="user-name">Clinician Name</label>
              <input
                id="user-name"
                type="text"
                className="form-input"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="user-role">Clinical Role / Title</label>
              <input
                id="user-role"
                type="text"
                className="form-input"
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="user-inst">Institution / Clinical Center</label>
            <input
              id="user-inst"
              type="text"
              className="form-input"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Section 3: Data Management & Persistence */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <div className="card-title-group">
              <Database size={18} className="card-title-icon" />
              <div>
                <h3>Local Persistence & Clinical Data Export</h3>
                <div style={{ fontSize: '0.74rem', color: 'var(--slate-500)' }}>
                  Manage client-side records, export JSON backup, or restore baseline sample records
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleDownloadBackup}
            >
              <Download size={14} />
              <span>Export Full Database (JSON)</span>
            </button>

            <button
              type="button"
              className="btn btn-danger-outline"
              onClick={() => {
                if (window.confirm('Reset all records, intake forms, and reports to default demo clinical data?')) {
                  onResetDemoData();
                }
              }}
            >
              <RotateCcw size={14} />
              <span>Reset to Standard Demo Database</span>
            </button>
          </div>
        </div>

        {/* Section 4: Responsible AI & Privacy Disclosure */}
        <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: 'var(--slate-50)' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.4rem' }}>
            Privacy, Compliance & Responsible AI Notice
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--slate-600)', lineHeight: '1.5' }}>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Zero Data Harvesting:</strong> MedLens runs within the user's browser runtime. In local mode, no patient data leaves your workstation. When Gemini is enabled, document text is sent strictly to the Google Generative AI API endpoint without retaining data for model training.
            </p>
            <p>
              <strong>Non-Diagnostic Governance:</strong> All reference ranges are read strictly from uploaded documents. Missing reference ranges are clearly reported as unavailable. No automated diagnoses or prescriptions are generated under any circumstances.
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {savedSuccess && (
            <div style={{ color: '#047857', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <Check size={14} /> Settings updated successfully.
            </div>
          )}
          <div style={{ marginLeft: 'auto' }}>
            <button type="submit" className="btn btn-primary">
              Save Settings & Preferences
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
