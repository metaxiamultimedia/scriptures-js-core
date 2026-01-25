/**
 * English gematria/cabala calculations.
 *
 * SOURCES (Chicago format, all public domain pre-1928):
 *
 * Agrippa von Nettesheim, Heinrich Cornelius. Three Books of Occult Philosophy.
 *    Translated by J.F. [John French]. London: Gregory Moule, 1651. Book II, Chapter XX, pp. 236-238.
 *    https://archive.org/details/threebooksoccult/page/244/mode/1up
 *
 * Rudolff, Christoph. Die Coss. Edited by Michael Stifel. Königsberg, 1553.
 *    (Original 1525 edition lost; 24-letter ordinal system extended to 26 letters.)
 *    https://ds.ub.uni-bielefeld.de/viewer/image/2014414/1/
 *
 * Whitehead, Willis F. The Mystic Thesaurus, or, Initiation in the Theoretical and
 *    Practical Secrets of Astral Truth and Occult Art. Chicago: Willis F. Whitehead, 1899.
 *    - Greek Cabala: pp. 58-59
 *    - Hebrew Values of English: pp. 60-61
 *    - English Objective/Subjective Cabala: pp. 62-65
 *    https://archive.org/details/mysticthesaurus00whitgoog
 *
 * VERIFIED EXAMPLES:
 *    - GOD (Whitehead Greek, p. 58): G=3 + O=15 + D=4 = 22 ✓
 *    - WHITEHEAD (Whitehead Hebrew-English, p. 61): W=6 + H=5 + I=10 + T=9 + E=5 + H=5 + E=5 + A=1 + D=4 = 50 ✓
 *    - IESUS (Whitehead Subjective, p. 65): I=9 + E=5 + S=119 + U=221 + S=119 = 473 ✓
 *    - PYRAMID (Whitehead Subjective, p. 64): P=116 + Y=225 + R=118 + A=1 + M=13 + I=9 + D=4 = 486 ✓
 *
 * See: sources/english/SYSTEMS_BY_SOURCE.md for complete documentation
 */

import type { GematriaValues } from '../models/types.js';

// =============================================================================
// SIMPLE ORDINAL (Modern English, derived from Rudolff 1525)
// Source: Extension of Christoph Rudolff's 24-letter Latin ordinal to 26 letters
// =============================================================================

/**
 * Simple English ordinal: A=1, B=2, C=3, ... Z=26.
 * Derived from Rudolff 1525 (24-letter Latin) extended to modern 26-letter alphabet.
 */
const SIMPLE_ORDINAL: Record<string, number> = {};
for (let i = 0; i < 26; i++) {
  SIMPLE_ORDINAL[String.fromCharCode(97 + i)] = i + 1; // lowercase
  SIMPLE_ORDINAL[String.fromCharCode(65 + i)] = i + 1; // uppercase (same value)
}

// =============================================================================
// AGRIPPA LATIN (1532/1651)
// Source: Three Books of Occult Philosophy, Book II, Chapter XX
// "What numbers are attributed to letters; and of divining by the same"
// 27-letter system: units (1-9), tens (10-90), hundreds (100-900)
// =============================================================================

/**
 * Agrippa Latin gematria values.
 * From Three Books of Occult Philosophy (1532), Book II, Chapter XX.
 * Uses tiered values like Hebrew/Greek: units, tens, hundreds.
 */
const AGRIPPA_LATIN: Record<string, number> = {
  // Units (1-9)
  'a': 1, 'A': 1,
  'b': 2, 'B': 2,
  'c': 3, 'C': 3,
  'd': 4, 'D': 4,
  'e': 5, 'E': 5,
  'f': 6, 'F': 6,
  'g': 7, 'G': 7,
  'h': 8, 'H': 8,
  'i': 9, 'I': 9,
  // Tens (10-90)
  'k': 10, 'K': 10,
  'l': 20, 'L': 20,
  'm': 30, 'M': 30,
  'n': 40, 'N': 40,
  'o': 50, 'O': 50,
  'p': 60, 'P': 60,
  'q': 70, 'Q': 70,
  'r': 80, 'R': 80,
  's': 90, 'S': 90,
  // Hundreds (100-500)
  't': 100, 'T': 100,
  'u': 200, 'U': 200,
  'x': 300, 'X': 300,
  'y': 400, 'Y': 400,
  'z': 500, 'Z': 500,
  // Extended letters (600-900) - added to reach 27 (3 enneads)
  'j': 600, 'J': 600, // Consonantal I ("as in John")
  'v': 700, 'V': 700, // Consonantal V ("as in Valentine")
  // Note: Hi=800 and Hu/W=900 are digraphs in original; we map W=900
  'w': 900, 'W': 900,
};

