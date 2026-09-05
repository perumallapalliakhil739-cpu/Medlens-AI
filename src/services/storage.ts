import {
  Patient,
  MedicalReport,
  ExtractedLabResult,
  ReportObservation,
  InformationConflict,
  ClarificationQuestion,
  MedicalTimelineEvent,
  AuditEntry,
  AISummary,
  AppSettings,
  UserProfile,
} from '../types';
import {
  DEMO_PATIENTS,
  DEMO_REPORTS,
  DEMO_LAB_RESULTS,
  DEMO_OBSERVATIONS,
  DEMO_CONFLICTS,
  DEMO_CLARIFICATIONS,
  DEMO_TIMELINE,
  DEMO_AUDIT_TRAIL,
  DEMO_AI_SUMMARIES,
} from './demoData';

const STORAGE_KEYS = {
  PATIENTS: 'medlens_patients_v1',
  ACTIVE_PATIENT: 'medlens_active_patient_id_v1',
  REPORTS: 'medlens_reports_v1',
  LAB_RESULTS: 'medlens_lab_results_v1',
  OBSERVATIONS: 'medlens_observations_v1',
  CONFLICTS: 'medlens_conflicts_v1',
  CLARIFICATIONS: 'medlens_clarifications_v1',
  TIMELINE: 'medlens_timeline_v1',
  AUDIT: 'medlens_audit_trail_v1',
  SUMMARIES: 'medlens_ai_summaries_v1',
  SETTINGS: 'medlens_settings_v1',
  USER_PROFILE: 'medlens_user_profile_v1',
};

const DEFAULT_SETTINGS: AppSettings = {
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  useGeminiIfAvailable: true,
  autoDetectConflicts: true,
  theme: 'clinical_light',
};

const DEFAULT_USER: UserProfile = {
  name: 'Dr. Sarah Jenkins, MD',
  role: 'Attending Clinical Reviewer',
  email: 's.jenkins@medlens.health',
  institution: 'University Health System — Clinical Data Center',
};

type StorageListener = () => void;
const listeners: Set<StorageListener> = new Set();

