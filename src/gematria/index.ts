/**
 * Gematria calculation utilities for Hebrew, Greek, and English text.
 */

import type { GematriaValues } from '../models/types.js';
import { GematriaError } from '../errors.js';
import { computeHebrew, isHebrew, computeStandard as computeHebrewStandard, computeOrdinal as computeHebrewOrdinal, computeReduced as computeHebrewReduced } from './hebrew.js';
import { computeGreek, isGreek, computeStandard as computeGreekStandard, computeOrdinal as computeGreekOrdinal, computeReduced as computeGreekReduced } from './greek.js';
import { computeEnglish, computeOrdinal as computeEnglishOrdinal } from './english.js';

export { computeHebrew, isHebrew, extractHebrewLetters, computeStandard as computeHebrewStandard } from './hebrew.js';
export { computeGreek, isGreek, removeDiacritics, extractGreekLetters, computeStandard as computeGreekStandard } from './greek.js';
export { computeEnglish, isEnglish, extractEnglishLetters } from './english.js';

/**
 * Supported languages for gematria calculations.
 */
export type GematriaLanguage = 'hebrew' | 'greek' | 'english' | 'auto';

/**
 * Gematria method definition with canonical and simple names.
 */
export interface GematriaMethod {
  /** Canonical slug (e.g., 'mispar_hechrachi') */
  slug: string;
  /** Display name (e.g., 'Mispar Hechrachi') */
  name: string;
  /** Optional simple alias (e.g., 'standard') */
  simpleName?: string;
  /** Description of the method */
  description?: string;
  /** Language this method applies to */
  language: GematriaLanguage;
  /** Compute function */
  compute: (text: string) => number;
}

/**
 * Registry of gematria methods.
 */
const methods: Map<string, GematriaMethod> = new Map();
const simpleNameIndex: Map<string, GematriaMethod> = new Map();

/**
 * Register a gematria method.
 */
export function registerMethod(method: GematriaMethod): void {
  methods.set(method.slug, method);
  if (method.simpleName) {
    simpleNameIndex.set(`${method.language}:${method.simpleName}`, method);
  }
}

/**
 * Get a method by slug or simple name.
 */
export function getMethod(slugOrName: string, language?: GematriaLanguage): GematriaMethod | undefined {
  // Try direct slug lookup first
  const bySlug = methods.get(slugOrName);
  if (bySlug) return bySlug;

  // Try simple name lookup with language context
  if (language && language !== 'auto') {
    return simpleNameIndex.get(`${language}:${slugOrName}`);
  }

  // Search all languages for simple name
  for (const lang of ['hebrew', 'greek', 'english'] as const) {
    const found = simpleNameIndex.get(`${lang}:${slugOrName}`);
    if (found) return found;
  }

  return undefined;
}

/**
 * List all registered methods, optionally filtered by language.
 */
export function listMethods(language?: GematriaLanguage): GematriaMethod[] {
  const all = Array.from(methods.values());
  if (!language || language === 'auto') {
    return all;
  }
  return all.filter(m => m.language === language);
}

/**
 * List method slugs for a language.
 */
export function listMethodSlugs(language: GematriaLanguage): string[] {
  return listMethods(language).map(m => m.slug);
}

/**
 * List simple names for a language.
 */
export function listSimpleNames(language: GematriaLanguage): string[] {
  return listMethods(language)
    .map(m => m.simpleName)
    .filter((n): n is string => n !== undefined);
}

// Register core Hebrew methods
registerMethod({
  slug: 'mispar_hechrachi',
  name: 'Mispar Hechrachi',
  simpleName: 'standard',
  description: 'Standard Hebrew gematria using traditional letter values',
  language: 'hebrew',
  compute: computeHebrewStandard,
});

registerMethod({
  slug: 'mispar_siduri',
  name: 'Mispar Siduri',
  simpleName: 'ordinal',
  description: 'Ordinal Hebrew gematria (1-22 based on alphabet position)',
  language: 'hebrew',
  compute: computeHebrewOrdinal,
});

