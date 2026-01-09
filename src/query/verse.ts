/**
 * Verse query functions.
 */

import type { Verse, VerseData, Word, LexiconEntry, Morphology } from '../models/types.js';
import { getSource, listEditions as listRegisteredEditions } from '../registry.js';
import { EditionNotFoundError, VerseNotFoundError } from '../errors.js';

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
 * and have: no lemma, no morphology, and 0 gematria value.
 */
function isTextualCriticalNote(w: Word): boolean {
  // Must have no lemma and no morphology
  if (w.lemma || w.morph) return false;

  // Must have 0 standard gematria (non-Hebrew/Greek text)
  const gematria = w.gematria;
  if (!gematria || gematria.standard !== 0) return false;

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
      gematria: w.gematria,
    });
  }

  return {
    id: data.id,
    book,
    chapter,
    number,
    text: data.text,
    words,
    gematria: data.gematria,
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
 * Get the same verse from all registered editions.
 *
 * @param book - Book name
 * @param chapter - Chapter number
 * @param verse - Verse number
 * @returns Map of edition to verse
 */
export async function getParallelVerses(
  book: string,
  chapter: number,
  verse: number
): Promise<Map<string, Verse>> {
  const results = new Map<string, Verse>();

  for (const edition of listRegisteredEditions()) {
    try {
      const v = await getVerse(book, chapter, verse, { edition });
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
 * List all registered editions.
 */
export function listEditions(): string[] {
  return listRegisteredEditions();
}
