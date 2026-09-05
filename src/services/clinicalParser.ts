import { ExtractedLabResult, ReportObservation, LabStatus, ConfidenceLevel, ClarificationQuestion } from '../types';

export interface ParseReportResult {
  reportDate?: string;
  reportTypeEstimated?: string;
  labResults: Omit<ExtractedLabResult, 'id' | 'patientId' | 'reportId'>[];
  observations: Omit<ReportObservation, 'id' | 'patientId' | 'reportId'>[];
  clarificationQuestions: Omit<ClarificationQuestion, 'id' | 'patientId' | 'reportId'>[];
}

// Helper to safely parse numbers with decimals
function parseReportedNumber(valStr: string): number | undefined {
  if (!valStr) return undefined;
  const cleaned = valStr.replace(/[^\d.-]/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : num;
}

// Compare value against source reference range without inventing data
export function evaluateReferenceRange(
  valueStr: string,
  numericVal: number | undefined,
  rangeStr: string
): { status: LabStatus; confidence: ConfidenceLevel } {
  if (!rangeStr || rangeStr.toLowerCase().includes('unavailable') || rangeStr.trim() === '' || rangeStr === '-') {
    return {
      status: 'status_unavailable',
      confidence: 'medium',
    };
  }

  if (numericVal === undefined) {
    return {
      status: 'requires_review',
      confidence: 'low',
    };
  }

  const trimmedRange = rangeStr.trim();

  // Pattern: "min - max" or "min to max" or "min-max"
  const rangeMatch = trimmedRange.match(/([0-9.]+)\s*(?:-|–|—|to)\s*([0-9.]+)/i);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    if (!isNaN(min) && !isNaN(max)) {
      if (numericVal < min) return { status: 'low', confidence: 'high' };
      if (numericVal > max) return { status: 'high', confidence: 'high' };
      return { status: 'normal', confidence: 'high' };
    }
  }

  // Pattern: "< max" or "<= max" or "less than max"
  const lessMatch = trimmedRange.match(/(?:<|<=|less than)\s*([0-9.]+)/i);
  if (lessMatch) {
    const max = parseFloat(lessMatch[1]);
    if (!isNaN(max)) {
      if (numericVal > max) return { status: 'high', confidence: 'high' };
      return { status: 'normal', confidence: 'high' };
    }
  }

  // Pattern: "> min" or ">= min" or "greater than min"
  const greaterMatch = trimmedRange.match(/(?:>|>=|greater than)\s*([0-9.]+)/i);
  if (greaterMatch) {
    const min = parseFloat(greaterMatch[1]);
    if (!isNaN(min)) {
      if (numericVal < min) return { status: 'low', confidence: 'high' };
      return { status: 'normal', confidence: 'high' };
    }
  }

  // If qualitative range, e.g. "Negative", "Non-reactive", "Normal"
  const qual = trimmedRange.toLowerCase();
  const valLower = valueStr.toLowerCase();
  if (qual.includes('negative') || qual.includes('non-reactive') || qual.includes('normal')) {
    if (valLower.includes('negative') || valLower.includes('non-reactive') || valLower.includes('normal')) {
      return { status: 'normal', confidence: 'high' };
    } else if (valLower.includes('positive') || valLower.includes('reactive') || valLower.includes('abnormal')) {
      return { status: 'high', confidence: 'high' };
    }
  }

  return {
    status: 'requires_review',
    confidence: 'medium',
  };
}

