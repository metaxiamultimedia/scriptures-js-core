/**
 * Cross-edition versification mapping.
 *
 * Editions number chapters/verses differently. This module maps a reference
 * between versification SCHEMES so that parallel lookups line up.
 *
 * Built-in coverage (zero-dependency, no data package required):
 *   - MT <-> LXX Psalms: FULLY mapped + empirically verified (see ./psalms).
 *   - Other books MT<->LXX: identity, and only partial — some books have real
 *     MT/LXX offsets not yet encoded (e.g. LXX Gen 31:55 = MT 32:1), so non-Psalms
 *     MT<->LXX is unverified (see isMappingReliable()).
 *
 * MT <-> English (KJV) and anything composing through it (LXX <-> English) are NOT
 * built in. They require a registered versification source — register
 * `@metaxia/scriptures-source-stepbible-versification` (TVTMS), which covers the
 * full MT/LXX/English matrix at verse granularity. Without such a source,
 * `mapVerse()` returns null for those pairs (and isMappingReliable() reports them
 * unreliable) rather than a hand-maintained table that drifts from the data.
 *
 * Structurally-divergent MT<->LXX books (Jeremiah's whole-book reorder, Exodus
 * 35–40, 1 Kings/3 Kingdoms, Joshua, Proverbs, Daniel/Esther additions) are
 * listed in MT_LXX_DIVERGENT_BOOKS: their MT<->LXX mapping returns null (rather
 * than a known-wrong identity), and isMappingReliable() reports them as
 * unreliable. Completing them needs edition-specific verse-mapping data.
 */
import { psalmMtToLxx, psalmLxxToMt, type Ref } from './psalms.js';
import type { Scheme } from './schemes.js';
import { getSource } from '../registry.js';
import {
  registerVersification,
  resolveVersificationSource,
  type VersificationSource,
} from './registry.js';

// `Scheme` lives in ./schemes.ts (to avoid a circular import with ./registry.ts)
// but is re-exported here so the public export path is unchanged.
export type { Scheme };

/**
 * Which versification scheme each registered edition follows.
 *
 * NOTE: a scheme captures chapter/verse NUMBERING only, not which verses an
 * edition actually contains. Several editions share the 'English' (KJV/Protestant)
 * numbering yet have DIFFERENT verse inventories — e.g. the Textus-Receptus
 * editions (crosswire-KJV, byztxt-TR, stepbible-tagnt-tr) carry the disputed
 * verses (Acts 8:37, 1 John 5:7, Mark 16:9-20…), while the critical-text
 * berean-BSB omits ~16 of them. So a verse valid in KJV can be ABSENT in BSB even
 * though both are 'English'. Use `editionHasVerse()` for inventory, and
 * `mapVerseToEdition()` for numbering + inventory together.
 */
export const EDITION_SCHEME: Record<string, Scheme> = {
  // Masoretic (Hebrew / Aramaic)
  'openscriptures-OHB': 'MT',
  'sefaria-targum': 'MT', // Targum follows the Masoretic numbering
  // Septuagint (Greek OT)
  'swete-lxx': 'LXX',
  // English / KJV(Protestant) numbering. Textus-Receptus Greek NT versification
  // matches the KJV; the NT verse-split differences (Phil 1:16/17, Rev 12:18/13:1 …)
  // are critical-text (NA/UBS) vs KJV, not TR, so they don't apply here.
  'crosswire-KJV': 'English',
  'berean-BSB': 'English',
  'RV1909': 'English',
  'byztxt-TR': 'English',
  'stepbible-tagnt-tr': 'English',
  'hf-hmcgovern-olb-greek-stepbible-tagnt-tr': 'English',
};

export function schemeFor(edition: string): Scheme | undefined {
  // Prefer a self-declared scheme from the registered source, so a new edition
  // aligns with ZERO core change. Fall back to the legacy hardcoded map for
  // editions that haven't migrated to declaring `versificationScheme`.
  return getSource(edition)?.versificationScheme ?? EDITION_SCHEME[edition];
}

