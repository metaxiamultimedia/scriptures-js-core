# @metaxia/scriptures-core

The foundational engine for the Scriptures JS ecosystem. Provides a unified API for querying scripture texts, computing gematria, parsing morphology, and working with lexicon data.

## v3.0.0 Breaking Changes

- **New `hebrew` namespace**: Gematria and temurah (letter ciphers) are now under `hebrew.gematria.*` and `hebrew.temurah.*`
- **9 gematria systems**: All derived from primary historical sources with full citations
- **2 temurah ciphers**: Atbash and Albam with source documentation
- **Musafi modifier**: Phrase-level modifier as documented in JE (1906)
- **No more shorthand names**: Use proper Hebrew names (`misparHechrachi` not `standard`)

## Installation

```bash
npm install @metaxia/scriptures-core
```

You'll also need at least one data source package:

```bash
npm install @metaxia/scriptures-source-byztxt-tr      # Greek NT (Byzantine)
npm install @metaxia/scriptures-source-openscriptures-ohb  # Hebrew OT
```

## Quick Start

```typescript
// Import a data source to auto-register it
import '@metaxia/scriptures-source-openscriptures-ohb';

import { hebrew, getVerse, listEditions } from '@metaxia/scriptures-core';

// List available editions
console.log(listEditions()); // ['openscriptures-OHB']

// Get a verse
const verse = await getVerse('Genesis', 1, 1, { edition: 'openscriptures-OHB' });
console.log(verse.text);

// Compute gematria using Hebrew system names
console.log(hebrew.gematria.misparHechrachi('בראשית')); // 913
console.log(hebrew.gematria.misparKatan('בראשית'));     // 22
console.log(hebrew.gematria.misparGadol('בראשית'));     // 913

// Apply temurah (letter cipher)
console.log(hebrew.temurah.atbash('בבל')); // 'ששכ' (Babel -> Sheshakh)
```

## API Reference

### Verse Queries

#### `getVerse(book, chapter, verse, options)`

Retrieve a single verse.

```typescript
import { getVerse } from '@metaxia/scriptures-core';

const verse = await getVerse('Genesis', 1, 1, { edition: 'openscriptures-OHB' });

// Verse structure:
// {
//   id: 'openscriptures-OHB:Genesis.1.1',
//   book: 'Genesis',
//   chapter: 1,
//   number: 1,
//   text: 'בְּרֵאשִׁ֖ית בָּרָ֣א אֱלֹהִ֑ים ...',  // includes cantillation marks
//   words: [...],
//   gematria: { ... },      // computed on-demand, excludes colophon words
//   gematriaWithColophons: { ... },  // computed on-demand, includes all words
// }
```

#### `getChapter(book, chapter, options)`

Retrieve all verses in a chapter.

```typescript
import { getChapter } from '@metaxia/scriptures-core';

const verses = await getChapter('John', 1, { edition: 'byztxt-TR' });
console.log(verses.length); // 51
```

#### `getVersesInRange(book, chapter, start, end, options)`

Retrieve a range of verses.

```typescript
import { getVersesInRange } from '@metaxia/scriptures-core';

const verses = await getVersesInRange('Psalms', 23, 1, 6, { edition: 'openscriptures-OHB' });
```

#### `getParallelVerses(book, chapter, verse)`

Get the same verse from all registered editions.

```typescript
import { getParallelVerses } from '@metaxia/scriptures-core';

const parallels = await getParallelVerses('John', 1, 1);
// Map { 'byztxt-TR' => Verse, 'another-edition' => Verse }
```

#### `listBooks(edition)`

List available books for an edition.

```typescript
import { listBooks } from '@metaxia/scriptures-core';

const books = listBooks('byztxt-TR');
// ['Matthew', 'Mark', 'Luke', 'John', ...]
```

### Hebrew Gematria

Nine letter-value systems derived from primary historical sources.

```typescript
import { hebrew } from '@metaxia/scriptures-core';

// Basic usage
hebrew.gematria.misparHechrachi('שלום')  // 376 - standard value
hebrew.gematria.misparGadol('שלום')      // 376 - major value (finals as 500-900)
hebrew.gematria.misparKatan('שלום')      // 16  - reduced value (1-9)

// With musafi modifier (adds letter or word count)
hebrew.gematria.misparHechrachi('שלום', { musafi: 'letters' })  // 380 (376 + 4)
hebrew.gematria.misparHechrachi('שלום עולם', { musafi: 'words' }) // 782 (780 + 2)

// Compute all systems at once
hebrew.gematria.computeAll('שלום')
// { misparHechrachi: 376, misparGadol: 376, misparKatan: 16, ... }

// Get system metadata with source citation
hebrew.gematria.getSystem('misparHechrachi')
// { name: 'misparHechrachi', hebrewName: 'מספר הכרחי', source: { ... }, ... }
```

