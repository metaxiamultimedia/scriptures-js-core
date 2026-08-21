/**
 * MT (Masoretic / Hebrew) <-> LXX (Septuagint) Psalm versification.
 *
 * The Psalter is numbered differently in the Hebrew and Greek traditions. This
 * mapping is EMPIRICALLY VERIFIED against the Swete LXX + the Masoretic text
 * (every boundary checked by content, 2026-08-03):
 *
 *   MT 1–8      = LXX 1–8            (aligned)
 *   MT 9        = LXX 9:1–21         (LXX merges 9+10 into one psalm)
 *   MT 10:v     = LXX 9:21+v         (verified: MT 10:1 = LXX 9:22)
 *   MT 11–113   = LXX 10–112         (offset −1)
 *   MT 114      = LXX 113:1–8        (LXX merges 114+115)
 *   MT 115:v    = LXX 113:8+v
 *   MT 116:1–9  = LXX 114            (LXX splits 116)
 *   MT 116:10+  = LXX 115:v−9        (verified: MT 116:10 = LXX 115:1)
 *   MT 117–146  = LXX 116–145        (offset −1)
 *   MT 147:1–11 = LXX 146            (LXX splits 147)
 *   MT 147:12+  = LXX 147:v−11       (verified: MT 147:12 = LXX 147:1)
 *   MT 148–150  = LXX 148–150        (aligned)
 *   LXX 151     = (no MT equivalent — the supernumerary psalm)
 */
export interface Ref {
  chapter: number;
  verse: number;
}

const MT9_LEN = 21; // verified: LXX 9 = 39 = MT 9 (21) + MT 10 (18)
const MT114_LEN = 8;

export function psalmMtToLxx(chapter: number, verse: number): Ref {
  if (chapter <= 8) return { chapter, verse };
  if (chapter === 9) return { chapter: 9, verse };
  if (chapter === 10) return { chapter: 9, verse: MT9_LEN + verse };
  if (chapter <= 113) return { chapter: chapter - 1, verse };
  if (chapter === 114) return { chapter: 113, verse };
  if (chapter === 115) return { chapter: 113, verse: MT114_LEN + verse };
  if (chapter === 116) {
    return verse <= 9 ? { chapter: 114, verse } : { chapter: 115, verse: verse - 9 };
  }
  if (chapter <= 146) return { chapter: chapter - 1, verse };
  if (chapter === 147) {
    return verse <= 11 ? { chapter: 146, verse } : { chapter: 147, verse: verse - 11 };
  }
  return { chapter, verse }; // 148–150
}

export function psalmLxxToMt(chapter: number, verse: number): Ref {
  if (chapter <= 8) return { chapter, verse };
  if (chapter === 9) {
    return verse <= MT9_LEN ? { chapter: 9, verse } : { chapter: 10, verse: verse - MT9_LEN };
  }
  if (chapter <= 112) return { chapter: chapter + 1, verse };
  if (chapter === 113) {
    return verse <= MT114_LEN ? { chapter: 114, verse } : { chapter: 115, verse: verse - MT114_LEN };
  }
  if (chapter === 114) return { chapter: 116, verse };
  if (chapter === 115) return { chapter: 116, verse: verse + 9 };
  if (chapter <= 145) return { chapter: chapter + 1, verse };
  if (chapter === 146) return { chapter: 147, verse };
  if (chapter === 147) return { chapter: 147, verse: verse + 11 };
  if (chapter <= 150) return { chapter, verse }; // 148–150
  return { chapter: 151, verse }; // LXX 151 has no MT equivalent
}
