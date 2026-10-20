// search scoring for images. pure functions so they're easy to test.

const STOPWORDS = new Set([
  "a",
  "about",
  "after",
  "an",
  "and",
  "are",
  "at",
  "before",
  "by",
  "during",
  "for",
  "from",
  "in",
  "into",
  "is",
  "it",
  "its",
  "my",
  "near",
  "of",
  "on",
  "or",
  "over",
  "some",
  "that",
  "the",
  "this",
  "to",
  "under",
  "was",
  "with",
]);

// how much each kind of match counts toward one search term
const WEIGHTS = {
  tag: 1, // exact tag, e.g. "dog" and the tag "dog"
  word: 0.75, // whole word in the description
  partial: 0.4, // part of a tag or word, e.g. "sun" in "sunset"
};

const words = (text = "") => text.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];

// "The dog at the BEACH, dog" -> ["dog", "beach"]
export const tokenize = (query) => [
  ...new Set(words(query).filter((w) => !STOPWORDS.has(w))),
];

// how well one term matches one image, from 0 to 1
const scoreTerm = (term, tags, descWords) => {
  if (tags.includes(term)) return WEIGHTS.tag;
  if (descWords.includes(term)) return WEIGHTS.word;
  // partial matches on very short terms are mostly noise
  if (
    term.length >= 3 &&
    [...tags, ...descWords].some((w) => w.includes(term))
  ) {
    return WEIGHTS.partial;
  }
  return 0;
};

// confidence is the average match strength over all terms, so an image
// that matches every term as a tag gets 1 (100%)
export const scoreImage = (image, terms) => {
  const tags = image.tags || [];
  const descWords = words(image.description);
  const matchedTerms = [];
  let total = 0;

  for (const term of terms) {
    const s = scoreTerm(term, tags, descWords);
    if (s > 0) matchedTerms.push(term);
    total += s;
  }

  return {
    confidence: terms.length ? total / terms.length : 0,
    matchedTerms,
  };
};

// best matches first; ties go to the newer image
export const rankImages = (images, terms) =>
  images
    .map((image) => ({ ...image, ...scoreImage(image, terms) }))
    .filter((image) => image.confidence > 0)
    .sort(
      (a, b) =>
        b.confidence - a.confidence ||
        new Date(b.createdAt) - new Date(a.createdAt)
    );
