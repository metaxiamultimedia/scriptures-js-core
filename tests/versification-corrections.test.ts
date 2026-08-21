/**
 * Content-verified corrections to MT (Hebrew) <-> English (KJV) versification.
 *
 * Every golden case below is checked against the OpenScriptures OHB (Hebrew) and
 * Crosswire KJV verse text (the `text` fields):
 *   - 2Chr 1:18 "Solomon determined to build a house..." == KJV 2:1
 *   - 2Chr 13:23 "Abijah slept with his fathers..."      == KJV 14:1
 *   - 1Chr 12:4 "Ismaiah the Gibeonite..." + 12:5 "Jeremiah, Jahaziel, Johanan,
 *       Jozabad..." are BOTH inside KJV 12:4 (Hebrew subdivides one KJV verse).
 *
 * The round-trip block is the grounded invariant: englishToMt is a bounded-search
 * inverse of mtToEnglish, so for every REAL Hebrew verse the round trip must be the
 * identity EXCEPT at points where the forward map is intentionally non-injective
 * (several Hebrew verses collapse to one English verse, or one English verse has a
 * duplicate mapping). Those, and only those, are allow-listed with a cited reason.
 */
import { describe, it, expect } from 'vitest';
import { mtToEnglish, englishToMt } from '../src/versification/english.js';
import type { Ref } from '../src/versification/psalms.js';

