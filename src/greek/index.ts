/**
 * Greek Language Utilities
 *
 * Provides isopsephy (numeric value) calculations based on primary historical sources.
 *
 * @example
 * ```typescript
 * import { greek } from '@metaxia/scriptures-core';
 *
 * // Isopsephy - 3 systems with full source citations
 * greek.isopsephy.computeStandard('λόγος')  // 373 (standard value)
 * greek.isopsephy.computeOrdinal('λόγος')   // 67  (ordinal value)
 * greek.isopsephy.computeReduced('λόγος')   // 4   (pythmen/digital root)
 * ```
 *
 * ## Primary Sources (Public Domain)
 *
 * ### Standard Isopsephy (ἰσοψηφία)
 *
 * Gow, James. "The Greek Numerical Alphabet." *The Journal of Philology* 12
 *   (1883): 278–84.
 *
 * - Internet Archive: https://archive.org/details/journalofphilolo12claruoft
 *
 * ### Ordinal (στοιχεῖα)
 *
 * Dionysius Thrax. *Ars Grammatica* (Τέχνη Γραμματική). Section 6. 2nd century BCE.
 *   Edited by Gustav Uhlig. Leipzig: Teubner, 1883.
 *
 * - Internet Archive: https://archive.org/details/dionysiithracis00unkngoog
 * - Wikisource (English): https://en.wikisource.org/wiki/The_grammar_of_Dionysios_Thrax
 *
 * ### Reduced/Pythmen (πυθμήν)
 *
 * Hippolytus of Rome. *Refutation of All Heresies*. Book IV, Chapter 14 (~220 CE).
 *   Trans. J. H. MacMahon. In *Ante-Nicene Fathers*, vol. 5. Buffalo, NY:
 *   Christian Literature Publishing, 1886.
 *
 * - Internet Archive: https://archive.org/details/antenicenefathe00444gut
 * - Early Church Texts: https://www.earlychurchtexts.com/public/hippolytus_refutation_book4.htm
 * - New Advent: https://www.newadvent.org/fathers/050104.htm
 */

export * as isopsephy from './isopsephy/index.js';

// Re-export types for convenience
export type { LetterValueTable, IsopsephyResult } from './isopsephy/types.js';

// Re-export key functions for convenience
export {
  isGreek,
  computeStandard,
  computeOrdinal,
  computeReduced,
  computeAll,
} from './isopsephy/index.js';
