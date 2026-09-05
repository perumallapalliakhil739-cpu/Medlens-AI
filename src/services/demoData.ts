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
} from '../types';
import { MANDATORY_SAFETY_DISCLAIMER } from './aiSummaryEngine';

export const DEMO_PATIENTS: Patient[] = [
  {
    id: 'patient-demo-1',
    name: 'Eleanor Vance (Demo Patient)',
    patientIdNumber: 'DEMO-MED-8492',
    age: 58,
    sex: 'Female',
    dob: '1968-04-12',
    contact: '+1 (555) 234-8901',
    registrationDate: '2026-03-01',
    symptoms: ['Mild fatigue', 'Occasional morning joint stiffness', 'Post-prandial lethargy'],
    existingConditions: ['Essential Hypertension', 'Mild Osteoarthritis'],
    allergies: ['Penicillin (Moderate Urticaria/Rash)'],
    currentMedications: [
      { name: 'Lisinopril', dosage: '10 mg', frequency: 'Daily in morning' },
      { name: 'Cholecalciferol (Vitamin D3)', dosage: '1000 IU', frequency: 'Daily with meal' },
    ],
    medicalHistoryNotes: 'History of well-controlled hypertension for 5 years. Non-smoker.',
    isDemo: true,
  },
  {
    id: 'patient-demo-2',
    name: 'Marcus Chen (Demo Patient)',
    patientIdNumber: 'DEMO-MED-5129',
    age: 42,
    sex: 'Male',
    dob: '1984-08-23',
    contact: '+1 (555) 872-3341',
    registrationDate: '2026-07-15',
    symptoms: ['Transient exertion-related chest tightness', 'Occasional palpitations'],
    existingConditions: ['Dyslipidemia'],
    allergies: ['Aspirin (Bronchospasm)', 'Sulfa antibiotics'],
    currentMedications: [
      { name: 'Atorvastatin', dosage: '20 mg', frequency: 'Once nightly' },
    ],
    medicalHistoryNotes: 'Family history of early coronary artery disease in paternal relatives.',
    isDemo: true,
  },
];

