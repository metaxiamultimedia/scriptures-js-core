/**
 * Tests for Hebrew gematria and temurah systems.
 *
 * Tests verify implementations against explicit examples from primary sources:
 * - Jewish Encyclopedia (1906), "Gematria" article
 * - Pardes Rimonim (1548), Gate 30
 * - Biblical usage (Jeremiah 25:26, 51:1)
 */

import { describe, it, expect } from 'vitest';
import { hebrew } from '../src/index.js';

describe('hebrew.gematria', () => {
  describe('source-cited examples', () => {
    /**
     * Jewish Encyclopedia (1906), Section E.3, Page 592:
     * "Inclusive Value, מספר כולל... e.g., ה = (5+4+3+2+1) = 15;
     *  כ = (20+10+9+8+7+6+5+4+3+2+1) = 75."
     */
    it('misparKolel: JE example ה = 15', () => {
      expect(hebrew.gematria.misparKolel('ה')).toBe(15);
    });

    it('misparKolel: JE example כ = 75', () => {
      expect(hebrew.gematria.misparKolel('כ')).toBe(75);
    });

    /**
     * Jewish Encyclopedia (1906), Section E.6, Page 592:
     * "Square Value of the Letter, מספר מרובע פרטי;
     *  e.g., דוד = (4² + 6² + 4²) = 68."
     */
    it('misparPerati: JE example דוד = 68', () => {
      expect(hebrew.gematria.misparPerati('דוד')).toBe(68);
    });

    /**
     * Pardes Rimonim (1548), Gate 30, Chapter 8:
     * "מספר הקדמי כגון ג׳ עולה ששה... ד׳ עולה י׳ וה׳ עולה ט״ו"
     * Translation: "ג = 6, ד = 10, ה = 15"
     */
    it('misparHakadmi: Pardes example ג = 6', () => {
      expect(hebrew.gematria.misparHakadmi('ג')).toBe(6);
    });

    it('misparHakadmi: Pardes example ד = 10', () => {
      expect(hebrew.gematria.misparHakadmi('ד')).toBe(10);
    });

    it('misparHakadmi: Pardes example ה = 15', () => {
      expect(hebrew.gematria.misparHakadmi('ה')).toBe(15);
    });
  });

  describe('basic sanity checks', () => {
    it('misparHechrachi: בראשית = 913 (well-known value)', () => {
      // ב(2) + ר(200) + א(1) + ש(300) + י(10) + ת(400) = 913
      expect(hebrew.gematria.misparHechrachi('בראשית')).toBe(913);
    });

    it('misparHechrachi: אלהים = 86 (well-known value)', () => {
      // א(1) + ל(30) + ה(5) + י(10) + ם(40) = 86
      expect(hebrew.gematria.misparHechrachi('אלהים')).toBe(86);
    });

    it('misparChitzon: counts letters (every letter = 1)', () => {
      expect(hebrew.gematria.misparChitzon('שלום')).toBe(4);
      expect(hebrew.gematria.misparChitzon('בראשית')).toBe(6);
    });

    it('misparSiduri: ordinal positions 1-22', () => {
      expect(hebrew.gematria.misparSiduri('א')).toBe(1);
      expect(hebrew.gematria.misparSiduri('ת')).toBe(22);
      // אבג = 1 + 2 + 3 = 6
      expect(hebrew.gematria.misparSiduri('אבג')).toBe(6);
    });
  });

  describe('musafi modifier', () => {
    /**
     * Jewish Encyclopedia (1906), Section E.4:
     * "Additory Value... when the external number of words or of letters is added"
     */
    it('adds letter count with musafi: letters', () => {
      // שלום = 376, + 4 letters = 380
      const base = hebrew.gematria.misparHechrachi('שלום');
      const withMusafi = hebrew.gematria.misparHechrachi('שלום', { musafi: 'letters' });
      expect(withMusafi).toBe(base + 4);
    });

    it('adds word count with musafi: words', () => {
      // שלום עולם = 376 + 146 = 522 (total), + 2 words = 524
      // Actually: שלום(376) + עולם(146) = 522? Let me verify
      // ע(70) + ו(6) + ל(30) + ם(40) = 146
      const withMusafi = hebrew.gematria.misparHechrachi('שלום עולם', { musafi: 'words' });
      const withoutMusafi = hebrew.gematria.misparHechrachi('שלום עולם');
      expect(withMusafi).toBe(withoutMusafi + 2);
    });
  });

  describe('helper functions', () => {
    it('computeAll returns all 9 systems', () => {
      const all = hebrew.gematria.computeAll('א');
      expect(all).toHaveProperty('misparHechrachi');
      expect(all).toHaveProperty('misparGadol');
      expect(all).toHaveProperty('misparKatan');
      expect(all).toHaveProperty('misparKolel');
      expect(all).toHaveProperty('misparPerati');
      expect(all).toHaveProperty('misparMeshulash');
      expect(all).toHaveProperty('misparChitzon');
      expect(all).toHaveProperty('misparSiduri');
      expect(all).toHaveProperty('misparHakadmi');
    });

    it('listSystems returns 9 system names', () => {
      const systems = hebrew.gematria.listSystems();
      expect(systems).toHaveLength(9);
      expect(systems).toContain('misparHechrachi');
    });

    it('getSystem returns metadata with source citation', () => {
      const system = hebrew.gematria.getSystem('misparHechrachi');
      expect(system).toBeDefined();
      expect(system?.hebrewName).toBe('מספר הכרחי');
      expect(system?.source.text).toContain('Jewish Encyclopedia');
    });
  });
});

