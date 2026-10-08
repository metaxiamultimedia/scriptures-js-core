/**
 * Known-findings regression tests.
 *
 * Each test pins a documented gematria result from the gematriabible.com research
 * writeups, so any change to the engine's computation or letter values that would
 * break a published finding fails loudly in CI. Assertions are deterministic
 * (numeric equalities only) — no interpretive claims live here.
 */
import { describe, it, expect } from 'vitest';
import { computeHebrew } from '../src/gematria/index.js';
import { misparGadol } from '../src/hebrew/gematria/index.js';

describe('known findings (documented gematria results)', () => {
  // Source: "Ancient Cipher Evidence: How Translators Decoded Hidden Messages in
  // the Hebrew Bible" (gematriabible.com blog, 2026-01-30), Part II.
  // The hapax legomenon שֶׂכְוִי ("sekhvi", Job 38:36) — read as "rooster" in
  // Talmudic tradition (b. Rosh Hashanah 26a) — has standard gematria 336
  // (ש300 + כ20 + ו6 + י10 = 336 = 2 × 7 × 24, the hours in a week); with the
  // lamed prefix as it appears in the verse (לַשֶּׂכְוִי) the value is 366.
  //
  // NOTE ON TRANSLATION: the Septuagint does NOT preserve this value — it renders
  // the word as "women weaving" (γυναιξὶν ... ὑφάσματος), a full departure. So
  // this pins only the HEBREW result. Whether early translations ever *preserve*
  // a source-word's gematria is a separate, open research line ("Project Rooster").
  describe('Job 38:36 — sekhvi (the "rooster" hapax)', () => {
    it('שֶׂכְוִי has standard gematria 336', () => {
      expect(computeHebrew('שֶׂכְוִי').standard).toBe(336);
    });

    it('לַשֶּׂכְוִי (with the lamed prefix) has standard gematria 366', () => {
      expect(computeHebrew('לַשֶּׂכְוִי').standard).toBe(366);
    });
  });

  // Source: Jewish Encyclopedia (1903), "Gematria" §E.11, p. 592 — "In this value
  // the final letters count as hundreds." The five finals continue the hundreds
  // after ת=400. Pinned so the published Mispar Gadol table cannot silently drift.
  describe('Mispar Gadol — the five final letters count as hundreds', () => {
    const gadol = (t: string) => misparGadol(t);

    it('each final letter carries its hundreds value', () => {
      expect(gadol('ך')).toBe(500);
      expect(gadol('ם')).toBe(600);
      expect(gadol('ן')).toBe(700);
      expect(gadol('ף')).toBe(800);
      expect(gadol('ץ')).toBe(900);
    });

    it('a word ending in a final letter uses the hundreds value', () => {
      // אלהים: א1 + ל30 + ה5 + י10 + ם600 = 646 (standard 86).
      expect(gadol('אלהים')).toBe(646);
      // מלך: מ40 + ל30 + ך500 = 570 (standard 90).
      expect(gadol('מלך')).toBe(570);
    });
  });
});