export const DEMO_REPORTS: MedicalReport[] = [
  {
    id: 'report-demo-1a',
    patientId: 'patient-demo-1',
    fileName: 'Quest_Diagnostics_Metabolic_Panel_Jun2026.pdf',
    fileType: 'demo',
    reportType: 'Comprehensive Metabolic Panel',
    reportDate: '12 Jun 2026',
    uploadDate: '2026-06-12',
    sourceText: `QUEST DIAGNOSTICS - CLINICAL LABORATORY REPORT
Patient: Eleanor Vance | Patient ID: DEMO-MED-8492 | Sex: F | Age: 58
Specimen Date: 12 Jun 2026 | Reported: 13 Jun 2026
Ordering Provider: Dr. R. Sterling, MD | Specimen: Serum

COMPREHENSIVE METABOLIC & LIPID PANEL
Test Name                   Result   Units     Reference Range   Status
Fasting Blood Glucose       102      mg/dL     70 - 100          HIGH
Hemoglobin                  11.8     g/dL      12.0 - 16.0       LOW
Total Cholesterol           215      mg/dL     < 200             HIGH
Serum Potassium             4.2      mmol/L    3.5 - 5.0         NORMAL
Serum Sodium                140      mEq/L     135 - 145         NORMAL
Serum Creatinine            0.9      mg/dL     0.5 - 1.1         NORMAL
Blood Urea Nitrogen (BUN)   14       mg/dL     7 - 20            NORMAL

IMPRESSION:
Routine fasting metabolic evaluation. Slightly elevated fasting blood glucose and mild borderline low hemoglobin noted. Cholesterol mildly above source threshold.`,
    processingStatus: 'processed',
    verificationStatus: 'verified',
    notes: 'Previous laboratory baseline report.',
  },
  {
    id: 'report-demo-1b',
    patientId: 'patient-demo-1',
    fileName: 'CoreLab_Complete_Evaluation_Sep2026.pdf',
    fileType: 'demo',
    reportType: 'Hematology / CBC',
    reportDate: '05 Sep 2026',
    uploadDate: '2026-09-05',
    sourceText: `CORE LAB HEALTH NETWORK - HEMATOLOGY & METABOLIC REPORT
Patient Name: Eleanor Vance | MRN: DEMO-MED-8492 | Age: 58 | Sex: Female
Date of Report: 05 Sep 2026 | Collection: 05 Sep 2026 08:30 AM
Ordering Physician: Dr. K. Patel, MD

TEST                      RESULT   UNITS      REFERENCE RANGE    FLAG
Fasting Blood Glucose     118      mg/dL      70 - 100           HIGH
Hemoglobin                12.4     g/dL       12.0 - 16.0        NORMAL
White Blood Cell (WBC)    6.8      10^3/uL    4.5 - 11.0         NORMAL
Platelet Count            240      10^3/uL    150 - 450          NORMAL
Total Cholesterol         228      mg/dL      < 200              HIGH
Serum Potassium           4.4      mmol/L     3.5 - 5.0          NORMAL
Serum Sodium              139      mEq/L      135 - 145          NORMAL
Serum Creatinine          0.88     mg/dL      0.5 - 1.1          NORMAL
Vitamin D (25-Hydroxy)    18.2     ng/mL                         

FINDINGS & OBSERVATIONS:
Patient presented for 6-month laboratory follow-up. Peripheral blood smear displays normocytic, normochromic erythrocytes with normal morphology. Vitamin D assay executed per provider order (reference range was not reported by reference instrument).`,
    processingStatus: 'processed',
    verificationStatus: 'needs_review',
    notes: 'Current laboratory report with missing reference range on Vitamin D and changes from previous report.',
  },
  {
    id: 'report-demo-1c',
    patientId: 'patient-demo-1',
    fileName: 'City_Memorial_Discharge_Summary_Aug2026.txt',
    fileType: 'demo',
    reportType: 'Discharge Summary',
    reportDate: '02 Aug 2026',
    uploadDate: '2026-08-02',
    sourceText: `CITY MEMORIAL AMBULATORY CARE
PATIENT ENCOUNTER & DISCHARGE NOTE
Patient: Eleanor Vance | Patient ID: DEMO-MED-8492 | Date: 02 Aug 2026
Encounter Type: Urgent Care Evaluation for acute musculoskeletal shoulder strain.

CLINICAL NOTES:
Patient evaluated for right shoulder pain following physical gardening. No acute fracture.
Allergies: No known allergies (NKDA) recorded during intake bedside survey.
Discharge instructions provided with gentle range-of-motion physical therapy guidance.`,
    processingStatus: 'processed',
    verificationStatus: 'verified',
    notes: 'Encounter note containing documented conflict regarding allergy status.',
  },
  {
    id: 'report-demo-2a',
    patientId: 'patient-demo-2',
    fileName: 'Heart_Vascular_Institute_Lipid_Jul2026.pdf',
    fileType: 'demo',
    reportType: 'Lipid Panel',
    reportDate: '18 Jul 2026',
    uploadDate: '2026-07-18',
    sourceText: `HEART & VASCULAR INSTITUTE
CARDIOVASCULAR RISK PANEL
Patient: Marcus Chen | ID: DEMO-MED-5129 | Date of Report: 18 Jul 2026

Test Name                 Value    Unit      Reference Range   Status
Total Cholesterol         245      mg/dL     < 200             HIGH
HDL Cholesterol           38       mg/dL     > 40              LOW
Triglycerides             190      mg/dL     < 150             HIGH
High-Sensitivity CRP      3.4      mg/L      < 1.0             HIGH
Troponin I                0.01     ng/mL     < 0.04            NORMAL

IMPRESSION:
Fasting lipid evaluation demonstrates atherogenic dyslipidemia and elevated systemic inflammatory marker (hs-CRP). Resting troponin within source threshold.`,
    processingStatus: 'processed',
    verificationStatus: 'verified',
  },
];

