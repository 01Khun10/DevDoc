const prisma = require("../utils/prisma");
const { getNextCode, createWithCodeRetry } = require("../utils/nextCode");
const { logActivity } = require("../utils/activityLog");
const { PROJECT_NOT_FOUND, DESIGN_ELEMENT_NOT_FOUND } = require("../constants/errorCodes");

const CODE_PREFIX = "DE";

function createDesignElementError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function getDesignElementSelect() {
  return {
    id: true,
    projectId: true,
    code: true,
    title: true,
    description: true,
    elementType: true,
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
    throw createDesignElementError(PROJECT_NOT_FOUND, "Project not found");
  }

  return project;
}

async function createDesignElement(ownerId, projectId, values) {
  return createWithCodeRetry(() =>
    prisma.$transaction(async (tx) => {
      const project = await verifyProjectOwnership(tx, ownerId, projectId);

      const existingElements = await tx.designElement.findMany({
        where: { projectId: project.id },
        select: { code: true }
      });
      const code = getNextCode(
        CODE_PREFIX,
        existingElements.map((element) => element.code)
      );

      const designElement = await tx.designElement.create({
        data: {
          projectId: project.id,
          code,
          title: values.title,
          description: values.description,
          elementType: values.elementType
        },
        select: getDesignElementSelect()
      });

      await logActivity(tx, project.id, {
        action: "CREATED",
        entityType: "DESIGN_ELEMENT",
        entityId: designElement.id,
        metadata: { code: designElement.code, title: designElement.title }
      });

      return designElement;
    })
  );
}

async function getDesignElements(ownerId, projectId) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId
    },
    select: { id: true }
  });

  if (!project) {
    throw createDesignElementError(PROJECT_NOT_FOUND, "Project not found");
  }

  return prisma.designElement.findMany({
    where: { projectId: project.id },
    orderBy: { code: "asc" },
    select: getDesignElementSelect()
  });
}

async function getDesignElementById(ownerId, projectId, designElementId) {
  const designElement = await prisma.designElement.findFirst({
    where: {
      id: designElementId,
      projectId,
      project: {
        ownerId
      }
    },
    select: getDesignElementSelect()
  });

  if (!designElement) {
    throw createDesignElementError(DESIGN_ELEMENT_NOT_FOUND, "Design element not found");
  }

  return designElement;
}

async function updateDesignElement(ownerId, projectId, designElementId, values) {
  const existingElement = await prisma.designElement.findFirst({
    where: {
      id: designElementId,
      projectId,
      project: {
        ownerId
      }
    },
    select: { id: true }
  });

  if (!existingElement) {
    throw createDesignElementError(DESIGN_ELEMENT_NOT_FOUND, "Design element not found");
  }

  if (Object.keys(values).length === 0) {
    return getDesignElementById(ownerId, projectId, designElementId);
  }

  const designElement = await prisma.designElement.update({
    where: { id: existingElement.id },
    data: values,
    select: getDesignElementSelect()
  });

  await logActivity(prisma, projectId, {
    action: "UPDATED",
    entityType: "DESIGN_ELEMENT",
    entityId: designElement.id,
    metadata: { code: designElement.code, title: designElement.title }
  });

  return designElement;
}

async function deleteDesignElement(ownerId, projectId, designElementId) {
  const existingElement = await prisma.designElement.findFirst({
    where: {
      id: designElementId,
      projectId,
      project: {
        ownerId
      }
    },
    select: { id: true, code: true, title: true }
  });

  if (!existingElement) {
    throw createDesignElementError(DESIGN_ELEMENT_NOT_FOUND, "Design element not found");
  }

  await prisma.designElement.delete({
    where: { id: existingElement.id }
  });

  await logActivity(prisma, projectId, {
    action: "DELETED",
    entityType: "DESIGN_ELEMENT",
    entityId: existingElement.id,
    metadata: { code: existingElement.code, title: existingElement.title }
  });

  return { message: "Design element removed" };
}

module.exports = {
  PROJECT_NOT_FOUND,
  DESIGN_ELEMENT_NOT_FOUND,
  createDesignElement,
  getDesignElements,
  getDesignElementById,
  updateDesignElement,
  deleteDesignElement
};
