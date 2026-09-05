import React, { useState } from 'react';
import { ShieldAlert, Search, Calendar, User, Filter, ArrowRight } from 'lucide-react';
import { AuditEntry } from '../../types';
import { SafetyBanner } from '../common/SafetyBanner';

interface AuditHistoryViewProps {
  entries: AuditEntry[];
}

export const AuditHistoryView: React.FC<AuditHistoryViewProps> = ({ entries }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const filteredEntries = entries.filter((entry) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = 
      entry.action.toLowerCase().includes(q) ||
      entry.details.toLowerCase().includes(q) ||
      entry.user.toLowerCase().includes(q) ||
      entry.affectedRecordType.toLowerCase().includes(q);
    if (!matchesSearch) return false;

    if (actionFilter === 'verified') return entry.action.includes('Verified');
    if (actionFilter === 'edited') return entry.action.includes('Edited') || entry.action.includes('Updated');
    if (actionFilter === 'uploaded') return entry.action.includes('Uploaded') || entry.action.includes('Extracted');
    if (actionFilter === 'conflicts') return entry.action.includes('Conflict');

    return true;
  });

  return (
    <div className="audit-view">
      <SafetyBanner compact />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2>Clinical Audit Trail & Traceability Log</h2>
          <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
            Immutable ledger tracking all intake entries, document extractions, human verifications, and value edits ({entries.length} total events)
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ position: 'relative', width: '340px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
          <input
            type="search"
            placeholder="Search action, clinician, details, or ID..."
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

        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            className={`btn btn-sm ${actionFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActionFilter('all')}
          >
            All Actions
          </button>
          <button
            className={`btn btn-sm ${actionFilter === 'verified' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActionFilter('verified')}
          >
            Verifications
          </button>
          <button
            className={`btn btn-sm ${actionFilter === 'edited' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActionFilter('edited')}
          >
            Edits
          </button>
          <button
            className={`btn btn-sm ${actionFilter === 'uploaded' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActionFilter('uploaded')}
          >
            Uploads
          </button>
          <button
            className={`btn btn-sm ${actionFilter === 'conflicts' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActionFilter('conflicts')}
          >
            Conflicts
          </button>
        </div>
      </div>

      {/* Audit Table */}
      {filteredEntries.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-500)' }}>
          <ShieldAlert size={36} style={{ color: 'var(--slate-300)', margin: '0 auto 0.75rem' }} />
          <div>No audit records match the current filter.</div>
        </div>
      ) : (
        <div className="table-container">
          <table className="clinical-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action Performed</th>
                <th>Actor / System User</th>
                <th>Affected Record Entity</th>
                <th>Event Details & Provenance</th>
                <th>Value Delta (Previous → New)</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry) => (
                <tr key={entry.id}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '0.78rem', color: 'var(--slate-600)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--slate-800)' }}>
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--slate-400)' }}>
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </div>
                  </td>

                  <td>
                    <span 
                      className="badge"
                      style={{
                        backgroundColor: entry.action.includes('Verified') ? '#ecfdf5' : entry.action.includes('Edited') ? '#fef3c7' : entry.action.includes('Conflict') ? '#fee2e2' : 'var(--slate-100)',
                        color: entry.action.includes('Verified') ? '#065f46' : entry.action.includes('Edited') ? '#92400e' : entry.action.includes('Conflict') ? '#991b1b' : 'var(--slate-800)',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                      }}
                    >
                      {entry.action}
                    </span>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--slate-700)' }}>
                      <User size={12} style={{ color: 'var(--slate-400)' }} />
                      <span>{entry.user}</span>
                    </div>
                  </td>

                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.74rem', backgroundColor: 'var(--slate-100)', padding: '2px 5px', borderRadius: '3px' }}>
                      {entry.affectedRecordType}
                    </span>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-800)', maxWidth: '360px', lineHeight: '1.4' }}>
                      {entry.details}
                    </div>
                  </td>

                  <td>
                    {entry.previousValue || entry.newValue ? (
                      <div style={{ fontSize: '0.74rem', maxWidth: '300px', backgroundColor: 'var(--slate-50)', padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                        {entry.previousValue && (
                          <div style={{ color: '#be123c', textDecoration: 'line-through', marginBottom: '2px' }}>
                            {entry.previousValue}
                          </div>
                        )}
                        {entry.newValue && (
                          <div style={{ color: '#047857', fontWeight: 600 }}>
                            {entry.newValue}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--slate-400)' }}>—</span>
                    )}
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
