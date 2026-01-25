/**
 * Type definitions for Hebrew gematria systems.
 */

/**
 * A mapping of Hebrew letters to their numeric values.
 */
export type LetterValueTable = Record<string, number>;

/**
 * Result of a gematria computation.
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
}
