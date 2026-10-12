/**
 * Tests for the newly added, source-attested gematria systems:
 *   misparShemi (מילוי), misparMispari (מספר המספרי),
 *   misparMerubahKlali (S²), imHaKolel (עם הכולל), and the avgad (אבג״ד) cipher.
 *
 * Anti-slop strategy: the per-letter tables (shemi, mispari) are NOT trusted as
 * written. Each entry is RE-DERIVED here from the spelled-out letter/number name
 * by summing its standard value, and the engine's table is asserted to match.
 * A typo in systems.ts fails loudly. Anchors are cross-checked against the
 * independent clean-room spec/oracle (§2.8, §2.11, §3.3, §3.2, §6).
 */
import { describe, it, expect } from 'vitest';
import { hebrew } from '../src/index.js';

const g = hebrew.gematria;
const std = (t: string) => g.misparHechrachi(t);

// Default letter-name spellings (the מ"ה filling), per SPEC §1.4.
const SHEMI_NAMES: Record<string, string> = {
  'א': 'אלף', 'ב': 'בית', 'ג': 'גימל', 'ד': 'דלת', 'ה': 'הא',
  'ו': 'ואו', 'ז': 'זין', 'ח': 'חית', 'ט': 'טית', 'י': 'יוד',
  'כ': 'כף', 'ל': 'למד', 'מ': 'מם', 'נ': 'נון', 'ס': 'סמך',
  'ע': 'עין', 'פ': 'פא', 'צ': 'צדי', 'ק': 'קוף', 'ר': 'ריש',
  'ש': 'שין', 'ת': 'תו',
};

// Masculine, defective number-names, per SPEC §2.11.
const MISPARI_NAMES: Record<string, string> = {
  'א': 'אחד', 'ב': 'שנים', 'ג': 'שלשה', 'ד': 'ארבעה', 'ה': 'חמשה',
  'ו': 'ששה', 'ז': 'שבעה', 'ח': 'שמונה', 'ט': 'תשעה', 'י': 'עשרה',
  'כ': 'עשרים', 'ל': 'שלשים', 'מ': 'ארבעים', 'נ': 'חמשים', 'ס': 'ששים',
  'ע': 'שבעים', 'פ': 'שמונים', 'צ': 'תשעים', 'ק': 'מאה', 'ר': 'מאתים',
  'ש': 'שלש מאות', 'ת': 'ארבע מאות',
};

const FINALS: Record<string, string> = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };

describe('misparShemi / מילוי (letter-name value)', () => {
  it('every letter equals the standard value of its spelled-out name (re-derived)', () => {
    for (const [letter, name] of Object.entries(SHEMI_NAMES)) {
      expect(g.misparShemi(letter)).toBe(std(name));
    }
  });

  it('final forms carry their base letter\'s name value', () => {
    for (const [final, base] of Object.entries(FINALS)) {
      expect(g.misparShemi(final)).toBe(g.misparShemi(base));
    }
  });

  it('oracle anchors (SPEC §2.8): אלף=111, שין=360, תו=406', () => {
    expect(g.misparShemi('א')).toBe(111);
    expect(g.misparShemi('ש')).toBe(360);
    expect(g.misparShemi('ת')).toBe(406);
  });

  it('source anchor (Pardes 30:8 §ז): יהוה filled = 45 = אדם', () => {
    // יוד20 + הא6 + ואו13 + הא6 = 45
    expect(g.misparShemi('יהוה')).toBe(45);
  });
});

describe('misparMispari / מספר המספרי (number-name value)', () => {
  it('every letter equals the standard value of its number-word (re-derived)', () => {
    for (const [letter, name] of Object.entries(MISPARI_NAMES)) {
      expect(g.misparMispari(letter)).toBe(std(name));
    }
  });

  it('final forms carry their base letter\'s number-word value', () => {
    for (const [final, base] of Object.entries(FINALS)) {
      expect(g.misparMispari(final)).toBe(g.misparMispari(base));
    }
  });

  it('source anchors (Pardes 30:8 §ח): י→עשרה=575, ה→חמשה=353', () => {
    expect(g.misparMispari('י')).toBe(575);
    expect(g.misparMispari('ה')).toBe(353);
  });

  it('oracle anchors (SPEC §2.11): ש=1077, ת=720, אדם=614', () => {
    expect(g.misparMispari('ש')).toBe(1077);
    expect(g.misparMispari('ת')).toBe(720);
    expect(g.misparMispari('אדם')).toBe(614); // 13 + 278 + 323
  });
});