export const DEMO_LAB_RESULTS: ExtractedLabResult[] = [
  // Patient 1 - Report 1a (Jun 2026)
  {
    id: 'lab-p1-1',
    reportId: 'report-demo-1a',
    patientId: 'patient-demo-1',
    testName: 'Fasting Blood Glucose',
    value: '102',
    numericValue: 102,
    unit: 'mg/dL',
    referenceRangeText: '70 - 100',
    status: 'high',
    sourceSnippet: 'Fasting Blood Glucose       102      mg/dL     70 - 100          HIGH',
    sourceLocation: 'Line 8',
    provenance: 'extracted_from_report',
    confidence: 'high',
    verificationStatus: 'verified',
    originalExtractedValue: '102',
    verifiedBy: 'Dr. Clinician (Verified)',
    verifiedAt: '2026-06-14T10:20:00Z',
  },
  {
    id: 'lab-p1-2',
    reportId: 'report-demo-1a',
    patientId: 'patient-demo-1',
    testName: 'Hemoglobin',
    value: '11.8',
    numericValue: 11.8,
    unit: 'g/dL',
    referenceRangeText: '12.0 - 16.0',
    status: 'low',
    sourceSnippet: 'Hemoglobin                  11.8     g/dL      12.0 - 16.0       LOW',
    sourceLocation: 'Line 9',
    provenance: 'extracted_from_report',
    confidence: 'high',
    verificationStatus: 'verified',
    originalExtractedValue: '11.8',
    verifiedBy: 'Dr. Clinician (Verified)',
    verifiedAt: '2026-06-14T10:21:00Z',
  },
  {
    id: 'lab-p1-3',
    reportId: 'report-demo-1a',
    patientId: 'patient-demo-1',
    testName: 'Total Cholesterol',
    value: '215',
    numericValue: 215,
    unit: 'mg/dL',
    referenceRangeText: '< 200',
    status: 'high',
    sourceSnippet: 'Total Cholesterol           215      mg/dL     < 200             HIGH',
    sourceLocation: 'Line 10',
    provenance: 'extracted_from_report',
    confidence: 'high',
    verificationStatus: 'verified',
    originalExtractedValue: '215',
    verifiedBy: 'Dr. Clinician (Verified)',
    verifiedAt: '2026-06-14T10:21:30Z',
  },
  {
    id: 'lab-p1-4',
    reportId: 'report-demo-1a',
    patientId: 'patient-demo-1',
    testName: 'Serum Potassium',
    value: '4.2',
    numericValue: 4.2,
    unit: 'mmol/L',
    referenceRangeText: '3.5 - 5.0',
    status: 'normal',
    sourceSnippet: 'Serum Potassium             4.2      mmol/L    3.5 - 5.0         NORMAL',
    sourceLocation: 'Line 11',
    provenance: 'extracted_from_report',
    confidence: 'high',
    verificationStatus: 'verified',
    originalExtractedValue: '4.2',
    verifiedBy: 'Dr. Clinician (Verified)',
    verifiedAt: '2026-06-14T10:22:00Z',
  },
  {
    id: 'lab-p1-5',
    reportId: 'report-demo-1a',
    patientId: 'patient-demo-1',
    testName: 'Serum Sodium',
    value: '140',
    numericValue: 140,
    unit: 'mEq/L',
    referenceRangeText: '135 - 145',
    status: 'normal',
    sourceSnippet: 'Serum Sodium                140      mEq/L     135 - 145         NORMAL',
    sourceLocation: 'Line 12',
    provenance: 'extracted_from_report',
    confidence: 'high',
    verificationStatus: 'verified',
    originalExtractedValue: '140',
    verifiedBy: 'Dr. Clinician (Verified)',
    verifiedAt: '2026-06-14T10:22:15Z',
  },

  // Patient 1 - Report 1b (Sep 2026 - Current)
  {
    id: 'lab-p1-6',
    reportId: 'report-demo-1b',
    patientId: 'patient-demo-1',
    testName: 'Fasting Blood Glucose',
    value: '118',
    numericValue: 118,
    unit: 'mg/dL',
    referenceRangeText: '70 - 100',
    status: 'high',
    sourceSnippet: 'Fasting Blood Glucose     118      mg/dL      70 - 100           HIGH',
    sourceLocation: 'Line 8',
    provenance: 'extracted_from_report',
    confidence: 'high',
    verificationStatus: 'needs_review',
    originalExtractedValue: '118',
  },
  {
    id: 'lab-p1-7',
    reportId: 'report-demo-1b',
    patientId: 'patient-demo-1',
    testName: 'Hemoglobin',
    value: '12.4',
    numericValue: 12.4,
    unit: 'g/dL',
    referenceRangeText: '12.0 - 16.0',
    status: 'normal',
    sourceSnippet: 'Hemoglobin                12.4     g/dL       12.0 - 16.0        NORMAL',
    sourceLocation: 'Line 9',
    provenance: 'extracted_from_report',
    confidence: 'high',
    verificationStatus: 'verified',
    originalExtractedValue: '12.4',
    verifiedBy: 'Clinical Reviewer',
    verifiedAt: '2026-09-05T14:10:00Z',
  },
  {
    id: 'lab-p1-8',
    reportId: 'report-demo-1b',
    patientId: 'patient-demo-1',
    testName: 'White Blood Cell (WBC)',
    value: '6.8',
    numericValue: 6.8,
    unit: '10^3/uL',
    referenceRangeText: '4.5 - 11.0',
    status: 'normal',
    sourceSnippet: 'White Blood Cell (WBC)    6.8      10^3/uL    4.5 - 11.0         NORMAL',
    sourceLocation: 'Line 10',
    provenance: 'extracted_from_report',
    confidence: 'high',
    verificationStatus: 'verified',
    originalExtractedValue: '6.8',
    verifiedBy: 'Clinical Reviewer',
    verifiedAt: '2026-09-05T14:10:30Z',
  },
  {
    id: 'lab-p1-9',
    reportId: 'report-demo-1b',
    patientId: 'patient-demo-1',
    testName: 'Total Cholesterol',
    value: '228',
    numericValue: 228,
    unit: 'mg/dL',
    referenceRangeText: '< 200',
    status: 'high',
    sourceSnippet: 'Total Cholesterol         228      mg/dL      < 200              HIGH',
    sourceLocation: 'Line 12',
    provenance: 'extracted_from_report',
    confidence: 'high',
    verificationStatus: 'needs_review',
    originalExtractedValue: '228',
  },
  {
    id: 'lab-p1-10',
    reportId: 'report-demo-1b',
    patientId: 'patient-demo-1',
    testName: 'Vitamin D (25-Hydroxy)',
    value: '18.2',
    numericValue: 18.2,
    unit: 'ng/mL',
    referenceRangeText: 'Reference range unavailable in source report',
    status: 'status_unavailable',
    sourceSnippet: 'Vitamin D (25-Hydroxy)    18.2     ng/mL',
    sourceLocation: 'Line 16',
    provenance: 'extracted_from_report',
    confidence: 'medium',
    verificationStatus: 'needs_review',
    originalExtractedValue: '18.2',
    notes: 'Reference range not specified by laboratory equipment in source report.',
  },

  // Patient 2 Labs
  {
    id: 'lab-p2-1',
    reportId: 'report-demo-2a',
    patientId: 'patient-demo-2',
    testName: 'Total Cholesterol',
    value: '245',
    numericValue: 245,
    unit: 'mg/dL',
    referenceRangeText: '< 200',
    status: 'high',
    sourceSnippet: 'Total Cholesterol         245      mg/dL     < 200             HIGH',
    sourceLocation: 'Line 6',
    provenance: 'extracted_from_report',
    confidence: 'high',
    verificationStatus: 'verified',
    originalExtractedValue: '245',
  },
  {
    id: 'lab-p2-2',
    reportId: 'report-demo-2a',
    patientId: 'patient-demo-2',
    testName: 'HDL Cholesterol',
    value: '38',
    numericValue: 38,
    unit: 'mg/dL',
    referenceRangeText: '> 40',
    status: 'low',
    sourceSnippet: 'HDL Cholesterol           38       mg/dL     > 40              LOW',
    sourceLocation: 'Line 7',
    provenance: 'extracted_from_report',
    confidence: 'high',
    verificationStatus: 'verified',
    originalExtractedValue: '38',
  },
  {
    id: 'lab-p2-3',
    reportId: 'report-demo-2a',
    patientId: 'patient-demo-2',
    testName: 'High-Sensitivity CRP',
    value: '3.4',
    numericValue: 3.4,
    unit: 'mg/L',
    referenceRangeText: '< 1.0',
    status: 'high',
    sourceSnippet: 'High-Sensitivity CRP      3.4      mg/L      < 1.0             HIGH',
    sourceLocation: 'Line 9',
    provenance: 'extracted_from_report',
    confidence: 'high',
    verificationStatus: 'verified',
    originalExtractedValue: '3.4',
  },
];

