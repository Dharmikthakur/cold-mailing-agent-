import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cleanMarkdown(text: string): string {
  if (!text) return '';
  return text
    .replace(/^```[a-zA-Z]*\n/gm, '')
    .replace(/```$/gm, '')
    .trim();
}

export function parseLLMResponse(text: string) {
  if (!text) return null;
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  }
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (nestedErr) {
        console.error('Failed to parse regex extracted JSON:', nestedErr);
      }
    }
    throw err;
  }
}
