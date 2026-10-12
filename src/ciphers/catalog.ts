/**
 * Unified cipher catalog.
 *
 * `getAllCiphers()` returns detailed, JSON-serializable metadata for EVERY
 * gematria / isopsephy / temurah system across all languages, from one place —
 * mirroring the `getAllSources()` (editions) and `getAllProperNounSources()`
 * (names) accessor convention.
 *
 * It is ENUMERATION-DRIVEN: it iterates the per-language catalogs
 * (`hebrew/gematria` SYSTEMS, `hebrew/temurah` CIPHERS, `gematria/greek` GREEK_SYSTEMS,
 * `gematria/english` ENGLISH_SYSTEMS, `gematria/latin` LATIN_SYSTEMS) rather than
 * holding a hardcoded list, so any system added to those catalogs appears here
 * automatically. The `ciphers.test.ts` suite asserts that every slug registered
 * in the legacy `GematriaMethod` map resolves to a catalog entry, so no English/
 * Latin/Greek system can silently go missing.
 *
 * Entries carry NO compute-function references, so the site's MCP layer can hand
 * them to agents as plain data; compute functions stay in their own modules.
 */

import type { CipherCatalogEntry } from '../models/types.js';
import { SYSTEMS as HEBREW_GEMATRIA_SYSTEMS } from '../hebrew/gematria/systems.js';
import { CIPHERS as HEBREW_TEMURAH_CIPHERS } from '../hebrew/temurah/index.js';
import { GREEK_SYSTEMS, type GreekSystem } from '../gematria/greek.js';
import { STANDARD as GREEK_STANDARD, ORDINAL as GREEK_ORDINAL } from '../greek/isopsephy/systems.js';
import { ENGLISH_SYSTEMS } from '../gematria/english.js';
import { LATIN_SYSTEMS } from '../gematria/latin.js';

/** camelCase → kebab-case ("misparHechrachi" → "mispar-hechrachi"). */
function kebab(s: string): string {
  return s
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase();
}

/** Legacy `GematriaMethod` slugs for the three Hebrew systems the old map registered. */
const HEBREW_LEGACY_ALIASES: Record<string, string[]> = {
  misparHechrachi: ['mispar_hechrachi', 'standard'],
  misparSiduri: ['mispar_siduri', 'ordinal'],
  misparKatan: ['mispar_katan', 'reduced'],
};

/** Normalize a Hebrew `GematriaSystem` into a unified catalog entry. */
function fromHebrewGematria(key: string, sys: (typeof HEBREW_GEMATRIA_SYSTEMS)[string]): CipherCatalogEntry {
  const aliases = [key, ...(HEBREW_LEGACY_ALIASES[sys.name] ?? [])];
  return {
    id: `hebrew-${kebab(sys.name)}`,
    language: 'hebrew',
    kind: 'gematria',
    name: sys.name,
    nativeName: sys.hebrewName,
    englishName: sys.englishName,
    aliases,
    description: sys.description,
    source: sys.source,
    values: sys.values,
  };
}

/** Normalize a Hebrew temurah `CipherSystem` into a unified catalog entry. */
function fromTemurah(key: string, sys: (typeof HEBREW_TEMURAH_CIPHERS)[string]): CipherCatalogEntry {
  return {
    id: `hebrew-${kebab(key)}`,
    language: 'hebrew',
    kind: 'temurah',
    name: sys.name,
    nativeName: sys.hebrewName,
    aliases: [key],
    description: sys.description,
    source: sys.source,
    mapping: sys.mapping,
  };
}

/**
 * Catalog presentation for each Greek isopsephy system, keyed by its
 * `GREEK_SYSTEMS` key. The metadata (name/description/source) is owned by
 * `GREEK_SYSTEMS` in `gematria/greek.ts`; this only supplies the stable catalog
 * id, legacy aliases, and the letter-value table (which lives with the compute
 * tables in `greek/isopsephy/systems.ts`). `reduced` is a computation, so it has
 * no table and is flagged `computed`.
 */
