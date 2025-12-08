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

// Gematria
export * as gematria from './gematria/index.js';
export {
  compute as computeGematria,
  computeValue as computeGematriaValue,
  computeHebrew,
  computeGreek,
  computeEnglish,
  detectLanguage,
  isHebrew,
  isGreek,
  listMethods as listGematriaMethods,
} from './gematria/index.js';

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
