/**
 * MT (Masoretic / Hebrew) <-> English (KJV) versification.
 * Ported from gematriabible.com/scripts/versification-mapping.js and then
 * content-verified/corrected against the actual OHB (Hebrew) and Crosswire KJV
 * verse data: Psalm-title offsets, Joel/Malachi chapter differences, and the many
 * single-book verse offsets (Samuel, Kings, Chronicles,
 * Genesis/Exodus/Leviticus/Numbers/Deuteronomy, Ezekiel, the Twelve...).
 * The MT<->English mapping here is corrected and round-trip-tested
 * (see tests/versification-corrections.test.ts); englishToMt is a bounded-search
 * inverse of mtToEnglish so the two cannot drift apart.
 * mtToEnglish may return null where a Hebrew verse has no distinct KJV verse.
 *
 * KNOWN GAPS (handled elsewhere, NOT covered here): MT<->LXX (Septuagint)
 * differences outside the Psalm titles, and NT English/Greek verse splits.
 */
import type { Ref } from './psalms.js';

const PSALMS_WITH_TITLE_VERSE = [
  3, 4, 5, 6, 7, 8, 9, 12, 18, 19,
  20, 21, 22, 30, 31, 34, 36, 38, 39, 40,
  41, 42, 44, 45, 46, 47, 48, 49, 53, 55,
  56, 57, 58, 59, 61, 62, 63, 64, 65, 67,
  68, 69, 70, 75, 76, 77, 80, 81, 83, 84,
  85, 88, 89, 92, 102, 108, 140, 142
];

// Psalms with 2-verse title in the data files (title spans verses 1-2)
// For these psalms, both verse 1 AND verse 2 are title content with no KJV equivalent.
// Hebrew verse 3 = KJV verse 1.
// Total: 4 psalms have 2-verse titles in the actual data
const PSALMS_WITH_TWO_VERSE_TITLE = [
  51, 52, 54, 60
];

/**
 * Get the KJV verse reference for a Hebrew/Greek verse reference
 * @param {string} book - Book name (e.g., "Psalms", "Joel")
 * @param {number} chapter - Hebrew chapter number
 * @param {number} verse - Hebrew verse number
 * @returns {{ chapter: number, verse: number } | null} - KJV reference, or null if no KJV equivalent
 */
