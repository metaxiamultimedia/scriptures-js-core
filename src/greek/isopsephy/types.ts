/**
 * Type definitions for Greek isopsephy.
 */

/**
 * A mapping of Greek letters to their numeric values.
 */
export type LetterValueTable = Record<string, number>;

/**
 * Result of an isopsephy computation with metadata.
 */
export interface IsopsephyResult {
  /** The computed value */
  value: number;
  /** The system used */
  system: string;
  /** Number of Greek letters processed */
  letterCount: number;
  /** Number of words processed */
  wordCount: number;
}
