const prisma = require("../utils/prisma");

const PROJECT_NOT_FOUND = "PROJECT_NOT_FOUND";
const REQUIREMENT_NOT_FOUND = "REQUIREMENT_NOT_FOUND";

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

function getNextRequirementCode(type, existingRequirements) {
  const highestNumber = existingRequirements.reduce((highest, requirement) => {
    const parts = requirement.code.split("-");
    const number = Number(parts[1]);

    if (Number.isInteger(number) && number > highest) {
      return number;
    }

    return highest;
  }, 0);

  return `${type}-${String(highestNumber + 1).padStart(3, "0")}`;
}

async function createRequirement(ownerId, projectId, values) {
  return prisma.$transaction(async (tx) => {
    const project = await verifyProjectOwnership(tx, ownerId, projectId);

    const existingRequirements = await tx.requirement.findMany({
      where: {
        projectId: project.id,
        type: values.type
      },
      select: { code: true }
    });
    const code = getNextRequirementCode(values.type, existingRequirements);

    return tx.requirement.create({
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
  });
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

  return prisma.requirement.update({
    where: { id: existingRequirement.id },
    data: values,
    select: getRequirementSelect()
  });
}

module.exports = {
  PROJECT_NOT_FOUND,
  REQUIREMENT_NOT_FOUND,
  createRequirement,
  getRequirements,
  getRequirementById,
  updateRequirement
};