export function mtToEnglish(book: string, chapter: number, verse: number): Ref | null {
  // Psalms - handle superscription offset
  if (book === 'Psalms') {
    if (PSALMS_WITH_TWO_VERSE_TITLE.includes(chapter)) {
      // Two-verse title: Hebrew v1-2 = title, Hebrew v3 = KJV v1
      if (verse <= 2) {
        return null; // Title verses have no KJV verse number
      }
      return { chapter, verse: verse - 2 };
    } else if (PSALMS_WITH_TITLE_VERSE.includes(chapter)) {
      // One-verse title: Hebrew v1 = title, Hebrew v2 = KJV v1
      if (verse === 1) {
        return null; // Title verse has no KJV verse number
      }
      return { chapter, verse: verse - 1 };
    }
    return { chapter, verse }; // No offset for psalms without titles
  }

  // Joel - Hebrew has 4 chapters, KJV has 3
  // Hebrew Joel 3 (verses 1-5) = KJV Joel 2:28-32
  // Hebrew Joel 4 = KJV Joel 3
  if (book === 'Joel') {
    if (chapter === 3) {
      return { chapter: 2, verse: verse + 27 }; // Joel 3:1 -> 2:28
    }
    if (chapter === 4) {
      return { chapter: 3, verse };
    }
    return { chapter, verse };
  }

  // Malachi - Hebrew has 3 chapters, KJV has 4
  // Hebrew Malachi 3:19-24 = KJV Malachi 4:1-6
  if (book === 'Malachi') {
    if (chapter === 3 && verse >= 19) {
      return { chapter: 4, verse: verse - 18 }; // 3:19 -> 4:1
    }
    return { chapter, verse };
  }

  // Nehemiah versification: Data has mixed versification
  // Nehemiah 3 in data: 38 verses (Hebrew versification, includes 3:33-38)
  // Nehemiah 4 in data: 23 verses (KJV versification, 1-23)
  // Hebrew 3:33-38 content = KJV 4:1-6, but data also has Nehemiah 4:1-6
  // So Nehemiah 3:33-38 should return null to avoid duplicates
  if (book === 'Nehemiah' && chapter === 3 && verse >= 33) {
    return null; // Skip - this content already exists as Nehemiah 4:1-6 in the data
  }

  // Nehemiah 10 - Hebrew 10:1 = KJV 9:38, Hebrew 10:2+ = KJV 10:1+
  if (book === 'Nehemiah' && chapter === 10) {
    if (verse === 1) {
      return { chapter: 9, verse: 38 };
    }
    return { chapter: 10, verse: verse - 1 };
  }

  // 1 Samuel 21 - Hebrew 21:1 = KJV 20:42b (partial verse)
  // Hebrew 21:2-16 = KJV 21:1-15
  if (book === '1 Samuel' && chapter === 21) {
    if (verse === 1) {
      return null; // First part is end of previous chapter in KJV
    }
    return { chapter: 21, verse: verse - 1 };
  }

  // 1 Samuel 24 - Hebrew 24:1 = KJV 23:29, Hebrew 24:2+ = KJV 24:1+
  if (book === '1 Samuel' && chapter === 24) {
    if (verse === 1) {
      return { chapter: 23, verse: 29 };
    }
    return { chapter: 24, verse: verse - 1 };
  }

  // 2 Samuel 19 - Hebrew 19:1 = KJV 18:33, Hebrew 19:2+ = KJV 19:1+
  if (book === '2 Samuel' && chapter === 19) {
    if (verse === 1) {
      return { chapter: 18, verse: 33 };
    }
    return { chapter: 19, verse: verse - 1 };
  }

  // 1 Kings 5 - Hebrew 5:1-14 = KJV 4:21-34, Hebrew 5:15+ = KJV 5:1+
  if (book === '1 Kings' && chapter === 5) {
    if (verse <= 14) {
      return { chapter: 4, verse: verse + 20 }; // 5:1 -> 4:21
    }
    return { chapter: 5, verse: verse - 14 }; // 5:15 -> 5:1
  }

  // 1 Kings 22 - Hebrew has 54 verses, KJV has 53
  // Hebrew 22:44-54 = KJV 22:43-53
  if (book === '1 Kings' && chapter === 22 && verse >= 44) {
    return { chapter: 22, verse: verse - 1 };
  }

  // 2 Kings 12 - Hebrew 12:1 = KJV 11:21, Hebrew 12:2+ = KJV 12:1+
  if (book === '2 Kings' && chapter === 12) {
    if (verse === 1) {
      return { chapter: 11, verse: 21 };
    }
    return { chapter: 12, verse: verse - 1 };
  }

  // 1 Chronicles 5 - Hebrew 5:27-41 = KJV 6:1-15 (Hebrew has extra verses at end of chapter 5)
  if (book === '1 Chronicles' && chapter === 5 && verse >= 27) {
    return { chapter: 6, verse: verse - 26 }; // 5:27 -> 6:1, 5:41 -> 6:15
  }

  // 1 Chronicles 12 — start-aligned; Hebrew subdivides one verse (Heb 12:4-5 = KJV 12:4).
  // Heb 12:1-4 = KJV 12:1-4; Heb 12:5+ = KJV 12:(v-1). (content-verified)
  if (book === '1 Chronicles' && chapter === 12) {
    if (verse <= 4) {
      return { chapter: 12, verse };
    }
    return { chapter: 12, verse: verse - 1 };
  }

  // 1 Chronicles 6 - Hebrew 6:1-15 = KJV 6:1-15 (same content as Hebrew 5:27-41), Hebrew 6:16-66 = KJV 6:31-81
  if (book === '1 Chronicles' && chapter === 6) {
    if (verse <= 15) {
      return { chapter: 6, verse }; // 6:1 -> 6:1 (same verse numbers)
    }
    return { chapter: 6, verse: verse + 15 }; // 6:16 -> 6:31, 6:66 -> 6:81
  }

  // 2 Chronicles 1/2 — OHB Hebrew ch1 has 18 verses, KJV ch1 has 17; the extra Hebrew verse
  // pushes KJV ch2 later. Heb 1:18 = KJV 2:1; Heb 2:v = KJV 2:(v+1). (content-verified)
  if (book === '2 Chronicles' && chapter === 1 && verse === 18) {
    return { chapter: 2, verse: 1 };
  }
  if (book === '2 Chronicles' && chapter === 2) {
    return { chapter: 2, verse: verse + 1 };
  }

  // 2 Chronicles 13/14 — OHB Hebrew ch13 has 23 verses, KJV ch13 has 22. Heb 13:23 = KJV 14:1;
  // Heb 14:v = KJV 14:(v+1). (content-verified)
  if (book === '2 Chronicles' && chapter === 13 && verse === 23) {
    return { chapter: 14, verse: 1 };
  }
  if (book === '2 Chronicles' && chapter === 14) {
    return { chapter: 14, verse: verse + 1 };
  }

  // Ecclesiastes 4 - Hebrew 4:17 = KJV 5:1 (chapter boundary difference)
  if (book === 'Ecclesiastes' && chapter === 4 && verse === 17) {
    return { chapter: 5, verse: 1 };
  }

  // Ecclesiastes 5 - Hebrew 5:1-19 = KJV 5:2-20
  if (book === 'Ecclesiastes' && chapter === 5) {
    return { chapter: 5, verse: verse + 1 };
  }

  // Song of Solomon 7 - Hebrew 7:1-14 = KJV 6:13 + 7:1-13
  if (book === 'Song of Solomon' && chapter === 7) {
    if (verse === 1) {
      return { chapter: 6, verse: 13 };
    }
    return { chapter: 7, verse: verse - 1 };
  }

  // Isaiah 8:23 = KJV 9:1, Isaiah 9:1+ = KJV 9:2+
  if (book === 'Isaiah' && chapter === 8 && verse === 23) {
    return { chapter: 9, verse: 1 };
  }
  if (book === 'Isaiah' && chapter === 9) {
    return { chapter: 9, verse: verse + 1 };
  }

  // Jeremiah 8:23 = KJV 9:1, Jeremiah 9:1+ = KJV 9:2+
  if (book === 'Jeremiah' && chapter === 8 && verse === 23) {
    return { chapter: 9, verse: 1 };
  }
  if (book === 'Jeremiah' && chapter === 9) {
    return { chapter: 9, verse: verse + 1 };
  }

  // Ezekiel 21 - Hebrew 21:1-5 = KJV 20:45-49, Hebrew 21:6+ = KJV 21:1+
  if (book === 'Ezekiel' && chapter === 21) {
    if (verse <= 5) {
      return { chapter: 20, verse: verse + 44 }; // 21:1 -> 20:45
    }
    return { chapter: 21, verse: verse - 5 }; // 21:6 -> 21:1
  }

  // Daniel (chapters 3 and 6 have additions in LXX but not in Hebrew/KJV - no change needed)

  // Hosea 2 - Hebrew 2:1-2 = KJV 1:10-11, Hebrew 2:3+ = KJV 2:1+
  if (book === 'Hosea' && chapter === 2) {
    if (verse <= 2) {
      return { chapter: 1, verse: verse + 9 }; // 2:1 -> 1:10
    }
    return { chapter: 2, verse: verse - 2 }; // 2:3 -> 2:1
  }

  // Hosea 12 - Hebrew 12:1 = KJV 11:12, Hebrew 12:2+ = KJV 12:1+
  if (book === 'Hosea' && chapter === 12) {
    if (verse === 1) {
      return { chapter: 11, verse: 12 };
    }
    return { chapter: 12, verse: verse - 1 };
  }

  // Hosea 14 - Hebrew 14:1 = KJV 13:16, Hebrew 14:2+ = KJV 14:1+
  if (book === 'Hosea' && chapter === 14) {
    if (verse === 1) {
      return { chapter: 13, verse: 16 };
    }
    return { chapter: 14, verse: verse - 1 };
  }

  // Jonah 2 - Hebrew 2:1 = KJV 1:17, Hebrew 2:2+ = KJV 2:1+
  if (book === 'Jonah' && chapter === 2) {
    if (verse === 1) {
      return { chapter: 1, verse: 17 };
    }
    return { chapter: 2, verse: verse - 1 };
  }

  // Micah 4 - Hebrew 4:14 = KJV 5:1, chapter boundary
  if (book === 'Micah' && chapter === 4 && verse === 14) {
    return { chapter: 5, verse: 1 };
  }

  // Micah 5 - Hebrew 5:1-14 = KJV 5:2-15
  if (book === 'Micah' && chapter === 5) {
    return { chapter: 5, verse: verse + 1 };
  }

  // Nahum 2 - Hebrew 2:1 = KJV 1:15, Hebrew 2:2+ = KJV 2:1+
  if (book === 'Nahum' && chapter === 2) {
    if (verse === 1) {
      return { chapter: 1, verse: 15 };
    }
    return { chapter: 2, verse: verse - 1 };
  }

  // Zechariah 2 - Hebrew 2:1-4 = KJV 1:18-21, Hebrew 2:5+ = KJV 2:1+
  if (book === 'Zechariah' && chapter === 2) {
    if (verse <= 4) {
      return { chapter: 1, verse: verse + 17 }; // 2:1 -> 1:18
    }
    return { chapter: 2, verse: verse - 4 }; // 2:5 -> 2:1
  }

  // Genesis 32 - Hebrew 32:1 = KJV 31:55, Hebrew 32:2-33 = KJV 32:1-32
  if (book === 'Genesis' && chapter === 32) {
    if (verse === 1) {
      return { chapter: 31, verse: 55 };
    }
    return { chapter: 32, verse: verse - 1 };
  }

  // Exodus 7:26-29 = KJV 8:1-4, Exodus 8:1+ = KJV 8:5+
  if (book === 'Exodus' && chapter === 7 && verse >= 26) {
    return { chapter: 8, verse: verse - 25 }; // 7:26 -> 8:1
  }
  if (book === 'Exodus' && chapter === 8) {
    return { chapter: 8, verse: verse + 4 }; // 8:1 -> 8:5
  }

  // Exodus 21:37 = KJV 22:1, Exodus 22:1+ = KJV 22:2+
  if (book === 'Exodus' && chapter === 21 && verse === 37) {
    return { chapter: 22, verse: 1 };
  }
  if (book === 'Exodus' && chapter === 22) {
    return { chapter: 22, verse: verse + 1 };
  }

  // Leviticus 5:20-26 = KJV 6:1-7, Leviticus 6:1+ = KJV 6:8+
  if (book === 'Leviticus' && chapter === 5 && verse >= 20) {
    return { chapter: 6, verse: verse - 19 }; // 5:20 -> 6:1
  }
  if (book === 'Leviticus' && chapter === 6) {
    return { chapter: 6, verse: verse + 7 }; // 6:1 -> 6:8
  }

  // Numbers 17 - Hebrew 17:1-15 = KJV 16:36-50, Hebrew 17:16+ = KJV 17:1+
  if (book === 'Numbers' && chapter === 17) {
    if (verse <= 15) {
      return { chapter: 16, verse: verse + 35 }; // 17:1 -> 16:36
    }
    return { chapter: 17, verse: verse - 15 }; // 17:16 -> 17:1
  }

  // Numbers 25:19 - Hebrew verse that's merged into KJV 26:1 (not a separate verse in KJV)
  if (book === 'Numbers' && chapter === 25 && verse === 19) {
    return null; // This Hebrew verse has no separate KJV equivalent
  }

  // Numbers 30 - Hebrew 30:1 = KJV 29:40, Hebrew 30:2+ = KJV 30:1+
  if (book === 'Numbers' && chapter === 30) {
    if (verse === 1) {
      return { chapter: 29, verse: 40 };
    }
    return { chapter: 30, verse: verse - 1 };
  }

  // Deuteronomy 13 - Hebrew 13:1 = KJV 12:32, Hebrew 13:2+ = KJV 13:1+
  if (book === 'Deuteronomy' && chapter === 13) {
    if (verse === 1) {
      return { chapter: 12, verse: 32 };
    }
    return { chapter: 13, verse: verse - 1 };
  }

  // Deuteronomy 23 - Hebrew 23:1 = KJV 22:30, Hebrew 23:2+ = KJV 23:1+
  if (book === 'Deuteronomy' && chapter === 23) {
    if (verse === 1) {
      return { chapter: 22, verse: 30 };
    }
    return { chapter: 23, verse: verse - 1 };
  }

  // Deuteronomy 28:69 = KJV 29:1, Deuteronomy 29:1+ = KJV 29:2+
  if (book === 'Deuteronomy' && chapter === 28 && verse === 69) {
    return { chapter: 29, verse: 1 };
  }
  if (book === 'Deuteronomy' && chapter === 29) {
    return { chapter: 29, verse: verse + 1 };
  }

  // Nehemiah 10 - Hebrew 10:1 = KJV 9:38, Hebrew 10:2+ = KJV 10:1+
  // (Update existing mapping to be more accurate)

  // Job versification: Data has mixed versification
  // Job 40 in data: 32 verses (Hebrew versification: 1-32)
  // Job 41 in data: 34 verses (KJV versification: 1-34)
  // Hebrew 40:25-32 content = KJV 41:1-8, but data also has Job 41:1-8 with KJV content
  // So Job 40:25-32 should return null to avoid duplicates
  if (book === 'Job' && chapter === 40 && verse >= 25) {
    return null; // Skip - this content already exists as Job 41:1-8 in the data
  }
  // Job 41 in data uses KJV versification, no offset needed
  // (verses 1-34 map directly to KJV 41:1-34)

  // Daniel versification: Data has mixed versification
  // Daniel 3 in data: 33 verses (Hebrew versification, includes 3:31-33)
  // Daniel 4 in data: 37 verses (KJV versification, 1-37)
  // Daniel 6 in data: 29 verses (Hebrew versification, 1-29)
  // Hebrew 3:31-33 content = KJV 4:1-3, but data also has Daniel 4:1-3
  // So Daniel 3:31-33 should return null to avoid duplicates
  if (book === 'Daniel' && chapter === 3 && verse >= 31) {
    return null; // Skip - this content already exists as Daniel 4:1-3 in the data
  }
  // Daniel 4 in data uses KJV versification, no offset needed

  // Daniel 6 - Hebrew 6:1 = KJV 5:31, Hebrew 6:2+ = KJV 6:1+
  if (book === 'Daniel' && chapter === 6) {
    if (verse === 1) {
      return { chapter: 5, verse: 31 };
    }
    return { chapter: 6, verse: verse - 1 };
  }

  // No mapping needed - same in both
  return { chapter, verse };
}