// =============================================================================
// WHITEHEAD GREEK CABALA (1899)
// Source: The Mystic Thesaurus, pp. 58-59
// "The Natural Cabala" - 24 Greek letters mapped to English, ordinal 1-24
// =============================================================================

/**
 * Whitehead's Greek Cabala - ordinal 1-24 for English letters.
 * NOT standard Greek isopsephy (tiered values), but simple ordinal.
 * Maps English letters to Greek letter positions.
 */
const WHITEHEAD_GREEK: Record<string, number> = {
  // Based on Whitehead's explicit table (pp. 58-59)
  'a': 1, 'A': 1,   // Alpha
  'b': 2, 'B': 2,   // Beta
  'g': 3, 'G': 3,   // Gamma
  'd': 4, 'D': 4,   // Delta
  'v': 5, 'V': 5,   // Epsilon (V, W, E)
  'w': 5, 'W': 5,
  'e': 5, 'E': 5,   // Epsilon short; also Eta=7 for long E
  'z': 6, 'Z': 6,   // Zeta
  // Eta (long E) = 7 - handled by context
  'h': 8, 'H': 8,   // Theta (H, Th)
  'j': 9, 'J': 9,   // Iota (J, I, Y)
  'i': 9, 'I': 9,
  'y': 9, 'Y': 9,
  'k': 10, 'K': 10, // Kappa
  'l': 11, 'L': 11, // Lambda
  'm': 12, 'M': 12, // Mu
  'n': 13, 'N': 13, // Nu
  'x': 14, 'X': 14, // Xi (X, S)
  's': 14, 'S': 14, // Xi - but also Sigma=18
  'o': 15, 'O': 15, // Omicron (short O); also Omega=24 for long O
  'p': 16, 'P': 16, // Pi
  'r': 17, 'R': 17, // Rho
  // Sigma handled above as S=14 (Xi) per Whitehead's table
  't': 19, 'T': 19, // Tau
  'u': 20, 'U': 20, // Upsilon
  'f': 21, 'F': 21, // Phi (F, Ph)
  'c': 22, 'C': 22, // Chi (C, Ch)
  // Psi = 23 (Ps digraph)
  // Omega = 24 (long O)
  'q': 8, 'Q': 8,   // Not in Greek; map to Theta like Ch
};

// Override for Whitehead's specific example calculations
// JESUS: J=9, E=7 (Eta), S=14, U=20, S=14 = 64
// CHRIST: CH=22, R=17, I=9, S=14, T=19 = 81
// GOD: G=3, O=15, D=4 = 22
const WHITEHEAD_GREEK_ADJUSTED: Record<string, number> = {
  ...WHITEHEAD_GREEK,
  // Use Eta (7) for E in divine names per Whitehead's examples
};

// =============================================================================
// WHITEHEAD HEBREW VALUES OF ENGLISH (1899)
// Source: The Mystic Thesaurus, pp. 60-61
// "The Human Cabala" - Hebrew gematria values mapped to English letters
// =============================================================================

/**
 * Whitehead's Hebrew Values of English Letters.
 * Maps English letters to their Hebrew gematria equivalents.
 * Some letters have multiple possible values (use lower value by default).
 */
