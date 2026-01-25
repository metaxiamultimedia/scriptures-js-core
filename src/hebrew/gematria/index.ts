/**
 * Hebrew Gematria
 *
 * Nine letter-value systems derived from primary historical sources:
 * - Jewish Encyclopedia (1903), "Gematria" article
 * - Pardes Rimonim (1548), Gate 30, Chapter 8
 *
 * @example
 * ```typescript
 * import { hebrew } from '@metaxia/scriptures-core';
 *
 * // Using Hebrew system names (preferred)
 * hebrew.gematria.misparHechrachi('שלום')  // 376
 * hebrew.gematria.misparGadol('שלום')      // 376 (no finals in this word)
 * hebrew.gematria.misparKatan('שלום')      // 16
 *
 * // With musafi modifier
 * hebrew.gematria.misparHechrachi('שלום', { musafi: 'letters' })  // 380
 * ```
 */

import type { GematriaOptions, GematriaResult, LetterValueTable } from './types.js';
import {
  MISPAR_HECHRACHI,
  MISPAR_GADOL,
  MISPAR_KATAN,
  MISPAR_KOLEL,
  MISPAR_PERATI,
  MISPAR_MESHULASH,
  MISPAR_CHITZON,
  MISPAR_SIDURI,
  MISPAR_HAKADMI,
  SYSTEMS,
} from './systems.js';

export type { GematriaOptions, GematriaResult, GematriaSystem, LetterValueTable, SourceCitation } from './types.js';
export { SYSTEMS } from './systems.js';

/**
 * Hebrew letter Unicode range (excluding vowels/cantillation).
 */
const HEBREW_LETTER_REGEX = /[\u05D0-\u05EA]/g;

/**
 * Extract only Hebrew consonants from text.
 */
export function extractLetters(text: string): string {
  return (text.match(HEBREW_LETTER_REGEX) || []).join('');
}

/**
 * Count Hebrew words in text.
 */
export function countWords(text: string): number {
  // Split on whitespace and filter to words containing Hebrew letters
  return text.split(/\s+/).filter(word => HEBREW_LETTER_REGEX.test(word)).length;
}

/**
 * Core computation function using a letter-value table.
 */
function computeWithTable(
  text: string,
  table: LetterValueTable,
  systemName: string,
  options: GematriaOptions = {}
): GematriaResult {
  const letters = extractLetters(text);
  const letterCount = letters.length;
  const wordCount = countWords(text);

  let value = 0;
  for (const char of letters) {
    value += table[char] ?? 0;
  }

  // Apply musafi modifier (phrase-level)
  if (options.musafi === 'words') {
    value += wordCount;
  } else if (options.musafi === 'letters') {
    value += letterCount;
  }

  return {
    value,
    system: systemName,
    letterCount,
    wordCount,
    musafi: options.musafi,
  };
}

// ============================================================================
// Primary API - Hebrew System Names
// ============================================================================

/**
 * Mispar Hechrachi (מספר הכרחי) - Standard Value
 *
 * Source: Jewish Encyclopedia (1903), Section E.1
 */
export function misparHechrachi(text: string, options?: GematriaOptions): number {
  return computeWithTable(text, MISPAR_HECHRACHI, 'misparHechrachi', options).value;
}

/**
 * Mispar Gadol (מספר גדול) - Major Value
 *
 * Source: Jewish Encyclopedia (1903), Section E.11
 */
export function misparGadol(text: string, options?: GematriaOptions): number {
  return computeWithTable(text, MISPAR_GADOL, 'misparGadol', options).value;
}

/**
 * Mispar Katan (מספר קטן) - Minor/Reduced Value
 *
 * Source: Jewish Encyclopedia (1903), Section E.2
 */
export function misparKatan(text: string, options?: GematriaOptions): number {
  return computeWithTable(text, MISPAR_KATAN, 'misparKatan', options).value;
}

/**
 * Mispar Kolel (מספר כולל) - Inclusive Value
 *
 * Source: Jewish Encyclopedia (1903), Section E.3
 */
export function misparKolel(text: string, options?: GematriaOptions): number {
  return computeWithTable(text, MISPAR_KOLEL, 'misparKolel', options).value;
}

/**
 * Mispar Perati (מספר פרטי) - Square Value of Letter
 *
 * Source: Jewish Encyclopedia (1903), Section E.6
 */
export function misparPerati(text: string, options?: GematriaOptions): number {
  return computeWithTable(text, MISPAR_PERATI, 'misparPerati', options).value;
}

/**
 * Mispar Meshulash (מספר משולש) - Cube Value of Letter
 *
 * Source: Jewish Encyclopedia (1903), Section E.15
 */
export function misparMeshulash(text: string, options?: GematriaOptions): number {
  return computeWithTable(text, MISPAR_MESHULASH, 'misparMeshulash', options).value;
}

/**
 * Mispar Chitzon (מספר חיצוני) - External Value
 *
 * Every letter counts as 1.
 *
 * Source: Jewish Encyclopedia (1903), Section E.10
 */
export function misparChitzon(text: string, options?: GematriaOptions): number {
  return computeWithTable(text, MISPAR_CHITZON, 'misparChitzon', options).value;
}

/**
 * Mispar Siduri (מספר סידורי) - Ordinal Value
 *
 * Source: Pardes Rimonim (1548), Gate 30, Chapter 8 (implicit)
 */
export function misparSiduri(text: string, options?: GematriaOptions): number {
  return computeWithTable(text, MISPAR_SIDURI, 'misparSiduri', options).value;
}

/**
 * Mispar HaKadmi (מספר הקדמי) - Prior Value (triangular numbers)
 *
 * Source: Pardes Rimonim (1548), Gate 30, Chapter 8
 */
export function misparHakadmi(text: string, options?: GematriaOptions): number {
  return computeWithTable(text, MISPAR_HAKADMI, 'misparHakadmi', options).value;
}

// ============================================================================
// Extended API - Returns full result with metadata
// ============================================================================

/**
 * Compute gematria with full result metadata.
 */
export function compute(
  text: string,
  system: keyof typeof SYSTEMS,
  options?: GematriaOptions
): GematriaResult {
  const systemDef = SYSTEMS[system];
  if (!systemDef) {
    throw new Error(`Unknown gematria system: ${system}`);
  }
  return computeWithTable(text, systemDef.values, system, options);
}

/**
 * Compute all systems at once.
 */
export function computeAll(text: string, options?: GematriaOptions): Record<string, number> {
  return {
    misparHechrachi: misparHechrachi(text, options),
    misparGadol: misparGadol(text, options),
    misparKatan: misparKatan(text, options),
    misparKolel: misparKolel(text, options),
    misparPerati: misparPerati(text, options),
    misparMeshulash: misparMeshulash(text, options),
    misparChitzon: misparChitzon(text, options),
    misparSiduri: misparSiduri(text, options),
    misparHakadmi: misparHakadmi(text, options),
  };
}

/**
 * List all available system names.
 */
export function listSystems(): string[] {
  return Object.keys(SYSTEMS);
}

/**
 * Get system metadata by name.
 */
export function getSystem(name: string) {
  return SYSTEMS[name];
}

