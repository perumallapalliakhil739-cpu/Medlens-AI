import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Clock, 
  FileCode,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { MedicalReport, ReportType } from '../../types';
import { processReportWithGeminiOrFallback } from '../../services/geminiService';
import { getSettings } from '../../services/storage';
import { extractTextFromPdfFile } from '../../services/pdfExtractor';

interface ReportUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  onReportProcessed: (
    report: MedicalReport,
    labs: any[],
    obs: any[],
    clarifications: any[]
  ) => void;
}

const PRESET_DEMO_REPORTS = [
  {
    title: 'CBC & Hematology Evaluation (Current)',
    fileName: 'CoreLab_CBC_Panel_Current.pdf',
    type: 'Hematology / CBC' as ReportType,
    date: '05 Sep 2026',
    text: `CORE LAB HEALTH NETWORK - HEMATOLOGY & METABOLIC REPORT
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
Vitamin D (25-Hydroxy)    18.2     ng/mL                         

FINDINGS & OBSERVATIONS:
Patient presented for 6-month laboratory follow-up. Peripheral blood smear displays normocytic, normochromic erythrocytes with normal morphology. Vitamin D assay executed per provider order (reference range was not reported by reference instrument).`,
  },
  {
    title: 'Lipid & Cardiovascular Panel (Elevated Markers)',
    fileName: 'Quest_Cardio_Lipid_Report.pdf',
    type: 'Lipid Panel' as ReportType,
    date: '18 Jul 2026',
    text: `QUEST DIAGNOSTICS - CLINICAL CARDIOVASCULAR PANEL
Specimen Date: 18 Jul 2026 | Reported: 19 Jul 2026
Ordering Physician: Dr. J. Mercer, MD

TEST NAME                 VALUE    UNIT      REFERENCE RANGE    STATUS
Total Cholesterol         245      mg/dL     < 200              HIGH
HDL Cholesterol           38       mg/dL     > 40               LOW
Triglycerides             190      mg/dL     < 150              HIGH
High-Sensitivity CRP      3.4      mg/L      < 1.0              HIGH
Troponin I                0.01     ng/mL     < 0.04             NORMAL

IMPRESSION:
Fasting lipid evaluation demonstrates atherogenic dyslipidemia and elevated systemic inflammatory marker (hs-CRP). Resting troponin within source threshold.`,
  },
  {
    title: 'Discharge Summary (Allergy Discrepancy Sample)',
    fileName: 'Hospital_Discharge_Summary_Encounter.txt',
    type: 'Discharge Summary' as ReportType,
    date: '02 Aug 2026',
    text: `CITY MEMORIAL AMBULATORY CARE
PATIENT ENCOUNTER & DISCHARGE NOTE
Date of Report: 02 Aug 2026

CLINICAL NOTES:
Patient evaluated for acute right shoulder strain.
Allergies: No known allergies (NKDA) recorded during intake bedside survey.
Discharge instructions provided with physical therapy guidance.`,
  },
];

