const prisma = require("../utils/prisma");
const { getNextCode, createWithCodeRetry } = require("../utils/nextCode");
const {
  PROJECT_NOT_FOUND,
  BUSINESS_OBJECTIVE_NOT_FOUND
} = require("../constants/errorCodes");

function createBusinessObjectiveError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function getBusinessObjectiveSelect() {
  return {
    id: true,
    projectId: true,
    code: true,
    title: true,
    description: true,
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
    throw createBusinessObjectiveError(PROJECT_NOT_FOUND, "Project not found");
  }

  return project;
}

async function listBusinessObjectives(ownerId, projectId) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId
    },
    select: { id: true }
  });

  if (!project) {
    throw createBusinessObjectiveError(PROJECT_NOT_FOUND, "Project not found");
  }

  return prisma.businessObjective.findMany({
    where: { projectId: project.id },
    orderBy: { code: "asc" },
    select: getBusinessObjectiveSelect()
  });
}

async function createBusinessObjective(ownerId, projectId, values) {
  return createWithCodeRetry(() =>
    prisma.$transaction(async (tx) => {
      const project = await verifyProjectOwnership(tx, ownerId, projectId);

      const existingObjectives = await tx.businessObjective.findMany({
        where: { projectId: project.id },
        select: { code: true }
      });
      const code = getNextCode(
        "BO",
        existingObjectives.map((objective) => objective.code)
      );

      return tx.businessObjective.create({
        data: {
          projectId: project.id,
          code,
          title: values.title,
          description: values.description
        },
        select: getBusinessObjectiveSelect()
      });
    })
  );
}

async function getBusinessObjectiveById(ownerId, projectId, objectiveId) {
  const objective = await prisma.businessObjective.findFirst({
    where: {
      id: objectiveId,
      projectId,
      project: {
        ownerId
      }
    },
    select: getBusinessObjectiveSelect()
  });

  if (!objective) {
    throw createBusinessObjectiveError(
      BUSINESS_OBJECTIVE_NOT_FOUND,
      "Business objective not found"
    );
  }

  return objective;
}

async function updateBusinessObjective(ownerId, projectId, objectiveId, values) {
  const existingObjective = await prisma.businessObjective.findFirst({
    where: {
      id: objectiveId,
      projectId,
      project: {
        ownerId
      }
    },
    select: { id: true }
  });

  if (!existingObjective) {
    throw createBusinessObjectiveError(
      BUSINESS_OBJECTIVE_NOT_FOUND,
      "Business objective not found"
    );
  }

  if (Object.keys(values).length === 0) {
    return getBusinessObjectiveById(ownerId, projectId, objectiveId);
  }

  return prisma.businessObjective.update({
    where: { id: existingObjective.id },
    data: values,
    select: getBusinessObjectiveSelect()
  });
}

async function deleteBusinessObjective(ownerId, projectId, objectiveId) {
  const existingObjective = await prisma.businessObjective.findFirst({
    where: {
      id: objectiveId,
      projectId,
      project: {
        ownerId
      }
    },
    select: { id: true }
  });

  if (!existingObjective) {
    throw createBusinessObjectiveError(
      BUSINESS_OBJECTIVE_NOT_FOUND,
      "Business objective not found"
    );
  }

  await prisma.businessObjective.delete({
    where: { id: existingObjective.id }
  });

  return { message: "Business objective removed" };
}

module.exports = {
  PROJECT_NOT_FOUND,
  BUSINESS_OBJECTIVE_NOT_FOUND,
  listBusinessObjectives,
  createBusinessObjective,
  getBusinessObjectiveById,
  updateBusinessObjective,
  deleteBusinessObjective
};
