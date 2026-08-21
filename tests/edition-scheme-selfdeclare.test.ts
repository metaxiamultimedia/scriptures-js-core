/**
 * schemeFor(): editions self-declare their versification scheme at registration,
 * so a NEW edition aligns via getParallelVerses/mapVerse with zero core change.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { registerSource, unregisterSource, type ScriptureSource } from '../src/registry.js';
import { schemeFor } from '../src/versification/index.js';

function makeSource(edition: string, versificationScheme?: 'MT' | 'LXX' | 'English'): ScriptureSource {
  return {
    edition,
    metadata: { abbreviation: edition, name: edition, language: 'x', license: 'x' },
    loadVerse: async () => ({}) as never,
    loadChapter: async () => [] as never,
    loadCache: async () => ({}) as never,
    listBooks: () => [] as never,
    ...(versificationScheme ? { versificationScheme } : {}),
  };
}

describe('schemeFor: self-declared versification scheme', () => {
  afterEach(() => {
    unregisterSource('brand-new-lxx-edition');
  });

  it('reads a self-declared scheme from the registered source — no EDITION_SCHEME entry needed', () => {
    // An edition NOT in the hardcoded map: it aligns purely by self-declaring.
    expect(schemeFor('brand-new-lxx-edition')).toBeUndefined();
    registerSource(makeSource('brand-new-lxx-edition', 'LXX'));
    expect(schemeFor('brand-new-lxx-edition')).toBe('LXX');
  });

  it('falls back to the legacy hardcoded EDITION_SCHEME for editions that do not declare', () => {
    expect(schemeFor('crosswire-KJV')).toBe('English');
    expect(schemeFor('openscriptures-OHB')).toBe('MT');
  });
});
