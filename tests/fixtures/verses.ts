/**
 * Test fixtures - sample verse data for unit tests.
 * These don't require actual source packages to be installed.
 */

import type { VerseData } from '../../src/models/types.js';

/**
 * Genesis 1:1 (Hebrew) - בראשית
 */
export const GENESIS_1_1_HEBREW: VerseData = {
  id: 'openscriptures-OHB:Gen.1.1',
  text: 'בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ׃',
  words: [
    {
      position: 1,
      text: 'בְּרֵאשִׁית',
      lemma: 'b/7225',
      morph: 'HR/Ncfsa',
      strong: 'H7225',
      gematria: { standard: 913, ordinal: 76, reduced: 22 },
    },
    {
      position: 2,
      text: 'בָּרָא',
      lemma: '1254 a',
      morph: 'HVqp3ms',
      strong: 'H1254',
      gematria: { standard: 203, ordinal: 23, reduced: 5 },
    },
    {
      position: 3,
      text: 'אֱלֹהִים',
      lemma: '430',
      morph: 'HNcmpa',
      strong: 'H430',
      gematria: { standard: 86, ordinal: 41, reduced: 14 },
    },
    {
      position: 4,
      text: 'אֵת',
      lemma: '853',
      morph: 'HTo',
      strong: 'H853',
      gematria: { standard: 401, ordinal: 23, reduced: 5 },
    },
    {
      position: 5,
      text: 'הַשָּׁמַיִם',
      lemma: 'd/8064',
      morph: 'HTd/Ncmpa',
      strong: 'H8064',
      gematria: { standard: 395, ordinal: 62, reduced: 17 },
    },
    {
      position: 6,
      text: 'וְאֵת',
      lemma: 'c/853',
      morph: 'HC/To',
      strong: 'H853',
      gematria: { standard: 407, ordinal: 29, reduced: 11 },
    },
    {
      position: 7,
      text: 'הָאָרֶץ',
      lemma: 'd/776',
      morph: 'HTd/Ncbsa',
      strong: 'H776',
      gematria: { standard: 296, ordinal: 44, reduced: 17 },
    },
  ],
  gematria: { standard: 2701, ordinal: 298, reduced: 91 },
};

/**
 * Genesis 1:1 (English KJV)
 */
export const GENESIS_1_1_KJV: VerseData = {
  id: 'crosswire-KJV:Gen.1.1',
  text: 'In the beginning God created the heaven and the earth.',
  words: [
    { position: 1, text: 'In', strong: 'H7225' },
    { position: 2, text: 'the', strong: 'H7225' },
    { position: 3, text: 'beginning', strong: 'H7225' },
    { position: 4, text: 'God', strong: 'H430' },
    { position: 5, text: 'created', strong: 'H1254' },
    { position: 6, text: 'the', strong: 'H853' },
    { position: 7, text: 'heaven', strong: 'H8064' },
    { position: 8, text: 'and', strong: 'H853' },
    { position: 9, text: 'the', strong: 'H776' },
    { position: 10, text: 'earth', strong: 'H776' },
  ],
};

/**
 * John 1:1 (Greek)
 */
export const JOHN_1_1_GREEK: VerseData = {
  id: 'byztxt-TR:John.1.1',
  text: 'εν αρχη ην ο λογος και ο λογος ην προς τον θεον και θεος ην ο λογος',
  words: [
    { position: 1, text: 'εν', morph: 'PREP', gematria: { standard: 55, ordinal: 12, reduced: 1 } },
    { position: 2, text: 'αρχη', morph: 'N-DSF', gematria: { standard: 709, ordinal: 34, reduced: 7 } },
    { position: 3, text: 'ην', morph: 'V-IAI-3S', gematria: { standard: 58, ordinal: 16, reduced: 7 } },
    { position: 4, text: 'ο', morph: 'T-NSM', gematria: { standard: 70, ordinal: 15, reduced: 6 } },
    { position: 5, text: 'λογος', morph: 'N-NSM', gematria: { standard: 373, ordinal: 67, reduced: 4 } },
    { position: 6, text: 'και', morph: 'CONJ', gematria: { standard: 31, ordinal: 22, reduced: 4 } },
    { position: 7, text: 'ο', morph: 'T-NSM', gematria: { standard: 70, ordinal: 15, reduced: 6 } },
    { position: 8, text: 'λογος', morph: 'N-NSM', gematria: { standard: 373, ordinal: 67, reduced: 4 } },
    { position: 9, text: 'ην', morph: 'V-IAI-3S', gematria: { standard: 58, ordinal: 16, reduced: 7 } },
    { position: 10, text: 'προς', morph: 'PREP', gematria: { standard: 450, ordinal: 63, reduced: 9 } },
    { position: 11, text: 'τον', morph: 'T-ASM', gematria: { standard: 420, ordinal: 51, reduced: 6 } },
    { position: 12, text: 'θεον', morph: 'N-ASM', gematria: { standard: 134, ordinal: 35, reduced: 8 } },
    { position: 13, text: 'και', morph: 'CONJ', gematria: { standard: 31, ordinal: 22, reduced: 4 } },
    { position: 14, text: 'θεος', morph: 'N-NSM', gematria: { standard: 284, ordinal: 41, reduced: 5 } },
    { position: 15, text: 'ην', morph: 'V-IAI-3S', gematria: { standard: 58, ordinal: 16, reduced: 7 } },
    { position: 16, text: 'ο', morph: 'T-NSM', gematria: { standard: 70, ordinal: 15, reduced: 6 } },
    { position: 17, text: 'λογος', morph: 'N-NSM', gematria: { standard: 373, ordinal: 67, reduced: 4 } },
  ],
  gematria: { standard: 3627, ordinal: 574, reduced: 95 },
};

