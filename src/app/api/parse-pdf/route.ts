import { NextResponse } from 'next/server';
import * as pdfModule from 'pdf-parse';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let text = '';
    
    // Resolve the parser function or class safely
    const pdfParser = (pdfModule as any).PDFParse || pdfModule;
    
    console.log("PDF parser resolved type:", typeof pdfParser, pdfParser.name || 'anonymous');
    
    // Dynamically resolve and set the worker path using a file:// schema
    try {
      const rawPath = path.join(process.cwd(), 'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs');
      const normalizedPath = rawPath.replace(/\\/g, '/');
      const workerUrl = normalizedPath.startsWith('/')
        ? `file://${normalizedPath}`
        : `file:///${normalizedPath}`;
        
      console.log("Configuring PDF worker URL:", workerUrl);
      if (pdfParser.setWorker) {
        pdfParser.setWorker(workerUrl);
      }
    } catch (workerErr: any) {
      console.warn("Failed to set worker URL, trying default load:", workerErr.message);
    }

    try {
      // 1. Try class instantiation pattern using dynamic Function constructor
      // This bypasses SWC/Turbopack ES5 constructor compilation bugs
      const constructClass = new Function('Parser', 'options', 'return new Parser(options);');
      const instance = constructClass(pdfParser, { data: buffer });
      
      const parsed = await instance.getText();
      text = parsed.text || '';
      console.log("Class pattern succeeded. Extracted length:", text.length);
    } catch (err: any) {
      console.warn('Class pattern failed, falling back to function pattern:', err.message);
      // 2. Fallback to traditional function pattern if class pattern fails
      try {
        const parsed = await (pdfParser as any)(buffer);
        text = parsed.text || '';
        console.log("Function pattern succeeded. Extracted length:", text.length);
      } catch (nestedErr: any) {
        console.error('All PDF parsing patterns failed:', nestedErr.message);
        throw new Error('Failed to parse PDF: no compatible function or class matches.');
      }
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 500 });
  }
}
