/**
 * Custom error types for the scriptures library.
 */

/**
 * Raised when a scripture edition is not found or not registered.
 */
export class EditionNotFoundError extends Error {
  constructor(edition: string) {
    super(`Edition '${edition}' not found. Install the corresponding data package.`);
    this.name = 'EditionNotFoundError';
  }
}

/**
 * Raised when a book is not found in an edition.
 */
export class BookNotFoundError extends Error {
  constructor(book: string, edition: string) {
    super(`Book '${book}' not found in edition '${edition}'.`);
    this.name = 'BookNotFoundError';
  }
}

/**
 * Raised when a verse is not found.
 */
export class VerseNotFoundError extends Error {
  constructor(book: string, chapter: number, verse: number, edition: string) {
    super(`Verse ${book} ${chapter}:${verse} not found in edition '${edition}'.`);
    this.name = 'VerseNotFoundError';
  }
}

/**
 * Raised when gematria calculation fails.
 */
export class GematriaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GematriaError';
  }
}