/**
 * 2 Timothy 4:22 with colophon (Greek)
 */
export const TIMOTHY_4_22_WITH_COLOPHON: VerseData = {
  id: 'byztxt-TR:2Tim.4.22',
  text: 'ο κυριος ιησους χριστος μετα του πνευματος σου η χαρις μεθ υμων αμην προς τιμοθεον δευτερα',
  words: [
    { position: 1, text: 'ο', metadata: {}, gematria: { standard: 70, ordinal: 15, reduced: 6 } },
    { position: 2, text: 'κυριος', metadata: {}, gematria: { standard: 800, ordinal: 97, reduced: 7 } },
    { position: 3, text: 'ιησους', metadata: {}, gematria: { standard: 888, ordinal: 87, reduced: 6 } },
    { position: 4, text: 'χριστος', metadata: {}, gematria: { standard: 1480, ordinal: 112, reduced: 4 } },
    { position: 5, text: 'μετα', metadata: {}, gematria: { standard: 346, ordinal: 40, reduced: 4 } },
    { position: 6, text: 'του', metadata: {}, gematria: { standard: 770, ordinal: 56, reduced: 2 } },
    { position: 7, text: 'πνευματος', metadata: {}, gematria: { standard: 1026, ordinal: 126, reduced: 9 } },
    { position: 8, text: 'σου', metadata: {}, gematria: { standard: 670, ordinal: 56, reduced: 2 } },
    { position: 9, text: 'η', metadata: {}, gematria: { standard: 8, ordinal: 7, reduced: 7 } },
    { position: 10, text: 'χαρις', metadata: {}, gematria: { standard: 911, ordinal: 74, reduced: 2 } },
    { position: 11, text: 'μεθ', metadata: {}, gematria: { standard: 57, ordinal: 30, reduced: 3 } },
    { position: 12, text: 'υμων', metadata: {}, gematria: { standard: 1290, ordinal: 78, reduced: 6 } },
    { position: 13, text: 'αμην', metadata: {}, gematria: { standard: 99, ordinal: 36, reduced: 9 } },
    // Colophon words start here
    { position: 14, text: 'προς', metadata: { colophon: true, colophonType: 'subscription' }, gematria: { standard: 450, ordinal: 63, reduced: 9 } },
    { position: 15, text: 'τιμοθεον', metadata: { colophon: true, colophonType: 'subscription' }, gematria: { standard: 838, ordinal: 100, reduced: 1 } },
    { position: 16, text: 'δευτερα', metadata: { colophon: true, colophonType: 'subscription' }, gematria: { standard: 617, ordinal: 77, reduced: 5 } },
  ],
  gematria: { standard: 8415, ordinal: 814, reduced: 67 }, // Excludes colophon
  metadata: {
    hasColophon: true,
    colophonWordRange: [14, 16],
    colophonType: 'subscription',
  },
};

/**
 * Genesis 1:12 (Hebrew) with textual critical notes
 * This verse contains scholarly annotations comparing Leningrad Codex (L) with BHS.
 * These notes appear as word entries after the Hebrew text but should be filtered out.
 */
