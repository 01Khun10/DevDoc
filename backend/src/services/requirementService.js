const prisma = require("../utils/prisma");
const { getNextCode, createWithCodeRetry } = require("../utils/nextCode");
const { logActivity } = require("../utils/activityLog");
const {
  PROJECT_NOT_FOUND,
  REQUIREMENT_NOT_FOUND,
  SECTION_NOT_FOUND
} = require("../constants/errorCodes");

function createRequirementError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function getRequirementSelect() {
  return {
    id: true,
    projectId: true,
    code: true,
    type: true,
    title: true,
    description: true,
    priority: true,
    status: true,
    acceptanceCriteria: true,
    createdAt: true,
    updatedAt: true
  };
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
    throw createRequirementError(PROJECT_NOT_FOUND, "Project not found");
  }

  return project;
}

async function createRequirement(ownerId, projectId, values) {
  return createWithCodeRetry(() =>
    prisma.$transaction(async (tx) => {
      const project = await verifyProjectOwnership(tx, ownerId, projectId);

      const existingRequirements = await tx.requirement.findMany({
        where: {
          projectId: project.id,
          type: values.type
        },
        select: { code: true }
      });
      const code = getNextCode(
        values.type,
        existingRequirements.map((requirement) => requirement.code)
      );

      const requirement = await tx.requirement.create({
        data: {
          projectId: project.id,
          code,
          type: values.type,
          title: values.title,
          description: values.description,
          priority: values.priority,
          acceptanceCriteria: values.acceptanceCriteria
        },
        select: getRequirementSelect()
      });

      await logActivity(tx, project.id, {
        action: "CREATED",
        entityType: "REQUIREMENT",
        entityId: requirement.id,
        metadata: { code: requirement.code, title: requirement.title }
      });

      return requirement;
    })
  );
}

// Creates a requirement AND a REQUIREMENT -> DOCUMENT_SECTION described_by
// link in one transaction (inline capture from the document editor).
async function createRequirementFromSection(ownerId, projectId, values) {
  return createWithCodeRetry(() =>
    prisma.$transaction(async (tx) => {
      const project = await verifyProjectOwnership(tx, ownerId, projectId);

      const section = await tx.documentSection.findFirst({
        where: {
          id: values.sectionId,
          document: { projectId: project.id }
        },
        select: { id: true }
      });

      if (!section) {
        throw createRequirementError(SECTION_NOT_FOUND, "Document section not found");
      }

      const existingRequirements = await tx.requirement.findMany({
        where: {
          projectId: project.id,
          type: values.type
        },
        select: { code: true }
      });
      const code = getNextCode(
        values.type,
        existingRequirements.map((requirement) => requirement.code)
      );

      const requirement = await tx.requirement.create({
        data: {
          projectId: project.id,
          code,
          type: values.type,
          title: values.title,
          priority: values.priority
        },
        select: getRequirementSelect()
      });

      await tx.traceabilityLink.create({
        data: {
          projectId: project.id,
          sourceType: "REQUIREMENT",
          sourceId: requirement.id,
          targetType: "DOCUMENT_SECTION",
          targetId: section.id,
          linkType: "described_by"
        }
      });

      await logActivity(tx, project.id, {
        action: "CREATED",
        entityType: "REQUIREMENT",
        entityId: requirement.id,
        metadata: { code: requirement.code, title: requirement.title }
      });

      return requirement;
    })
  );
}

async function getRequirements(ownerId, projectId) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId
    },
    select: { id: true }
  });

  if (!project) {
    throw createRequirementError(PROJECT_NOT_FOUND, "Project not found");
  }

  return prisma.requirement.findMany({
    where: { projectId: project.id },
    orderBy: { code: "asc" },
    select: getRequirementSelect()
  });
}

async function getRequirementById(ownerId, projectId, requirementId) {
  const requirement = await prisma.requirement.findFirst({
    where: {
      id: requirementId,
      projectId,
      project: {
        ownerId
      }
    },
    select: getRequirementSelect()
  });

  if (!requirement) {
    throw createRequirementError(REQUIREMENT_NOT_FOUND, "Requirement not found");
  }

  return requirement;
}

async function updateRequirement(ownerId, projectId, requirementId, values) {
  const existingRequirement = await prisma.requirement.findFirst({
    where: {
      id: requirementId,
      projectId,
      project: {
        ownerId
      }
    },
    select: { id: true }
  });

  if (!existingRequirement) {
    throw createRequirementError(REQUIREMENT_NOT_FOUND, "Requirement not found");
  }

  if (Object.keys(values).length === 0) {
    return getRequirementById(ownerId, projectId, requirementId);
  }

  const requirement = await prisma.requirement.update({
    where: { id: existingRequirement.id },
    data: values,
    select: getRequirementSelect()
  });

  await logActivity(prisma, projectId, {
    action: "UPDATED",
    entityType: "REQUIREMENT",
    entityId: requirement.id,
    metadata: { code: requirement.code, title: requirement.title }
  });

  return requirement;
}

async function deleteRequirement(ownerId, projectId, requirementId) {
  const existingRequirement = await prisma.requirement.findFirst({
    where: {
      id: requirementId,
      projectId,
      project: { ownerId }
    },
    select: { id: true, code: true, title: true }
  });

  if (!existingRequirement) {
    throw createRequirementError(REQUIREMENT_NOT_FOUND, "Requirement not found");
  }

  await prisma.$transaction([
    // Traceability links are polymorphic (no FK), so clean them up explicitly.
    prisma.traceabilityLink.deleteMany({
      where: {
        projectId,
        OR: [
          { sourceType: "REQUIREMENT", sourceId: existingRequirement.id },
          { targetType: "REQUIREMENT", targetId: existingRequirement.id }
        ]
      }
    }),
    prisma.requirement.delete({ where: { id: existingRequirement.id } })
  ]);

  await logActivity(prisma, projectId, {
    action: "DELETED",
    entityType: "REQUIREMENT",
    entityId: existingRequirement.id,
    metadata: { code: existingRequirement.code, title: existingRequirement.title }
  });

  return { message: "Requirement removed" };
}

module.exports = {
  PROJECT_NOT_FOUND,
  REQUIREMENT_NOT_FOUND,
  SECTION_NOT_FOUND,
  createRequirement,
  createRequirementFromSection,
  getRequirements,
  getRequirementById,
  updateRequirement,
  deleteRequirement
};
