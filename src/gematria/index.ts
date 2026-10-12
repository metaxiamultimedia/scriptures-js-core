/**
 * Gematria calculation utilities for Hebrew, Greek, and English text.
 */

import type { GematriaValues } from '../models/types.js';
import { GematriaError } from '../errors.js';
import { computeHebrew, isHebrew, computeStandard as computeHebrewStandard, computeOrdinal as computeHebrewOrdinal, computeReduced as computeHebrewReduced } from './hebrew.js';
import { computeGreek, isGreek, computeStandard as computeGreekStandard, computeOrdinal as computeGreekOrdinal, computeReduced as computeGreekReduced } from './greek.js';
import {
  computeEnglish,
  computeOrdinal as computeEnglishOrdinal,
  computeAgrippa as computeEnglishAgrippa,
  computeWhiteheadGreek,
  computeWhiteheadHebrew,
  computeWhiteheadObjective,
  computeWhiteheadSubjective,
  digitalRoot,
} from './english.js';
import {
  computeLatin1683,
  computeAgrippaSource,
  computeBongo,
  computeFigurate,
  FIGURATE_SIDES,
  computeHenningCentenary,
  computeLatinOrdinal24,
  computeTabourotPythagorean,
  computeEnglishX6,
  computeGematrixJewish,
  computeGreekAcrophonic,
} from './latin.js';

export { computeHebrew, isHebrew, extractHebrewLetters, computeStandard as computeHebrewStandard } from './hebrew.js';
export {
  computeLatin1683, computeAgrippaSource, computeBongo, computeFigurate, polygonal,
  computeHenningCentenary, computeLatinOrdinal24, computeTabourotPythagorean,
  computeEnglishX6, computeGematrixJewish, computeGreekAcrophonic,
} from './latin.js';
export { computeGreek, isGreek, removeDiacritics, extractGreekLetters, computeStandard as computeGreekStandard, GREEK_SYSTEMS, listGreekSystems, getGreekSystem } from './greek.js';
export type { GreekSystem, GreekSourceCitation } from './greek.js';
export { computeEnglish, isEnglish, extractEnglishLetters } from './english.js';
export { createGematriaProxy, createVerseGematriaProxy, createVerseGematriaWithColophonsProxy, createGetGematriaMethod, normalizeLanguage } from './proxy.js';
export type { VerseGematriaOptions } from './proxy.js';
export { computePhrase } from './phrase.js';
export type { PhraseGematria } from './phrase.js';

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

// Register English methods
// Source: Rudolff 1525 (extended to 26 letters)
registerMethod({
  slug: 'english_ordinal',
  name: 'English Ordinal',
  simpleName: 'ordinal',
  description: 'Simple English ordinal (A=1...Z=26). Derived from Rudolff 1525.',
  language: 'english',
  compute: computeEnglishOrdinal,
});

registerMethod({
  slug: 'english_ordinal',
  name: 'Simple English',
  simpleName: 'standard',
  description: 'Simple English ordinal (A=1...Z=26). Standard for English.',
  language: 'english',
  compute: computeEnglishOrdinal,
});

// NOTE: the legacy `agrippa_latin` map (J=600/V=700/W=900, skip 800) is actually the
// POPULAR/gematrix reconstruction, not source-accurate Agrippa. Kept for backwards
// compatibility; the source-accurate cipher is `latin_agrippa` (HI=800/HV=900) below,
// and the online form is also registered as `gematrix_jewish`. See bible-sources
// agrippa1533/agrippa1651 and scriptures-js-core issues #15/#17/#22.
registerMethod({
  slug: 'agrippa_latin',
  name: 'Agrippa Latin (popular form)',
  description: 'Latin gematria, popular/gematrix reconstruction (J=600, V=700, W=900; 800 skipped). For the source-accurate cipher use latin_agrippa; this equals gematrix_jewish.',
  language: 'english',
  compute: computeEnglishAgrippa,
});

// =============================================================================
// Latin / early-modern number-alphabet ciphers (see src/gematria/latin.ts).
// Each cites a page-verified source held in the bible-sources corpus.
// =============================================================================

// F1 — Source: tabourot1583 (p.274/281), bongo1591 (p.625), henning1683 (p.43)
registerMethod({
  slug: 'latin_1683',
  name: '1683 Alphabet',
  description: 'Latin number-alphabet triad (A=1…I=9, K=10…S=90, T=100, U/V=200, X=300, Y=400, Z=500). J→I, W unmapped. Source: Tabourot 1583/Bongo 1591. Validates MARTIN LAVTER=666.',
  language: 'english',
  compute: computeLatin1683,
});

// F2 — Source: agrippa1533/agrippa1651 (Bk II ch XX)
registerMethod({
  slug: 'latin_agrippa',
  name: 'Agrippa cipher (source-accurate)',
  description: 'Agrippa 1533/1651 27-char cipher: triad + consonantal I=600 (J), V=700, aspirate HI=800, HV=900. Modern-letter transliteration with HI/HV digraphs.',
  language: 'english',
  compute: computeAgrippaSource,
});

// F2 — Source: bongo1591 (p.625)
registerMethod({
  slug: 'latin_bongo',
  name: 'Bongo cipher',
  description: 'Bongo 1591 variant of the Agrippa extension: I=600, V=700, H=800 (bare), HV=900. Differs from Agrippa only at 800 (H vs HI digraph).',
  language: 'english',
  compute: computeBongo,
});

