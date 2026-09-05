import React from 'react';
import { Printer, X, Download, ShieldCheck } from 'lucide-react';
import { Patient, MedicalReport, ExtractedLabResult, ReportObservation, AISummary } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { MANDATORY_SAFETY_DISCLAIMER } from '../../services/aiSummaryEngine';

interface PrintableMedicalRecordProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  reports: MedicalReport[];
  labResults: ExtractedLabResult[];
  observations: ReportObservation[];
  summary: AISummary | undefined;
}

export const PrintableMedicalRecord: React.FC<PrintableMedicalRecordProps> = ({
  isOpen,
  onClose,
  patient,
  reports,
  labResults,
  observations,
  summary,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" style={{ padding: '1rem' }}>
      <div className="modal-dialog" style={{ maxWidth: '850px', maxHeight: '95vh' }}>
        {/* Modal Action Bar (Hidden during actual print) */}
        <div className="modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Printer size={18} style={{ color: 'var(--primary-600)' }} />
            <div>
              <h3>Structured Medical Record Export</h3>
              <div style={{ fontSize: '0.74rem', color: 'var(--slate-500)' }}>
                Clinical record summary with full provenance labels and safety disclaimers
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={13} /> Print / Save as PDF
            </button>
            <button className="btn btn-outline btn-sm" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="modal-body printable-document" style={{ overflowY: 'auto' }}>
          {/* Clinical Header */}
          <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '0.75rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '1.4rem', color: '#0f172a', fontWeight: 800 }}>MEDLENS CLINICAL RECORD SUMMARY</h1>
              <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                AI Clinical Information Intelligence System • Traceable Patient Record
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.74rem', color: '#475569' }}>
              <div>Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
              <div>Report ID: EXP-{patient.patientIdNumber}-{Date.now().toString().slice(-4)}</div>
            </div>
          </div>

          {/* Prominent Disclaimer */}
          <div style={{ border: '1px solid #d97706', backgroundColor: '#fffbeb', padding: '0.65rem 0.85rem', borderRadius: '4px', marginBottom: '1.25rem', fontSize: '0.74rem', color: '#78350f', lineHeight: '1.4' }}>
            <strong>IMPORTANT CLINICAL NOTICE:</strong> {MANDATORY_SAFETY_DISCLAIMER}
          </div>

          {/* Section 1: Patient Intake Details */}
          <div style={{ marginBottom: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem', marginBottom: '0.5rem' }}>
              <strong style={{ fontSize: '0.86rem', color: '#0f172a' }}>1. PATIENT INTAKE INFORMATION</strong>
              <ProvenanceBadge provenance="user_provided" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontSize: '0.78rem', marginBottom: '0.5rem' }}>
              <div><strong>Name:</strong> {patient.name}</div>
              <div><strong>MRN / ID:</strong> {patient.patientIdNumber}</div>
              <div><strong>Age / Sex:</strong> {patient.age}y / {patient.sex}</div>
              <div><strong>DOB:</strong> {patient.dob || 'Unspecified'}</div>
              <div><strong>Contact:</strong> {patient.contact || 'Unspecified'}</div>
              <div><strong>Registration:</strong> {patient.registrationDate}</div>
            </div>

            <div style={{ fontSize: '0.76rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.4rem' }}>
              <div><strong>Allergies:</strong> {patient.allergies.join(', ') || 'None recorded during intake'}</div>
              <div><strong>Existing Conditions:</strong> {patient.existingConditions.join(', ') || 'None recorded'}</div>
              <div><strong>Active Medications:</strong> {patient.currentMedications.map(m => `${m.name} ${m.dosage || ''}`).join(', ') || 'None recorded'}</div>
              <div><strong>Reported Symptoms:</strong> {patient.symptoms.join(', ') || 'None recorded'}</div>
            </div>
          </div>

          {/* Section 2: Laboratory Test Results */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <strong style={{ fontSize: '0.86rem', color: '#0f172a' }}>2. STRUCTURED LABORATORY TEST RESULTS</strong>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Reference ranges preserved strictly from source reports</span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ textAlign: 'left', padding: '5px' }}>Test Parameter</th>
                  <th style={{ textAlign: 'left', padding: '5px' }}>Value</th>
                  <th style={{ textAlign: 'left', padding: '5px' }}>Unit</th>
                  <th style={{ textAlign: 'left', padding: '5px' }}>Source Reference Range</th>
                  <th style={{ textAlign: 'left', padding: '5px' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '5px' }}>Provenance</th>
                  <th style={{ textAlign: 'left', padding: '5px' }}>Verification</th>
                </tr>
              </thead>
              <tbody>
                {labResults.map((l) => (
                  <tr key={l.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '5px', fontWeight: 600 }}>{l.testName}</td>
                    <td style={{ padding: '5px', fontWeight: 700 }}>{l.value}</td>
                    <td style={{ padding: '5px', fontFamily: 'monospace' }}>{l.unit || '—'}</td>
                    <td style={{ padding: '5px' }}>{l.referenceRangeText}</td>
                    <td style={{ padding: '5px' }}><StatusBadge status={l.status} showIcon={false} /></td>
                    <td style={{ padding: '5px' }}><ProvenanceBadge provenance={l.provenance} /></td>
                    <td style={{ padding: '5px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: l.verificationStatus === 'verified' ? '#065f46' : '#92400e' }}>
                        {l.verificationStatus.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 3: AI Synthesis Narrative */}
          {summary && (
            <div style={{ marginBottom: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem', marginBottom: '0.5rem' }}>
                <strong style={{ fontSize: '0.86rem', color: '#0f172a' }}>3. PATIENT-FRIENDLY AI CLINICAL SYNTHESIS</strong>
                <ProvenanceBadge provenance="ai_generated" />
              </div>

              <div style={{ fontSize: '0.76rem', color: '#334155', lineHeight: '1.5', whiteSpace: 'pre-wrap', marginBottom: '0.6rem' }}>
                {summary.summaryText}
              </div>

              {summary.outOfRangeFindings.length > 0 && (
                <div style={{ fontSize: '0.74rem', marginBottom: '0.4rem' }}>
                  <strong>Parameters Outside Source Reference Ranges:</strong>
                  <ul style={{ paddingLeft: '1.2rem', marginTop: '2px' }}>
                    {summary.outOfRangeFindings.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.nonDiagnosticDiscussionPoints.length > 0 && (
                <div style={{ fontSize: '0.74rem' }}>
                  <strong>Points for Physician Discussion:</strong>
                  <ul style={{ paddingLeft: '1.2rem', marginTop: '2px' }}>
                    {summary.nonDiagnosticDiscussionPoints.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Section 4: Source Documents Included */}
          <div style={{ fontSize: '0.74rem', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem' }}>
            <strong>Source Documents Included in Record:</strong> {reports.map(r => `${r.fileName} (${r.reportDate || r.uploadDate})`).join('; ')}
          </div>
        </div>

        <div className="modal-footer no-print">
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={14} /> Print Document
          </button>
        </div>
      </div>
    </div>
  );
};
