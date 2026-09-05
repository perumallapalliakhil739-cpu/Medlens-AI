import React from 'react';
import { SafetyBanner } from '../common/SafetyBanner';
import { PatientOverviewCard } from './PatientOverviewCard';
import { RecentReportsCard } from './RecentReportsCard';
import { StructuredSummaryCard } from './StructuredSummaryCard';
import { AISummaryCard } from './AISummaryCard';
import { Patient, MedicalReport, ExtractedLabResult, AISummary } from '../../types';

interface DashboardViewProps {
  patient: Patient | undefined;
  reports: MedicalReport[];
  labResults: ExtractedLabResult[];
  summary: AISummary | undefined;
  isGeneratingSummary: boolean;
  onEditPatient: () => void;
  onOpenUploadModal: () => void;
  onSelectReportForSideBySide: (reportId: string) => void;
  onConfirmResult: (resultId: string) => void;
  onEditResult: (result: ExtractedLabResult) => void;
  onInspectSource: (result: ExtractedLabResult) => void;
  onRegenerateSummary: () => void;
  onNavigateToInsights: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  patient,
  reports,
  labResults,
  summary,
  isGeneratingSummary,
  onEditPatient,
  onOpenUploadModal,
  onSelectReportForSideBySide,
  onConfirmResult,
  onEditResult,
  onInspectSource,
  onRegenerateSummary,
  onNavigateToInsights,
}) => {
  if (!patient) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>No active patient selected. Please select or register a patient.</p>
      </div>
    );
  }

  const verifiedCount = labResults.filter(l => l.verificationStatus === 'verified').length;

  return (
    <div className="dashboard-container">
      {/* Prominent Mandatory Safety Disclaimer */}
      <SafetyBanner />

      {/* Patient Intake Overview */}
      <PatientOverviewCard
        patient={patient}
        onEditPatient={onEditPatient}
        verifiedResultsCount={verifiedCount}
        totalResultsCount={labResults.length}
      />

      {/* AI Summary Card */}
      <AISummaryCard
        summary={summary}
        isGenerating={isGeneratingSummary}
        onRegenerateSummary={onRegenerateSummary}
        onNavigateToInsights={onNavigateToInsights}
      />

      {/* Recent Uploaded Medical Reports */}
      <RecentReportsCard
        reports={reports}
        onSelectReportForSideBySide={onSelectReportForSideBySide}
        onOpenUploadModal={onOpenUploadModal}
      />

      {/* Structured Medical Information Table */}
      <StructuredSummaryCard
        labResults={labResults}
        reports={reports}
        onConfirmResult={onConfirmResult}
        onEditResult={onEditResult}
        onInspectSource={onInspectSource}
      />
    </div>
  );
};