/**
 * Hebrew (MT) ref for a KJV/English ref — the inverse of {@link mtToEnglish}.
 *
 * Derived directly from `mtToEnglish` by a small bounded local search rather than a
 * second, drift-prone offset table (the previous version only covered ~8 books and
 * silently returned identity for the rest — a broken round-trip). Versification
 * offsets are local: the Hebrew chapter differs from the English by at most one and
 * the verse by less than a chapter. We scan candidate Hebrew refs in that
 * neighbourhood and return the one that maps forward to the requested English ref,
 * PREFERRING a non-identity preimage over the identity one — this is what makes
 * chapter-boundary shifts invert correctly despite the forward map not being
 * injective over non-existent "phantom" verses (e.g. KJV Gen 31:55 has a phantom
 * identity preimage Heb 31:55 and the real shifted preimage Heb 32:1; we return 32:1).
 *
 * Known limitation: for a subdivided verse (KJV 12:4 = Heb 12:4+12:5) the inverse
 * returns the second Hebrew part; both carry the same English content.
 */
export function englishToMt(book: string, chapter: number, verse: number): Ref {
  const MAX_VERSE = 200; // longer than any chapter (Ps 119 = 176)
  let identityMatch: Ref | null = null;
  // Try the SAME chapter first, then neighbours. This resolves phantom preimages at
  // open-ended seam rules: KJV 8:5 has a real preimage Heb 8:1 (same chapter) and a
  // phantom Heb 7:30 (from the unbounded `Heb 7:26+ -> KJV 8:1+` rule); same-chapter-
  // first returns the real one instead of the phantom in the previous chapter.
  for (const hc of [chapter, chapter - 1, chapter + 1]) {
    if (hc < 1) continue;
    for (let hv = 1; hv <= MAX_VERSE; hv++) {
      const e = mtToEnglish(book, hc, hv);
      if (e && e.chapter === chapter && e.verse === verse) {
        if (hc === chapter && hv === verse) {
          identityMatch = { chapter: hc, verse: hv };
        } else {
          return { chapter: hc, verse: hv };
        }
      }
    }
  }
  return identityMatch ?? { chapter, verse };
}

export { PSALMS_WITH_TITLE_VERSE, PSALMS_WITH_TWO_VERSE_TITLE };
