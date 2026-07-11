// Vague terms flagged by QUA-001 in requirement titles/descriptions.
const VAGUE_TERMS = [
  "fast",
  "easy",
  "user-friendly",
  "simple",
  "efficient",
  "some",
  "many",
  "few",
  "appropriate",
  "adequate",
  "flexible",
  "robust",
  "seamless",
  "quickly",
  "as needed",
  "etc",
  "intuitive",
  "optimal",
  "reasonable",
  "sufficient",
  "user friendly"
];

// Whole-word/phrase, case-insensitive. Escapes regex specials in terms.
function findVagueTerms(text) {
  if (!text) {
    return [];
  }

  return VAGUE_TERMS.filter((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escaped}\\b`, "i").test(text);
  });
}

module.exports = { VAGUE_TERMS, findVagueTerms };
