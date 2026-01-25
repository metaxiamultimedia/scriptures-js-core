/**
 * Greek Isopsephy Module
 *
 * Provides letter-value tables and computation functions for Greek isopsephy
 * (ἰσοψηφία) with full scholarly citations to public domain sources.
 *
 * ## Systems Included
 *
 * | System | Greek Name | Attribution | Primary Source |
 * |--------|------------|-------------|----------------|
 * | Standard | ἰσοψηφία | Explicit | Gow 1883 |
 * | Ordinal | στοιχεῖα | Explicit | Dionysius Thrax 2nd c. BCE |
 * | Reduced | πυθμήν | Explicit | Hippolytus ~220 CE |
 *
 * ## Usage
 *
 * ```typescript
 * import { isopsephy } from '@metaxia/scriptures-core/greek';
 *
 * // Compute isopsephy values
 * isopsephy.computeStandard('λόγος')  // 373
 * isopsephy.computeOrdinal('λόγος')   // 67
 * isopsephy.computeReduced('λόγος')   // 4
 *
 * // Direct letter-value access
 * isopsephy.STANDARD['α']  // 1
 * isopsephy.ORDINAL['α']   // 1
 * ```
 *
 * @module greek/isopsephy
 */

// Type exports
export type { LetterValueTable, IsopsephyResult } from './types.js';

// Letter-value table exports
export { STANDARD, ORDINAL, ARCHAIC_LETTERS } from './systems.js';

// Computation function exports
export {
  isGreek,
  removeDiacritics,
  extractGreekLetters,
  countWords,
  computeStandard,
  computeOrdinal,
  computeReduced,
  compute,
  computeAll,
  listSystems,
} from './compute.js';
