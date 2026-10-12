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
    quoteHebrew?: string;
    translation?: string;
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
 * "אל בם גן דס הע וף זץ חק טר יש כת"
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
 * Quote: "אל בם גן דס הע וף זץ חק טר יש כת"
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
// AVGAD Cipher
// ============================================================================

/**
 * Build Avgad mapping (each letter -> the next letter of the alphabet; ת -> א).
 */
function buildAvgadMapping(): Record<string, string> {
  const mapping: Record<string, string> = {};
  const len = HEBREW_ALPHABET.length;

  for (let i = 0; i < len; i++) {
    mapping[HEBREW_ALPHABET[i]] = HEBREW_ALPHABET[(i + 1) % len];
  }

  return mapping;
}

const AVGAD_MAPPING = buildAvgadMapping();

/**
 * Avgad (אבג״ד) - Next-letter shift cipher
 *
 * Each letter is replaced by the next letter of the 22-letter alphabet, with
 * ת wrapping to א: א→ב, ב→ג, … ש→ת, ת→א.
 *
 * Source: Pardes Rimonim (1548), Gate 30, Chapter 5.
 * The mezuzah name כוזו במוכסו כוזו encodes יהוה אלהינו יהוה under this shift.
 */
export function avgad(text: string, options: TemuraOptions = {}): string {
  const { preserveFinalForms = false } = options;

  return [...text].map(char => {
    const isFinal = char in FINAL_TO_STANDARD;
    const standardLetter = isFinal ? FINAL_TO_STANDARD[char] : char;

    if (standardLetter in AVGAD_MAPPING) {
      const result = AVGAD_MAPPING[standardLetter];

      if (preserveFinalForms && isFinal && result in STANDARD_TO_FINAL) {
        return STANDARD_TO_FINAL[result];
      }

      return result;
    }

    return char;
  }).join('');
}

// ============================================================================
// ATBACH Cipher
// ============================================================================

/**
 * Atbach pairs: letters whose standard values sum to 10 / 100 / 500, with the
 * two leftovers (ה, נ) paired together.
 */
const ATBACH_PAIRS: [string, string][] = [
  ['א', 'ט'], ['ב', 'ח'], ['ג', 'ז'], ['ד', 'ו'],   // units → 10
  ['י', 'צ'], ['כ', 'פ'], ['ל', 'ע'], ['מ', 'ס'],   // tens → 100
  ['ק', 'ת'], ['ר', 'ש'],                           // hundreds → 500
  ['ה', 'נ'],                                        // leftovers
];

function buildAtbachMapping(): Record<string, string> {
  const mapping: Record<string, string> = {};
  for (const [a, b] of ATBACH_PAIRS) {
    mapping[a] = b;
    mapping[b] = a;
  }
  return mapping;
}

const ATBACH_MAPPING = buildAtbachMapping();

/**
 * Atbach (אטב״ח) - Sum-to-10/100/500 cipher of R. Hiyya
 *
 * Letters are paired so their standard values sum to 10 (units), 100 (tens),
 * or 500 (hundreds); the two leftovers ה and נ pair together:
 * א↔ט ב↔ח ג↔ז ד↔ו ה↔נ י↔צ כ↔פ ל↔ע מ↔ס ק↔ת ר↔ש
 *
 * Source: Talmud Bavli, Sukkah 52b ("באטב״ח של רבי חייא"); Pardes Rimonim 30:5.
 */
export function atbach(text: string, options: TemuraOptions = {}): string {
  const { preserveFinalForms = false } = options;

  return [...text].map(char => {
    const isFinal = char in FINAL_TO_STANDARD;
    const standardLetter = isFinal ? FINAL_TO_STANDARD[char] : char;

    if (standardLetter in ATBACH_MAPPING) {
      const result = ATBACH_MAPPING[standardLetter];

      if (preserveFinalForms && isFinal && result in STANDARD_TO_FINAL) {
        return STANDARD_TO_FINAL[result];
      }

      return result;
    }

    return char;
  }).join('');
}

// ============================================================================
// ACHAS BETA Cipher
// ============================================================================

/**
 * Achas-beta groups: the first 21 letters in three groups of seven.
 * Each letter maps to the same slot in the NEXT group (the third wraps to the
 * first); ת is unchanged.
 */
