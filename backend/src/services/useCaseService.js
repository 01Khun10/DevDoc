const prisma = require("../utils/prisma");
const { getNextCode, createWithCodeRetry } = require("../utils/nextCode");
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

async function createUseCase(ownerId, projectId, values) {
  return createWithCodeRetry(() =>
    prisma.$transaction(async (tx) => {
      const project = await verifyProjectOwnership(tx, ownerId, projectId);

      const existingUseCases = await tx.useCase.findMany({
        where: { projectId: project.id },
        select: { code: true }
      });
      const code = getNextCode(
        "UC",
        existingUseCases.map((useCase) => useCase.code)
      );

      return tx.useCase.create({
        data: {
          projectId: project.id,
          code,
          title: values.title,
          description: values.description
        },
        select: getUseCaseSelect()
      });
    })
  );
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

async function deleteUseCase(ownerId, projectId, useCaseId) {
  const existingUseCase = await prisma.useCase.findFirst({
    where: {
      id: useCaseId,
      projectId,
      project: { ownerId }
    },
    select: { id: true }
  });

  if (!existingUseCase) {
    throw createUseCaseError(USE_CASE_NOT_FOUND, "Use case not found");
  }

  await prisma.$transaction([
    // Traceability links are polymorphic (no FK), so clean them up explicitly.
    prisma.traceabilityLink.deleteMany({
      where: {
        projectId,
        OR: [
          { sourceType: "USE_CASE", sourceId: existingUseCase.id },
          { targetType: "USE_CASE", targetId: existingUseCase.id }
        ]
      }
    }),
    prisma.useCase.delete({ where: { id: existingUseCase.id } })
  ]);

  return { message: "Use case removed" };
}

module.exports = {
  PROJECT_NOT_FOUND,
  USE_CASE_NOT_FOUND,
  createUseCase,
  getUseCases,
  getUseCaseById,
  updateUseCase,
  deleteUseCase
};
