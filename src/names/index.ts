/**
 * Names module for looking up scripture proper nouns
 * (people, places, and other named entities).
 */

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
  type StrongsNameLookup,
  type NameLookup,
  type RefLookup,
} from './registry.js';
