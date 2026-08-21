/**
 * Edition-level verse inventory (issue #3).
 *
 * Two editions can share the same versification SCHEME ('English' / KJV numbering)
 * yet contain DIFFERENT verses: the Textus-Receptus editions carry the disputed
 * verses (Acts 8:37, 1 John 5:7, …) that the critical-text BSB omits. The scheme
 * alone therefore can't answer "does this edition have that verse" — inventory is
 * read from the edition's actual data via editionHasVerse / mapVerseToEdition.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { registerSource, clearSources } from '../src/registry.js';
import { editionHasVerse, mapVerseToEdition } from '../src/query/verse.js';
import { schemeFor } from '../src/versification/index.js';
import type { VerseData } from '../src/models/types.js';

/** Register a minimal edition whose inventory is exactly the given "Book ch:v" set. */
function makeEdition(edition: string, language: string, present: Set<string>): void {
  registerSource({
    edition,
    metadata: { abbreviation: edition, name: edition, language, license: 'test' },
    loadVerse: async (book: string, chapter: number, verse: number): Promise<VerseData> => {
      const key = `${book} ${chapter}:${verse}`;
      if (!present.has(key)) throw new Error(`Verse ${key} not found in ${edition}`);
      return { text: key, words: [{ position: 1, text: 'x' }] };
    },
    loadChapter: async () => [],
    loadCache: async () => ({}),
    listBooks: () => [],
  });
}

describe('edition-level verse inventory (issue #3)', () => {
  afterEach(() => clearSources());

  it('KJV and BSB share the English scheme but have different inventories', async () => {
    makeEdition('crosswire-KJV', 'English', new Set(['Acts 8:37', 'John 3:16']));
    makeEdition('berean-BSB', 'English', new Set(['John 3:16'])); // critical text omits Acts 8:37

    expect(schemeFor('crosswire-KJV')).toBe('English');
    expect(schemeFor('berean-BSB')).toBe('English');

    expect(await editionHasVerse('Acts', 8, 37, 'crosswire-KJV')).toBe(true);
    expect(await editionHasVerse('Acts', 8, 37, 'berean-BSB')).toBe(false);
    expect(await editionHasVerse('John', 3, 16, 'berean-BSB')).toBe(true);
  });

  it('mapVerseToEdition returns null for a verse absent in the target edition', async () => {
    makeEdition('crosswire-KJV', 'English', new Set(['Acts 8:37', 'John 3:16']));
    makeEdition('berean-BSB', 'English', new Set(['John 3:16']));

    // KJV Acts 8:37 has no home in BSB -> null, NOT a phantom { chapter: 8, verse: 37 }
    expect(await mapVerseToEdition('Acts', 8, 37, 'crosswire-KJV', 'berean-BSB')).toBeNull();
    // a shared verse maps through cleanly
    expect(await mapVerseToEdition('John', 3, 16, 'crosswire-KJV', 'berean-BSB'))
      .toEqual({ chapter: 3, verse: 16 });
    // and it round-trips within the same edition
    expect(await mapVerseToEdition('Acts', 8, 37, 'crosswire-KJV', 'crosswire-KJV'))
      .toEqual({ chapter: 8, verse: 37 });
  });

  it('editionHasVerse propagates EditionNotFoundError for an unregistered edition', async () => {
    await expect(editionHasVerse('John', 3, 16, 'no-such-edition')).rejects.toThrow();
  });

  it('mapVerseToEdition throws when an edition has no known scheme', async () => {
    makeEdition('crosswire-KJV', 'English', new Set(['John 3:16']));
    await expect(
      mapVerseToEdition('John', 3, 16, 'crosswire-KJV', 'unknown-scheme-edition')
    ).rejects.toThrow(/scheme/);
  });
});
