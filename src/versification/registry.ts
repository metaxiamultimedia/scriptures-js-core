/**
 * Versification source registry.
 *
 * Multiple versification sources can register themselves; `mapVerse` routes to
 * whichever registered source covers the requested `from`/`to` scheme pair,
 * preferring the highest `priority`. The existing MT/LXX/English pivot logic is
 * registered (in ./index.ts) as the built-in, lowest-priority source, so a
 * future data-driven source (e.g. TVTMS) can register and override it without
 * touching core.
 *
 * core stays zero-dependency: data flows in via registration, mirroring the
 * `registerSource()` pattern in ../registry.ts.
 */
import type { Scheme } from './schemes.js';
import type { Ref } from './psalms.js';

export interface VersificationSource {
  /** Stable identifier; registering the same id replaces the prior source. */
  id: string;
  /** Schemes this source can map between. */
  systems: Scheme[];
  /** Higher wins when multiple sources cover a pair; built-in = 0 (default 0). */
  priority?: number;
  /** Map a reference from one scheme to another (null if no equivalent). */
  mapRef(book: string, chapter: number, verse: number, from: Scheme, to: Scheme): Ref | null;
  /** Whether the mapping is reliable for this book (defaults to reliable). */
  isReliable?(book: string, from: Scheme, to: Scheme): boolean;
  metadata?: { name?: string; license?: string; source?: string; urls?: string[] };
}

const sources: VersificationSource[] = [];

/** Register a versification source, replacing any existing one with the same id. */
export function registerVersification(s: VersificationSource): void {
  const idx = sources.findIndex((existing) => existing.id === s.id);
  if (idx !== -1) sources.splice(idx, 1);
  sources.push(s);
}

/** Remove a versification source by id. Returns true if one was removed. */
export function unregisterVersification(id: string): boolean {
  const idx = sources.findIndex((existing) => existing.id === id);
  if (idx === -1) return false;
  sources.splice(idx, 1);
  return true;
}

/** Get a copy of all registered versification sources. */
export function getVersificationSources(): VersificationSource[] {
  return sources.slice();
}

/**
 * Resolve the best source for a scheme pair: among sources whose `systems`
 * include BOTH `from` and `to`, return the highest priority. Ties are broken by
 * last-registered-wins.
 */
export function resolveVersificationSource(from: Scheme, to: Scheme): VersificationSource | undefined {
  let best: VersificationSource | undefined;
  let bestPriority = -Infinity;
  for (const s of sources) {
    if (!s.systems.includes(from) || !s.systems.includes(to)) continue;
    const priority = s.priority ?? 0;
    // >= so that, on ties, a later-registered source wins.
    if (priority >= bestPriority) {
      best = s;
      bestPriority = priority;
    }
  }
  return best;
}
