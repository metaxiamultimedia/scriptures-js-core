# @metaxia/scriptures-core

The foundational engine for the Scriptures JS ecosystem. Provides a unified API for querying scripture texts, computing gematria, parsing morphology, and working with lexicon data.

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
import '@metaxia/scriptures-source-byztxt-tr';

import { getVerse, computeGematria, listEditions } from '@metaxia/scriptures-core';

// List available editions
console.log(listEditions()); // ['byztxt-TR']

// Get a verse
const verse = await getVerse('John', 1, 1, { edition: 'byztxt-TR' });
console.log(verse.text);
// "εν αρχη ην ο λογος και ο λογος ην προς τον θεον και θεος ην ο λογος"

// Compute gematria
const values = computeGematria('λογος');
console.log(values.standard); // 373
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
//   text: 'בְּרֵאשִׁית בָּרָא אֱלֹהִים ...',
//   words: [...],
//   gematria: { standard: 2701, ordinal: 298 }
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

### Gematria

Compute numeric values from Hebrew, Greek, or English text.

#### `computeGematria(text, options?)`

Compute all gematria values for text. Language is auto-detected.

```typescript
import { computeGematria } from '@metaxia/scriptures-core';

// Hebrew
const hebrew = computeGematria('בראשית');
// { standard: 913, ordinal: 76, reduced: 22 }

// Greek
const greek = computeGematria('λογος');
// { standard: 373, ordinal: 67, reduced: 4 }
```

#### `computeGematriaValue(text, method?, language?)`

Compute a single value using a specific method.

```typescript
import { computeGematriaValue } from '@metaxia/scriptures-core';

const standard = computeGematriaValue('בראשית', 'standard'); // 913
const ordinal = computeGematriaValue('בראשית', 'ordinal');   // 76
```

#### Available Methods

| Language | Method | Slug | Description |
|----------|--------|------|-------------|
| Hebrew | Standard | `mispar_hechrachi` | Traditional letter values |
| Hebrew | Ordinal | `mispar_siduri` | Position-based (1-22) |
| Hebrew | Reduced | `mispar_katan` | Single digit reduction |
| Greek | Standard | `isopsephy` | Traditional isopsephy |
| Greek | Ordinal | `isopsephy_ordinal` | Position-based (1-24) |
| Greek | Reduced | `isopsephy_reduced` | Digital root |
| English | Ordinal | `english_ordinal` | A=1, B=2, ... Z=26 |

#### `listGematriaMethods(language?)`

List available gematria methods.

```typescript
import { listGematriaMethods } from '@metaxia/scriptures-core';

const methods = listGematriaMethods('hebrew');
// [{ slug: 'mispar_hechrachi', name: 'Mispar Hechrachi', ... }, ...]
```

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
  text: string;         // Full verse text
  words: Word[];        // Individual words with annotations
  gematria?: GematriaValues;
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
  gematria?: GematriaValues;
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

## License

MIT
