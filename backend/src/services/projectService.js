const prisma = require("../utils/prisma");

const PROJECT_NOT_FOUND = "PROJECT_NOT_FOUND";
const PROFILE_NOT_FOUND = "PROFILE_NOT_FOUND";

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
  if (values.profileId !== undefined && values.profileId !== null) {
      await checkProfileExists(values.profileId);
  }

  if (Object.keys(values).length === 0) {
      // Empty update body is allowed and should return unchanged project
      return getProjectById(ownerId, projectId);
  }

  const { count } = await prisma.project.updateMany({
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
  const updatedProject = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId
    },
    include: profileInclude
  });

  return updatedProject;
}

module.exports = {
  PROJECT_NOT_FOUND,
  PROFILE_NOT_FOUND,
  createProject,
  getProjects,
  getProjectById,
  updateProject
};
