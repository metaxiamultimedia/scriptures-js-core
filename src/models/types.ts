/**
 * Core type definitions for the scriptures library.
 */

/**
 * Morphological code describing grammatical features of a word.
 */
export interface Morphology {
  code: string;
  description?: string;
}

/**
 * An entry in a lexicon describing a lemma and its definition.
 */
export interface LexiconEntry {
  /** Source lexicon identifier (e.g., "stepbible-tbesh") */
  source?: string;
  /** Extended Strong's number (e.g., H0001a, G3056) */
  strongsExtended?: string;
  /** Disambiguated Strong's number */
  strongsDisambiguated?: string;
  /** Unified Strong's number */
  strongsUnified?: string;
  /** Lemma in original language (Hebrew/Greek Unicode) */
  lemma: string;
  /** Transliteration (romanized form) */
  transliteration?: string;
  /** Morphology code (e.g., "H:N-M" for Hebrew Noun-Masculine) */
  morphology?: string;
  /** Brief gloss (1-2 word meaning) */
  gloss?: string;
  /** Full definition */
  definition?: string;
}

/**
 * Metadata for a lexicon source.
 */
export interface LexiconMetadata {
  /** Lexicon identifier (e.g., "stepbible-tbesh") */
  id: string;
  /** Display name */
  name: string;
  /** Language this lexicon covers */
  language: 'hebrew' | 'greek';
  /** License information */
  license: string;
  /** Source attribution */
  source?: string;
  /** Source URLs */
  urls?: string[];
}

/**
 * Stores mapping from English word to source language word/component.
 */
export interface Alignment {
  targetEdition: string;
  targetBook: string;
  targetChapter: number;
  targetVerse: number;
  targetPositions: number[];
  targetTexts: string[];
  targetPart?: string;
  targetPartText?: string;
  targetStrongs?: string[];
  confident: boolean;
  method: string;
  notes?: string;
}

/**
 * Gematria values for different calculation methods.
 */
export interface GematriaValues {
  standard: number;
  ordinal: number;
  reduced: number;
  [key: string]: number;
}

/**
 * Options for verse gematria calculation.
 */
export interface VerseGematriaOptions {
  /**
   * Which variant to use for Qere/Ketiv words.
   * - 'qere': use the traditional reading (default)
   * - 'ketiv': use the written consonantal text
   */
  variant?: 'qere' | 'ketiv';

  /**
   * Whether to include colophon words in the calculation.
   * Default: false
   */
  includeColophons?: boolean;
}

/**
 * Word metadata including colophon information.
 */
export interface WordMetadata {
  colophon?: boolean;
  colophonType?: string;
  [key: string]: unknown;
}

/**
 * A word token appearing in a Verse.
 */
export interface Word {
  position: number;
  text: string;
  lexiconEntry?: LexiconEntry;
  morphology?: Morphology;
  metadata?: WordMetadata;
  strongs?: string[];
  alignment?: Alignment;
  gematria?: GematriaValues;
  lemma?: string | string[];
  morph?: string;
  strong?: string;

  /**
   * True if this word is part of a colophon (subscription at end of epistles).
   * Colophon words are excluded from default gematria calculations.
   */
  isColophon?: boolean;

  /**
   * For Qere/Ketiv variants, indicates which reading this word represents.
   * - 'ketiv': the written consonantal text
   * - 'qere': the traditional vocalized reading
   * Mutually exclusive. Most words have no variant (undefined).
   */
  variant?: 'ketiv' | 'qere';
}

/**
 * Verse metadata including colophon information.
 */
export interface VerseMetadata {
  hasColophon?: boolean;
  colophonWordRange?: [number, number];
  colophonType?: string;
  [key: string]: unknown;
}

/**
 * Single verse of scripture identified by chapter and number.
 */
export interface Verse {
  id?: string;
  book?: string;
  chapter: number;
  number: number;
  text?: string;
  words: Word[];
  /** Gematria computed from words, excluding colophons and using Qere */
  gematria?: GematriaValues;
  /** Gematria computed from full verse text, including colophons */
  gematriaWithColophons?: GematriaValues;
  /**
   * Get gematria with custom options.
   * @param options - Options for variant selection and colophon inclusion
   * @returns GematriaValues proxy that computes on property access
   */
  getGematria?: (options: VerseGematriaOptions) => GematriaValues;
  metadata?: VerseMetadata;
}

/**
 * A chapter containing verses.
 */
export interface Chapter {
  chapter: number;
  verses: Verse[];
}

/**
 * A book of scripture.
 */
export interface Book {
  name: string;
  order: number;
  chapters: Map<number, Chapter>;
}

/**
 * A complete scripture text (e.g., KJV or Masoretic Text).
 */
export interface Scripture {
  name: string;
  language: string;
  abbreviation?: string;
  books: Book[];
}

/**
 * A collection of books forming a canon (e.g., Old Testament).
 */
export interface Canon {
  name: string;
  description?: string;
  books: Book[];
}

/**
 * Metadata for a scripture edition.
 */
export interface EditionMetadata {
  abbreviation: string;
  name: string;
  language: string;
  license: string;
  source?: string;
  urls?: string[];
}

/**
 * Raw verse data as stored in JSON files.
 */
export interface VerseData {
  id?: string;
  text?: string;
  words?: Word[];
  gematria?: GematriaValues;
  metadata?: VerseMetadata;
}
