import React from 'react';
import { ConfidenceLevel } from '../../types';

interface ConfidenceBadgeProps {
  confidence: ConfidenceLevel;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ confidence }) => {
  switch (confidence) {
    case 'high':
      return (
        <span style={{ fontSize: '0.72rem', color: '#065f46', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '3px' }} title="Extraction confidence: High certainty against document syntax">
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
          High confidence
        </span>
      );
    case 'medium':
      return (
        <span style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '3px' }} title="Extraction confidence: Moderate certainty. Human review recommended.">
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></span>
          Medium confidence
        </span>
      );
    case 'low':
      return (
        <span style={{ fontSize: '0.72rem', color: '#be123c', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '3px' }} title="Extraction confidence: Low certainty. Please verify against original source.">
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f43f5e' }}></span>
          Low — Review source
        </span>
      );
    case 'unavailable':
    default:
      return (
        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '3px' }} title="Confidence unavailable — review source">
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#94a3b8' }}></span>
          Confidence unavailable
        </span>
      );
  }
};
