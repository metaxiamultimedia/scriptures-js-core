/**
 * Gematria proxy for lazy computation on property access.
 */

import type { GematriaValues, Word, VerseGematriaOptions } from '../models/types.js';
import { computeValue, type GematriaLanguage } from './index.js';

export type { VerseGematriaOptions } from '../models/types.js';

/**
 * Normalize edition language string to gematria language.
 */
export function normalizeLanguage(editionLanguage: string | undefined): GematriaLanguage {
  if (!editionLanguage) return 'auto';
  const lang = editionLanguage.toLowerCase();
  if (lang.includes('hebrew')) return 'hebrew';
  if (lang.includes('greek')) return 'greek';
  if (lang.includes('english')) return 'english';
  return 'auto';
}

/**
 * Create a gematria proxy for a single text string.
 * Computes only the requested method on property access.
 *
 * @param text - The text to compute gematria for
 * @param language - The language to use for computation
 * @returns A proxy that computes gematria values on demand
 */
export function createGematriaProxy(text: string, language: GematriaLanguage): GematriaValues {
  const handler: ProxyHandler<GematriaValues> = {
    get(_target, prop: string | symbol) {
      if (typeof prop === 'string') {
        try {
          return computeValue(text, prop, language);
        } catch {
          // Return 0 for empty text or unsupported methods
          return 0;
        }
      }
      return undefined;
    },
    has(_target, prop: string | symbol) {
      return typeof prop === 'string';
    },
    ownKeys() {
      return ['standard', 'ordinal', 'reduced'];
    },
    getOwnPropertyDescriptor(_target, prop) {
      if (typeof prop === 'string') {
        return {
          enumerable: true,
          configurable: true,
          value: computeValue(text, prop, language),
        };
      }
      return undefined;
    },
  };

  return new Proxy({} as GematriaValues, handler);
}

/**
 * Create a gematria proxy for a verse that aggregates from words.
 * By default excludes colophon words and ketiv variants (uses qere).
 *
 * @param words - The words in the verse
 * @param language - The language to use for computation
 * @param options - Options for filtering words
 * @returns A proxy that computes aggregated gematria values on demand
 */
export function createVerseGematriaProxy(
  words: Word[],
  language: GematriaLanguage,
  options: VerseGematriaOptions = {}
): GematriaValues {
  const { variant = 'qere', includeColophons = false } = options;

  const computeAggregate = (method: string): number => {
    let total = 0;
    for (const word of words) {
      // Skip colophon words unless includeColophons is true
      if (!includeColophons && (word.isColophon || word.metadata?.colophon)) continue;

      // Handle Qere/Ketiv variants
      if (word.variant) {
        // Skip this word if it's the opposite variant
        if (variant === 'qere' && word.variant === 'ketiv') continue;
        if (variant === 'ketiv' && word.variant === 'qere') continue;
      }

      try {
        total += computeValue(word.text, method, language);
      } catch {
        // Skip words that fail computation
      }
    }
    return total;
  };

  const handler: ProxyHandler<GematriaValues> = {
    get(_target, prop: string | symbol) {
      if (typeof prop === 'string') {
        return computeAggregate(prop);
      }
      return undefined;
    },
    has(_target, prop: string | symbol) {
      return typeof prop === 'string';
    },
    ownKeys() {
      return ['standard', 'ordinal', 'reduced'];
    },
    getOwnPropertyDescriptor(_target, prop) {
      if (typeof prop === 'string') {
        return {
          enumerable: true,
          configurable: true,
          value: computeAggregate(prop),
        };
      }
      return undefined;
    },
  };

  return new Proxy({} as GematriaValues, handler);
}

/**
 * Create a getGematria method for a verse.
 * Returns a function that creates gematria proxies with custom options.
 *
 * @param words - The words in the verse
 * @param language - The language to use for computation
 * @returns A function that accepts options and returns a GematriaValues proxy
 */
export function createGetGematriaMethod(
  words: Word[],
  language: GematriaLanguage
): (options: VerseGematriaOptions) => GematriaValues {
  return (options: VerseGematriaOptions) => createVerseGematriaProxy(words, language, options);
}

/**
 * Create a gematria proxy for full verse text (including colophons).
 *
 * @param text - The full verse text
 * @param language - The language to use for computation
 * @returns A proxy that computes gematria values on demand
 */
export function createVerseGematriaWithColophonsProxy(text: string, language: GematriaLanguage): GematriaValues {
  return createGematriaProxy(text, language);
}