// F3 — Source: stifel1544/stifel1553 (figurate origin), homer1619, henning1683 (§X–XVIII)
for (const [name, sides] of Object.entries(FIGURATE_SIDES)) {
  registerMethod({
    slug: `latin_henning_${name}`,
    name: `Henning ${name.charAt(0).toUpperCase() + name.slice(1)} (figurate)`,
    description: `Figurate number-alphabet (value = n-th ${name} number over the 24-letter Latin alphabet). Origin: Stifel 1544/1553; catalogued: Henning 1683 §X–XVIII.`,
    language: 'english',
    compute: (text: string) => computeFigurate(text, sides),
  });
}

// F4 — Source: henning1683 (§XXIV p.46)
registerMethod({
  slug: 'latin_henning_centenary',
  name: 'Henning Centenary alphabet',
  description: 'Henning 1683 §XXIV: triad units/tens, but the last four letters grow by tens (T=100, V=110, W=120, X=130, Y=140, Z=150).',
  language: 'english',
  compute: computeHenningCentenary,
});

// F4 — Source: henning1683 (§XXV p.47)
registerMethod({
  slug: 'latin_ordinal_24',
  name: 'Latin natural-order ordinal (A=1…Z=24)',
  description: 'Henning 1683 §XXV: 24-letter natural order (no J, U=V). Distinct from the modern 26-letter english_ordinal.',
  language: 'english',
  compute: computeLatinOrdinal24,
});

// F5 — Source: tabourot1583 (p.276). ⚠ Divinatory (mod 5/9/7); returns raw sum.
registerMethod({
  slug: 'latin_tabourot_pythagorean',
  name: 'Tabourot Pythagorean cipher',
  description: 'Tabourot 1583 (p.276) irregular "sphere of Pythagoras" name-cipher. Historically a divinatory mod-reduction, not a summation; returns the raw letter-sum.',
  language: 'english',
  compute: computeTabourotPythagorean,
});

// F7 — Source: stanton1977 (p.49), Relfe 1981. Modern (NOT ancient/Crowley).
registerMethod({
  slug: 'english_gematria_x6',
  name: 'English Gematria (×6)',
  description: 'English ordinal × 6 (A=6…Z=156). Modern apocalyptic cipher; earliest page-verified: Stanton 1977 (KISSINGER=666), popularized by Relfe 1981. Misnomer "Sumerian".',
  language: 'english',
  compute: computeEnglishX6,
});

// F7 — the popular online "Jewish Gematria" (= Agrippa J/V/W form). Misnomer.
registerMethod({
  slug: 'gematrix_jewish',
  name: 'Jewish Gematria (gematrix popular form)',
  description: 'Agrippa applied to English in the popular J=600/V=700/W=900 (skip-800) form used by gematrix/Gematrinator. A misnomer (unrelated to Hebrew gematria). Cf. source-accurate latin_agrippa.',
  language: 'english',
  compute: computeGematrixJewish,
});

// F6 — Source: tabourot1583 (p.274). Greek namespace; base symbols only.
registerMethod({
  slug: 'greek_acrophonic',
  name: 'Greek Acrophonic (Herodianic) numerals',
  description: 'Greek acrophonic/Herodianic numerals: Ι=1, Π=5, Δ=10, Η=100, Χ=1000 (base symbols; compositional parsing not modelled). Source: Tabourot 1583 p.274.',
  language: 'greek',
  compute: computeGreekAcrophonic,
});

// Source: Whitehead, The Mystic Thesaurus (1899), pp. 58-59
registerMethod({
  slug: 'whitehead_greek',
  name: 'Whitehead Greek Cabala',
  description: 'Greek ordinal cabala from Whitehead (1899). Maps Greek letters to English.',
  language: 'english',
  compute: computeWhiteheadGreek,
});

// Source: Whitehead, The Mystic Thesaurus (1899), pp. 60-61
registerMethod({
  slug: 'whitehead_hebrew',
  name: 'Whitehead Hebrew-English',
  description: 'Hebrew values of English letters from Whitehead (1899).',
  language: 'english',
  compute: computeWhiteheadHebrew,
});

// Source: Whitehead, The Mystic Thesaurus (1899), pp. 62-63
registerMethod({
  slug: 'whitehead_objective',
  name: 'Whitehead Objective Cabala',
  description: 'English Objective Cabala from Whitehead (1899). Case-sensitive: A-Z=1-26, a-z=27-52.',
  language: 'english',
  compute: computeWhiteheadObjective,
});

// Source: Whitehead, The Mystic Thesaurus (1899), pp. 62-63
registerMethod({
  slug: 'whitehead_subjective',
  name: 'Whitehead Subjective Cabala',
  description: 'English Subjective Cabala from Whitehead (1899). Column X: A-M=1-13, N-T=114-120, U-Z=221-226.',
  language: 'english',
  compute: computeWhiteheadSubjective,
});

// Digital Root modifier (applied to ordinal by default for "reduced")
registerMethod({
  slug: 'english_reduced',
  name: 'English Reduced',
  simpleName: 'reduced',
  description: 'Digital root of English ordinal. Source: Whitehead 1899 ("digits adding into...").',
  language: 'english',
  compute: (text: string) => digitalRoot(computeEnglishOrdinal(text)),
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
