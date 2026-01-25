/**
 * Hebrew Gematria
 *
 * Three letter-value systems for computing numeric values of Hebrew text.
 *
 * SOURCES (Chicago format, all public domain):
 *
 * Cordovero, Moses ben Jacob. Pardes Rimonim [Garden of Pomegranates]. Safed, 1548.
 *    Gate 30, Chapter 8: Methods of gematria including Mispar Hechrachi, Siduri, Katan.
 *    https://www.sefaria.org/Pardes_Rimmonim.30.8
 *
 * Singer, Isidore, ed. The Jewish Encyclopedia. New York: Funk and Wagnalls, 1906.
 *    s.v. "Gematria," by Caspar Levias.
 *    https://www.jewishencyclopedia.com/articles/6643-gematria
 *
 * VERIFIED EXAMPLES:
 *    - בראשית (Bereshit): ב=2 + ר=200 + א=1 + ש=300 + י=10 + ת=400 = 913 ✓
 *    - אלהים (Elohim): א=1 + ל=30 + ה=5 + י=10 + ם=40 = 86 ✓
 *    - שלום (Shalom): ש=300 + ל=30 + ו=6 + ם=40 = 376 ✓
 *
 * @example
 * ```typescript
 * import { hebrew } from '@metaxia/scriptures-core';
 *
 * hebrew.gematria.misparHechrachi('שלום')  // 376 (standard)
 * hebrew.gematria.misparSiduri('שלום')     // 52  (ordinal)
 * hebrew.gematria.misparKatan('שלום')      // 16  (reduced)
 * ```
 */

import type { GematriaResult, LetterValueTable } from './types.js';
import {
  MISPAR_HECHRACHI,
  MISPAR_SIDURI,
  MISPAR_KATAN,
  SYSTEMS,
  type SystemName,
} from './systems.js';

export type { GematriaResult, LetterValueTable } from './types.js';
export { SYSTEMS, type SystemName } from './systems.js';

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
  return text.split(/\s+/).filter(word => HEBREW_LETTER_REGEX.test(word)).length;
}

/**
 * Core computation function using a letter-value table.
 */
function computeWithTable(
  text: string,
  table: LetterValueTable,
  systemName: string
): GematriaResult {
  const letters = extractLetters(text);
  const letterCount = letters.length;
  const wordCount = countWords(text);

  let value = 0;
  for (const char of letters) {
    value += table[char] ?? 0;
  }

  return {
    value,
    system: systemName,
    letterCount,
    wordCount,
  };
}

// ============================================================================
// Primary API - Hebrew System Names
// ============================================================================

/**
 * Mispar Hechrachi (מספר הכרחי) - Standard Value
 *
 * Traditional gematria where aleph-tet = 1-9, yod-tsadi = 10-90, qof-tav = 100-400.
 */
export function misparHechrachi(text: string): number {
  return computeWithTable(text, MISPAR_HECHRACHI, 'misparHechrachi').value;
}

/**
 * Mispar Siduri (מספר סידורי) - Ordinal Value
 *
 * Sequential numbering 1-22 based on alphabetical position.
 */
export function misparSiduri(text: string): number {
  return computeWithTable(text, MISPAR_SIDURI, 'misparSiduri').value;
}

/**
 * Mispar Katan (מספר קטן) - Reduced Value
 *
 * Each letter's value reduced to a single digit (1-9).
 */
export function misparKatan(text: string): number {
  return computeWithTable(text, MISPAR_KATAN, 'misparKatan').value;
}

// ============================================================================
// Extended API
// ============================================================================

/**
 * Compute gematria with full result metadata.
 */
export function compute(text: string, system: SystemName): GematriaResult {
  const table = SYSTEMS[system];
  return computeWithTable(text, table, system);
}

/**
 * Compute all systems at once.
 */
export function computeAll(text: string): Record<SystemName, number> {
  return {
    misparHechrachi: misparHechrachi(text),
    misparSiduri: misparSiduri(text),
    misparKatan: misparKatan(text),
  };
}

/**
 * List all available system names.
 */
export function listSystems(): SystemName[] {
  return Object.keys(SYSTEMS) as SystemName[];
}