export const DEMO_OBSERVATIONS: ReportObservation[] = [
  {
    id: 'obs-p1-1',
    reportId: 'report-demo-1a',
    patientId: 'patient-demo-1',
    observationText: 'Routine fasting metabolic evaluation. Slightly elevated fasting blood glucose and mild borderline low hemoglobin noted.',
    sourceSnippet: 'Routine fasting metabolic evaluation. Slightly elevated fasting blood glucose and mild borderline low hemoglobin noted.',
    date: '12 Jun 2026',
    provenance: 'extracted_from_report',
    verificationStatus: 'verified',
  },
  {
    id: 'obs-p1-2',
    reportId: 'report-demo-1b',
    patientId: 'patient-demo-1',
    observationText: 'Peripheral blood smear displays normocytic, normochromic erythrocytes with normal morphology.',
    sourceSnippet: 'FINDINGS: Peripheral blood smear displays normocytic, normochromic erythrocytes with normal morphology.',
    date: '05 Sep 2026',
    provenance: 'extracted_from_report',
    verificationStatus: 'verified',
  },
  {
    id: 'obs-p1-3',
    reportId: 'report-demo-1c',
    patientId: 'patient-demo-1',
    observationText: 'No known allergies (NKDA) recorded during intake bedside survey.',
    sourceSnippet: 'Allergies: No known allergies (NKDA) recorded during intake bedside survey.',
    date: '02 Aug 2026',
    provenance: 'extracted_from_report',
    verificationStatus: 'verified',
  },
];