/**
 * Books whose MT vs LXX structure diverges beyond a simple per-verse offset —
 * whole-book / large-block reorderings and Greek additions. Verified for
 * Jeremiah (Swete numbers it in the reordered LXX order: Swete Jer 26 = the Elam
 * oracle = MT 49:34). We do NOT have a verified verse-level map for these yet, so
 * rather than return a KNOWN-WRONG identity alignment, MT<->LXX mapping returns
 * null for them (getParallelVerses simply omits the unreliable edition). Callers
 * can test this up front with isMappingReliable(). Completing these needs
 * dedicated, edition-specific verse-mapping data.
 */
export const MT_LXX_DIVERGENT_BOOKS = new Set<string>([
  'Jeremiah', 'Exodus', '1 Kings', 'Joshua', 'Proverbs', 'Daniel', 'Esther',
]);

/**
 * Is the verse mapping between two schemes reliable for this book?
 *
 * Routes to the resolved versification source; with only the built-in
 * registered this is byte-identical to the historical behavior.
 */
export function isMappingReliable(book: string, from: Scheme, to: Scheme): boolean {
  if (from === to) return true;
  const src = resolveVersificationSource(from, to);
  return src?.isReliable ? src.isReliable(book, from, to) : src ? true : false;
}

/**
 * Map a reference from one versification scheme to another.
 * Returns null when the source ref has no equivalent in the target scheme
 * (e.g. LXX Psalm 151, which has no Masoretic counterpart).
 */
/** Convert a reference in `from` scheme into the Masoretic pivot. */
function toMt(book: string, chapter: number, verse: number, from: Scheme): Ref | null {
  if (from === 'MT') return { chapter, verse };
  if (from === 'LXX') {
    if (book === 'Psalms') {
      const r = psalmLxxToMt(chapter, verse);
      return r.chapter === 151 ? null : r;
    }
    if (MT_LXX_DIVERGENT_BOOKS.has(book)) return null; // refuse rather than misalign
    return { chapter, verse };
  }
  return null; // English requires a registered versification source (TVTMS)
}

/** Convert a Masoretic reference into the `to` scheme. */
function fromMt(book: string, chapter: number, verse: number, to: Scheme): Ref | null {
  if (to === 'MT') return { chapter, verse };
  if (to === 'LXX') {
    if (book === 'Psalms') return psalmMtToLxx(chapter, verse);
    if (MT_LXX_DIVERGENT_BOOKS.has(book)) return null; // refuse rather than misalign
    return { chapter, verse };
  }
  return null; // English requires a registered versification source (TVTMS)
}

/**
 * Built-in versification source: the MT<->LXX pivot logic (Psalms verified; other
 * books identity where undivergent), wrapped as a registered source. Lowest
 * priority (0) so a data-driven source (TVTMS) overrides it. MT<->English is
 * intentionally NOT covered here — it belongs to a registered data source.
 */
const builtin: VersificationSource = {
  id: 'builtin',
  systems: ['MT', 'LXX'],
  priority: 0,
  mapRef(book, chapter, verse, from, to) {
    if (from === to) return { chapter, verse };
    const mt = toMt(book, chapter, verse, from);
    if (!mt) return null;
    return fromMt(book, mt.chapter, mt.verse, to);
  },
  isReliable(book, from, to) {
    if (from === to) return true;
    const involvesLxx = from === 'LXX' || to === 'LXX';
    const involvesMt = from === 'MT' || to === 'MT';
    if (involvesLxx && involvesMt && MT_LXX_DIVERGENT_BOOKS.has(book)) return false;
    return true;
  },
};
registerVersification(builtin);

/**
 * Map a reference from one versification scheme to another. Routes to the
 * highest-priority registered source that covers the pair. Returns null when the
 * source ref has no equivalent in the target scheme (e.g. LXX Psalm 151), or when
 * no registered source covers the pair — notably any pair involving English,
 * which the built-in does not cover: register a data source (TVTMS) for those.
 */
export function mapVerse(
  book: string,
  chapter: number,
  verse: number,
  from: Scheme,
  to: Scheme
): Ref | null {
  if (from === to) return { chapter, verse };
  const src = resolveVersificationSource(from, to);
  return src ? src.mapRef(book, chapter, verse, from, to) : null;
}

export { psalmMtToLxx, psalmLxxToMt };
// Re-export `Ref` (imported from ./psalms) here.
export type { Ref };

// Versification source registry (mirrors the ScriptureSource registry pattern).
export {
  registerVersification,
  unregisterVersification,
  getVersificationSources,
  resolveVersificationSource,
  type VersificationSource,
} from './registry.js';
