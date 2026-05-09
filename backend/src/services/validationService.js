const prisma = require("../utils/prisma");

const PROJECT_NOT_FOUND = "PROJECT_NOT_FOUND";
const RUN_NOT_FOUND = "RUN_NOT_FOUND";

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

async function verifyProjectOwnership(ownerId, projectId) {
  const project = await prisma.project.findFirst({
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

function buildValidationResults(documents, requirements, traceabilityLinks) {
  const results = [];
  const documentSections = documents.flatMap((document) =>
    document.sections.map((section) => ({
      ...section,
      documentTitle: document.title
    }))
  );
  const documentSectionIds = new Set(documentSections.map((section) => section.id));
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
  const project = await verifyProjectOwnership(ownerId, projectId);
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
          code: true
        }
      });
      const traceabilityLinks = await tx.traceabilityLink.findMany({
        where: { projectId: project.id },
        select: {
          sourceType: true,
          sourceId: true,
          targetType: true,
          targetId: true
        }
      });
      const results = buildValidationResults(documents, requirements, traceabilityLinks);
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
  const project = await verifyProjectOwnership(ownerId, projectId);
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
