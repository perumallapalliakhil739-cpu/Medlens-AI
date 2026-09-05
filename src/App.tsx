import React, { useState, useEffect, useMemo } from 'react';
import { 
  initializeStorageIfNeeded, 
  subscribeStorage,
  getPatients,
  getActivePatientId,
  setActivePatientId,
  getReports,
  getLabResults,
  getObservations,
  getConflicts,
  getClarifications,
  getTimelineEvents,
  getAuditTrail,
  getAISummaries,
  getSettings,
  getUserProfile,
  savePatient,
  saveReport,
  saveLabResults,
  saveObservations,
  saveClarifications,
  saveConflicts,
  updateLabResult,
  resolveConflict,
  answerClarification,
  saveAISummary,
  saveSettings,
  saveUserProfile,
  resetToDemoData,
  logAuditEntry,
  addTimelineEvent,
  deleteReport
} from './services/storage';

import { 
  Patient, 
  MedicalReport, 
  ExtractedLabResult, 
  ReportObservation, 
  AISummary,
  InformationConflict,
  ClarificationQuestion,
  MedicalTimelineEvent,
  AuditEntry,
  AppSettings,
  UserProfile
} from './types';

import { detectInformationConflicts } from './services/conflictDetector';
import { generateAISummaryWithGeminiOrFallback } from './services/geminiService';

// Layout & View Components
import { Header } from './components/layout/Header';
import { Sidebar, NavigationTab } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { PatientsView } from './components/patients/PatientsView';
import { PatientIntakeModal } from './components/patients/PatientIntakeModal';
import { ReportsView } from './components/reports/ReportsView';
import { ReportUploadModal } from './components/reports/ReportUploadModal';
import { VerificationModal } from './components/reports/VerificationModal';
import { MedicalTimelineView } from './components/timeline/MedicalTimelineView';
import { ReportComparisonView } from './components/comparison/ReportComparisonView';
import { AIInsightsView } from './components/insights/AIInsightsView';
import { AuditHistoryView } from './components/audit/AuditHistoryView';
import { SettingsView } from './components/settings/SettingsView';
import { PrintableMedicalRecord } from './components/export/PrintableMedicalRecord';

