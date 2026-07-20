const prisma = require("../utils/prisma");
const { PROJECT_NOT_FOUND, PROFILE_NOT_FOUND } = require("../constants/errorCodes");
const { calculateCompletionPercent } = require("./documentService");

function createProjectError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

const profileInclude = {
  profile: {
    select: {
      id: true,
      code: true,
      name: true
    }
  }
};

async function checkProfileExists(profileId) {
  if (!profileId) return;
  const profile = await prisma.validationProfile.findUnique({
    where: { id: profileId }
  });
  if (!profile) {
    throw createProjectError(PROFILE_NOT_FOUND, "Selected profile does not exist");
  }
}

async function createProject(ownerId, values) {
  await checkProfileExists(values.profileId);

  const project = await prisma.project.create({
    data: {
      ...values,
      ownerId
    },
    include: profileInclude
  });

  return project;
}

async function getProjects(ownerId) {
  const projects = await prisma.project.findMany({
    where: { ownerId },
    orderBy: { createdAt: 'desc' },
    include: profileInclude
  });

  return projects;
}

async function getProjectById(ownerId, projectId) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId
    },
    include: profileInclude
  });

  if (!project) {
    throw createProjectError(PROJECT_NOT_FOUND, "Project not found");
  }

  return project;
}

async function updateProject(ownerId, projectId, values) {
  if (Object.keys(values).length === 0) {
    // Empty update body is allowed and should return unchanged project
    return getProjectById(ownerId, projectId);
  }

  return prisma.$transaction(async (tx) => {
    if (values.profileId !== undefined && values.profileId !== null) {
      const profile = await tx.validationProfile.findUnique({
        where: { id: values.profileId }
      });
      if (!profile) {
        throw createProjectError(PROFILE_NOT_FOUND, "Selected profile does not exist");
      }
    }

    const { count } = await tx.project.updateMany({
      where: {
        id: projectId,
        ownerId
      },
      data: values
    });

    if (count === 0) {
      throw createProjectError(PROJECT_NOT_FOUND, "Project not found");
    }

    // After updateMany succeeds, re-fetch the project with profile summary.
    return tx.project.findFirst({
      where: {
        id: projectId,
        ownerId
      },
      include: profileInclude
    });
  });
}

async function getProjectOverview(ownerId, projectId) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!project) {
    throw createProjectError(PROJECT_NOT_FOUND, "Project not found");
  }

  const [
    documents,
    requirementsCount,
    useCasesCount,
    designElementsCount,
    testCasesCount,
    traceabilityLinksCount,
    validationRunsCount,
    latestValidationRun
  ] = await Promise.all([
    prisma.document.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        title: true,
        documentType: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        sections: {
          orderBy: { displayOrder: "asc" },
          select: {
            id: true,
            sectionNumber: true,
            title: true,
            status: true,
            isRequired: true
          }
        }
      }
    }),
    prisma.requirement.count({ where: { projectId } }),
    prisma.useCase.count({ where: { projectId } }),
    prisma.designElement.count({ where: { projectId } }),
    prisma.testCase.count({ where: { projectId } }),
    prisma.traceabilityLink.count({ where: { projectId } }),
    prisma.validationRun.count({ where: { projectId } }),
    prisma.validationRun.findFirst({
      where: { projectId },
      orderBy: { startedAt: "desc" },
      select: {
        id: true,
        status: true,
        readinessScore: true,
        completedAt: true,
        _count: { select: { results: { where: { severity: "ERROR" } } } }
      }
    })
  ]);

  const documentsCount = documents.length;
  const documentSummaries = documents.map((document) => {
    const requiredSections = document.sections.filter((section) => section.isRequired);
    return {
      id: document.id,
      title: document.title,
      documentType: document.documentType,
      status: document.status,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      completionPercent: calculateCompletionPercent(document.sections),
      totalRequired: requiredSections.length,
      completedRequired: requiredSections.filter((section) => section.status === "COMPLETE").length,
      sections: document.sections,
      sectionIds: document.sections.map((section) => section.id)
    };
  });

  // Find linked requirements by counting unique requirement IDs in traceability links
  // A requirement can be sourceType or targetType (typically targetType is DOCUMENT_SECTION, but just in case)
  const reqLinks = await prisma.traceabilityLink.findMany({
    where: {
      projectId,
      OR: [
        { sourceType: "REQUIREMENT" },
        { targetType: "REQUIREMENT" }
      ]
    },
    select: { sourceId: true, targetId: true, sourceType: true, targetType: true }
  });

  const linkedReqIds = new Set();
  for (const link of reqLinks) {
    if (link.sourceType === "REQUIREMENT") linkedReqIds.add(link.sourceId);
    if (link.targetType === "REQUIREMENT") linkedReqIds.add(link.targetId);
  }

  const ucLinks = await prisma.traceabilityLink.findMany({
    where: {
      projectId,
      OR: [
        { sourceType: "USE_CASE" },
        { targetType: "USE_CASE" }
      ]
    },
    select: { sourceId: true, targetId: true, sourceType: true, targetType: true }
  });

  const linkedUcIds = new Set();
  for (const link of ucLinks) {
    if (link.sourceType === "USE_CASE") linkedUcIds.add(link.sourceId);
    if (link.targetType === "USE_CASE") linkedUcIds.add(link.targetId);
  }

  const linkedRequirements = linkedReqIds.size;
  const unlinkedRequirements = Math.max(0, requirementsCount - linkedRequirements);

  const linkedUseCases = linkedUcIds.size;
  const unlinkedUseCases = Math.max(0, useCasesCount - linkedUseCases);

  return {
    project,
    counts: {
      documents: documentsCount,
      requirements: requirementsCount,
      useCases: useCasesCount,
      designElements: designElementsCount,
      testCases: testCasesCount,
      traceabilityLinks: traceabilityLinksCount,
      validationRuns: validationRunsCount
    },
    documents: documentSummaries,
    latestValidation: latestValidationRun
      ? {
          id: latestValidationRun.id,
          status: latestValidationRun.status,
          readinessScore: latestValidationRun.readinessScore,
          completedAt: latestValidationRun.completedAt,
          errorCount: latestValidationRun._count.results
        }
      : null,
    coverage: {
      linkedRequirements,
      unlinkedRequirements,
      linkedUseCases,
      unlinkedUseCases
    }
  };
}

async function listActivityLogs(ownerId, projectId, limit = 20) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId },
    select: { id: true }
  });

  if (!project) {
    throw createProjectError(PROJECT_NOT_FOUND, "Project not found");
  }

  return prisma.activityLog.findMany({
    where: { projectId: project.id },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      action: true,
      entityType: true,
      entityId: true,
      metadata: true,
      createdAt: true
    }
  });
}

async function deleteProject(ownerId, projectId) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId },
    select: { id: true }
  });

  if (!project) {
    throw createProjectError(PROJECT_NOT_FOUND, "Project not found");
  }

  // All related records (documents, requirements, use cases, etc.) are
  // cascade-deleted by the database via onDelete: Cascade in the Prisma schema.
  await prisma.project.delete({ where: { id: project.id } });

  return { deleted: true };
}

module.exports = {
  PROJECT_NOT_FOUND,
  PROFILE_NOT_FOUND,
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectOverview,
  listActivityLogs
};
