import React, { useState } from 'react';
import { 
  Activity, 
  Check, 
  Edit3, 
  Eye, 
  HelpCircle, 
  CheckCircle2, 
  Filter
} from 'lucide-react';
import { ExtractedLabResult, MedicalReport } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { ConfidenceBadge } from '../common/ConfidenceBadge';

interface StructuredSummaryCardProps {
  labResults: ExtractedLabResult[];
  reports: MedicalReport[];
  onConfirmResult: (resultId: string) => void;
  onEditResult: (result: ExtractedLabResult) => void;
  onInspectSource: (result: ExtractedLabResult) => void;
}

export const StructuredSummaryCard: React.FC<StructuredSummaryCardProps> = ({
  labResults,
  reports,
  onConfirmResult,
  onEditResult,
  onInspectSource,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'abnormal' | 'review' | 'missing_range'>('all');
  const [testSearch, setTestSearch] = useState('');

  // Report map
  const reportMap = new Map<string, MedicalReport>();
  reports.forEach(r => reportMap.set(r.id, r));

  const filteredResults = labResults.filter(item => {
    // Search match
    if (testSearch.trim()) {
      const q = testSearch.toLowerCase();
      const matchName = item.testName.toLowerCase().includes(q);
      const matchVal = item.value.toLowerCase().includes(q);
      if (!matchName && !matchVal) return false;
    }

    if (filterMode === 'abnormal') {
      return item.status === 'low' || item.status === 'high';
    }
    if (filterMode === 'review') {
      return item.verificationStatus === 'needs_review' || item.status === 'requires_review';
    }
    if (filterMode === 'missing_range') {
      return item.status === 'status_unavailable';
    }
    return true;
  });

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <div className="card-header">
        <div className="card-title-group">
          <Activity size={18} className="card-title-icon" />
          <div>
            <h3>Structured Laboratory Record</h3>
            <div style={{ fontSize: '0.74rem', color: 'var(--slate-500)' }}>
              Extracted clinical parameters with source reference ranges and human verification
            </div>
          </div>
        </div>

        {/* Filter controls */}
        <div className="card-actions" style={{ flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'var(--slate-100)', padding: '2px', borderRadius: 'var(--radius-md)' }}>
            <button
              className={`btn btn-sm ${filterMode === 'all' ? 'btn-primary' : 'btn-outline'}`}
              style={{ border: 'none', fontSize: '0.74rem' }}
              onClick={() => setFilterMode('all')}
            >
              All ({labResults.length})
            </button>
            <button
              className={`btn btn-sm ${filterMode === 'abnormal' ? 'btn-primary' : 'btn-outline'}`}
              style={{ border: 'none', fontSize: '0.74rem' }}
              onClick={() => setFilterMode('abnormal')}
            >
              Out of Range ({labResults.filter(l => l.status === 'low' || l.status === 'high').length})
            </button>
            <button
              className={`btn btn-sm ${filterMode === 'review' ? 'btn-primary' : 'btn-outline'}`}
              style={{ border: 'none', fontSize: '0.74rem' }}
              onClick={() => setFilterMode('review')}
            >
              Needs Review ({labResults.filter(l => l.verificationStatus === 'needs_review' || l.status === 'requires_review').length})
            </button>
            <button
              className={`btn btn-sm ${filterMode === 'missing_range' ? 'btn-primary' : 'btn-outline'}`}
              style={{ border: 'none', fontSize: '0.74rem' }}
              onClick={() => setFilterMode('missing_range')}
            >
              No Range ({labResults.filter(l => l.status === 'status_unavailable').length})
            </button>
          </div>
        </div>
      </div>

      {/* Subheader Search and Guidance */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.85rem' }}>
        <input
          type="text"
          placeholder="Filter tests by name or value..."
          value={testSearch}
          onChange={(e) => setTestSearch(e.target.value)}
          style={{
            maxWidth: '300px',
            padding: '0.35rem 0.65rem',
            fontSize: '0.8rem',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            outline: 'none',
          }}
        />

        <div style={{ fontSize: '0.74rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <HelpCircle size={13} />
          <span>Reference ranges preserved strictly from source reports. Never artificially inferred.</span>
        </div>
      </div>

      {filteredResults.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)' }}>
          <Filter size={24} style={{ margin: '0 auto 0.5rem', color: 'var(--slate-300)' }} />
          <div>No laboratory results match the selected filter criteria.</div>
        </div>
      ) : (
        <div className="table-container">
          <table className="clinical-table">
            <thead>
              <tr>
                <th>Test / Parameter</th>
                <th>Reported Value</th>
                <th>Unit</th>
                <th>Source Reference Range</th>
                <th>Status Indicator</th>
                <th>Confidence</th>
                <th>Report Date</th>
                <th>Provenance</th>
                <th>Verification</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((result) => {
                const parentReport = reportMap.get(result.reportId);
                const isVerified = result.verificationStatus === 'verified';
                const isEdited = result.verificationStatus === 'edited';

                return (
                  <tr 
                    key={result.id}
                    style={{
                      backgroundColor: result.status === 'high' ? '#fffbfc' : result.status === 'low' ? '#fffdf7' : undefined
                    }}
                  >
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--slate-900)' }}>
                        {result.testName}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>
                        Source: {parentReport ? parentReport.fileName : 'Report Document'}
                      </div>
                    </td>

                    <td>
                      <span style={{ 
                        fontWeight: 700, 
                        fontSize: '0.94rem',
                        color: result.status === 'high' ? '#9f1239' : result.status === 'low' ? '#92400e' : 'var(--slate-900)'
                      }}>
                        {result.value}
                      </span>
                      {result.originalExtractedValue && result.originalExtractedValue !== result.value && (
                        <div style={{ fontSize: '0.68rem', color: '#b91c1c', textDecoration: 'line-through' }}>
                          Orig: {result.originalExtractedValue}
                        </div>
                      )}
                    </td>

                    <td>
                      <span style={{ fontSize: '0.82rem', color: 'var(--slate-600)', fontFamily: 'monospace' }}>
                        {result.unit || '—'}
                      </span>
                    </td>

                    <td>
                      {result.referenceRangeText.toLowerCase().includes('unavailable') ? (
                        <span style={{ fontSize: '0.74rem', color: 'var(--slate-500)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <HelpCircle size={12} />
                          Unavailable in source report
                        </span>
                      ) : (
                        <span style={{ fontWeight: 500, fontFamily: 'monospace', fontSize: '0.82rem' }}>
                          {result.referenceRangeText}
                        </span>
                      )}
                    </td>

                    <td>
                      <StatusBadge status={result.status} />
                    </td>

                    <td>
                      <ConfidenceBadge confidence={result.confidence} />
                    </td>

                    <td>
                      <span style={{ fontSize: '0.78rem', color: 'var(--slate-600)' }}>
                        {parentReport?.reportDate || parentReport?.uploadDate || '—'}
                      </span>
                    </td>

                    <td>
                      <ProvenanceBadge provenance={result.provenance} />
                    </td>

                    <td>
                      {isVerified ? (
                        <span className="badge badge-normal" title={`Verified by ${result.verifiedBy || 'Clinician'}`}>
                          <CheckCircle2 size={11} /> Verified
                        </span>
                      ) : isEdited ? (
                        <span className="badge badge-review" title="Edited by clinician from source value">
                          <Edit3 size={11} /> User Edited
                        </span>
                      ) : (
                        <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
                          Needs Review
                        </span>
                      )}
                    </td>

                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        {!isVerified && (
                          <button
                            className="btn btn-sm"
                            style={{ backgroundColor: '#ecfdf5', color: '#065f46', borderColor: '#a7f3d0' }}
                            onClick={() => onConfirmResult(result.id)}
                            title="Confirm extracted value matches source report"
                          >
                            <Check size={12} /> Confirm
                          </button>
                        )}
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => onEditResult(result)}
                          title="Edit extracted value, unit, or range"
                        >
                          <Edit3 size={12} /> Edit
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => onInspectSource(result)}
                          title="View source document and snippet"
                        >
                          <Eye size={12} /> Source
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
