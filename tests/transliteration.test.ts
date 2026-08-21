/**
 * Canonical transliteration (issue #2) — SBL Hebrew (via hebrew-transliteration)
 * and SBL Greek (implemented in the engine).
 */
import { describe, it, expect } from 'vitest';
import {
  transliterate,
  transliterateGreek,
  detectTranslitLanguage,
} from '../src/transliteration/index.js';

describe('transliteration', () => {
  describe('language detection', () => {
    it('detects Hebrew and Greek', () => {
      expect(detectTranslitLanguage('אֱלֹהִים')).toBe('hebrew');
      expect(detectTranslitLanguage('λόγος')).toBe('greek');
      expect(detectTranslitLanguage('abc')).toBeUndefined();
    });
  });

  describe('Hebrew (SBL via hebrew-transliteration, pointed text)', () => {
    it.each([
      ['אֱלֹהִים', 'ʾĕlōhîm'],
      ['הָאָרֶץ', 'hāʾāreṣ'],
      ['שַׁדַּי', 'šadday'],
      ['בְּרֵאשִׁית', 'bərēʾšît'], // prefix handled natively (no lemma lookup)
    ])('%s -> %s', (heb, expected) => {
      expect(transliterate(heb)).toBe(expected);
    });
  });

  describe('Greek (SBL romanization)', () => {
    it.each([
      ['λόγος', 'logos'],
      ['ἀλήθεια', 'alētheia'],   // smooth breathing -> no h
      ['Ἰησοῦς', 'iēsous'],      // lowercase; display capitalizes proper nouns
      ['Κηφᾶς', 'kēphas'],
      ['ῥαββί', 'rhabbi'],       // initial rough rho -> rh
      ['ἄγγελος', 'angelos'],    // γγ -> ng (gamma-nasal)
      ['αὐτός', 'autos'],        // αυ diphthong -> au
      ['υἱός', 'huios'],         // υι diphthong + rough breathing -> huios
    ])('%s -> %s', (grk, expected) => {
      expect(transliterateGreek(grk)).toBe(expected);
    });
  });
});
