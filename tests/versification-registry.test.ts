/**
 * Versification source registry — routing + built-in behavior.
 */
import { describe, it, expect, afterEach } from 'vitest';
import {
  mapVerse,
  isMappingReliable,
  registerVersification,
  unregisterVersification,
  getVersificationSources,
  resolveVersificationSource,
  type VersificationSource,
} from '../src/versification/index.js';

afterEach(() => {
  // Keep the registry clean between tests; only the built-in should remain.
  unregisterVersification('fake');
});

describe('versification registry', () => {
  it('registers the built-in source by default', () => {
    const ids = getVersificationSources().map((s) => s.id);
    expect(ids).toContain('builtin');
  });

  it('built-in mapVerse behavior is unchanged', () => {
    // Spot-checks matching the existing versification test suite.
    expect(mapVerse('Psalms', 23, 1, 'MT', 'LXX')).toEqual({ chapter: 22, verse: 1 });
    expect(mapVerse('Psalms', 10, 1, 'MT', 'LXX')).toEqual({ chapter: 9, verse: 22 });
    expect(mapVerse('Psalms', 151, 1, 'LXX', 'MT')).toBeNull();
    expect(mapVerse('Genesis', 5, 5, 'MT', 'LXX')).toEqual({ chapter: 5, verse: 5 });
    expect(mapVerse('Psalms', 22, 1, 'LXX', 'English')).toEqual({ chapter: 23, verse: 1 });
    expect(mapVerse('Jeremiah', 26, 1, 'MT', 'LXX')).toBeNull();
    expect(mapVerse('Psalms', 23, 1, 'MT', 'MT')).toEqual({ chapter: 23, verse: 1 });
  });

  it('built-in isMappingReliable behavior is unchanged', () => {
    expect(isMappingReliable('Jeremiah', 'MT', 'LXX')).toBe(false);
    expect(isMappingReliable('Esther', 'LXX', 'MT')).toBe(false);
    expect(isMappingReliable('Psalms', 'MT', 'LXX')).toBe(true);
    expect(isMappingReliable('Genesis', 'MT', 'LXX')).toBe(true);
    expect(isMappingReliable('Jeremiah', 'MT', 'English')).toBe(true);
  });

  it('a higher-priority source overrides the built-in for the pairs it covers', () => {
    const fake: VersificationSource = {
      id: 'fake',
      systems: ['MT', 'English'],
      priority: 10,
      mapRef: () => ({ chapter: 99, verse: 99 }),
    };
    registerVersification(fake);

    // fake covers MT<->English → overrides built-in.
    expect(mapVerse('Genesis', 1, 1, 'MT', 'English')).toEqual({ chapter: 99, verse: 99 });
    // fake does NOT cover LXX → built-in still handles MT<->LXX.
    expect(mapVerse('Psalms', 23, 1, 'MT', 'LXX')).toEqual({ chapter: 22, verse: 1 });

    unregisterVersification('fake');
    // Back to built-in.
    expect(mapVerse('Genesis', 1, 1, 'MT', 'English')).not.toEqual({ chapter: 99, verse: 99 });
  });

  it('unregisterVersification returns whether something was removed', () => {
    expect(unregisterVersification('nope')).toBe(false);
    registerVersification({
      id: 'fake',
      systems: ['MT', 'English'],
      mapRef: () => null,
    });
    expect(unregisterVersification('fake')).toBe(true);
  });

  it('registering the same id replaces the prior source', () => {
    registerVersification({ id: 'fake', systems: ['MT', 'English'], priority: 5, mapRef: () => ({ chapter: 1, verse: 1 }) });
    registerVersification({ id: 'fake', systems: ['MT', 'English'], priority: 5, mapRef: () => ({ chapter: 2, verse: 2 }) });
    const fakes = getVersificationSources().filter((s) => s.id === 'fake');
    expect(fakes).toHaveLength(1);
    expect(mapVerse('Genesis', 1, 1, 'MT', 'English')).toEqual({ chapter: 2, verse: 2 });
  });

  describe('resolveVersificationSource', () => {
    it('resolves the built-in for covered pairs', () => {
      expect(resolveVersificationSource('MT', 'LXX')?.id).toBe('builtin');
      expect(resolveVersificationSource('LXX', 'English')?.id).toBe('builtin');
    });

    it('picks by systems coverage', () => {
      registerVersification({ id: 'fake', systems: ['MT', 'English'], priority: 10, mapRef: () => null });
      // Covers MT<->English:
      expect(resolveVersificationSource('MT', 'English')?.id).toBe('fake');
      // Does not cover MT<->LXX → falls back to built-in.
      expect(resolveVersificationSource('MT', 'LXX')?.id).toBe('builtin');
    });

    it('picks by priority when both cover the pair', () => {
      registerVersification({ id: 'fake', systems: ['MT', 'LXX', 'English'], priority: 10, mapRef: () => null });
      expect(resolveVersificationSource('MT', 'LXX')?.id).toBe('fake');
    });
  });
});
