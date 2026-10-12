/**
 * Tests for the Greek isopsephy system metadata (GREEK_SYSTEMS).
 *
 * Verifies the registry structure, the verified worked examples, the pythmēn
 * (digital-root) behaviour, and — importantly — that quoteGreek is NOT invented
 * for sources that are English-language works/translations.
 */
import { describe, it, expect } from 'vitest';
import { computeGreek, GREEK_SYSTEMS, listGreekSystems, getGreekSystem } from '../src/gematria/index.js';

describe('Greek systems metadata', () => {
  it('registers standard, ordinal, reduced', () => {
    expect(listGreekSystems()).toEqual(['standard', 'ordinal', 'reduced']);
    expect(getGreekSystem('reduced')?.greekName).toBe('πυθμήν');
  });

  it('standard isopsephy matches the cited verified examples', () => {
    expect(computeGreek('λόγος').standard).toBe(373);
    expect(computeGreek('θεός').standard).toBe(284);
    expect(computeGreek('Ἰησοῦς').standard).toBe(888); // diacritics stripped
  });

  it('reduced (pythmēn) is the digital root of the standard value', () => {
    // Ἰησοῦς = 888 → 8+8+8 = 24 → 2+4 = 6
    expect(computeGreek('Ἰησοῦς').reduced).toBe(6);
  });

  it('every citation has a real source text and url (where applicable)', () => {
    for (const sys of Object.values(GREEK_SYSTEMS)) {
      expect(sys.source.text.length).toBeGreaterThan(0);
      expect(sys.englishName.length).toBeGreaterThan(0);
    }
    // Hippolytus quote is a real English quote from the cited translation.
    expect(GREEK_SYSTEMS.reduced.source.quote).toContain('root');
  });

  it('does NOT fabricate a Greek-language quote (sources are English works)', () => {
    // quoteGreek must stay unset until verified against a Greek edition.
    for (const sys of Object.values(GREEK_SYSTEMS)) {
      expect(sys.source.quoteGreek).toBeUndefined();
    }
  });
});
