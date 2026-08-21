/**
 * Verse query functions.
 */

import type { Verse, VerseData, Word, LexiconEntry, Morphology, GematriaValues } from '../models/types.js';
import { getSource, listEditions as listRegisteredEditions } from '../registry.js';
import { EditionNotFoundError, VerseNotFoundError } from '../errors.js';
import { mapVerse, schemeFor, type Scheme, type Ref } from '../versification/index.js';
import {
  createGematriaProxy,
  createVerseGematriaProxy,
  createVerseGematriaWithColophonsProxy,
  createGetGematriaMethod,
  normalizeLanguage,
  isHebrew,
  isGreek,
  type GematriaLanguage,
} from '../gematria/index.js';

/**
 * Options for verse retrieval.
 */
export interface GetVerseOptions {
  /** Edition to use (e.g., 'crosswire-KJV') */
  edition: string;
}

/**
 * Parse Strong's numbers from various formats.
 */
function parseStrongs(value: string | string[] | undefined, lang?: string): string[] {
  if (!value) return [];

  const pieces = Array.isArray(value) ? value : String(value).split(/\s+/);
  const results: string[] = [];
  const prefix = lang?.toLowerCase().startsWith('hebrew') ? 'H' :
                 lang?.toLowerCase().startsWith('greek') ? 'G' : undefined;

  const strongsRegex = /([HGhg])0*(\d+)/;
  const digitsRegex = /\d{1,5}/;

  for (const piece of pieces) {
    const match = strongsRegex.exec(piece);
    if (match) {
      results.push(`${match[1].toUpperCase()}${parseInt(match[2], 10)}`);
      continue;
    }
    const digitMatch = digitsRegex.exec(piece);
    if (digitMatch && prefix) {
      results.push(`${prefix}${parseInt(digitMatch[0], 10)}`);
    }
  }

  return results;
}

/**
 * Check if a word entry is a textual critical note rather than actual scripture.
 * These notes from the Open Scriptures Hebrew Bible compare manuscript variants
 * and have: lemma explicitly null, morph explicitly null, and no Hebrew/Greek letters.
 *
 * Note: This is different from words that simply don't have lemma/morph fields
 * (like KJV English words which are valid scripture).
 */
function isTextualCriticalNote(w: Word): boolean {
  // Check if lemma and morph are explicitly null (not just missing)
  // Words without these fields (like KJV) are not critical notes
  const hasExplicitNullLemma = 'lemma' in w && w.lemma === null;
  const hasExplicitNullMorph = 'morph' in w && w.morph === null;

  if (!hasExplicitNullLemma || !hasExplicitNullMorph) return false;

  // Must contain no Hebrew or Greek letters (annotations are in other scripts)
  if (isHebrew(w.text) || isGreek(w.text)) return false;

  return true;
}

/**
 * Convert raw verse data to a Verse object.
 */
function dataToVerse(
  data: VerseData,
  book: string,
  chapter: number,
  number: number,
  language?: string
): Verse {
  const normalizedLang = normalizeLanguage(language);
  const words: Word[] = [];

  for (const w of data.words ?? []) {
    if (!w || typeof w !== 'object') continue;

    // Skip textual critical notes (scholarly annotations, not scripture)
    if (isTextualCriticalNote(w)) continue;

    let lexiconEntry: LexiconEntry | undefined;
    let morphology: Morphology | undefined;

    const lemma = w.lemma;
    if (lemma) {
      const lemmaText = Array.isArray(lemma) ? lemma.join(' ') : lemma;
      lexiconEntry = { lemma: lemmaText };
    }

    let strongs = parseStrongs(w.lemma as string | string[] | undefined, language);
    if (strongs.length === 0) {
      strongs = parseStrongs(w.strongs as string | string[] | undefined, language);
    }
    if (strongs.length === 0) {
      strongs = parseStrongs(w.strong, language);
    }

    if (w.morph) {
      const code = w.morph;
      if (code.includes(':')) {
        const [scheme, morphCode] = code.split(':', 2);
        morphology = { code: morphCode, description: scheme };
      } else {
        morphology = { code };
      }
    }

    words.push({
      position: w.position,
      text: w.text,
      lexiconEntry,
      morphology,
      metadata: w.metadata,
      strongs: strongs.length > 0 ? strongs : undefined,
      gematria: createGematriaProxy(w.text, normalizedLang),
      isColophon: w.isColophon || w.metadata?.colophon,
      variant: w.variant,
    });
  }

  return {
    id: data.id,
    book,
    chapter,
    number,
    text: data.text,
    words,
    gematria: createVerseGematriaProxy(words, normalizedLang),
    gematriaWithColophons: data.text ? createVerseGematriaWithColophonsProxy(data.text, normalizedLang) : undefined,
    getGematria: createGetGematriaMethod(words, normalizedLang),
    metadata: data.metadata,
  };
}