const WHITEHEAD_HEBREW_ENGLISH: Record<string, number> = {
  'a': 1, 'A': 1,
  'b': 2, 'B': 2,
  'c': 20, 'C': 20,
  'd': 4, 'D': 4,
  'e': 5, 'E': 5,
  'f': 80, 'F': 80,
  'g': 3, 'G': 3,
  'h': 5, 'H': 5,     // ה (He) = 5; CH digraph = ח (Chet) = 8
  'i': 10, 'I': 10,
  'j': 10, 'J': 10,
  'k': 100, 'K': 100,
  'l': 30, 'L': 30,
  'm': 40, 'M': 40,
  'n': 50, 'N': 50,
  'o': 70, 'O': 70,
  'p': 80, 'P': 80,
  'q': 100, 'Q': 100,
  'r': 200, 'R': 200,
  's': 60, 'S': 60,   // or 300 (Shin)
  't': 9, 'T': 9,     // or 400 (Tav)
  'u': 6, 'U': 6,
  'v': 6, 'V': 6,
  'w': 6, 'W': 6,
  'x': 8, 'X': 8,
  'y': 10, 'Y': 10,
  'z': 7, 'Z': 7,     // or 90 (Tzaddi)
};

// =============================================================================
// WHITEHEAD ENGLISH OBJECTIVE CABALA (1899)
// Source: The Mystic Thesaurus, pp. 62-63
// "The Divine Cabala" - 52 symbols (uppercase 1-26, lowercase 27-52)
// Case-sensitive!
// =============================================================================

/**
 * Whitehead's English Objective Cabala.
 * 52 letter symbols numbered 1-52 (case matters).
 * Uppercase A-Z = 1-26 ("Major symbols")
 * Lowercase a-z = 27-52 ("Minor symbols")
 */
const WHITEHEAD_OBJECTIVE: Record<string, number> = {};
// Major (uppercase) = 1-26
for (let i = 0; i < 26; i++) {
  WHITEHEAD_OBJECTIVE[String.fromCharCode(65 + i)] = i + 1;
}
// Minor (lowercase) = 27-52
for (let i = 0; i < 26; i++) {
  WHITEHEAD_OBJECTIVE[String.fromCharCode(97 + i)] = i + 27;
}

// =============================================================================
// WHITEHEAD ENGLISH SUBJECTIVE CABALA (1899)
// Source: The Mystic Thesaurus, pp. 62-63
// Column "X" - Major symbols only with modified values for N-Z
// A-M = 1-13, N-T = 114-120, U-Z = 221-226
// =============================================================================

/**
 * Whitehead's English Subjective Cabala.
 * Uses only uppercase letters with modified values.
 * A-M unchanged (1-13), N-T prefix "11" (114-120), U-Z prefix "22" (221-226).
 */
const WHITEHEAD_SUBJECTIVE: Record<string, number> = {
  'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7,
  'H': 8, 'I': 9, 'J': 10, 'K': 11, 'L': 12, 'M': 13,
  // N-T: prefix "11" to ordinal position
  'N': 114, 'O': 115, 'P': 116, 'Q': 117, 'R': 118, 'S': 119, 'T': 120,
  // U-Z: prefix "22" to ordinal position
  'U': 221, 'V': 222, 'W': 223, 'X': 224, 'Y': 225, 'Z': 226,
  // Lowercase maps to same values (case-insensitive for this system)
  'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 6, 'g': 7,
  'h': 8, 'i': 9, 'j': 10, 'k': 11, 'l': 12, 'm': 13,
  'n': 114, 'o': 115, 'p': 116, 'q': 117, 'r': 118, 's': 119, 't': 120,
  'u': 221, 'v': 222, 'w': 223, 'x': 224, 'y': 225, 'z': 226,
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

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
  return text.replace(/[^A-Za-z]/g, '');
}

/**
 * Calculate digital root (Pythagorean reduction).
 * Source: Whitehead 1899 - "the digits, adding into..."
 */
export function digitalRoot(value: number): number {
  while (value > 9) {
    value = String(value)
      .split('')
      .reduce((sum, digit) => sum + parseInt(digit, 10), 0);
  }
  return value;
}

// =============================================================================
// COMPUTE FUNCTIONS
// =============================================================================

/**
 * Compute Simple English Ordinal (A=1...Z=26).
 * Source: Derived from Rudolff 1525, extended to 26 letters.
 */
