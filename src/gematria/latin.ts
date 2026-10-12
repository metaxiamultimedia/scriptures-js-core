/**
 * Latin / early-modern number-alphabet cipher systems.
 *
 * Every system here is traced to a primary source held, page-verified, in the
 * `bible-sources` corpus (gitlab …/gematriabible/bible-sources). These operate on
 * ASCII letters (registered under language 'english' per the existing Agrippa
 * precedent), but are Latin ciphers historically.
 *
 * SOURCES (bibkey → bible-sources dir):
 *   tabourot1583   Tabourot, Les Bigarrures (1640/1866 scans). Triad origin;
 *                  MARTIN LAVTER = 666 (p.281). Pythagorean cipher (p.276).
 *   bongo1591      Bongo, Numerorum Mysteria (p.625). Triad + I/V/H/HV extension.
 *   agrippa1533/   Agrippa, De occulta philosophia / Three Books of Occult
 *   agrippa1651      Philosophy, Bk II ch. XX. 27-char: I=600,V=700,HI=800,HV=900.
 *   henning1683    Henning, Cabbalologia. 11 alphabets: 8 figurate (§X–XVIII),
 *                  Centenary (§XXIV), natural-order ordinal (§XXV).
 *   stifel1544/    Stifel. Figurate NUMBERS (Arithmetica Integra 1544) → figurate
 *   stifel1553       ALPHABET (Wortrechnung 1553, triangular Σ=2300).
 *   stanton1977    Stanton, Mystery 666 (p.49): English ×6 cipher (KISSINGER=666).
 *                  Earliest page-verified ×6 source; popularized by Relfe 1981.
 *
 * ⚠ Historical ambiguities (documented per system): the triad merges U/V and has
 * no J/W; Agrippa's consonantal I/V and aspirate digraphs HI/HV are not ASCII-
 * distinguishable, so we use documented modern-letter transliterations.
 */

import { extractEnglishLetters, computeOrdinal } from './english.js';
import type { CipherCatalogEntry } from '../models/types.js';

const letters = (text: string): string => extractEnglishLetters(text).toLowerCase();
const sumMap = (text: string, map: Record<string, number>): number =>
  letters(text).split('').reduce((s, ch) => s + (map[ch] ?? 0), 0);

// =============================================================================
// F1 — The "1683 Alphabet" (Latin number-alphabet triad)
// Source: tabourot1583 (origin, p.274/281), bongo1591 (p.625), henning1683 (p.43).
// 24-letter classical Latin: J→I, U = V = 200, W unmapped. Validates MARTIN LAVTER=666.
// =============================================================================
export const LATIN_1683: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 9, // j = consonantal i
  k: 10, l: 20, m: 30, n: 40, o: 50, p: 60, q: 70, r: 80, s: 90,
  t: 100, u: 200, v: 200, // U and V share the 20th-letter value
  x: 300, y: 400, z: 500,
  // w: unmapped (0) — classical Latin has no W (Harsdörffer 1651: "the Latin drops W")
};
export function computeLatin1683(text: string): number {
  return sumMap(text, LATIN_1683);
}

// =============================================================================
// F2 — Agrippa (source-accurate) & Bongo 27-character ciphers
// Source: agrippa1533/agrippa1651 (Bk II ch XX); bongo1591 (p.625).
// Triad base + extended tier. Transliteration (documented): consonantal I = J = 600,
// vowel U = 200, consonantal V = 700, W = 900 (= HV per the German "vv" note).
// Aspirate digraphs matched greedily: Agrippa HI=800 / HV=900; Bongo has no HI
// digraph (its 800 is a bare extended H, not ASCII-distinguishable from H=8).
// =============================================================================
export const AGRIPPA_BASE: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 600, // j = consonantal I
  k: 10, l: 20, m: 30, n: 40, o: 50, p: 60, q: 70, r: 80, s: 90,
  t: 100, u: 200, v: 700, w: 900, // u = vowel(200); v = consonant(700); w = HV(900)
  x: 300, y: 400, z: 500,
};

