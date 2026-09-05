import React, { useState } from 'react';
import { 
  FileText, 
  FileUp, 
  Search, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Filter,
  Calendar,
  Trash2
} from 'lucide-react';
import { MedicalReport, ExtractedLabResult, ReportObservation } from '../../types';
import { SafetyBanner } from '../common/SafetyBanner';
import { SideBySideViewer } from './SideBySideViewer';

interface ReportsViewProps {
  reports: MedicalReport[];
  labResults: ExtractedLabResult[];
  observations: ReportObservation[];
  onOpenUploadModal: () => void;
  onConfirmResult: (resultId: string) => void;
  onEditResult: (result: ExtractedLabResult) => void;
  onRejectResult: (resultId: string) => void;
  onDeleteReport: (reportId: string) => void;
  initialSelectedReportId?: string | null;
  onClearSelectedReport?: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  reports,
  labResults,
  observations,
  onOpenUploadModal,
  onConfirmResult,
  onEditResult,
  onRejectResult,
  onDeleteReport,
  initialSelectedReportId,
  onClearSelectedReport,
}) => {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(
    initialSelectedReportId || null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // If a report is selected, show the Side-by-Side viewer
  const selectedReport = reports.find(r => r.id === (selectedReportId || initialSelectedReportId));
  if (selectedReport) {
    const reportLabs = labResults.filter(l => l.reportId === selectedReport.id);
    const reportObs = observations.filter(o => o.reportId === selectedReport.id);

    return (
      <SideBySideViewer
        report={selectedReport}
        labResults={reportLabs}
        observations={reportObs}
        onClose={() => {
          setSelectedReportId(null);
          if (onClearSelectedReport) onClearSelectedReport();
        }}
        onConfirmResult={onConfirmResult}
        onEditResult={onEditResult}
        onRejectResult={onRejectResult}
        onDeleteReport={onDeleteReport}
      />
    );
  }

  const filteredReports = reports.filter(r => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = r.fileName.toLowerCase().includes(q) || r.reportType.toLowerCase().includes(q);
    if (!matchesSearch) return false;

    if (filterType !== 'all') {
      if (filterType === 'verified') return r.verificationStatus === 'verified';
      if (filterType === 'needs_review') return r.verificationStatus === 'needs_review';
    }
    return true;
  });

  return (
    <div className="reports-view">
      <SafetyBanner compact />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2>Medical Reports & Source Documents</h2>
          <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
            Uploaded laboratory panels, clinical encounter notes, and diagnostic records ({reports.length} total)
          </div>
        </div>

        <button className="btn btn-primary" onClick={onOpenUploadModal}>
          <FileUp size={15} />
          <span>Upload New Report</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
          <input
            type="search"
            placeholder="Search report files or types..."
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>Status Filter:</span>
          <button
            className={`btn btn-sm ${filterType === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilterType('all')}
          >
            All
          </button>
          <button
            className={`btn btn-sm ${filterType === 'needs_review' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilterType('needs_review')}
          >
            Needs Review
          </button>
          <button
            className={`btn btn-sm ${filterType === 'verified' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilterType('verified')}
          >
            Verified
          </button>
        </div>
      </div>

      {/* Reports Table */}
      {filteredReports.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--slate-500)' }}>
          <FileText size={36} style={{ color: 'var(--slate-300)', margin: '0 auto 0.75rem' }} />
          <div style={{ fontWeight: 600, color: 'var(--slate-800)', fontSize: '1rem' }}>No Reports Found</div>
          <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
            {reports.length === 0 ? 'Upload your first medical report to begin clinical extraction.' : 'No reports match your search criteria.'}
          </div>
          <button className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }} onClick={onOpenUploadModal}>
            <FileUp size={13} />
            <span>Upload Report</span>
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="clinical-table">
            <thead>
              <tr>
                <th>Document File Name</th>
                <th>Classification</th>
                <th>Specimen Date</th>
                <th>Upload Date</th>
                <th>Extracted Parameters</th>
                <th>Processing</th>
                <th>Verification</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => {
                const reportLabs = labResults.filter(l => l.reportId === report.id);
                const outOfRange = reportLabs.filter(l => l.status === 'low' || l.status === 'high').length;

                return (
                  <tr key={report.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={16} style={{ color: 'var(--primary-600)', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{report.fileName}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>Format: {report.fileType.toUpperCase()}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="badge" style={{ backgroundColor: 'var(--slate-100)', color: 'var(--slate-800)' }}>
                        {report.reportType}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>
                        {report.reportDate || <span style={{ color: 'var(--slate-400)', fontStyle: 'italic' }}>Unspecified</span>}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.78rem', color: 'var(--slate-600)' }}>{report.uploadDate}</span>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                        {reportLabs.length} test{reportLabs.length !== 1 ? 's' : ''}
                      </div>
                      {outOfRange > 0 && (
                        <span style={{ fontSize: '0.7rem', color: '#be123c', fontWeight: 600 }}>
                          {outOfRange} out of range
                        </span>
                      )}
                    </td>

                    <td>
                      {report.processingStatus === 'processed' ? (
                        <span className="badge badge-normal" style={{ fontSize: '0.72rem' }}>
                          <CheckCircle2 size={11} /> Processed
                        </span>
                      ) : (
                        <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                          <Clock size={11} /> Processing
                        </span>
                      )}
                    </td>

                    <td>
                      {report.verificationStatus === 'verified' ? (
                        <span className="badge badge-normal" style={{ fontSize: '0.72rem' }}>
                          <CheckCircle2 size={11} /> Verified
                        </span>
                      ) : (
                        <span className="badge badge-review" style={{ fontSize: '0.72rem' }}>
                          Needs Review
                        </span>
                      )}
                    </td>

                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => setSelectedReportId(report.id)}
                          title="Compare extracted parameters against original source document"
                        >
                          <Eye size={13} />
                          <span>Side-by-Side</span>
                        </button>
                        <button
                          className="btn btn-danger-outline btn-sm"
                          onClick={() => {
                            if (window.confirm(`Delete report "${report.fileName}" and remove all associated extracted parameters?`)) {
                              onDeleteReport(report.id);
                            }
                          }}
                          title="Delete report and remove its extracted parameters"
                        >
                          <Trash2 size={13} />
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
