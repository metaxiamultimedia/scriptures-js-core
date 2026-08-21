/**
 * MT <-> LXX Psalm versification — every assertion here is verified against the
 * Swete LXX + Masoretic verse text.
 */
import { describe, it, expect } from 'vitest';
import {
  psalmMtToLxx, psalmLxxToMt, mtToEnglish, englishToMt, mapVerse, isMappingReliable,
} from '../src/versification/index.js';

describe('MT <-> LXX Psalm versification', () => {
  describe('MT -> LXX', () => {
    const cases: [number, number, number, number][] = [
      // mtCh, mtV, lxxCh, lxxV
      [8, 1, 8, 1],       // aligned
      [23, 1, 22, 1],     // the shepherd psalm (verified content)
      [113, 1, 112, 1],   // last of the −1 run
      [9, 5, 9, 5],       // MT 9 aligns
      [10, 1, 9, 22],     // MT 9+10 merged (verified: MT 10:1 = LXX 9:22)
      [114, 1, 113, 1],   // MT 114+115 merged
      [115, 1, 113, 9],   // continuation (MT 114 len 8)
      [116, 9, 114, 9],   // MT 116 split, first half
      [116, 10, 115, 1],  // MT 116 split, second half (verified)
      [117, 1, 116, 1],   // shortest psalm
      [146, 1, 145, 1],
      [147, 11, 146, 11], // MT 147 split, first half
      [147, 12, 147, 1],  // MT 147 split, second half (verified)
      [148, 1, 148, 1],   // re-aligned
      [150, 6, 150, 6],
    ];
    it.each(cases)('MT Ps %i:%i -> LXX %i:%i', (mc, mv, lc, lv) => {
      expect(psalmMtToLxx(mc, mv)).toEqual({ chapter: lc, verse: lv });
      expect(mapVerse('Psalms', mc, mv, 'MT', 'LXX')).toEqual({ chapter: lc, verse: lv });
    });
  });

  describe('LXX -> MT (inverse)', () => {
    it('LXX 22:1 -> MT 23:1', () => {
      expect(psalmLxxToMt(22, 1)).toEqual({ chapter: 23, verse: 1 });
    });
    it('LXX 9:22 -> MT 10:1', () => {
      expect(psalmLxxToMt(9, 22)).toEqual({ chapter: 10, verse: 1 });
    });
    it('LXX 151 has no Masoretic equivalent', () => {
      expect(mapVerse('Psalms', 151, 1, 'LXX', 'MT')).toBeNull();
    });
  });

  it('round-trips MT -> LXX -> MT across the whole Psalter', () => {
    const lengths: Record<number, number> = { 9: 21, 10: 18, 114: 8, 116: 19, 147: 20 };
    for (let ch = 1; ch <= 150; ch++) {
      const n = lengths[ch] ?? 6;
      for (let v = 1; v <= n; v++) {
        const lxx = psalmMtToLxx(ch, v);
        expect(psalmLxxToMt(lxx.chapter, lxx.verse)).toEqual({ chapter: ch, verse: v });
      }
    }
  });

  it('non-Psalms and same-scheme map as identity', () => {
    expect(mapVerse('Genesis', 5, 5, 'MT', 'LXX')).toEqual({ chapter: 5, verse: 5 });
    expect(mapVerse('Psalms', 23, 1, 'MT', 'MT')).toEqual({ chapter: 23, verse: 1 });
  });
});

describe('MT <-> English (KJV) versification', () => {
  it('Joel: MT 4 chapters -> KJV 3', () => {
    expect(mtToEnglish('Joel', 3, 1)).toEqual({ chapter: 2, verse: 28 });
    expect(mtToEnglish('Joel', 4, 1)).toEqual({ chapter: 3, verse: 1 });
    expect(englishToMt('Joel', 2, 28)).toEqual({ chapter: 3, verse: 1 });
  });
  it('Malachi: MT 3 chapters -> KJV 4', () => {
    expect(mtToEnglish('Malachi', 3, 19)).toEqual({ chapter: 4, verse: 1 });
    expect(mtToEnglish('Malachi', 3, 1)).toEqual({ chapter: 3, verse: 1 });
    expect(englishToMt('Malachi', 4, 1)).toEqual({ chapter: 3, verse: 19 });
  });
  it('Psalm titles: Hebrew title verse has no KJV number', () => {
    expect(mtToEnglish('Psalms', 3, 1)).toBeNull();      // title
    expect(mtToEnglish('Psalms', 3, 2)).toEqual({ chapter: 3, verse: 1 });
    expect(mtToEnglish('Psalms', 51, 1)).toBeNull();     // two-verse title
    expect(mtToEnglish('Psalms', 51, 3)).toEqual({ chapter: 51, verse: 1 });
  });
  it('single-book offsets (Genesis 32, Ezekiel 21)', () => {
    expect(mtToEnglish('Genesis', 32, 1)).toEqual({ chapter: 31, verse: 55 });
    expect(mtToEnglish('Ezekiel', 21, 1)).toEqual({ chapter: 20, verse: 45 });
  });
  it('composes LXX <-> English through MT (Ps 23 has no title offset)', () => {
    // LXX Psalm 22 = MT 23 = KJV 23
    expect(mapVerse('Psalms', 22, 1, 'LXX', 'English')).toEqual({ chapter: 23, verse: 1 });
    expect(mapVerse('Psalms', 23, 1, 'English', 'LXX')).toEqual({ chapter: 22, verse: 1 });
  });
});

describe('structurally-divergent MT<->LXX books (safe, not silently wrong)', () => {
  it('flags reorder/addition books as unreliable for MT<->LXX', () => {
    expect(isMappingReliable('Jeremiah', 'MT', 'LXX')).toBe(false);
    expect(isMappingReliable('Esther', 'LXX', 'MT')).toBe(false);
    // but reliable elsewhere
    expect(isMappingReliable('Psalms', 'MT', 'LXX')).toBe(true);
    expect(isMappingReliable('Genesis', 'MT', 'LXX')).toBe(true);
    expect(isMappingReliable('Jeremiah', 'MT', 'English')).toBe(true);
  });
  it('refuses MT<->LXX for a divergent book rather than misaligning', () => {
    // Swete Jer 26 = the Elam oracle (MT 49:34), so identity would be wrong — return null
    expect(mapVerse('Jeremiah', 26, 1, 'MT', 'LXX')).toBeNull();
    expect(mapVerse('Jeremiah', 26, 1, 'LXX', 'MT')).toBeNull();
  });
  it('still maps divergent books in other scheme pairs', () => {
    expect(mapVerse('Jeremiah', 8, 23, 'MT', 'English')).toEqual({ chapter: 9, verse: 1 });
    expect(mapVerse('Genesis', 5, 5, 'MT', 'LXX')).toEqual({ chapter: 5, verse: 5 }); // aligned book, fine
  });
});
