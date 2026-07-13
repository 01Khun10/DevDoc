const prisma = require("../utils/prisma");

function makeSnippet(text, query) {
  if (!text) return null;
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  const start = index >= 0 ? Math.max(0, index - 30) : 0;
  const snippet = text.slice(start, start + 90);
  return `${start > 0 ? "…" : ""}${snippet}${start + 90 < text.length ? "…" : ""}`;
}

async function searchAll(ownerId, query, limit = 10) {
  const contains = { contains: query, mode: "insensitive" };
  const ownedProject = { project: { ownerId } };
  const projectName = { project: { select: { name: true } } };

  const [projects, requirements, useCases, documents, designElements, testCases] =
    await Promise.all([
      prisma.project.findMany({
        where: { ownerId, OR: [{ name: contains }, { description: contains }] },
        take: limit,
        select: { id: true, name: true, description: true }
      }),
      prisma.requirement.findMany({
        where: { ...ownedProject, OR: [{ code: contains }, { title: contains }, { description: contains }] },
        take: limit,
        select: { id: true, projectId: true, code: true, title: true, description: true, ...projectName }
      }),
      prisma.useCase.findMany({
        where: { ...ownedProject, OR: [{ code: contains }, { title: contains }] },
        take: limit,
        select: { id: true, projectId: true, code: true, title: true, ...projectName }
      }),
      prisma.document.findMany({
        where: { ...ownedProject, title: contains },
        take: limit,
        select: { id: true, projectId: true, title: true, ...projectName }
      }),
      prisma.designElement.findMany({
        where: { ...ownedProject, OR: [{ code: contains }, { title: contains }] },
        take: limit,
        select: { id: true, projectId: true, code: true, title: true, ...projectName }
      }),
      prisma.testCase.findMany({
        where: { ...ownedProject, OR: [{ code: contains }, { title: contains }] },
        take: limit,
        select: { id: true, projectId: true, code: true, title: true, ...projectName }
      })
    ]);

  const results = [
    ...projects.map((item) => ({
      type: "PROJECT",
      id: item.id,
      projectId: item.id,
      code: null,
      title: item.name,
      snippet: makeSnippet(item.description, query),
      projectName: item.name
    })),
    ...requirements.map((item) => ({
      type: "REQUIREMENT",
      id: item.id,
      projectId: item.projectId,
      code: item.code,
      title: item.title,
      snippet: makeSnippet(item.description, query),
      projectName: item.project.name
    })),
    ...useCases.map((item) => ({
      type: "USE_CASE",
      id: item.id,
      projectId: item.projectId,
      code: item.code,
      title: item.title,
      snippet: null,
      projectName: item.project.name
    })),
    ...documents.map((item) => ({
      type: "DOCUMENT",
      id: item.id,
      projectId: item.projectId,
      code: null,
      title: item.title,
      snippet: null,
      projectName: item.project.name
    })),
    ...designElements.map((item) => ({
      type: "DESIGN_ELEMENT",
      id: item.id,
      projectId: item.projectId,
      code: item.code,
      title: item.title,
      snippet: null,
      projectName: item.project.name
    })),
    ...testCases.map((item) => ({
      type: "TEST_CASE",
      id: item.id,
      projectId: item.projectId,
      code: item.code,
      title: item.title,
      snippet: null,
      projectName: item.project.name
    }))
  ];

  return results.slice(0, limit);
}

module.exports = { searchAll };
