import React, { useState } from 'react';
import { 
  History, 
  User, 
  FileText, 
  CheckCircle2, 
  Edit3, 
  AlertTriangle, 
  Sparkles, 
  Calendar, 
  Filter 
} from 'lucide-react';
import { MedicalTimelineEvent } from '../../types';
import { SafetyBanner } from '../common/SafetyBanner';

interface MedicalTimelineViewProps {
  events: MedicalTimelineEvent[];
}

export const MedicalTimelineView: React.FC<MedicalTimelineViewProps> = ({ events }) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filteredEvents = events.filter(e => {
    if (filterType === 'reports') return e.eventType.includes('report');
    if (filterType === 'verifications') return e.eventType.includes('info_') || e.eventType.includes('verified');
    if (filterType === 'conflicts') return e.eventType.includes('conflict');
    return true;
  });

  const getEventIcon = (type: MedicalTimelineEvent['eventType']) => {
    switch (type) {
      case 'patient_created':
      case 'patient_updated':
        return <User size={14} style={{ color: 'var(--primary-600)' }} />;
      case 'report_uploaded':
      case 'report_processed':
        return <FileText size={14} style={{ color: '#0284c7' }} />;
      case 'info_verified':
        return <CheckCircle2 size={14} style={{ color: '#059669' }} />;
      case 'info_edited':
        return <Edit3 size={14} style={{ color: '#d97706' }} />;
      case 'conflict_detected':
      case 'conflict_resolved':
        return <AlertTriangle size={14} style={{ color: '#dc2626' }} />;
      case 'ai_summary_generated':
        return <Sparkles size={14} style={{ color: '#7c3aed' }} />;
      default:
        return <Calendar size={14} style={{ color: 'var(--slate-500)' }} />;
    }
  };

  return (
    <div className="timeline-view">
      <SafetyBanner compact />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2>Chronological Medical Timeline</h2>
          <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
            Traceable sequence of patient registrations, report ingestions, human reviews, and AI summaries ({events.length} milestones)
          </div>
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            className={`btn btn-sm ${filterType === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilterType('all')}
          >
            All Events
          </button>
          <button
            className={`btn btn-sm ${filterType === 'reports' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilterType('reports')}
          >
            Reports
          </button>
          <button
            className={`btn btn-sm ${filterType === 'verifications' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilterType('verifications')}
          >
            Verifications
          </button>
          <button
            className={`btn btn-sm ${filterType === 'conflicts' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilterType('conflicts')}
          >
            Conflicts
          </button>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-500)' }}>
          <History size={36} style={{ color: 'var(--slate-300)', margin: '0 auto 0.75rem' }} />
          <div>No timeline events match the filter.</div>
        </div>
      ) : (
        <div className="card" style={{ padding: '2rem 1.5rem' }}>
          <div className="timeline-container">
            <div className="timeline-line"></div>

            {filteredEvents.map((item) => (
              <div key={item.id} className="timeline-item">
                <div className={`timeline-dot ${item.eventType.includes('conflict') ? 'alert' : ''}`}></div>

                <div style={{ backgroundColor: 'var(--slate-50)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', transition: 'border-color 0.15s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      {getEventIcon(item.eventType)}
                      <strong style={{ fontSize: '0.9rem', color: 'var(--slate-900)' }}>
                        {item.title}
                      </strong>
                    </div>

                    <div style={{ fontSize: '0.74rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      <span>{item.date} at {item.time}</span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--slate-700)', marginBottom: '0.4rem', lineHeight: '1.45' }}>
                    {item.description}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', color: 'var(--slate-500)', borderTop: '1px solid var(--slate-200)', paddingTop: '0.35rem' }}>
                    <span>Source: <strong>{item.source}</strong></span>
                    {item.verificationStatus && (
                      <span className="badge" style={{ fontSize: '0.68rem', backgroundColor: 'var(--slate-100)', color: 'var(--slate-700)' }}>
                        Status: {item.verificationStatus.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
