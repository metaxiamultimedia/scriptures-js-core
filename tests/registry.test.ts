/**
 * Tests for the source registry.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  registerSource,
  unregisterSource,
  getSource,
  listEditions,
  hasEdition,
  clearSources,
  type ScriptureSource,
} from '../src/registry.js';

describe('registry', () => {
  const mockSource: ScriptureSource = {
    edition: 'test-edition',
    metadata: {
      abbreviation: 'test-edition',
      name: 'Test Edition',
      language: 'Test',
      license: 'MIT',
    },
    loadVerse: async () => ({ text: 'test', words: [] }),
    loadChapter: async () => [],
    loadCache: async () => ({}),
    listBooks: () => ['TestBook'],
  };

  beforeEach(() => {
    clearSources();
  });

  afterEach(() => {
    clearSources();
  });

  describe('registerSource', () => {
    it('registers a source', () => {
      registerSource(mockSource);
      expect(hasEdition('test-edition')).toBe(true);
    });

    it('overwrites existing source with same edition', () => {
      registerSource(mockSource);
      const newSource = { ...mockSource, metadata: { ...mockSource.metadata, name: 'Updated' } };
      registerSource(newSource);

      const source = getSource('test-edition');
      expect(source?.metadata.name).toBe('Updated');
    });
  });

  describe('unregisterSource', () => {
    it('removes a registered source', () => {
      registerSource(mockSource);
      expect(hasEdition('test-edition')).toBe(true);

      const result = unregisterSource('test-edition');
      expect(result).toBe(true);
      expect(hasEdition('test-edition')).toBe(false);
    });

    it('returns false for non-existent source', () => {
      const result = unregisterSource('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('getSource', () => {
    it('returns registered source', () => {
      registerSource(mockSource);
      const source = getSource('test-edition');
      expect(source).toBeDefined();
      expect(source?.edition).toBe('test-edition');
    });

    it('returns undefined for non-existent source', () => {
      const source = getSource('non-existent');
      expect(source).toBeUndefined();
    });
  });

  describe('listEditions', () => {
    it('returns empty array when no sources registered', () => {
      expect(listEditions()).toEqual([]);
    });

    it('returns sorted list of registered editions', () => {
      registerSource(mockSource);
      registerSource({ ...mockSource, edition: 'another-edition' });

      const editions = listEditions();
      expect(editions).toContain('test-edition');
      expect(editions).toContain('another-edition');
      expect(editions).toEqual([...editions].sort());
    });
  });

  describe('hasEdition', () => {
    it('returns true for registered edition', () => {
      registerSource(mockSource);
      expect(hasEdition('test-edition')).toBe(true);
    });

    it('returns false for non-registered edition', () => {
      expect(hasEdition('non-existent')).toBe(false);
    });
  });

  describe('clearSources', () => {
    it('removes all registered sources', () => {
      registerSource(mockSource);
      registerSource({ ...mockSource, edition: 'another-edition' });

      expect(listEditions().length).toBe(2);

      clearSources();

      expect(listEditions().length).toBe(0);
    });
  });
});
