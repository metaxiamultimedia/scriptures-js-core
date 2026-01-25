/**
 * Hebrew Language Utilities
 *
 * Provides gematria (numeric value) systems for Hebrew text.
 *
 * @example
 * ```typescript
 * import { hebrew } from '@metaxia/scriptures-core';
 *
 * hebrew.gematria.misparHechrachi('שלום')  // 376 (standard)
 * hebrew.gematria.misparSiduri('שלום')     // 52  (ordinal)
 * hebrew.gematria.misparKatan('שלום')      // 16  (reduced)
 * ```
 */

export * as gematria from './gematria/index.js';

// Re-export types for convenience
export type {
  GematriaResult,
  LetterValueTable,
} from './gematria/types.js';

export type { SystemName } from './gematria/systems.js';
