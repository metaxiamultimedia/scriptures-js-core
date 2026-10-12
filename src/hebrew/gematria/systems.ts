/**
 * Hebrew Gematria Systems
 *
 * Letter-value tables derived from primary sources.
 *
 * ## Primary Sources (Public Domain)
 *
 * ### Jewish Encyclopedia (1903)
 *
 * Schechter, Solomon, and Caspar Levias. "Gematria." *Jewish Encyclopedia*,
 *   vol. 5, 589–92. New York: Funk and Wagnalls, 1903.
 *
 * - Jewish Encyclopedia: https://www.jewishencyclopedia.com/articles/6571-gematria
 * - Internet Archive (Vol. 5): https://archive.org/details/TheJewishEncyclopediaFunkWagnallVolVDreyfusBrisacGoat1902
 *
 * ### Pardes Rimonim (1548)
 *
 * Cordovero, Moses ben Jacob. *Pardes Rimmonim* (פרדס רמונים). Kraków, 1592.
 *   First published 1548. Gate 30, Chapter 8.
 *
 * - Sefaria: https://www.sefaria.org/Pardes_Rimmonim.30.8
 * - HebrewBooks: https://hebrewbooks.org/14492
 */

import type { GematriaSystem, LetterValueTable } from './types.js';

/**
 * MISPAR HECHRACHI (מספר הכרחי) - Standard/Normal Value
 *
 * Source: Jewish Encyclopedia (1903), Section E.1, Page 591
 * Quote: "Normal Value, מספר הכרחי, מספר פשוט, counting א—ט as units,
 *        י—צ as tens, ק—ת as hundreds. The final letters have here
 *        the same values as their respective initial forms."
 */
export const MISPAR_HECHRACHI: LetterValueTable = {
  // Units (1-9)
  'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5,
  'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
  // Tens (10-90)
  'י': 10, 'כ': 20, 'ל': 30, 'מ': 40, 'נ': 50,
  'ס': 60, 'ע': 70, 'פ': 80, 'צ': 90,
  // Hundreds (100-400)
  'ק': 100, 'ר': 200, 'ש': 300, 'ת': 400,
  // Finals (same as initial forms per source)
  'ך': 20, 'ם': 40, 'ן': 50, 'ף': 80, 'ץ': 90,
};

/**
 * MISPAR GADOL (מספר גדול) - Major/Large Value
 *
 * Source: Jewish Encyclopedia (1903), Section E.11, Page 592
 * Quote: "Major Value, מספר גדול. In this value the final letters count
 *        as hundreds."
 *
 * The five finals continue the hundreds in alphabetical order after ת=400:
 * ך=500, ם=600, ן=700, ף=800, ץ=900.
 */
export const MISPAR_GADOL: LetterValueTable = {
  // Units (1-9)
  'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5,
  'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
  // Tens (10-90)
  'י': 10, 'כ': 20, 'ל': 30, 'מ': 40, 'נ': 50,
  'ס': 60, 'ע': 70, 'פ': 80, 'צ': 90,
  // Hundreds (100-400)
  'ק': 100, 'ר': 200, 'ש': 300, 'ת': 400,
  // Finals as hundreds (500-900)
  'ך': 500, 'ם': 600, 'ן': 700, 'ף': 800, 'ץ': 900,
};

/**
 * MISPAR KATAN (מספר קטן) - Minor/Reduced/Cyclical Value
 *
 * Source: Jewish Encyclopedia (1903), Section E.2, Pages 591-592
 * Quote: "Cyclical or Minor Value, מספר קטן, where the tens, hundreds,
 *        and thousands are reduced to units; e.g., אדם=אמת, i.e.,
 *        (40+4+1) = (400+40+1)."
 */
export const MISPAR_KATAN: LetterValueTable = {
  // All values reduced to 1-9 (drop zeros)
  'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5,
  'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
  'י': 1, 'כ': 2, 'ל': 3, 'מ': 4, 'נ': 5,
  'ס': 6, 'ע': 7, 'פ': 8, 'צ': 9,
  'ק': 1, 'ר': 2, 'ש': 3, 'ת': 4,
  // Finals (same as their base forms)
  'ך': 2, 'ם': 4, 'ן': 5, 'ף': 8, 'ץ': 9,
};