registerMethod({
  slug: 'mispar_katan',
  name: 'Mispar Katan',
  simpleName: 'reduced',
  description: 'Reduced Hebrew gematria (each letter reduced to single digit)',
  language: 'hebrew',
  compute: computeHebrewReduced,
});

// Register core Greek methods
registerMethod({
  slug: 'isopsephy',
  name: 'Isopsephy',
  simpleName: 'standard',
  description: 'Standard Greek isopsephy using traditional letter values',
  language: 'greek',
  compute: computeGreekStandard,
});

registerMethod({
  slug: 'isopsephy_ordinal',
  name: 'Greek Ordinal',
  simpleName: 'ordinal',
  description: 'Ordinal Greek gematria (1-24 based on alphabet position)',
  language: 'greek',
  compute: computeGreekOrdinal,
});

registerMethod({
  slug: 'isopsephy_reduced',
  name: 'Greek Reduced',
  simpleName: 'reduced',
  description: 'Reduced Greek gematria (digital root)',
  language: 'greek',
  compute: computeGreekReduced,
});

// Register English method
registerMethod({
  slug: 'english_ordinal',
  name: 'English Ordinal',
  simpleName: 'ordinal',
  description: 'English ordinal gematria (A=1, B=2, ... Z=26)',
  language: 'english',
  compute: computeEnglishOrdinal,
});

/**
 * Options for gematria computation.
 */
export interface GematriaOptions {
  /** Language to use for calculation. Default: 'auto' */
  language?: GematriaLanguage;
  /** Specific method to use. Default: all methods */
  method?: string;
}

/**
 * Detect the language of the given text.
 */
export function detectLanguage(text: string): GematriaLanguage {
  if (isHebrew(text)) return 'hebrew';
  if (isGreek(text)) return 'greek';
  return 'english';
}

/**
 * Compute gematria values for the given text.
 *
 * @param text - The text to compute gematria for
 * @param options - Computation options
 * @returns Gematria values for different methods
 * @throws GematriaError if text contains no valid characters
 */
export function compute(text: string, options: GematriaOptions = {}): GematriaValues {
  const { language = 'auto' } = options;

  if (!text || !text.trim()) {
    throw new GematriaError('Input text cannot be empty');
  }

  const lang = language === 'auto' ? detectLanguage(text) : language;

  switch (lang) {
    case 'hebrew':
      return computeHebrew(text);
    case 'greek':
      return computeGreek(text);
    case 'english':
      return computeEnglish(text);
    default:
      throw new GematriaError(`Unsupported language: ${lang}`);
  }
}

/**
 * Compute a single gematria value using a specific method.
 *
 * @param text - The text to compute gematria for
 * @param method - The method slug or simple name (e.g., 'mispar_hechrachi', 'standard')
 * @param language - The language to use. Default: 'auto'
 * @returns The gematria value
 */
export function computeValue(
  text: string,
  method: string = 'standard',
  language: GematriaLanguage = 'auto'
): number {
  const lang = language === 'auto' ? detectLanguage(text) : language;
  const methodDef = getMethod(method, lang);

  if (methodDef) {
    return methodDef.compute(text);
  }

  // Fallback to old behavior for backwards compatibility
  const values = compute(text, { language: lang });
  return values[method] ?? 0;
}

// Legacy aliases for backwards compatibility
export { registerMethod as registerSystem };
export type GematriaSystem = GematriaMethod;
export const getSystem = getMethod;
export const listSystems = () => Array.from(methods.keys());

// Default export for convenience
export default {
  compute,
  computeValue,
  computeHebrew,
  computeGreek,
  computeEnglish,
  detectLanguage,
  listMethods,
  listMethodSlugs,
  listSimpleNames,
  getMethod,
  registerMethod,
};