/**
 * Get a single verse.
 *
 * @param book - Book name (e.g., 'Genesis', 'Gen')
 * @param chapter - Chapter number
 * @param verse - Verse number
 * @param options - Query options including edition
 * @returns The requested verse
 * @throws EditionNotFoundError if edition is not registered
 * @throws VerseNotFoundError if verse is not found
 */
export async function getVerse(
  book: string,
  chapter: number,
  verse: number,
  options: GetVerseOptions
): Promise<Verse> {
  const { edition } = options;

  const source = getSource(edition);
  if (!source) {
    throw new EditionNotFoundError(edition);
  }

  try {
    const data = await source.loadVerse(book, chapter, verse);
    return dataToVerse(data, book, chapter, verse, source.metadata.language);
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      throw new VerseNotFoundError(book, chapter, verse, edition);
    }
    throw error;
  }
}

/**
 * Does this edition actually CONTAIN the given verse?
 *
 * Verse inventory is edition-specific and not captured by the versification
 * scheme: e.g. crosswire-KJV (Textus Receptus) has Acts 8:37, but berean-BSB
 * (critical text) does not — even though both use 'English' numbering. This is
 * the ground truth, read from the edition's actual data.
 *
 * @returns true if the verse exists in the edition, false if it is absent.
 *          Throws EditionNotFoundError if the edition itself is not registered.
 */
export async function editionHasVerse(
  book: string,
  chapter: number,
  verse: number,
  edition: string
): Promise<boolean> {
  try {
    await getVerse(book, chapter, verse, { edition });
    return true;
  } catch (error) {
    if (error instanceof VerseNotFoundError) return false;
    throw error; // EditionNotFoundError / real failures propagate
  }
}

/**
 * Map a verse reference from one EDITION to another — numbering AND inventory.
 *
 * Unlike `mapVerse` (which maps between versification SCHEMES only), this checks
 * that the target edition actually contains the mapped verse. Returns null when
 * the verse has no counterpart in the target scheme (e.g. LXX Psalm 151) OR when
 * it is simply absent from the target edition (e.g. KJV Acts 8:37 mapped into
 * berean-BSB, which omits it). This is what the site/app should use for
 * cross-edition navigation so it never points at a verse that isn't there.
 *
 * @throws Error if either edition has no known versification scheme.
 */
export async function mapVerseToEdition(
  book: string,
  chapter: number,
  verse: number,
  fromEdition: string,
  toEdition: string
): Promise<Ref | null> {
  const fromScheme = schemeFor(fromEdition);
  const toScheme = schemeFor(toEdition);
  if (!fromScheme) throw new Error(`Unknown versification scheme for edition: ${fromEdition}`);
  if (!toScheme) throw new Error(`Unknown versification scheme for edition: ${toEdition}`);

  const mapped = mapVerse(book, chapter, verse, fromScheme, toScheme);
  if (!mapped) return null; // no counterpart in the target scheme

  const exists = await editionHasVerse(book, mapped.chapter, mapped.verse, toEdition);
  return exists ? mapped : null; // absent from this edition's inventory
}

/**
 * Get all verses in a chapter.
 *
 * @param book - Book name
 * @param chapter - Chapter number
 * @param options - Query options including edition
 * @returns Array of verses in the chapter
 */
export async function getChapter(
  book: string,
  chapter: number,
  options: GetVerseOptions
): Promise<Verse[]> {
  const { edition } = options;

  const source = getSource(edition);
  if (!source) {
    throw new EditionNotFoundError(edition);
  }

  const dataArray = await source.loadChapter(book, chapter);
  return dataArray.map((data, index) =>
    dataToVerse(data, book, chapter, index + 1, source.metadata.language)
  );
}

/**
 * Get verses in a range.
 *
 * @param book - Book name
 * @param chapter - Chapter number
 * @param startVerse - Starting verse number (inclusive)
 * @param endVerse - Ending verse number (inclusive)
 * @param options - Query options including edition
 * @returns Array of verses in the range
 */
