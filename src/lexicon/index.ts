/**
 * Lexicon module for looking up Strong's numbers and lemmas.
 */

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
  type StrongsLookup,
  type LemmaLookup,
  type DefinitionSearch,
  type TransliterationResult,
} from './registry.js';
