import { GoogleGenAI } from '@google/genai';
import { parseMedicalReportText, ParseReportResult } from './clinicalParser';
import { Patient, MedicalReport, ExtractedLabResult, ReportObservation, AISummary } from '../types';
import { generateLocalAISummary, MANDATORY_SAFETY_DISCLAIMER } from './aiSummaryEngine';

export async function processReportWithGeminiOrFallback(
  text: string,
  apiKey?: string
): Promise<{ result: ParseReportResult; usedGemini: boolean }> {
  if (!apiKey || apiKey.trim().length < 5) {
    // Fallback to our local clinical parser
    const localResult = parseMedicalReportText(text);
    return { result: localResult, usedGemini: false };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    const prompt = `You are MedLens Clinical Information Intelligence, a tool that organizes and structures medical reports.
Extract all laboratory test results, values, units, reference ranges, and observations from the medical text below.

MANDATORY SAFETY RULES:
1. Never invent or assume reference ranges. If the document does not explicitly provide a reference range for a test, set "referenceRangeText" to "Reference range unavailable in source report".
2. Never invent test results, values, or observations.
3. Never provide medical diagnoses, prescriptions, or treatment recommendations.
4. Output strictly valid JSON matching this schema:
{
  "reportDate": "string (e.g. 12 Jun 2026 or YYYY-MM-DD) or null",
  "labResults": [
    {
      "testName": "string",
      "value": "string",
      "unit": "string",
      "referenceRangeText": "string",
      "sourceSnippet": "exact line from document"
    }
  ],
  "observations": [
    {
      "observationText": "string",
      "sourceSnippet": "exact line from document"
    }
  ]
}

DOCUMENT TEXT:
"""
${text}
"""`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error('Empty response from Gemini');
    }

    const parsedJson = JSON.parse(outputText);
    
    // Convert to ParseReportResult
    const localFallback = parseMedicalReportText(text);
    
    // If Gemini extracted lab results, map them and evaluate ranges safely
    if (Array.isArray(parsedJson.labResults) && parsedJson.labResults.length > 0) {
      const mappedLabs = parsedJson.labResults.map((item: any, idx: number) => {
        const valStr = String(item.value || '').trim();
        const numVal = parseFloat(valStr.replace(/[^\d.-]/g, ''));
        const refRange = item.referenceRangeText && item.referenceRangeText.trim() !== ''
          ? item.referenceRangeText
          : 'Reference range unavailable in source report';
        
        // Evaluate reference range status using our deterministic logic
        const evalResult = parseMedicalReportText(`${item.testName} ${valStr} ${item.unit || ''} ${refRange}`);
        const status = evalResult.labResults[0]?.status || (refRange.includes('unavailable') ? 'status_unavailable' : 'requires_review');

        return {
          testName: item.testName,
          value: valStr,
          numericValue: isNaN(numVal) ? undefined : numVal,
          unit: item.unit || '',
          referenceRangeText: refRange,
          status: status,
          sourceSnippet: item.sourceSnippet || `${item.testName}: ${valStr} ${item.unit}`,
          sourceLocation: `Item ${idx + 1}`,
          provenance: 'extracted_from_report' as const,
          confidence: 'high' as const,
          verificationStatus: 'not_reviewed' as const,
          originalExtractedValue: valStr,
        };
      });

      const mappedObs = Array.isArray(parsedJson.observations) 
        ? parsedJson.observations.map((obs: any) => ({
            observationText: obs.observationText,
            sourceSnippet: obs.sourceSnippet || obs.observationText,
            date: parsedJson.reportDate || undefined,
            provenance: 'extracted_from_report' as const,
            verificationStatus: 'not_reviewed' as const,
          }))
        : localFallback.observations;

      return {
        result: {
          reportDate: parsedJson.reportDate || localFallback.reportDate,
          labResults: mappedLabs,
          observations: mappedObs,
          clarificationQuestions: localFallback.clarificationQuestions,
        },
        usedGemini: true,
      };
    }

    // If Gemini JSON had 0 labs, fall back to local parser
    return { result: localFallback, usedGemini: false };
  } catch (err) {
    console.warn('Gemini processing failed or key invalid, using local parser:', err);
    const localResult = parseMedicalReportText(text);
    return { result: localResult, usedGemini: false };
  }
}

export async function generateAISummaryWithGeminiOrFallback(
  patient: Patient,
  reports: MedicalReport[],
  labResults: ExtractedLabResult[],
  observations: ReportObservation[],
  apiKey?: string
): Promise<{ summary: AISummary; usedGemini: boolean }> {
  if (!apiKey || apiKey.trim().length < 5) {
    return {
      summary: generateLocalAISummary(patient, reports, labResults, observations),
      usedGemini: false,
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    const prompt = `You are MedLens Clinical Information Intelligence.
Generate a patient-friendly, objective medical information summary for patient: ${patient.name}, Age: ${patient.age}, Sex: ${patient.sex}.
Symptoms: ${patient.symptoms.join(', ') || 'None recorded'}.
Allergies: ${patient.allergies.join(', ') || 'None recorded'}.

LABORATORY RESULTS AVAILABLE:
${labResults.map(l => `- ${l.testName}: ${l.value} ${l.unit} (Source Reference Range: ${l.referenceRangeText}, Status: ${l.status})`).join('\n')}

REPORT OBSERVATIONS:
${observations.map(o => `- ${o.observationText}`).join('\n')}

STRICT COMPLIANCE RULES:
1. Do NOT provide any diagnosis (e.g. do NOT say "You have diabetes", "Patient suffers from anemia").
2. Do NOT recommend treatments, drugs, or dosage changes.
3. Use objective, transparent phrasing like "The available report shows...", "The reported value is outside the reference range provided in the source report.", "This information may be worth discussing with a qualified healthcare professional."
4. Format output strictly as JSON with this schema:
{
  "summaryText": "2-3 well structured objective paragraphs",
  "keyObservations": ["string"],
  "outOfRangeFindings": ["string"],
  "missingOrUnclearInfo": ["string"],
  "nonDiagnosticDiscussionPoints": ["string"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.summaryText) {
      return {
        summary: {
          id: `summary-${patient.id}-${Date.now()}`,
          patientId: patient.id,
          summaryText: parsed.summaryText,
          keyObservations: parsed.keyObservations || [],
          outOfRangeFindings: parsed.outOfRangeFindings || [],
          missingOrUnclearInfo: parsed.missingOrUnclearInfo || [],
          nonDiagnosticDiscussionPoints: parsed.nonDiagnosticDiscussionPoints || [],
          generatedDate: new Date().toISOString().split('T')[0],
          sourceReportIds: reports.map(r => r.id),
          disclaimer: MANDATORY_SAFETY_DISCLAIMER,
          provenance: 'ai_generated',
        },
        usedGemini: true,
      };
    }
  } catch (err) {
    console.warn('Gemini summary generation failed, falling back to local engine:', err);
  }

  return {
    summary: generateLocalAISummary(patient, reports, labResults, observations),
    usedGemini: false,
  };
}
