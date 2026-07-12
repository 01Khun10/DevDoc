// Submodule imports: natural's main entry drags in ESM-only sentiment code.
const { TfIdf } = require("natural/lib/natural/tfidf");
const stemmer = require("natural/lib/natural/stemmers/porter_stemmer");
const { words: STOPWORDS } = require("natural/lib/natural/util/stopwords");

const STOPWORD_SET = new Set(STOPWORDS);
const prisma = require("../utils/prisma");
const { PROJECT_NOT_FOUND } = require("../constants/errorCodes");

const SCORE_THRESHOLD = 0.25;
const MAX_SUGGESTIONS = 5;
const MAX_REASON_TERMS = 5;

// Section content may be TipTap HTML; strip tags before tokenizing.
function normalizeText(text) {
  return (text || "").replace(/<[^>]+>/g, " ").toLowerCase();
}

// Stemmed, stopword-free tokens so "exports"/"exported" match "export".
// stemToWord remembers an original word per stem for readable reasonTerms.
function artefactStems(item, stemToWord) {
  const text = normalizeText(`${item.title || ""} ${item.description || item.content || ""}`);
  const tokens = text.match(/[a-z0-9]+/g) || [];
  const stems = [];
  for (const token of tokens) {
    if (token.length < 2 || STOPWORD_SET.has(token)) continue;
    const stem = stemmer.stem(token);
    if (!stemToWord.has(stem)) stemToWord.set(stem, token);
    stems.push(stem);
  }
  return stems;
}

function buildVector(tfidf, index) {
  const vector = new Map();
  for (const { term, tfidf: weight } of tfidf.listTerms(index)) {
    vector.set(term, weight);
  }
  return vector;
}

// Cosine similarity plus the shared terms that drive it, strongest first.
function compareVectors(a, b) {
  let dot = 0;
  const shared = [];
  for (const [term, weightA] of a) {
    const weightB = b.get(term);
    if (weightB) {
      dot += weightA * weightB;
      shared.push({ term, weight: weightA * weightB });
    }
  }
  if (dot === 0) return { score: 0, sharedTerms: [] };
  let normA = 0;
  for (const weight of a.values()) normA += weight * weight;
  let normB = 0;
  for (const weight of b.values()) normB += weight * weight;
  shared.sort((x, y) => y.weight - x.weight);
  return {
    score: dot / (Math.sqrt(normA) * Math.sqrt(normB)),
    sharedTerms: shared.slice(0, MAX_REASON_TERMS).map((entry) => entry.term)
  };
}

// Pure core: suggest links for requirements that have no traceability link at
// all, against document sections (described_by) and use cases (covers).
// Deterministic TF-IDF cosine similarity — no external AI.
function computeSuggestions({ requirements, useCases, documentSections, links }) {
  const linkedRequirementIds = new Set();
  for (const link of links) {
    if (link.sourceType === "REQUIREMENT") linkedRequirementIds.add(link.sourceId);
    if (link.targetType === "REQUIREMENT") linkedRequirementIds.add(link.targetId);
  }

  const stemToWord = new Map();
  const toEntries = (items, kind) =>
    items
      .map((item) => ({ kind, item, stems: artefactStems(item, stemToWord) }))
      .filter((entry) => entry.stems.length > 0);

  const requirementEntries = toEntries(
    requirements.filter((requirement) => !linkedRequirementIds.has(requirement.id)),
    "requirement"
  );
  if (requirementEntries.length === 0) return [];

  const candidateEntries = [
    ...toEntries(documentSections, "section"),
    ...toEntries(useCases, "useCase")
  ];
  if (candidateEntries.length === 0) return [];

  // One corpus so IDF reflects the whole project vocabulary.
  const corpus = [...requirementEntries, ...candidateEntries];
  const tfidf = new TfIdf();
  for (const entry of corpus) tfidf.addDocument(entry.stems);
  const vectors = corpus.map((entry, index) => ({ ...entry, vector: buildVector(tfidf, index) }));

  const requirementVectors = vectors.slice(0, requirementEntries.length);
  const candidateVectors = vectors.slice(requirementEntries.length);
  const suggestions = [];

  for (const requirement of requirementVectors) {
    for (const candidate of candidateVectors) {
      const { score, sharedTerms } = compareVectors(requirement.vector, candidate.vector);
      if (score < SCORE_THRESHOLD) continue;
      // Only pairs valid per supported link modes.
      const suggestion =
        candidate.kind === "section"
          ? {
              sourceType: "REQUIREMENT",
              sourceId: requirement.item.id,
              targetType: "DOCUMENT_SECTION",
              targetId: candidate.item.id,
              linkType: "described_by"
            }
          : {
              sourceType: "USE_CASE",
              sourceId: candidate.item.id,
              targetType: "REQUIREMENT",
              targetId: requirement.item.id,
              linkType: "covers"
            };
      suggestions.push({
        ...suggestion,
        score: Math.round(score * 100) / 100,
        reasonTerms: sharedTerms.map((stem) => stemToWord.get(stem) || stem)
      });
    }
  }

  return suggestions.sort((a, b) => b.score - a.score).slice(0, MAX_SUGGESTIONS);
}

// Read-only, ownership scoped.
async function getSuggestions(ownerId, projectId) {
  return prisma.$transaction(async (tx) => {
    const project = await tx.project.findFirst({
      where: { id: projectId, ownerId },
      select: { id: true }
    });
    if (!project) {
      const error = new Error("Project not found");
      error.code = PROJECT_NOT_FOUND;
      throw error;
    }

    const [requirements, useCases, documentSections, links] = await Promise.all([
      tx.requirement.findMany({
        where: { projectId: project.id },
        select: { id: true, title: true, description: true }
      }),
      tx.useCase.findMany({
        where: { projectId: project.id },
        select: { id: true, title: true, description: true }
      }),
      tx.documentSection.findMany({
        where: { document: { projectId: project.id } },
        select: { id: true, title: true, content: true }
      }),
      tx.traceabilityLink.findMany({
        where: { projectId: project.id },
        select: { sourceType: true, sourceId: true, targetType: true, targetId: true }
      })
    ]);

    return computeSuggestions({ requirements, useCases, documentSections, links });
  });
}

module.exports = {
  SCORE_THRESHOLD,
  computeSuggestions,
  getSuggestions
};
