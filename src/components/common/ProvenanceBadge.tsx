import React from 'react';
import { User, FileText, Sparkles, CheckCircle } from 'lucide-react';
import { ProvenanceType } from '../../types';

interface ProvenanceBadgeProps {
  provenance: ProvenanceType;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({ provenance }) => {
  switch (provenance) {
    case 'user_provided':
      return (
        <span className="badge badge-provenance user" title="Origin: Entered directly during patient intake">
          <User size={10} aria-hidden="true" />
          <span>User Provided</span>
        </span>
      );
    case 'extracted_from_report':
      return (
        <span className="badge badge-provenance extracted" title="Origin: Extracted from uploaded source report">
          <FileText size={10} aria-hidden="true" />
          <span>Extracted from Report</span>
        </span>
      );
    case 'ai_generated':
      return (
        <span className="badge badge-provenance ai" title="Origin: Synthesized by MedLens Intelligence Engine">
          <Sparkles size={10} aria-hidden="true" />
          <span>AI Generated</span>
        </span>
      );
    case 'human_verified':
      return (
        <span className="badge badge-provenance verified" title="Origin: Reviewed and confirmed by clinician">
          <CheckCircle size={10} aria-hidden="true" />
          <span>Human Verified</span>
        </span>
      );
  }
};
