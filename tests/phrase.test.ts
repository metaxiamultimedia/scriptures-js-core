/**
 * Tests for phrase-level gematria (computePhrase).
 */

import { describe, it, expect } from 'vitest';
import { compute, computePhrase } from '../src/gematria/index.js';

describe('computePhrase', () => {
  it('returns one entry per word, in order', () => {
    const r = computePhrase('In the beginning');
    expect(r.words.map((w) => w.text)).toEqual(['In', 'the', 'beginning']);
    expect(r.wordCount).toBe(3);
  });

  it('each word value matches compute() of that word', () => {
    const r = computePhrase('In the beginning');
    for (const w of r.words) {
      expect(w.values.standard).toBe(compute(w.text).standard);
      expect(w.values.ordinal).toBe(compute(w.text).ordinal);
    }
  });

  it('total equals the sum of the per-word subtotals', () => {
    const r = computePhrase('In the beginning');
    const summed = r.words.reduce((a, w) => a + w.values.standard, 0);
    expect(r.total.standard).toBe(summed);
  });

  it('total equals compute() of the whole string (whitespace ignored)', () => {
    const r = computePhrase('In the beginning');
    const whole = compute('In the beginning');
    expect(r.total.standard).toBe(whole.standard);
    expect(r.total.ordinal).toBe(whole.ordinal);
  });

  it('sums Hebrew multi-word phrases', () => {
    const r = computePhrase('שלום עולם');
    expect(r.wordCount).toBe(2);
    expect(r.total.standard).toBe(compute('שלום עולם').standard);
    expect(r.total.standard).toBe(r.words[0].values.standard + r.words[1].values.standard);
  });

  it('sums Greek multi-word phrases', () => {
    const r = computePhrase('Ἰησοῦς Χριστός');
    expect(r.wordCount).toBe(2);
    expect(r.total.standard).toBe(compute('Ἰησοῦς Χριστός').standard);
  });

  it('skips punctuation-only tokens and collapses extra whitespace', () => {
    const r = computePhrase('  the   —   word  ');
    expect(r.words.map((w) => w.text)).toEqual(['the', 'word']);
    expect(r.wordCount).toBe(2);
  });

  it('returns zeroed totals for letterless input', () => {
    const r = computePhrase('— !! —');
    expect(r.wordCount).toBe(0);
    expect(r.total.standard).toBe(0);
    expect(r.total.ordinal).toBe(0);
    expect(r.total.reduced).toBe(0);
  });

  it('honors an explicit language over auto-detection', () => {
    const r = computePhrase('God is love', { language: 'english' });
    expect(r.total.standard).toBe(compute('God is love', { language: 'english' }).standard);
  });
});
