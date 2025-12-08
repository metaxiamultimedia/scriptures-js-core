/**
 * Mock registry helpers for testing.
 */

import { registerSource, clearSources, type ScriptureSource } from '../../src/registry.js';
import type { VerseData, EditionMetadata } from '../../src/models/types.js';
import {
  GENESIS_1_1_HEBREW,
  GENESIS_1_1_KJV,
  GENESIS_1_12_WITH_CRITICAL_NOTES,
  JOHN_1_1_GREEK,
  TIMOTHY_4_22_WITH_COLOPHON,
} from '../fixtures/verses.js';

/**
 * Mock verse data store.
 */
const mockData: Record<string, Record<string, Record<string, VerseData>>> = {
  'crosswire-KJV': {
    'Genesis': {
      '1:1': GENESIS_1_1_KJV,
    },
  },
  'openscriptures-OHB': {
    'Genesis': {
      '1:1': GENESIS_1_1_HEBREW,
      '1:12': GENESIS_1_12_WITH_CRITICAL_NOTES,
    },
  },
  'byztxt-TR': {
    'John': {
      '1:1': JOHN_1_1_GREEK,
    },
    '2Timothy': {
      '4:22': TIMOTHY_4_22_WITH_COLOPHON,
    },
  },
};

/**
 * Create a mock source for testing.
 */
export function createMockSource(edition: string, metadata: EditionMetadata): ScriptureSource {
  return {
    edition,
    metadata,
    loadVerse: async (book: string, chapter: number, verse: number): Promise<VerseData> => {
      const editionData = mockData[edition];
      if (!editionData) {
        throw new Error(`Edition ${edition} not found`);
      }
      const bookData = editionData[book];
      if (!bookData) {
        throw new Error(`Book ${book} not found in ${edition}`);
      }
      const verseData = bookData[`${chapter}:${verse}`];
      if (!verseData) {
        throw new Error(`Verse ${book} ${chapter}:${verse} not found in ${edition}`);
      }
      return verseData;
    },
    loadChapter: async (book: string, chapter: number): Promise<VerseData[]> => {
      const editionData = mockData[edition];
      if (!editionData) {
        throw new Error(`Edition ${edition} not found`);
      }
      const bookData = editionData[book];
      if (!bookData) {
        throw new Error(`Book ${book} not found in ${edition}`);
      }
      return Object.entries(bookData)
        .filter(([key]) => key.startsWith(`${chapter}:`))
        .map(([, data]) => data);
    },
    loadCache: async (cacheName: string): Promise<Record<string, unknown>> => {
      throw new Error(`Cache ${cacheName} not available in mock`);
    },
    listBooks: (): string[] => {
      const editionData = mockData[edition];
      return editionData ? Object.keys(editionData) : [];
    },
  };
}

/**
 * Set up mock sources for testing.
 */
export function setupMockSources(): void {
  clearSources();

  registerSource(createMockSource('crosswire-KJV', {
    abbreviation: 'crosswire-KJV',
    name: 'King James Version',
    language: 'English',
    license: 'Public Domain',
  }));

  registerSource(createMockSource('openscriptures-OHB', {
    abbreviation: 'openscriptures-OHB',
    name: 'Open Scriptures Hebrew Bible',
    language: 'Hebrew',
    license: 'CC BY 4.0',
  }));

  registerSource(createMockSource('byztxt-TR', {
    abbreviation: 'byztxt-TR',
    name: 'Byzantine Textus Receptus',
    language: 'Greek',
    license: 'Public Domain',
  }));
}

/**
 * Clean up mock sources after testing.
 */
export function teardownMockSources(): void {
  clearSources();
}