export function subscribeStorage(listener: StorageListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyListeners(): void {
  listeners.forEach(fn => fn());
}

// Helper to safely read from localStorage
function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to read from localStorage key: ${key}`, e);
    return fallback;
  }
}

// Helper to safely write to localStorage
function writeStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    notifyListeners();
  } catch (e) {
    console.error(`Failed to write to localStorage key: ${key}`, e);
  }
}

// Detect if a test entry is corrupted PostScript/binary metadata
export function isCorruptedTestEntry(testName: string): boolean {
  if (!testName) return true;
  const trimmed = testName.trim();
  if (trimmed.length < 2) return true;
  // Pure digits or non-alphabetic
  if (/^\d+$/.test(trimmed) || !/[a-zA-Z]/.test(trimmed)) return true;
  // PostScript tokens & PDF dictionary keys
  if (trimmed.startsWith('/') || trimmed.includes('/Info') || trimmed.includes('/Root') || trimmed.includes('/Size')) return true;
  // Non-printable control characters or unicode replacement symbols
  if (/[\uFFFD\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/.test(trimmed)) return true;
  // PDF / C2PA bytecode keywords
  if (/(?:c2pa|jumb|cbor|manifest|sha256|MediaBox|CropBox|Parent|obj|endobj|stream|endstream)/i.test(trimmed)) return true;
  return false;
}

// Automatically sanitize corrupted PDF bytecode entries from existing localStorage
export function sanitizeCorruptedStorage(): void {
  try {
    // 1. Sanitize lab results
    const rawLabs = readStorage<ExtractedLabResult[]>(STORAGE_KEYS.LAB_RESULTS, []);
    const cleanLabs = rawLabs.filter(l => !isCorruptedTestEntry(l.testName));
    if (cleanLabs.length !== rawLabs.length) {
      console.info(`[MedLens] Purged ${rawLabs.length - cleanLabs.length} corrupted test entries from storage.`);
      localStorage.setItem(STORAGE_KEYS.LAB_RESULTS, JSON.stringify(cleanLabs));
    }

    // 2. Sanitize reports containing raw PDF bytecode
    const rawReports = readStorage<MedicalReport[]>(STORAGE_KEYS.REPORTS, []);
    const cleanReports = rawReports.filter(r => {
      const isCorrupt = r.sourceText.startsWith('%PDF-') || r.sourceText.includes('c2pa.actions.v2');
      return !isCorrupt;
    });
    if (cleanReports.length !== rawReports.length) {
      console.info(`[MedLens] Purged ${rawReports.length - cleanReports.length} corrupted PDF bytecode reports.`);
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(cleanReports));
    }
  } catch (err) {
    console.warn('Storage sanitization error:', err);
  }
}

// Initialize seed data if not present
export function initializeStorageIfNeeded(): void {
  const existingPatients = localStorage.getItem(STORAGE_KEYS.PATIENTS);
  if (!existingPatients) {
    resetToDemoData();
  } else {
    // Ensure any previously saved bytecode corruption is purged
    sanitizeCorruptedStorage();
  }
}

// Reset database to initial rich Demo Data
export function resetToDemoData(): void {
  writeStorage(STORAGE_KEYS.PATIENTS, DEMO_PATIENTS);
  writeStorage(STORAGE_KEYS.ACTIVE_PATIENT, DEMO_PATIENTS[0].id);
  writeStorage(STORAGE_KEYS.REPORTS, DEMO_REPORTS);
  writeStorage(STORAGE_KEYS.LAB_RESULTS, DEMO_LAB_RESULTS);
  writeStorage(STORAGE_KEYS.OBSERVATIONS, DEMO_OBSERVATIONS);
  writeStorage(STORAGE_KEYS.CONFLICTS, DEMO_CONFLICTS);
  writeStorage(STORAGE_KEYS.CLARIFICATIONS, DEMO_CLARIFICATIONS);
  writeStorage(STORAGE_KEYS.TIMELINE, DEMO_TIMELINE);
  writeStorage(STORAGE_KEYS.AUDIT, DEMO_AUDIT_TRAIL);
  writeStorage(STORAGE_KEYS.SUMMARIES, DEMO_AI_SUMMARIES);
  writeStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  writeStorage(STORAGE_KEYS.USER_PROFILE, DEFAULT_USER);
}

// --- AUDIT TRAIL LOGGING ---
export function logAuditEntry(entry: Omit<AuditEntry, 'id' | 'timestamp'>): void {
  const allAudit = readStorage<AuditEntry[]>(STORAGE_KEYS.AUDIT, []);
  const newEntry: AuditEntry = {
    ...entry,
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  writeStorage(STORAGE_KEYS.AUDIT, [newEntry, ...allAudit]);
}

// --- PATIENTS ---
export function getPatients(): Patient[] {
  return readStorage<Patient[]>(STORAGE_KEYS.PATIENTS, DEMO_PATIENTS);
}

export function getActivePatientId(): string {
  const patients = getPatients();
  const storedId = readStorage<string>(STORAGE_KEYS.ACTIVE_PATIENT, patients[0]?.id || '');
  if (patients.some(p => p.id === storedId)) return storedId;
  return patients[0]?.id || '';
}

export function setActivePatientId(patientId: string): void {
  writeStorage(STORAGE_KEYS.ACTIVE_PATIENT, patientId);
}

export function savePatient(patient: Patient, isNew: boolean): void {
  const patients = getPatients();
  const user = getUserProfile().name;

  if (isNew) {
    const updated = [patient, ...patients];
    writeStorage(STORAGE_KEYS.PATIENTS, updated);
    setActivePatientId(patient.id);

    logAuditEntry({
      action: 'Patient Information Created',
      user,
      affectedRecordType: 'Patient',
      affectedRecordId: patient.id,
      details: `Registered new patient intake for ${patient.name} (${patient.patientIdNumber}).`,
    });

    addTimelineEvent({
      patientId: patient.id,
      date: patient.registrationDate,
      time: new Date().toTimeString().slice(0, 5),
      eventType: 'patient_created',
      title: 'Patient Intake Registration',
      description: `Intake records captured for ${patient.name}.`,
      source: 'Patient Intake Form',
      verificationStatus: 'verified',
    });
  } else {
    const prev = patients.find(p => p.id === patient.id);
    const updated = patients.map(p => (p.id === patient.id ? patient : p));
    writeStorage(STORAGE_KEYS.PATIENTS, updated);

    logAuditEntry({
      action: 'Patient Information Updated',
      user,
      affectedRecordType: 'Patient',
      affectedRecordId: patient.id,
      details: `Updated clinical profile for ${patient.name}.`,
      previousValue: JSON.stringify(prev),
      newValue: JSON.stringify(patient),
    });

    addTimelineEvent({
      patientId: patient.id,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      eventType: 'patient_updated',
      title: 'Patient Intake Record Modified',
      description: `Patient clinical details updated by ${user}.`,
      source: 'Clinical Intake Update',
      verificationStatus: 'verified',
    });
  }
}

// --- REPORTS ---
export function getReports(patientId?: string): MedicalReport[] {
  const all = readStorage<MedicalReport[]>(STORAGE_KEYS.REPORTS, DEMO_REPORTS);
  const clean = all.filter(r => !r.sourceText.startsWith('%PDF-') && !r.sourceText.includes('c2pa.actions.v2'));
  return patientId ? clean.filter(r => r.patientId === patientId) : clean;
}

export function saveReport(report: MedicalReport): void {
  const reports = getReports();
  const existingIdx = reports.findIndex(r => r.id === report.id);
  const user = getUserProfile().name;

  if (existingIdx >= 0) {
    reports[existingIdx] = report;
    writeStorage(STORAGE_KEYS.REPORTS, reports);
  } else {
    writeStorage(STORAGE_KEYS.REPORTS, [report, ...reports]);
    logAuditEntry({
      action: 'Report Uploaded',
      user,
      affectedRecordType: 'MedicalReport',
      affectedRecordId: report.id,
      details: `Uploaded medical report: ${report.fileName} (${report.reportType}).`,
    });

    addTimelineEvent({
      patientId: report.patientId,
      date: report.reportDate || report.uploadDate,
      time: new Date().toTimeString().slice(0, 5),
      eventType: 'report_uploaded',
      title: `Report Uploaded: ${report.fileName}`,
      description: `Uploaded and queued for clinical extraction: ${report.reportType}.`,
      source: report.fileName,
      verificationStatus: 'needs_review',
      relatedReportId: report.id,
    });
  }
}

export function deleteReport(reportId: string): void {
  const reports = getReports();
  const target = reports.find(r => r.id === reportId);
  if (!target) return;

  const user = getUserProfile().name;

  // Filter out report
  const updatedReports = reports.filter(r => r.id !== reportId);
  writeStorage(STORAGE_KEYS.REPORTS, updatedReports);

  // Filter out associated labs
  const labs = getLabResults();
  const updatedLabs = labs.filter(l => l.reportId !== reportId);
  writeStorage(STORAGE_KEYS.LAB_RESULTS, updatedLabs);

  // Filter out associated observations
  const obs = getObservations();
  const updatedObs = obs.filter(o => o.reportId !== reportId);
  writeStorage(STORAGE_KEYS.OBSERVATIONS, updatedObs);

  logAuditEntry({
    action: 'Report Removed',
    user,
    affectedRecordType: 'MedicalReport',
    affectedRecordId: reportId,
    details: `Deleted report: ${target.fileName} and removed associated extracted parameters.`,
  });
}

// --- EXTRACTED LAB RESULTS ---
export function getLabResults(patientId?: string, reportId?: string): ExtractedLabResult[] {
  let list = readStorage<ExtractedLabResult[]>(STORAGE_KEYS.LAB_RESULTS, DEMO_LAB_RESULTS);
  list = list.filter(l => !isCorruptedTestEntry(l.testName));
  if (patientId) list = list.filter(l => l.patientId === patientId);
  if (reportId) list = list.filter(l => l.reportId === reportId);
  return list;
}

export function saveLabResults(newLabs: ExtractedLabResult[]): void {
  const all = getLabResults();
  writeStorage(STORAGE_KEYS.LAB_RESULTS, [...newLabs, ...all]);
}

export function updateLabResult(
  resultId: string,
  updates: Partial<ExtractedLabResult>,
  reason?: string
): void {
  const all = getLabResults();
  const current = all.find(l => l.id === resultId);
  if (!current) return;

  const user = getUserProfile().name;
  const updatedResult: ExtractedLabResult = {
    ...current,
    ...updates,
  };

  const updatedList = all.map(l => (l.id === resultId ? updatedResult : l));
  writeStorage(STORAGE_KEYS.LAB_RESULTS, updatedList);

  // Determine audit action
  let action = 'Information Updated';
  if (updates.verificationStatus === 'verified') action = 'Information Verified';
  else if (updates.verificationStatus === 'rejected') action = 'Information Rejected';
  else if (updates.verificationStatus === 'edited') action = 'Information Edited';

  logAuditEntry({
    action,
    user,
    affectedRecordType: 'ExtractedLabResult',
    affectedRecordId: resultId,
    details: reason || `Updated ${current.testName} (Status: ${updatedResult.verificationStatus}).`,
    previousValue: `${current.testName}: ${current.value} ${current.unit} [${current.referenceRangeText}] (Verified: ${current.verificationStatus})`,
    newValue: `${updatedResult.testName}: ${updatedResult.value} ${updatedResult.unit} [${updatedResult.referenceRangeText}] (Verified: ${updatedResult.verificationStatus})`,
  });

  addTimelineEvent({
    patientId: current.patientId,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    eventType: updates.verificationStatus === 'edited' ? 'info_edited' : 'info_verified',
    title: `Result ${updates.verificationStatus === 'edited' ? 'Edited' : 'Verified'}: ${current.testName}`,
    description: `${current.testName} evaluated by ${user}. Value: ${updatedResult.value} ${updatedResult.unit}.`,
    source: 'Human Verification',
    verificationStatus: updatedResult.verificationStatus,
    relatedReportId: current.reportId,
  });
}

// --- OBSERVATIONS ---
export function getObservations(patientId?: string, reportId?: string): ReportObservation[] {
  let list = readStorage<ReportObservation[]>(STORAGE_KEYS.OBSERVATIONS, DEMO_OBSERVATIONS);
  if (patientId) list = list.filter(o => o.patientId === patientId);
  if (reportId) list = list.filter(o => o.reportId === reportId);
  return list;
}

export function saveObservations(newObs: ReportObservation[]): void {
  const all = getObservations();
  writeStorage(STORAGE_KEYS.OBSERVATIONS, [...newObs, ...all]);
}

// --- CONFLICTS ---
export function getConflicts(patientId?: string): InformationConflict[] {
  const all = readStorage<InformationConflict[]>(STORAGE_KEYS.CONFLICTS, DEMO_CONFLICTS);
  return patientId ? all.filter(c => c.patientId === patientId) : all;
}

export function saveConflicts(conflicts: InformationConflict[]): void {
  const all = getConflicts();
  const map = new Map<string, InformationConflict>();
  all.forEach(c => map.set(c.id, c));
  conflicts.forEach(c => map.set(c.id, c));
  writeStorage(STORAGE_KEYS.CONFLICTS, Array.from(map.values()));
}

export function resolveConflict(conflictId: string, resolutionNotes: string): void {
  const all = getConflicts();
  const current = all.find(c => c.id === conflictId);
  if (!current) return;

  const user = getUserProfile().name;
  const updated = all.map(c =>
    c.id === conflictId
      ? {
          ...c,
          status: 'resolved' as const,
          resolutionNotes,
          resolvedAt: new Date().toISOString(),
        }
      : c
  );
  writeStorage(STORAGE_KEYS.CONFLICTS, updated);

  logAuditEntry({
    action: 'Conflict Resolved',
    user,
    affectedRecordType: 'InformationConflict',
    affectedRecordId: conflictId,
    details: `Resolved conflict: ${current.title}. Resolution: ${resolutionNotes}`,
  });

  addTimelineEvent({
    patientId: current.patientId,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    eventType: 'conflict_resolved',
    title: `Conflict Resolved: ${current.title}`,
    description: `Resolution by ${user}: "${resolutionNotes}"`,
    source: 'Clinical Reviewer',
    verificationStatus: 'verified',
  });
}

// --- CLARIFICATIONS ---
export function getClarifications(patientId?: string): ClarificationQuestion[] {
  const all = readStorage<ClarificationQuestion[]>(STORAGE_KEYS.CLARIFICATIONS, DEMO_CLARIFICATIONS);
  return patientId ? all.filter(c => c.patientId === patientId) : all;
}

export function saveClarifications(newItems: ClarificationQuestion[]): void {
  const all = getClarifications();
  const map = new Map<string, ClarificationQuestion>();
  all.forEach(c => map.set(c.id, c));
  newItems.forEach(c => map.set(c.id, c));
  writeStorage(STORAGE_KEYS.CLARIFICATIONS, Array.from(map.values()));
}

export function answerClarification(questionId: string, answer: string): void {
  const all = getClarifications();
  const updated = all.map(q =>
    q.id === questionId
      ? {
          ...q,
          answered: true,
          userResponse: answer,
          answeredAt: new Date().toISOString(),
        }
      : q
  );
  writeStorage(STORAGE_KEYS.CLARIFICATIONS, updated);

  logAuditEntry({
    action: 'Clarification Answered',
    user: getUserProfile().name,
    affectedRecordType: 'ClarificationQuestion',
    affectedRecordId: questionId,
    details: `User answered clarification: "${answer}"`,
  });
}

// --- TIMELINE ---
export function getTimelineEvents(patientId?: string): MedicalTimelineEvent[] {
  const all = readStorage<MedicalTimelineEvent[]>(STORAGE_KEYS.TIMELINE, DEMO_TIMELINE);
  const sorted = [...all].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  return patientId ? sorted.filter(t => t.patientId === patientId) : sorted;
}

export function addTimelineEvent(event: Omit<MedicalTimelineEvent, 'id'>): void {
  const all = getTimelineEvents();
  const newEvent: MedicalTimelineEvent = {
    ...event,
    id: `time-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
  };
  writeStorage(STORAGE_KEYS.TIMELINE, [newEvent, ...all]);
}

