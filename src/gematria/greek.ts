/**
 * Greek Isopsephy - Re-exports from greek/isopsephy module.
 *
 * This module provides backwards compatibility. For new code, import directly
 * from 'greek/isopsephy' instead.
 *
 * @module gematria/greek
 * @see {@link ../greek/isopsephy/index.js} for full documentation and sources
 */

import type { GematriaValues } from '../models/types.js';

// Re-export everything from the canonical location
export {
  // Letter-value tables
  STANDARD,
  ORDINAL,
  ARCHAIC_LETTERS,
  // Detection and extraction
  isGreek,
  removeDiacritics,
  extractGreekLetters,
  // Computation functions
  computeStandard,
  computeOrdinal,
  computeReduced,
  computeAll,
  listSystems,
} from '../greek/isopsephy/index.js';

// Import for use in computeGreek
import {
  computeStandard,
  computeOrdinal,
  computeReduced,
} from '../greek/isopsephy/index.js';

/**
 * Compute all Greek isopsephy values for the given text.
 *
 * Returns standard (ἰσοψηφία), ordinal, and reduced (πυθμήν) values.
 *
 * @throws {Error} If text contains archaic letters (for ordinal calculation)
 */
export function computeGreek(text: string): GematriaValues {
  return {
    standard: computeStandard(text),
    ordinal: computeOrdinal(text),
    reduced: computeReduced(text),
  };
}
