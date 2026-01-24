/**
 * @metaxia/scriptures
 *
 * Scripture text and analyzer library for TypeScript/JavaScript.
 * Supports gematria calculations, morphology parsing, Strong's numbers, and verse queries.
 */

import { listEditions as _listEditions } from './registry.js';

// Version
export const VERSION = '0.1.0';

// Models
export * from './models/index.js';

// Registry
export {
  registerSource,
  unregisterSource,
  getSource,
  listEditions,
  getAllSources,
  hasEdition,
  clearSources,
  type ScriptureSource,
  type VerseLoader,
  type ChapterLoader,
  type CacheLoader,
  type BooksLister,
} from './registry.js';

// Errors
export {
  EditionNotFoundError,
  BookNotFoundError,
  VerseNotFoundError,
  GematriaError,
} from './errors.js';

// Hebrew (gematria + temurah)
export * as hebrew from './hebrew/index.js';

// Greek (isopsephy)
export * as greek from './greek/index.js';

// Direct computation exports for convenience
export { computeHebrew, isHebrew } from './gematria/hebrew.js';
export { computeGreek, isGreek } from './gematria/greek.js';
export { computeEnglish, isEnglish } from './gematria/english.js';
export { detectLanguage, computeValue } from './gematria/index.js';

// Morphology
export * as morphology from './morphology/index.js';
export {
  HebrewMorphologyParser,
  parseLemma,
  parseMorphCode,
  getWordComponents,
} from './morphology/index.js';

// Lexicon
export * as lexicon from './lexicon/index.js';
export {
  registerLexicon,
  unregisterLexicon,
  getLexicon,
  listLexicons,
  getAllLexicons,
  hasLexicon,
  clearLexicons,
  normalizeStrongs,
  lookupStrongs,
  lookupLemma,
  getTransliteration,
  type LexiconSource,
  type LookupOptions,
  type TransliterationResult,
} from './lexicon/index.js';

// Query functions
export {
  getVerse,
  getChapter,
  getVersesInRange,
  getParallelVerses,
  listBooks,
  type GetVerseOptions,
} from './query/verse.js';

// Search types (implementations planned for future release)
export type {
  TextSearchResult,
  MorphologySearchResult,
  StrongsSearchResult,
  GematriaSearchResult,
  TextSearchOptions,
  MorphologySearchOptions,
  StrongsSearchOptions,
  GematriaSearchOptions,
} from './query/search.js';

// Default export with main functions
export default {
  VERSION,
  getVerse: async (book: string, chapter: number, verse: number, options: { edition: string }) => {
    const { getVerse } = await import('./query/verse.js');
    return getVerse(book, chapter, verse, options);
  },
  listEditions: _listEditions,
};
