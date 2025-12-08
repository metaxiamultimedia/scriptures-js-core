/**
 * Hebrew and Aramaic morphology parser for OpenScriptures Hebrew Bible data.
 *
 * This parser breaks down Hebrew and Aramaic words into their morphological components:
 * - Prefixes (prepositions, conjunctions, articles)
 * - Root (main lemma)
 * - Suffixes (pronominal, directional, etc.)
 *
 * Based on OpenScriptures morphology codes from https://github.com/openscriptures/morphhb
 *
 * Hebrew morphology codes start with 'H' (e.g., HR/Ncfsa, HVqp3ms)
 * Aramaic morphology codes start with 'A' (e.g., ANp, AC/Np, AVqrmsa)
 */

/**
 * Prefix information from parsing.
 */
export interface PrefixInfo {
  type: string;
  meaning?: string;
  codes: string[];
}

/**
 * Root information from parsing.
 */
export interface RootInfo {
  lemma: string;
  partOfSpeech?: string;
  text: string;
}

/**
 * Parsed lemma result.
 */
export interface ParsedLemma {
  prefix?: string;
  root?: string;
}

/**
 * Parsed morphology code result.
 */
export interface ParsedMorphCode {
  hasPrefix: boolean;
  prefixType?: string;
  rootPartOfSpeech?: string;
  features: Record<string, unknown>;
  language?: 'hebrew' | 'aramaic';
}

/**
 * Word components result.
 */
export interface WordComponents {
  prefix?: PrefixInfo;
  root?: RootInfo;
  suffix?: unknown;
}

/**
 * Word data input for component parsing.
 */
export interface WordData {
  text?: string;
  lemma?: string;
  morph?: string;
}

/**
 * Prefix codes in lemmas (before slash).
 */
const PREFIX_CODES: Record<string, { type: string; meaning: string }> = {
  'b': { type: 'preposition', meaning: 'in/with' },
  'c': { type: 'conjunction', meaning: 'and' },
  'd': { type: 'article', meaning: 'the' },
  'k': { type: 'preposition', meaning: 'like/as' },
  'l': { type: 'preposition', meaning: 'to/for' },
  'm': { type: 'preposition', meaning: 'from' },
  's': { type: 'preposition', meaning: 'which/that' },
};

/**
 * Morphology code prefix mappings.
 */
const MORPH_PREFIX_CODES: Record<string, string> = {
  'R': 'preposition',
  'C': 'conjunction',
  'T': 'article/particle',
  'A': 'interrogative',
};

/**
 * Part of speech codes (after prefix codes and slash).
 */
const POS_CODES: Record<string, string> = {
  'N': 'noun',
  'V': 'verb',
  'A': 'adjective',
  'P': 'pronoun',
  'R': 'preposition',
  'D': 'adverb',
  'C': 'conjunction',
  'T': 'particle',
};

/**
 * Parse a lemma string to extract prefix and root.
 *
 * @param lemmaString - Lemma like "b/7225", "c/853", "430", "c/b/7225"
 * @returns Object with 'prefix' (combined prefix codes or undefined) and 'root' (Strong's number)
 *
 * @example
 * parseLemma("b/7225") // { prefix: 'b', root: '7225' }
 * parseLemma("c/b/7225") // { prefix: 'c/b', root: '7225' }
 * parseLemma("430") // { prefix: undefined, root: '430' }
 */
export function parseLemma(lemmaString: string): ParsedLemma {
  if (!lemmaString) {
    return { prefix: undefined, root: undefined };
  }

  // Remove any trailing letters (like "1254 a" -> "1254")
  const trimmed = lemmaString.trim();

  // Split by slash
  const parts = trimmed.split('/');

  if (parts.length === 1) {
    // No slash, extract just the number
    const root = parts[0].replace(/[^\d]/g, '');
    return { prefix: undefined, root: root || parts[0] };
  }

  // Multiple parts - last one is root, rest are prefixes
  const rootPart = parts[parts.length - 1];
  const root = rootPart.replace(/[^\d]/g, '');
  const prefix = parts.slice(0, -1).join('/');

  return {
    prefix: prefix || undefined,
    root: root || rootPart,
  };
}