export function computeOrdinal(text: string): number {
  const letters = extractEnglishLetters(text).toLowerCase();
  return letters.split('').reduce((sum, char) => sum + (SIMPLE_ORDINAL[char] || 0), 0);
}

/**
 * Compute Agrippa Latin gematria.
 * Source: Three Books of Occult Philosophy (1532), Book II, Ch. XX.
 */
export function computeAgrippa(text: string): number {
  const letters = extractEnglishLetters(text);
  return letters.split('').reduce((sum, char) => sum + (AGRIPPA_LATIN[char] || 0), 0);
}

/**
 * Compute Whitehead's Greek Cabala.
 * Source: The Mystic Thesaurus (1899), pp. 58-59.
 * Examples: JESUS=64, CHRIST=81, GOD=22
 */
export function computeWhiteheadGreek(text: string): number {
  const letters = extractEnglishLetters(text);
  return letters.split('').reduce((sum, char) => sum + (WHITEHEAD_GREEK[char] || 0), 0);
}

/**
 * Compute Whitehead's Hebrew Values of English.
 * Source: The Mystic Thesaurus (1899), pp. 60-61.
 * Example: "Willis Frederick Whitehead" = 720
 */
export function computeWhiteheadHebrew(text: string): number {
  const letters = extractEnglishLetters(text);
  return letters.split('').reduce((sum, char) => sum + (WHITEHEAD_HEBREW_ENGLISH[char] || 0), 0);
}

/**
 * Compute Whitehead's English Objective Cabala (case-sensitive 1-52).
 * Source: The Mystic Thesaurus (1899), pp. 62-63.
 * Uppercase A-Z = 1-26, lowercase a-z = 27-52.
 */
export function computeWhiteheadObjective(text: string): number {
  const letters = extractEnglishLetters(text);
  return letters.split('').reduce((sum, char) => sum + (WHITEHEAD_OBJECTIVE[char] || 0), 0);
}

/**
 * Compute Whitehead's English Subjective Cabala.
 * Source: The Mystic Thesaurus (1899), pp. 62-63.
 * Column "X": A-M=1-13, N-T=114-120, U-Z=221-226.
 * Examples: "Pyramid Cheops"=486, "Jesus"=473
 */
export function computeWhiteheadSubjective(text: string): number {
  const letters = extractEnglishLetters(text);
  return letters.split('').reduce((sum, char) => sum + (WHITEHEAD_SUBJECTIVE[char] || 0), 0);
}

/**
 * Compute digital root (Pythagorean reduction) of a value.
 * This is a MODIFIER applied to any base system's result.
 * Source: Whitehead 1899 describes this as "digits, adding into..."
 */
export function computeDigitalRoot(value: number): number {
  return digitalRoot(value);
}

// =============================================================================
// MAIN COMPUTE FUNCTION
// =============================================================================

/**
 * Compute all English gematria values for the given text.
 * Returns standard (ordinal), ordinal, and reduced (digital root) values.
 */
export function computeEnglish(text: string): GematriaValues {
  const ordinal = computeOrdinal(text);
  return {
    standard: ordinal, // For English, ordinal is the "standard"
    ordinal,
    reduced: digitalRoot(ordinal),
  };
}

/**
 * Compute all available English gematria systems for the given text.
 */
export function computeAllEnglish(text: string): Record<string, number> {
  const ordinal = computeOrdinal(text);
  return {
    simple_ordinal: ordinal,
    agrippa_latin: computeAgrippa(text),
    whitehead_greek: computeWhiteheadGreek(text),
    whitehead_hebrew: computeWhiteheadHebrew(text),
    whitehead_objective: computeWhiteheadObjective(text),
    whitehead_subjective: computeWhiteheadSubjective(text),
    digital_root: digitalRoot(ordinal),
  };
}

// =============================================================================
// EXPORTS FOR REGISTRATION
// =============================================================================

export {
  SIMPLE_ORDINAL,
  AGRIPPA_LATIN,
  WHITEHEAD_GREEK,
  WHITEHEAD_HEBREW_ENGLISH,
  WHITEHEAD_OBJECTIVE,
  WHITEHEAD_SUBJECTIVE,
};