export const App: React.FC = () => {
  // Ensure default storage data is seeded
  useEffect(() => {
    initializeStorageIfNeeded();
  }, []);

  // Reactive state synced with localStorage
  const [storageTick, setStorageTick] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeStorage(() => {
      setStorageTick(tick => tick + 1);
    });
    return unsubscribe;
  }, []);

  // Read current reactive state
  const patients = useMemo(() => getPatients(), [storageTick]);
  const activePatientId = useMemo(() => getActivePatientId(), [storageTick, patients]);
  const activePatient = useMemo(() => patients.find(p => p.id === activePatientId) || patients[0], [patients, activePatientId]);

  const patientReports = useMemo(() => getReports(activePatient?.id), [storageTick, activePatient?.id]);
  const patientLabResults = useMemo(() => getLabResults(activePatient?.id), [storageTick, activePatient?.id]);
  const patientObservations = useMemo(() => getObservations(activePatient?.id), [storageTick, activePatient?.id]);
  const patientConflicts = useMemo(() => getConflicts(activePatient?.id), [storageTick, activePatient?.id]);
  const patientClarifications = useMemo(() => getClarifications(activePatient?.id), [storageTick, activePatient?.id]);
  const patientTimeline = useMemo(() => getTimelineEvents(activePatient?.id), [storageTick, activePatient?.id]);
  const auditTrail = useMemo(() => getAuditTrail(), [storageTick]);
  const patientSummaries = useMemo(() => getAISummaries(activePatient?.id), [storageTick, activePatient?.id]);
  const activeSummary = patientSummaries[0];

  const appSettings = useMemo(() => getSettings(), [storageTick]);
  const userProfile = useMemo(() => getUserProfile(), [storageTick]);

  // UI Navigation State
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals State
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedReportForSideBySide, setSelectedReportForSideBySide] = useState<string | null>(null);

  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verifyingLabResult, setVerifyingLabResult] = useState<ExtractedLabResult | null>(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // Summary Generator handler
  const handleRegenerateSummary = async () => {
    if (!activePatient) return;
    setIsGeneratingSummary(true);

    const apiKey = appSettings.useGeminiIfAvailable ? appSettings.geminiApiKey : undefined;
    const { summary } = await generateAISummaryWithGeminiOrFallback(
      activePatient,
      patientReports,
      patientLabResults,
      patientObservations,
      apiKey
    );

    saveAISummary(summary);
    setIsGeneratingSummary(false);
  };

  // Report Upload Processed Handler
  const handleReportProcessed = (
    report: MedicalReport,
    labs: ExtractedLabResult[],
    obs: ReportObservation[],
    clarifications: ClarificationQuestion[]
  ) => {
    saveReport(report);
    saveLabResults(labs);
    saveObservations(obs);
    saveClarifications(clarifications);

    // Run conflict detection against patient intake
    if (activePatient) {
      const allReports = [...patientReports, report];
      const allLabs = [...patientLabResults, ...labs];
      const allObs = [...patientObservations, ...obs];
      const detected = detectInformationConflicts(activePatient, allReports, allLabs, allObs);
      if (detected.length > 0) {
        saveConflicts(detected);
        detected.forEach(c => {
          addTimelineEvent({
            patientId: activePatient.id,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().slice(0, 5),
            eventType: 'conflict_detected',
            title: `Potential Inconsistency: ${c.title}`,
            description: c.description,
            source: 'MedLens Conflict Engine',
            verificationStatus: 'needs_review',
          });
        });
      }
    }

    // Auto update summary
    handleRegenerateSummary();

    // Select the new report for immediate inspection in reports tab
    setSelectedReportForSideBySide(report.id);
    setActiveTab('reports');
  };

  // Handlers for lab verification actions
  const handleConfirmLab = (resultId: string) => {
    updateLabResult(
      resultId,
      {
        verificationStatus: 'verified',
        provenance: 'human_verified',
        verifiedBy: `${userProfile.name} (Verified)`,
        verifiedAt: new Date().toISOString(),
      },
      'Clinician confirmed extracted value accurately reflects source report.'
    );
  };

  const handleEditLab = (result: ExtractedLabResult) => {
    setVerifyingLabResult(result);
    setIsVerificationModalOpen(true);
  };

  const handleRejectLab = (resultId: string) => {
    updateLabResult(
      resultId,
      {
        verificationStatus: 'rejected',
        verifiedBy: userProfile.name,
        verifiedAt: new Date().toISOString(),
      },
      'Clinician rejected erroneous or corrupted extracted parameter.'
    );
  };

  const handleInspectSource = (result: ExtractedLabResult) => {
    setSelectedReportForSideBySide(result.reportId);
    setActiveTab('reports');
  };

  const handleSelectReportForSideBySide = (reportId: string) => {
    setSelectedReportForSideBySide(reportId);
    setActiveTab('reports');
  };

  const handleDeleteReport = (reportId: string) => {
    deleteReport(reportId);
    if (selectedReportForSideBySide === reportId) {
      setSelectedReportForSideBySide(null);
    }
  };

  // Pending counts
  const pendingReviewCount = patientLabResults.filter(l => l.verificationStatus === 'needs_review').length;
  const unresolvedConflictCount = patientConflicts.filter(c => c.status === 'unresolved').length;

  return (
    <div className="app-container">
      {/* Top Header */}
      <Header
        patients={patients}
        activePatient={activePatient}
        onSelectPatient={(id) => {
          setActivePatientId(id);
          setSelectedReportForSideBySide(null);
        }}
        onOpenIntakeModal={() => {
          setEditingPatient(null);
          setIsIntakeModalOpen(true);
        }}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenPrintModal={() => setIsPrintModalOpen(true)}
        searchQuery={globalSearch}
        onSearchChange={setGlobalSearch}
        userProfile={userProfile}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="app-body">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setIsSidebarOpen(false);
          }}
          pendingReviewCount={pendingReviewCount}
          unresolvedConflictCount={unresolvedConflictCount}
          isOpen={isSidebarOpen}
          onResetDemoData={resetToDemoData}
        />

        {/* Main Workspace View */}
        <main className="app-main" id="main-content">
          {activeTab === 'dashboard' && (
            <DashboardView
              patient={activePatient}
              reports={patientReports}
              labResults={patientLabResults}
              summary={activeSummary}
              isGeneratingSummary={isGeneratingSummary}
              onEditPatient={() => {
                setEditingPatient(activePatient || null);
                setIsIntakeModalOpen(true);
              }}
              onOpenUploadModal={() => setIsUploadModalOpen(true)}
              onSelectReportForSideBySide={handleSelectReportForSideBySide}
              onConfirmResult={handleConfirmLab}
              onEditResult={handleEditLab}
              onInspectSource={handleInspectSource}
              onRegenerateSummary={handleRegenerateSummary}
              onNavigateToInsights={() => setActiveTab('insights')}
            />
          )}

          {activeTab === 'patients' && (
            <PatientsView
              patients={patients}
              activePatientId={activePatientId}
              onSelectPatient={(id) => {
                setActivePatientId(id);
                setSelectedReportForSideBySide(null);
              }}
              onOpenIntakeModal={(p) => {
                setEditingPatient(p || null);
                setIsIntakeModalOpen(true);
              }}
              reports={patientReports}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              reports={patientReports}
              labResults={patientLabResults}
              observations={patientObservations}
              onOpenUploadModal={() => setIsUploadModalOpen(true)}
              onConfirmResult={handleConfirmLab}
              onEditResult={handleEditLab}
              onRejectResult={handleRejectLab}
              onDeleteReport={handleDeleteReport}
              initialSelectedReportId={selectedReportForSideBySide}
              onClearSelectedReport={() => setSelectedReportForSideBySide(null)}
            />
          )}

          {activeTab === 'timeline' && (
            <MedicalTimelineView events={patientTimeline} />
          )}

          {activeTab === 'comparisons' && (
            <ReportComparisonView
              reports={patientReports}
              labResults={patientLabResults}
            />
          )}

          {activeTab === 'insights' && activePatient && (
            <AIInsightsView
              patient={activePatient}
              summary={activeSummary}
              conflicts={patientConflicts}
              clarifications={patientClarifications}
              reports={patientReports}
              isGenerating={isGeneratingSummary}
              onRegenerateSummary={handleRegenerateSummary}
              onResolveConflict={resolveConflict}
              onAnswerClarification={answerClarification}
            />
          )}

          {activeTab === 'audit' && (
            <AuditHistoryView entries={auditTrail} />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={appSettings}
              userProfile={userProfile}
              onSaveSettings={saveSettings}
              onSaveUserProfile={saveUserProfile}
              onResetDemoData={resetToDemoData}
            />
          )}
        </main>
      </div>

      {/* Patient Intake Modal */}
      <PatientIntakeModal
        isOpen={isIntakeModalOpen}
        initialPatient={editingPatient}
        onClose={() => {
          setIsIntakeModalOpen(false);
          setEditingPatient(null);
        }}
        onSave={(patientData, isNew) => {
          savePatient(patientData, isNew);
          setActivePatientId(patientData.id);
        }}
      />

      {/* Report Upload & Processing Modal */}
      <ReportUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        patientId={activePatient?.id || 'patient-demo-1'}
        onReportProcessed={handleReportProcessed}
      />

      {/* Human Verification & Editing Modal */}
      <VerificationModal
        isOpen={isVerificationModalOpen}
        result={verifyingLabResult}
        onClose={() => {
          setIsVerificationModalOpen(false);
          setVerifyingLabResult(null);
        }}
        onSave={(resultId, updates, reason) => {
          updateLabResult(resultId, updates, reason);
        }}
      />

      {/* Printable Clinical Record View */}
      {activePatient && (
        <PrintableMedicalRecord
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          patient={activePatient}
          reports={patientReports}
          labResults={patientLabResults}
          observations={patientObservations}
          summary={activeSummary}
        />
      )}
    </div>
  );
};

export default App;