describe('misparMerubahKlali / מספר המרובע הכללי (S²)', () => {
  it('equals the standard total squared for any word', () => {
    for (const w of ['דוד', 'שלום', 'בראשית', 'א']) {
      expect(g.misparMerubahKlali(w)).toBe(std(w) ** 2);
    }
  });

  it('source anchor (Pardes 30:8 §ה): דוד = 14² = 196', () => {
    expect(g.misparMerubahKlali('דוד')).toBe(196);
  });

  it('empty input → 0', () => {
    expect(g.misparMerubahKlali('')).toBe(0);
  });
});

describe('imHaKolel / עם הכולל (standard + 1)', () => {
  it('source anchor (Ba\'al HaTurim, Gen 11:1): שפה + 1 = 386 = לשון', () => {
    expect(g.imHaKolel('שפה')).toBe(386);
    expect(g.imHaKolel('שפה')).toBe(std('לשון'));
  });

  it('adds exactly 1 to a non-empty word', () => {
    for (const w of ['דוד', 'שלום']) {
      expect(g.imHaKolel(w)).toBe(std(w) + 1);
    }
  });

  it('empty input → 0, not 1', () => {
    expect(g.imHaKolel('')).toBe(0);
  });
});

describe('avgad / אבג״ד cipher', () => {
  const t = hebrew.temurah;

  it('shifts each letter to the next; ת wraps to א', () => {
    expect(t.avgad('א')).toBe('ב');
    expect(t.avgad('ש')).toBe('ת');
    expect(t.avgad('ת')).toBe('א');
  });

  it('source anchor (mezuzah): יהוה→כוזו, אלהינו→במוכסז', () => {
    expect(t.avgad('יהוה')).toBe('כוזו');
    expect(t.avgad('אלהינו')).toBe('במוכסז');
  });

  it('applying it 22 times is the identity (full alphabet cycle)', () => {
    const alphabet = 'אבגדהוזחטיכלמנסעפצקרשת';
    let x = alphabet;
    for (let i = 0; i < 22; i++) x = t.avgad(x);
    expect(x).toBe(alphabet);
  });

  it('is registered in the cipher list', () => {
    expect(t.listCiphers()).toContain('avgad');
  });
});

describe('atbach / אטב״ח cipher (Sukkah 52b)', () => {
  const t = hebrew.temurah;

  it('source anchor: סהדה → מנונ (R. Hiyya, "sahada" → "manon")', () => {
    expect(t.atbach('סהדה')).toBe('מנונ');
  });

  it('non-leftover pairs have standard values summing to 10 / 100 / 500', () => {
    const pairs: [string, string, number][] = [
      ['א', 'ט', 10], ['ד', 'ו', 10], ['י', 'צ', 100], ['מ', 'ס', 100],
      ['ק', 'ת', 500], ['ר', 'ש', 500],
    ];
    for (const [a, b, sum] of pairs) {
      expect(t.atbach(a)).toBe(b);
      expect(std(a) + std(b)).toBe(sum);
    }
    // leftovers pair with each other (5 + 50 = 55)
    expect(t.atbach('ה')).toBe('נ');
  });

  it('is an involution (applying twice is the identity)', () => {
    const alphabet = 'אבגדהוזחטיכלמנסעפצקרשת';
    expect(t.atbach(t.atbach(alphabet))).toBe(alphabet);
  });
});

describe('achasBeta / אח״ס בט״ע cipher (Shabbat 104a)', () => {
  const t = hebrew.temurah;

  it('rotates through the three groups of seven; ת is fixed', () => {
    expect(t.achasBeta('א')).toBe('ח');
    expect(t.achasBeta('ח')).toBe('ס');
    expect(t.achasBeta('ס')).toBe('א');
    expect(t.achasBeta('ת')).toBe('ת');
  });

  it('applying it 3 times is the identity (three-group cycle)', () => {
    const alphabet = 'אבגדהוזחטיכלמנסעפצקרשת';
    expect(t.achasBeta(t.achasBeta(t.achasBeta(alphabet)))).toBe(alphabet);
  });

  it('both ciphers are registered', () => {
    expect(t.listCiphers()).toContain('atbach');
    expect(t.listCiphers()).toContain('achasBeta');
  });
});

describe('registration', () => {
  it('computeAll includes the new systems', () => {
    const all = g.computeAll('דוד');
    expect(all).toHaveProperty('misparShemi');
    expect(all).toHaveProperty('misparMispari');
    expect(all).toHaveProperty('misparMerubahKlali');
    expect(all).toHaveProperty('imHaKolel');
    expect(all.misparMerubahKlali).toBe(196);
  });

  it('listSystems includes the two new table-based systems', () => {
    const s = g.listSystems();
    expect(s).toContain('misparShemi');
    expect(s).toContain('misparMispari');
  });
});