/**
 * Parse a Hebrew or Aramaic morphology code to identify structure.
 *
 * @param morphCode - Morphology code like "HR/Ncfsa", "HVqp3ms", "HTd/Ncmpa" (Hebrew)
 *                    or "ANp", "AC/Np", "AVqrmsa" (Aramaic)
 * @returns Morphological analysis
 *
 * @example
 * parseMorphCode("HR/Ncfsa")
 * // { hasPrefix: true, prefixType: 'preposition', language: 'hebrew', ... }
 * parseMorphCode("ANp")
 * // { hasPrefix: false, language: 'aramaic', ... }
 */
export function parseMorphCode(morphCode: string): ParsedMorphCode {
  if (!morphCode) {
    return {
      hasPrefix: false,
      prefixType: undefined,
      rootPartOfSpeech: undefined,
      features: {},
      language: undefined,
    };
  }

  // Detect language: 'H' for Hebrew, 'A' for Aramaic
  let language: 'hebrew' | 'aramaic' | undefined;
  let code = morphCode;

  if (morphCode.startsWith('H')) {
    language = 'hebrew';
    code = morphCode.slice(1);
  } else if (morphCode.startsWith('A')) {
    language = 'aramaic';
    code = morphCode.slice(1);
  }

  // Check for slash indicating prefix
  const hasSlash = code.includes('/');
  let prefixType: string | undefined;
  let rootPos: string | undefined;

  if (hasSlash) {
    const [prefixPart, rootPart] = code.split('/', 2);

    // Identify prefix type(s) from prefix_part
    const prefixTypes: string[] = [];
    for (const char of prefixPart) {
      if (MORPH_PREFIX_CODES[char]) {
        prefixTypes.push(MORPH_PREFIX_CODES[char]);
      }
    }

    prefixType = prefixTypes.length > 0 ? prefixTypes.join('+') : 'unknown';

    // Parse root part of speech
    if (rootPart && POS_CODES[rootPart[0]]) {
      rootPos = POS_CODES[rootPart[0]];
    }
  } else {
    // No prefix, just parse the part of speech
    if (code && POS_CODES[code[0]]) {
      rootPos = POS_CODES[code[0]];
    }
  }

  return {
    hasPrefix: hasSlash,
    prefixType,
    rootPartOfSpeech: rootPos,
    features: {},
    language,
  };
}

/**
 * Combine lemma and morphology parsing to identify word components.
 *
 * @param wordData - Object with 'text', 'lemma', and 'morph' keys
 * @returns Object with 'prefix', 'root', and 'suffix' component information
 */
export function getWordComponents(wordData: WordData): WordComponents {
  const lemmaInfo = parseLemma(wordData.lemma || '');
  const morphInfo = parseMorphCode(wordData.morph || '');

  const result: WordComponents = {
    prefix: undefined,
    root: undefined,
    suffix: undefined,
  };

  // Build prefix info
  if (lemmaInfo.prefix) {
    const prefixCodes = lemmaInfo.prefix.split('/');
    const prefixMeanings: string[] = [];
    const prefixTypes: string[] = [];

    for (const code of prefixCodes) {
      if (PREFIX_CODES[code]) {
        prefixTypes.push(PREFIX_CODES[code].type);
        prefixMeanings.push(PREFIX_CODES[code].meaning);
      }
    }

    result.prefix = {
      type: prefixTypes.length > 0 ? prefixTypes.join('+') : 'unknown',
      meaning: prefixMeanings.length > 0 ? prefixMeanings.join('+') : undefined,
      codes: prefixCodes,
    };
  }

  // Build root info
  if (lemmaInfo.root) {
    result.root = {
      lemma: lemmaInfo.root,
      partOfSpeech: morphInfo.rootPartOfSpeech,
      text: wordData.text || '',
    };
  }

  return result;
}

/**
 * Get the meaning of a prefix code.
 *
 * @param prefixCode - Single letter prefix code like 'b', 'c', 'd'
 * @returns Meaning string or undefined
 */
export function getPrefixMeaning(prefixCode: string): string | undefined {
  return PREFIX_CODES[prefixCode]?.meaning;
}

/**
 * Hebrew morphology parser class (for compatibility with Python API).
 */
export class HebrewMorphologyParser {
  parseLemma = parseLemma;
  parseMorphCode = parseMorphCode;
  getWordComponents = getWordComponents;
  getPrefixMeaning = getPrefixMeaning;
}
