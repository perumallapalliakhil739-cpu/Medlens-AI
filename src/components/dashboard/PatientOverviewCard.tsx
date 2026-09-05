import React from 'react';
import { User, Calendar, AlertCircle, Pill, HeartPulse, Edit2 } from 'lucide-react';
import { Patient } from '../../types';
import { ProvenanceBadge } from '../common/ProvenanceBadge';

interface PatientOverviewCardProps {
  patient: Patient;
  onEditPatient: () => void;
  verifiedResultsCount: number;
  totalResultsCount: number;
}

export const PatientOverviewCard: React.FC<PatientOverviewCardProps> = ({
  patient,
  onEditPatient,
  verifiedResultsCount,
  totalResultsCount,
}) => {
  const verificationPct = totalResultsCount > 0 
    ? Math.round((verifiedResultsCount / totalResultsCount) * 100) 
    : 0;

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <div className="card-header">
        <div className="card-title-group">
          <User size={18} className="card-title-icon" />
          <div>
            <h3>Patient Intake Profile</h3>
            <div style={{ fontSize: '0.74rem', color: 'var(--slate-500)' }}>
              Source: User-provided intake registration • Recorded {patient.registrationDate}
            </div>
          </div>
        </div>
        <div className="card-actions">
          <ProvenanceBadge provenance="user_provided" />
          <button className="btn btn-outline btn-sm" onClick={onEditPatient}>
            <Edit2 size={13} />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Patient Header Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--slate-100)', marginBottom: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Patient Name</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)' }}>{patient.name}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--primary-700)', fontWeight: 500 }}>ID: {patient.patientIdNumber}</div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Demographics</div>
          <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--slate-800)' }}>{patient.age} years old • {patient.sex}</div>
          <div style={{ fontSize: '0.76rem', color: 'var(--slate-500)' }}>DOB: {patient.dob || 'Not specified'}</div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Contact & Reg</div>
          <div style={{ fontSize: '0.88rem', color: 'var(--slate-800)' }}>{patient.contact || 'No phone recorded'}</div>
          <div style={{ fontSize: '0.76rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Calendar size={12} /> Registered: {patient.registrationDate}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Human Verification</div>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: verificationPct === 100 ? '#047857' : 'var(--primary-700)' }}>
            {verifiedResultsCount} / {totalResultsCount} Results ({verificationPct}%)
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--slate-100)', borderRadius: '3px', marginTop: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${verificationPct}%`, height: '100%', backgroundColor: verificationPct === 100 ? '#10b981' : 'var(--primary-600)', transition: 'width 0.3s ease' }}></div>
          </div>
        </div>
      </div>

      {/* Clinical Intake Information Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        {/* Symptoms */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.4rem' }}>
            <HeartPulse size={14} style={{ color: '#e11d48' }} />
            <span>Active Symptoms</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {patient.symptoms.length > 0 ? (
              patient.symptoms.map((s, idx) => (
                <span key={idx} className="badge" style={{ backgroundColor: '#fff1f2', color: '#9f1239', border: '1px solid #fecdd3' }}>
                  {s}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.78rem', color: 'var(--slate-400)', fontStyle: 'italic' }}>None recorded during intake</span>
            )}
          </div>
        </div>

        {/* Existing Conditions */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.4rem' }}>
            <Calendar size={14} style={{ color: 'var(--primary-600)' }} />
            <span>Existing Medical Conditions</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {patient.existingConditions.length > 0 ? (
              patient.existingConditions.map((c, idx) => (
                <span key={idx} className="badge" style={{ backgroundColor: 'var(--primary-50)', color: 'var(--primary-800)', border: '1px solid var(--primary-200)' }}>
                  {c}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.78rem', color: 'var(--slate-400)', fontStyle: 'italic' }}>No known chronic conditions</span>
            )}
          </div>
        </div>

        {/* Allergies */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 600, color: '#b91c1c', marginBottom: '0.4rem' }}>
            <AlertCircle size={14} />
            <span>Documented Allergies</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {patient.allergies.length > 0 ? (
              patient.allergies.map((a, idx) => (
                <span key={idx} className="badge" style={{ backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5' }}>
                  {a}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.78rem', color: 'var(--slate-400)', fontStyle: 'italic' }}>No known drug allergies</span>
            )}
          </div>
        </div>

        {/* Current Medications */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.4rem' }}>
            <Pill size={14} style={{ color: '#059669' }} />
            <span>Current Medications</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {patient.currentMedications.length > 0 ? (
              patient.currentMedications.map((m, idx) => (
                <span key={idx} className="badge" style={{ backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>
                  {m.name} {m.dosage ? `(${m.dosage})` : ''}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.78rem', color: 'var(--slate-400)', fontStyle: 'italic' }}>No regular medications recorded</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