// Parse plain text or OCR output from medical reports
export function parseMedicalReportText(text: string): ParseReportResult {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const labResults: Omit<ExtractedLabResult, 'id' | 'patientId' | 'reportId'>[] = [];
  const observations: Omit<ReportObservation, 'id' | 'patientId' | 'reportId'>[] = [];
  const clarificationQuestions: Omit<ClarificationQuestion, 'id' | 'patientId' | 'reportId'>[] = [];

  let reportDate: string | undefined = undefined;
  let inObservationSection = false;

  // Regex for dates
  const dateRegex = /(?:Date of Report|Report Date|Collected|Specimen Date|Date|Exam Date)[\s:]+([0-9]{1,2}[-\/][0-9]{1,2}[-\/][0-9]{2,4}|[0-9]{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+[0-9]{4}|[0-9]{4}-[0-9]{2}-[0-9]{2})/i;

  // Regex for known observation headers
  const obsHeaderRegex = /^(?:IMPRESSION|FINDINGS|OBSERVATIONS|SUMMARY|CLINICAL NOTES|COMMENTS|RECOMMENDATIONS|REMARKS)[\s:]*(.*)$/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check date
    if (!reportDate) {
      const dMatch = line.match(dateRegex);
      if (dMatch && dMatch[1]) {
        reportDate = dMatch[1].trim();
      }
    }

    // Check observation headers
    const obsHeaderMatch = line.match(obsHeaderRegex);
    if (obsHeaderMatch) {
      inObservationSection = true;
      if (obsHeaderMatch[1] && obsHeaderMatch[1].trim().length > 3) {
        observations.push({
          observationText: obsHeaderMatch[1].trim(),
          sourceSnippet: line,
          date: reportDate,
          provenance: 'extracted_from_report',
          verificationStatus: 'not_reviewed',
        });
      }
      continue;
    }

    if (inObservationSection) {
      // If we encounter a table header or lab line, stop observation section
      if (line.match(/^(?:Test|Analyte|Component|Parameter)\s+/i) || line.match(/^[A-Z][a-zA-Z\s]{2,25}\s+[0-9.]+\s+[a-zA-Z/%]/)) {
        inObservationSection = false;
      } else {
        if (line.length > 5 && !line.startsWith('---')) {
          observations.push({
            observationText: line,
            sourceSnippet: line,
            date: reportDate,
            provenance: 'extracted_from_report',
            verificationStatus: 'not_reviewed',
          });
          continue;
        }
      }
    }

    // Attempt to parse tabular / structured lab lines
    // Example formats:
    // 1. Hemoglobin 12.4 g/dL 12.0 - 16.0
    // 2. Glucose | 118 | mg/dL | 70 - 100 | High
    // 3. WBC Count: 11.2 x10^3/uL (4.5 - 11.0)
    // 4. Vitamin D (25-OH) 18.4 ng/mL
    const parsedLab = parseLabLine(line, i + 1);
    if (parsedLab) {
      labResults.push(parsedLab);

      if (parsedLab.status === 'status_unavailable') {
        clarificationQuestions.push({
          question: `The report records "${parsedLab.testName}" with value ${parsedLab.value} ${parsedLab.unit}, but no reference range was provided in the source report. Would you like to review the source document?`,
          context: `Extracted from "${parsedLab.sourceSnippet}". MedLens strictly avoids generic or invented reference ranges.`,
          answered: false,
        });
      } else if (parsedLab.status === 'requires_review') {
        clarificationQuestions.push({
          question: `The reference range for "${parsedLab.testName}" (${parsedLab.referenceRangeText}) could not be interpreted with high confidence. Please verify the value against the source report.`,
          context: `Reported value: ${parsedLab.value} ${parsedLab.unit}`,
          answered: false,
        });
      }
    } else {
      // Check if this is an explicit pending test or unmeasured vital sign
      const pendingMatch = line.match(/^([a-zA-Z0-9\s()\/,.-]+?)\s+(?:Not provided|Pending source report|Requires clinical measurement)\b/i);
      if (pendingMatch && !line.startsWith('---') && !line.toLowerCase().includes('sample report')) {
        const param = pendingMatch[1].trim();
        if (
          param.length > 2 &&
          /[a-zA-Z]/.test(param) &&
          !param.startsWith('/') &&
          !/^(?:Measurement|Test|Category|Date|Page|Important)/i.test(param)
        ) {
          observations.push({
            observationText: `Documented Status: ${param} — Result: Not provided (${line.includes('Pending') ? 'Pending source report' : 'Requires clinical measurement'})`,
            sourceSnippet: line,
            date: reportDate,
            provenance: 'extracted_from_report',
            verificationStatus: 'not_reviewed',
          });
        }
      }
    }
  }

  if (!reportDate) {
    clarificationQuestions.push({
      question: `The report date could not be automatically determined from the document header. Please verify the clinical specimen or report date.`,
      context: `Report date defaults to upload date until confirmed by user.`,
      answered: false,
    });
  }

  return {
    reportDate,
    labResults,
    observations,
    clarificationQuestions,
  };
}