#### Available Systems

| Method | Hebrew Name | Source | Description |
|--------|-------------|--------|-------------|
| `misparHechrachi` | מספר הכרחי | JE §E.1 | Standard: א-ט=1-9, י-צ=10-90, ק-ת=100-400 |
| `misparGadol` | מספר גדול | JE §E.11 | Major: finals as 500-900 |
| `misparKatan` | מספר קטן | JE §E.2 | Reduced: all values 1-9 |
| `misparKolel` | מספר כולל | JE §E.3 | Inclusive: cumulative sums |
| `misparPerati` | מספר פרטי | JE §E.6 | Squared: each letter² |
| `misparMeshulash` | מספר משולש | JE §E.15 | Cubed: each letter³ |
| `misparChitzon` | מספר חיצוני | JE §E.10 | External: every letter = 1 |
| `misparSiduri` | מספר סידורי | Pardes | Ordinal: position 1-22 |
| `misparHakadmi` | מספר הקדמי | Pardes | Prior: triangular numbers |

### Hebrew Temurah (Letter Ciphers)

Two letter substitution ciphers. These transform letters, not compute values.

```typescript
import { hebrew } from '@metaxia/scriptures-core';

// Atbash - mirror positions (first↔last)
hebrew.temurah.atbash('בבל')     // 'ששכ' (Babel -> Sheshakh, Jer 25:26)
hebrew.temurah.atbash('כשדים')   // 'לבקמי' (Kasdim -> Lev Kamai, Jer 51:1)

// Albam - half-alphabet swap (position n ↔ n+11)
hebrew.temurah.albam('אלהים')    // 'למהיב'

// Both ciphers are symmetric (applying twice returns original)
hebrew.temurah.atbash(hebrew.temurah.atbash('שלום')) // 'שלום'

// Combine cipher with gematria
const transformed = hebrew.temurah.atbash('בבל');
hebrew.gematria.misparHechrachi(transformed)  // 620
```

#### Available Ciphers

| Cipher | Hebrew | Source | Description |
|--------|--------|--------|-------------|
| `atbash` | אתב״ש | JE + Pardes | Mirror positions: א↔ת, ב↔ש, etc. |
| `albam` | אלב״ם | Pardes 30:5 | Half swap: א↔ל, ב↔מ, etc. |

### Morphology

Parse morphological codes from tagged texts.

```typescript
import { parseMorphCode, HebrewMorphologyParser } from '@metaxia/scriptures-core';

// Parse a morphology code
const parsed = parseMorphCode('HVqp3ms');
// { partOfSpeech: 'verb', stem: 'qal', aspect: 'perfect', person: '3', gender: 'masculine', number: 'singular' }

// Use the Hebrew parser directly
const parser = new HebrewMorphologyParser();
const result = parser.parse('HNcmsa');
// { partOfSpeech: 'noun', gender: 'masculine', number: 'singular', state: 'absolute' }
```

### Lexicon

Look up words by Strong's number or lemma.

```typescript
import { lookupStrongs, normalizeStrongs } from '@metaxia/scriptures-core';

// Normalize Strong's numbers
normalizeStrongs('H07225'); // 'H7225'
normalizeStrongs('g3056');  // 'G3056'

// Look up (requires a lexicon source package)
const entry = await lookupStrongs('H7225');
// { strongs: 'H7225', lemma: 'רֵאשִׁית', transliteration: 'reshith', ... }
```

### Registry

Manage scripture data sources.

```typescript
import {
  registerSource,
  unregisterSource,
  getSource,
  listEditions,
  hasEdition,
} from '@metaxia/scriptures-core';

// Check what's registered
console.log(listEditions());    // ['byztxt-TR', 'openscriptures-OHB']
console.log(hasEdition('KJV')); // false

// Get source metadata
const source = getSource('byztxt-TR');
console.log(source?.metadata.language); // 'Greek'
```

### Errors

Custom error classes for handling specific failure cases:

