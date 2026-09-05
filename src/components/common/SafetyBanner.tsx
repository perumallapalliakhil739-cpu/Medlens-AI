import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { MANDATORY_SAFETY_DISCLAIMER } from '../../services/aiSummaryEngine';

interface SafetyBannerProps {
  compact?: boolean;
  className?: string;
}

export const SafetyBanner: React.FC<SafetyBannerProps> = ({ compact = false, className = '' }) => {
  if (compact) {
    return (
      <div className={`safety-banner ${className}`} style={{ padding: '0.45rem 0.75rem', marginBottom: '0.75rem' }} role="alert">
        <ShieldCheck size={16} className="safety-banner-icon" />
        <div className="safety-banner-content" style={{ fontSize: '0.76rem' }}>
          <strong>Clinical Safety Notice:</strong> MedLens organizes and explains available information. It does <strong>not</strong> provide medical diagnoses or treatment recommendations.
        </div>
      </div>
    );
  }

  return (
    <div className={`safety-banner ${className}`} role="alert">
      <AlertTriangle size={20} className="safety-banner-icon" />
      <div className="safety-banner-content">
        <strong>Important Safety Notice:</strong> {MANDATORY_SAFETY_DISCLAIMER}
      </div>
    </div>
  );
};
