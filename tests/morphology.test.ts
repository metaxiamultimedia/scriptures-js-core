/**
 * Tests for morphology parsing.
 */

import { describe, it, expect } from 'vitest';
import {
  parseLemma,
  parseMorphCode,
  getWordComponents,
  getPrefixMeaning,
  HebrewMorphologyParser,
} from '../src/morphology/index.js';

describe('morphology', () => {
  describe('parseLemma', () => {
    it('parses simple lemma without prefix', () => {
      const result = parseLemma('430');
      expect(result.prefix).toBeUndefined();
      expect(result.root).toBe('430');
    });

    it('parses lemma with single prefix', () => {
      const result = parseLemma('b/7225');
      expect(result.prefix).toBe('b');
      expect(result.root).toBe('7225');
    });

    it('parses lemma with multiple prefixes', () => {
      const result = parseLemma('c/b/7225');
      expect(result.prefix).toBe('c/b');
      expect(result.root).toBe('7225');
    });

    it('handles lemma with suffix letter', () => {
      const result = parseLemma('1254 a');
      expect(result.root).toBe('1254');
    });

    it('handles empty input', () => {
      const result = parseLemma('');
      expect(result.prefix).toBeUndefined();
      expect(result.root).toBeUndefined();
    });
  });

  describe('parseMorphCode', () => {
    it('parses Hebrew code without prefix', () => {
      const result = parseMorphCode('HVqp3ms');
      expect(result.hasPrefix).toBe(false);
      expect(result.language).toBe('hebrew');
      expect(result.rootPartOfSpeech).toBe('verb');
    });

    it('parses Hebrew code with prefix', () => {
      const result = parseMorphCode('HR/Ncfsa');
      expect(result.hasPrefix).toBe(true);
      expect(result.prefixType).toBe('preposition');
      expect(result.language).toBe('hebrew');
      expect(result.rootPartOfSpeech).toBe('noun');
    });

    it('parses Aramaic code', () => {
      const result = parseMorphCode('ANp');
      expect(result.language).toBe('aramaic');
      expect(result.rootPartOfSpeech).toBe('noun');
    });

    it('parses code with article prefix', () => {
      const result = parseMorphCode('HTd/Ncmpa');
      expect(result.hasPrefix).toBe(true);
      expect(result.prefixType).toBe('article/particle');
    });

    it('handles empty input', () => {
      const result = parseMorphCode('');
      expect(result.hasPrefix).toBe(false);
      expect(result.language).toBeUndefined();
    });
  });

  describe('getWordComponents', () => {
    it('extracts components for word with prefix', () => {
      const result = getWordComponents({
        text: 'בְּרֵאשִׁית',
        lemma: 'b/7225',
        morph: 'HR/Ncfsa',
      });

      expect(result.prefix).toBeDefined();
      expect(result.prefix?.type).toBe('preposition');
      expect(result.prefix?.meaning).toBe('in/with');
      expect(result.root?.lemma).toBe('7225');
      expect(result.root?.partOfSpeech).toBe('noun');
    });

    it('extracts components for word without prefix', () => {
      const result = getWordComponents({
        text: 'אֱלֹהִים',
        lemma: '430',
        morph: 'HNcmpa',
      });

      expect(result.prefix).toBeUndefined();
      expect(result.root?.lemma).toBe('430');
      expect(result.root?.partOfSpeech).toBe('noun');
    });

    it('handles conjunction + preposition prefix', () => {
      const result = getWordComponents({
        text: 'וּבְרֵאשִׁית',
        lemma: 'c/b/7225',
        morph: 'HC/R/Ncfsa',
      });

      expect(result.prefix).toBeDefined();
      expect(result.prefix?.codes).toContain('c');
      expect(result.prefix?.codes).toContain('b');
    });
  });

  describe('getPrefixMeaning', () => {
    it('returns meaning for known prefixes', () => {
      expect(getPrefixMeaning('b')).toBe('in/with');
      expect(getPrefixMeaning('c')).toBe('and');
      expect(getPrefixMeaning('d')).toBe('the');
      expect(getPrefixMeaning('l')).toBe('to/for');
      expect(getPrefixMeaning('m')).toBe('from');
    });

    it('returns undefined for unknown prefixes', () => {
      expect(getPrefixMeaning('x')).toBeUndefined();
    });
  });

  describe('HebrewMorphologyParser class', () => {
    it('provides same functionality as functions', () => {
      const parser = new HebrewMorphologyParser();

      expect(parser.parseLemma('b/7225')).toEqual(parseLemma('b/7225'));
      expect(parser.parseMorphCode('HR/Ncfsa')).toEqual(parseMorphCode('HR/Ncfsa'));
    });
  });
});
