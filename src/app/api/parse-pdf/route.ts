import { NextResponse } from 'next/server';
import zlib from 'zlib';

// Fallback pure-JS PDF stream extractor in case native binary/worker packages fail in serverless
function extractPdfRawText(buffer: Buffer): string {
  const content = buffer.toString('binary');
  const extracted: string[] = [];

  // 1. Search for uncompressed text operator sequences: (text) Tj
  const rawMatches = content.match(/\(([^)]+)\)\s*Tj/g);
  if (rawMatches) {
    for (const m of rawMatches) {
      const sub = m.match(/\(([^)]+)\)\s*Tj/);
      if (sub && sub[1] && sub[1].trim()) {
        extracted.push(sub[1]);
      }
    }
  }

  // 2. Search for FlateDecode / zlib compressed streams
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match: RegExpExecArray | null;
  while ((match = streamRegex.exec(content)) !== null) {
    try {
      const rawStream = Buffer.from(match[1], 'binary');
      const decompressed = zlib.inflateSync(rawStream).toString('utf-8');
      
      // Match (Text) Tj
      const streamTextMatches = decompressed.match(/\(([^)]+)\)\s*Tj/g);
      if (streamTextMatches) {
        for (const sm of streamTextMatches) {
          const sub = sm.match(/\(([^)]+)\)\s*Tj/);
          if (sub && sub[1] && sub[1].trim()) {
            extracted.push(sub[1]);
          }
        }
      }

      // Match array format [(Text) -10 (More)] TJ
      const arrayMatches = decompressed.match(/\[(.*?)\]\s*TJ/g);
      if (arrayMatches) {
        for (const am of arrayMatches) {
          const innerMatches = am.match(/\(([^)]+)\)/g);
          if (innerMatches) {
            for (const im of innerMatches) {
              const cleaned = im.replace(/^\(|\)$/g, '').trim();
              if (cleaned) extracted.push(cleaned);
            }
          }
        }
      }
    } catch {
      // Stream is not zlib compressed or is image data, skip silently
    }
  }

  return extracted.join(' ').replace(/\s+/g, ' ').trim();
}

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

    // Attempt 1: Try pdf-parse module safely without external worker overrides
    try {
      const pdfModule: any = await import('pdf-parse');
      const PDFParserClass = pdfModule.PDFParse || pdfModule.default || pdfModule;

      if (typeof PDFParserClass === 'function') {
        try {
          // Check if it can be called as a constructor
          const instance = new (PDFParserClass as any)({ data: buffer });
          if (instance && typeof instance.getText === 'function') {
            const parsed = await instance.getText();
            text = (parsed && parsed.text) ? parsed.text : '';
          }
        } catch {
          // If constructor fails, try calling as normal async function
          const parsed = await PDFParserClass(buffer);
          text = (parsed && parsed.text) ? parsed.text : '';
        }
      }
    } catch (moduleErr: any) {
      console.warn('pdf-parse library execution failed, falling back to pure extractor:', moduleErr.message);
    }

    // Attempt 2: If library returned empty or failed, use pure JS stream extractor
    if (!text || text.trim().length === 0) {
      console.log('Using pure JS fallback stream extractor...');
      text = extractPdfRawText(buffer);
    }

    return NextResponse.json({ text: text || '' });
  } catch (error) {
    console.error('Error in parse-pdf route:', error);
    return NextResponse.json({ error: 'Failed to parse PDF', text: '' }, { status: 500 });
  }
}