/** Agrippa 1533/1651 — source-accurate, with aspirate digraphs HI=800, HV=900. */
export function computeAgrippaSource(text: string): number {
  const s = letters(text);
  let sum = 0;
  for (let i = 0; i < s.length; ) {
    const a = s[i], b = s[i + 1];
    if (a === 'h' && b === 'i') { sum += 800; i += 2; continue; } // HI (aspirate, "Hierom")
    if (a === 'h' && (b === 'v' || b === 'u' || b === 'w')) { sum += 900; i += 2; continue; } // HV ("Huilhelme")
    sum += AGRIPPA_BASE[a] ?? 0; i += 1;
  }
  return sum;
}

/** Bongo 1591 — Agrippa variant: HV=900 digraph, but no HI=800 (Bongo's 800 is a lone H). */
export function computeBongo(text: string): number {
  const s = letters(text);
  let sum = 0;
  for (let i = 0; i < s.length; ) {
    const a = s[i], b = s[i + 1];
    if (a === 'h' && (b === 'v' || b === 'u' || b === 'w')) { sum += 900; i += 2; continue; }
    sum += AGRIPPA_BASE[a] ?? 0; i += 1;
  }
  return sum;
}

// =============================================================================
// F3 — Henning's 8 figurate number-alphabets (§X–§XVIII)
// Source: henning1683 (full tables) ; origin stifel1544 (figurate numbers) +
// stifel1553 (first letter-application, triangular) ; homer1619 (trigonal).
// 24-letter positions (no J, no U; V=20th, W=21st); value = n-th s-gonal number.
// =============================================================================
const FIGURATE_POSITION: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 9, // j shares I's position
  k: 10, l: 11, m: 12, n: 13, o: 14, p: 15, q: 16, r: 17, s: 18,
  t: 19, u: 20, v: 20, w: 21, x: 22, y: 23, z: 24, // u shares V's position (20)
};
/** n-th s-gonal (polygonal) number: P(s,n) = ((s-2)n² − (s-4)n) / 2. */
export function polygonal(sides: number, n: number): number {
  return ((sides - 2) * n * n - (sides - 4) * n) / 2;
}
export function computeFigurate(text: string, sides: number): number {
  return letters(text)
    .split('')
    .reduce((sum, ch) => sum + (FIGURATE_POSITION[ch] ? polygonal(sides, FIGURATE_POSITION[ch]) : 0), 0);
}
/** Polygon side-counts for Henning's eight figurate alphabets. */
export const FIGURATE_SIDES: Record<string, number> = {
  triangular: 3, square: 4, pentagonal: 5, hexagonal: 6,
  heptagonal: 7, octagonal: 8, enneagonal: 9, decagonal: 10,
};

// =============================================================================
// F4 — Henning's Centenary (§XXIV) & natural-order ordinal (§XXV)
// Source: henning1683 (p.46 / p.47). 24-letter (no J, no U; W present).
// =============================================================================
/** §XXIV "Centenary": triad units/tens, but the last four letters grow by tens. */
export const LATIN_HENNING_CENTENARY: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 9,
  k: 10, l: 20, m: 30, n: 40, o: 50, p: 60, q: 70, r: 80, s: 90,
  t: 100, u: 110, v: 110, w: 120, x: 130, y: 140, z: 150,
};
export function computeHenningCentenary(text: string): number {
  return sumMap(text, LATIN_HENNING_CENTENARY);
}
/** §XXV natural-order ordinal A=1…Z=24 (24-letter; distinct from modern 26-letter ordinal). */
export const LATIN_ORDINAL_24: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 9,
  k: 10, l: 11, m: 12, n: 13, o: 14, p: 15, q: 16, r: 17, s: 18,
  t: 19, u: 20, v: 20, w: 21, x: 22, y: 23, z: 24,
};
export function computeLatinOrdinal24(text: string): number {
  return sumMap(text, LATIN_ORDINAL_24);
}

