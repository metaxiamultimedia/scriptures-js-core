/**
 * Greek Isopsephy Computation Functions
 *
 * Provides computation functions for Greek isopsephy (ἰσοψηφία), the practice
 * of summing the numerical values of Greek letters.
 *
 * ## Systems Implemented
 *
 * | System | Greek Name | Method | Source |
 * |--------|------------|--------|--------|
 * | Standard | ἰσοψηφία | Milesian numerals (27 letters) | Gow 1883 |
 * | Ordinal | στοιχεῖα | Alphabet position (1-24) | Dionysius Thrax 2nd c. BCE |
 * | Reduced | πυθμήν | Digital root of standard | Hippolytus ~220 CE |
 *
 * ## Primary Sources (Public Domain)
 *
 * ### Standard Isopsephy (ἰσοψηφία)
 *
 * Gow, James. "The Greek Numerical Alphabet." *The Journal of Philology* 12
 *   (1883): 278–84.
 *
 * - Internet Archive: https://archive.org/details/journalofphilolo12claruoft
 *
 * ### Ordinal (στοιχεῖα)
 *
 * Dionysius Thrax. *Ars Grammatica* (Τέχνη Γραμματική). Section 6. 2nd century BCE.
 *   Edited by Gustav Uhlig. Leipzig: Teubner, 1883.
 *
 * - Internet Archive: https://archive.org/details/dionysiithracis00unkngoog
 * - Wikisource (English): https://en.wikisource.org/wiki/The_grammar_of_Dionysios_Thrax
 *
 * ### Reduced/Pythmen (πυθμήν)
 *
 * Hippolytus of Rome. *Refutation of All Heresies*. Book IV, Chapter 14 (~220 CE).
 *   Trans. J. H. MacMahon. In *Ante-Nicene Fathers*, vol. 5. Buffalo, NY:
 *   Christian Literature Publishing, 1886.
 *
 * - Internet Archive: https://archive.org/details/antenicenefathe00444gut
 * - Early Church Texts: https://www.earlychurchtexts.com/public/hippolytus_refutation_book4.htm
 * - New Advent: https://www.newadvent.org/fathers/050104.htm
 *
 * @module greek/isopsephy/compute
 */

import type { IsopsephyResult } from './types.js';
import { STANDARD, ORDINAL, ARCHAIC_LETTERS } from './systems.js';

// Re-export letter-value tables for direct access
export { STANDARD, ORDINAL, ARCHAIC_LETTERS };

/**
 * Greek Unicode ranges for detecting Greek text.
 * Includes basic Greek (U+0370-U+03FF) and extended Greek (U+1F00-U+1FFF).
 */
const GREEK_REGEX = /[\u0370-\u03FF\u1F00-\u1FFF]/;

/**
 * Check if text contains Greek characters.
 */
export function isGreek(text: string): boolean {
  return GREEK_REGEX.test(text);
}

/**
 * Convert iota subscripts to iota adscripts.
 *
 * In ancient Greek manuscripts, iota subscript (ᾳ, ῃ, ῳ) represents what was
 * originally written as iota adscript (αι, ηι, ωι). For isopsephy calculations,
 * the iota should be counted as a full letter with value 10.
 */
function convertIotaSubscriptToAdscript(text: string): string {
  // U+0345 (COMBINING GREEK YPOGEGRAMMENI) is the iota subscript combining character
  // Convert to full iota letter (U+03B9)
  return text.normalize('NFD').replace(/\u0345/g, 'ι');
}

/**
 * Remove diacritical marks from Greek text.
 * Iota subscripts are first converted to adscripts so they count for isopsephy.
 */
export function removeDiacritics(text: string): string {
  const expanded = convertIotaSubscriptToAdscript(text);
  return expanded.replace(/[\u0300-\u036f]/g, '');
}

/**
 * Extract only Greek letters from text.
 */
export function extractGreekLetters(text: string): string {
  const clean = removeDiacritics(text);
  return clean.replace(/[^\u0370-\u03FF]/g, '');
}

/**
 * Count Greek words in text.
 */
export function countWords(text: string): number {
  return text.split(/\s+/).filter(word => GREEK_REGEX.test(word)).length;
}

