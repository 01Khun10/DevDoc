const prisma = require("../utils/prisma");
const { PROJECT_NOT_FOUND, USE_CASE_NOT_FOUND } = require("../constants/errorCodes");

function createUseCaseError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function getUseCaseSelect() {
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
    throw createUseCaseError(PROJECT_NOT_FOUND, "Project not found");
  }

  return project;
}

function getNextUseCaseCode(existingUseCases) {
  const highestNumber = existingUseCases.reduce((highest, useCase) => {
    const parts = useCase.code.split("-");
    const number = Number(parts[1]);

    if (Number.isInteger(number) && number > highest) {
      return number;
    }

    return highest;
  }, 0);

  return `UC-${String(highestNumber + 1).padStart(3, "0")}`;
}

async function createUseCase(ownerId, projectId, values) {
  return prisma.$transaction(async (tx) => {
    const project = await verifyProjectOwnership(tx, ownerId, projectId);

    const existingUseCases = await tx.useCase.findMany({
      where: { projectId: project.id },
      select: { code: true }
    });
    const code = getNextUseCaseCode(existingUseCases);

    return tx.useCase.create({
      data: {
        projectId: project.id,
        code,
        title: values.title,
        description: values.description
      },
      select: getUseCaseSelect()
    });
  });
}

async function getUseCases(ownerId, projectId) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId
    },
    select: { id: true }
  });

  if (!project) {
    throw createUseCaseError(PROJECT_NOT_FOUND, "Project not found");
  }

  return prisma.useCase.findMany({
    where: { projectId: project.id },
    orderBy: { code: "asc" },
    select: getUseCaseSelect()
  });
}

async function getUseCaseById(ownerId, projectId, useCaseId) {
  const useCase = await prisma.useCase.findFirst({
    where: {
      id: useCaseId,
      projectId,
      project: {
        ownerId
      }
    },
    select: getUseCaseSelect()
  });

  if (!useCase) {
    throw createUseCaseError(USE_CASE_NOT_FOUND, "Use case not found");
  }

  return useCase;
}

async function updateUseCase(ownerId, projectId, useCaseId, values) {
  const existingUseCase = await prisma.useCase.findFirst({
    where: {
      id: useCaseId,
      projectId,
      project: {
        ownerId
      }
    },
    select: { id: true }
  });

  if (!existingUseCase) {
    throw createUseCaseError(USE_CASE_NOT_FOUND, "Use case not found");
  }

  if (Object.keys(values).length === 0) {
    return getUseCaseById(ownerId, projectId, useCaseId);
  }

  return prisma.useCase.update({
    where: { id: existingUseCase.id },
    data: values,
    select: getUseCaseSelect()
  });
}

module.exports = {
  PROJECT_NOT_FOUND,
  USE_CASE_NOT_FOUND,
  createUseCase,
  getUseCases,
  getUseCaseById,
  updateUseCase
};