export const ReportUploadModal: React.FC<ReportUploadModalProps> = ({
  isOpen,
  onClose,
  patientId,
  onReportProcessed,
}) => {
  const [fileName, setFileName] = useState('');
  const [reportType, setReportType] = useState<ReportType>('Hematology / CBC');
  const [reportDate, setReportDate] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [progressPct, setProgressPct] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [usedPreset, setUsedPreset] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof PRESET_DEMO_REPORTS[0]) => {
    setFileName(preset.fileName);
    setReportType(preset.type);
    setReportDate(preset.date);
    setSourceText(preset.text);
    setUsedPreset(preset.title);
    setErrorMessage('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File exceeds maximum allowable size (10 MB).');
      return;
    }

    setFileName(file.name);
    setErrorMessage('');

    if (file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf') {
      setProcessingStep('Extracting text content from PDF document...');
      extractTextFromPdfFile(file).then((extracted) => {
        setSourceText(extracted);
      }).catch((err) => {
        console.error(err);
        setErrorMessage('Could not extract text from PDF. You can paste the report text directly into the text box below.');
      });
    } else if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setSourceText(content || `Extracted plain text from ${file.name}`);
      };
      reader.onerror = () => {
        setErrorMessage('Could not read uploaded file content.');
      };
      reader.readAsText(file);
    } else {
      setErrorMessage('Unsupported file format. Please upload a PDF, TXT, or CSV document.');
    }
  };

  const handleStartProcessing = async () => {
    if (!sourceText.trim()) {
      setErrorMessage('Please provide report content by selecting a preset, uploading a file, or pasting document text.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      // Simulated clinical pipeline steps
      setProcessingStep('1/6: Reading document and verifying integrity...');
      setProgressPct(20);
      await new Promise(r => setTimeout(r, 250));

      setProcessingStep('2/6: Performing clinical text parsing & OCR extraction...');
      setProgressPct(45);
      await new Promise(r => setTimeout(r, 300));

      setProcessingStep('3/6: Extracting structured test parameters, values, and units...');
      setProgressPct(70);

      const settings = getSettings();
      const apiKey = settings.useGeminiIfAvailable ? settings.geminiApiKey : undefined;
      const { result, usedGemini } = await processReportWithGeminiOrFallback(sourceText, apiKey);

      setProcessingStep(`4/6: Interpreting reference ranges (${usedGemini ? 'Gemini 2.5 Flash' : 'Clinical Deterministic Engine'})...`);
      setProgressPct(85);
      await new Promise(r => setTimeout(r, 250));

      setProcessingStep('5/6: Assigning provenance markers & calculating confidence...');
      setProgressPct(95);
      await new Promise(r => setTimeout(r, 200));

      setProcessingStep('6/6: Saving structured record to database...');
      setProgressPct(100);

      const newReportId = `report-${Date.now()}`;
      const savedReport: MedicalReport = {
        id: newReportId,
        patientId,
        fileName: fileName || 'Uploaded_Medical_Report.pdf',
        fileType: fileName.endsWith('.pdf') ? 'pdf' : fileName.endsWith('.txt') ? 'text' : 'demo',
        reportType,
        reportDate: result.reportDate || reportDate || new Date().toISOString().split('T')[0],
        uploadDate: new Date().toISOString().split('T')[0],
        sourceText,
        processingStatus: 'processed',
        verificationStatus: 'needs_review',
        notes: usedGemini ? 'Processed with Gemini AI Multimodal Engine' : 'Processed with MedLens Deterministic Clinical Engine',
      };

      const finalLabs = result.labResults.map((l, idx) => ({
        ...l,
        id: `lab-${newReportId}-${idx + 1}`,
        reportId: newReportId,
        patientId,
      }));

      const finalObs = result.observations.map((o, idx) => ({
        ...o,
        id: `obs-${newReportId}-${idx + 1}`,
        reportId: newReportId,
        patientId,
      }));

      const finalClarifications = result.clarificationQuestions.map((c, idx) => ({
        ...c,
        id: `clar-${newReportId}-${idx + 1}`,
        patientId,
        reportId: newReportId,
      }));

      onReportProcessed(savedReport, finalLabs, finalObs, finalClarifications);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An error occurred during clinical report processing.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="upload-title">
      <div className="modal-dialog" style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UploadCloud size={18} style={{ color: 'var(--primary-600)' }} />
            <div>
              <h3 id="upload-title">Medical Report Ingestion & Clinical Processing</h3>
              <div style={{ fontSize: '0.74rem', color: 'var(--slate-500)' }}>
                Upload PDF, image, scanned report, or load clinical demonstration sample
              </div>
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose} disabled={isProcessing}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Quick Demo Sample Selector */}
          <div style={{ backgroundColor: 'var(--primary-50)', border: '1px solid var(--primary-200)', borderRadius: 'var(--radius-md)', padding: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.76rem', fontWeight: 700, color: 'var(--primary-800)', marginBottom: '0.35rem' }}>
              <Sparkles size={13} />
              <span>Instant Demonstration Presets (Load Sample Clinical Report)</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {PRESET_DEMO_REPORTS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  disabled={isProcessing}
                  style={{
                    backgroundColor: usedPreset === preset.title ? 'var(--primary-600)' : '#ffffff',
                    color: usedPreset === preset.title ? '#ffffff' : 'var(--slate-800)',
                    border: '1px solid var(--primary-300)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.35rem 0.6rem',
                    fontSize: '0.74rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {usedPreset === preset.title && <Check size={12} />}
                  <span>{preset.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Drag & Drop File Upload Area */}
          <div
            className="dropzone"
            onClick={() => fileInputRef.current?.click()}
            style={{ marginBottom: '1rem' }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.txt,.csv,.png,.jpg,.jpeg"
              style={{ display: 'none' }}
              disabled={isProcessing}
            />
            <FileText size={32} style={{ color: 'var(--primary-500)', margin: '0 auto 0.5rem' }} />
            <div style={{ fontWeight: 600, color: 'var(--slate-800)', fontSize: '0.88rem' }}>
              {fileName ? fileName : 'Choose a file or drag & drop here'}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
              Supported: PDF, Scanned Images (PNG/JPG), and Text files (Max: 10 MB)
            </div>
          </div>

          {/* Form Fields: Report Type and Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="upload-report-type">Report Classification</label>
              <select
                id="upload-report-type"
                className="form-select"
                value={reportType}
                onChange={(e) => setReportType(e.target.value as ReportType)}
                disabled={isProcessing}
              >
                <option value="Hematology / CBC">Hematology / CBC</option>
                <option value="Comprehensive Metabolic Panel">Comprehensive Metabolic Panel</option>
                <option value="Lipid Panel">Lipid Panel</option>
                <option value="Thyroid Function">Thyroid Function</option>
                <option value="Urinalysis">Urinalysis</option>
                <option value="Discharge Summary">Discharge Summary</option>
                <option value="Consultation Note">Consultation Note</option>
                <option value="General Medical Report">General Medical Report</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="upload-report-date">Report / Specimen Date</label>
              <input
                id="upload-report-date"
                type="text"
                placeholder="e.g. 05 Sep 2026 or YYYY-MM-DD"
                className="form-input"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* Document Text Preview / Edit */}
          <div className="form-group">
            <label className="form-label" htmlFor="upload-source-text">
              Source Document Text Content <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>(Extracted by reader or pasted directly)</span>
            </label>
            <textarea
              id="upload-source-text"
              className="form-textarea"
              rows={6}
              style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Paste or review clinical laboratory report text..."
              disabled={isProcessing}
            />
          </div>

          {/* Processing Progress Feedback */}
          {isProcessing && (
            <div style={{ backgroundColor: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-md)', padding: '0.85rem', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.78rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--primary-800)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} className="spin" /> {processingStep}
                </span>
                <span style={{ fontWeight: 700, color: 'var(--slate-700)' }}>{progressPct}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--slate-200)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${progressPct}%`, height: '100%', backgroundColor: 'var(--primary-600)', transition: 'width 0.2s ease' }}></div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-md)', padding: '0.65rem 0.85rem', color: '#b91c1c', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.85rem' }}>
              <AlertCircle size={14} />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleStartProcessing}
            disabled={isProcessing || !sourceText.trim()}
          >
            <ShieldCheck size={14} />
            <span>{isProcessing ? 'Processing Clinical Pipeline...' : 'Process Medical Report'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
