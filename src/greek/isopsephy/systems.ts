/**
 * Greek Isopsephy Letter-Value Tables
 *
 * Letter-value mappings derived from primary sources.
 *
 * ## Primary Sources (Public Domain)
 *
 * ### Standard Isopsephy (ἰσοψηφία)
 *
 * Gow, James. "The Greek Numerical Alphabet." *The Journal of Philology* 12
 *   (1883): 278–284.
 *
 * - Internet Archive: https://archive.org/details/journalofphilolo12claruoft
 * - PDF pages 292–298 (article pp. 278–284)
 *
 * ### Reduced/Pythmen (πυθμήν)
 *
 * Hippolytus of Rome. *Refutation of All Heresies*. Translated by J. H. MacMahon.
 *   In *Ante-Nicene Fathers*, vol. 5, edited by Alexander Roberts and James
 *   Donaldson, 9–153. Buffalo, NY: Christian Literature Publishing, 1886.
 *   Book IV, Chapter 14.
 *
 * - Internet Archive: https://archive.org/details/antenicenefathe00444gut
 * - Early Church Texts: http://www.earlychurchtexts.com/public/hippolytus_refutation_book4.htm
 * - New Advent: https://www.newadvent.org/fathers/050104.htm
 *
 * ### Ordinal (Alphabet Order)
 *
 * Heath, Thomas L. *A History of Greek Mathematics*. Vol. 1, From Thales to
 *   Euclid. Oxford: Clarendon Press, 1921.
 *
 * - Internet Archive (Vol 1): https://archive.org/details/ahistorygreekma00heatgoog
 * - Internet Archive (Vol 2): https://archive.org/details/historyofgreekma029268mbp
 */

import type { LetterValueTable } from './types.js';

/**
 * STANDARD ISOPSEPHY (ἰσοψηφία)
 *
 * The Milesian/Ionic numeral system using 27 letters (24 standard + 3 archaic).
 *
 * ## Source Quote (Gow 1883, p. 279)
 *
 * > "But at some date, at present unknown, the Greeks adopted the practice of
 * > using the letters of the alphabet in order as their numeral signs, and
 * > this style ultimately became universal among Greek-speaking peoples. The
 * > alphabet so used was the Ionic, with three additions, the so-called
 * > ἐπίσημα. For 6 (after ε') ς', the old digamma, was used: for 90 (after π')
 * > ϙ': and finally for 900 (after ω') ͵ was added."
 *
 * ## Letter Values
 *
 * | Range | Letters | Values |
 * |-------|---------|--------|
 * | Units | α, β, γ, δ, ε, ϛ, ζ, η, θ | 1–9 |
 * | Tens | ι, κ, λ, μ, ν, ξ, ο, π, ϟ | 10–90 |
 * | Hundreds | ρ, σ, τ, υ, φ, χ, ψ, ω, ϡ | 100–900 |
 */
export const STANDARD: LetterValueTable = {
  // Uppercase - Units (1-9)
  'Α': 1, 'Β': 2, 'Γ': 3, 'Δ': 4, 'Ε': 5,
  'Ϛ': 6, // Stigma (archaic digamma)
  'Ζ': 7, 'Η': 8, 'Θ': 9,
  // Uppercase - Tens (10-90)
  'Ι': 10, 'Κ': 20, 'Λ': 30, 'Μ': 40, 'Ν': 50,
  'Ξ': 60, 'Ο': 70, 'Π': 80,
  'Ϟ': 90, // Koppa (archaic)
  // Uppercase - Hundreds (100-900)
  'Ρ': 100, 'Σ': 200, 'Τ': 300, 'Υ': 400, 'Φ': 500,
  'Χ': 600, 'Ψ': 700, 'Ω': 800,
  'Ϡ': 900, // Sampi (archaic)

  // Lowercase - Units (1-9)
  'α': 1, 'β': 2, 'γ': 3, 'δ': 4, 'ε': 5,
  'ϛ': 6, // Stigma (archaic digamma)
  'ζ': 7, 'η': 8, 'θ': 9,
  // Lowercase - Tens (10-90)
  'ι': 10, 'κ': 20, 'λ': 30, 'μ': 40, 'ν': 50,
  'ξ': 60, 'ο': 70, 'π': 80,
  'ϟ': 90, // Koppa (archaic)
  // Lowercase - Hundreds (100-900)
  'ρ': 100, 'σ': 200, 'ς': 200, // Final sigma same as regular sigma
  'τ': 300, 'υ': 400, 'φ': 500,
  'χ': 600, 'ψ': 700, 'ω': 800,
  'ϡ': 900, // Sampi (archaic)
};

