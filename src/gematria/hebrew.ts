/**
 * Hebrew Gematria - Re-exports from hebrew/gematria module.
 *
 * This module provides backwards compatibility. For new code, import directly
 * from 'hebrew/gematria' instead.
 *
 * @module gematria/hebrew
 * @see {@link ../hebrew/gematria/index.js} for full documentation and sources
 */

import type { GematriaValues } from '../models/types.js';
import {
  misparHechrachi,
  misparSiduri,
  misparKatan,
  extractLetters,
} from '../hebrew/gematria/index.js';

// Re-export extraction function
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
 *
 * Source: Jewish Encyclopedia (1906), Section E.1
 */
export function computeStandard(text: string): number {
  return misparHechrachi(text);
}

/**
 * Compute ordinal Hebrew gematria (Mispar Siduri).
 *
 * Source: Pardes Rimonim (1548), Gate 30, Chapter 8
 */
export function computeOrdinal(text: string): number {
  return misparSiduri(text);
}

/**
 * Compute reduced Hebrew gematria (Mispar Katan).
 *
 * Source: Jewish Encyclopedia (1906), Section E.2
 */
export function computeReduced(text: string): number {
  return misparKatan(text);
}

/**
 * Compute all Hebrew gematria values for the given text.
 *
 * Returns standard (Mispar Hechrachi), ordinal (Mispar Siduri),
 * and reduced (Mispar Katan) values.
 */
export function computeHebrew(text: string): GematriaValues {
  return {
    standard: computeStandard(text),
    ordinal: computeOrdinal(text),
    reduced: computeReduced(text),
  };
}
