const prisma = require("../utils/prisma");
const { getNextCode, createWithCodeRetry } = require("../utils/nextCode");
const { PROJECT_NOT_FOUND, TEST_CASE_NOT_FOUND } = require("../constants/errorCodes");

const CODE_PREFIX = "TC";

function createTestCaseError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function getTestCaseSelect() {
  return {
    id: true,
    projectId: true,
    code: true,
    title: true,
    description: true,
    expectedResult: true,
    status: true,
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
    throw createTestCaseError(PROJECT_NOT_FOUND, "Project not found");
  }

  return project;
}

async function createTestCase(ownerId, projectId, values) {
  return createWithCodeRetry(() =>
    prisma.$transaction(async (tx) => {
      const project = await verifyProjectOwnership(tx, ownerId, projectId);

      const existingTestCases = await tx.testCase.findMany({
        where: { projectId: project.id },
        select: { code: true }
      });
      const code = getNextCode(
        CODE_PREFIX,
        existingTestCases.map((testCase) => testCase.code)
      );

      return tx.testCase.create({
        data: {
          projectId: project.id,
          code,
          title: values.title,
          description: values.description,
          expectedResult: values.expectedResult,
          status: values.status
        },
        select: getTestCaseSelect()
      });
    })
  );
}

async function getTestCases(ownerId, projectId) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId
    },
    select: { id: true }
  });

  if (!project) {
    throw createTestCaseError(PROJECT_NOT_FOUND, "Project not found");
  }

  return prisma.testCase.findMany({
    where: { projectId: project.id },
    orderBy: { code: "asc" },
    select: getTestCaseSelect()
  });
}

async function getTestCaseById(ownerId, projectId, testCaseId) {
  const testCase = await prisma.testCase.findFirst({
    where: {
      id: testCaseId,
      projectId,
      project: {
        ownerId
      }
    },
    select: getTestCaseSelect()
  });

  if (!testCase) {
    throw createTestCaseError(TEST_CASE_NOT_FOUND, "Test case not found");
  }

  return testCase;
}

async function updateTestCase(ownerId, projectId, testCaseId, values) {
  const existingTestCase = await prisma.testCase.findFirst({
    where: {
      id: testCaseId,
      projectId,
      project: {
        ownerId
      }
    },
    select: { id: true }
  });

  if (!existingTestCase) {
    throw createTestCaseError(TEST_CASE_NOT_FOUND, "Test case not found");
  }

  if (Object.keys(values).length === 0) {
    return getTestCaseById(ownerId, projectId, testCaseId);
  }

  return prisma.testCase.update({
    where: { id: existingTestCase.id },
    data: values,
    select: getTestCaseSelect()
  });
}

async function deleteTestCase(ownerId, projectId, testCaseId) {
  const existingTestCase = await prisma.testCase.findFirst({
    where: {
      id: testCaseId,
      projectId,
      project: {
        ownerId
      }
    },
    select: { id: true }
  });

  if (!existingTestCase) {
    throw createTestCaseError(TEST_CASE_NOT_FOUND, "Test case not found");
  }

  await prisma.testCase.delete({
    where: { id: existingTestCase.id }
  });

  return { message: "Test case removed" };
}

module.exports = {
  PROJECT_NOT_FOUND,
  TEST_CASE_NOT_FOUND,
  createTestCase,
  getTestCases,
  getTestCaseById,
  updateTestCase,
  deleteTestCase
};
