import React, { useState, useEffect } from 'react';
import { X, Edit3, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';
import { ExtractedLabResult, LabStatus, VerificationStatus } from '../../types';
import { evaluateReferenceRange } from '../../services/clinicalParser';

interface VerificationModalProps {
  isOpen: boolean;
  result: ExtractedLabResult | null;
  onClose: () => void;
  onSave: (resultId: string, updates: Partial<ExtractedLabResult>, reason: string) => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  result,
  onClose,
  onSave,
}) => {
  const [testName, setTestName] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('');
  const [referenceRangeText, setReferenceRangeText] = useState('');
  const [status, setStatus] = useState<LabStatus>('normal');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('verified');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (result) {
      setTestName(result.testName);
      setValue(result.value);
      setUnit(result.unit);
      setReferenceRangeText(result.referenceRangeText);
      setStatus(result.status);
      setVerificationStatus(result.verificationStatus === 'not_reviewed' ? 'verified' : result.verificationStatus);
      setReason('');
    }
  }, [result, isOpen]);

  if (!isOpen || !result) return null;

  // Auto recalculate status when value or range changes
  const handleValueChange = (newVal: string) => {
    setValue(newVal);
    const num = parseFloat(newVal.replace(/[^\d.-]/g, ''));
    const evalRes = evaluateReferenceRange(newVal, isNaN(num) ? undefined : num, referenceRangeText);
    setStatus(evalRes.status);
  };

  const handleRangeChange = (newRange: string) => {
    setReferenceRangeText(newRange);
    const num = parseFloat(value.replace(/[^\d.-]/g, ''));
    const evalRes = evaluateReferenceRange(value, isNaN(num) ? undefined : num, newRange);
    setStatus(evalRes.status);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!result) return;

    const numVal = parseFloat(value.replace(/[^\d.-]/g, ''));
    const isValueChanged = value !== result.value || unit !== result.unit || referenceRangeText !== result.referenceRangeText || testName !== result.testName;

    const newVerificationStatus: VerificationStatus = isValueChanged ? 'edited' : verificationStatus;

    onSave(
      result.id,
      {
        testName: testName.trim(),
        value: value.trim(),
        numericValue: isNaN(numVal) ? undefined : numVal,
        unit: unit.trim(),
        referenceRangeText: referenceRangeText.trim(),
        status,
        verificationStatus: newVerificationStatus,
        provenance: 'human_verified',
        verifiedBy: 'Clinical Reviewer (Human Verified)',
        verifiedAt: new Date().toISOString(),
      },
      reason.trim() || (isValueChanged ? `Clinician edited value from ${result.value} to ${value}` : 'Confirmed extracted result')
    );
    onClose();
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="verify-modal-title">
      <div className="modal-dialog" style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Edit3 size={18} style={{ color: 'var(--primary-600)' }} />
            <div>
              <h3 id="verify-modal-title">Human Verification & Record Edit</h3>
              <div style={{ fontSize: '0.74rem', color: 'var(--slate-500)' }}>
                Audit preserved: original extraction will remain recorded in system logs
              </div>
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Original Source Reference Box */}
            <div style={{ backgroundColor: 'var(--slate-50)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                Extracted From Source Document:
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--slate-900)', backgroundColor: '#ffffff', padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid var(--slate-200)' }}>
                {result.sourceSnippet}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>
                Original Extracted Value: <strong>{result.originalExtractedValue || result.value} {result.unit}</strong> • Location: {result.sourceLocation || 'Report Body'}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="verify-test-name">
                Test Name
              </label>
              <input
                id="verify-test-name"
                type="text"
                className="form-input"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="verify-value">
                  Reported Value
                </label>
                <input
                  id="verify-value"
                  type="text"
                  className="form-input"
                  value={value}
                  onChange={(e) => handleValueChange(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="verify-unit">
                  Unit
                </label>
                <input
                  id="verify-unit"
                  type="text"
                  className="form-input"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="verify-range">
                Source Reference Range <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>(Must strictly match source document)</span>
              </label>
              <input
                id="verify-range"
                type="text"
                className="form-input"
                value={referenceRangeText}
                onChange={(e) => handleRangeChange(e.target.value)}
                required
              />
              <div className="form-hint">
                If range is absent from the report, enter: "Reference range unavailable in source report".
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="verify-status">
                  Status Indicator (Relative to Range)
                </label>
                <select
                  id="verify-status"
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as LabStatus)}
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="low">Low</option>
                  <option value="status_unavailable">Status Unavailable</option>
                  <option value="requires_review">Requires Review</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="verify-state">
                  Verification Action
                </label>
                <select
                  id="verify-state"
                  className="form-select"
                  value={verificationStatus}
                  onChange={(e) => setVerificationStatus(e.target.value as VerificationStatus)}
                >
                  <option value="verified">Verified (Confirmed Correct)</option>
                  <option value="edited">User Edited</option>
                  <option value="needs_review">Mark for Further Review</option>
                  <option value="rejected">Reject / Discard</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="verify-reason">
                Clinician Verification Note / Rationale <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>(Logged to Audit Trail)</span>
              </label>
              <textarea
                id="verify-reason"
                className="form-textarea"
                rows={2}
                placeholder="e.g. Confirmed against Quest lab report page 1 line 8."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <ShieldCheck size={14} />
              <span>Save & Log Verification</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
