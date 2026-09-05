import React, { useState } from 'react';
import { Sparkles, AlertCircle, RefreshCw, MessageSquare, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { AISummary } from '../../types';
import { ProvenanceBadge } from '../common/ProvenanceBadge';

interface AISummaryCardProps {
  summary: AISummary | undefined;
  isGenerating: boolean;
  onRegenerateSummary: () => void;
  onNavigateToInsights: () => void;
}

export const AISummaryCard: React.FC<AISummaryCardProps> = ({
  summary,
  isGenerating,
  onRegenerateSummary,
  onNavigateToInsights,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: '#fcfdff', borderColor: 'var(--primary-200)' }}>
      <div className="card-header">
        <div className="card-title-group">
          <Sparkles size={18} style={{ color: 'var(--primary-600)' }} />
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Patient-Friendly Clinical Intelligence Summary
              <ProvenanceBadge provenance="ai_generated" />
            </h3>
            <div style={{ fontSize: '0.74rem', color: 'var(--slate-500)' }}>
              Non-diagnostic explanatory synthesis • Generated {summary?.generatedDate || 'today'}
            </div>
          </div>
        </div>

        <div className="card-actions">
          <button 
            className="btn btn-outline btn-sm" 
            onClick={onRegenerateSummary}
            disabled={isGenerating}
            title="Refresh summary using available records"
          >
            <RefreshCw size={13} className={isGenerating ? 'spin' : ''} />
            <span>{isGenerating ? 'Synthesizing...' : 'Regenerate'}</span>
          </button>
        </div>
      </div>

      {/* Summary Narrative Content */}
      <div style={{ fontSize: '0.86rem', color: 'var(--slate-700)', lineHeight: '1.65' }}>
        {summary?.summaryText ? (
          <div>
            {summary.summaryText.split('\n\n').map((para, i) => (
              <p key={i} style={{ marginBottom: '0.75rem' }}>
                {para}
              </p>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--slate-500)', fontStyle: 'italic' }}>
            No summary generated yet. Click Regenerate to formulate a summary from uploaded reports.
          </p>
        )}
      </div>

      {/* Out of Range & Discussion Points Highlight Box */}
      {summary && (
        <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {/* Out of Range Observations */}
          <div style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 'var(--radius-md)', padding: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 700, color: '#9f1239', marginBottom: '0.4rem' }}>
              <AlertCircle size={14} />
              <span>Values Outside Source Reference Ranges</span>
            </div>
            {summary.outOfRangeFindings.length > 0 ? (
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.78rem', color: '#881337', lineHeight: '1.45' }}>
                {summary.outOfRangeFindings.map((finding, idx) => (
                  <li key={idx} style={{ marginBottom: '0.35rem' }}>
                    {finding}
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ fontSize: '0.76rem', color: '#065f46' }}>
                All available extracted values fall within their respective source reference ranges.
              </div>
            )}
          </div>

          {/* Discussion Points */}
          <div style={{ backgroundColor: 'var(--primary-50)', border: '1px solid var(--primary-200)', borderRadius: 'var(--radius-md)', padding: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-800)', marginBottom: '0.4rem' }}>
              <MessageSquare size={14} />
              <span>Points for Discussion with Your Doctor</span>
            </div>
            {summary.nonDiagnosticDiscussionPoints.length > 0 ? (
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.78rem', color: 'var(--primary-900)', lineHeight: '1.45' }}>
                {summary.nonDiagnosticDiscussionPoints.map((point, idx) => (
                  <li key={idx} style={{ marginBottom: '0.35rem' }}>
                    {point}
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ fontSize: '0.76rem', color: 'var(--slate-500)' }}>
                No active discussion points flagged at this time.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expandable Details: Missing Info & Observations */}
      {summary && (
        <div style={{ marginTop: '1rem' }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary-700)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: 0,
            }}
          >
            <span>{expanded ? 'Hide Source Observations & Missing Info' : 'Show Source Observations & Missing Info'}</span>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {expanded && (
            <div style={{ marginTop: '0.75rem', padding: '0.85rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
              {summary.missingOrUnclearInfo.length > 0 && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.25rem' }}>
                    Missing or Unclear Information in Source Reports:
                  </div>
                  <ul style={{ paddingLeft: '1.2rem', fontSize: '0.76rem', color: 'var(--slate-600)' }}>
                    {summary.missingOrUnclearInfo.map((info, idx) => (
                      <li key={idx}>{info}</li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.keyObservations.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.25rem' }}>
                    Clinical Observations Recorded in Source Documents:
                  </div>
                  <ul style={{ paddingLeft: '1.2rem', fontSize: '0.76rem', color: 'var(--slate-600)' }}>
                    {summary.keyObservations.map((obs, idx) => (
                      <li key={idx} style={{ fontStyle: 'italic', marginBottom: '0.2rem' }}>
                        {obs}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mandatory Safety Notice Inside Card */}
      <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--slate-500)' }}>
        <div>
          <strong>Medical Notice:</strong> AI summary explains available parameters. It is not medical advice or diagnostic conclusions.
        </div>
        <button
          onClick={onNavigateToInsights}
          style={{ background: 'none', border: 'none', color: 'var(--primary-700)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
        >
          View Full AI Insights & Conflicts →
        </button>
      </div>
    </div>
  );
};
