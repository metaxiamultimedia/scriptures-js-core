/**
 * Search types for scripture content.
 *
 * `searchByGematriaPhrase` is implemented below; the remaining result/option
 * interfaces are exported for consumers building their own search.
 */

import { computeValue, normalizeLanguage } from '../gematria/index.js';
import { getSource, listEditions } from '../registry.js';
import { getChapter, getVerseCounts } from './verse.js';
import type { Word } from '../models/types.js';

/**
 * Search result for text search.
 */
export interface TextSearchResult {
  edition: string;
  book: string;
  chapter: number;
  verse: number;
}

/**
 * Search result for morphology search.
 */
export interface MorphologySearchResult {
  edition: string;
  book: string;
  chapter: number;
  verse: number;
  position: number;
  text?: string;
}

/**
 * Search result for Strong's number search.
 */
export interface StrongsSearchResult {
  edition: string;
  book: string;
  chapter: number;
  verse: number;
  position: number;
  text: string;
}

/**
 * Search result for gematria search.
 */
export interface GematriaSearchResult {
  edition: string;
  book: string;
  chapter: number;
  verse: number;
}

/**
 * Options for text search.
 */
export interface TextSearchOptions {
  /** Edition to search (default: all editions) */
  edition?: string;
  /** Include colophons in search (default: false) */
  includeColophons?: boolean;
  /** Case-insensitive search (default: true) */
  ignoreCase?: boolean;
}

/**
 * Options for morphology search.
 */
export interface MorphologySearchOptions {
  /** Edition to search (default: all editions) */
  edition?: string;
  /** Use wildcard matching (default: false) */
  wildcard?: boolean;
  /** Include colophons in search (default: false) */
  includeColophons?: boolean;
  /** Return only verse references, not word details */
  versesOnly?: boolean;
}

/**
 * Options for Strong's number search.
 */
export interface StrongsSearchOptions {
  /** Edition to search (default: all editions) */
  edition?: string;
  /** Include colophons in search (default: false) */
  includeColophons?: boolean;
}

/**
 * Options for gematria sequence search.
 */
export interface GematriaSearchOptions {
  /** Edition to search (default: all editions) */
  edition?: string;
  /** Gematria system to use (default: 'standard') */
  system?: string;
  /** Ignore word boundaries (default: true) */
  ignoreWords?: boolean;
  /** Use cached data (default: true) */
  useCache?: boolean;
  /** Include colophons in search (default: false) */
  includeColophons?: boolean;
}

// ---------------------------------------------------------------------------
// Phrase (contiguous-word-run) gematria search
// ---------------------------------------------------------------------------

/** Where a contiguous run of words is allowed to extend. */
export type PhraseBoundary = 'verse' | 'passage';

/** Options for {@link searchByGematriaPhrase}. */
export interface GematriaPhraseSearchOptions {
  /** Target gematria value to match. */
  target: number;
  /** Edition to search (default: every registered edition). */
  edition?: string;
  /** Gematria system/method slug (default: 'standard'). */
  system?: string;
  /** Minimum words in a run (default: 2). */
  minWords?: number;
  /** Maximum words in a run (default: 5). Hard-capped at {@link PHRASE_MAX_WORDS_CAP}. */
  maxWords?: number;
  /**
   * `'verse'` keeps a run inside a single verse; `'passage'` lets it continue
   * across verse/chapter boundaries, stopping at book edges. Default `'verse'`.
   */
  boundary?: PhraseBoundary;
  /** Include colophon words (default: false). */
  includeColophons?: boolean;
}

/** A contiguous run of words whose gematria equals the target. */
export interface GematriaPhraseSearchResult {
  edition: string;
  book: string;
  /** Chapter of the run's first word. */
  chapter: number;
  /** Verse number of the run's first word. */
  verse: number;
  /** 0-based index of the first word within its verse. */
  position: number;
  /** Number of words in the run. */
  length: number;
  /** Gematria system used. */
  system: string;
  /** The matched value (equals `target`). */
  value: number;
  /** The matched words joined by spaces. */
  text: string;
  /** True when the run spans more than one verse (only possible for 'passage'). */
  crossesVerse: boolean;
}