export async function getVersesInRange(
  book: string,
  chapter: number,
  startVerse: number,
  endVerse: number,
  options: GetVerseOptions
): Promise<Verse[]> {
  const verses: Verse[] = [];

  for (let num = startVerse; num <= endVerse; num++) {
    try {
      const verse = await getVerse(book, chapter, num, options);
      verses.push(verse);
    } catch (error) {
      if (error instanceof VerseNotFoundError) {
        // Stop if we hit a missing verse
        break;
      }
      throw error;
    }
  }

  return verses;
}

/**
 * Get the aligned verse from all registered editions.
 *
 * The input reference is interpreted in `fromScheme` (default Masoretic) and
 * mapped into each edition's own versification scheme before lookup, so that
 * (e.g.) MT Psalm 23 lines up with LXX Psalm 22. See ../versification.
 *
 * @param book - Book name
 * @param chapter - Chapter number (in `fromScheme`)
 * @param verse - Verse number (in `fromScheme`)
 * @param fromScheme - Versification scheme of the input reference (default 'MT')
 * @returns Map of edition to verse
 */
export async function getParallelVerses(
  book: string,
  chapter: number,
  verse: number,
  fromScheme: Scheme = 'MT'
): Promise<Map<string, Verse>> {
  const results = new Map<string, Verse>();

  for (const edition of listRegisteredEditions()) {
    const toScheme = schemeFor(edition) ?? fromScheme;
    const ref = mapVerse(book, chapter, verse, fromScheme, toScheme);
    if (!ref) continue; // no equivalent verse in this edition's scheme
    try {
      const v = await getVerse(book, ref.chapter, ref.verse, { edition });
      results.set(edition, v);
    } catch {
      // Skip editions that don't have this verse
    }
  }

  return results;
}

/**
 * List available books for an edition.
 *
 * @param edition - Edition name
 * @returns Array of book names
 */
export function listBooks(edition: string): string[] {
  const source = getSource(edition);
  if (!source) {
    throw new EditionNotFoundError(edition);
  }
  return source.listBooks();
}

/**
 * Get the per-book, per-chapter verse-count inventory for an edition.
 *
 * Returns `{ book: [ch1Count, ch2Count, ...] }`. This is each edition's OWN
 * versification inventory — e.g. the OHB/WLC Hebrew edition reports the
 * Westminster-Leningrad counts (superscriptions as v1, the Decalogue split,
 * Josh 21:36-37, etc.), NOT a KJV/traditional-Masoretic tally. Consumers that
 * validate shipped data (verse-count CI gates) or render inventory stats should
 * derive counts from HERE rather than hardcoding a per-scheme table — the engine
 * is the single source of truth for versification.
 *
 * Chapters are enumerated from 1 upward until a chapter is empty or missing
 * (scripture editions number chapters contiguously from 1).
 *
 * @param edition - Edition identifier (e.g. "openscriptures-OHB", "byztxt-TR")
 * @returns Map of book name to an array of per-chapter verse counts
 * @throws EditionNotFoundError if the edition is not registered
 */
export async function getVerseCounts(edition: string): Promise<Record<string, number[]>> {
  const source = getSource(edition);
  if (!source) {
    throw new EditionNotFoundError(edition);
  }
  const inventory: Record<string, number[]> = {};
  for (const book of source.listBooks()) {
    const counts: number[] = [];
    for (let chapter = 1; ; chapter++) {
      let verses;
      try {
        verses = await source.loadChapter(book, chapter);
      } catch {
        break; // missing chapter -> end of book
      }
      if (!verses || verses.length === 0) {
        break; // empty chapter -> end of book
      }
      counts.push(verses.length);
    }
    inventory[book] = counts;
  }
  return inventory;
}

/**
 * Total verse count for an edition (sum of {@link getVerseCounts}).
 *
 * e.g. the OHB Hebrew edition totals 23,213 (WLC/BHS); a TR Greek NT totals 7,957.
 *
 * @param edition - Edition identifier
 * @returns Total number of verses across all books/chapters
 * @throws EditionNotFoundError if the edition is not registered
 */
export async function getVerseTotal(edition: string): Promise<number> {
  const inventory = await getVerseCounts(edition);
  let total = 0;
  for (const counts of Object.values(inventory)) {
    for (const n of counts) total += n;
  }
  return total;
}

/**
 * List all registered editions.
 */
export function listEditions(): string[] {
  return listRegisteredEditions();
}