// Heuristic parser for individual lab line
function parseLabLine(
  line: string,
  lineNumber: number
): Omit<ExtractedLabResult, 'id' | 'patientId' | 'reportId'> | null {
  // Ignore header rows
  if (/^(?:Test Name|Component|Analyte|Investigation|Parameter|Test\s+Result)/i.test(line)) {
    return null;
  }
  if (/^(?:Patient|Doctor|Physician|Age|Sex|Hospital|Clinic|Specimen|Collected|Reported|Page)/i.test(line)) {
    return null;
  }

  // Reject PDF structural markers, postscript bytecodes, and formatting artifacts
  if (
    line.startsWith('/') ||
    line.startsWith('<<') ||
    line.startsWith('>>') ||
    line.includes('/Contents') ||
    line.includes('/MediaBox') ||
    line.includes('/Parent') ||
    line.includes('/Font') ||
    line.includes('/Info') ||
    line.includes('/Root') ||
    line.includes('/Size') ||
    line.includes('c2pa') ||
    line.includes('jumb') ||
    line.includes('cbor') ||
    line.includes('manifest') ||
    line.includes('sha256') ||
    /[\uFFFD\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/.test(line)
  ) {
    return null;
  }
  if (/(?:^|\s)(?:obj|endobj|xref|trailer|stream|endstream|MediaBox|CropBox|ProcSet|Rotate|Length|Filter|DecodeParms)(?:\s|$|\/)/i.test(line)) {
    return null;
  }

  // Try pipe-separated table: Test | Value | Unit | Range | ...
  if (line.includes('|')) {
    const parts = line.split('|').map(s => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const testName = parts[0];
      const valStr = parts[1];
      const numVal = parseReportedNumber(valStr);
      if (numVal !== undefined || /^(?:Positive|Negative|Reactive|Non-reactive|Clear|Cloudy)$/i.test(valStr)) {
        const unit = parts.length > 2 && !isRangeLike(parts[2]) ? parts[2] : '';
        const rangeIndex = parts.length > 3 ? 3 : (parts.length > 2 && isRangeLike(parts[2]) ? 2 : -1);
        const refRange = rangeIndex !== -1 ? parts[rangeIndex] : 'Reference range unavailable in source report';
        
        const { status, confidence } = evaluateReferenceRange(valStr, numVal, refRange);

        return {
          testName,
          value: valStr,
          numericValue: numVal,
          unit,
          referenceRangeText: refRange,
          status,
          sourceSnippet: line,
          sourceLocation: `Line ${lineNumber}`,
          provenance: 'extracted_from_report',
          confidence,
          verificationStatus: 'not_reviewed',
          originalExtractedValue: valStr,
        };
      }
    }
  }

  // Space-separated or tab-separated regex:
  // e.g., "Hemoglobin  12.4  g/dL  12.0 - 16.0"
  // e.g., "Fasting Blood Glucose: 118 mg/dL [70 - 100]"
  // e.g., "Platelets 95 10^3/uL 150 - 450 Low"
  // e.g., "Vitamin D (25-OH) 18.2 ng/mL"
  const regex = /^([a-zA-Z0-9\s()\/,.-]+?)[\s:=]+([0-9]+(?:\.[0-9]+)?|[<>]?\s*[0-9]+(?:\.[0-9]+)?)\s*([a-zA-Z\/%^0-9*-]+)?(?:\s+(?:\[|\()?([0-9.<>=\s–—\-to]+)(?:\]|\)))?(?:\s+(?:\[|\()?([0-9.<>=\s–—\-to]+)(?:\]|\)))?(?:\s+(?:Low|High|Normal|Abnormal|Crit|L|H))?$/i;

  const match = line.match(regex);
  if (match) {
    const rawName = match[1].trim();
    const valStr = match[2].trim();
    const numVal = parseReportedNumber(valStr);

    // Filter out obvious false positives like "Page 1", phone numbers, pure digits, or PDF metadata
    if (
      rawName.length < 2 ||
      !/[a-zA-Z]/.test(rawName) ||
      rawName.startsWith('/') ||
      rawName.includes('/') ||
      /^(?:Page|Tel|Fax|MRN|Room|Bed|Time|Order|Ref|Font|Contents|MediaBox|Parent|Type|Length|Filter)$/i.test(rawName)
    ) {
      return null;
    }

    const unit = match[3] ? match[3].trim() : '';
    // Candidate range could be match 4 or 5
    let refRange = match[4] || match[5] || '';
    refRange = refRange.trim();

    if (!refRange || !isRangeLike(refRange)) {
      // Check if remainder of line after unit has range like "12.0 - 16.0"
      const afterUnit = line.substring(line.indexOf(valStr) + valStr.length);
      const subRangeMatch = afterUnit.match(/([0-9.]+\s*(?:-|–|—|to)\s*[0-9.]+|[<>=]\s*[0-9.]+)/);
      if (subRangeMatch) {
        refRange = subRangeMatch[1].trim();
      } else {
        refRange = 'Reference range unavailable in source report';
      }
    }

    const { status, confidence } = evaluateReferenceRange(valStr, numVal, refRange);

    return {
      testName: rawName,
      value: valStr,
      numericValue: numVal,
      unit,
      referenceRangeText: refRange,
      status,
      sourceSnippet: line,
      sourceLocation: `Line ${lineNumber}`,
      provenance: 'extracted_from_report',
      confidence,
      verificationStatus: 'not_reviewed',
      originalExtractedValue: valStr,
    };
  }

  return null;
}

function isRangeLike(str: string): boolean {
  if (!str) return false;
  return /([0-9.]+\s*(?:-|–|—|to)\s*[0-9.]+|[<>=]\s*[0-9.]+)/i.test(str);
}
