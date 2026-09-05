import { Patient, MedicalReport, ExtractedLabResult, ReportObservation, AISummary } from '../types';

export const MANDATORY_SAFETY_DISCLAIMER = 
  'MedLens organizes and explains available medical information. It does not provide medical diagnosis or treatment recommendations. Consult a qualified healthcare professional for medical decisions.';

export function generateLocalAISummary(
  patient: Patient,
  reports: MedicalReport[],
  labResults: ExtractedLabResult[],
  observations: ReportObservation[]
): AISummary {
  const patientReports = reports.filter(r => r.patientId === patient.id);
  const patientLabs = labResults.filter(l => l.patientId === patient.id);
  const patientObs = observations.filter(o => o.patientId === patient.id);

  // Group out of range findings
  const outOfRange = patientLabs.filter(l => l.status === 'low' || l.status === 'high');
  const normalCount = patientLabs.filter(l => l.status === 'normal').length;
  const missingRangeLabs = patientLabs.filter(l => l.status === 'status_unavailable');
  const unverifiedCount = patientLabs.filter(l => l.verificationStatus === 'not_reviewed' || l.verificationStatus === 'needs_review').length;

  const outOfRangeFindings: string[] = outOfRange.map(lab => {
    return `The available report shows ${lab.testName} reported at ${lab.value} ${lab.unit}. Relative to the source-provided reference range (${lab.referenceRangeText}), this value is labeled as ${lab.status.toUpperCase()}.`;
  });

  const missingOrUnclearInfo: string[] = [];
  if (missingRangeLabs.length > 0) {
    missingOrUnclearInfo.push(
      `${missingRangeLabs.length} laboratory test(s) (${missingRangeLabs.map(l => l.testName).join(', ')}) do not have a reference range printed in the source document. MedLens does not infer generic reference ranges.`
    );
  }
  if (unverifiedCount > 0) {
    missingOrUnclearInfo.push(
      `${unverifiedCount} extracted result(s) are pending human review and verification.`
    );
  }
  if (patientReports.some(r => !r.reportDate)) {
    missingOrUnclearInfo.push('One or more uploaded reports do not have an explicitly detected collection date.');
  }

  const keyObservations: string[] = patientObs.slice(0, 4).map(o => {
    return `Document observation: "${o.observationText}" (Source snippet: ${o.sourceSnippet})`;
  });

  const nonDiagnosticDiscussionPoints: string[] = [];
  if (outOfRange.length > 0) {
    nonDiagnosticDiscussionPoints.push(
      `Discussion point: Review the ${outOfRange.length} test result(s) identified outside the source report's reference ranges with your physician.`
    );
  }
  if (patient.symptoms && patient.symptoms.length > 0) {
    nonDiagnosticDiscussionPoints.push(
      `Discussion point: Discuss ongoing symptoms (${patient.symptoms.join(', ')}) in relation to the reported laboratory findings.`
    );
  }
  if (patient.allergies && patient.allergies.length > 0) {
    nonDiagnosticDiscussionPoints.push(
      `Discussion point: Verify documented allergy profile (${patient.allergies.join(', ')}) against hospital clinical records.`
    );
  }

  // Construct patient-friendly, objective summary paragraphs
  const summaryParagraphs: string[] = [];
  summaryParagraphs.push(
    `The available medical record for ${patient.name} contains information from ${patientReports.length} processed document(s) and intake records registered on ${patient.registrationDate}.`
  );

  if (patientLabs.length > 0) {
    summaryParagraphs.push(
      `Across the analyzed reports, a total of ${patientLabs.length} structured laboratory results have been organized. Of these, ${normalCount} value(s) fall within the reference ranges specified in the source documents, while ${outOfRange.length} value(s) are outside the source-provided reference ranges.`
    );
  } else {
    summaryParagraphs.push('No structured laboratory values have been extracted yet for this patient.');
  }

  if (outOfRange.length > 0) {
    summaryParagraphs.push(
      `Specific items where reported values differ from source reference ranges include: ${outOfRange.map(l => `${l.testName} (${l.value} ${l.unit})`).join(', ')}. This information is recorded from the source document and is not a medical diagnosis.`
    );
  }

  summaryParagraphs.push(
    'This summary is organized exclusively from available patient information and uploaded reports. Please consult your physician or qualified healthcare professional to interpret clinical significance and plan any medical care.'
  );

  return {
    id: `summary-${patient.id}-${Date.now()}`,
    patientId: patient.id,
    summaryText: summaryParagraphs.join('\n\n'),
    keyObservations,
    outOfRangeFindings,
    missingOrUnclearInfo,
    nonDiagnosticDiscussionPoints,
    generatedDate: new Date().toISOString().split('T')[0],
    sourceReportIds: patientReports.map(r => r.id),
    disclaimer: MANDATORY_SAFETY_DISCLAIMER,
    provenance: 'ai_generated',
  };
}
