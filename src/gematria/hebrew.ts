/**
 * Hebrew gematria calculations.
 */

import type { GematriaValues } from '../models/types.js';

/**
 * Standard Hebrew letter values (Mispar Hechrachi).
 * Maps Hebrew letters to their traditional numerical values.
 */
const HEBREW_STANDARD: Record<string, number> = {
  'א': 1,   'ב': 2,   'ג': 3,   'ד': 4,   'ה': 5,
  'ו': 6,   'ז': 7,   'ח': 8,   'ט': 9,   'י': 10,
  'כ': 20,  'ך': 20,  'ל': 30,  'מ': 40,  'ם': 40,
  'נ': 50,  'ן': 50,  'ס': 60,  'ע': 70,  'פ': 80,
  'ף': 80,  'צ': 90,  'ץ': 90,  'ק': 100, 'ר': 200,
  'ש': 300, 'ת': 400,
};

/**
 * Ordinal Hebrew letter values (Mispar Siduri).
 * Each letter is numbered 1-22 based on position in alphabet.
 * Final letters (sofit) share the same ordinal value as their base forms,
 * consistent with traditional rabbinic practice.
 */
const HEBREW_ORDINAL: Record<string, number> = {
  'א': 1,  'ב': 2,  'ג': 3,  'ד': 4,  'ה': 5,
  'ו': 6,  'ז': 7,  'ח': 8,  'ט': 9,  'י': 10,
  'כ': 11, 'ך': 11, 'ל': 12, 'מ': 13, 'ם': 13,
  'נ': 14, 'ן': 14, 'ס': 15, 'ע': 16, 'פ': 17,
  'ף': 17, 'צ': 18, 'ץ': 18, 'ק': 19, 'ר': 20,
  'ש': 21, 'ת': 22,
};

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
 * Extract only Hebrew letters from text (removes vowels, cantillation, etc.).
 */
export function extractHebrewLetters(text: string): string {
  return text.replace(/[^\u05D0-\u05EA]/g, '');
}

/**
 * Calculate digital root (reduce to single digit by summing digits).
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
 * Compute standard Hebrew gematria (Mispar Hechrachi).
 */
export function computeStandard(text: string): number {
  const letters = extractHebrewLetters(text);
  return letters.split('').reduce((sum, char) => sum + (HEBREW_STANDARD[char] || 0), 0);
}

/**
 * Compute ordinal Hebrew gematria (Mispar Siduri).
 */
export function computeOrdinal(text: string): number {
  const letters = extractHebrewLetters(text);
  return letters.split('').reduce((sum, char) => sum + (HEBREW_ORDINAL[char] || 0), 0);
}

/**
 * Compute reduced Hebrew gematria (Mispar Katan).
 * Each letter value is reduced to a single digit.
 */
export function computeReduced(text: string): number {
  const letters = extractHebrewLetters(text);
  return letters.split('').reduce((sum, char) => {
    const value = HEBREW_STANDARD[char] || 0;
    return sum + digitalRoot(value);
  }, 0);
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