describe('hebrew.temurah', () => {
  describe('source-cited examples', () => {
    /**
     * Biblical example: Jeremiah 25:26
     * בבל (Babel) encoded as ששך (Sheshakh) using Atbash
     * Note: Output is ששכ (standard kaf), biblical text uses final form ששך
     */
    it('atbash: בבל → ששכ (Babel → Sheshakh, Jer 25:26)', () => {
      expect(hebrew.temurah.atbash('בבל')).toBe('ששכ');
    });

    /**
     * Biblical example: Jeremiah 51:1
     * כשדים (Kasdim/Chaldeans) encoded as לב קמי (Lev Kamai)
     */
    it('atbash: כשדים → לבקמי (Kasdim → Lev Kamai, Jer 51:1)', () => {
      expect(hebrew.temurah.atbash('כשדים')).toBe('לבקמי');
    });

    /**
     * Pardes Rimonim (1548), Gate 30, Chapter 5:
     * "אל במ גנ דס הע וף זץ חק טר יש כת"
     * These are the 11 letter pairs for Albam
     */
    it('albam: א ↔ ל (first Pardes pair)', () => {
      expect(hebrew.temurah.albam('א')).toBe('ל');
      expect(hebrew.temurah.albam('ל')).toBe('א');
    });

    it('albam: ב ↔ מ (second Pardes pair)', () => {
      expect(hebrew.temurah.albam('ב')).toBe('מ');
      expect(hebrew.temurah.albam('מ')).toBe('ב');
    });

    it('albam: כ ↔ ת (eleventh Pardes pair)', () => {
      expect(hebrew.temurah.albam('כ')).toBe('ת');
      expect(hebrew.temurah.albam('ת')).toBe('כ');
    });
  });

  describe('cipher properties', () => {
    it('atbash is symmetric (double application returns original)', () => {
      const original = 'אבגד';
      const encoded = hebrew.temurah.atbash(original);
      const decoded = hebrew.temurah.atbash(encoded);
      expect(decoded).toBe(original);
    });

    it('atbash normalizes final letters to standard forms', () => {
      // Cipher operates on 22-letter alphabet; finals normalize to standard
      const withFinal = hebrew.temurah.atbash('שלום');
      const doubleCoded = hebrew.temurah.atbash(withFinal);
      expect(doubleCoded).toBe('שלומ');
    });

    it('albam is symmetric (double application returns original)', () => {
      const original = 'אבגד';
      const encoded = hebrew.temurah.albam(original);
      const decoded = hebrew.temurah.albam(encoded);
      expect(decoded).toBe(original);
    });

    it('atbash maps first letter to last (א ↔ ת)', () => {
      expect(hebrew.temurah.atbash('א')).toBe('ת');
      expect(hebrew.temurah.atbash('ת')).toBe('א');
    });

    it('atbash maps second letter to second-to-last (ב ↔ ש)', () => {
      expect(hebrew.temurah.atbash('ב')).toBe('ש');
      expect(hebrew.temurah.atbash('ש')).toBe('ב');
    });
  });

  describe('helper functions', () => {
    it('listCiphers returns available cipher names', () => {
      const ciphers = hebrew.temurah.listCiphers();
      expect(ciphers).toContain('atbash');
      expect(ciphers).toContain('albam');
    });

    it('getCipher returns metadata with source citation', () => {
      const cipher = hebrew.temurah.getCipher('atbash');
      expect(cipher).toBeDefined();
      expect(cipher?.hebrewName).toBe('אתב״ש');
    });
  });
});
