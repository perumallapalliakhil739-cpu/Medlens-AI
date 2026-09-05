import React from 'react';
import { FileText, FileUp, CheckCircle, Clock, Eye, AlertTriangle } from 'lucide-react';
import { MedicalReport } from '../../types';

interface RecentReportsCardProps {
  reports: MedicalReport[];
  onSelectReportForSideBySide: (reportId: string) => void;
  onOpenUploadModal: () => void;
}

export const RecentReportsCard: React.FC<RecentReportsCardProps> = ({
  reports,
  onSelectReportForSideBySide,
  onOpenUploadModal,
}) => {
  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <div className="card-header">
        <div className="card-title-group">
          <FileText size={18} className="card-title-icon" />
          <div>
            <h3>Recent Medical Reports</h3>
            <div style={{ fontSize: '0.74rem', color: 'var(--slate-500)' }}>
              Source documents processed for clinical extraction ({reports.length} total)
            </div>
          </div>
        </div>
        <div className="card-actions">
          <button className="btn btn-primary btn-sm" onClick={onOpenUploadModal}>
            <FileUp size={13} />
            <span>Upload New Report</span>
          </button>
        </div>
      </div>

      {reports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--slate-500)' }}>
          <FileText size={32} style={{ color: 'var(--slate-300)', margin: '0 auto 0.5rem' }} />
          <div style={{ fontWeight: 600, color: 'var(--slate-700)' }}>No Medical Reports Uploaded Yet</div>
          <div style={{ fontSize: '0.78rem', marginTop: '0.25rem' }}>Upload laboratory tests or clinical notes to extract structured data.</div>
          <button className="btn btn-outline btn-sm" style={{ marginTop: '0.75rem' }} onClick={onOpenUploadModal}>
            Upload First Report
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="clinical-table">
            <thead>
              <tr>
                <th>Report Document</th>
                <th>Report Type</th>
                <th>Specimen / Report Date</th>
                <th>Upload Date</th>
                <th>Processing Status</th>
                <th>Human Verification</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{report.fileName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>Format: {report.fileType.toUpperCase()}</div>
                  </td>
                  <td>
                    <span className="badge" style={{ backgroundColor: 'var(--slate-100)', color: 'var(--slate-800)' }}>
                      {report.reportType}
                    </span>
                  </td>
                  <td>
                    {report.reportDate ? (
                      <span style={{ fontWeight: 500 }}>{report.reportDate}</span>
                    ) : (
                      <span style={{ color: 'var(--slate-400)', fontStyle: 'italic', fontSize: '0.78rem' }}>Unspecified in header</span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.78rem', color: 'var(--slate-600)' }}>{report.uploadDate}</span>
                  </td>
                  <td>
                    {report.processingStatus === 'processed' && (
                      <span className="badge" style={{ backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                        <CheckCircle size={11} /> Processed
                      </span>
                    )}
                    {report.processingStatus === 'processing' && (
                      <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                        <Clock size={11} /> Processing
                      </span>
                    )}
                    {report.processingStatus === 'failed' && (
                      <span className="badge" style={{ backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5' }}>
                        <AlertTriangle size={11} /> Failed
                      </span>
                    )}
                  </td>
                  <td>
                    {report.verificationStatus === 'verified' && (
                      <span className="badge badge-normal">
                        <CheckCircle size={11} /> Verified
                      </span>
                    )}
                    {report.verificationStatus === 'needs_review' && (
                      <span className="badge badge-review">
                        <Clock size={11} /> Needs Review
                      </span>
                    )}
                    {report.verificationStatus === 'not_reviewed' && (
                      <span className="badge" style={{ backgroundColor: 'var(--slate-100)', color: 'var(--slate-600)' }}>
                        Not Reviewed
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => onSelectReportForSideBySide(report.id)}
                      title="Inspect extracted fields side-by-side with original document"
                    >
                      <Eye size={13} />
                      <span>Side-by-Side View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