export const GENESIS_1_12_WITH_CRITICAL_NOTES: VerseData = {
  id: 'openscriptures-OHB:Gen.1.12',
  text: 'וַתּוֹצֵא הָאָרֶץ דֶּשֶׁא עֵשֶׂב מַזְרִיעַ זֶרַע לְמִינֵהוּ וְעֵץ עֹשֶׂה פְּרִי אֲשֶׁר זַרְעוֹ בוֹ לְמִינֵהוּ וַיַּרְא אֱלֹהִים כִּי טוֹב We read one or more accents in L differently than BHS.',
  words: [
    // Actual Hebrew words (positions 1-18)
    { position: 1, text: 'וַתּוֹצֵא', lemma: 'c/3318', morph: 'HC/Vhw3fs', metadata: {}, gematria: { standard: 503, ordinal: 53, reduced: 26 } },
    { position: 2, text: 'הָאָרֶץ', lemma: 'd/776', morph: 'HTd/Ncbsa', metadata: {}, gematria: { standard: 296, ordinal: 44, reduced: 17 } },
    { position: 3, text: 'דֶּשֶׁא', lemma: '1877', morph: 'HNcmsa', metadata: {}, gematria: { standard: 305, ordinal: 26, reduced: 8 } },
    { position: 4, text: 'עֵשֶׂב', lemma: '6212', morph: 'HNcmsa', metadata: {}, gematria: { standard: 372, ordinal: 39, reduced: 12 } },
    { position: 5, text: 'מַזְרִיעַ', lemma: '2232', morph: 'HVhrmsa', metadata: {}, gematria: { standard: 327, ordinal: 66, reduced: 21 } },
    { position: 6, text: 'זֶרַע', lemma: '2233', morph: 'HNcmsa', metadata: {}, gematria: { standard: 277, ordinal: 43, reduced: 16 } },
    { position: 7, text: 'לְמִינֵהוּ', lemma: 'l/4327', morph: 'HR/Ncmsc/Sp3ms', metadata: {}, gematria: { standard: 141, ordinal: 60, reduced: 24 } },
    { position: 8, text: 'וְעֵץ', lemma: 'c/6086', morph: 'HC/Ncmsa', metadata: {}, gematria: { standard: 166, ordinal: 40, reduced: 22 } },
    { position: 9, text: 'עֹשֶׂה', lemma: '6213 a', morph: 'HVqrmsa', metadata: {}, gematria: { standard: 375, ordinal: 42, reduced: 15 } },
    { position: 10, text: 'פְּרִי', lemma: '6529', morph: 'HNcmsa', metadata: {}, gematria: { standard: 290, ordinal: 47, reduced: 11 } },
    { position: 11, text: 'אֲשֶׁר', lemma: '834 a', morph: 'HTr', metadata: {}, gematria: { standard: 501, ordinal: 42, reduced: 6 } },
    { position: 12, text: 'זַרְעוֹ', lemma: '2233', morph: 'HNcmsc/Sp3ms', metadata: {}, gematria: { standard: 283, ordinal: 49, reduced: 22 } },
    { position: 13, text: 'בוֹ', lemma: 'b', morph: 'HR/Sp3ms', metadata: {}, gematria: { standard: 8, ordinal: 8, reduced: 8 } },
    { position: 14, text: 'לְמִינֵהוּ', lemma: 'l/4327', morph: 'HR/Ncmsc/Sp3ms', metadata: {}, gematria: { standard: 141, ordinal: 60, reduced: 24 } },
    { position: 15, text: 'וַיַּרְא', lemma: 'c/7200', morph: 'HC/Vqw3ms', metadata: {}, gematria: { standard: 217, ordinal: 37, reduced: 10 } },
    { position: 16, text: 'אֱלֹהִים', lemma: '430', morph: 'HNcmpa', metadata: {}, gematria: { standard: 86, ordinal: 41, reduced: 14 } },
    { position: 17, text: 'כִּי', lemma: '3588 a', morph: 'HC', metadata: {}, gematria: { standard: 30, ordinal: 21, reduced: 3 } },
    { position: 18, text: 'טוֹב', lemma: '2896 a', morph: 'HAamsa', metadata: {}, gematria: { standard: 17, ordinal: 17, reduced: 17 } },
    // Textual critical notes (positions 19+) - these should be filtered out
    { position: 19, text: 'We', lemma: null, morph: null, metadata: {}, gematria: { standard: 0, ordinal: 0, reduced: 0 } },
    { position: 20, text: 'read', lemma: null, morph: null, metadata: {}, gematria: { standard: 0, ordinal: 0, reduced: 0 } },
    { position: 21, text: 'one', lemma: null, morph: null, metadata: {}, gematria: { standard: 0, ordinal: 0, reduced: 0 } },
    { position: 22, text: 'or', lemma: null, morph: null, metadata: {}, gematria: { standard: 0, ordinal: 0, reduced: 0 } },
    { position: 23, text: 'more', lemma: null, morph: null, metadata: {}, gematria: { standard: 0, ordinal: 0, reduced: 0 } },
    { position: 24, text: 'accents', lemma: null, morph: null, metadata: {}, gematria: { standard: 0, ordinal: 0, reduced: 0 } },
    { position: 25, text: 'in', lemma: null, morph: null, metadata: {}, gematria: { standard: 0, ordinal: 0, reduced: 0 } },
    { position: 26, text: 'L', lemma: null, morph: null, metadata: {}, gematria: { standard: 0, ordinal: 0, reduced: 0 } },
    { position: 27, text: 'differently', lemma: null, morph: null, metadata: {}, gematria: { standard: 0, ordinal: 0, reduced: 0 } },
    { position: 28, text: 'than', lemma: null, morph: null, metadata: {}, gematria: { standard: 0, ordinal: 0, reduced: 0 } },
    { position: 29, text: 'BHS.', lemma: null, morph: null, metadata: {}, gematria: { standard: 0, ordinal: 0, reduced: 0 } },
  ],
  gematria: { standard: 4335, ordinal: 735, reduced: 276 },
};
