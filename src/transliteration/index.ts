/**
 * Canonical transliteration for scripture text (issue #2).
 *
 * A single, *sourced* standard so the site and the book transliterate identically:
 *   - Hebrew / Aramaic -> SBL via `hebrew-transliteration`, which operates on the
 *     POINTED text (so inflected/prefixed forms romanize natively — no lemma or
 *     morpheme-code lookup needed).
 *   - Greek -> SBL general-purpose romanization implemented here (the Hebrew
 *     library is Hebrew-only).
 *
 * Output is lowercase; capitalization of proper nouns is a display concern applied
 * downstream. This supersedes the lexicon-morpheme `getTransliteration` for
 * word-level display (that remains available for headword/lemma rendering).
 */
// hebrew-transliteration © Charles Loder, MIT license.
// https://github.com/charlesLoder/hebrew-transliteration
import { transliterate as sblHebrew } from 'hebrew-transliteration';

export type TranslitLanguage = 'hebrew' | 'greek';

const HEBREW_RE = /[֐-׿]/;
const GREEK_RE = /[Ͱ-Ͽἀ-῿]/;

/** Detect the dominant script of a word. Hebrew wins if both are present. */
export function detectTranslitLanguage(text: string): TranslitLanguage | undefined {
  if (HEBREW_RE.test(text)) return 'hebrew';
  if (GREEK_RE.test(text)) return 'greek';
  return undefined;
}

// SBL Greek base letter values (lowercase). η=ē, ω=ō, θ=th, φ=ph, χ=ch, ψ=ps, ξ=x.
const GREEK_BASE: Record<string, string> = {
  'α': 'a', 'β': 'b', 'γ': 'g', 'δ': 'd', 'ε': 'e', 'ζ': 'z', 'η': 'ē', 'θ': 'th',
  'ι': 'i', 'κ': 'k', 'λ': 'l', 'μ': 'm', 'ν': 'n', 'ξ': 'x', 'ο': 'o', 'π': 'p',
  'ρ': 'r', 'σ': 's', 'ς': 's', 'τ': 't', 'υ': 'y', 'φ': 'ph', 'χ': 'ch', 'ψ': 'ps', 'ω': 'ō',
};
const GREEK_VOWELS = new Set(['α', 'ε', 'η', 'ι', 'ο', 'υ', 'ω']);
const GAMMA_NASAL_NEXT = new Set(['γ', 'κ', 'ξ', 'χ']); // γ before these → "n"
const DIPHTHONG_FIRST = new Set(['α', 'ε', 'ο', 'η']);   // υ after these → "u", else "y"
const ROUGH = '̔';    // combining reversed comma above (rough breathing → h)
const DIAERESIS = '̈';

/** SBL romanization of a Greek word. */
export function transliterateGreek(text: string): string {
  const decomposed = text.normalize('NFD').toLowerCase();
  // Group each base char with its trailing combining marks.
  const units: { base: string; marks: string }[] = [];
  for (const ch of decomposed) {
    const code = ch.codePointAt(0)!;
    if (code >= 0x0300 && code <= 0x036f) {
      if (units.length) units[units.length - 1].marks += ch;
    } else {
      units.push({ base: ch, marks: '' });
    }
  }
  // A rough breathing sits on the first vowel of a word, or on the SECOND vowel
  // of an initial diphthong — either way it romanizes as a single leading "h"
  // before the whole cluster. (Initial rough rho is handled inline as "rh".)
  let leadingH = false;
  const fv = units.findIndex((u) => GREEK_VOWELS.has(u.base));
  if (fv >= 0) {
    const u0 = units[fv];
    const u1 = units[fv + 1];
    if (u0.marks.includes(ROUGH)) leadingH = true;
    else if (u1 && GREEK_VOWELS.has(u1.base) && u1.marks.includes(ROUGH)) leadingH = true;
  }

  let out = '';
  for (let i = 0; i < units.length; i++) {
    const { base, marks } = units[i];
    if (GREEK_BASE[base] === undefined) { out += base; continue; } // spaces/punctuation
    if (base === 'γ' && i + 1 < units.length && GAMMA_NASAL_NEXT.has(units[i + 1].base)) {
      out += 'n';
    } else if (base === 'ρ') {
      out += marks.includes(ROUGH) ? 'rh' : 'r'; // initial rough rho
    } else if (base === 'υ') {
      const prev = i > 0 ? units[i - 1].base : '';
      const next = i + 1 < units.length ? units[i + 1].base : '';
      // υ is "u" inside a diphthong (αυ/ευ/ου/ηυ, or υι), else "y".
      const diphthong = (DIPHTHONG_FIRST.has(prev) || next === 'ι') && !marks.includes(DIAERESIS);
      out += diphthong ? 'u' : 'y';
    } else {
      out += GREEK_BASE[base];
    }
  }
  return leadingH ? 'h' + out : out;
}

/**
 * Transliterate a scripture word to its canonical SBL romanization (lowercase).
 * Language is auto-detected from the script if not given.
 */
export function transliterate(text: string, opts: { language?: TranslitLanguage } = {}): string {
  const language = opts.language ?? detectTranslitLanguage(text);
  if (language === 'hebrew') return sblHebrew(text);
  if (language === 'greek') return transliterateGreek(text);
  return text;
}
