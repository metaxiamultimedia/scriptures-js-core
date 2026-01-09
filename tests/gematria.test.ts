/**
 * Tests for gematria calculations.
 */

import { describe, it, expect } from 'vitest';
import {
  compute,
  computeHebrew,
  computeGreek,
  computeGreekStandard,
  computeEnglish,
  detectLanguage,
  isHebrew,
  isGreek,
} from '../src/gematria/index.js';

describe('gematria', () => {
  describe('detectLanguage', () => {
    it('detects Hebrew text', () => {
      expect(detectLanguage('בראשית')).toBe('hebrew');
      expect(detectLanguage('שלום')).toBe('hebrew');
    });

    it('detects Greek text', () => {
      expect(detectLanguage('λογος')).toBe('greek');
      expect(detectLanguage('αρχη')).toBe('greek');
    });

    it('detects English text', () => {
      expect(detectLanguage('hello')).toBe('english');
      expect(detectLanguage('In the beginning')).toBe('english');
    });
  });

  describe('isHebrew', () => {
    it('returns true for Hebrew text', () => {
      expect(isHebrew('בראשית')).toBe(true);
      expect(isHebrew('אלהים')).toBe(true);
    });

    it('returns false for non-Hebrew text', () => {
      expect(isHebrew('hello')).toBe(false);
      expect(isHebrew('λογος')).toBe(false);
    });
  });

  describe('isGreek', () => {
    it('returns true for Greek text', () => {
      expect(isGreek('λογος')).toBe(true);
      expect(isGreek('θεος')).toBe(true);
    });

    it('returns false for non-Greek text', () => {
      expect(isGreek('hello')).toBe(false);
      expect(isGreek('בראשית')).toBe(false);
    });
  });

  describe('computeHebrew', () => {
    it('calculates gematria for בראשית (913)', () => {
      const result = computeHebrew('בראשית');
      expect(result.standard).toBe(913);
    });

    it('calculates gematria for אלהים (86)', () => {
      const result = computeHebrew('אלהים');
      expect(result.standard).toBe(86);
    });

    it('calculates ordinal gematria', () => {
      const result = computeHebrew('אבג');
      expect(result.ordinal).toBe(6); // 1 + 2 + 3
    });

    it('calculates reduced gematria (Mispar Katan)', () => {
      // Single letter: yod = 10 → 1+0 = 1
      expect(computeHebrew('י').reduced).toBe(1);

      // Multi-letter: בראשית
      // ב(2) + ר(200→2) + א(1) + ש(300→3) + י(10→1) + ת(400→4) = 13
      expect(computeHebrew('בראשית').reduced).toBe(13);

      // אלהים: א(1) + ל(30→3) + ה(5) + י(10→1) + ם(40→4) = 14
      expect(computeHebrew('אלהים').reduced).toBe(14);
    });

    it('handles final letters correctly in standard', () => {
      // Final mem (ם) should have same value as regular mem (מ) = 40
      const result1 = computeHebrew('מם');
      expect(result1.standard).toBe(80); // 40 + 40
    });

    it('handles final letters correctly in ordinal', () => {
      // Final letters should have same ordinal value as their base form
      // מ = 13, ם = 13 (not 24)
      const result = computeHebrew('מם');
      expect(result.ordinal).toBe(26); // 13 + 13

      // כ = 11, ך = 11 (not 23)
      const kaf = computeHebrew('כך');
      expect(kaf.ordinal).toBe(22); // 11 + 11
    });

    it('ignores vowel points', () => {
      const withVowels = computeHebrew('בְּרֵאשִׁית');
      const withoutVowels = computeHebrew('בראשית');
      expect(withVowels.standard).toBe(withoutVowels.standard);
    });
  });

  describe('computeGreek', () => {
    it('calculates isopsephy for λογος (373)', () => {
      const result = computeGreek('λογος');
      expect(result.standard).toBe(373);
    });

    it('calculates isopsephy for θεος (284)', () => {
      const result = computeGreek('θεος');
      expect(result.standard).toBe(284);
    });

    it('calculates isopsephy for ιησους (888)', () => {
      const result = computeGreek('ιησους');
      expect(result.standard).toBe(888);
    });

    it('handles final sigma correctly', () => {
      // Final sigma (ς) should have same value as regular sigma (σ) = 200
      const result = computeGreek('λογος');
      expect(result.standard).toBe(373); // λ(30) + ο(70) + γ(3) + ο(70) + ς(200)
    });

    it('ignores diacritics', () => {
      const withDiacritics = computeGreek('ἀρχή');
      const withoutDiacritics = computeGreek('αρχη');
      expect(withDiacritics.standard).toBe(withoutDiacritics.standard);
    });

    it('counts iota subscripts as iotas', () => {
      // ᾳ (alpha with iota subscript) should count as αι (alpha + iota)
      // α = 1, ι = 10, so ᾳ should equal 11
      const withSubscript = computeGreek('ᾳ');
      const withAdscript = computeGreek('αι');
      expect(withSubscript.standard).toBe(withAdscript.standard);
      expect(withSubscript.standard).toBe(11); // α(1) + ι(10)

      // ῃ (eta with iota subscript) = ηι = 8 + 10 = 18
      expect(computeGreek('ῃ').standard).toBe(18);

      // ῳ (omega with iota subscript) = ωι = 800 + 10 = 810
      expect(computeGreek('ῳ').standard).toBe(810);
    });

    it('calculates ordinal gematria using alphabet positions', () => {
      // λογος: λ=11, ο=15, γ=3, ο=15, σ=18 → total=62
      // Bug would give: 1+2+3+4+5 = 15 (position in word, not alphabet)
      const result = computeGreek('λογος');
      expect(result.ordinal).toBe(62);
    });

    it('calculates ordinal for θεος correctly', () => {
      // θεος: θ=8, ε=5, ο=15, σ=18 → total=46
      const result = computeGreek('θεος');
      expect(result.ordinal).toBe(46);
    });

    it('calculates ordinal for single letters', () => {
      expect(computeGreek('α').ordinal).toBe(1);   // alpha = 1st
      expect(computeGreek('β').ordinal).toBe(2);   // beta = 2nd
      expect(computeGreek('ω').ordinal).toBe(24);  // omega = 24th
    });

    it('calculates reduced gematria (digital root of total)', () => {
      // λογος = 373 → 3+7+3 = 13 → 1+3 = 4
      expect(computeGreek('λογος').reduced).toBe(4);

      // θεος = 284 → 2+8+4 = 14 → 1+4 = 5
      expect(computeGreek('θεος').reduced).toBe(5);

      // ιησους = 888 → 8+8+8 = 24 → 2+4 = 6
      expect(computeGreek('ιησους').reduced).toBe(6);
    });

    it('handles archaic letters in standard isopsephy', () => {
      // Archaic letters have standard values (use computeGreekStandard directly
      // since computeGreek also calls ordinal which throws for archaic letters)
      expect(computeGreekStandard('Ϛ')).toBe(6);   // stigma
      expect(computeGreekStandard('Ϟ')).toBe(90);  // koppa
      expect(computeGreekStandard('Ϡ')).toBe(900); // sampi
    });

    it('throws error for archaic letters in ordinal (strict mode)', () => {
      // Archaic letters have no ordinal position in the 24-letter alphabet
      expect(() => computeGreek('Ϛ')).toThrow(/archaic/i);
      expect(() => computeGreek('Ϟ')).toThrow(/archaic/i);
      expect(() => computeGreek('Ϡ')).toThrow(/archaic/i);
    });
  });

  describe('computeEnglish', () => {
    it('calculates ordinal gematria (A=1, B=2, ...)', () => {
      const result = computeEnglish('abc');
      expect(result.ordinal).toBe(6); // 1 + 2 + 3
    });

    it('ignores case', () => {
      const lower = computeEnglish('hello');
      const upper = computeEnglish('HELLO');
      expect(lower.ordinal).toBe(upper.ordinal);
    });

    it('ignores non-letters', () => {
      const withSpaces = computeEnglish('a b c');
      const withoutSpaces = computeEnglish('abc');
      expect(withSpaces.ordinal).toBe(withoutSpaces.ordinal);
    });
  });

  describe('compute (auto-detect)', () => {
    it('auto-detects Hebrew', () => {
      const result = compute('בראשית');
      expect(result.standard).toBe(913);
    });

    it('auto-detects Greek', () => {
      const result = compute('λογος');
      expect(result.standard).toBe(373);
    });

    it('auto-detects English', () => {
      const result = compute('hello');
      expect(result.ordinal).toBeGreaterThan(0);
    });

    it('throws for empty text', () => {
      expect(() => compute('')).toThrow();
    });

    it('respects language option', () => {
      const result = compute('abc', { language: 'english' });
      expect(result.ordinal).toBe(6);
    });
  });
});
