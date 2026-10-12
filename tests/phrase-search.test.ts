/**
 * Tests for searchByGematriaPhrase (contiguous-word-run gematria search).
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { registerSource, clearSources, type ScriptureSource } from '../src/registry.js';
import type { VerseData } from '../src/models/types.js';
import { computeValue } from '../src/gematria/index.js';
import { searchByGematriaPhrase, PHRASE_MAX_WORDS_CAP } from '../src/query/search.js';
import { setupMockSources, teardownMockSources } from './helpers/mock-registry.js';

/**
 * A tiny deterministic English edition, one book "Alpha" with two verses:
 *   1:1  ab(3) cd(7) gh(15)
 *   1:2   e(5) f(6)
 * English standard == ordinal (A=1..Z=26), so values are easy to reason about.
 */
function registerAlpha(): void {
  const chapters: Record<number, VerseData[]> = {
    1: [
      { words: [
        { position: 1, text: 'ab' },
        { position: 2, text: 'cd' },
        { position: 3, text: 'gh' },
      ] },
      { words: [
        { position: 1, text: 'e' },
        { position: 2, text: 'f' },
      ] },
    ],
  };
  const source: ScriptureSource = {
    edition: 'test-Alpha',
    metadata: { abbreviation: 'test-Alpha', name: 'Alpha', language: 'English', license: 'PD' },
    loadVerse: async (_b, c, v) => {
      const d = chapters[c]?.[v - 1];
      if (!d) throw new Error('no verse');
      return d;
    },
    loadChapter: async (_b, c) => {
      const d = chapters[c];
      if (!d) throw new Error('no chapter');
      return d;
    },
    loadCache: async () => { throw new Error('no cache'); },
    listBooks: () => ['Alpha'],
  };
  registerSource(source);
}

describe('searchByGematriaPhrase', () => {
  beforeEach(() => { clearSources(); registerAlpha(); });
  afterEach(() => { clearSources(); });

  it('finds a two-word run within a verse', async () => {
    // ab(3)+cd(7) = 10
    const res = await searchByGematriaPhrase({
      target: 10, edition: 'test-Alpha', system: 'standard',
      minWords: 2, maxWords: 2, boundary: 'verse',
    });
    expect(res).toHaveLength(1);
    expect(res[0]).toMatchObject({
      book: 'Alpha', chapter: 1, verse: 1, position: 1, length: 2,
      text: 'ab cd', value: 10, crossesVerse: false,
    });
  });

  it('finds a three-word run and respects minWords', async () => {
    // ab+cd+gh = 25; a 2-word min would never reach it as a pair
    const res = await searchByGematriaPhrase({
      target: 25, edition: 'test-Alpha', minWords: 2, maxWords: 3, boundary: 'verse',
    });
    expect(res).toHaveLength(1);
    expect(res[0]).toMatchObject({ length: 3, text: 'ab cd gh', crossesVerse: false });
  });

  it("'verse' boundary does NOT match across a verse edge", async () => {
    // gh(15)+e(5) = 20 straddles 1:1 -> 1:2; 20 occurs ONLY as that cross pair.
    const res = await searchByGematriaPhrase({
      target: 20, edition: 'test-Alpha', minWords: 2, maxWords: 2, boundary: 'verse',
    });
    expect(res).toHaveLength(0);
  });

  it("'passage' boundary matches across a verse edge and flags it", async () => {
    const res = await searchByGematriaPhrase({
      target: 20, edition: 'test-Alpha', minWords: 2, maxWords: 2, boundary: 'passage',
    });
    expect(res).toHaveLength(1);
    expect(res[0]).toMatchObject({
      chapter: 1, verse: 1, position: 3, text: 'gh e', crossesVerse: true,
    });
  });

  it('respects minWords (no single-word matches by default)', async () => {
    // gh = 15 alone; with minWords 2 it must not be returned as a solo word
    const res = await searchByGematriaPhrase({
      target: 15, edition: 'test-Alpha', minWords: 2, maxWords: 3, boundary: 'passage',
    });
    expect(res.every((r) => r.length >= 2)).toBe(true);
  });

  it('returns nothing when maxWords < minWords', async () => {
    const res = await searchByGematriaPhrase({
      target: 10, edition: 'test-Alpha', minWords: 3, maxWords: 2,
    });
    expect(res).toHaveLength(0);
  });

  it('caps maxWords at PHRASE_MAX_WORDS_CAP', async () => {
    expect(PHRASE_MAX_WORDS_CAP).toBe(7);
    // Requesting a huge window must not throw and must still behave sanely.
    const res = await searchByGematriaPhrase({
      target: 10, edition: 'test-Alpha', minWords: 2, maxWords: 999, boundary: 'passage',
    });
    expect(res.some((r) => r.text === 'ab cd')).toBe(true);
  });
});

describe('searchByGematriaPhrase over mock editions', () => {
  beforeEach(() => { setupMockSources(); });
  afterEach(() => { teardownMockSources(); });

  it('finds a known English two-word run in KJV Genesis 1:1', async () => {
    const target = computeValue('In', 'standard', 'english') + computeValue('the', 'standard', 'english');
    const res = await searchByGematriaPhrase({
      target, edition: 'crosswire-KJV', system: 'standard', minWords: 2, maxWords: 2, boundary: 'verse',
    });
    expect(res.some((r) => r.text === 'In the' && r.book === 'Genesis')).toBe(true);
  });

  it('defaults to scanning every registered edition', async () => {
    const target = computeValue('In', 'standard', 'english') + computeValue('the', 'standard', 'english');
    const res = await searchByGematriaPhrase({ target, minWords: 2, maxWords: 2 });
    expect(res.some((r) => r.text === 'In the')).toBe(true);
  });
});