const ACHAS_BETA_GROUPS: string[][] = [
  ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז'],
  ['ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ'],
  ['ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש'],
];

function buildAchasBetaMapping(): Record<string, string> {
  const mapping: Record<string, string> = {};
  for (let gi = 0; gi < ACHAS_BETA_GROUPS.length; gi++) {
    const current = ACHAS_BETA_GROUPS[gi];
    const next = ACHAS_BETA_GROUPS[(gi + 1) % ACHAS_BETA_GROUPS.length];
    for (let i = 0; i < current.length; i++) {
      mapping[current[i]] = next[i];
    }
  }
  mapping['ת'] = 'ת'; // ת is not part of the 21-letter rotation
  return mapping;
}

const ACHAS_BETA_MAPPING = buildAchasBetaMapping();

/**
 * Achas-beta (אח״ס בט״ע) - Three-groups-of-seven rotation cipher
 *
 * The 21 letters א–ש form three groups of seven; each letter maps to the same
 * slot in the next group (third group → first), with ת unchanged:
 * א→ח ב→ט ג→י … ח→ס ט→ע … ס→א ע→ב …
 *
 * Source: Talmud Bavli, Shabbat 104a ("אח״ס בט״ע גי״ף"); Pardes Rimonim 30:6–7.
 */
export function achasBeta(text: string, options: TemuraOptions = {}): string {
  const { preserveFinalForms = false } = options;

  return [...text].map(char => {
    const isFinal = char in FINAL_TO_STANDARD;
    const standardLetter = isFinal ? FINAL_TO_STANDARD[char] : char;

    if (standardLetter in ACHAS_BETA_MAPPING) {
      const result = ACHAS_BETA_MAPPING[standardLetter];

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
      text: 'Pardes Rimonim (1548) + Jewish Encyclopedia (1903)',
      section: 'Pardes Gate 30, Ch. 5-6 (atbash named & illustrated); JE II.2 p.589 (permutative gematria in general — Jer. 25:26 "Sheshach")',
      url: 'https://www.sefaria.org/Pardes_Rimmonim.30.5',
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
      quote: 'אל בם גן דס הע וף זץ חק טר יש כת',
    },
    mapping: ALBAM_MAPPING,
  },
  avgad: {
    name: 'avgad',
    hebrewName: 'אבג״ד',
    description: 'Next-letter shift cipher - each letter maps to the next, ת wraps to א.',
    source: {
      text: 'Pardes Rimonim (1548)',
      section: 'Gate 30, Chapter 5',
      url: 'https://www.sefaria.org/Pardes_Rimmonim.30.5',
      quoteHebrew: 'ידו"ד אלד"ינו ידו"ד המתחלף באבג"ד כוז"ו במוכס"ו כו"זו',
      translation: 'YHWH our God YHWH, transformed by Avgad, becomes כוזו במוכסו כוזו (the mezuzah name).',
    },
    mapping: AVGAD_MAPPING,
  },
  atbach: {
    name: 'atbach',
    hebrewName: 'אטב״ח',
    description: 'Sum-to-10/100/500 cipher of R. Hiyya; leftovers ה↔נ.',
    source: {
      text: 'Talmud Bavli, Sukkah 52b (R. Hiyya); Pardes Rimonim (1548)',
      section: 'Sukkah 52b; Pardes Gate 30, Ch. 5',
      url: 'https://www.sefaria.org/Sukkah.52b',
      quoteHebrew: 'שכן באטב״ח של רבי חייא קורין לסהדה מנון',
      translation: 'For in R. Hiyya\'s atbach cipher, "sahada" (witness) is read as "manon".',
    },
    mapping: ATBACH_MAPPING,
  },
  achasBeta: {
    name: 'achasBeta',
    hebrewName: 'אח״ס בט״ע',
    description: 'Three groups of seven; each letter maps to the next group\'s matching slot. ת unchanged.',
    source: {
      text: 'Talmud Bavli, Shabbat 104a; Pardes Rimonim (1548)',
      section: 'Shabbat 104a; Pardes Gate 30, Ch. 6-7',
      url: 'https://www.sefaria.org/Shabbat.104a',
      quoteHebrew: 'אח״ס בט״ע גי״ף',
    },
    mapping: ACHAS_BETA_MAPPING,
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
