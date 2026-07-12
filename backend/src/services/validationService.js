const prisma = require("../utils/prisma");
const validationChecks = require("./validationChecks");
const { PROJECT_NOT_FOUND, RUN_NOT_FOUND } = require("../constants/errorCodes");

const FALLBACK_PROFILE_CODE = "STANDARD_SOFTWARE";

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

function ratio(numerator, denominator) {
  // Empty denominators contribute 0, not 1.
  return denominator > 0 ? numerator / denominator : 0;
}

function calculateReadinessMetrics(context) {
  const { sections, requirements, traceabilityLinks } = context;

  const requiredSections = sections.filter((section) => section.isRequired);
  const completedRequiredSections = requiredSections.filter(
    (section) => section.content !== null && section.content.trim() !== ""
  );

  const linkedRequirementIds = new Set();
  for (const link of traceabilityLinks) {
    if (link.sourceType === "REQUIREMENT") linkedRequirementIds.add(link.sourceId);
    if (link.targetType === "REQUIREMENT") linkedRequirementIds.add(link.targetId);
  }

  const functionalRequirements = requirements.filter((requirement) => requirement.type === "FR");
  const hasLink = (requirementId, criteria) =>
    traceabilityLinks.some(
      (link) =>
        Object.entries(criteria).every(([key, value]) => link[key] === value) &&
        (criteria.sourceType === "REQUIREMENT"
          ? link.sourceId === requirementId
          : link.targetId === requirementId)
    );

  const metrics = {
    sectionCompletion: ratio(completedRequiredSections.length, requiredSections.length),
    reqTraced: ratio(
      requirements.filter((requirement) => linkedRequirementIds.has(requirement.id)).length,
      requirements.length
    ),
    frCovered: ratio(
      functionalRequirements.filter((requirement) =>
        hasLink(requirement.id, {
          sourceType: "USE_CASE",
          targetType: "REQUIREMENT",
          linkType: "covers"
        })
      ).length,
      functionalRequirements.length
    ),
    frImplemented: ratio(
      functionalRequirements.filter((requirement) =>
        hasLink(requirement.id, {
          sourceType: "REQUIREMENT",
          targetType: "DESIGN_ELEMENT",
          linkType: "implemented_by"
        })
      ).length,
      functionalRequirements.length
    ),
    frVerified: ratio(
      functionalRequirements.filter((requirement) =>
        hasLink(requirement.id, {
          sourceType: "REQUIREMENT",
          targetType: "TEST_CASE",
          linkType: "verified_by"
        })
      ).length,
      functionalRequirements.length
    )
  };

  const readinessScore = Math.round(
    100 *
      (0.3 * metrics.sectionCompletion +
        0.25 * metrics.reqTraced +
        0.2 * metrics.frCovered +
        0.15 * metrics.frImplemented +
        0.1 * metrics.frVerified)
  );

  return { metrics, readinessScore };
}

function interpolateTemplate(template, params) {
  if (!template) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : match
  );
}

function executeRules(rules, context) {
  const results = [];

  for (const rule of rules) {
    const check = validationChecks[rule.checkKey];

    if (!check) {
      console.warn(`[validationService] Unknown checkKey '${rule.checkKey}' for rule ${rule.ruleCode}`);
      continue;
    }

    for (const finding of check(context)) {
      const params = finding.params || {};

      results.push({
        ruleCode: rule.ruleCode,
        severity: rule.severity,
        message: interpolateTemplate(rule.message, params),
        suggestedFix: interpolateTemplate(rule.suggestedFix, params),
        targetType: finding.targetType || null,
        targetId: finding.targetId || null
      });
    }
  }

  return sortResults(results);
}

async function verifyProjectOwnership(client, ownerId, projectId) {
  const project = await client.project.findFirst({
    where: {
      id: projectId,
      ownerId
    },
    select: { id: true, profileId: true }
  });

  if (!project) {
    throw createValidationError(PROJECT_NOT_FOUND, "Project not found");
  }

  return project;
}

async function getActiveRules(client, profileId) {
  let resolvedProfileId = profileId;

  if (!resolvedProfileId) {
    const fallbackProfile = await client.validationProfile.findUnique({
      where: { code: FALLBACK_PROFILE_CODE },
      select: { id: true }
    });

    resolvedProfileId = fallbackProfile ? fallbackProfile.id : null;
  }

  if (!resolvedProfileId) {
    return [];
  }

  return client.validationRule.findMany({
    where: {
      profileId: resolvedProfileId,
      isActive: true
    },
    select: {
      ruleCode: true,
      severity: true,
      checkKey: true,
      message: true,
      suggestedFix: true
    }
  });
}

async function loadProjectContext(tx, projectId) {
  const documents = await tx.document.findMany({
    where: { projectId },
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
          isRequired: true,
          updatedAt: true
        }
      }
    }
  });
  const requirements = await tx.requirement.findMany({
    where: { projectId },
    select: {
      id: true,
      code: true,
      type: true,
      title: true,
      description: true,
      acceptanceCriteria: true,
      updatedAt: true
    }
  });
  const useCases = await tx.useCase.findMany({
    where: { projectId },
    select: {
      id: true,
      code: true,
      updatedAt: true
    }
  });
  const businessObjectives = await tx.businessObjective.findMany({
    where: { projectId },
    select: {
      id: true,
      code: true,
      updatedAt: true
    }
  });
  const traceabilityLinks = await tx.traceabilityLink.findMany({
    where: { projectId },
    select: {
      id: true,
      sourceType: true,
      sourceId: true,
      targetType: true,
      targetId: true,
      linkType: true,
      lastVerifiedAt: true
    }
  });
  const designElements = await tx.designElement.findMany({
    where: { projectId },
    select: {
      id: true,
      code: true,
      updatedAt: true
    }
  });
  const testCases = await tx.testCase.findMany({
    where: { projectId },
    select: {
      id: true,
      code: true,
      updatedAt: true
    }
  });

  const sections = documents.flatMap((document) =>
    document.sections.map((section) => ({
      ...section,
      documentTitle: document.title
    }))
  );

  return {
    documents,
    sections,
    requirements,
    useCases,
    businessObjectives,
    traceabilityLinks,
    designElements,
    testCases
  };
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
    metrics: true,
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
      const rules = await getActiveRules(tx, project.profileId);
      const context = await loadProjectContext(tx, project.id);
      const results = executeRules(rules, context);
      const { metrics, readinessScore } = calculateReadinessMetrics(context);

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
          metrics,
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
  calculateReadinessMetrics,
  sortResults,
  runProjectValidation,
  getValidationRuns,
  getValidationRunById
};
