/**
 * Shared test utilities for source packages.
 * Import this from source package tests to avoid duplication.
 */

import { describe, it, expect } from 'vitest';
import type { ScriptureSource } from '@metaxia/scriptures-core';
import { getSource, hasEdition, listEditions } from '@metaxia/scriptures-core';

/**
 * Standard test suite for any source package.
 * Call this from each source package's test file.
 */
export function testSourcePackage(
  edition: string,
  expectedMetadata: {
    language: string;
    license: string;
  },
  sampleVerse: {
    book: string;
    chapter: number;
    verse: number;
    textContains: string;
  }
) {
  describe(`${edition} source package`, () => {
    it('registers with the scriptures library', () => {
      expect(hasEdition(edition)).toBe(true);
      expect(listEditions()).toContain(edition);
    });

    it('provides correct metadata', () => {
      const source = getSource(edition);
      expect(source).toBeDefined();
      expect(source!.metadata.language).toBe(expectedMetadata.language);
      expect(source!.metadata.license).toBe(expectedMetadata.license);
    });

    it('lists available books', () => {
      const source = getSource(edition);
      expect(source).toBeDefined();
      const books = source!.listBooks();
      expect(Array.isArray(books)).toBe(true);
      expect(books.length).toBeGreaterThan(0);
      expect(books).toContain(sampleVerse.book);
    });

    it('loads a sample verse', async () => {
      const source = getSource(edition);
      expect(source).toBeDefined();

      const verse = await source!.loadVerse(
        sampleVerse.book,
        sampleVerse.chapter,
        sampleVerse.verse
      );

      expect(verse).toBeDefined();
      expect(verse.text).toBeDefined();
      expect(verse.text).toContain(sampleVerse.textContains);
    });

    it('loads a chapter', async () => {
      const source = getSource(edition);
      expect(source).toBeDefined();

      const verses = await source!.loadChapter(
        sampleVerse.book,
        sampleVerse.chapter
      );

      expect(Array.isArray(verses)).toBe(true);
      expect(verses.length).toBeGreaterThan(0);
    });

    it('throws for non-existent verse', async () => {
      const source = getSource(edition);
      expect(source).toBeDefined();

      await expect(
        source!.loadVerse('NonExistentBook', 999, 999)
      ).rejects.toThrow();
    });
  });
}
