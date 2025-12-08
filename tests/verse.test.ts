/**
 * Tests for verse query functions.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getVerse, listEditions, listBooks } from '../src/query/verse.js';
import { EditionNotFoundError } from '../src/errors.js';
import { setupMockSources, teardownMockSources } from './helpers/mock-registry.js';

describe('verse queries', () => {
  beforeEach(() => {
    setupMockSources();
  });

  afterEach(() => {
    teardownMockSources();
  });

  describe('listEditions', () => {
    it('lists registered editions', () => {
      const editions = listEditions();
      expect(editions).toContain('crosswire-KJV');
      expect(editions).toContain('openscriptures-OHB');
      expect(editions).toContain('byztxt-TR');
    });
  });

  describe('listBooks', () => {
    it('lists books for an edition', () => {
      const books = listBooks('crosswire-KJV');
      expect(books).toContain('Genesis');
    });

    it('throws for non-existent edition', () => {
      expect(() => listBooks('non-existent')).toThrow(EditionNotFoundError);
    });
  });

  describe('getVerse', () => {
    it('gets a verse from KJV', async () => {
      const verse = await getVerse('Genesis', 1, 1, { edition: 'crosswire-KJV' });

      expect(verse).toBeDefined();
      expect(verse.chapter).toBe(1);
      expect(verse.number).toBe(1);
      expect(verse.text).toContain('In the beginning');
      expect(verse.words.length).toBeGreaterThan(0);
    });

    it('gets a verse from Hebrew Bible', async () => {
      const verse = await getVerse('Genesis', 1, 1, { edition: 'openscriptures-OHB' });

      expect(verse).toBeDefined();
      expect(verse.text).toContain('בְּרֵאשִׁית');
      expect(verse.gematria?.standard).toBe(2701);
    });

    it('gets a verse from Greek TR', async () => {
      const verse = await getVerse('John', 1, 1, { edition: 'byztxt-TR' });

      expect(verse).toBeDefined();
      expect(verse.text).toContain('λογος');
    });

    it('parses word data correctly', async () => {
      const verse = await getVerse('Genesis', 1, 1, { edition: 'openscriptures-OHB' });

      const firstWord = verse.words[0];
      expect(firstWord.position).toBe(1);
      expect(firstWord.text).toBe('בְּרֵאשִׁית');
      expect(firstWord.gematria?.standard).toBe(913);
    });

    it('throws EditionNotFoundError for non-existent edition', async () => {
      await expect(
        getVerse('Genesis', 1, 1, { edition: 'non-existent' })
      ).rejects.toThrow(EditionNotFoundError);
    });

    it('handles verses with colophons', async () => {
      const verse = await getVerse('2Timothy', 4, 22, { edition: 'byztxt-TR' });

      expect(verse).toBeDefined();
      expect(verse.metadata?.hasColophon).toBe(true);

      // Check that colophon words are marked
      const colophonWords = verse.words.filter(w => w.metadata?.colophon);
      expect(colophonWords.length).toBeGreaterThan(0);

      // Original text words should not be marked as colophon
      const originalWords = verse.words.filter(w => !w.metadata?.colophon);
      expect(originalWords.length).toBeGreaterThan(0);
    });

    it('filters out textual critical notes from Hebrew Bible verses', async () => {
      // Genesis 1:12 contains scholarly annotations comparing Leningrad Codex with BHS
      // These notes appear as word entries with null lemma/morph and 0 gematria
      const verse = await getVerse('Genesis', 1, 12, { edition: 'openscriptures-OHB' });

      expect(verse).toBeDefined();

      // All words should be actual Hebrew words, not English textual notes
      // Textual critical notes have: lemma=null, morph=null, gematria.standard=0
      const noteWords = verse.words.filter(w =>
        w.gematria?.standard === 0 &&
        !w.lexiconEntry?.lemma &&
        !w.morphology?.code
      );

      // There should be NO textual critical notes in the words array
      expect(noteWords.length).toBe(0);

      // Genesis 1:12 has 18 actual Hebrew words
      expect(verse.words.length).toBe(18);

      // Verify the last word is Hebrew, not an English note
      const lastWord = verse.words[verse.words.length - 1];
      expect(lastWord.text).toBe('טוֹב');
      expect(lastWord.gematria?.standard).toBeGreaterThan(0);
    });
  });
});
