/**
 * Unified cipher catalog — getAllCiphers() / getCipher() / listCiphers().
 *
 * The central guarantee tested here: the catalog is enumeration-driven and
 * CANNOT silently miss a system. In particular, every slug registered in the
 * legacy GematriaMethod map must resolve to a catalog entry.
 */
import { describe, it, expect } from 'vitest';
import { getAllCiphers, getCipher, listCiphers, hasCipher } from '../src/ciphers/catalog.js';
import { listMethods } from '../src/gematria/index.js';
import { SYSTEMS as HEBREW_SYSTEMS } from '../src/hebrew/gematria/systems.js';
import { CIPHERS as TEMURAH_CIPHERS } from '../src/hebrew/temurah/index.js';
import { GREEK_SYSTEMS } from '../src/gematria/greek.js';
import { ENGLISH_SYSTEMS } from '../src/gematria/english.js';
import { LATIN_SYSTEMS } from '../src/gematria/latin.js';

describe('cipher catalog', () => {
  it('returns a defensive copy (mutating the result does not affect the catalog)', () => {
    const a = getAllCiphers();
    const size = a.size;
    a.delete([...a.keys()][0]);
    expect(getAllCiphers().size).toBe(size);
  });

  it('covers every per-language catalog with no omissions', () => {
    const expected =
      Object.keys(HEBREW_SYSTEMS).length +
      Object.keys(TEMURAH_CIPHERS).length +
      Object.keys(GREEK_SYSTEMS).length +
      Object.keys(ENGLISH_SYSTEMS).length +
      Object.keys(LATIN_SYSTEMS).length;
    // If someone adds a system to any source catalog but it isn't enumerated,
    // this count assertion fails loudly.
    expect(getAllCiphers().size).toBe(expected);
  });

  it('has unique ids and sorted listCiphers()', () => {
    const ids = listCiphers();
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual([...ids].sort());
  });

  it('every legacy GematriaMethod slug resolves to a catalog entry', () => {
    const missing = listMethods()
      .map((m) => m.slug)
      .filter((slug) => !hasCipher(slug));
    expect(missing).toEqual([]);
  });

  it('resolves canonical ids and legacy aliases to the same entry', () => {
    expect(getCipher('hebrew-mispar-hechrachi')).toBeDefined();
    expect(getCipher('mispar_hechrachi')).toBe(getCipher('hebrew-mispar-hechrachi'));
    expect(getCipher('greek-isopsephy')).toBe(getCipher('isopsephy'));
    expect(getCipher('english-simple-ordinal')).toBe(getCipher('english_ordinal'));
    expect(getCipher('latin-1683')).toBe(getCipher('latin_1683'));
  });

  it('carries structured source citations and the right mechanism per kind', () => {
    const all = getAllCiphers();

    // Every entry has an id/name/description and a declared language+kind.
    for (const entry of all.values()) {
      expect(entry.id).toBeTruthy();
      expect(entry.name).toBeTruthy();
      expect(entry.description).toBeTruthy();
      expect(['hebrew', 'greek', 'english', 'latin']).toContain(entry.language);
      expect(['gematria', 'isopsephy', 'temurah']).toContain(entry.kind);
    }

    // Table-based entries expose a letter→value map; temurah exposes a mapping;
    // computed entries need neither.
    const standard = getCipher('hebrew-mispar-hechrachi')!;
    expect(standard.values).toBeDefined();
    expect(standard.source?.text).toContain('Jewish Encyclopedia');

    const atbash = getCipher('hebrew-atbash')!;
    expect(atbash.kind).toBe('temurah');
    expect(atbash.mapping).toBeDefined();

    const greekReduced = getCipher('greek-isopsephy-reduced')!;
    expect(greekReduced.computed).toBe(true);
  });

  it('is JSON-serializable (no function references leak into entries)', () => {
    for (const entry of getAllCiphers().values()) {
      expect(() => JSON.stringify(entry)).not.toThrow();
      for (const value of Object.values(entry)) {
        expect(typeof value).not.toBe('function');
      }
    }
  });
});
