/**
 * Search types for scripture content.
 *
 * Note: Search function implementations are planned for a future release.
 * These types are exported for consumers who want to build their own search implementations.
 */

/**
 * Search result for text search.
 */
export interface TextSearchResult {
  edition: string;
  book: string;
  chapter: number;
  verse: number;
}

/**
 * Search result for morphology search.
 */
export interface MorphologySearchResult {
  edition: string;
  book: string;
  chapter: number;
  verse: number;
  position: number;
  text?: string;
}

/**
 * Search result for Strong's number search.
 */
export interface StrongsSearchResult {
  edition: string;
  book: string;
  chapter: number;
  verse: number;
  position: number;
  text: string;
}

/**
 * Search result for gematria search.
 */
export interface GematriaSearchResult {
  edition: string;
  book: string;
  chapter: number;
  verse: number;
}

/**
 * Options for text search.
 */
export interface TextSearchOptions {
  /** Edition to search (default: all editions) */
  edition?: string;
  /** Include colophons in search (default: false) */
  includeColophons?: boolean;
  /** Case-insensitive search (default: true) */
  ignoreCase?: boolean;
}

/**
 * Options for morphology search.
 */
export interface MorphologySearchOptions {
  /** Edition to search (default: all editions) */
  edition?: string;
  /** Use wildcard matching (default: false) */
  wildcard?: boolean;
  /** Include colophons in search (default: false) */
  includeColophons?: boolean;
  /** Return only verse references, not word details */
  versesOnly?: boolean;
}

/**
 * Options for Strong's number search.
 */
export interface StrongsSearchOptions {
  /** Edition to search (default: all editions) */
  edition?: string;
  /** Include colophons in search (default: false) */
  includeColophons?: boolean;
}

/**
 * Options for gematria sequence search.
 */
export interface GematriaSearchOptions {
  /** Edition to search (default: all editions) */
  edition?: string;
  /** Gematria system to use (default: 'standard') */
  system?: string;
  /** Ignore word boundaries (default: true) */
  ignoreWords?: boolean;
  /** Use cached data (default: true) */
  useCache?: boolean;
  /** Include colophons in search (default: false) */
  includeColophons?: boolean;
}
