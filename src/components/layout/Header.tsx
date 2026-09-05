import React, { useState } from 'react';
import { 
  Activity, 
  Search, 
  UserPlus, 
  FileUp, 
  Printer, 
  User, 
  ChevronDown, 
  Shield, 
  Menu,
  Check
} from 'lucide-react';
import { Patient, UserProfile } from '../../types';

interface HeaderProps {
  patients: Patient[];
  activePatient: Patient | undefined;
  onSelectPatient: (patientId: string) => void;
  onOpenIntakeModal: () => void;
  onOpenUploadModal: () => void;
  onOpenPrintModal: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  userProfile: UserProfile;
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  patients,
  activePatient,
  onSelectPatient,
  onOpenIntakeModal,
  onOpenUploadModal,
  onOpenPrintModal,
  searchQuery,
  onSearchChange,
  userProfile,
  toggleSidebar,
}) => {
  const [patientDropdownOpen, setPatientDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="app-header">
      {/* Brand & Mobile Toggle */}
      <div className="brand-section">
        <button 
          className="btn btn-outline btn-sm no-print"
          onClick={toggleSidebar}
          aria-label="Toggle navigation menu"
          style={{ display: 'none', padding: '0.4rem' }}
          id="mobile-nav-toggle"
        >
          <Menu size={18} />
        </button>

        <div className="brand-logo-icon">
          <Activity size={22} strokeWidth={2.4} />
        </div>

        <div className="brand-text-block">
          <h1>
            MedLens
            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--primary-700)', backgroundColor: 'var(--primary-100)', padding: '1px 6px', borderRadius: '4px' }}>
              Intelligence MVP
            </span>
          </h1>
          <div className="brand-subtitle">AI Clinical Information Intelligence</div>
        </div>
      </div>

      {/* Patient Selector & Global Search */}
      <div className="header-center">
        {/* Active Patient Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            className="patient-picker-badge"
            onClick={() => setPatientDropdownOpen(!patientDropdownOpen)}
            aria-expanded={patientDropdownOpen}
            title="Switch Active Patient"
          >
            <User size={14} style={{ color: 'var(--primary-600)' }} />
            <span>
              <strong>{activePatient ? activePatient.name : 'Select Patient'}</strong>
              {activePatient && <span style={{ color: 'var(--slate-500)', marginLeft: '4px' }}>({activePatient.patientIdNumber})</span>}
            </span>
            <ChevronDown size={14} style={{ marginLeft: '4px' }} />
          </button>

          {patientDropdownOpen && (
            <div 
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '4px',
                width: '280px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 60,
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '0.5rem 0.75rem', backgroundColor: 'var(--slate-50)', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--slate-500)' }}>
                SELECT ACTIVE RECORD
              </div>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {patients.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectPatient(p.id);
                      setPatientDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.6rem 0.85rem',
                      border: 'none',
                      backgroundColor: activePatient?.id === p.id ? 'var(--primary-50)' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.82rem',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: activePatient?.id === p.id ? 600 : 500, color: 'var(--slate-900)' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
                        {p.patientIdNumber} • {p.age}y {p.sex[0]}
                      </div>
                    </div>
                    {activePatient?.id === p.id && <Check size={14} style={{ color: 'var(--primary-600)' }} />}
                  </button>
                ))}
              </div>
              <div style={{ padding: '0.5rem', borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--slate-50)' }}>
                <button
                  className="btn btn-outline btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => {
                    setPatientDropdownOpen(false);
                    onOpenIntakeModal();
                  }}
                >
                  <UserPlus size={13} />
                  <span>Register New Patient</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Global Search */}
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
          <input
            type="search"
            placeholder="Search lab tests, values, reports, findings..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.75rem 0.45rem 2rem',
              fontSize: '0.82rem',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              outline: 'none',
              backgroundColor: 'var(--slate-50)',
            }}
          />
        </div>
      </div>

      {/* Header Quick Actions */}
      <div className="header-actions">
        <button
          className="btn btn-outline btn-sm"
          onClick={onOpenUploadModal}
          title="Upload and extract medical report"
        >
          <FileUp size={14} />
          <span>Upload Report</span>
        </button>

        <button
          className="btn btn-outline btn-sm"
          onClick={onOpenPrintModal}
          title="Print or export structured medical record"
        >
          <Printer size={14} />
          <span>Export / Print</span>
        </button>

        {/* User Account / Role Badge */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.78rem' }}>
              SJ
            </div>
            <div style={{ textAlign: 'left', display: 'none' }} className="user-text-lg">
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--slate-800)' }}>{userProfile.name}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--slate-500)' }}>{userProfile.role}</div>
            </div>
            <ChevronDown size={12} style={{ color: 'var(--slate-400)' }} />
          </button>

          {userDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                width: '240px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 60,
                padding: '0.75rem',
              }}
            >
              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--slate-900)' }}>
                {userProfile.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--primary-600)', marginBottom: '0.35rem' }}>
                {userProfile.role}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                {userProfile.institution}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: '#047857' }}>
                <Shield size={13} />
                <span>Session Active • Role-Gated</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
