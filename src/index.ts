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

// Versification: mapper + source registry
export {
  mapVerse,
  schemeFor,
  isMappingReliable,
  EDITION_SCHEME,
  MT_LXX_DIVERGENT_BOOKS,
  registerVersification,
  unregisterVersification,
  getVersificationSources,
  type Scheme,
  type Ref,
  type VersificationSource,
} from './versification/index.js';

// Errors
export {
  EditionNotFoundError,
  BookNotFoundError,
  VerseNotFoundError,
  GematriaError,
} from './errors.js';

// Language namespaces
export * as hebrew from './hebrew/index.js';
export * as greek from './greek/index.js';

// Gematria
export * as gematria from './gematria/index.js';
export {
  compute as computeGematria,
  computeValue as computeGematriaValue,
  computePhrase,
  computeHebrew,
  computeGreek,
  computeEnglish,
  detectLanguage,
  isHebrew,
  isGreek,
  listMethods as listGematriaMethods,
} from './gematria/index.js';
export type { PhraseGematria } from './gematria/index.js';

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

// Names (proper nouns: people, places, other named entities)
export * as names from './names/index.js';
export {
  registerProperNoun,
  unregisterProperNoun,
  getProperNounSource,
  listProperNounSources,
  getAllProperNounSources,
  hasProperNounSource,
  clearProperNouns,
  lookupName,
  lookupStrongsName,
  findNamesByRef,
  type ProperNounSource,
  type NameLookupOptions,
} from './names/index.js';

// Unified cipher catalog — detailed source metadata for every gematria/
// isopsephy/temurah system across all languages (consumed by the site + agents).
export {
  getAllCiphers,
  getCipher,
  listCiphers,
  hasCipher,
} from './ciphers/catalog.js';
export type {
  CipherCatalogEntry,
  CipherKind,
  CipherLanguage,
  SourceCitation,
} from './models/types.js';

// Transliteration (canonical SBL — issue #2)
export {
  transliterate,
  transliterateGreek,
  detectTranslitLanguage,
  type TranslitLanguage,
} from './transliteration/index.js';

// Query functions
export {
  getVerse,
  getChapter,
  getVersesInRange,
  getParallelVerses,
  editionHasVerse,
  mapVerseToEdition,
  listBooks,
  getVerseCounts,
  getVerseTotal,
  type GetVerseOptions,
} from './query/verse.js';

// Search types (text/morphology/strongs implementations planned for future release)
export type {
  TextSearchResult,
  MorphologySearchResult,
  StrongsSearchResult,
  GematriaSearchResult,
  TextSearchOptions,
  MorphologySearchOptions,
  StrongsSearchOptions,
  GematriaSearchOptions,
  GematriaPhraseSearchOptions,
  GematriaPhraseSearchResult,
  PhraseBoundary,
} from './query/search.js';

// Phrase gematria search (implemented)
export { searchByGematriaPhrase, PHRASE_MAX_WORDS_CAP } from './query/search.js';

// Default export with main functions
export default {
  VERSION,
  getVerse: async (book: string, chapter: number, verse: number, options: { edition: string }) => {
    const { getVerse } = await import('./query/verse.js');
    return getVerse(book, chapter, verse, options);
  },
  listEditions: _listEditions,
};
