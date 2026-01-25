/**
 * Hebrew Temurah (Letter Substitution Ciphers)
 *
 * Two ciphers derived from primary historical sources:
 * - Atbash: Jewish Encyclopedia (1903) + Pardes Rimonim (1548)
 * - Albam: Pardes Rimonim (1548), Gate 30, Chapter 5
 *
 * Note: Temurah transforms letters into other letters, not numbers.
 * To get a numeric value, apply gematria to the transformed text.
 *
 * @example
 * ```typescript
 * import { hebrew } from '@metaxia/scriptures-core';
 *
 * // Apply Atbash cipher
 * hebrew.temurah.atbash('בבל')  // 'ששכ' (Babel -> Sheshakh)
 *
 * // Apply Albam cipher
 * hebrew.temurah.albam('אלהים')  // 'למהיב'
 *
 * // Combine with gematria
 * const transformed = hebrew.temurah.atbash('בבל');
 * const value = hebrew.gematria.misparHechrachi(transformed);
 * ```
 */

// Standard Hebrew alphabet (22 letters)
const HEBREW_ALPHABET = [
  'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ',
  'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת',
];

// Final letter mappings
const FINAL_TO_STANDARD: Record<string, string> = {
  'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ',
};

const STANDARD_TO_FINAL: Record<string, string> = {
  'כ': 'ך', 'מ': 'ם', 'נ': 'ן', 'פ': 'ף', 'צ': 'ץ',
};

/**
 * Options for cipher transformations.
 */
export interface TemuraOptions {
  /**
   * Whether to preserve final letter forms in output.
   * Default: false
   */
  preserveFinalForms?: boolean;
}

/**
 * Cipher metadata for documentation.
 */
export interface CipherSystem {
  name: string;
  hebrewName: string;
  description: string;
  source: {
    text: string;
    section?: string;
    url?: string;
    quote?: string;
  };
  mapping: Record<string, string>;
}

// ============================================================================
// ATBASH Cipher
// ============================================================================

/**
 * Build Atbash mapping (mirror positions in alphabet).
 */
function buildAtbashMapping(): Record<string, string> {
  const mapping: Record<string, string> = {};
  const len = HEBREW_ALPHABET.length;

  for (let i = 0; i < len; i++) {
    mapping[HEBREW_ALPHABET[i]] = HEBREW_ALPHABET[len - 1 - i];
  }

  return mapping;
}

const ATBASH_MAPPING = buildAtbashMapping();

/**
 * Atbash (אתב״ש) - Mirror position cipher
 *
 * A symmetric cipher where each letter is replaced by its "mirror" position
 * in the alphabet. The first letter maps to the last, second to second-to-last, etc.
 *
 * Sources:
 * - Jewish Encyclopedia (1903), "Gematria", Section II.2, p.589
 * - Pardes Rimonim (1548), Gate 30, Chapters 5-6
 *
 * Biblical examples:
 * - בבל (Babel) -> ששך (Sheshakh) - Jeremiah 25:26
 * - כשדים (Kasdim) -> לב קמי (Lev Kamai) - Jeremiah 51:1
 */
export function atbash(text: string, options: TemuraOptions = {}): string {
  const { preserveFinalForms = false } = options;

  return [...text].map(char => {
    const isFinal = char in FINAL_TO_STANDARD;
    const standardLetter = isFinal ? FINAL_TO_STANDARD[char] : char;

    if (standardLetter in ATBASH_MAPPING) {
      const result = ATBASH_MAPPING[standardLetter];

      if (preserveFinalForms && isFinal && result in STANDARD_TO_FINAL) {
        return STANDARD_TO_FINAL[result];
      }

      return result;
    }

    return char;
  }).join('');
}

// ============================================================================
// ALBAM Cipher
// ============================================================================

/**
 * Build Albam mapping (half-alphabet swap).
 * The 11 letter pairs from Pardes Rimonim 30:5:
 * "אל במ גנ דס הע וף זץ חק טר יש כת"
 */
function buildAlbamMapping(): Record<string, string> {
  const mapping: Record<string, string> = {};
  const halfLen = 11;

  for (let i = 0; i < halfLen; i++) {
    const first = HEBREW_ALPHABET[i];
    const second = HEBREW_ALPHABET[i + halfLen];
    mapping[first] = second;
    mapping[second] = first;
  }

  return mapping;
}

const ALBAM_MAPPING = buildAlbamMapping();

/**
 * Albam (אלב״ם) - Half-alphabet swap cipher
 *
 * A symmetric cipher where the alphabet is split into two halves of 11 letters,
 * and letters are paired sequentially between the halves:
 * א↔ל, ב↔מ, ג↔נ, ד↔ס, ה↔ע, ו↔פ, ז↔צ, ח↔ק, ט↔ר, י↔ש, כ↔ת
 *
 * Source: Pardes Rimonim (1548), Gate 30, Chapter 5
 * Quote: "אל במ גנ דס הע וף זץ חק טר יש כת"
 */
export function albam(text: string, options: TemuraOptions = {}): string {
  const { preserveFinalForms = false } = options;

  return [...text].map(char => {
    const isFinal = char in FINAL_TO_STANDARD;
    const standardLetter = isFinal ? FINAL_TO_STANDARD[char] : char;

    if (standardLetter in ALBAM_MAPPING) {
      const result = ALBAM_MAPPING[standardLetter];

      if (preserveFinalForms && isFinal && result in STANDARD_TO_FINAL) {
        return STANDARD_TO_FINAL[result];
      }

      return result;
    }

    return char;
  }).join('');
}

// ============================================================================
// System Metadata
// ============================================================================

export const CIPHERS: Record<string, CipherSystem> = {
  atbash: {
    name: 'atbash',
    hebrewName: 'אתב״ש',
    description: 'Mirror position cipher - first letter maps to last, etc.',
    source: {
      text: 'Jewish Encyclopedia (1903) + Pardes Rimonim (1548)',
      section: 'JE II.2, p.589; Pardes Gate 30, Ch. 5-6',
      url: 'https://www.jewishencyclopedia.com/articles/6564-gematria',
    },
    mapping: ATBASH_MAPPING,
  },
  albam: {
    name: 'albam',
    hebrewName: 'אלב״ם',
    description: 'Half-alphabet swap cipher - 11 letter pairs.',
    source: {
      text: 'Pardes Rimonim (1548)',
      section: 'Gate 30, Chapter 5',
      url: 'https://www.sefaria.org/Pardes_Rimmonim.30.5',
      quote: 'אל במ גנ דס הע וף זץ חק טר יש כת',
    },
    mapping: ALBAM_MAPPING,
  },
};

/**
 * List available cipher names.
 */
export function listCiphers(): string[] {
  return Object.keys(CIPHERS);
}

/**
 * Get cipher metadata by name.
 */
export function getCipher(name: string): CipherSystem | undefined {
  return CIPHERS[name];
}

/**
 * Get the mapping table for a cipher.
 */
export function getMapping(cipher: 'atbash' | 'albam'): Record<string, string> {
  return cipher === 'atbash' ? { ...ATBASH_MAPPING } : { ...ALBAM_MAPPING };
}
