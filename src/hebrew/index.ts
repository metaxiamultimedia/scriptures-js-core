/**
 * Hebrew Language Utilities
 *
 * Provides gematria (numeric value) and temurah (letter substitution) systems
 * based on primary historical sources.
 *
 * @example
 * ```typescript
 * import { hebrew } from '@metaxia/scriptures-core';
 *
 * // Gematria - 9 systems with full source citations
 * hebrew.gematria.misparHechrachi('שלום')  // 376 (standard value)
 * hebrew.gematria.misparGadol('שלום')      // 376 (major value)
 * hebrew.gematria.misparKatan('שלום')      // 16  (reduced value)
 *
 * // Temurah - 2 ciphers
 * hebrew.temurah.atbash('בבל')  // 'ששכ' (Babel -> Sheshakh)
 * hebrew.temurah.albam('אלהים') // 'למהיב'
 * ```
 *
 * ## Primary Sources (Public Domain)
 *
 * ### Jewish Encyclopedia (1903)
 *
 * Schechter, Solomon, and Caspar Levias. "Gematria." *Jewish Encyclopedia*,
 *   vol. 5, 589–92. New York: Funk and Wagnalls, 1903.
 *
 * - Jewish Encyclopedia: https://www.jewishencyclopedia.com/articles/6564-gematria
 * - Internet Archive (Vol. 5): https://archive.org/details/TheJewishEncyclopediaFunkWagnallVolVDreyfusBrisacGoat1902
 *
 * ### Pardes Rimonim (1548)
 *
 * Cordovero, Moses ben Jacob. *Pardes Rimmonim* (פרדס רמונים). Kraków, 1592.
 *   First published 1548. Gate 30.
 *
 * - Sefaria: https://www.sefaria.org/Pardes_Rimmonim.30
 * - HebrewBooks: https://hebrewbooks.org/14492
 */

export * as gematria from './gematria/index.js';
export * as temurah from './temurah/index.js';

// Re-export types for convenience
export type {
  GematriaOptions,
  GematriaResult,
  GematriaSystem,
  LetterValueTable,
  SourceCitation,
} from './gematria/types.js';

export type {
  TemuraOptions,
  CipherSystem,
} from './temurah/index.js';