export const DEMO_CONFLICTS: InformationConflict[] = [
  {
    id: 'conflict-demo-1',
    patientId: 'patient-demo-1',
    category: 'allergy',
    title: 'Allergy Record Inconsistency',
    description: 'Potential information conflict detected between patient intake and uploaded report regarding allergy status.',
    sourceA: {
      name: 'Patient Intake Form',
      value: 'Allergy reported: Penicillin (Moderate Urticaria/Rash)',
      date: '2026-03-01',
      type: 'User Provided Intake',
    },
    sourceB: {
      name: 'City_Memorial_Discharge_Summary_Aug2026.txt',
      value: 'Bedside note records: "No known allergies (NKDA)"',
      date: '02 Aug 2026',
      type: 'Extracted from Report',
    },
    status: 'unresolved',
  },
];

export const DEMO_CLARIFICATIONS: ClarificationQuestion[] = [
  {
    id: 'clar-demo-1',
    patientId: 'patient-demo-1',
    reportId: 'report-demo-1b',
    question: 'The report contains a value for "Vitamin D (25-Hydroxy)" of 18.2 ng/mL, but no reference range was provided. Would you like to review the source document?',
    context: 'Source line: "Vitamin D (25-Hydroxy)    18.2     ng/mL". MedLens never invents reference ranges.',
    answered: false,
  },
  {
    id: 'clar-demo-2',
    patientId: 'patient-demo-1',
    reportId: 'report-demo-1c',
    question: 'Two documents contain conflicting allergy information (Penicillin allergy vs NKDA). Please review and clarify with patient.',
    context: 'Discrepancy detected between patient registration and August encounter note.',
    answered: false,
  },
];

