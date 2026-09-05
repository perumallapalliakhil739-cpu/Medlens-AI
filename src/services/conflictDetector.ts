import { Patient, MedicalReport, ExtractedLabResult, ReportObservation, InformationConflict } from '../types';

export function detectInformationConflicts(
  patient: Patient,
  reports: MedicalReport[],
  _labResults: ExtractedLabResult[],
  observations: ReportObservation[]
): InformationConflict[] {
  const conflicts: InformationConflict[] = [];

  // 1. Allergy Conflict Detection
  // Check if patient intake lists allergies (e.g. Penicillin) but report states "No known allergies" or "NKDA"
  if (patient.allergies && patient.allergies.length > 0) {
    const nkdaRegex = /(?:no known allergies|nkda|no drug allergies|denies allergies|allergies:\s*none|nil known)/i;
    
    for (const obs of observations) {
      if (nkdaRegex.test(obs.observationText) || nkdaRegex.test(obs.sourceSnippet)) {
        const report = reports.find(r => r.id === obs.reportId);
        conflicts.push({
          id: `conflict-allergy-${obs.reportId}`,
          patientId: patient.id,
          category: 'allergy',
          title: 'Allergy Record Inconsistency',
          description: 'Potential information conflict detected between patient intake and uploaded report regarding allergy status.',
          sourceA: {
            name: 'Patient Intake Registration',
            value: `Reported Allergies: ${patient.allergies.join(', ')}`,
            date: patient.registrationDate,
            type: 'User Provided Intake',
          },
          sourceB: {
            name: report ? report.fileName : 'Uploaded Report Note',
            value: `Recorded: "${obs.observationText}"`,
            date: report?.reportDate || report?.uploadDate,
            type: 'Extracted from Report',
          },
          status: 'unresolved',
        });
      }
    }

    for (const report of reports) {
      if (nkdaRegex.test(report.sourceText)) {
        const alreadyAdded = conflicts.some(c => c.id === `conflict-allergy-${report.id}`);
        if (!alreadyAdded) {
          conflicts.push({
            id: `conflict-allergy-${report.id}`,
            patientId: patient.id,
            category: 'allergy',
            title: 'Allergy Record Inconsistency',
            description: 'Potential information conflict detected. Patient intake lists active drug allergies while uploaded clinical note states "No known allergies / NKDA".',
            sourceA: {
              name: 'Patient Intake',
              value: `Active Allergies: ${patient.allergies.join(', ')}`,
              date: patient.registrationDate,
              type: 'User Provided',
            },
            sourceB: {
              name: report.fileName,
              value: 'Document contains text: "No known allergies" / NKDA',
              date: report.reportDate || report.uploadDate,
              type: 'Source Document Text',
            },
            status: 'unresolved',
          });
        }
      }
    }
  }

  // 2. Medication Conflict Detection
  // Check if intake lists medications, but report states "No active medications" or specifies medication was held/discontinued
  if (patient.currentMedications && patient.currentMedications.length > 0) {
    const noMedsRegex = /(?:no regular medications|no current medications|denies medications|medications:\s*none)/i;
    for (const report of reports) {
      if (noMedsRegex.test(report.sourceText)) {
        conflicts.push({
          id: `conflict-med-${report.id}`,
          patientId: patient.id,
          category: 'medication',
          title: 'Medication List Discrepancy',
          description: 'Potential information conflict detected between intake medication list and clinical report text.',
          sourceA: {
            name: 'Patient Intake Medications',
            value: patient.currentMedications.map(m => `${m.name} ${m.dosage || ''}`).join(', '),
            date: patient.registrationDate,
            type: 'User Provided',
          },
          sourceB: {
            name: report.fileName,
            value: 'Document contains note: "No active medications"',
            date: report.reportDate || report.uploadDate,
            type: 'Extracted from Report',
          },
          status: 'unresolved',
        });
      }
    }
  }

  // 3. Condition Conflict
  if (patient.existingConditions && patient.existingConditions.length > 0) {
    const noHistoryRegex = /(?:no past medical history|unremarkable past medical history|no chronic illnesses)/i;
    for (const report of reports) {
      if (noHistoryRegex.test(report.sourceText)) {
        conflicts.push({
          id: `conflict-cond-${report.id}`,
          patientId: patient.id,
          category: 'condition',
          title: 'Past Medical History Inconsistency',
          description: 'Intake lists existing conditions, but uploaded record states no significant past medical history.',
          sourceA: {
            name: 'Patient Intake Conditions',
            value: patient.existingConditions.join(', '),
            date: patient.registrationDate,
            type: 'User Provided',
          },
          sourceB: {
            name: report.fileName,
            value: 'Clinical note records no past medical history',
            date: report.reportDate || report.uploadDate,
            type: 'Extracted from Report',
          },
          status: 'unresolved',
        });
      }
    }
  }

  return conflicts;
}