// =============================================================================
// F5 — Tabourot's irregular "Pythagorean" name-cipher (p.276)
// Source: tabourot1583. ⚠ Historically a divinatory mod-reduction (5/9/7), NOT a
// summation gematria — this returns the raw letter-sum; reduction is left to callers.
// =============================================================================
export const TABOUROT_PYTHAGOREAN: Record<string, number> = {
  a: 3, b: 3, c: 24, d: 25, e: 3, f: 3, g: 8, h: 15, i: 15, j: 15,
  k: 15, l: 22, m: 23, n: 15, o: 8, p: 13, q: 22, r: 22, s: 9,
  t: 5, u: 5, v: 5, x: 8, y: 3, z: 3, // w: unmapped
};
export function computeTabourotPythagorean(text: string): number {
  return sumMap(text, TABOUROT_PYTHAGOREAN);
}

// =============================================================================
// F7 — Modern / popular English ciphers (traced to primary sources, not gematrix)
// =============================================================================
/** "English Gematria" = ordinal × 6 (A=6…Z=156). Source: stanton1977 p.49 (KISSINGER=666); Relfe 1981. */
export function computeEnglishX6(text: string): number {
  return computeOrdinal(text) * 6;
}
/**
 * "Jewish Gematria" (gematrix / Gematrinator popular form) = Agrippa applied to
 * English letters in the J=600/V=700/W=900 (skip-800) reconstruction. This is the
 * widely-used online form; cf. the source-accurate computeAgrippaSource (HI=800).
 * Misnomer: nothing to do with Hebrew gematria (Hebrew L=30 vs here L=20).
 */
export const GEMATRIX_JEWISH: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 600,
  k: 10, l: 20, m: 30, n: 40, o: 50, p: 60, q: 70, r: 80, s: 90,
  t: 100, u: 200, v: 700, w: 900, x: 300, y: 400, z: 500,
};
export function computeGematrixJewish(text: string): number {
  return sumMap(text, GEMATRIX_JEWISH);
}

// =============================================================================
// F6 — Greek acrophonic / Herodianic numerals (Greek namespace)
// Source: tabourot1583 p.274. Base symbols only (compositional parsing not modelled).
// =============================================================================
export const GREEK_ACROPHONIC: Record<string, number> = {
  'ι': 1, 'Ι': 1,    // iota — unit
  'π': 5, 'Π': 5,    // pi — from πέντε
  'δ': 10, 'Δ': 10,  // delta — from δέκα
  'η': 100, 'Η': 100, // eta — from ἑκατόν
  'χ': 1000, 'Χ': 1000, // chi — from χίλιοι
};
export function computeGreekAcrophonic(text: string): number {
  return text.split('').reduce((s, ch) => s + (GREEK_ACROPHONIC[ch] ?? 0), 0);
}

// =============================================================================
// STRUCTURED METADATA CATALOG
// =============================================================================

/** Per-polygon source locators for Henning's eight figurate alphabets (Cabbalologia, 1683). */
const FIGURATE_LOCATORS: Record<string, { section: string; page: number }> = {
  triangular: { section: '§X', page: 14 },
  square: { section: '§XII', page: 23 },
  pentagonal: { section: '§XIII', page: 25 },
  hexagonal: { section: '§XIV', page: 26 },
  heptagonal: { section: '§XV', page: 30 },
  octagonal: { section: '§XVI', page: 32 },
  enneagonal: { section: '§XVII', page: 33 },
  decagonal: { section: '§XVIII', page: 38 },
};

const FIGURATE_ENTRIES: Record<string, CipherCatalogEntry> = Object.fromEntries(
  Object.entries(FIGURATE_SIDES).map(([name, sides]) => {
    const cap = name.charAt(0).toUpperCase() + name.slice(1);
    const loc = FIGURATE_LOCATORS[name];
    return [
      `latin_henning_${name}`,
      {
        id: `latin-henning-${name}`,
        language: 'latin',
        kind: 'gematria',
        name: `Henning ${cap} (figurate)`,
        englishName: `${cap} figurate alphabet`,
        aliases: [`latin_henning_${name}`],
        description: `Figurate number-alphabet over the 24-letter Latin alphabet: each letter's value is the n-th ${name} (${sides}-gonal) number, P(${sides},n) = ((${sides}-2)n² − (${sides}-4)n)/2, where n is the letter position.`,
        source: {
          text: 'Henning, Cabbalologia (1683). Origin: Stifel, Arithmetica Integra (1544, figurate numbers) & Wortrechnung (1553, letter application).',
          section: loc.section,
          page: loc.page,
          note: 'Hörner 1619 prints the trigonal alphabet; Henning 1683 catalogues all eight polygons.',
        },
        computed: true,
      } as CipherCatalogEntry,
    ];
  })
);

