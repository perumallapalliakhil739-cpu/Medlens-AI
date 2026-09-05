import React, { useState } from 'react';
import { 
  FileText, 
  Check, 
  Edit3, 
  X, 
  CheckCircle2, 
  HelpCircle, 
  Eye, 
  ChevronLeft,
  Shield,
  Search,
  Trash2
} from 'lucide-react';
import { MedicalReport, ExtractedLabResult, ReportObservation } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { SafetyBanner } from '../common/SafetyBanner';

interface SideBySideViewerProps {
  report: MedicalReport;
  labResults: ExtractedLabResult[];
  observations: ReportObservation[];
  onClose: () => void;
  onConfirmResult: (resultId: string) => void;
  onEditResult: (result: ExtractedLabResult) => void;
  onRejectResult: (resultId: string) => void;
  onDeleteReport?: (reportId: string) => void;
}

export const SideBySideViewer: React.FC<SideBySideViewerProps> = ({
  report,
  labResults,
  observations,
  onClose,
  onConfirmResult,
  onEditResult,
  onRejectResult,
  onDeleteReport,
}) => {
  const [selectedResultId, setSelectedResultId] = useState<string | null>(
    labResults[0]?.id || null
  );
  const [sourceSearch, setSourceSearch] = useState('');

  const selectedResult = labResults.find(l => l.id === selectedResultId);

  // Helper to render source text with highlighted snippet
  const renderSourceText = () => {
    if (!report.sourceText) {
      return <div style={{ color: 'var(--slate-400)', fontStyle: 'italic' }}>Source text unavailable.</div>;
    }

    const lines = report.sourceText.split('\n');
    return lines.map((line, idx) => {
      const isSelectedSnippet = selectedResult && selectedResult.sourceSnippet && (
        line.includes(selectedResult.sourceSnippet.trim()) ||
        selectedResult.sourceSnippet.trim().includes(line.trim()) && line.trim().length > 5
      );

      const isSearchMatch = sourceSearch && line.toLowerCase().includes(sourceSearch.toLowerCase());

      return (
        <div
          key={idx}
          style={{
            padding: '2px 6px',
            borderRadius: '3px',
            backgroundColor: isSelectedSnippet ? '#fef08a' : isSearchMatch ? '#e0f2fe' : 'transparent',
            color: isSelectedSnippet ? '#713f12' : isSearchMatch ? '#0369a1' : 'var(--slate-800)',
            fontWeight: isSelectedSnippet ? 600 : 400,
            borderLeft: isSelectedSnippet ? '3px solid #ca8a04' : '3px solid transparent',
            marginBottom: '1px',
          }}
        >
          <span style={{ display: 'inline-block', width: '28px', color: 'var(--slate-400)', fontSize: '0.72rem', userSelect: 'none' }}>
            {idx + 1}
          </span>
          {line}
        </div>
      );
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <SafetyBanner compact />

      {/* Top Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.85rem', marginBottom: '0.85rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-outline btn-sm" onClick={onClose} title="Return to report list">
            <ChevronLeft size={16} /> Back to Reports
          </button>
          <div>
            <h2 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Side-by-Side Source Verification</span>
              <span className="badge" style={{ backgroundColor: 'var(--primary-100)', color: 'var(--primary-800)', fontSize: '0.74rem' }}>
                {report.fileName}
              </span>
            </h2>
            <div style={{ fontSize: '0.74rem', color: 'var(--slate-500)' }}>
              Specimen Date: {report.reportDate || 'Not specified'} • Uploaded: {report.uploadDate} • Format: {report.fileType.toUpperCase()}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-normal">
            <Shield size={12} /> Live Provenance Sync
          </span>
          {onDeleteReport && (
            <button
              className="btn btn-danger-outline btn-sm"
              onClick={() => {
                if (window.confirm(`Delete report "${report.fileName}" and remove its extracted parameters?`)) {
                  onDeleteReport(report.id);
                  onClose();
                }
              }}
              title="Delete this report and remove its extracted parameters"
            >
              <Trash2 size={13} />
              <span>Delete Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Side by Side Split Grid */}
      <div className="side-by-side-grid" style={{ flex: 1, minHeight: 0 }}>
        {/* Left Pane: Original Source Document */}
        <div className="source-viewer-pane">
          <div style={{ padding: '0.65rem 1rem', backgroundColor: 'var(--slate-50)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--slate-700)' }}>
              <FileText size={15} style={{ color: 'var(--primary-600)' }} />
              <span>Original Source Document Text</span>
            </div>

            <div style={{ position: 'relative', width: '200px' }}>
              <Search size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
              <input
                type="text"
                placeholder="Find in source text..."
                value={sourceSearch}
                onChange={(e) => setSourceSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.25rem 0.5rem 0.25rem 1.7rem',
                  fontSize: '0.74rem',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                }}
              />
            </div>
          </div>

          <div className="source-viewer-content">
            {renderSourceText()}
          </div>

          {selectedResult && (
            <div style={{ padding: '0.65rem 1rem', backgroundColor: '#fefce8', borderTop: '1px solid #fef08a', fontSize: '0.76rem', color: '#713f12' }}>
              <strong>Highlighted Context:</strong> Matched line for <em>{selectedResult.testName}</em>. Inspect and verify against source line on the left.
            </div>
          )}
        </div>

        {/* Right Pane: Structured Extracted Information */}
        <div className="structured-pane">
          <div style={{ padding: '0.65rem 1rem', backgroundColor: 'var(--slate-50)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--slate-700)' }}>
              Extracted Parameters & Human Verification ({labResults.length})
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
              Click any row to jump to source text
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            <table className="clinical-table">
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Value</th>
                  <th>Unit</th>
                  <th>Source Range</th>
                  <th>Status</th>
                  <th>Verify</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {labResults.map((res) => {
                  const isSelected = res.id === selectedResultId;
                  const isVerified = res.verificationStatus === 'verified';

                  return (
                    <tr
                      key={res.id}
                      onClick={() => setSelectedResultId(res.id)}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#eff6ff' : undefined,
                        borderLeft: isSelected ? '4px solid var(--primary-600)' : '4px solid transparent',
                      }}
                    >
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{res.testName}</div>
                        <ConfidenceBadge confidence={res.confidence} />
                      </td>

                      <td>
                        <strong style={{ fontSize: '0.9rem' }}>{res.value}</strong>
                        {res.originalExtractedValue && res.originalExtractedValue !== res.value && (
                          <div style={{ fontSize: '0.65rem', color: '#b91c1c', textDecoration: 'line-through' }}>
                            Orig: {res.originalExtractedValue}
                          </div>
                        )}
                      </td>

                      <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                        {res.unit || '—'}
                      </td>

                      <td style={{ fontSize: '0.78rem' }}>
                        {res.referenceRangeText.toLowerCase().includes('unavailable') ? (
                          <span style={{ color: 'var(--slate-400)', fontStyle: 'italic', fontSize: '0.72rem' }}>
                            Unavailable in report
                          </span>
                        ) : (
                          <span style={{ fontFamily: 'monospace' }}>{res.referenceRangeText}</span>
                        )}
                      </td>

                      <td>
                        <StatusBadge status={res.status} />
                      </td>

                      <td>
                        {isVerified ? (
                          <span className="badge badge-normal" style={{ fontSize: '0.7rem' }}>
                            <CheckCircle2 size={10} /> Verified
                          </span>
                        ) : (
                          <span className="badge badge-review" style={{ fontSize: '0.7rem' }}>
                            Needs Review
                          </span>
                        )}
                      </td>

                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
                          {!isVerified && (
                            <button
                              className="btn btn-sm"
                              style={{ backgroundColor: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0' }}
                              onClick={() => onConfirmResult(res.id)}
                              title="Confirm extracted value matches source document"
                            >
                              <Check size={11} /> Confirm
                            </button>
                          )}
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => onEditResult(res)}
                            title="Edit value or range"
                          >
                            <Edit3 size={11} />
                          </button>
                          <button
                            className="btn btn-danger-outline btn-sm"
                            onClick={() => onRejectResult(res.id)}
                            title="Reject extracted field"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Extracted Observations in this Report */}
            {observations.length > 0 && (
              <div style={{ padding: '1rem', borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--slate-50)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.4rem' }}>
                  Extracted Clinical Observations & Impressions:
                </div>
                {observations.map((obs) => (
                  <div key={obs.id} style={{ fontSize: '0.78rem', color: 'var(--slate-700)', padding: '0.4rem 0.6rem', backgroundColor: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--slate-200)', marginBottom: '0.35rem' }}>
                    <div style={{ fontStyle: 'italic' }}>"{obs.observationText}"</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--slate-400)', marginTop: '2px' }}>
                      Snippet: {obs.sourceSnippet}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
