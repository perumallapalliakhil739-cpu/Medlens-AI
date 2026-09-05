# MedLens — AI Clinical Information Intelligence

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **IMPORTANT MEDICAL NOTICE & SAFETY DISCLAIMER:**  
> **MedLens is an information organization, translation, and review tool.**  
> It is **NOT** a diagnostic system, treatment recommendation system, or replacement for certified medical judgment. It helps healthcare professionals and patients organize fragmented health records, verify lab findings against document provenance, flag contradictions, and understand clinical terminology without making clinical diagnoses or treatment directives.

---

## 🔬 Overview

Modern medical care often leaves patient health data scattered across fragmented PDFs, handwritten intake sheets, disparate lab portals, and discharge summaries. 

**MedLens** transforms this chaotic documentation into a **structured, understandable, traceable, and reviewable clinical health record** through:
- **Zero-Assumption Reference Ranges**: Never invents ranges, never assumes missing ranges are "normal", and never silently converts units.
- **Bi-directional Provenance Tracking**: Every extracted lab value, observation, and note links directly to its source line and snippet in the original uploaded document.
- **Cross-Document Conflict Detection**: Automatically identifies discrepancies (such as intake allergy vs discharge note declaring "NKDA", or conflicting medication dosages).
- **Human-in-the-Loop Verification**: Flagged items require clinician verification, with a full cryptographic-style audit trail logging who verified, edited, or rejected values.
- **Dual-Perspective Clinical Intelligence**: Formulates objective clinical overviews for healthcare providers and translated, jargon-free explanations for patients.

---

## ✨ Key Features

### 1. Robust Document Ingestion & Spatial PDF Parser
- In-browser PDF extraction powered by bundled `pdfjs-dist` with local Web Worker execution (100% offline capable, zero external CDN dependencies).
- Fallback postscript/bytecode sanitizer to prevent raw metadata from corrupting clinical records.
- Supports PDF lab reports, plain text clinical notes, discharge summaries, and CSV tables.

### 2. Clinical Parser & Reference Range Engine
- Deterministic heuristic parser that identifies test parameters, reported values, units, and source reference intervals.
- Handles standard inequalities (`< 200`, `> 40`), ranges (`12.0 - 16.0`), and qualitative outcomes (`Negative`, `Non-reactive`).
- Unambiguously categorizes findings into `Normal`, `Low`, `High`, `Status Unavailable`, or `Requires Review`.

### 3. Traceable Side-by-Side Source Inspector
- Inspect any extracted lab result side-by-side with its raw source text.
- Contextual snippet highlighting shows exactly where in the source document the datum originated.
- Edit, verify, or reject results directly with reason documentation.

### 4. Cross-Document Conflict & Discrepancy Engine
- Actively cross-references intake histories with newly uploaded discharge summaries and laboratory findings.
- Surfaces active contradictions (e.g. penicillin allergy vs discharge summary noting "No known drug allergies").
- Dedicated Conflict Resolution modal with audit logging.

### 5. Multi-Turn Clarification Queue
- Automatically prompts reviewers when a report has missing reference ranges, missing collection dates, or ambiguous phrasing.
- Answers are logged and incorporated into the patient's verified health record.

### 6. Chronological Medical Timeline
- Consolidated longitudinal view of patient events: intake registrations, report uploads, verified results, conflict resolutions, and clinical summaries.
- Filter by event type, status, or date range.

### 7. Google Gemini 2.5 Flash Multimodal Intelligence
- Optional seamless integration with Google's Gemini 2.5 Flash API via `@google/genai`.
- Generates structured, patient-accessible summaries, doctor discussion questions, and lifestyle context while strictly obeying non-diagnostic safety guardrails.
- Deterministic fallback engine ensures full offline functionality if no API key is provided.

### 8. Audit Trail & Export
- Immutable clinical audit log tracking all actions (intake, report ingestion, value edits, human verifications, and conflict resolutions).
- One-click JSON database export and print-ready clinical report formatting (`@media print` optimized).

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript 6, Vite 8
- **Styling**: Clinical Design System in Vanilla CSS (Tokens, Glassmorphism, HSL color space, High-contrast accessibility)
- **Icons**: Lucide React
- **Document Processing**: `pdfjs-dist` (v6) with bundled local Web Worker
- **AI Intelligence**: `@google/genai` (Gemini 2.5 Flash) + Local Deterministic Clinical Engine
- **Persistence**: Reactive `localStorage` abstraction layer with automatic corrupted bytecode sanitization

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or newer)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/perumallapalliakhil739-cpu/Medlens-AI.git
cd Medlens-AI

# Install dependencies
npm install

# Start the local development server
npm run dev
```

Open `http://localhost:5173` in your browser to view the application.

### Building for Production
```bash
npm run build
npm run preview
```

---

## ⚙️ Configuration & Gemini API Key (Optional)

MedLens works completely out of the box with realistic clinical demo records and local deterministic parsing. 

To enable enhanced AI synthesis via Google Gemini:
1. Obtain an API Key from [Google AI Studio](https://aistudio.google.com/).
2. In the MedLens app, navigate to **Settings** in the navigation bar.
3. Paste your API key and enable **Gemini AI Intelligence**. The key is stored securely in your browser's local storage and never sent to external servers.

---

## 🔒 Safety & Governance Principles

1. **Non-Diagnostic**: MedLens never claims to provide a diagnosis or prognosis.
2. **No Invented Ranges**: If a laboratory does not specify a reference range on the report, MedLens marks it as `Reference range unavailable in source report` and requests clinician review.
3. **Provenance Required**: No value exists without an origin tag (`Line X`, `Source snippet`).
4. **Transparent Edits**: If a reviewer edits an extracted value, both the original extracted value and the edited value are preserved side-by-side in the record.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
