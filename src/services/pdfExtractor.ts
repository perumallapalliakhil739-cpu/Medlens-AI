import * as pdfjsLib from 'pdfjs-dist';

import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure local bundled worker for Vite
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
} catch (e) {
  console.warn('Could not set local workerSrc URL, falling back to CDN:', e);
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export async function extractTextFromPdfFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    let fullExtractedText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const items = textContent.items as any[];
      if (!items || items.length === 0) continue;

      // Sort items: top-to-bottom (transform[5] descending), then left-to-right (transform[4] ascending)
      items.sort((a, b) => {
        const yDiff = Math.abs(a.transform[5] - b.transform[5]);
        if (yDiff > 6) {
          return b.transform[5] - a.transform[5];
        }
        return a.transform[4] - b.transform[4];
      });

      let lastY: number | null = null;
      let pageLines: string[] = [];
      let currentLine = '';

      for (const item of items) {
        const str = item.str || '';
        if (!str && !item.hasEOL) continue;

        if (lastY !== null && Math.abs(item.transform[5] - lastY) > 6) {
          if (currentLine.trim()) {
            pageLines.push(currentLine.trim());
          }
          currentLine = str;
        } else {
          if (currentLine.length > 0 && !currentLine.endsWith(' ') && !str.startsWith(' ')) {
            currentLine += '  ' + str;
          } else {
            currentLine += str;
          }
        }
        lastY = item.transform[5];
      }

      if (currentLine.trim()) {
        pageLines.push(currentLine.trim());
      }

      fullExtractedText += `--- PAGE ${pageNum} ---\n` + pageLines.join('\n') + '\n\n';
    }

    if (fullExtractedText.trim().length > 20) {
      return fullExtractedText.trim();
    }
  } catch (err) {
    console.warn('PDF.js text extraction failed or was corrupted:', err);
  }

  // Fallback: If binary PDF text stream extraction didn't work (e.g. scanned image PDF or failed worker)
  return fallbackCleanTextFromBinary(await file.text());
}

// Fallback cleaner for binary text that strips PDF bytecode if raw text was read
export function fallbackCleanTextFromBinary(rawText: string): string {
  if (rawText.includes('%PDF-') || rawText.includes('/Info') || rawText.includes('/Root') || rawText.includes('/MediaBox')) {
    const textChunks: string[] = [];
    // Extract BT (Begin Text) to ET (End Text) blocks
    const btMatches = rawText.matchAll(/BT[\s\S]*?ET/g);
    for (const match of btMatches) {
      const block = match[0];
      // Match (text) Tj or [(t1) 10 (t2)] TJ
      const tjMatches = block.matchAll(/\(([^)]+)\)\s*(?:Tj|'|")/g);
      for (const tm of tjMatches) {
        const clean = tm[1].replace(/\\([()\\])/g, '$1').trim();
        if (clean && clean.length > 1 && /[a-zA-Z0-9]/.test(clean)) {
          textChunks.push(clean);
        }
      }
    }

    if (textChunks.length > 5) {
      return textChunks.join(' ');
    }

    return 'PDF document text could not be extracted automatically. Please verify if this PDF contains scanned images or paste the report text directly.';
  }

  // Remove control or unprintable non-ASCII binary characters
  return rawText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFFFD]/g, '');
}
