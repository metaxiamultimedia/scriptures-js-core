/**
 * Hebrew Gematria Letter-Value Tables
 *
 * Three standard systems from traditional sources.
 */

import type { LetterValueTable } from './types.js';

/**
 * Standard Hebrew letter values (Mispar Hechrachi).
 *
 * Aleph-tet as units (1-9), yod-tsadi as tens (10-90),
 * qof-tav as hundreds (100-400). Finals same as regular forms.
 */
export const MISPAR_HECHRACHI: LetterValueTable = {
  // Units (1-9)
  'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5,
  'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
  // Tens (10-90)
  'י': 10, 'כ': 20, 'ל': 30, 'מ': 40, 'נ': 50,
  'ס': 60, 'ע': 70, 'פ': 80, 'צ': 90,
  // Hundreds (100-400)
  'ק': 100, 'ר': 200, 'ש': 300, 'ת': 400,
  // Finals (same as initial forms)
  'ך': 20, 'ם': 40, 'ן': 50, 'ף': 80, 'ץ': 90,
};

/**
 * Ordinal Hebrew letter values (Mispar Siduri).
 *
 * Sequential numbering 1-22 based on alphabetical position.
 * Finals share the same ordinal value as their base forms.
 */
export const MISPAR_SIDURI: LetterValueTable = {
  // Sequential 1-22 by alphabet position
  'א': 1,  'ב': 2,  'ג': 3,  'ד': 4,  'ה': 5,
  'ו': 6,  'ז': 7,  'ח': 8,  'ט': 9,
  'י': 10, 'כ': 11, 'ל': 12, 'מ': 13, 'נ': 14,
  'ס': 15, 'ע': 16, 'פ': 17, 'צ': 18,
  'ק': 19, 'ר': 20, 'ש': 21, 'ת': 22,
  // Finals (same ordinal as their base forms)
  'ך': 11, 'ם': 13, 'ן': 14, 'ף': 17, 'ץ': 18,
};

/**
 * Reduced Hebrew letter values (Mispar Katan).
 *
 * All values reduced to single digits (1-9) by dropping zeros.
 */
export const MISPAR_KATAN: LetterValueTable = {
  // All values reduced to 1-9 (drop zeros)
  'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5,
  'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
  'י': 1, 'כ': 2, 'ל': 3, 'מ': 4, 'נ': 5,
  'ס': 6, 'ע': 7, 'פ': 8, 'צ': 9,
  'ק': 1, 'ר': 2, 'ש': 3, 'ת': 4,
  // Finals (same as their base forms)
  'ך': 2, 'ם': 4, 'ן': 5, 'ף': 8, 'ץ': 9,
};

/**
 * Available systems by name.
 */
export const SYSTEMS = {
  misparHechrachi: MISPAR_HECHRACHI,
  misparSiduri: MISPAR_SIDURI,
  misparKatan: MISPAR_KATAN,
} as const;

export type SystemName = keyof typeof SYSTEMS;