/**
 * Calculate digital root (πυθμήν / pythmen).
 *
 * Reduces a number to a single digit (1-9) by repeatedly summing its digits.
 * This is equivalent to (n mod 9), with the convention that multiples of 9
 * return 9 (not 0).
 *
 * The Pythagoreans called this result the "πυθμήν" (pythmen), meaning "root."
 *
 * Source: Hippolytus, *Refutation of All Heresies* IV.14 (~220 CE)
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
 * Compute standard Greek isopsephy value (ἰσοψηφία).
 *
 * Uses the Milesian/Ionic numeral system with 27 letters:
 * - Units (1-9): α, β, γ, δ, ε, ϛ, ζ, η, θ
 * - Tens (10-90): ι, κ, λ, μ, ν, ξ, ο, π, ϟ
 * - Hundreds (100-900): ρ, σ, τ, υ, φ, χ, ψ, ω, ϡ
 *
 * Includes three archaic "episema" (ἐπίσημα): stigma (ϛ=6), koppa (ϟ=90),
 * and sampi (ϡ=900).
 *
 * Source: Gow, "The Greek Numerical Alphabet," *Journal of Philology* 12
 *   (1883): 278–284.
 */
export function computeStandard(text: string): number {
  const clean = removeDiacritics(text);
  return clean.split('').reduce((sum, char) => sum + (STANDARD[char] || 0), 0);
}

/**
 * Compute ordinal Greek value (alphabet position).
 *
 * Uses the standard 24-letter Greek alphabet (alpha to omega), numbered 1-24.
 * Archaic letters (stigma Ϛ/ϛ, koppa Ϟ/ϟ, sampi Ϡ/ϡ) have standard isopsephy
 * values but NO ordinal position in the alphabet.
 *
 * The Greek concept of ordered letters is explicit in Dionysius Thrax's
 * *Ars Grammatica* (2nd c. BCE), which states that letters are called
 * "stoicheia" (στοιχεῖα) because they have "order and arrangement" (στοῖχος
 * and τάξις). The alphabet was standardized in Athens in 403 BCE.
 *
 * Source: Dionysius Thrax, *Ars Grammatica*, Section 6 (2nd century BCE).
 *
 * @param text - The Greek text to calculate
 * @param strict - If true (default), throws an error when archaic letters are
 *   encountered. If false, silently skips archaic letters (treats them as 0).
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

  return letters.split('').reduce((sum, char) => sum + (ORDINAL[char] || 0), 0);
}

/**
 * Compute reduced Greek value (πυθμήν / pythmen).
 *
 * Calculates the digital root of the standard isopsephy value, reducing it
 * to a single digit (1-9). The Pythagoreans called this the "πυθμήν" (pythmen),
 * meaning "root" or "base."
 *
 * The "Pythagoras to Telauges" (Πυθαγόρας πρὸς Τελαύγην) divination method
 * uses this reduction technique. It is attested in ~60 Byzantine manuscripts.
 *
 * Source: Hippolytus, *Refutation of All Heresies* IV.14 (~220 CE).
 */
export function computeReduced(text: string): number {
  const standard = computeStandard(text);
  return digitalRoot(standard);
}

/**
 * Compute isopsephy with full result metadata.
 */
export function compute(
  text: string,
  system: 'standard' | 'ordinal' | 'reduced'
): IsopsephyResult {
  const letters = extractGreekLetters(text);
  const letterCount = letters.length;
  const wordCount = countWords(text);

  let value: number;
  switch (system) {
    case 'standard':
      value = computeStandard(text);
      break;
    case 'ordinal':
      value = computeOrdinal(text);
      break;
    case 'reduced':
      value = computeReduced(text);
      break;
    default:
      throw new Error(`Unknown isopsephy system: ${system}`);
  }

  return {
    value,
    system,
    letterCount,
    wordCount,
  };
}

/**
 * Compute all isopsephy systems at once.
 */
export function computeAll(text: string): Record<string, number> {
  return {
    standard: computeStandard(text),
    ordinal: computeOrdinal(text, false), // Don't throw on archaic letters
    reduced: computeReduced(text),
  };
}

/**
 * List all available system names.
 */
export function listSystems(): string[] {
  return ['standard', 'ordinal', 'reduced'];
}
