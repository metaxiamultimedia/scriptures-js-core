/**
 * Source registry for scripture data packages.
 *
 * Data packages register themselves by importing this module and calling registerSource().
 */

import type { EditionMetadata, VerseData } from './models/types.js';

/**
 * Function type for loading a verse.
 */
export type VerseLoader = (book: string, chapter: number, verse: number) => Promise<VerseData>;

/**
 * Function type for loading a chapter.
 */
export type ChapterLoader = (book: string, chapter: number) => Promise<VerseData[]>;

/**
 * Function type for loading cache data.
 */
export type CacheLoader = (cacheName: string) => Promise<Record<string, unknown>>;

/**
 * Function type for listing books.
 */
export type BooksLister = () => string[];

/**
 * Configuration for a scripture source.
 */
export interface ScriptureSource {
  /** Edition identifier (e.g., "crosswire-KJV") */
  edition: string;

  /** Edition metadata */
  metadata: EditionMetadata;

  /** Function to load a single verse */
  loadVerse: VerseLoader;

  /** Function to load an entire chapter */
  loadChapter: ChapterLoader;

  /** Function to load cache data */
  loadCache: CacheLoader;

  /** Function to list available books */
  listBooks: BooksLister;

  /** Path to data directory (for Node.js file access) */
  dataPath?: string;

  /** Path to cache directory (for Node.js file access) */
  cachePath?: string;
}

/**
 * Global registry of scripture sources.
 */
const sources: Map<string, ScriptureSource> = new Map();

/**
 * Register a scripture source.
 * Called by data packages when they are imported.
 */
export function registerSource(source: ScriptureSource): void {
  sources.set(source.edition, source);
}

/**
 * Unregister a scripture source.
 */
export function unregisterSource(edition: string): boolean {
  return sources.delete(edition);
}

/**
 * Get a registered source by edition name.
 */
export function getSource(edition: string): ScriptureSource | undefined {
  return sources.get(edition);
}

/**
 * List all registered edition names.
 */
export function listEditions(): string[] {
  return Array.from(sources.keys()).sort();
}

/**
 * Get all registered sources.
 */
export function getAllSources(): Map<string, ScriptureSource> {
  return new Map(sources);
}

/**
 * Check if an edition is registered.
 */
export function hasEdition(edition: string): boolean {
  return sources.has(edition);
}

/**
 * Clear all registered sources (mainly for testing).
 */
export function clearSources(): void {
  sources.clear();
}
