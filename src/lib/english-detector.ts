// Common English words used for detection.
// These are high-frequency English words unlikely to appear in other languages.
const COMMON_ENGLISH_WORDS = new Set([
  // Articles & determiners
  "the", "a", "an", "this", "that", "these", "those",
  // Pronouns
  "i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them",
  "my", "your", "his", "its", "our", "their", "mine", "yours", "ours", "theirs",
  // Common verbs
  "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did",
  "will", "would", "shall", "should", "may", "might", "can", "could", "must",
  "get", "got", "make", "made", "go", "went", "gone", "come", "came",
  "take", "took", "taken", "give", "gave", "given",
  "know", "knew", "known", "think", "thought", "see", "saw", "seen",
  "want", "need", "use", "find", "found", "tell", "told",
  "say", "said", "let", "put", "keep", "kept", "begin", "began",
  // Prepositions & conjunctions
  "of", "in", "to", "for", "with", "on", "at", "from", "by", "about",
  "as", "into", "through", "during", "before", "after", "above", "below",
  "between", "under", "again", "further", "then", "once",
  "and", "but", "or", "nor", "not", "so", "yet", "both", "either", "neither",
  "if", "when", "where", "while", "because", "although", "since", "until",
  // Common adjectives
  "all", "each", "every", "both", "few", "more", "most", "other", "some", "such",
  "no", "only", "own", "same", "than", "too", "very",
  "new", "old", "big", "small", "great", "little", "long", "short",
  "good", "better", "best", "bad", "worse", "worst",
  "first", "last", "next", "right", "left",
  "high", "low", "free", "full", "real", "sure", "true", "false",
  // Common adverbs
  "here", "there", "now", "just", "also", "still", "already", "always", "never",
  "often", "sometimes", "usually", "really", "well", "much", "even",
  // Common nouns
  "time", "year", "people", "way", "day", "man", "woman", "child", "children",
  "world", "life", "hand", "part", "place", "case", "week", "company",
  "system", "program", "question", "work", "government", "number", "night",
  "point", "home", "water", "room", "mother", "area", "money", "story",
  "fact", "month", "lot", "right", "study", "book", "eye", "job", "word",
  "business", "issue", "side", "kind", "head", "house", "service", "friend",
  "father", "power", "hour", "game", "line", "end", "members", "family",
  "state", "country", "today", "customer", "customers",
  // Business / SaaS terms
  "pricing", "features", "solutions", "platform", "enterprise", "contact",
  "learn", "more", "sign", "up", "log", "demo", "request", "support",
  "about", "blog", "resources", "careers", "privacy", "terms", "cookie",
  "settings", "manage", "schedule", "start", "trial", "download",
  "experience", "explore", "discover", "transform", "deliver",
  "seamless", "powerful", "scalable", "innovative", "trusted",
  "workforce", "engagement", "management", "automation", "intelligence",
  "omnichannel", "analytics", "reporting", "integration", "integrations",
  "ready", "without", "across", "every", "how", "what", "why", "who",
  "which", "where", "their", "your", "our", "its",
]);

export interface DetectionResult {
  text: string;
  englishWords: string[];
}

export function detectEnglishSentences(
  text: string,
  excludedTerms: string[]
): DetectionResult[] {
  const excludedSet = new Set(excludedTerms.map((t) => t.toLowerCase()));

  // Split into sentences (by period, newline, or segments)
  const sentences = text
    .split(/[.!?\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);

  const results: DetectionResult[] = [];

  for (const sentence of sentences) {
    const words = sentence
      .split(/[\s,;:()[\]{}"']+/)
      .map((w) => w.replace(/[^a-zA-ZÀ-ÿ'-]/g, ""))
      .filter((w) => w.length > 1);

    if (words.length < 3) continue;

    const englishWords: string[] = [];

    for (const word of words) {
      const lower = word.toLowerCase();
      if (excludedSet.has(lower)) continue;
      if (COMMON_ENGLISH_WORDS.has(lower)) {
        englishWords.push(word);
      }
    }

    const englishRatio = englishWords.length / words.length;

    // Flag if more than 40% of words are common English
    if (englishRatio > 0.4 && englishWords.length >= 3) {
      // Deduplicate flagged words
      const unique = [...new Set(englishWords.map((w) => w.toLowerCase()))];
      results.push({ text: sentence, englishWords: unique });
    }
  }

  return results;
}