// --- AUDIT TRAIL ---
export function getAuditTrail(): AuditEntry[] {
  return readStorage<AuditEntry[]>(STORAGE_KEYS.AUDIT, DEMO_AUDIT_TRAIL);
}

// --- AI SUMMARIES ---
export function getAISummaries(patientId?: string): AISummary[] {
  const all = readStorage<AISummary[]>(STORAGE_KEYS.SUMMARIES, DEMO_AI_SUMMARIES);
  return patientId ? all.filter(s => s.patientId === patientId) : all;
}

export function saveAISummary(summary: AISummary): void {
  const all = getAISummaries();
  const updated = [summary, ...all.filter(s => s.id !== summary.id)];
  writeStorage(STORAGE_KEYS.SUMMARIES, updated);

  logAuditEntry({
    action: 'AI Summary Generated',
    user: 'MedLens Intelligence Engine',
    affectedRecordType: 'AISummary',
    affectedRecordId: summary.id,
    details: 'Generated patient-friendly objective clinical summary with safety disclaimer.',
  });

  addTimelineEvent({
    patientId: summary.patientId,
    date: summary.generatedDate,
    time: new Date().toTimeString().slice(0, 5),
    eventType: 'ai_summary_generated',
    title: 'AI Clinical Summary Formulated',
    description: 'Synthesized report findings and reference-range classifications into non-diagnostic summary.',
    source: 'MedLens AI',
    verificationStatus: 'verified',
  });
}

// --- SETTINGS & USER ---
export function getSettings(): AppSettings {
  const stored = readStorage<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  const envKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  if (!stored.geminiApiKey && envKey) {
    return {
      ...stored,
      geminiApiKey: envKey,
    };
  }
  return stored;
}

export function saveSettings(settings: AppSettings): void {
  writeStorage(STORAGE_KEYS.SETTINGS, settings);
}

export function getUserProfile(): UserProfile {
  return readStorage<UserProfile>(STORAGE_KEYS.USER_PROFILE, DEFAULT_USER);
}

export function saveUserProfile(profile: UserProfile): void {
  writeStorage(STORAGE_KEYS.USER_PROFILE, profile);
}

// Export database as JSON
export function exportDatabaseAsJson(): string {
  const data = {
    medlensVersion: '1.0.0',
    exportTimestamp: new Date().toISOString(),
    patients: getPatients(),
    reports: getReports(),
    labResults: getLabResults(),
    observations: getObservations(),
    conflicts: getConflicts(),
    clarifications: getClarifications(),
    timeline: getTimelineEvents(),
    audit: getAuditTrail(),
    summaries: getAISummaries(),
  };
  return JSON.stringify(data, null, 2);
}
