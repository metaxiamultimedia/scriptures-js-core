/**
 * Greek gematria (isopsephy) calculations.
 */

import type { GematriaValues } from '../models/types.js';

/**
 * Greek letter values for isopsephy.
 * Uses the standard Greek numeral system.
 */
const GREEK_VALUES: Record<string, number> = {
  // Uppercase
  'Α': 1,   'Β': 2,   'Γ': 3,   'Δ': 4,   'Ε': 5,
  'Ϛ': 6,   'Ζ': 7,   'Η': 8,   'Θ': 9,   'Ι': 10,
  'Κ': 20,  'Λ': 30,  'Μ': 40,  'Ν': 50,  'Ξ': 60,
  'Ο': 70,  'Π': 80,  'Ϟ': 90,  'Ρ': 100, 'Σ': 200,
  'Τ': 300, 'Υ': 400, 'Φ': 500, 'Χ': 600, 'Ψ': 700,
  'Ω': 800, 'Ϡ': 900,
  // Lowercase
  'α': 1,   'β': 2,   'γ': 3,   'δ': 4,   'ε': 5,
  'ϛ': 6,   'ζ': 7,   'η': 8,   'θ': 9,   'ι': 10,
  'κ': 20,  'λ': 30,  'μ': 40,  'ν': 50,  'ξ': 60,
  'ο': 70,  'π': 80,  'ϟ': 90,  'ρ': 100, 'σ': 200,
  'ς': 200, // Final sigma
  'τ': 300, 'υ': 400, 'φ': 500, 'χ': 600, 'ψ': 700,
  'ω': 800, 'ϡ': 900,
};

/**
 * Archaic Greek letters (stigma, koppa, sampi).
 * These letters have standard isopsephy values (6, 90, 900) but are not
 * part of the 24-letter Greek alphabet and therefore have no ordinal position.
 */
const ARCHAIC_LETTERS = new Set(['Ϛ', 'ϛ', 'Ϟ', 'ϟ', 'Ϡ', 'ϡ']);

/**
 * Greek ordinal values (position in alphabet).
 * Uses the standard 24-letter Greek alphabet (alpha to omega).
 * Archaic letters (stigma Ϛ, koppa Ϟ, sampi Ϡ) are intentionally excluded
 * as they are not part of the modern Greek alphabet.
 */
const GREEK_ORDINAL: Record<string, number> = {
  'Α': 1,  'α': 1,  'Β': 2,  'β': 2,  'Γ': 3,  'γ': 3,
  'Δ': 4,  'δ': 4,  'Ε': 5,  'ε': 5,  'Ζ': 6,  'ζ': 6,
  'Η': 7,  'η': 7,  'Θ': 8,  'θ': 8,  'Ι': 9,  'ι': 9,
  'Κ': 10, 'κ': 10, 'Λ': 11, 'λ': 11, 'Μ': 12, 'μ': 12,
  'Ν': 13, 'ν': 13, 'Ξ': 14, 'ξ': 14, 'Ο': 15, 'ο': 15,
  'Π': 16, 'π': 16, 'Ρ': 17, 'ρ': 17, 'Σ': 18, 'σ': 18,
  'ς': 18, 'Τ': 19, 'τ': 19, 'Υ': 20, 'υ': 20, 'Φ': 21,
  'φ': 21, 'Χ': 22, 'χ': 22, 'Ψ': 23, 'ψ': 23, 'Ω': 24,
  'ω': 24,
};

/**
 * Greek Unicode ranges for detecting Greek text.
 */
const GREEK_REGEX = /[\u0370-\u03FF\u1F00-\u1FFF]/;

/**
 * Check if text contains Greek characters.
 */
export function isGreek(text: string): boolean {
  return GREEK_REGEX.test(text);
}

/**
 * Remove diacritical marks from Greek text.
 */
export function removeDiacritics(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Extract only Greek letters from text.
 */
export function extractGreekLetters(text: string): string {
  const clean = removeDiacritics(text);
  return clean.replace(/[^\u0370-\u03FF]/g, '');
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
 * Compute standard Greek isopsephy value.
 */
export function computeStandard(text: string): number {
  const clean = removeDiacritics(text);
  // Convert final sigma to regular sigma for consistent values
  const normalized = clean.replace(/ς/g, 'σ');
  return normalized.split('').reduce((sum, char) => sum + (GREEK_VALUES[char] || 0), 0);
}

/**
 * Compute ordinal Greek value.
 *
 * Uses the standard 24-letter Greek alphabet (alpha to omega).
 * Archaic letters (stigma Ϛ/ϛ, koppa Ϟ/ϟ, sampi Ϡ/ϡ) have standard isopsephy
 * values but no ordinal position in the alphabet.
 *
 * @param text - The Greek text to calculate
 * @param strict - If true (default), throws an error when archaic letters are encountered.
 *                 If false, silently skips archaic letters (treats them as 0).
 * @throws {Error} When archaic letters are detected and strict mode is enabled
 */
export function computeOrdinal(text: string, strict: boolean = true): number {
  const letters = extractGreekLetters(text);

  // Check for archaic letters in strict mode
  if (strict) {
    const archaic = letters.split('').filter(char => ARCHAIC_LETTERS.has(char));
    if (archaic.length > 0) {
      const archaicList = [...new Set(archaic)].join(', ');
      throw new Error(
        `Cannot calculate ordinal value: text contains archaic Greek letters (${archaicList}). ` +
        `Archaic letters (stigma Ϛ, koppa Ϟ, sampi Ϡ) have standard isopsephy values (6, 90, 900) ` +
        `but no ordinal position in the 24-letter Greek alphabet. ` +
        `Use computeStandard() for isopsephy or pass strict=false to skip archaic letters.`
      );
    }
  }

  return letters.split('').reduce((sum, char) => sum + (GREEK_ORDINAL[char] || 0), 0);
}

/**
 * Compute reduced Greek value (digital root of standard).
 */
export function computeReduced(text: string): number {
  const standard = computeStandard(text);
  return digitalRoot(standard);
}

/**
 * Compute all Greek gematria values for the given text.
 */
export function computeGreek(text: string): GematriaValues {
  return {
    standard: computeStandard(text),
    ordinal: computeOrdinal(text),
    reduced: computeReduced(text),
  };
}
