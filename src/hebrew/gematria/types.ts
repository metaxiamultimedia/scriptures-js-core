/**
 * Type definitions for Hebrew gematria systems.
 */

/**
 * A mapping of Hebrew letters to their numeric values.
 */
export type LetterValueTable = Record<string, number>;

/**
 * Source citation for a gematria system.
 */
export interface SourceCitation {
  /** Source text name */
  text: string;
  /** Section reference (e.g., "E.1") */
  section?: string;
  /** Page number */
  page?: number;
  /** URL to source */
  url?: string;
  /** Exact quote from source */
  quote?: string;
  /** Additional notes about derivation */
  note?: string;
}

/**
 * Complete definition of a gematria system.
 */
export interface GematriaSystem {
  /** System identifier (e.g., "misparHechrachi") */
  name: string;
  /** Hebrew name (e.g., "מספר הכרחי") */
  hebrewName: string;
  /** English name (e.g., "Standard Value") */
  englishName: string;
  /** Description of the system */
  description: string;
  /** Source citation */
  source: SourceCitation;
  /** Letter-value mapping */
  values: LetterValueTable;
}

/**
 * Options for gematria computation.
 */
export interface GematriaOptions {
  /**
   * Musafi modifier - adds count to the result.
   * - 'words': add word count (phrase-level)
   * - 'letters': add letter count (phrase-level)
   *
   * Source: Jewish Encyclopedia (1903), Section E.4
   */
  musafi?: 'words' | 'letters';
}

/**
 * Result of a gematria computation with metadata.
 */
export interface GematriaResult {
  /** The computed value */
  value: number;
  /** The system used */
  system: string;
  /** Number of Hebrew letters processed */
  letterCount: number;
  /** Number of words processed */
  wordCount: number;
  /** Whether musafi was applied */
  musafi?: 'words' | 'letters';
}