/**
 * MISPAR KOLEL (מספר כולל) - Inclusive Value
 *
 * Source: Jewish Encyclopedia (1903), Section E.3, Page 592
 * Quote: "Inclusive Value, מספר כולל, a development of the quaternion,
 *        where each number includes all the other numbers that precede
 *        it in the order of the alphabet; e.g., ה = (5+4+3+2+1) = 15;
 *        כ = (20+10+9+8+7+6+5+4+3+2+1) = 75."
 *
 * Note: This is the cumulative sum of STANDARD gematria values (count from
 * aleph up to and including each letter). Pardes Rimonim 30:8 prints this
 * SAME cumulative table under the name מספר הקדמי (its table ends
 * אתצ"ה = 1495), so Mispar Kolel and Mispar HaKadmi are one computation
 * under two names — see MISPAR_HAKADMI below.
 */
export const MISPAR_KOLEL: LetterValueTable = {
  'א': 1,    'ב': 3,    'ג': 6,    'ד': 10,   'ה': 15,
  'ו': 21,   'ז': 28,   'ח': 36,   'ט': 45,
  'י': 55,   'כ': 75,   'ל': 105,  'מ': 145,  'נ': 195,
  'ס': 255,  'ע': 325,  'פ': 405,  'צ': 495,
  'ק': 595,  'ר': 795,  'ש': 1095, 'ת': 1495,
  // Finals (same as their base forms)
  'ך': 75, 'ם': 145, 'ן': 195, 'ף': 405, 'ץ': 495,
};

/**
 * MISPAR PERATI (מספר פרטי) - Square Value of Letter
 *
 * Source: Jewish Encyclopedia (1903), Section E.6, Page 592
 * Quote: "Square Value of the Letter, מספר מרובע פרטי;
 *        e.g., דוד = (4² + 6² + 4²) = 68."
 */
export const MISPAR_PERATI: LetterValueTable = {
  // Each value is the square of the standard value
  'א': 1,     'ב': 4,     'ג': 9,     'ד': 16,    'ה': 25,
  'ו': 36,    'ז': 49,    'ח': 64,    'ט': 81,
  'י': 100,   'כ': 400,   'ל': 900,   'מ': 1600,  'נ': 2500,
  'ס': 3600,  'ע': 4900,  'פ': 6400,  'צ': 8100,
  'ק': 10000, 'ר': 40000, 'ש': 90000, 'ת': 160000,
  // Finals (squared from standard values)
  'ך': 400, 'ם': 1600, 'ן': 2500, 'ף': 6400, 'ץ': 8100,
};

/**
 * MISPAR MESHULASH (מספר משולש) - Cube Value of Letter
 *
 * Source: Jewish Encyclopedia (1903), Section E.15, Page 592
 * Quote: "Cube Value of the Letter, מעוקב פרטי
 *        (comp. 'Hayyat,' in 'Minhat Yehudi,' iii.)."
 */
export const MISPAR_MESHULASH: LetterValueTable = {
  // Each value is the cube of the standard value
  'א': 1,        'ב': 8,        'ג': 27,       'ד': 64,       'ה': 125,
  'ו': 216,      'ז': 343,      'ח': 512,      'ט': 729,
  'י': 1000,     'כ': 8000,     'ל': 27000,    'מ': 64000,    'נ': 125000,
  'ס': 216000,   'ע': 343000,   'פ': 512000,   'צ': 729000,
  'ק': 1000000,  'ר': 8000000,  'ש': 27000000, 'ת': 64000000,
  // Finals (cubed from standard values)
  'ך': 8000, 'ם': 64000, 'ן': 125000, 'ף': 512000, 'ץ': 729000,
};

/**
 * MISPAR CHITZON (מספר חיצוני) - External Value
 *
 * Source: Jewish Encyclopedia (1903), Section E.10, Page 592
 * Quote: "External Value, מספר חיצוני, when the contents are disregarded,
 *        every letter counting for 1. The Tetragrammaton can not be
 *        taken in this value."
 */
export const MISPAR_CHITZON: LetterValueTable = {
  // Every letter = 1
  'א': 1, 'ב': 1, 'ג': 1, 'ד': 1, 'ה': 1,
  'ו': 1, 'ז': 1, 'ח': 1, 'ט': 1,
  'י': 1, 'כ': 1, 'ל': 1, 'מ': 1, 'נ': 1,
  'ס': 1, 'ע': 1, 'פ': 1, 'צ': 1,
  'ק': 1, 'ר': 1, 'ש': 1, 'ת': 1,
  'ך': 1, 'ם': 1, 'ן': 1, 'ף': 1, 'ץ': 1,
};

/**
 * MISPAR SIDURI (מספר סידורי) - Ordinal Value
 *
 * Source: Pardes Rimonim (1548), Gate 30, Chapter 8
 * Derivation: IMPLICIT - ordinal positions (1-22) are required as a
 * prerequisite for calculating Mispar HaKadmi, proving the concept
 * was recognized in 1548 even if not named as a separate system.
 */
