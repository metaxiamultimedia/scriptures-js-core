/**
 * Latin / early-modern number-alphabet cipher systems.
 * Fixtures are taken from the page-verified primary sources held in bible-sources.
 */
import { describe, it, expect } from 'vitest';
import {
  computeLatin1683,
  computeAgrippaSource,
  computeBongo,
  computeFigurate,
  polygonal,
  computeHenningCentenary,
  computeLatinOrdinal24,
  computeTabourotPythagorean,
  computeEnglishX6,
  computeGematrixJewish,
  computeGreekAcrophonic,
} from '../src/gematria/latin.js';
import { getMethod, computeValue } from '../src/gematria/index.js';

describe('Latin cipher systems', () => {
  describe('F1 — 1683 Alphabet triad (Tabourot 1583 / Bongo 1591)', () => {
    it('single letters: A=1, I=9, K=10, S=90, T=100, U/V=200, Z=500', () => {
      expect(computeLatin1683('A')).toBe(1);
      expect(computeLatin1683('I')).toBe(9);
      expect(computeLatin1683('K')).toBe(10);
      expect(computeLatin1683('S')).toBe(90);
      expect(computeLatin1683('T')).toBe(100);
      expect(computeLatin1683('U')).toBe(200);
      expect(computeLatin1683('V')).toBe(200);
      expect(computeLatin1683('Z')).toBe(500);
    });
    it('J folds to I (=9); W is unmapped (=0)', () => {
      expect(computeLatin1683('J')).toBe(9);
      expect(computeLatin1683('W')).toBe(0);
    });
    it('MARTIN LAVTER = 666 (Tabourot p.281)', () => {
      expect(computeLatin1683('MARTIN LAVTER')).toBe(666);
    });
    it('MARTIN LVTERA = 666 (Bongo p.626 spelling)', () => {
      expect(computeLatin1683('MARTIN LVTERA')).toBe(666);
    });
    it('literal "MARTIN LVTHER" ≠ 666 — the 666 result needs the variant spelling', () => {
      expect(computeLatin1683('MARTIN LVTHER')).toBe(673);
    });
    it('is case-insensitive', () => {
      expect(computeLatin1683('martin lavter')).toBe(666);
    });
  });

  describe('F2 — Agrippa (source-accurate) & Bongo', () => {
    it('Agrippa: J=600, V=700, W=900, U=200, I=9, H=8', () => {
      expect(computeAgrippaSource('J')).toBe(600);
      expect(computeAgrippaSource('V')).toBe(700);
      expect(computeAgrippaSource('W')).toBe(900);
      expect(computeAgrippaSource('U')).toBe(200);
      expect(computeAgrippaSource('I')).toBe(9);
      expect(computeAgrippaSource('H')).toBe(8);
    });
    it('Agrippa aspirate digraphs: HI=800, HV=900', () => {
      expect(computeAgrippaSource('HI')).toBe(800);
      expect(computeAgrippaSource('HV')).toBe(900);
    });
    it('Bongo has no HI digraph (HI = H+I = 17) but keeps HV=900', () => {
      expect(computeBongo('HI')).toBe(17);
      expect(computeBongo('HV')).toBe(900);
      expect(computeBongo('J')).toBe(600);
      expect(computeBongo('V')).toBe(700);
    });
    it('Agrippa and Bongo diverge only on the 800 digraph', () => {
      expect(computeAgrippaSource('HIEROM')).not.toBe(computeBongo('HIEROM'));
      expect(computeAgrippaSource('MARTIN')).toBe(computeBongo('MARTIN'));
    });
  });

  describe('F3 — Henning figurate alphabets (Stifel 1544/1553 → Henning 1683)', () => {
    it('polygonal() matches the s-gonal formula', () => {
      expect(polygonal(3, 24)).toBe(300);  // triangular Z
      expect(polygonal(4, 24)).toBe(576);  // square Z
      expect(polygonal(5, 24)).toBe(852);  // pentagonal Z
      expect(polygonal(10, 24)).toBe(2232); // decagonal Z
    });
    const cases: Array<[number, number, number]> = [
      // [sides, B-value, Z-value] from the transcribed Henning tables
      [3, 3, 300], [4, 4, 576], [5, 5, 852], [6, 6, 1128],
      [7, 7, 1404], [8, 8, 1680], [9, 9, 1956], [10, 10, 2232],
    ];
    it.each(cases)('polygon %i: A=1, B=%i, Z=%i', (sides, b, z) => {
      expect(computeFigurate('A', sides)).toBe(1);
      expect(computeFigurate('B', sides)).toBe(b);
      expect(computeFigurate('Z', sides)).toBe(z);
    });
    it('uses 24-letter positions (no J, U=V position): K=10th → triangular 55', () => {
      expect(computeFigurate('K', 3)).toBe(55);
      expect(computeFigurate('J', 3)).toBe(computeFigurate('I', 3)); // J shares I's position
    });
  });

  describe('F4 — Henning Centenary & natural-order ordinal', () => {
    it('Centenary: T=100, V=110, W=120, Z=150 (last four grow by tens)', () => {
      expect(computeHenningCentenary('T')).toBe(100);
      expect(computeHenningCentenary('V')).toBe(110);
      expect(computeHenningCentenary('W')).toBe(120);
      expect(computeHenningCentenary('Z')).toBe(150);
      expect(computeHenningCentenary('A')).toBe(1);
      expect(computeHenningCentenary('S')).toBe(90);
    });
    it('natural-order ordinal (24-letter): A=1, I=9, K=10, V=20, W=21, Z=24', () => {
      expect(computeLatinOrdinal24('A')).toBe(1);
      expect(computeLatinOrdinal24('I')).toBe(9);
      expect(computeLatinOrdinal24('K')).toBe(10); // no J → K is 10th
      expect(computeLatinOrdinal24('V')).toBe(20);
      expect(computeLatinOrdinal24('W')).toBe(21);
      expect(computeLatinOrdinal24('Z')).toBe(24);
    });
  });

  describe('F5 — Tabourot Pythagorean cipher (raw sum)', () => {
    it('irregular values: A=3, C=24, D=25, M=23, S=9', () => {
      expect(computeTabourotPythagorean('A')).toBe(3);
      expect(computeTabourotPythagorean('C')).toBe(24);
      expect(computeTabourotPythagorean('D')).toBe(25);
      expect(computeTabourotPythagorean('M')).toBe(23);
      expect(computeTabourotPythagorean('S')).toBe(9);
    });
  });

  describe('F7 — modern English ciphers (Stanton 1977 / gematrix)', () => {
    it('English ×6: A=6, Z=156; COMPUTER=666; KISSINGER=666 (Stanton p.49)', () => {
      expect(computeEnglishX6('A')).toBe(6);
      expect(computeEnglishX6('Z')).toBe(156);
      expect(computeEnglishX6('COMPUTER')).toBe(666);
      expect(computeEnglishX6('KISSINGER')).toBe(666);
    });
    it('gematrix "Jewish": J=600, V=700, W=900, K=10, T=100, Z=500', () => {
      expect(computeGematrixJewish('J')).toBe(600);
      expect(computeGematrixJewish('V')).toBe(700);
      expect(computeGematrixJewish('W')).toBe(900);
      expect(computeGematrixJewish('K')).toBe(10);
      expect(computeGematrixJewish('T')).toBe(100);
      expect(computeGematrixJewish('Z')).toBe(500);
    });
    it('gematrix "Jewish" skips 800 (HI = 17), unlike source-accurate Agrippa (HI=800)', () => {
      expect(computeGematrixJewish('HI')).toBe(17);
      expect(computeAgrippaSource('HI')).toBe(800);
    });
  });

  describe('F6 — Greek acrophonic / Herodianic numerals', () => {
    it('base symbols: Ι=1, Π=5, Δ=10, Η=100, Χ=1000', () => {
      expect(computeGreekAcrophonic('Ι')).toBe(1);
      expect(computeGreekAcrophonic('Π')).toBe(5);
      expect(computeGreekAcrophonic('Δ')).toBe(10);
      expect(computeGreekAcrophonic('Η')).toBe(100);
      expect(computeGreekAcrophonic('Χ')).toBe(1000);
      expect(computeGreekAcrophonic('ΧΗΔ')).toBe(1110);
    });
  });

  describe('registry integration', () => {
    it('registers the new Latin systems by slug', () => {
      for (const slug of [
        'latin_1683', 'latin_agrippa', 'latin_bongo', 'latin_henning_triangular',
        'latin_henning_decagonal', 'latin_henning_centenary', 'latin_ordinal_24',
        'latin_tabourot_pythagorean', 'english_gematria_x6', 'gematrix_jewish',
        'greek_acrophonic',
      ]) {
        expect(getMethod(slug), slug).toBeDefined();
      }
    });
    it('computeValue resolves a Latin slug', () => {
      expect(computeValue('MARTIN LAVTER', 'latin_1683', 'english')).toBe(666);
      expect(computeValue('COMPUTER', 'english_gematria_x6', 'english')).toBe(666);
    });
  });
});
