// Curated list of common profane/offensive words
const PROFANE_WORDS = new Set([
  // Common profanity
  "ass", "asshole", "bastard", "bitch", "bullshit",
  "crap", "cunt", "damn", "dick", "douchebag",
  "fuck", "fucking", "fucker", "goddamn", "hell",
  "jackass", "motherfucker", "nigger", "nigga",
  "piss", "prick", "pussy", "shit", "shitty",
  "slut", "whore", "wanker", "twat",
  // Slurs and hate speech
  "chink", "fag", "faggot", "kike", "spic",
  "retard", "retarded", "tranny",
  // Variations
  "assh0le", "b1tch", "biatch", "f*ck", "fuk",
  "fuq", "sh1t", "stfu", "gtfo", "wtf",
]);

/**
 * Check if text contains profanity.
 * Splits on non-alphanumeric characters and checks each word.
 */
export function containsProfanity(text: string): boolean {
  if (!text) return false;
  const words = text.toLowerCase().split(/[^a-z0-9]+/);
  return words.some((w) => w && PROFANE_WORDS.has(w));
}

/**
 * Returns all profane words found in the text.
 */
export function getProfaneWords(text: string): string[] {
  if (!text) return [];
  const words = text.toLowerCase().split(/[^a-z0-9]+/);
  return [...new Set(words.filter((w) => w && PROFANE_WORDS.has(w)))];
}

/**
 * Check multiple fields for profanity, returning a map of field name → error message.
 */
export function checkFieldsForProfanity(
  fields: Record<string, string | string[]>
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    const texts = Array.isArray(value) ? value : [value];
    for (const text of texts) {
      if (containsProfanity(text)) {
        errors[key] = "Please remove inappropriate language.";
        break;
      }
    }
  }
  return errors;
}