/**
 * Structured metadata catalog for the Latin / early-modern number-alphabet ciphers
 * defined in this module.
 *
 * Mirrors the Hebrew `SYSTEMS` catalog using the shared `CipherCatalogEntry`, so
 * `getAllCiphers()` exposes citable provenance (previously held only in prose in
 * the legacy GematriaMethod registry + sources/latin/SYSTEMS_BY_SOURCE.md).
 *
 * Note on `language`: most entries are Latin ciphers that operate on ASCII letters,
 * but a few systems defined here belong to other alphabets and carry the correct
 * `language` (`greek_acrophonic` → greek; the two modern English ciphers → english).
 */
export const LATIN_SYSTEMS: Record<string, CipherCatalogEntry> = {
  latin_1683: {
    id: 'latin-1683',
    language: 'latin',
    kind: 'gematria',
    name: '1683 Alphabet',
    englishName: 'Latin number-alphabet triad',
    aliases: ['latin_1683'],
    description:
      'Classical 24-letter Latin triad: A=1…I=9, K=10…S=90, T=100, U=V=200, X=300, Y=400, Z=500. J→I; W unmapped. Validates MARTIN LAVTER = 666.',
    source: {
      text: 'Tabourot, Les Bigarrures (1583); Bongo, Numerorum Mysteria (1591); Henning, Cabbalologia (1683).',
      page: 274,
      note: 'Tabourot p.274/281 (MARTIN LAVTER=666); Bongo p.625; Henning p.43. Triad Z=500 (French/Latin tradition; German tradition keeps W and runs to Z=600).',
    },
    values: LATIN_1683,
  },
  latin_agrippa: {
    id: 'latin-agrippa',
    language: 'latin',
    kind: 'gematria',
    name: 'Agrippa cipher (source-accurate)',
    englishName: 'Agrippa 27-character cipher',
    aliases: ['latin_agrippa'],
    description:
      'Agrippa’s 27-character cipher: triad base plus consonantal I=600 (J), vowel U=200, consonantal V=700, and aspirate digraphs HI=800, HV=900 (matched greedily). The `values` table is the single-letter base; HI/HV digraphs override to 800/900 in computation.',
    source: {
      text: 'Agrippa, De occulta philosophia (1533) / Three Books of Occult Philosophy (1651), Bk II, ch. XX.',
      section: 'Bk II, ch. XX',
      page: 144,
      note: 'Source-accurate HI=800/HV=900, vs the popular skip-800 form (english-agrippa-popular / gematrix_jewish).',
    },
    values: AGRIPPA_BASE,
    computed: true,
  },
  latin_bongo: {
    id: 'latin-bongo',
    language: 'latin',
    kind: 'gematria',
    name: 'Bongo cipher',
    englishName: 'Bongo Agrippa-variant',
    aliases: ['latin_bongo'],
    description:
      'Bongo’s variant of the Agrippa extension: I=600, V=700, HV=900 digraph, but 800 is a bare extended H (not a digraph). Differs from Agrippa only at 800. Base table shown in `values`; HV digraph overrides to 900.',
    source: {
      text: 'Bongo, Numerorum Mysteria (1591).',
      page: 625,
    },
    values: AGRIPPA_BASE,
    computed: true,
  },
  ...FIGURATE_ENTRIES,
  latin_henning_centenary: {
    id: 'latin-henning-centenary',
    language: 'latin',
    kind: 'gematria',
    name: 'Henning Centenary alphabet',
    englishName: 'Centenary alphabet',
    aliases: ['latin_henning_centenary'],
    description:
      'Triad units/tens, but the last four letters grow by tens: T=100, U=V=110, W=120, X=130, Y=140, Z=150.',
    source: {
      text: 'Henning, Cabbalologia (1683).',
      section: '§XXIV',
      page: 46,
    },
    values: LATIN_HENNING_CENTENARY,
  },
  latin_ordinal_24: {
    id: 'latin-ordinal-24',
    language: 'latin',
    kind: 'gematria',
    name: 'Latin natural-order ordinal',
    englishName: 'Latin ordinal (A=1…Z=24)',
    aliases: ['latin_ordinal_24'],
    description:
      '24-letter Latin natural order (A=1 … Z=24; no J, U=V). Distinct from the modern 26-letter english-simple-ordinal.',
    source: {
      text: 'Henning, Cabbalologia (1683).',
      section: '§XXV',
      page: 47,
    },
    values: LATIN_ORDINAL_24,
  },
  latin_tabourot_pythagorean: {
    id: 'latin-tabourot-pythagorean',
    language: 'latin',
    kind: 'gematria',
    name: 'Tabourot "Pythagorean" cipher',
    englishName: 'Tabourot Pythagorean name-cipher',
    aliases: ['latin_tabourot_pythagorean'],
    description:
      'Tabourot’s irregular "sphere of Pythagoras" name-cipher. Historically a divinatory mod-5/9/7 reduction, not a summation; this system returns the raw letter-sum and leaves reduction to callers.',
    source: {
      text: 'Tabourot, Les Bigarrures (1583).',
      page: 276,
      note: 'Divinatory in origin; the raw letter-sum is exposed, reduction is left to callers.',
    },
    values: TABOUROT_PYTHAGOREAN,
  },
  english_gematria_x6: {
    id: 'english-gematria-x6',
    language: 'english',
    kind: 'gematria',
    name: 'English Gematria (×6)',
    englishName: 'English Gematria ×6',
    aliases: ['english_gematria_x6'],
    description:
      'Simple English ordinal multiplied by 6 (A=6 … Z=156). Modern apocalyptic cipher. The "Sumerian" label is a c.2011 misnomer — it is neither ancient nor Crowley.',
    source: {
      text: 'Stanton, Mystery 666 (1977); popularized by Relfe (1981).',
      page: 49,
      note: 'Earliest page-verified ×6 source (KISSINGER=666).',
    },
    computed: true,
  },
  gematrix_jewish: {
    id: 'english-gematrix-jewish',
    language: 'english',
    kind: 'gematria',
    name: 'Jewish Gematria (gematrix popular form)',
    englishName: 'Jewish Gematria (popular online form)',
    aliases: ['gematrix_jewish'],
    description:
      'Agrippa applied to English letters in the popular J=600/V=700/W=900 (skip-800) form used by gematrix / Gematrinator. A misnomer — unrelated to Hebrew gematria (here L=20, vs Hebrew lamed=30). Numerically identical to english-agrippa-popular.',
    source: {
      text: 'Agrippa, De occulta philosophia (1533) / Three Books of Occult Philosophy (1651), Bk II, ch. XX.',
      section: 'Bk II, ch. XX',
      note: 'Popular online reconstruction; cf. the source-accurate latin-agrippa (HI=800).',
    },
    values: GEMATRIX_JEWISH,
  },
  greek_acrophonic: {
    id: 'greek-acrophonic',
    language: 'greek',
    kind: 'isopsephy',
    name: 'Greek Acrophonic (Herodianic) numerals',
    nativeName: 'ἀκροφωνικά',
    englishName: 'Acrophonic / Herodianic numerals',
    aliases: ['greek_acrophonic'],
    description:
      'Greek acrophonic/Herodianic numerals: Ι=1, Π=5, Δ=10, Η=100, Χ=1000 (base symbols only; compositional numeral parsing is not modelled). Distinct from alphabetic isopsephy.',
    source: {
      text: 'Tabourot, Les Bigarrures (1583).',
      page: 274,
    },
    values: GREEK_ACROPHONIC,
  },
};
