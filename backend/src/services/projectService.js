const prisma = require("../utils/prisma");
const { PROJECT_NOT_FOUND, PROFILE_NOT_FOUND } = require("../constants/errorCodes");

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
    documentsCount,
    requirementsCount,
    useCasesCount,
    traceabilityLinksCount,
    validationRunsCount,
    latestValidationRun
  ] = await Promise.all([
    prisma.document.count({ where: { projectId } }),
    prisma.requirement.count({ where: { projectId } }),
    prisma.useCase.count({ where: { projectId } }),
    prisma.traceabilityLink.count({ where: { projectId } }),
    prisma.validationRun.count({ where: { projectId } }),
    prisma.validationRun.findFirst({
      where: { projectId },
      orderBy: { startedAt: "desc" },
      select: {
        id: true,
        status: true,
        readinessScore: true,
        completedAt: true
      }
    })
  ]);

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
      traceabilityLinks: traceabilityLinksCount,
      validationRuns: validationRunsCount
    },
    latestValidation: latestValidationRun || null,
    coverage: {
      linkedRequirements,
      unlinkedRequirements,
      linkedUseCases,
      unlinkedUseCases
    }
  };
}

module.exports = {
  PROJECT_NOT_FOUND,
  PROFILE_NOT_FOUND,
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  getProjectOverview
};