```typescript
import {
  EditionNotFoundError,
  BookNotFoundError,
  VerseNotFoundError,
  GematriaError,
} from '@metaxia/scriptures-core';

try {
  await getVerse('Genesis', 1, 1, { edition: 'nonexistent' });
} catch (error) {
  if (error instanceof EditionNotFoundError) {
    console.log(`Edition not found: ${error.edition}`);
  }
}
```

## Data Model

### Verse

```typescript
interface Verse {
  id: string;           // e.g., 'byztxt-TR:John.1.1'
  book: string;
  chapter: number;
  number: number;
  text: string;         // Full verse text (with diacritics/cantillation)
  words: Word[];        // Individual words with annotations
  gematria?: GematriaValues;      // Computed on-demand, excludes colophon words
  gematriaWithColophons?: GematriaValues;  // Computed on-demand, includes all words
  metadata?: Record<string, unknown>;
}
```

### Word

```typescript
interface Word {
  position: number;
  text: string;
  lexiconEntry?: LexiconEntry;
  morphology?: Morphology;
  strongs?: string[];   // e.g., ['H7225']
  gematria?: GematriaValues;  // Computed on-demand
  metadata?: Record<string, unknown>;
}
```

## Creating a Data Source Package

To create your own scripture data source:

```typescript
import { registerSource, type ScriptureSource } from '@metaxia/scriptures-core';

const mySource: ScriptureSource = {
  edition: 'my-edition',
  metadata: {
    name: 'My Edition',
    language: 'Hebrew',
    description: 'Custom scripture edition',
  },
  loadVerse: async (book, chapter, verse) => {
    // Return VerseData
  },
  loadChapter: async (book, chapter) => {
    // Return VerseData[]
  },
  loadCache: async (cacheName) => {
    // Return cached data or throw
  },
  listBooks: () => ['Genesis', 'Exodus', ...],
};

registerSource(mySource);
```

## Sources and Citations

The Hebrew gematria and temurah implementations in this library are derived exclusively from primary historical sources in the public domain.

### Primary Sources

#### Jewish Encyclopedia (1906)

The foundational source for gematria system definitions.

> Schechter, Solomon, and Caspar Levias. "Gematria." *The Jewish Encyclopedia: A Descriptive Record of the History, Religion, Literature, and Customs of the Jewish People from the Earliest Times to the Present Day*, edited by Isidore Singer, vol. 5, Funk and Wagnalls, 1906, pp. 589–592.

- **Online**: [jewishencyclopedia.com/articles/6564-gematria](https://www.jewishencyclopedia.com/articles/6564-gematria)
- **Archive.org**: [archive.org/details/the-jewish-encyclopedia-vol.-5](https://archive.org/details/the-jewish-encyclopedia-vol.-5) (pages 589–592)
- **License**: Public Domain (published 1906, copyright expired)

Systems derived from JE (1906):
- §E.1: Mispar Hechrachi (Normal Value)
- §E.2: Mispar Katan (Cyclical/Minor Value)
- §E.3: Mispar Kolel (Inclusive Value)
- §E.4: Musafi modifier (Additory Value)
- §E.6: Mispar Perati (Square Value of Letter)
- §E.10: Mispar Chitzon (External Value)
- §E.11: Mispar Gadol (Major Value)
- §E.15: Mispar Meshulash (Cube Value of Letter)
- §II.2: Atbash cipher

#### Pardes Rimonim (1548)

Historical primary source for additional systems.

> Cordovero, Moses ben Jacob. *Pardes Rimonim* [פרדס רמונים], Gate 30 ("Sha'ar ha-Gematria"), Chapters 5–8. Safed, 1548.

- **Online**: [sefaria.org/Pardes_Rimmonim.30](https://www.sefaria.org/Pardes_Rimmonim.30)
- **License**: Public Domain (published 1548)

Systems derived from Pardes Rimonim:
- Gate 30, Ch. 8: Mispar HaKadmi (Prior Value)
- Gate 30, Ch. 8: Mispar Siduri (Ordinal Value, implicit)
- Gate 30, Ch. 5: Albam cipher
- Gate 30, Ch. 5–6: Atbash cipher

### Derivation Notes

All letter-value tables are computed from explicit statements in the sources. Where a source describes a method without enumerating all values (e.g., JE §E.11 says "finals count as hundreds" without listing 500–900), the values are derived by applying the stated method to the standard Hebrew alphabet. Such derivations are documented in the source code.

## License

MIT
