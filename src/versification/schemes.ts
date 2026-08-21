/**
 * Versification scheme identifier.
 *
 * A scheme captures chapter/verse NUMBERING only (not which verses an edition
 * actually contains). Defined here in a tiny standalone module so that both
 * `./index.ts` and `./registry.ts` can import it without a circular dependency.
 */
export type Scheme = 'MT' | 'LXX' | 'English';