export const DEMO_TIMELINE: MedicalTimelineEvent[] = [
  {
    id: 'time-1',
    patientId: 'patient-demo-1',
    date: '2026-03-01',
    time: '09:00',
    eventType: 'patient_created',
    title: 'Patient Intake Registration',
    description: 'Initial intake completed. Recorded symptoms, hypertension condition, and Penicillin allergy.',
    source: 'Patient Intake Form',
    verificationStatus: 'verified',
  },
  {
    id: 'time-2',
    patientId: 'patient-demo-1',
    date: '2026-06-12',
    time: '11:15',
    eventType: 'report_uploaded',
    title: 'Laboratory Report Uploaded',
    description: 'Uploaded Quest Diagnostics Comprehensive Metabolic & Lipid Panel (Jun 2026).',
    source: 'Quest_Diagnostics_Metabolic_Panel_Jun2026.pdf',
    verificationStatus: 'verified',
    relatedReportId: 'report-demo-1a',
  },
  {
    id: 'time-3',
    patientId: 'patient-demo-1',
    date: '2026-06-14',
    time: '10:20',
    eventType: 'info_verified',
    title: 'Extracted Lab Values Verified',
    description: 'Clinician confirmed 7 extracted results from June 2026 metabolic panel.',
    source: 'Human Reviewer',
    verificationStatus: 'verified',
    relatedReportId: 'report-demo-1a',
  },
  {
    id: 'time-4',
    patientId: 'patient-demo-1',
    date: '2026-08-02',
    time: '15:30',
    eventType: 'report_uploaded',
    title: 'Discharge Summary Uploaded',
    description: 'Encounter summary from City Memorial Urgent Care processed.',
    source: 'City_Memorial_Discharge_Summary_Aug2026.txt',
    verificationStatus: 'verified',
    relatedReportId: 'report-demo-1c',
  },
  {
    id: 'time-5',
    patientId: 'patient-demo-1',
    date: '2026-08-02',
    time: '15:32',
    eventType: 'conflict_detected',
    title: 'Potential Information Conflict Detected',
    description: 'Allergy discrepancy identified between intake record (Penicillin) and discharge note (NKDA).',
    source: 'MedLens Conflict Engine',
    verificationStatus: 'needs_review',
  },
  {
    id: 'time-6',
    patientId: 'patient-demo-1',
    date: '2026-09-05',
    time: '08:45',
    eventType: 'report_uploaded',
    title: 'CoreLab Complete Evaluation Uploaded',
    description: 'Recent September 2026 lab report uploaded and structured into 5 laboratory results.',
    source: 'CoreLab_Complete_Evaluation_Sep2026.pdf',
    verificationStatus: 'needs_review',
    relatedReportId: 'report-demo-1b',
  },
  {
    id: 'time-7',
    patientId: 'patient-demo-1',
    date: '2026-09-05',
    time: '08:47',
    eventType: 'ai_summary_generated',
    title: 'AI Medical Information Summary Generated',
    description: 'Generated transparent, patient-friendly non-diagnostic summary synthesizing available reports.',
    source: 'MedLens AI Engine',
    verificationStatus: 'verified',
  },
];

export const DEMO_AUDIT_TRAIL: AuditEntry[] = [
  {
    id: 'audit-1',
    timestamp: '2026-03-01T09:00:00Z',
    action: 'Patient Information Created',
    user: 'Intake Staff (Clinical Intake)',
    affectedRecordType: 'Patient',
    affectedRecordId: 'patient-demo-1',
    details: 'Initial registration created for Eleanor Vance (DEMO-MED-8492).',
  },
  {
    id: 'audit-2',
    timestamp: '2026-06-12T11:15:00Z',
    action: 'Report Uploaded',
    user: 'Clinical Coordinator',
    affectedRecordType: 'MedicalReport',
    affectedRecordId: 'report-demo-1a',
    details: 'Uploaded Quest_Diagnostics_Metabolic_Panel_Jun2026.pdf.',
  },
  {
    id: 'audit-3',
    timestamp: '2026-06-12T11:15:30Z',
    action: 'Information Extracted',
    user: 'MedLens Parser Engine',
    affectedRecordType: 'ExtractedLabResult',
    affectedRecordId: 'report-demo-1a',
    details: 'Extracted 7 lab results with source-provided reference ranges.',
  },
  {
    id: 'audit-4',
    timestamp: '2026-06-14T10:20:00Z',
    action: 'Information Verified',
    user: 'Dr. Clinician (Verified)',
    affectedRecordType: 'ExtractedLabResult',
    affectedRecordId: 'lab-p1-1',
    details: 'Confirmed Fasting Blood Glucose = 102 mg/dL against source page 1.',
    previousValue: 'Status: unreviewed',
    newValue: 'Status: verified',
  },
  {
    id: 'audit-5',
    timestamp: '2026-08-02T15:32:00Z',
    action: 'Conflict Detected',
    user: 'MedLens Inconsistency Monitor',
    affectedRecordType: 'InformationConflict',
    affectedRecordId: 'conflict-demo-1',
    details: 'Flagged Penicillin allergy vs "No known allergies" in discharge document.',
  },
  {
    id: 'audit-6',
    timestamp: '2026-09-05T08:45:00Z',
    action: 'Report Uploaded',
    user: 'Care Navigator',
    affectedRecordType: 'MedicalReport',
    affectedRecordId: 'report-demo-1b',
    details: 'Uploaded CoreLab_Complete_Evaluation_Sep2026.pdf.',
  },
  {
    id: 'audit-7',
    timestamp: '2026-09-05T08:45:10Z',
    action: 'Information Extracted',
    user: 'MedLens Parser Engine',
    affectedRecordType: 'ExtractedLabResult',
    affectedRecordId: 'lab-p1-10',
    details: 'Extracted Vitamin D (25-OH) = 18.2 ng/mL. Flagged: Reference range unavailable in source report.',
  },
];

