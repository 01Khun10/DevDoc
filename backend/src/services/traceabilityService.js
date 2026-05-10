const prisma = require("../utils/prisma");

const PROJECT_NOT_FOUND = "PROJECT_NOT_FOUND";
const SOURCE_NOT_FOUND = "SOURCE_NOT_FOUND";
const TARGET_NOT_FOUND = "TARGET_NOT_FOUND";
const LINK_NOT_FOUND = "LINK_NOT_FOUND";
const DUPLICATE_LINK = "DUPLICATE_LINK";
const UNSUPPORTED_LINK_TYPE = "UNSUPPORTED_LINK_TYPE";

function createTraceabilityError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function getTraceabilityLinkSelect() {
  return {
    id: true,
    projectId: true,
    sourceType: true,
    sourceId: true,
    targetType: true,
    targetId: true,
    linkType: true,
    createdAt: true
  };
}

function getSupportedLinkType(sourceType, targetType) {
  if (sourceType === "USE_CASE" && targetType === "REQUIREMENT") {
    return "covers";
  }

  if (sourceType === "USE_CASE" && targetType === "DOCUMENT_SECTION") {
    return "described_by";
  }

  if (sourceType === "REQUIREMENT" && targetType === "DOCUMENT_SECTION") {
    return "described_by";
  }

  return null;
}

async function verifyProjectOwnership(tx, ownerId, projectId) {
  const project = await tx.project.findFirst({
    where: {
      id: projectId,
      ownerId
    },
    select: { id: true }
  });

  if (!project) {
    throw createTraceabilityError(PROJECT_NOT_FOUND, "Project not found");
  }

  return project;
}

async function verifySourceArtefact(tx, projectId, values) {
  if (values.sourceType === "USE_CASE") {
    const useCase = await tx.useCase.findFirst({
      where: {
        id: values.sourceId,
        projectId
      },
      select: { id: true }
    });

    if (!useCase) {
      throw createTraceabilityError(SOURCE_NOT_FOUND, "Source artefact not found");
    }

    return useCase;
  }

  if (values.sourceType === "REQUIREMENT") {
    const requirement = await tx.requirement.findFirst({
      where: {
        id: values.sourceId,
        projectId
      },
      select: { id: true }
    });

    if (!requirement) {
      throw createTraceabilityError(SOURCE_NOT_FOUND, "Source artefact not found");
    }

    return requirement;
  }

  throw createTraceabilityError(SOURCE_NOT_FOUND, "Source artefact not found");
}

async function verifyTargetArtefact(tx, projectId, values) {
  if (values.targetType === "REQUIREMENT") {
    const requirement = await tx.requirement.findFirst({
      where: {
        id: values.targetId,
        projectId
      },
      select: { id: true }
    });

    if (!requirement) {
      throw createTraceabilityError(TARGET_NOT_FOUND, "Target artefact not found");
    }

    return requirement;
  }

  if (values.targetType === "DOCUMENT_SECTION") {
    const documentSection = await tx.documentSection.findFirst({
      where: {
        id: values.targetId,
        document: {
          projectId
        }
      },
      select: { id: true }
    });

    if (!documentSection) {
      throw createTraceabilityError(TARGET_NOT_FOUND, "Target artefact not found");
    }

    return documentSection;
  }

  throw createTraceabilityError(TARGET_NOT_FOUND, "Target artefact not found");
}

async function getTraceabilityLinks(ownerId, projectId) {
  return prisma.$transaction(async (tx) => {
    const project = await verifyProjectOwnership(tx, ownerId, projectId);

    return tx.traceabilityLink.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: "desc" },
      select: getTraceabilityLinkSelect()
    });
  });
}

async function getTraceabilityOptions(ownerId, projectId) {
  return prisma.$transaction(async (tx) => {
    const project = await verifyProjectOwnership(tx, ownerId, projectId);

    const useCases = await tx.useCase.findMany({
      where: { projectId: project.id },
      orderBy: { code: "asc" },
      select: {
        id: true,
        code: true,
        title: true,
        description: true
      }
    });

    const requirements = await tx.requirement.findMany({
      where: { projectId: project.id },
      orderBy: { code: "asc" },
      select: {
        id: true,
        code: true,
        type: true,
        title: true,
        status: true
      }
    });

    const documentSections = await tx.documentSection.findMany({
      where: {
        document: {
          projectId: project.id
        }
      },
      orderBy: [
        {
          document: {
            title: "asc"
          }
        },
        { displayOrder: "asc" }
      ],
      select: {
        id: true,
        sectionNumber: true,
        title: true,
        status: true,
        document: {
          select: {
            id: true,
            title: true,
            documentType: true
          }
        }
      }
    });

    return {
      useCases,
      requirements,
      documentSections
    };
  });
}

async function createTraceabilityLink(ownerId, projectId, values) {
  return prisma.$transaction(async (tx) => {
    const project = await verifyProjectOwnership(tx, ownerId, projectId);
    const supportedLinkType = getSupportedLinkType(values.sourceType, values.targetType);

    if (!supportedLinkType || values.linkType !== supportedLinkType) {
      throw createTraceabilityError(
        UNSUPPORTED_LINK_TYPE,
        "Unsupported or invalid traceability link type"
      );
    }

    await verifySourceArtefact(tx, project.id, values);
    await verifyTargetArtefact(tx, project.id, values);

    const existingLink = await tx.traceabilityLink.findFirst({
      where: {
        projectId: project.id,
        sourceType: values.sourceType,
        sourceId: values.sourceId,
        targetType: values.targetType,
        targetId: values.targetId,
        linkType: values.linkType
      },
      select: { id: true }
    });

    if (existingLink) {
      throw createTraceabilityError(DUPLICATE_LINK, "Traceability link already exists");
    }

    try {
      return await tx.traceabilityLink.create({
        data: {
          projectId: project.id,
          sourceType: values.sourceType,
          sourceId: values.sourceId,
          targetType: values.targetType,
          targetId: values.targetId,
          linkType: values.linkType
        },
        select: getTraceabilityLinkSelect()
      });
    } catch (error) {
      if (error.code === "P2002") {
        throw createTraceabilityError(DUPLICATE_LINK, "Traceability link already exists");
      }

      throw error;
    }
  });
}

async function deleteTraceabilityLink(ownerId, projectId, linkId) {
  return prisma.$transaction(async (tx) => {
    const project = await verifyProjectOwnership(tx, ownerId, projectId);

    const link = await tx.traceabilityLink.findFirst({
      where: {
        id: linkId,
        projectId: project.id
      },
      select: { id: true }
    });

    if (!link) {
      throw createTraceabilityError(LINK_NOT_FOUND, "Traceability link not found");
    }

    await tx.traceabilityLink.delete({
      where: { id: link.id }
    });

    return { message: "Traceability link removed" };
  });
}

module.exports = {
  PROJECT_NOT_FOUND,
  SOURCE_NOT_FOUND,
  TARGET_NOT_FOUND,
  LINK_NOT_FOUND,
  DUPLICATE_LINK,
  UNSUPPORTED_LINK_TYPE,
  getTraceabilityLinks,
  getTraceabilityOptions,
  createTraceabilityLink,
  deleteTraceabilityLink
};
