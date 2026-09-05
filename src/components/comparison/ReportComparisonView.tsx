import React, { useState } from 'react';
import { GitCompare, Calendar, AlertTriangle, ArrowRight, CheckCircle2, HelpCircle } from 'lucide-react';
import { MedicalReport, ExtractedLabResult } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { SafetyBanner } from '../common/SafetyBanner';

interface ReportComparisonViewProps {
  reports: MedicalReport[];
  labResults: ExtractedLabResult[];
}

export const ReportComparisonView: React.FC<ReportComparisonViewProps> = ({
  reports,
  labResults,
}) => {
  // Need at least 2 reports to compare
  const availableReports = reports.filter(r => r.processingStatus === 'processed');

  const [currentReportId, setCurrentReportId] = useState<string>(
    availableReports[1]?.id || availableReports[0]?.id || ''
  );
  const [previousReportId, setPreviousReportId] = useState<string>(
    availableReports[0]?.id || ''
  );

  const currentReport = reports.find(r => r.id === currentReportId);
  const previousReport = reports.find(r => r.id === previousReportId);

  const currentLabs = labResults.filter(l => l.reportId === currentReportId);
  const previousLabs = labResults.filter(l => l.reportId === previousReportId);

  // Match test names across reports
  const matchedComparisons: {
    testName: string;
    prevLab?: ExtractedLabResult;
    currLab?: ExtractedLabResult;
    diffFormatted?: string;
    unitMismatch?: boolean;
  }[] = [];

  // Map of normalized test names in previous labs
  const prevMap = new Map<string, ExtractedLabResult>();
  previousLabs.forEach(l => {
    prevMap.set(l.testName.toLowerCase().trim(), l);
  });

  const processedNames = new Set<string>();

  currentLabs.forEach(curr => {
    const norm = curr.testName.toLowerCase().trim();
    processedNames.add(norm);
    const prev = prevMap.get(norm);

    let diffFormatted: string | undefined = undefined;
    let unitMismatch = false;

    if (prev) {
      if (prev.unit.toLowerCase().trim() !== curr.unit.toLowerCase().trim() && prev.unit && curr.unit) {
        unitMismatch = true;
      } else if (curr.numericValue !== undefined && prev.numericValue !== undefined) {
        const delta = curr.numericValue - prev.numericValue;
        const sign = delta > 0 ? '+' : '';
        diffFormatted = `${sign}${delta.toFixed(1)}`;
      }
    }

    matchedComparisons.push({
      testName: curr.testName,
      currLab: curr,
      prevLab: prev,
      diffFormatted,
      unitMismatch,
    });
  });

  // Include previous tests not in current report
  previousLabs.forEach(prev => {
    const norm = prev.testName.toLowerCase().trim();
    if (!processedNames.has(norm)) {
      matchedComparisons.push({
        testName: prev.testName,
        prevLab: prev,
        currLab: undefined,
      });
    }
  });

  return (
    <div className="comparisons-view">
      <SafetyBanner compact />

      <div style={{ marginBottom: '1.25rem' }}>
        <h2>Report Longitudinal Comparison</h2>
        <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
          Trace changes in reported values across sequential laboratory evaluations
        </div>
      </div>

      {/* Safety Rule Card */}
      <div style={{ backgroundColor: 'var(--slate-50)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.76rem', color: 'var(--slate-700)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <HelpCircle size={16} style={{ color: 'var(--primary-600)', flexShrink: 0 }} />
        <div>
          <strong>Safety Rule for Report Comparisons:</strong> MedLens reports numerical differences (e.g. +16 mg/dL) purely as factual value changes. MedLens <strong>does not</strong> label changes as "improvement" or "worsening". Clinical interpretation must be made by a licensed medical provider.
        </div>
      </div>

      {availableReports.length < 2 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-500)' }}>
          <GitCompare size={36} style={{ color: 'var(--slate-300)', margin: '0 auto 0.75rem' }} />
          <div style={{ fontWeight: 600, color: 'var(--slate-800)' }}>At least 2 processed reports required for comparison</div>
          <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
            Currently only {availableReports.length} report is registered for this patient. Upload a second report to activate comparative analysis.
          </div>
        </div>
      ) : (
        <div>
          {/* Report Selection Selectors */}
          <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'center' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Previous Baseline Report (A)</label>
                <select
                  className="form-select"
                  value={previousReportId}
                  onChange={(e) => setPreviousReportId(e.target.value)}
                >
                  {availableReports.map(r => (
                    <option key={r.id} value={r.id} disabled={r.id === currentReportId}>
                      {r.fileName} ({r.reportDate || r.uploadDate})
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                  Specimen Date: {previousReport?.reportDate || 'Unspecified'}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem' }}>
                <ArrowRight size={20} style={{ color: 'var(--slate-400)' }} />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Current Evaluation Report (B)</label>
                <select
                  className="form-select"
                  value={currentReportId}
                  onChange={(e) => setCurrentReportId(e.target.value)}
                >
                  {availableReports.map(r => (
                    <option key={r.id} value={r.id} disabled={r.id === previousReportId}>
                      {r.fileName} ({r.reportDate || r.uploadDate})
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                  Specimen Date: {currentReport?.reportDate || 'Unspecified'}
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="table-container">
            <table className="clinical-table">
              <thead>
                <tr>
                  <th>Laboratory Test</th>
                  <th>
                    Previous Value ({previousReport?.reportDate || 'Report A'})
                  </th>
                  <th>
                    Current Value ({currentReport?.reportDate || 'Report B'})
                  </th>
                  <th>Value Difference (Δ)</th>
                  <th>Unit</th>
                  <th>Previous Source Range</th>
                  <th>Current Source Range</th>
                  <th>Current Status</th>
                </tr>
              </thead>
              <tbody>
                {matchedComparisons.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{item.testName}</strong>
                    </td>

                    <td>
                      {item.prevLab ? (
                        <div>
                          <span style={{ fontWeight: 600 }}>{item.prevLab.value}</span>
                          <div style={{ fontSize: '0.7rem', color: 'var(--slate-400)' }}>
                            Status: {item.prevLab.status.toUpperCase()}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--slate-400)', fontStyle: 'italic', fontSize: '0.78rem' }}>
                          Not tested in Report A
                        </span>
                      )}
                    </td>

                    <td>
                      {item.currLab ? (
                        <div>
                          <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{item.currLab.value}</span>
                          <div style={{ fontSize: '0.7rem', color: 'var(--slate-400)' }}>
                            Status: {item.currLab.status.toUpperCase()}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--slate-400)', fontStyle: 'italic', fontSize: '0.78rem' }}>
                          Not tested in Report B
                        </span>
                      )}
                    </td>

                    <td>
                      {item.unitMismatch ? (
                        <span className="badge" style={{ backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}>
                          Units differ — No comparison
                        </span>
                      ) : item.diffFormatted !== undefined ? (
                        <span 
                          className="badge"
                          style={{
                            backgroundColor: parseFloat(item.diffFormatted) === 0 ? 'var(--slate-100)' : 'var(--primary-50)',
                            color: parseFloat(item.diffFormatted) === 0 ? 'var(--slate-700)' : 'var(--primary-800)',
                            border: '1px solid var(--border-subtle)',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            fontSize: '0.82rem',
                          }}
                        >
                          {item.diffFormatted}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--slate-400)' }}>—</span>
                      )}
                    </td>

                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                        {item.currLab?.unit || item.prevLab?.unit || '—'}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.78rem', color: 'var(--slate-600)' }}>
                        {item.prevLab?.referenceRangeText || '—'}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.78rem', color: 'var(--slate-600)' }}>
                        {item.currLab?.referenceRangeText || '—'}
                      </span>
                    </td>

                    <td>
                      {item.currLab ? (
                        <StatusBadge status={item.currLab.status} />
                      ) : (
                        <span style={{ color: 'var(--slate-400)' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
