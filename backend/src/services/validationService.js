const prisma = require("../utils/prisma");
const { PROJECT_NOT_FOUND, RUN_NOT_FOUND } = require("../constants/errorCodes");

const SEVERITY_ORDER = {
  ERROR: 1,
  WARNING: 2,
  INFO: 3
};

function createValidationError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function sortResults(results) {
  return [...results].sort((a, b) => {
    const severityDifference = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];

    if (severityDifference !== 0) {
      return severityDifference;
    }

    return a.ruleCode.localeCompare(b.ruleCode);
  });
}

function calculateReadinessScore(results) {
  const score = results.reduce((currentScore, result) => {
    if (result.severity === "ERROR") {
      return currentScore - 15;
    }

    if (result.severity === "WARNING") {
      return currentScore - 5;
    }

    return currentScore;
  }, 100);

  return Math.max(0, score);
}

function createResult(ruleCode, severity, message, suggestedFix, targetType = null, targetId = null) {
  return {
    ruleCode,
    severity,
    message,
    suggestedFix,
    targetType,
    targetId
  };
}

async function verifyProjectOwnership(client, ownerId, projectId) {
  const project = await client.project.findFirst({
    where: {
      id: projectId,
      ownerId
    },
    select: { id: true }
  });

  if (!project) {
    throw createValidationError(PROJECT_NOT_FOUND, "Project not found");
  }

  return project;
}

function hasTraceabilityLink(traceabilityLinks, criteria) {
  return traceabilityLinks.some((link) =>
    Object.entries(criteria).every(([key, value]) => link[key] === value)
  );
}

function buildValidationResults(documents, requirements, useCases, traceabilityLinks) {
  const results = [];
  const documentSections = documents.flatMap((document) =>
    document.sections.map((section) => ({
      ...section,
      documentTitle: document.title
    }))
  );
  const documentSectionIds = new Set(documentSections.map((section) => section.id));
  const requirementIds = new Set(requirements.map((requirement) => requirement.id));
  const useCaseIds = new Set(useCases.map((useCase) => useCase.id));
  const linkedRequirementIds = new Set(
    traceabilityLinks
      .filter((link) => link.sourceType === "REQUIREMENT")
      .map((link) => link.sourceId)
  );

  if (documents.length === 0) {
    results.push(
      createResult(
        "DOC-001",
        "ERROR",
        "This project does not have any documents yet.",
        "Create at least one document from the Template Library."
      )
    );
  }

  if (requirements.length === 0) {
    results.push(
      createResult(
        "REQ-001",
        "WARNING",
        "This project does not have any requirements yet.",
        "Add functional or non-functional requirements in the Requirements Registry."
      )
    );
  }

  if (useCases.length === 0) {
    results.push(
      createResult(
        "UC-001",
        "WARNING",
        "This project does not have any use cases yet.",
        "Add use cases to describe how users interact with the system."
      )
    );
  }

  documentSections
    .filter((section) => section.isRequired)
    .filter((section) => section.content === null || section.content.trim() === "")
    .forEach((section) => {
      results.push(
        createResult(
          "SEC-001",
          "ERROR",
          `Required section '${section.sectionNumber} ${section.title}' in document '${section.documentTitle}' is empty.`,
          "Open the document editor and complete this required section.",
          "DOCUMENT_SECTION",
          section.id
        )
      );
    });

  requirements
    .filter((requirement) => !linkedRequirementIds.has(requirement.id))
    .forEach((requirement) => {
      results.push(
        createResult(
          "TRC-001",
          "WARNING",
          `Requirement ${requirement.code} has no traceability links.`,
          "Link this requirement to a document section in the Traceability Matrix.",
          "REQUIREMENT",
          requirement.id
        )
      );
    });

  useCases.forEach((useCase) => {
    const coversRequirement = hasTraceabilityLink(traceabilityLinks, {
      sourceType: "USE_CASE",
      sourceId: useCase.id,
      targetType: "REQUIREMENT",
      linkType: "covers"
    });

    if (!coversRequirement) {
      results.push(
        createResult(
          "UC-002",
          "WARNING",
          `Use case ${useCase.code} is not linked to any requirement.`,
          "Open the Traceability Matrix and link this use case to at least one requirement.",
          "USE_CASE",
          useCase.id
        )
      );
    }

    const describedBySection = hasTraceabilityLink(traceabilityLinks, {
      sourceType: "USE_CASE",
      sourceId: useCase.id,
      targetType: "DOCUMENT_SECTION",
      linkType: "described_by"
    });

    if (!describedBySection) {
      results.push(
        createResult(
          "UC-003",
          "INFO",
          `Use case ${useCase.code} is not linked to any document section.`,
          "Link this use case to a document section where the scenario is explained.",
          "USE_CASE",
          useCase.id
        )
      );
    }
  });

  requirements
    .filter((requirement) => requirement.type === "FR")
    .filter(
      (requirement) =>
        !hasTraceabilityLink(traceabilityLinks, {
          sourceType: "USE_CASE",
          targetType: "REQUIREMENT",
          targetId: requirement.id,
          linkType: "covers"
        })
    )
    .forEach((requirement) => {
      results.push(
        createResult(
          "REQ-002",
          "WARNING",
          `Functional requirement ${requirement.code} is not covered by any use case.`,
          "Create or link a use case that explains the user scenario behind this requirement.",
          "REQUIREMENT",
          requirement.id
        )
      );
    });

  documents
    .filter((document) => document.completionPercent < 100)
    .forEach((document) => {
      results.push(
        createResult(
          "DOC-002",
          "INFO",
          `Document '${document.title}' is ${document.completionPercent}% complete.`,
          "Complete the remaining required sections to improve readiness."
        )
      );
    });

  traceabilityLinks
    .filter((link) => link.targetType === "DOCUMENT_SECTION")
    .filter((link) => !documentSectionIds.has(link.targetId))
    .forEach(() => {
      results.push(
        createResult(
          "TRC-002",
          "ERROR",
          "A traceability link points to a missing document section.",
          "Remove the broken traceability link and create a valid one."
        )
      );
    });

  traceabilityLinks
    .filter((link) => link.targetType === "REQUIREMENT")
    .filter((link) => !requirementIds.has(link.targetId))
    .forEach(() => {
      results.push(
        createResult(
          "TRC-002",
          "ERROR",
          "A traceability link points to a missing requirement.",
          "Remove the broken traceability link and create a valid one."
        )
      );
    });

  traceabilityLinks
    .filter((link) => link.sourceType === "USE_CASE")
    .filter((link) => !useCaseIds.has(link.sourceId))
    .forEach(() => {
      results.push(
        createResult(
          "TRC-002",
          "ERROR",
          "A traceability link points from a missing use case.",
          "Remove the broken traceability link and create a valid one."
        )
      );
    });

  traceabilityLinks
    .filter((link) => link.sourceType === "REQUIREMENT")
    .filter((link) => !requirementIds.has(link.sourceId))
    .forEach(() => {
      results.push(
        createResult(
          "TRC-002",
          "ERROR",
          "A traceability link points from a missing requirement.",
          "Remove the broken traceability link and create a valid one."
        )
      );
    });

  return sortResults(results);
}