export const MISPAR_SIDURI: LetterValueTable = {
  // Sequential 1-22 by alphabet position
  'א': 1,  'ב': 2,  'ג': 3,  'ד': 4,  'ה': 5,
  'ו': 6,  'ז': 7,  'ח': 8,  'ט': 9,
  'י': 10, 'כ': 11, 'ל': 12, 'מ': 13, 'נ': 14,
  'ס': 15, 'ע': 16, 'פ': 17, 'צ': 18,
  'ק': 19, 'ר': 20, 'ש': 21, 'ת': 22,
  // Finals (same ordinal as their base forms)
  'ך': 11, 'ם': 13, 'ן': 14, 'ף': 17, 'ץ': 18,
};

/**
 * MISPAR HAKADMI (מספר הקדמי) - Prior Value (cumulative sum of standard values)
 *
 * Source: Pardes Rimonim (1548), Gate 30, Chapter 8
 * Quote: "מספר הקדמי כגון ג׳ עולה ששה כשנמנה מתחלת האלפא ביתא ועד הג׳.
 *        ד׳ עולה י׳ וה׳ עולה ט״ו כשנמנה מראש האלפא ביתא"
 * Translation: "Prior number, for example ג equals six when counted from
 *        the beginning of the alphabet to ג. ד equals 10 and ה equals 15
 *        when counted from the beginning of the alphabet."
 *
 * Each letter's value is the cumulative sum of STANDARD values from aleph up
 * to and including it. Verified on Sefaria: the Pardes table runs cumulatively
 * and ends אבגדה…רשת = אתצ"ה = 1495. This is numerically identical to Mispar
 * Kolel (the Jewish Encyclopedia's "Inclusive Value", מספר כולל) — one
 * computation, two classical names (Pardes: הקדמי; JE: כולל). Aliased to
 * MISPAR_KOLEL so the two tables cannot drift apart.
 *
 * CORRECTION: releases through v2.4.4 shipped a TRIANGULAR table
 * here (T(n)=n(n+1)/2, ending ת=253). That table has no classical source and
 * is NOT what Pardes 30:8 prints. The cited quote (ג=6, ד=10, ה=15) agrees
 * with both the triangular and cumulative tables for the first nine letters,
 * which masked the error; they first diverge at כ (cumulative 75 vs triangular
 * 66). A modern ordinal-triangular method, if wanted, belongs in its own
 * explicitly-modern entry — not under the name הקדמי.
 */
export const MISPAR_HAKADMI: LetterValueTable = MISPAR_KOLEL;

/**
 * MISPAR SHEMI / MILUI (מילוי) - Filling / Name Value
 *
 * Each letter is valued by the STANDARD value of its spelled-out name
 * (e.g. א → אלף = 1+30+80 = 111). The default spelling table is the מ"ה (45)
 * filling of the divine name (ה → הא, ו → ואו), the one Pardes prints.
 * Letter-name spelling is a convention; a caller-supplied override is a
 * future enhancement — this table is the default.
 *
 * Source: Pardes Rimonim (1548), Gate 30, Chapter 8, §ז
 * Anchor: יהוה filled as יוד(20)+הא(6)+ואו(13)+הא(6) = 45 = אדם.
 */
export const MISPAR_SHEMI: LetterValueTable = {
  'א': 111, 'ב': 412, 'ג': 83,  'ד': 434, 'ה': 6,
  'ו': 13,  'ז': 67,  'ח': 418, 'ט': 419,
  'י': 20,  'כ': 100, 'ל': 74,  'מ': 80,  'נ': 106,
  'ס': 120, 'ע': 130, 'פ': 81,  'צ': 104,
  'ק': 186, 'ר': 510, 'ש': 360, 'ת': 406,
  // Finals (same name as their base forms)
  'ך': 100, 'ם': 80, 'ן': 106, 'ף': 81, 'ץ': 104,
};

/**
 * MISPAR HA-MISPARI (מספר המספרי) - Number-Name Value
 *
 * Each letter is replaced by the Hebrew WORD for its standard value and that
 * word's standard value is summed (e.g. י → עשרה = 575; ה → חמשה = 353). The
 * default table is the masculine, defective spellings the source uses. A
 * feminine/plene variant exists but is a modern alternative and is NOT included.
 *
 * Source: Pardes Rimonim (1548), Gate 30, Chapter 8, §ח
 */
