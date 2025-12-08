/**
 * Tests for gematria calculations.
 */

import { describe, it, expect } from 'vitest';
import {
  compute,
  computeHebrew,
  computeGreek,
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

    it('calculates reduced gematria', () => {
      const result = computeHebrew('י'); // yod = 10
      expect(result.reduced).toBe(1); // 1+0 = 1
    });

    it('handles final letters correctly', () => {
      // Final mem (ם) should have same value as regular mem (מ) = 40
      const result1 = computeHebrew('מם');
      expect(result1.standard).toBe(80); // 40 + 40
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
