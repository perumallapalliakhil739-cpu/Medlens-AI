import React, { useState } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  RefreshCw, 
  MessageSquare, 
  ChevronRight,
  Shield,
  FileQuestion,
  Check
} from 'lucide-react';
import { 
  AISummary, 
  InformationConflict, 
  ClarificationQuestion, 
  Patient, 
  MedicalReport 
} from '../../types';
import { SafetyBanner } from '../common/SafetyBanner';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { ConflictResolutionModal } from './ConflictResolutionModal';

interface AIInsightsViewProps {
  patient: Patient;
  summary: AISummary | undefined;
  conflicts: InformationConflict[];
  clarifications: ClarificationQuestion[];
  reports: MedicalReport[];
  isGenerating: boolean;
  onRegenerateSummary: () => void;
  onResolveConflict: (conflictId: string, notes: string) => void;
  onAnswerClarification: (questionId: string, answer: string) => void;
}

export const AIInsightsView: React.FC<AIInsightsViewProps> = ({
  patient,
  summary,
  conflicts,
  clarifications,
  reports,
  isGenerating,
  onRegenerateSummary,
  onResolveConflict,
  onAnswerClarification,
}) => {
  const [selectedConflict, setSelectedConflict] = useState<InformationConflict | null>(null);
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);
  const [answerInput, setAnswerInput] = useState('');

  const unresolvedConflicts = conflicts.filter(c => c.status === 'unresolved');
  const resolvedConflicts = conflicts.filter(c => c.status === 'resolved');

  const pendingClarifications = clarifications.filter(q => !q.answered);
  const answeredClarifications = clarifications.filter(q => q.answered);

  const handleSaveAnswer = (qId: string) => {
    if (answerInput.trim()) {
      onAnswerClarification(qId, answerInput.trim());
      setAnsweringQuestionId(null);
      setAnswerInput('');
    }
  };

  return (
    <div className="insights-view">
      <SafetyBanner compact />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2>AI Clinical Information Insights & Explanatory Synthesis</h2>
          <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
            Transparent, non-diagnostic synthesis, potential inconsistency flags, and clinical clarification questions
          </div>
        </div>

        <button 
          className="btn btn-outline btn-sm"
          onClick={onRegenerateSummary}
          disabled={isGenerating}
        >
          <RefreshCw size={13} className={isGenerating ? 'spin' : ''} />
          <span>{isGenerating ? 'Formulating AI Synthesis...' : 'Regenerate Insights'}</span>
        </button>
      </div>

      {/* Safety & Non-Diagnostic Framing Card */}
      <div style={{ backgroundColor: 'var(--primary-50)', border: '1px solid var(--primary-200)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <Shield size={18} style={{ color: 'var(--primary-600)', flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.8rem', color: 'var(--primary-950)', lineHeight: '1.45' }}>
          <strong>Responsible AI Design Tenet:</strong> This intelligence module organizes and translates complex medical documentation into accessible language. It strictly avoids offering clinical diagnoses, predicting prognosis, or prescribing interventions.
        </div>
      </div>

      {/* Section 1: Inconsistency & Conflict Detection */}
      <div className="card" style={{ marginBottom: '1.5rem', borderColor: unresolvedConflicts.length > 0 ? '#fca5a5' : 'var(--border-subtle)' }}>
        <div className="card-header">
          <div className="card-title-group">
            <AlertTriangle size={18} style={{ color: unresolvedConflicts.length > 0 ? '#dc2626' : '#059669' }} />
            <div>
              <h3>Information Inconsistency & Conflict Detection</h3>
              <div style={{ fontSize: '0.74rem', color: 'var(--slate-500)' }}>
                Cross-document verification between intake surveys and uploaded medical records
              </div>
            </div>
          </div>
          <span className="badge" style={{ backgroundColor: unresolvedConflicts.length > 0 ? '#fee2e2' : '#ecfdf5', color: unresolvedConflicts.length > 0 ? '#991b1b' : '#065f46' }}>
            {unresolvedConflicts.length} Unresolved Conflict{unresolvedConflicts.length !== 1 ? 's' : ''}
          </span>
        </div>

        {unresolvedConflicts.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: '#f0fdf4', borderRadius: 'var(--radius-md)', color: '#166534', fontSize: '0.82rem' }}>
            <CheckCircle2 size={16} />
            <span>No unresolved information conflicts detected across active documents.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {unresolvedConflicts.map((c) => (
              <div
                key={c.id}
                style={{
                  border: '1px solid #fecdd3',
                  backgroundColor: '#fff1f2',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <strong style={{ color: '#9f1239', fontSize: '0.9rem' }}>{c.title}</strong>
                  <button
                    className="btn btn-sm"
                    style={{ backgroundColor: '#ffffff', color: '#9f1239', border: '1px solid #fecdd3' }}
                    onClick={() => setSelectedConflict(c)}
                  >
                    Review & Resolve Conflict
                  </button>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#881337', marginBottom: '0.6rem' }}>
                  {c.description}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem', fontSize: '0.76rem', color: '#713f12', backgroundColor: '#ffffff', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid #fed7aa' }}>
                  <div>
                    <strong>{c.sourceA.name}:</strong> {c.sourceA.value}
                  </div>
                  <div>
                    <strong>{c.sourceB.name}:</strong> {c.sourceB.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {resolvedConflicts.length > 0 && (
          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--slate-100)' }}>
            <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--slate-500)', marginBottom: '0.4rem' }}>
              Resolved Historical Conflicts ({resolvedConflicts.length})
            </div>
            {resolvedConflicts.map(rc => (
              <div key={rc.id} style={{ fontSize: '0.76rem', color: 'var(--slate-600)', padding: '0.35rem 0' }}>
                <Check size={12} style={{ color: '#059669', display: 'inline', marginRight: '4px' }} />
                <strong>{rc.title}:</strong> {rc.resolutionNotes}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Context-Aware Clarification Questions */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div className="card-title-group">
            <FileQuestion size={18} className="card-title-icon" />
            <div>
              <h3>Context-Aware Clarification Questions</h3>
              <div style={{ fontSize: '0.74rem', color: 'var(--slate-500)' }}>
                System-generated queries highlighting ambiguous or missing source information
              </div>
            </div>
          </div>
          <span className="badge" style={{ backgroundColor: 'var(--slate-100)', color: 'var(--slate-700)' }}>
            {pendingClarifications.length} Pending
          </span>
        </div>

        {pendingClarifications.length === 0 && answeredClarifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--slate-500)', fontSize: '0.82rem' }}>
            No clarification questions required for current records.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendingClarifications.map((q) => (
              <div
                key={q.id}
                style={{
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  backgroundColor: 'var(--slate-50)',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--slate-900)', marginBottom: '0.25rem' }}>
                  {q.question}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--slate-500)', marginBottom: '0.5rem' }}>
                  Context: {q.context}
                </div>

                {answeringQuestionId === q.id ? (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Type clinical clarification..."
                      value={answerInput}
                      onChange={(e) => setAnswerInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveAnswer(q.id); }}
                    />
                    <button className="btn btn-primary btn-sm" onClick={() => handleSaveAnswer(q.id)}>
                      Submit
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => setAnsweringQuestionId(null)}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setAnsweringQuestionId(q.id);
                      setAnswerInput('');
                    }}
                  >
                    Answer Clarification
                  </button>
                )}
              </div>
            ))}

            {answeredClarifications.map((q) => (
              <div
                key={q.id}
                style={{
                  border: '1px solid #d1fae5',
                  backgroundColor: '#f0fdf4',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem',
                  fontSize: '0.78rem',
                }}
              >
                <div style={{ color: '#065f46', fontWeight: 600 }}>
                  <Check size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  {q.question}
                </div>
                <div style={{ color: '#047857', marginTop: '0.2rem' }}>
                  <strong>User Response:</strong> "{q.userResponse}"
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 3: Full AI Synthesis Narrative */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div className="card-title-group">
            <Sparkles size={18} style={{ color: 'var(--primary-600)' }} />
            <div>
              <h3>Comprehensive AI Clinical Synthesis</h3>
              <div style={{ fontSize: '0.74rem', color: 'var(--slate-500)' }}>
                Provenance: AI Generated • Non-diagnostic translation of available facts
              </div>
            </div>
          </div>
          <ProvenanceBadge provenance="ai_generated" />
        </div>

        {summary ? (
          <div>
            <div style={{ fontSize: '0.86rem', lineHeight: '1.65', color: 'var(--slate-800)', marginBottom: '1.25rem' }}>
              {summary.summaryText.split('\n\n').map((p, idx) => (
                <p key={idx} style={{ marginBottom: '0.75rem' }}>{p}</p>
              ))}
            </div>

            {/* Observations and Discussion Points */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ backgroundColor: 'var(--slate-50)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.4rem' }}>
                  Clinical Observations from Source Documents:
                </div>
                <ul style={{ paddingLeft: '1.2rem', fontSize: '0.76rem', color: 'var(--slate-700)', lineHeight: '1.5' }}>
                  {summary.keyObservations.map((obs, idx) => (
                    <li key={idx} style={{ marginBottom: '0.25rem' }}>{obs}</li>
                  ))}
                </ul>
              </div>

              <div style={{ backgroundColor: 'var(--primary-50)', border: '1px solid var(--primary-200)', borderRadius: 'var(--radius-md)', padding: '0.85rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-800)', marginBottom: '0.4rem' }}>
                  Suggested Points for Doctor Discussion:
                </div>
                <ul style={{ paddingLeft: '1.2rem', fontSize: '0.76rem', color: 'var(--primary-950)', lineHeight: '1.5' }}>
                  {summary.nonDiagnosticDiscussionPoints.map((pt, idx) => (
                    <li key={idx} style={{ marginBottom: '0.25rem' }}>{pt}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)' }}>
            No AI summary has been formulated. Click Regenerate to process available records.
          </div>
        )}
      </div>

      {/* Conflict Resolution Modal */}
      <ConflictResolutionModal
        isOpen={Boolean(selectedConflict)}
        conflict={selectedConflict}
        onClose={() => setSelectedConflict(null)}
        onResolve={onResolveConflict}
      />
    </div>
  );
};
