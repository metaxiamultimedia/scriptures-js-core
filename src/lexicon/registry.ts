/**
 * Lexicon registry for lexicon data packages.
 *
 * Lexicon packages register themselves by importing this module and calling registerLexicon().
 */

import type { LexiconEntry, LexiconMetadata } from '../models/types.js';

/**
 * Options for looking up Strong's numbers.
 */
export interface LookupOptions {
  /** Specific lexicon source to query (if omitted, queries all) */
  source?: string;
  /** Language filter */
  language?: 'hebrew' | 'greek';
}

/**
 * Function type for looking up by Strong's number.
 */
export type StrongsLookup = (strongsNumber: string) => Promise<LexiconEntry | undefined>;

/**
 * Function type for looking up by lemma.
 */
export type LemmaLookup = (lemma: string) => Promise<LexiconEntry[]>;

/**
 * Function type for searching definitions.
 */
export type DefinitionSearch = (query: string) => Promise<LexiconEntry[]>;

/**
 * Configuration for a lexicon source.
 */
export interface LexiconSource {
  /** Lexicon identifier (e.g., "stepbible-tbesh") */
  id: string;

  /** Lexicon metadata */
  metadata: LexiconMetadata;

  /** Function to look up by Strong's number */
  lookupStrongs: StrongsLookup;

  /** Function to look up by lemma */
  lookupLemma: LemmaLookup;

  /** Function to search definitions (optional) */
  searchDefinition?: DefinitionSearch;

  /** Path to data directory (for Node.js file access) */
  dataPath?: string;
}

/**
 * Global registry of lexicon sources.
 */
const lexicons: Map<string, LexiconSource> = new Map();

/**
 * Register a lexicon source.
 * Called by lexicon packages when they are imported.
 */
export function registerLexicon(source: LexiconSource): void {
  lexicons.set(source.id, source);
}

/**
 * Unregister a lexicon source.
 */
export function unregisterLexicon(id: string): boolean {
  return lexicons.delete(id);
}

/**
 * Get a registered lexicon by id.
 */
export function getLexicon(id: string): LexiconSource | undefined {
  return lexicons.get(id);
}

/**
 * List all registered lexicon ids.
 */
export function listLexicons(): string[] {
  return Array.from(lexicons.keys()).sort();
}

/**
 * Get all registered lexicon sources.
 */
export function getAllLexicons(): Map<string, LexiconSource> {
  return new Map(lexicons);
}

/**
 * Check if a lexicon is registered.
 */
export function hasLexicon(id: string): boolean {
  return lexicons.has(id);
}

/**
 * Clear all registered lexicons (mainly for testing).
 */
export function clearLexicons(): void {
  lexicons.clear();
}

/**
 * Normalize a Strong's number to canonical form.
 * Handles variations like "H1", "H0001", "H00001", "h1" → "H0001"
 */
export function normalizeStrongs(strongsNumber: string): string {
  const match = strongsNumber.match(/^([HGhg])(\d+)([a-zA-Z]?)$/);
  if (!match) {
    return strongsNumber;
  }
  const [, prefix, num, suffix] = match;
  const paddedNum = num.padStart(4, '0');
  return `${prefix.toUpperCase()}${paddedNum}${suffix.toLowerCase()}`;
}

/**
 * Look up a Strong's number across all registered lexicons.
 * Returns all matching entries from all sources.
 */
export async function lookupStrongs(
  strongsNumber: string,
  options: LookupOptions = {}
): Promise<LexiconEntry[]> {
  const normalized = normalizeStrongs(strongsNumber);
  const results: LexiconEntry[] = [];

  // Determine language from Strong's prefix if not specified
  const lang = options.language ?? (normalized.startsWith('H') ? 'hebrew' : 'greek');

  // If specific source requested, only query that one
  if (options.source) {
    const source = lexicons.get(options.source);
    if (source) {
      const entry = await source.lookupStrongs(normalized);
      if (entry) {
        results.push(entry);
      }
    }
    return results;
  }

  // Query all matching lexicons
  for (const source of lexicons.values()) {
    if (source.metadata.language !== lang) {
      continue;
    }
    const entry = await source.lookupStrongs(normalized);
    if (entry) {
      results.push(entry);
    }
  }

  return results;
}

