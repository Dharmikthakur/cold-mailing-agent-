/**
 * Client-side PDF text extraction using PDF.js loaded on-demand.
 * Runs directly in the browser, eliminating serverless Lambda worker and filesystem path issues.
 */

declare global {
  interface Window {
    pdfjsLib?: any;
    _pdfjsLoadingPromise?: Promise<any>;
  }
}

export async function loadPdfJsInBrowser(): Promise<any> {
  if (typeof window === 'undefined') {
    throw new Error('PDF.js can only be loaded in a browser environment');
  }

  if (window.pdfjsLib) {
    return window.pdfjsLib;
  }

  if (window._pdfjsLoadingPromise) {
    return window._pdfjsLoadingPromise;
  }

  window._pdfjsLoadingPromise = new Promise((resolve, reject) => {
    // Check if script tag is already in DOM
    const existing = document.querySelector('script[data-pdfjs-cdn="true"]');
    if (existing && window.pdfjsLib) {
      resolve(window.pdfjsLib);
      return;
    }

    const script = document.createElement('script');
    script.setAttribute('data-pdfjs-cdn', 'true');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;

    script.onload = () => {
      const pdfjsLib = window.pdfjsLib;
      if (pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(pdfjsLib);
      } else {
        reject(new Error('PDF.js failed to attach to window'));
      }
    };

    script.onerror = () => {
      reject(new Error('Failed to load PDF.js script from CDN'));
    };

    document.head.appendChild(script);
  });

  return window._pdfjsLoadingPromise;
}

export async function extractTextFromPdfClient(file: File): Promise<string> {
  const pdfjsLib = await loadPdfJsInBrowser();
  const arrayBuffer = await file.arrayBuffer();
  const typedArray = new Uint8Array(arrayBuffer);

  const loadingTask = pdfjsLib.getDocument({
    data: typedArray,
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    
    // Group text items by approximate line position or join with spaces
    const pageStrings = content.items
      .map((item: any) => (item.str ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (pageStrings) {
      pageTexts.push(pageStrings);
    }
  }

  return pageTexts.join('\n\n');
}
