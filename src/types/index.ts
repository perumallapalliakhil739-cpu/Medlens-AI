export type Sex = 'Female' | 'Male' | 'Other' | 'Prefer not to say';

export interface Medication {
  name: string;
  dosage?: string;
  frequency?: string;
  prescribedDate?: string;
  source?: 'user_intake' | 'extracted_from_report';
}

export interface Patient {
  id: string;
  name: string;
  patientIdNumber: string;
  age: number;
  sex: Sex;
  dob?: string;
  contact?: string;
  registrationDate: string;
  symptoms: string[];
  existingConditions: string[];
  allergies: string[];
  currentMedications: Medication[];
  medicalHistoryNotes?: string;
  isDemo?: boolean;
}

export type ReportType = 
  | 'Hematology / CBC'
  | 'Comprehensive Metabolic Panel'
  | 'Lipid Panel'
  | 'Thyroid Function'
  | 'Urinalysis'
  | 'Discharge Summary'
  | 'Consultation Note'
  | 'Diagnostic Radiology'
  | 'General Medical Report';

export type ProcessingStatus = 'queued' | 'processing' | 'processed' | 'failed';
export type VerificationStatus = 'not_reviewed' | 'needs_review' | 'verified' | 'edited' | 'rejected';
export type LabStatus = 'low' | 'normal' | 'high' | 'status_unavailable' | 'requires_review';
export type ProvenanceType = 'user_provided' | 'extracted_from_report' | 'ai_generated' | 'human_verified';
export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'unavailable';

export interface MedicalReport {
  id: string;
  patientId: string;
  fileName: string;
  fileType: 'pdf' | 'image' | 'scanned_text' | 'demo' | 'text';
  reportType: ReportType;
  reportDate?: string;
  uploadDate: string;
  sourceText: string;
  sourceFileUrl?: string; // base64 or blob URL
  processingStatus: ProcessingStatus;
  verificationStatus: VerificationStatus;
  notes?: string;
}

export interface ExtractedLabResult {
  id: string;
  reportId: string;
  patientId: string;
  testName: string;
  value: string;
  numericValue?: number;
  unit: string;
  referenceRangeText: string; // Exactly from report, or "Reference range unavailable in source report"
  status: LabStatus;
  sourceSnippet: string; // Exact line or context from report
  sourceLocation?: string; // e.g. "Line 8" or "Section 2"
  provenance: ProvenanceType;
  confidence: ConfidenceLevel;
  verificationStatus: VerificationStatus;
  originalExtractedValue?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
}

export interface ReportObservation {
  id: string;
  reportId: string;
  patientId: string;
  observationText: string;
  sourceSnippet: string;
  date?: string;
  provenance: ProvenanceType;
  verificationStatus: VerificationStatus;
}

export interface InformationConflict {
  id: string;
  patientId: string;
  category: 'allergy' | 'medication' | 'condition' | 'lab_value';
  title: string;
  description: string;
  sourceA: { name: string; value: string; date?: string; type: string };
  sourceB: { name: string; value: string; date?: string; type: string };
  status: 'unresolved' | 'resolved';
  resolutionNotes?: string;
  resolvedAt?: string;
}

export interface ClarificationQuestion {
  id: string;
  patientId: string;
  reportId?: string;
  question: string;
  context: string;
  answered: boolean;
  userResponse?: string;
  answeredAt?: string;
}

export type TimelineEventType = 
  | 'patient_created'
  | 'patient_updated'
  | 'report_uploaded'
  | 'report_processed'
  | 'info_verified'
  | 'info_edited'
  | 'info_rejected'
  | 'conflict_detected'
  | 'conflict_resolved'
  | 'ai_summary_generated';

export interface MedicalTimelineEvent {
  id: string;
  patientId: string;
  date: string;
  time: string;
  eventType: TimelineEventType;
  title: string;
  description: string;
  source: string;
  verificationStatus?: VerificationStatus;
  relatedReportId?: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  affectedRecordType: string;
  affectedRecordId: string;
  details: string;
  previousValue?: string;
  newValue?: string;
}

export interface AISummary {
  id: string;
  patientId: string;
  summaryText: string;
  keyObservations: string[];
  outOfRangeFindings: string[];
  missingOrUnclearInfo: string[];
  nonDiagnosticDiscussionPoints: string[];
  generatedDate: string;
  sourceReportIds: string[];
  disclaimer: string;
  provenance: 'ai_generated';
}

export interface AppSettings {
  geminiApiKey: string;
  useGeminiIfAvailable: boolean;
  autoDetectConflicts: boolean;
  theme: 'clinical_light' | 'clinical_calm_dark';
}

export interface UserProfile {
  name: string;
  role: string;
  email: string;
  institution: string;
}
