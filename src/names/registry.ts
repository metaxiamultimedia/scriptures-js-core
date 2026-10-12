/**
 * Proper-noun (names) registry for scripture names data packages.
 *
 * Names packages register themselves by importing this module and calling
 * registerProperNoun(). Consumers then query across all registered sources with
 * lookupName(), lookupStrongsName(), and findNamesByRef().
 */

import type { ProperNoun, ProperNounMetadata } from '../models/types.js';

/**
 * Options for proper-noun lookups.
 */
export interface NameLookupOptions {
  /** Specific names source to query (if omitted, queries all) */
  source?: string;
  /** Restrict to a single entity type */
  type?: ProperNoun['type'];
}

/**
 * Function type for looking up a proper noun by unified Strong's number.
 */
export type StrongsNameLookup = (strongsNumber: string) => Promise<ProperNoun | undefined>;

/**
 * Function type for looking up proper nouns by English name.
 */
export type NameLookup = (name: string) => Promise<ProperNoun[]>;

/**
 * Function type for looking up proper nouns that occur in a given reference.
 */
export type RefLookup = (ref: string) => Promise<ProperNoun[]>;

/**
 * Configuration for a proper-noun source.
 */
export interface ProperNounSource {
  /** Source identifier (e.g., "stepbible-tipnr") */
  id: string;

  /** Source metadata */
  metadata: ProperNounMetadata;

  /** Look up a single entity by its unified Strong's number */
  lookupStrongs: StrongsNameLookup;

  /** Look up entities by English name (case-insensitive) */
  lookupName: NameLookup;

  /** Look up a single entity by its unique name key (optional) */
  lookupUniqueName?: (uniqueName: string) => Promise<ProperNoun | undefined>;

  /** Look up entities that occur in a given scripture reference (optional) */
  findByRef?: RefLookup;

  /** Path to data directory (for Node.js file access) */
  dataPath?: string;
}

/**
 * Global registry of proper-noun sources.
 */
const sources: Map<string, ProperNounSource> = new Map();

/**
 * Register a proper-noun source.
 * Called by names packages when they are imported.
 */
export function registerProperNoun(source: ProperNounSource): void {
  sources.set(source.id, source);
}

/**
 * Unregister a proper-noun source.
 */
export function unregisterProperNoun(id: string): boolean {
  return sources.delete(id);
}

/**
 * Get a registered proper-noun source by id.
 */
export function getProperNounSource(id: string): ProperNounSource | undefined {
  return sources.get(id);
}

/**
 * List all registered proper-noun source ids.
 */
export function listProperNounSources(): string[] {
  return Array.from(sources.keys()).sort();
}

/**
 * Get all registered proper-noun sources.
 */
export function getAllProperNounSources(): Map<string, ProperNounSource> {
  return new Map(sources);
}

/**
 * Check if a proper-noun source is registered.
 */
export function hasProperNounSource(id: string): boolean {
  return sources.has(id);
}

/**
 * Clear all registered proper-noun sources (mainly for testing).
 */
export function clearProperNouns(): void {
  sources.clear();
}

/**
 * Resolve which sources to query for a given set of options.
 */
function selectSources(options: NameLookupOptions): ProperNounSource[] {
  if (options.source) {
    const source = sources.get(options.source);
    return source ? [source] : [];
  }
  return Array.from(sources.values());
}

/**
 * Filter helper applying the `type` option.
 */
function matchesType(entity: ProperNoun, options: NameLookupOptions): boolean {
  return !options.type || entity.type === options.type;
}

/**
 * Look up proper nouns by English name across all registered sources.
 * Returns all matching entities (an English name can map to several individuals).
 */
export async function lookupName(
  name: string,
  options: NameLookupOptions = {}
): Promise<ProperNoun[]> {
  const results: ProperNoun[] = [];
  for (const source of selectSources(options)) {
    const entities = await source.lookupName(name);
    for (const entity of entities) {
      if (matchesType(entity, options)) {
        results.push(entity);
      }
    }
  }
  return results;
}

/**
 * Look up a proper noun by its unified Strong's number across all registered
 * sources. Returns all matching entities (usually one per source).
 */
export async function lookupStrongsName(
  strongsNumber: string,
  options: NameLookupOptions = {}
): Promise<ProperNoun[]> {
  const results: ProperNoun[] = [];
  for (const source of selectSources(options)) {
    const entity = await source.lookupStrongs(strongsNumber);
    if (entity && matchesType(entity, options)) {
      results.push(entity);
    }
  }
  return results;
}

/**
 * Find all proper nouns that occur in a given scripture reference
 * (e.g. "Exo.4.14") across sources that support reference lookup.
 */
export async function findNamesByRef(
  ref: string,
  options: NameLookupOptions = {}
): Promise<ProperNoun[]> {
  const results: ProperNoun[] = [];
  for (const source of selectSources(options)) {
    if (!source.findByRef) {
      continue;
    }
    const entities = await source.findByRef(ref);
    for (const entity of entities) {
      if (matchesType(entity, options)) {
        results.push(entity);
      }
    }
  }
  return results;
}
