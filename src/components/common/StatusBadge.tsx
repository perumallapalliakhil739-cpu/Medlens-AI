import React from 'react';
import { CheckCircle2, ArrowUp, ArrowDown, HelpCircle, AlertCircle } from 'lucide-react';
import { LabStatus } from '../../types';

interface StatusBadgeProps {
  status: LabStatus;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showIcon = true }) => {
  switch (status) {
    case 'normal':
      return (
        <span className="badge badge-normal" title="Reported value is within source-provided reference range">
          {showIcon && <CheckCircle2 size={12} aria-hidden="true" />}
          <span>Normal</span>
        </span>
      );
    case 'high':
      return (
        <span className="badge badge-high" title="Reported value is higher than source-provided reference range">
          {showIcon && <ArrowUp size={12} aria-hidden="true" />}
          <span>High</span>
        </span>
      );
    case 'low':
      return (
        <span className="badge badge-low" title="Reported value is lower than source-provided reference range">
          {showIcon && <ArrowDown size={12} aria-hidden="true" />}
          <span>Low</span>
        </span>
      );
    case 'requires_review':
      return (
        <span className="badge badge-review" title="Value or reference range is ambiguous and requires human review">
          {showIcon && <AlertCircle size={12} aria-hidden="true" />}
          <span>Requires Review</span>
        </span>
      );
    case 'status_unavailable':
    default:
      return (
        <span className="badge badge-unavailable" title="Reference range was not available in source report">
          {showIcon && <HelpCircle size={12} aria-hidden="true" />}
          <span>Status Unavailable</span>
        </span>
      );
  }
};
