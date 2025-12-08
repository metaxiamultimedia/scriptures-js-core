/**
 * English gematria calculations.
 */

import type { GematriaValues } from '../models/types.js';

/**
 * English ordinal gematria: A=1, B=2, C=3, ... Z=26.
 */
const ENGLISH_ORDINAL: Record<string, number> = {};
for (let i = 0; i < 26; i++) {
  ENGLISH_ORDINAL[String.fromCharCode(97 + i)] = i + 1;
}

/**
 * Check if text contains only ASCII letters.
 */
export function isEnglish(text: string): boolean {
  return /^[A-Za-z\s]+$/.test(text);
}

/**
 * Extract only ASCII letters from text.
 */
export function extractEnglishLetters(text: string): string {
  return text.replace(/[^A-Za-z]/g, '').toLowerCase();
}

/**
 * Calculate digital root.
 */
function digitalRoot(value: number): number {
  while (value > 9) {
    value = String(value)
      .split('')
      .reduce((sum, digit) => sum + parseInt(digit, 10), 0);
  }
  return value;
}

/**
 * Compute English ordinal gematria.
 */
export function computeOrdinal(text: string): number {
  const letters = extractEnglishLetters(text);
  return letters.split('').reduce((sum, char) => sum + (ENGLISH_ORDINAL[char] || 0), 0);
}

/**
 * Compute all English gematria values for the given text.
 * Note: English only supports ordinal gematria.
 */
export function computeEnglish(text: string): GematriaValues {
  const ordinal = computeOrdinal(text);
  return {
    standard: ordinal,
    ordinal,
    reduced: digitalRoot(ordinal),
  };
}
