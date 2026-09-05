import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import { InformationConflict } from '../../types';

interface ConflictResolutionModalProps {
  isOpen: boolean;
  conflict: InformationConflict | null;
  onClose: () => void;
  onResolve: (conflictId: string, notes: string) => void;
}

export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  isOpen,
  conflict,
  onClose,
  onResolve,
}) => {
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [selectedSource, setSelectedSource] = useState<'A' | 'B' | 'other'>('A');

  if (!isOpen || !conflict) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) return;

    onResolve(conflict.id, resolutionNotes.trim());
    onClose();
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="conflict-modal-title">
      <div className="modal-dialog" style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} style={{ color: '#dc2626' }} />
            <div>
              <h3 id="conflict-modal-title">Clinical Record Inconsistency Resolution</h3>
              <div style={{ fontSize: '0.74rem', color: 'var(--slate-500)' }}>
                Human verification required • MedLens does not automatically overwrite either source
              </div>
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
              <strong style={{ color: '#9f1239', fontSize: '0.84rem' }}>{conflict.title}</strong>
              <div style={{ fontSize: '0.78rem', color: '#881337', marginTop: '0.2rem' }}>
                {conflict.description}
              </div>
            </div>

            {/* Side by Side Sources Comparison */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
              {/* Source A */}
              <div 
                style={{
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  backgroundColor: selectedSource === 'A' ? '#eff6ff' : 'var(--slate-50)',
                  borderColor: selectedSource === 'A' ? 'var(--primary-500)' : 'var(--border-subtle)',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setSelectedSource('A');
                  setResolutionNotes(`Confirmed Source A (${conflict.sourceA.name}): ${conflict.sourceA.value}. Verified with patient.`);
                }}
              >
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary-800)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Source A: {conflict.sourceA.type}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--slate-900)' }}>
                  {conflict.sourceA.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-700)', marginTop: '0.35rem', backgroundColor: '#ffffff', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--slate-200)' }}>
                  {conflict.sourceA.value}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>
                  Recorded: {conflict.sourceA.date || 'Unspecified'}
                </div>
              </div>

              {/* Source B */}
              <div 
                style={{
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  backgroundColor: selectedSource === 'B' ? '#eff6ff' : 'var(--slate-50)',
                  borderColor: selectedSource === 'B' ? 'var(--primary-500)' : 'var(--border-subtle)',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setSelectedSource('B');
                  setResolutionNotes(`Confirmed Source B (${conflict.sourceB.name}): ${conflict.sourceB.value}. Updated clinical context.`);
                }}
              >
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary-800)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Source B: {conflict.sourceB.type}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--slate-900)' }}>
                  {conflict.sourceB.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-700)', marginTop: '0.35rem', backgroundColor: '#ffffff', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--slate-200)' }}>
                  {conflict.sourceB.value}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>
                  Recorded: {conflict.sourceB.date || 'Unspecified'}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="resolution-notes">
                Clinician Clarification & Resolution Rationale <span className="required-star">*</span>
              </label>
              <textarea
                id="resolution-notes"
                className="form-textarea"
                rows={3}
                placeholder="Detail how this discrepancy was clarified with patient, which record is active, or ongoing precautions..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                required
              />
              <div className="form-hint">
                Resolution reason will be logged in the permanent audit trail with timestamp.
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!resolutionNotes.trim()}>
              <ShieldCheck size={14} />
              <span>Resolve & Log to Audit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