const GREEK_PRESENTATION: Record<
  string,
  { id: string; aliases: string[]; values?: Record<string, number>; computed?: boolean }
> = {
  standard: { id: 'greek-isopsephy', aliases: ['isopsephy', 'standard'], values: GREEK_STANDARD },
  ordinal: { id: 'greek-isopsephy-ordinal', aliases: ['isopsephy_ordinal', 'ordinal'], values: GREEK_ORDINAL },
  reduced: { id: 'greek-isopsephy-reduced', aliases: ['isopsephy_reduced', 'reduced'], computed: true },
};

/** Normalize a Greek `GreekSystem` (from `GREEK_SYSTEMS`) into a unified catalog entry. */
function fromGreek(key: string, sys: GreekSystem): CipherCatalogEntry {
  const pres = GREEK_PRESENTATION[key];
  if (!pres) {
    throw new Error(`No catalog presentation registered for Greek system '${key}' (add it to GREEK_PRESENTATION).`);
  }
  return {
    id: pres.id,
    language: 'greek',
    kind: 'isopsephy',
    name: sys.englishName,
    nativeName: sys.greekName,
    englishName: sys.englishName,
    aliases: [...pres.aliases, key],
    description: sys.description,
    source: sys.source,
    ...(pres.values ? { values: pres.values } : {}),
    ...(pres.computed ? { computed: true } : {}),
  };
}

/** Build the full catalog once, keyed by canonical id. */
function build(): Map<string, CipherCatalogEntry> {
  const catalog = new Map<string, CipherCatalogEntry>();
  const add = (entry: CipherCatalogEntry): void => {
    if (catalog.has(entry.id)) {
      throw new Error(`Duplicate cipher id in catalog: ${entry.id}`);
    }
    catalog.set(entry.id, entry);
  };

  for (const [key, sys] of Object.entries(HEBREW_GEMATRIA_SYSTEMS)) add(fromHebrewGematria(key, sys));
  for (const [key, sys] of Object.entries(HEBREW_TEMURAH_CIPHERS)) add(fromTemurah(key, sys));
  for (const [key, sys] of Object.entries(GREEK_SYSTEMS)) add(fromGreek(key, sys));
  // English / Latin catalogs are already CipherCatalogEntry-shaped.
  for (const entry of Object.values(ENGLISH_SYSTEMS)) add(entry);
  for (const entry of Object.values(LATIN_SYSTEMS)) add(entry);

  return catalog;
}

const CATALOG: Map<string, CipherCatalogEntry> = build();

/** Build an id-and-alias lookup index into the catalog. */
function buildIndex(): Map<string, CipherCatalogEntry> {
  const index = new Map<string, CipherCatalogEntry>();
  for (const entry of CATALOG.values()) {
    index.set(entry.id, entry);
    for (const alias of entry.aliases ?? []) {
      // ids win over aliases; first alias writer wins for ambiguous simple names.
      if (!index.has(alias)) index.set(alias, entry);
    }
  }
  return index;
}

const INDEX: Map<string, CipherCatalogEntry> = buildIndex();

/**
 * Return detailed metadata for every cipher/gematria system across all languages,
 * keyed by canonical id. Returns a defensive copy.
 */
export function getAllCiphers(): Map<string, CipherCatalogEntry> {
  return new Map(CATALOG);
}

/**
 * Look up one cipher by its canonical id or any registered alias
 * (e.g. a legacy slug like `mispar_hechrachi` or a site key).
 */
export function getCipher(idOrAlias: string): CipherCatalogEntry | undefined {
  return INDEX.get(idOrAlias);
}

/** List all canonical cipher ids, sorted. */
export function listCiphers(): string[] {
  return Array.from(CATALOG.keys()).sort();
}

/** Whether a cipher exists for the given id or alias. */
export function hasCipher(idOrAlias: string): boolean {
  return INDEX.has(idOrAlias);
}
