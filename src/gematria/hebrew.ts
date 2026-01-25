/**
 * Hebrew Gematria - Re-exports from hebrew/gematria module.
 *
 * This module provides backwards compatibility. For new code, import from
 * 'hebrew/gematria' or use the hebrew namespace instead.
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
 *    - בראשית (Bereshit, Genesis 1:1): ב=2 + ר=200 + א=1 + ש=300 + י=10 + ת=400 = 913 ✓
 *    - אלהים (Elohim): א=1 + ל=30 + ה=5 + י=10 + ם=40 = 86 ✓
 *
 * See: sources/gematria/SYSTEMS_BY_SOURCE.md for complete documentation
 *
 * @module gematria/hebrew
 */

import type { GematriaValues } from '../models/types.js';
import {
  misparHechrachi,
  misparSiduri,
  misparKatan,
  extractLetters,
} from '../hebrew/gematria/index.js';

// Re-export extraction function with original name
export { extractLetters as extractHebrewLetters } from '../hebrew/gematria/index.js';

/**
 * Hebrew Unicode range for detecting Hebrew text.
 */
const HEBREW_REGEX = /[\u0590-\u05FF]/;

/**
 * Check if text contains Hebrew characters.
 */
export function isHebrew(text: string): boolean {
  return HEBREW_REGEX.test(text);
}

/**
 * Compute standard Hebrew gematria (Mispar Hechrachi).
 */
export function computeStandard(text: string): number {
  return misparHechrachi(text);
}

/**
 * Compute ordinal Hebrew gematria (Mispar Siduri).
 */
export function computeOrdinal(text: string): number {
  return misparSiduri(text);
}

/**
 * Compute reduced Hebrew gematria (Mispar Katan).
 */
export function computeReduced(text: string): number {
  return misparKatan(text);
}

/**
 * Compute all Hebrew gematria values for the given text.
 */
export function computeHebrew(text: string): GematriaValues {
  return {
    standard: computeStandard(text),
    ordinal: computeOrdinal(text),
    reduced: computeReduced(text),
  };
}