export const MISPAR_MISPARI: LetterValueTable = {
  'א': 13,  'ב': 400, 'ג': 635, 'ד': 278, 'ה': 353,
  'ו': 605, 'ז': 377, 'ח': 401, 'ט': 775,
  'י': 575, 'כ': 620, 'ל': 680, 'מ': 323, 'נ': 398,
  'ס': 650, 'ע': 422, 'פ': 446, 'צ': 820,
  'ק': 46,  'ר': 491, 'ש': 1077, 'ת': 720,
  // Finals (same number-name as their base forms)
  'ך': 620, 'ם': 323, 'ן': 398, 'ף': 446, 'ץ': 820,
};

/**
 * System metadata for documentation and API
 */
export const SYSTEMS: Record<string, GematriaSystem> = {
  misparHechrachi: {
    name: 'misparHechrachi',
    hebrewName: 'מספר הכרחי',
    englishName: 'Standard Value',
    description: 'Standard gematria: aleph-tet as units (1-9), yod-tsadi as tens (10-90), qof-tav as hundreds (100-400). Finals same as regular forms.',
    source: {
      text: 'Jewish Encyclopedia (1903)',
      section: 'E.1',
      page: 591,
      url: 'https://www.jewishencyclopedia.com/articles/6571-gematria',
      quote: 'Normal Value, מספר הכרחי, מספר פשוט, counting א—ט as units, י—צ as tens, ק—ת as hundreds. The final letters have here the same values as their respective initial forms.',
    },
    values: MISPAR_HECHRACHI,
  },
  misparGadol: {
    name: 'misparGadol',
    hebrewName: 'מספר גדול',
    englishName: 'Major Value',
    description: 'Same as standard value, but final letters count as hundreds (500-900).',
    source: {
      text: 'Jewish Encyclopedia (1903)',
      section: 'E.11',
      page: 592,
      url: 'https://www.jewishencyclopedia.com/articles/6571-gematria',
      quote: 'Major Value, מספר גדול. In this value the final letters count as hundreds.',
      note: 'The five finals continue the hundreds in order after ת=400: ך=500, ם=600, ן=700, ף=800, ץ=900.',
    },
    values: MISPAR_GADOL,
  },
  misparKatan: {
    name: 'misparKatan',
    hebrewName: 'מספר קטן',
    englishName: 'Minor/Reduced Value',
    description: 'All values reduced to single digits (1-9) by dropping zeros.',
    source: {
      text: 'Jewish Encyclopedia (1903)',
      section: 'E.2',
      page: 591,
      url: 'https://www.jewishencyclopedia.com/articles/6571-gematria',
      quote: 'Cyclical or Minor Value, מספר קטן, where the tens, hundreds, and thousands are reduced to units; e.g., אדם=אמת, i.e., (40+4+1) = (400+40+1).',
    },
    values: MISPAR_KATAN,
  },
  misparKolel: {
    name: 'misparKolel',
    hebrewName: 'מספר כולל',
    englishName: 'Inclusive Value',
    description: 'Each letter value equals the cumulative sum of all standard values from aleph up to and including that letter. Numerically identical to Mispar HaKadmi (Pardes names the same table הקדמי).',
    source: {
      text: 'Jewish Encyclopedia (1903)',
      section: 'E.3',
      page: 592,
      url: 'https://www.jewishencyclopedia.com/articles/6571-gematria',
      quote: 'Inclusive Value, מספר כולל, a development of the quaternion, where each number includes all the other numbers that precede it in the order of the alphabet; e.g., ה = (5+4+3+2+1) = 15; כ = (20+10+9+8+7+6+5+4+3+2+1) = 75.',
      note: 'Pardes Rimonim 30:8 prints this same cumulative table under the name מספר הקדמי (table ending אתצ"ה = 1495). See misparHakadmi.',
    },
    values: MISPAR_KOLEL,
  },
  misparPerati: {
    name: 'misparPerati',
    hebrewName: 'מספר פרטי',
    englishName: 'Square Value of Letter',
    description: 'Each letter\'s standard value is squared.',
    source: {
      text: 'Jewish Encyclopedia (1903)',
      section: 'E.6',
      page: 592,
      url: 'https://www.jewishencyclopedia.com/articles/6571-gematria',
      quote: 'Square Value of the Letter, מספר מרובע פרטי; e.g., דוד = (4² + 6² + 4²) = 68.',
    },
    values: MISPAR_PERATI,
  },
  misparMeshulash: {
    name: 'misparMeshulash',
    hebrewName: 'מעוקב פרטי',
    englishName: 'Cube Value of Letter',
    description: 'Each letter\'s standard value is cubed.',
    source: {
      text: 'Jewish Encyclopedia (1903)',
      section: 'E.15',
      page: 592,
      url: 'https://www.jewishencyclopedia.com/articles/6571-gematria',
      quote: 'Cube Value of the Letter, מעוקב פרטי (comp. "Hayyat," in "Minhat Yehudi," iii.).',
      note: 'The correct Hebrew name for the cube is מעוקב (פרטי) "cubed", per the quote. The export key "misparMeshulash" is retained for backwards compatibility, but משולש ("tripled/triangular") is a misnomer for the cube.',
    },
    values: MISPAR_MESHULASH,
  },
  misparChitzon: {
    name: 'misparChitzon',
    hebrewName: 'מספר חיצוני',
    englishName: 'External Value',
    description: 'Every letter counts as 1, regardless of its position. Essentially counts letters.',
    source: {
      text: 'Jewish Encyclopedia (1903)',
      section: 'E.10',
      page: 592,
      url: 'https://www.jewishencyclopedia.com/articles/6571-gematria',
      quote: 'External Value, מספר חיצוני, when the contents are disregarded, every letter counting for 1. The Tetragrammaton can not be taken in this value.',
    },
    values: MISPAR_CHITZON,
  },
  misparSiduri: {
    name: 'misparSiduri',
    hebrewName: 'מספר סידורי',
    englishName: 'Ordinal Value',
    description: 'Sequential numbering 1-22 based on alphabetical position.',
    source: {
      text: 'Pardes Rimonim (1548)',
      section: 'Gate 30, Chapter 8',
      url: 'https://www.sefaria.org/Pardes_Rimmonim.30.8',
      note: 'Implicit - ordinal positions are prerequisite for Mispar HaKadmi calculation.',
    },
    values: MISPAR_SIDURI,
  },
  misparHakadmi: {
    name: 'misparHakadmi',
    hebrewName: 'מספר הקדמי',
    englishName: 'Prior Value',
    description: 'Each letter valued by the cumulative sum of the standard values of all letters from א up to and including it (ת = 1+2+…+400 = 1495). Numerically identical to Mispar Kolel — Pardes calls it הקדמי, the Jewish Encyclopedia כולל.',
    source: {
      text: 'Pardes Rimonim (1548)',
      section: 'Gate 30, Chapter 8',
      url: 'https://www.sefaria.org/Pardes_Rimmonim.30.8',
      quoteHebrew: 'מספר הקדמי כגון ג׳ עולה ששה כשנמנה מתחלת האלפא ביתא ועד הג׳. ד׳ עולה י׳ וה׳ עולה ט״ו כשנמנה מראש האלפא ביתא',
      translation: 'Prior number: e.g. ג equals six when counted from the beginning of the alphabet up to ג; ד equals 10 and ה equals 15 when counted from the beginning of the alphabet.',
    },
    values: MISPAR_HAKADMI,
  },
  misparShemi: {
    name: 'misparShemi',
    hebrewName: 'מילוי',
    englishName: 'Filling / Name Value',
    description: 'Each letter valued by the standard value of its spelled-out name (default: the מ"ה filling). Letter-name spelling is a convention; overrides are a future enhancement.',
    source: {
      text: 'Pardes Rimonim (1548)',
      section: 'Gate 30, Chapter 8, §ז',
      url: 'https://www.sefaria.org/Pardes_Rimmonim.30.8',
      quoteHebrew: 'מספר שמיי ר"ל לשום על המלה מלוי האותיות... כגון ידוד במלוי אלפין כזה יוד ה"א וא"ו ה"א שעולה מ"ה כמספר אדם',
      translation: 'The name-number means applying to the word the filling of the letters... e.g. YHWH with alef-fillings: יוד ה"א וא"ו ה"א, which totals 45, the value of Adam.',
    },
    values: MISPAR_SHEMI,
  },
  misparMispari: {
    name: 'misparMispari',
    hebrewName: 'מספר המספרי',
    englishName: 'Number-Name Value',
    description: 'Each letter replaced by the Hebrew word for its value, summed (masculine defective spellings). Feminine/plene variant is modern and not included.',
    source: {
      text: 'Pardes Rimonim (1548)',
      section: 'Gate 30, Chapter 8, §ח',
      url: 'https://www.sefaria.org/Pardes_Rimmonim.30.8',
      quoteHebrew: 'ח מספר המספריי ר"ל י\' עשרה, ועשרה עולה תקע"ה. ה\' חמשה, וחמשה עולה שנ"ג',
      translation: 'The number-number: e.g. yod is "ten" (עשרה), and עשרה totals 575; he is "five" (חמשה), and חמשה totals 353.',
    },
    values: MISPAR_MISPARI,
  },
};