export const DEMO_AI_SUMMARIES: AISummary[] = [
  {
    id: 'summary-demo-1',
    patientId: 'patient-demo-1',
    summaryText: `The available medical record for Eleanor Vance contains information from 3 processed documents and intake records registered on 2026-03-01.

Across the analyzed reports, a total of 10 structured laboratory results have been organized. Of these, 6 values fall within the reference ranges specified in the source documents, while 3 values are reported outside the source-provided reference ranges.

Specific items where reported values differ from source reference ranges include: Fasting Blood Glucose (118 mg/dL vs source range 70 - 100 mg/dL), Total Cholesterol (228 mg/dL vs source range < 200 mg/dL), and Total Cholesterol in June 2026 (215 mg/dL). Hemoglobin has normalized to 12.4 g/dL from a previous 11.8 g/dL relative to the source reference range of 12.0 - 16.0 g/dL.

One laboratory test (Vitamin D, 25-Hydroxy, 18.2 ng/mL) does not include a reference range printed in the source document. MedLens adheres to clinical safety guidelines and does not apply generic reference ranges.

This summary is organized exclusively from available patient information and uploaded reports. Please consult your physician or qualified healthcare professional to interpret clinical significance and plan any medical care.`,
    keyObservations: [
      'Document observation: "Peripheral blood smear displays normocytic, normochromic erythrocytes with normal morphology."',
      'Document observation: "Routine fasting metabolic evaluation. Slightly elevated fasting blood glucose and mild borderline low hemoglobin noted."',
      'Bedside encounter note: "No known allergies (NKDA) recorded during intake bedside survey" (Conflicted with intake record).',
    ],
    outOfRangeFindings: [
      'The available report shows Fasting Blood Glucose reported at 118 mg/dL. Relative to the source-provided reference range (70 - 100), this value is labeled as HIGH.',
      'The available report shows Total Cholesterol reported at 228 mg/dL. Relative to the source-provided reference range (< 200), this value is labeled as HIGH.',
      'The available report shows Total Cholesterol (Jun 2026) reported at 215 mg/dL. Relative to the source-provided reference range (< 200), this value is labeled as HIGH.',
    ],
    missingOrUnclearInfo: [
      '1 laboratory test (Vitamin D (25-Hydroxy)) does not have a reference range printed in the source document. MedLens does not infer generic reference ranges.',
      '3 extracted results in the current evaluation are pending human review and verification.',
      'An allergy discrepancy between patient intake (Penicillin allergy) and acute care discharge note (NKDA) is awaiting human resolution.',
    ],
    nonDiagnosticDiscussionPoints: [
      'Discussion point: Review the 2 current lab values identified outside source reference ranges (Fasting Glucose and Cholesterol) with your physician.',
      'Discussion point: Review the Vitamin D test result (18.2 ng/mL) with your healthcare provider to establish appropriate individual target levels.',
      'Discussion point: Confirm documented drug allergy status (Penicillin) across all health system records.',
    ],
    generatedDate: '2026-09-05',
    sourceReportIds: ['report-demo-1a', 'report-demo-1b', 'report-demo-1c'],
    disclaimer: MANDATORY_SAFETY_DISCLAIMER,
    provenance: 'ai_generated',
  },
];
