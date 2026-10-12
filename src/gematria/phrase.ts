/**
 * Phrase-level gematria: sum a run of words and expose each word's subtotal.
 *
 * The scalar `compute()` already sums a multi-word string (non-letters are
 * stripped before summing), so `computePhrase(text).total` always equals
 * `compute(text)`. What this adds is the per-word breakdown that UIs need to
 * show "word1 = N, word2 = M, total = N+M".
 *
 * System-agnostic: it sums every key present on each word's GematriaValues, so
 * adding new gematria systems to the compute path flows through here with no
 * change.
 */

import type { GematriaValues } from '../models/types.js';
import { compute, detectLanguage, type GematriaOptions, type GematriaLanguage } from './index.js';

/** Per-word value breakdown plus the aggregated total. */
export interface PhraseGematria {
  /** One entry per whitespace-delimited word, in order. */
  words: Array<{ text: string; values: GematriaValues }>;
  /** Component-wise sum across all words. Equals compute(wholeText). */
  total: GematriaValues;
  /** Number of words that contributed letters (empty/punctuation-only skipped). */
  wordCount: number;
}

/** Sum `src` into `acc` component-wise, unioning keys. */
function addInto(acc: Record<string, number>, src: GematriaValues): void {
  for (const key of Object.keys(src)) {
    acc[key] = (acc[key] ?? 0) + src[key];
  }
}

/**
 * Compute gematria for each word of `text` and the running total.
 *
 * Language is detected once over the whole input (so short function words are
 * scored consistently with the rest of the phrase) unless an explicit
 * `options.language` is given.
 *
 * @param text - One or more words. Split on Unicode whitespace.
 * @param options - Same options as `compute()`. `language` applies to every word.
 * @returns Per-word values and the component-wise total.
 */
export function computePhrase(text: string, options: GematriaOptions = {}): PhraseGematria {
  const requested = options.language ?? 'auto';
  const language: GematriaLanguage =
    requested === 'auto' ? detectLanguage(text) : requested;

  const words: PhraseGematria['words'] = [];
  const totalAcc: Record<string, number> = {};
  let wordCount = 0;

  for (const token of text.split(/\s+/)) {
    if (!token) continue;
    let values: GematriaValues;
    try {
      values = compute(token, { ...options, language });
    } catch {
      // compute() rejected the token (e.g. empty after trim): contributes 0.
      continue;
    }
    // A token with no letters in this language scores 0 everywhere (e.g. "—",
    // or Latin punctuation under a Hebrew phrase): skip it rather than list it.
    if (!values.standard && !values.ordinal) continue;
    words.push({ text: token, values });
    addInto(totalAcc, values);
    wordCount++;
  }

  // Guarantee the documented shape even for empty/letterless input.
  const total = totalAcc as GematriaValues;
  if (total.standard === undefined) total.standard = 0;
  if (total.ordinal === undefined) total.ordinal = 0;
  if (total.reduced === undefined) total.reduced = 0;

  return { words, total, wordCount };
}
