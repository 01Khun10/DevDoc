const crypto = require("crypto");
const prisma = require("../utils/prisma");
const { PROJECT_NOT_FOUND } = require("../constants/errorCodes");

const SHARE_TOKEN_NOT_FOUND = "SHARE_TOKEN_NOT_FOUND";

function createShareError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

// Owner-only: mint (or reuse) a read-only share token for the project.
async function createShareToken(ownerId, projectId, requestedExpiresAt) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId },
    select: { id: true }
  });
  if (!project) throw createShareError(PROJECT_NOT_FOUND, "Project not found");

  const now = new Date();
  const hasRequestedExpiry = requestedExpiresAt !== undefined;
  if (hasRequestedExpiry && typeof requestedExpiresAt !== "string") {
    throw createShareError("INVALID_EXPIRY", "Expiry must be an ISO date string");
  }
  const expiresAt = hasRequestedExpiry ? new Date(requestedExpiresAt) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  if (Number.isNaN(expiresAt.getTime()) || expiresAt <= now) {
    throw createShareError("INVALID_EXPIRY", "Expiry must be a future date");
  }
  if (expiresAt > new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)) {
    throw createShareError("INVALID_EXPIRY", "Expiry cannot be more than 365 days away");
  }

  const existing = hasRequestedExpiry ? null : await prisma.shareToken.findFirst({
    where: { projectId: project.id, expiresAt: { gt: now } },
    orderBy: { expiresAt: "desc" },
    select: { token: true, expiresAt: true }
  });
  if (existing) return existing;

  return prisma.shareToken.create({
    data: {
      projectId: project.id,
      token: crypto.randomBytes(24).toString("base64url"),
      expiresAt
    },
    select: { token: true, expiresAt: true }
  });
}

// Public, read-only: project summary, latest completed validation run, and
// the artefacts + links needed to render the traceability graph.
async function getSharedReport(token) {
  const shareToken = await prisma.shareToken.findUnique({
    where: { token },
    select: { projectId: true, expiresAt: true }
  });
  if (!shareToken || shareToken.expiresAt <= new Date()) {
    throw createShareError(SHARE_TOKEN_NOT_FOUND, "Share link not found or expired");
  }

  const projectId = shareToken.projectId;
  const [project, latestRun, useCases, requirements, documentSections, designElements, testCases, links] =
    await Promise.all([
      prisma.project.findUnique({
        where: { id: projectId },
        select: { name: true, description: true, updatedAt: true }
      }),
      prisma.validationRun.findFirst({
        where: { projectId, status: "COMPLETED" },
        orderBy: { startedAt: "desc" },
        select: {
          readinessScore: true,
          metrics: true,
          completedAt: true,
          results: {
            select: {
              id: true,
              ruleCode: true,
              severity: true,
              message: true,
              suggestedFix: true,
              targetType: true,
              targetId: true
            }
          }
        }
      }),
      prisma.useCase.findMany({
        where: { projectId },
        orderBy: { code: "asc" },
        select: { id: true, code: true, title: true }
      }),
      prisma.requirement.findMany({
        where: { projectId },
        orderBy: { code: "asc" },
        select: { id: true, code: true, type: true, title: true, status: true }
      }),
      prisma.documentSection.findMany({
        where: { document: { projectId } },
        orderBy: { displayOrder: "asc" },
        select: {
          id: true,
          sectionNumber: true,
          title: true,
          status: true,
          document: { select: { id: true, title: true, documentType: true } }
        }
      }),
      prisma.designElement.findMany({
        where: { projectId },
        orderBy: { code: "asc" },
        select: { id: true, code: true, title: true, elementType: true }
      }),
      prisma.testCase.findMany({
        where: { projectId },
        orderBy: { code: "asc" },
        select: { id: true, code: true, title: true, status: true }
      }),
      prisma.traceabilityLink.findMany({
        where: { projectId },
        select: {
          id: true,
          sourceType: true,
          sourceId: true,
          targetType: true,
          targetId: true,
          linkType: true
        }
      })
    ]);

  if (!project) throw createShareError(SHARE_TOKEN_NOT_FOUND, "Share link not found or expired");

  return {
    project,
    latestRun,
    options: { useCases, requirements, documentSections, designElements, testCases },
    links
  };
}

module.exports = {
  SHARE_TOKEN_NOT_FOUND,
  createShareToken,
  getSharedReport
};