/** Upper bound on run length regardless of requested `maxWords`. */
export const PHRASE_MAX_WORDS_CAP = 7;

/** One scored word in the scan stream. */
interface ScoredWord {
  chapter: number;
  verse: number;
  position: number;
  text: string;
  value: number;
  verseKey: string;
}

/** Build the per-word scored stream for a book, in canonical order. */
async function scoreBook(
  edition: string,
  book: string,
  system: string,
  language: string,
  includeColophons: boolean,
): Promise<ScoredWord[]> {
  const counts = await getVerseCounts(edition);
  const chapterVerseCounts = counts[book];
  if (!chapterVerseCounts) return [];

  const stream: ScoredWord[] = [];
  for (let chapter = 1; chapter <= chapterVerseCounts.length; chapter++) {
    let verses;
    try {
      verses = await getChapter(book, chapter, { edition });
    } catch {
      continue;
    }
    for (const v of verses) {
      const words: Word[] = v.words ?? [];
      for (const w of words) {
        if (!includeColophons && w.isColophon) continue;
        const value = computeValue(w.text, system, normalizeLanguage(language));
        // A zero contribution means the token carries no letters in this system
        // (punctuation, critical notes): it is not part of any phrase.
        if (!value) continue;
        stream.push({
          chapter: v.chapter,
          verse: v.number,
          position: w.position,
          text: w.text,
          value,
          verseKey: `${v.chapter}:${v.number}`,
        });
      }
    }
  }
  return stream;
}

/** Slide a window over a scored stream, emitting runs that hit the target. */
function scanStream(
  stream: ScoredWord[],
  edition: string,
  book: string,
  system: string,
  target: number,
  minWords: number,
  maxWords: number,
  out: GematriaPhraseSearchResult[],
): void {
  for (let i = 0; i < stream.length; i++) {
    let sum = 0;
    const limit = Math.min(maxWords, stream.length - i);
    for (let len = 1; len <= limit; len++) {
      const w = stream[i + len - 1];
      sum += w.value;
      if (sum > target && target >= 0) break; // values are non-negative; no shorter match ahead
      if (len < minWords) continue;
      if (sum === target) {
        const run = stream.slice(i, i + len);
        const first = run[0];
        out.push({
          edition,
          book,
          chapter: first.chapter,
          verse: first.verse,
          position: first.position,
          length: len,
          system,
          value: target,
          text: run.map((r) => r.text).join(' '),
          crossesVerse: run[0].verseKey !== run[run.length - 1].verseKey,
        });
      }
    }
  }
}

/**
 * Find every contiguous run of words whose gematria equals `target`.
 *
 * On-the-fly scan over the registry — the authoritative reference for the
 * precomputed phrase index served by downstream apps. For `boundary: 'verse'`
 * each verse is scanned independently; for `'passage'` the whole book is
 * scanned as one stream (runs may cross verse/chapter boundaries, never book
 * boundaries).
 */
export async function searchByGematriaPhrase(
  options: GematriaPhraseSearchOptions,
): Promise<GematriaPhraseSearchResult[]> {
  const {
    target,
    edition,
    system = 'standard',
    boundary = 'verse',
    includeColophons = false,
  } = options;

  const minWords = Math.max(1, options.minWords ?? 2);
  const maxWords = Math.min(options.maxWords ?? 5, PHRASE_MAX_WORDS_CAP);
  if (maxWords < minWords) return [];

  const editions = edition ? [edition] : listEditions();
  const results: GematriaPhraseSearchResult[] = [];

  for (const ed of editions) {
    const source = getSource(ed);
    if (!source) continue;
    const language = source.metadata.language ?? 'auto';

    for (const book of source.listBooks()) {
      const stream = await scoreBook(ed, book, system, language, includeColophons);
      if (boundary === 'passage') {
        scanStream(stream, ed, book, system, target, minWords, maxWords, results);
      } else {
        // Scan each verse independently.
        let start = 0;
        for (let i = 1; i <= stream.length; i++) {
          if (i === stream.length || stream[i].verseKey !== stream[start].verseKey) {
            scanStream(stream.slice(start, i), ed, book, system, target, minWords, maxWords, results);
            start = i;
          }
        }
      }
    }
  }

  return results;
}