function getValidationResultSelect() {
  return {
    id: true,
    validationRunId: true,
    ruleCode: true,
    severity: true,
    message: true,
    suggestedFix: true,
    targetType: true,
    targetId: true
  };
}

function getValidationRunSelect() {
  return {
    id: true,
    projectId: true,
    status: true,
    readinessScore: true,
    startedAt: true,
    completedAt: true,
    results: {
      select: getValidationResultSelect()
    }
  };
}

async function runProjectValidation(ownerId, projectId) {
  const project = await verifyProjectOwnership(prisma, ownerId, projectId);
  const validationRun = await prisma.validationRun.create({
    data: {
      projectId: project.id,
      status: "RUNNING"
    },
    select: {
      id: true,
      projectId: true
    }
  });

  try {
    const completedRun = await prisma.$transaction(async (tx) => {
      const documents = await tx.document.findMany({
        where: { projectId: project.id },
        select: {
          id: true,
          title: true,
          completionPercent: true,
          sections: {
            select: {
              id: true,
              sectionNumber: true,
              title: true,
              content: true,
              isRequired: true
            }
          }
        }
      });
      const requirements = await tx.requirement.findMany({
        where: { projectId: project.id },
        select: {
          id: true,
          code: true,
          type: true
        }
      });
      const useCases = await tx.useCase.findMany({
        where: { projectId: project.id },
        select: {
          id: true,
          code: true
        }
      });
      const traceabilityLinks = await tx.traceabilityLink.findMany({
        where: { projectId: project.id },
        select: {
          sourceType: true,
          sourceId: true,
          targetType: true,
          targetId: true,
          linkType: true
        }
      });
      const results = buildValidationResults(
        documents,
        requirements,
        useCases,
        traceabilityLinks
      );
      const readinessScore = calculateReadinessScore(results);

      if (results.length > 0) {
        await tx.validationResult.createMany({
          data: results.map((result) => ({
            validationRunId: validationRun.id,
            ...result
          }))
        });
      }

      return tx.validationRun.update({
        where: { id: validationRun.id },
        data: {
          status: "COMPLETED",
          readinessScore,
          completedAt: new Date()
        },
        select: getValidationRunSelect()
      });
    });

    return {
      ...completedRun,
      results: sortResults(completedRun.results)
    };
  } catch (error) {
    await prisma.validationRun
      .update({
        where: { id: validationRun.id },
        data: {
          status: "FAILED",
          completedAt: new Date()
        }
      })
      .catch(() => {});

    throw error;
  }
}

async function getValidationRuns(ownerId, projectId) {
  const project = await verifyProjectOwnership(prisma, ownerId, projectId);
  const validationRuns = await prisma.validationRun.findMany({
    where: { projectId: project.id },
    orderBy: { startedAt: "desc" },
    select: {
      id: true,
      status: true,
      readinessScore: true,
      startedAt: true,
      completedAt: true,
      _count: {
        select: { results: true }
      }
    }
  });

  return validationRuns.map((validationRun) => ({
    id: validationRun.id,
    status: validationRun.status,
    readinessScore: validationRun.readinessScore,
    startedAt: validationRun.startedAt,
    completedAt: validationRun.completedAt,
    resultCount: validationRun._count.results
  }));
}

async function getValidationRunById(ownerId, projectId, runId) {
  const validationRun = await prisma.validationRun.findFirst({
    where: {
      id: runId,
      projectId,
      project: {
        ownerId
      }
    },
    select: getValidationRunSelect()
  });

  if (!validationRun) {
    throw createValidationError(RUN_NOT_FOUND, "Validation run not found");
  }

  return {
    ...validationRun,
    results: sortResults(validationRun.results)
  };
}

module.exports = {
  PROJECT_NOT_FOUND,
  RUN_NOT_FOUND,
  runProjectValidation,
  getValidationRuns,
  getValidationRunById
};