/**
 * ORDINAL - Sequential Position Value (α=1, β=2, ... ω=24)
 *
 * Uses the standard 24-letter Greek alphabet. Archaic letters (stigma, koppa,
 * sampi) have isopsephy values but NO ordinal position.
 *
 * ## Primary Source (EXPLICIT)
 *
 * Dionysius Thrax. *Ars Grammatica* (Τέχνη Γραμματική). Section 6. 2nd century BCE.
 *
 * > Greek: τὰ δὲ αὐτὰ καὶ στοιχεῖα καλεῖται διὰ τὸ ἔχειν στοῖχόν τινα καὶ τάξιν
 * > Translation: "These same [letters] are also called stoicheia because they
 * > have a certain order (stoichos) and arrangement (taxis)."
 *
 * - English translation: https://en.wikisource.org/wiki/The_grammar_of_Dionysios_Thrax
 * - Greek text: Uhlig, Gustav, ed. *Dionysii Thracis Ars Grammatica*. Leipzig:
 *   Teubner, 1883. https://archive.org/details/dionysiithracis00unkngoog
 *
 * ## Supporting Evidence
 *
 * **Earliest Fixed Order:** The Abecedarium of Samos (c. 660 BCE) demonstrates
 * the Greek alphabet order was fixed by the 7th century BCE.
 *
 * - Jeffery, L.H. *The Local Scripts of Archaic Greece*. Rev. ed. with supplement
 *   by A.W. Johnston. Oxford: Clarendon Press, 1990.
 *   https://archive.org/details/localscriptsofar0000jeff
 *
 * **Musical Notation:** Greek musical notation assigned letters sequentially to
 * pitches, using alphabet position as an ordering principle.
 *
 * - Alypius. *Introduction to Music* (Εἰσαγωγὴ μουσική). c. 350 CE. In
 *   Meibom, Marcus, ed. *Antiquae Musicae Auctores Septem*. Amsterdam, 1652.
 *   https://archive.org/details/antiquaemusicaea00meib
 *
 * ## Historical Context
 *
 * The Greek alphabet was standardized in Athens in 403 BCE (Euclidean reform)
 * and adopted pan-Hellenically by the mid-4th century BCE. Sequential letter
 * numbering for ordinal purposes is attested in Homer's Iliad (books α-ω) and
 * Aristotle's works.
 */
export const ORDINAL: LetterValueTable = {
  // Uppercase - positions 1-24
  'Α': 1, 'Β': 2, 'Γ': 3, 'Δ': 4, 'Ε': 5, 'Ζ': 6,
  'Η': 7, 'Θ': 8, 'Ι': 9, 'Κ': 10, 'Λ': 11, 'Μ': 12,
  'Ν': 13, 'Ξ': 14, 'Ο': 15, 'Π': 16, 'Ρ': 17, 'Σ': 18,
  'Τ': 19, 'Υ': 20, 'Φ': 21, 'Χ': 22, 'Ψ': 23, 'Ω': 24,

  // Lowercase - positions 1-24
  'α': 1, 'β': 2, 'γ': 3, 'δ': 4, 'ε': 5, 'ζ': 6,
  'η': 7, 'θ': 8, 'ι': 9, 'κ': 10, 'λ': 11, 'μ': 12,
  'ν': 13, 'ξ': 14, 'ο': 15, 'π': 16, 'ρ': 17, 'σ': 18,
  'ς': 18, // Final sigma same as regular sigma
  'τ': 19, 'υ': 20, 'φ': 21, 'χ': 22, 'ψ': 23, 'ω': 24,

  // Archaic letters have NO ordinal position (intentionally omitted)
};

/**
 * Archaic Greek letters that have isopsephy values but no ordinal position.
 *
 * These are the three "episema" (ἐπίσημα) retained from older alphabets
 * solely for numerical purposes:
 * - Stigma (Ϛ/ϛ) = 6 (from digamma)
 * - Koppa (Ϟ/ϟ) = 90
 * - Sampi (Ϡ/ϡ) = 900
 */
export const ARCHAIC_LETTERS = new Set(['Ϛ', 'ϛ', 'Ϟ', 'ϟ', 'Ϡ', 'ϡ']);

/**
 * REDUCED / PYTHMEN (πυθμήν)
 *
 * Note: Reduced is a COMPUTATION on standard values, not a lookup table.
 * The digital root function is implemented in the main greek.ts module.
 *
 * ## Source Quote (Hippolytus, Refutation of All Heresies IV.14)
 *
 * > "The Pythagoreans... reduced numbers greater than 10 to the first nine
 * > numbers, taking into account only their root or pythmen."
 *
 * ## Method
 *
 * The "Pythagoras to Telauges" (Πυθαγόρας πρὸς Τελαύγην) divination method
 * uses mod 9 reduction to produce values 1-9. Mathematically equivalent to
 * digital root: repeatedly sum digits until a single digit remains.
 *
 * ## Manuscript Evidence
 *
 * Attested in ~60 Byzantine manuscripts (Kalvesmaki 2006).
 */
