import React, { useState } from 'react';
import { User, UserPlus, Search, Check, Edit2, FileText, Calendar, HeartPulse } from 'lucide-react';
import { Patient, MedicalReport } from '../../types';
import { SafetyBanner } from '../common/SafetyBanner';

interface PatientsViewProps {
  patients: Patient[];
  activePatientId: string;
  onSelectPatient: (patientId: string) => void;
  onOpenIntakeModal: (patient?: Patient) => void;
  reports: MedicalReport[];
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  patients,
  activePatientId,
  onSelectPatient,
  onOpenIntakeModal,
  reports,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = patients.filter((p) => {
    const q = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.patientIdNumber.toLowerCase().includes(q) ||
      p.existingConditions.some(c => c.toLowerCase().includes(q)) ||
      p.symptoms.some(s => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="patients-view">
      <SafetyBanner compact />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h2>Patient Records & Intake Directory</h2>
          <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
            Manage registered clinical intake profiles and active patient contexts
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => onOpenIntakeModal()}>
          <UserPlus size={15} />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: '1.25rem', position: 'relative', maxWidth: '380px' }}>
        <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
        <input
          type="search"
          placeholder="Filter by name, MRN, condition, or symptom..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.45rem 0.75rem 0.45rem 2rem',
            fontSize: '0.82rem',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#ffffff',
          }}
        />
      </div>

      {/* Patient Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {filtered.map((patient) => {
          const isActive = patient.id === activePatientId;
          const patientReports = reports.filter(r => r.patientId === patient.id);

          return (
            <div
              key={patient.id}
              className="card"
              style={{
                borderColor: isActive ? 'var(--primary-500)' : 'var(--border-subtle)',
                boxShadow: isActive ? '0 0 0 2px rgba(14, 165, 233, 0.2)' : 'var(--shadow-xs)',
                position: 'relative',
              }}
            >
              {patient.isDemo && (
                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  <span className="badge" style={{ backgroundColor: 'var(--primary-100)', color: 'var(--primary-800)', fontSize: '0.68rem' }}>
                    DEMO PATIENT
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: isActive ? 'var(--primary-600)' : 'var(--slate-200)', color: isActive ? '#ffffff' : 'var(--slate-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                  {patient.name.charAt(0)}
                </div>

                <div style={{ flex: 1, paddingRight: '4rem' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                    {patient.name}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--primary-700)', fontWeight: 500 }}>
                    MRN: {patient.patientIdNumber}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--slate-500)' }}>
                    {patient.age}y • {patient.sex} • Reg: {patient.registrationDate}
                  </div>
                </div>
              </div>

              {/* Patient Attributes */}
              <div style={{ fontSize: '0.76rem', color: 'var(--slate-600)', marginBottom: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FileText size={13} style={{ color: 'var(--slate-400)' }} />
                  <span><strong>{patientReports.length}</strong> medical reports uploaded</span>
                </div>

                {patient.allergies.length > 0 && (
                  <div style={{ color: '#b91c1c' }}>
                    <strong>Allergies:</strong> {patient.allergies.join(', ')}
                  </div>
                )}

                {patient.existingConditions.length > 0 && (
                  <div>
                    <strong>Conditions:</strong> {patient.existingConditions.join(', ')}
                  </div>
                )}

                {patient.symptoms.length > 0 && (
                  <div>
                    <strong>Active Symptoms:</strong> {patient.symptoms.join(', ')}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--slate-100)' }}>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => onOpenIntakeModal(patient)}
                  title="Edit intake registration"
                >
                  <Edit2 size={12} /> Edit
                </button>

                {isActive ? (
                  <span className="badge badge-normal" style={{ fontSize: '0.74rem' }}>
                    <Check size={12} /> Active Context
                  </span>
                ) : (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onSelectPatient(patient.id)}
                  >
                    Select Patient
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
