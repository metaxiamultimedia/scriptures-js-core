/**
 * Greek gematria (isopsephy) calculations.
 *
 * SOURCES (Chicago format, all public domain):
 *
 * Gow, James. "The Greek Numerical Alphabet." The Journal of Philology 12 (1883): 278-284.
 *    https://archive.org/details/journalofphilolo12claruoft  (standard isopsephy; quote p.279)
 *
 * Hippolytus. Refutation of All Heresies. Translated by J. H. MacMahon. Edinburgh, 1868.
 *    Book IV, Chapter 14: Pythagoras to Telauges (πυθμήν / digital root method).
 *    https://www.newadvent.org/fathers/050104.htm  (reduced / pythmen)
 *
 * Ordinal numeration (α=1 … ω=24): Barry, Kieren. The Greek Qabalah (Weiser, 1999);
 *    in-copyright, held in the bible-sources corpus (barry1999). See GREEK_SYSTEMS.ordinal.
 *
 * VERIFIED EXAMPLES:
 *    - λογος (logos): λ=30 + ο=70 + γ=3 + ο=70 + ς=200 = 373 ✓
 *    - θεος (theos): θ=9 + ε=5 + ο=70 + ς=200 = 284 ✓
 *    - ιησους (Iesous): ι=10 + η=8 + σ=200 + ο=70 + υ=400 + ς=200 = 888 ✓
 *
 * See: sources/isopsephy/SYSTEMS_BY_SOURCE.md for complete documentation
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
 * Convert iota subscripts to iota adscripts.
 * In ancient Greek, iota subscript (ᾳ, ῃ, ῳ) was written as iota adscript (αι, ηι, ωι).
 * For gematria, the iota should be counted as a full letter with value 10.
 */
function convertIotaSubscriptToAdscript(text: string): string {
  // U+0345 (COMBINING GREEK YPOGEGRAMMENI) is the iota subscript combining character
  // Convert to full iota letter (U+03B9)
  return text.normalize('NFD').replace(/\u0345/g, 'ι');
}

/**
 * Remove diacritical marks from Greek text.
 * Iota subscripts are first converted to adscripts so they count for gematria.
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

// ============================================================================
// System Metadata
// ============================================================================

/**
 * Source citation for a Greek isopsephy system.
 *
 * Mirrors the Hebrew SourceCitation shape, with the same finer-grained quote
 * subfields (quoteGreek / translation) so gematriabible.com's reference page
 * can defer to core without losing its per-language quote fields.
 *
 * NOTE: the primary sources cited here (Gow, Heath, Hippolytus/MacMahon) are
 * English-language works and translations, so `quoteGreek` is intentionally
 * left unset — a Greek-language quote must come from a verified Greek edition
 * and is NOT invented here.
 */
export interface GreekSourceCitation {
  text: string;
  section?: string;
  url?: string;
  /** Quote in the source's language (here: English). */
  quote?: string;
  /** Original-language quote, Greek. Unset until verified against a Greek edition. */
  quoteGreek?: string;
  /** English translation of a Greek quote. */
  translation?: string;
  note?: string;
}

/**
 * Metadata for a Greek isopsephy system.
 */
export interface GreekSystem {
  name: string;
  /** Greek name of the system, where an attested term exists. */
  greekName?: string;
  englishName: string;
  description: string;
  source: GreekSourceCitation;
}

/**
 * Greek isopsephy system metadata, parallel to the Hebrew SYSTEMS registry.
 */
export const GREEK_SYSTEMS: Record<string, GreekSystem> = {
  standard: {
    name: 'standard',
    greekName: 'ἰσοψηφία',
    englishName: 'Isopsephy (Standard Value)',
    description:
      'Milesian numeral values: α–θ as units (1–9, incl. stigma ϛ=6), ι–ϟ as tens (10–90, incl. koppa ϟ=90), ρ–ϡ as hundreds (100–900, incl. sampi ϡ=900).',
    source: {
      text: 'Gow, James. "The Greek Numerical Alphabet." The Journal of Philology 12 (1883): 278–284.',
      url: 'https://archive.org/details/journalofphilolo12claruoft',
      quote: 'But at some date, at present unknown, the Greeks adopted the practice of using the letters of the alphabet in order as their numeral signs, and this style ultimately became universal among Greek-speaking peoples.',
      note: 'Gow 1883, p.279. Verified worked examples: λόγος = 373; θεός = 284; Ἰησοῦς = 888.',
    },
  },
  ordinal: {
    name: 'ordinal',
    englishName: 'Ordinal Value',
    description:
      'Each letter valued by its position in the 24-letter alphabet (α=1 … ω=24). Archaic letters (ϛ, ϟ, ϡ) have no ordinal position.',
    source: {
      text: 'Barry, Kieren. The Greek Qabalah: Alphabetic Mysticism and Numerology in the Ancient World. York Beach, ME: Samuel Weiser, 1999.',
      note: 'Barry catalogues the ordinal numeration (A=1 … Ω=24) alongside the acrophonic and Milesian systems. Letters-as-ordinals are ancient (manuscript/book enumeration, e.g. the lettered books of Aristotle\'s Metaphysics α–ω), but summing ordinal positions as a word value is a modern analytical application (cf. Hebrew Mispar Siduri); no ancient source names an ordinal *value* system. See bible-sources barry1999 / dionysiusThrax.',
    },
  },
  reduced: {
    name: 'reduced',
    greekName: 'πυθμήν',
    englishName: 'Pythmēn (Root / Digital Root)',
    description:
      'The "root" (πυθμήν): the standard value reduced to a single digit by repeated digit-summing.',
    source: {
      text: 'Hippolytus. Refutation of All Heresies, Book IV, Ch. 14. Translated by J. H. MacMahon, 1868.',
      url: 'https://www.newadvent.org/fathers/050104.htm',
      quote: 'They affirm that there is a root of each of the numbers.',
      note: 'MacMahon English translation; the method reduces a name to a single-digit "root" (e.g. Agamemnon = 36 → root 9). The Greek term is πυθμήν; a Greek-language quote is to be back-filled from a Greek edition.',
    },
  },
};

/**
 * List available Greek system names.
 */
export function listGreekSystems(): string[] {
  return Object.keys(GREEK_SYSTEMS);
}

/**
 * Get Greek system metadata by name.
 */
export function getGreekSystem(name: string): GreekSystem | undefined {
  return GREEK_SYSTEMS[name];
}