describe('MT <-> English corrections (content-verified)', () => {
  describe('forward: mtToEnglish golden cases', () => {
    const cases: [string, number, number, number, number][] = [
      // 2 Chronicles 1/2 — Heb ch1 has 18 verses (KJV 17); Heb 1:18 = KJV 2:1.
      ['2 Chronicles', 1, 18, 2, 1],
      ['2 Chronicles', 2, 1, 2, 2],
      ['2 Chronicles', 2, 17, 2, 18], // Heb ch2 last verse (17) = KJV 2:18
      // 2 Chronicles 13/14 — Heb ch13 has 23 verses (KJV 22); Heb 13:23 = KJV 14:1.
      ['2 Chronicles', 13, 23, 14, 1],
      ['2 Chronicles', 14, 1, 14, 2],
      ['2 Chronicles', 14, 14, 14, 15], // Heb ch14 last verse (14) = KJV 14:15
      // 1 Chronicles 12 — start-aligned; Heb 12:4-5 both = KJV 12:4.
      ['1 Chronicles', 12, 1, 12, 1],
      ['1 Chronicles', 12, 4, 12, 4],
      ['1 Chronicles', 12, 5, 12, 4], // the subdivided tail
      ['1 Chronicles', 12, 6, 12, 5],
      // Genesis 32 — Heb 32:1 = KJV 31:55 (chapter-boundary shift).
      ['Genesis', 32, 1, 31, 55],
      ['Genesis', 32, 2, 32, 1],
    ];
    it.each(cases)('%s %i:%i -> KJV %i:%i', (book, hc, hv, ec, ev) => {
      expect(mtToEnglish(book, hc, hv)).toEqual({ chapter: ec, verse: ev });
    });
  });

  describe('inverse: englishToMt golden cases', () => {
    const cases: [string, number, number, number, number][] = [
      ['2 Chronicles', 2, 1, 1, 18],
      ['2 Chronicles', 2, 2, 2, 1],
      ['2 Chronicles', 2, 18, 2, 17],
      ['2 Chronicles', 14, 1, 13, 23],
      ['2 Chronicles', 14, 2, 14, 1],
      ['Genesis', 31, 55, 32, 1],
      ['Genesis', 32, 1, 32, 2],
      // Ps 51 is a two-verse-title psalm: KJV 51:1 = Hebrew 51:3.
      ['Psalms', 51, 1, 51, 3],
      // Open-ended seam rules: the inverse must return the REAL in-chapter Hebrew
      // preimage, not the phantom in the previous chapter (Heb 7:30 / Heb 5:27).
      ['Exodus', 8, 5, 8, 1], // KJV 8:5 = Heb 8:1 (not phantom Heb 7:30)
      ['Leviticus', 6, 8, 6, 1], // KJV 6:8 = Heb 6:1 (not phantom Heb 5:27)
    ];
    it.each(cases)('%s KJV %i:%i -> Heb %i:%i', (book, ec, ev, hc, hv) => {
      expect(englishToMt(book, ec, ev)).toEqual({ chapter: hc, verse: hv });
    });
  });

  describe('round-trip invariant over real Hebrew verses', () => {
    // Real OHB (Hebrew) verse-count per chapter, counted from the OpenScriptures OHB
    // data files. We only round-trip verses that actually exist in the Hebrew text —
    // scanning past a chapter's real length would exercise "phantom" refs the forward
    // map was never meant to receive.
    const OHB_VERSE_COUNTS: Record<string, number[]> = {
      Psalms: [6, 12, 9, 9, 13, 11, 18, 10, 21, 18, 7, 9, 6, 7, 5, 11, 15, 51, 15, 10, 14, 32, 6, 10, 22, 12, 14, 9, 11, 13, 25, 11, 22, 23, 28, 13, 40, 23, 14, 18, 14, 12, 5, 27, 18, 12, 10, 15, 21, 23, 21, 11, 7, 9, 24, 14, 12, 12, 18, 14, 9, 13, 12, 11, 14, 20, 8, 36, 37, 6, 24, 20, 28, 23, 11, 13, 21, 72, 13, 20, 17, 8, 19, 13, 14, 17, 7, 19, 53, 17, 16, 16, 5, 23, 11, 13, 12, 9, 9, 5, 8, 29, 22, 35, 45, 48, 43, 14, 31, 7, 10, 10, 9, 8, 18, 19, 2, 29, 176, 7, 8, 9, 4, 8, 5, 6, 5, 6, 8, 8, 3, 18, 3, 3, 21, 26, 9, 8, 24, 14, 10, 8, 12, 15, 21, 10, 20, 14, 9, 6],
      Joel: [20, 27, 5, 21],
      Malachi: [14, 17, 24],
      Nehemiah: [11, 20, 38, 17, 19, 19, 72, 18, 37, 40, 36, 47, 31],
      '1 Samuel': [28, 36, 21, 22, 12, 21, 17, 22, 27, 27, 15, 25, 23, 52, 35, 23, 58, 30, 24, 42, 16, 23, 28, 23, 44, 25, 12, 25, 11, 31, 13],
      '2 Samuel': [27, 32, 39, 12, 25, 23, 29, 18, 13, 19, 27, 31, 39, 33, 37, 23, 29, 32, 44, 26, 22, 51, 39, 25],
      '1 Kings': [53, 46, 28, 20, 32, 38, 51, 66, 28, 29, 43, 33, 34, 31, 34, 34, 24, 46, 21, 43, 29, 54],
      '2 Kings': [18, 25, 27, 44, 27, 33, 20, 29, 37, 36, 20, 22, 25, 29, 38, 20, 41, 37, 37, 21, 26, 20, 37, 20, 30],
      '1 Chronicles': [54, 55, 24, 43, 41, 66, 40, 40, 44, 14, 47, 41, 14, 17, 29, 43, 27, 17, 19, 8, 30, 19, 32, 31, 31, 32, 34, 21, 30],
      '2 Chronicles': [18, 17, 17, 22, 14, 42, 22, 18, 31, 19, 23, 16, 23, 14, 19, 14, 19, 34, 11, 37, 20, 12, 21, 27, 28, 23, 9, 27, 36, 27, 21, 33, 25, 33, 27, 23],
      Ecclesiastes: [18, 26, 22, 17, 19, 12, 29, 17, 18, 20, 10, 14],
      'Song of Solomon': [17, 17, 11, 16, 16, 12, 14, 14],
      Isaiah: [31, 22, 26, 6, 30, 13, 25, 23, 20, 34, 16, 6, 22, 32, 9, 14, 14, 7, 25, 6, 17, 25, 18, 23, 12, 21, 13, 29, 24, 33, 9, 20, 24, 17, 10, 22, 38, 22, 8, 31, 29, 25, 28, 28, 25, 13, 15, 22, 26, 11, 23, 15, 12, 17, 13, 12, 21, 14, 21, 22, 11, 12, 19, 11, 25, 24],
      Jeremiah: [19, 37, 25, 31, 31, 30, 34, 23, 25, 25, 23, 17, 27, 22, 21, 21, 27, 23, 15, 18, 14, 30, 40, 10, 38, 24, 22, 17, 32, 24, 40, 44, 26, 22, 19, 32, 21, 28, 18, 16, 18, 22, 13, 30, 5, 28, 7, 47, 39, 46, 64, 34],
      Ezekiel: [28, 10, 27, 17, 17, 14, 27, 18, 11, 22, 25, 28, 23, 23, 8, 63, 24, 32, 14, 44, 37, 31, 49, 27, 17, 21, 36, 26, 21, 26, 18, 32, 33, 31, 15, 38, 28, 23, 29, 49, 26, 20, 27, 31, 25, 24, 23, 35],
      Hosea: [9, 25, 5, 19, 15, 11, 16, 14, 17, 15, 11, 15, 15, 10],
      Jonah: [16, 11, 10, 11],
      Micah: [16, 13, 12, 14, 14, 16, 20],
      Nahum: [14, 14, 19],
      Zechariah: [17, 17, 10, 14, 11, 15, 14, 23, 17, 12, 17, 14, 9, 21],
      Genesis: [31, 25, 24, 26, 32, 22, 24, 22, 29, 32, 32, 20, 18, 24, 21, 16, 27, 33, 38, 18, 34, 24, 20, 67, 34, 35, 46, 22, 35, 43, 54, 33, 20, 31, 29, 43, 36, 30, 23, 23, 57, 38, 34, 34, 28, 34, 31, 22, 33, 26],
      Exodus: [22, 25, 22, 31, 23, 30, 29, 28, 35, 29, 10, 51, 22, 31, 27, 36, 16, 27, 25, 26, 37, 30, 33, 18, 40, 37, 21, 43, 46, 38, 18, 35, 23, 35, 35, 38, 29, 31, 43, 38],
      Leviticus: [17, 16, 17, 35, 26, 23, 38, 36, 24, 20, 47, 8, 59, 57, 33, 34, 16, 30, 37, 27, 24, 33, 44, 23, 55, 46, 34],
      Numbers: [54, 34, 51, 49, 31, 27, 89, 26, 23, 36, 35, 16, 33, 45, 41, 35, 28, 32, 22, 29, 35, 41, 30, 25, 19, 65, 23, 31, 39, 17, 54, 42, 56, 29, 34, 13],
      Daniel: [21, 49, 33, 34, 30, 29, 28, 27, 27, 21, 45, 13],
    };

    // The only points where the forward map is intentionally non-injective, so the
    // bounded-search inverse cannot return the identity preimage. Each predicate is
    // justified against the actual OHB/KJV verse content.
    const ALLOWED_EXCEPTIONS: { name: string; hit: (b: string, hc: number, hv: number) => boolean }[] = [
      {
        // 1 Chronicles 12:4-5 -> KJV 12:4. KJV 12:4 text contains BOTH "Ismaiah the
        // Gibeonite..." (Heb 12:4) AND "Jeremiah, Jahaziel, Johanan, Jozabad the
        // Gederathite" (Heb 12:5); the Hebrew subdivides one KJV verse. The inverse
        // returns the second Hebrew part (12:5).
        name: '1Chr 12:4/5 subdivided into KJV 12:4',
        hit: (b, hc, hv) => b === '1 Chronicles' && hc === 12 && hv === 4,
      },
      {
        // 1 Kings 22:43 + 22:44 -> KJV 22:43. Hebrew has 54 verses, KJV 53; Heb 22:44
        // ("...he walked in all the ways of Asa his father...") is folded into the tail
        // of KJV 22:43. Two Hebrew verses collapse to one KJV verse; inverse returns 44.
        name: '1Kgs 22:43 merged (Heb 22:43+22:44 -> KJV 22:43)',
        hit: (b, hc, hv) => b === '1 Kings' && hc === 22 && hv === 43,
      },
      {
        // 1 Chronicles 6: the forward map DELIBERATELY double-maps Hebrew 5:27-41 and
        // Hebrew 6:1-15 onto the same KJV 6:1-15 (and Heb 6:16-66 onto KJV 6:31-81),
        // because the data file duplicates that content across the chapter seam. Both
        // Hebrew 6:v and Hebrew 5:(v+26) carry the same content; inverse prefers the
        // ch5 preimage. All of Hebrew 1Chr 6 is affected.
        name: '1Chr 6 duplicate mapping (Heb 5:27-41 == Heb 6:1-15 content)',
        hit: (b, hc) => b === '1 Chronicles' && hc === 6,
      },
      // NOTE: Exodus 8 / Leviticus 6 were previously exceptions (the open-ended seam
      // rules Heb 7:26+ -> KJV 8:1+ and Heb 5:20+ -> KJV 6:1+ gave KJV verses a phantom
      // lower-chapter preimage the inverse found first). englishToMt now searches the
      // SAME chapter before neighbours, so it returns the real in-chapter preimage and
      // these round-trip cleanly — no exception needed.
    ];

    it('round-trips every real Hebrew verse except documented non-injective points', () => {
      const unexplained: string[] = [];
      const categoryHits = new Map<string, number>();

      for (const [book, counts] of Object.entries(OHB_VERSE_COUNTS)) {
        for (let hc = 1; hc <= counts.length; hc++) {
          const maxV = counts[hc - 1];
          for (let hv = 1; hv <= maxV; hv++) {
            const e = mtToEnglish(book, hc, hv);
            if (!e) continue; // Hebrew verse with no distinct KJV verse
            const back = englishToMt(book, e.chapter, e.verse);
            const ok: Ref = { chapter: hc, verse: hv };
            if (back.chapter === ok.chapter && back.verse === ok.verse) continue;

            const cat = ALLOWED_EXCEPTIONS.find((x) => x.hit(book, hc, hv));
            if (cat) {
              categoryHits.set(cat.name, (categoryHits.get(cat.name) ?? 0) + 1);
            } else {
              unexplained.push(
                `${book} ${hc}:${hv} -> KJV ${e.chapter}:${e.verse} -> back ${back.chapter}:${back.verse}`,
              );
            }
          }
        }
      }

      // (1) No round-trip failure outside the documented, content-justified categories.
      expect(unexplained).toEqual([]);

      // (2) Every allow-list entry is actually exercised — no dead allowances silently
      // widening the invariant.
      for (const { name } of ALLOWED_EXCEPTIONS) {
        expect(categoryHits.get(name) ?? 0).toBeGreaterThan(0);
      }
    });
  });
});