/**
 * Look up a lemma across all registered lexicons.
 * Returns all matching entries from all sources.
 */
export async function lookupLemma(
  lemma: string,
  options: LookupOptions = {}
): Promise<LexiconEntry[]> {
  const results: LexiconEntry[] = [];

  // If specific source requested, only query that one
  if (options.source) {
    const source = lexicons.get(options.source);
    if (source) {
      const entries = await source.lookupLemma(lemma);
      results.push(...entries);
    }
    return results;
  }

  // Query all lexicons (or filter by language)
  for (const source of lexicons.values()) {
    if (options.language && source.metadata.language !== options.language) {
      continue;
    }
    const entries = await source.lookupLemma(lemma);
    results.push(...entries);
  }

  return results;
}

/**
 * Hebrew prefix codes mapped to their Strong's numbers (H9xxx series).
 * These are used in OpenScriptures MorphHB lemma format like "b/7225".
 */
const HEBREW_PREFIX_TO_STRONGS: Record<string, string> = {
  'b': 'H9003',  // בְּ - in/on/with (beth)
  'c': 'H9002',  // וְ - and (conjunctive vav)
  'd': 'H9009',  // הַ - the (article)
  'k': 'H9004',  // כְּ - like/as (kaph)
  'l': 'H9005',  // לְ - to/for (lamed)
  'm': 'H9006',  // מִ - from (mem)
  's': 'H9007',  // שׁ - which/that (shin)
};

/**
 * Result of transliteration lookup.
 */
export interface TransliterationResult {
  /** Combined full transliteration */
  transliteration: string;
  /** Individual parts with their Strong's numbers */
  parts: Array<{
    strongs: string;
    transliteration: string;
    type: 'prefix' | 'root';
  }>;
}

/**
 * Parse an OpenScriptures-style lemma into prefix codes and root Strong's number.
 * Examples:
 *   "b/7225" -> { prefixes: ["b"], root: "7225" }
 *   "c/d/776" -> { prefixes: ["c", "d"], root: "776" }
 *   "430" -> { prefixes: [], root: "430" }
 */
function parseLemma(lemma: string): { prefixes: string[]; root: string } {
  const parts = lemma.split('/');
  const root = parts.pop() || '';
  // Filter to only known prefix codes, ignore suffixes like "a" in "1254 a"
  const prefixes = parts.filter(p => p in HEBREW_PREFIX_TO_STRONGS);
  return { prefixes, root };
}

/**
 * Get the full transliteration for a word given its lemma.
 * Handles OpenScriptures-style lemmas with prefix codes (e.g., "b/7225").
 *
 * @param lemma - The lemma string (e.g., "b/7225", "c/d/776", "430")
 * @param options - Lookup options
 * @returns TransliterationResult with combined transliteration and individual parts
 */
export async function getTransliteration(
  lemma: string,
  options: LookupOptions = {}
): Promise<TransliterationResult | undefined> {
  const { prefixes, root } = parseLemma(lemma);
  const parts: TransliterationResult['parts'] = [];

  // Look up prefix transliterations
  for (const prefix of prefixes) {
    const strongsNum = HEBREW_PREFIX_TO_STRONGS[prefix];
    if (strongsNum) {
      const entries = await lookupStrongs(strongsNum, { ...options, language: 'hebrew' });
      const entry = entries[0];
      if (entry?.transliteration) {
        parts.push({
          strongs: strongsNum,
          transliteration: entry.transliteration,
          type: 'prefix',
        });
      }
    }
  }

  // Look up root transliteration
  // Handle roots like "7225" or "1254 a" (with variant suffix)
  const rootNum = root.split(/\s+/)[0]; // Get just the number part
  if (rootNum && /^\d+$/.test(rootNum)) {
    const strongsNum = `H${rootNum}`;
    const entries = await lookupStrongs(strongsNum, { ...options, language: 'hebrew' });
    const entry = entries[0];
    if (entry?.transliteration) {
      parts.push({
        strongs: strongsNum,
        transliteration: entry.transliteration,
        type: 'root',
      });
    }
  }

  if (parts.length === 0) {
    return undefined;
  }

  // Combine transliterations
  const transliteration = parts.map(p => p.transliteration).join('');

  return { transliteration, parts };
}
