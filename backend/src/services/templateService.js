const prisma = require("../utils/prisma");
const { PROFILE_NOT_FOUND, TEMPLATE_NOT_FOUND } = require("../constants/errorCodes");

function createTemplateError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

const profileListSelect = {
  id: true,
  name: true,
  code: true,
  description: true,
  audience: true,
  tone: true,
  displayOrder: true
};

const templateListSelect = {
  id: true,
  name: true,
  code: true,
  documentType: true,
  description: true,
  recommendedFor: true,
  displayOrder: true
};

const profileSummarySelect = {
  id: true,
  name: true,
  code: true
};

async function getProfiles() {
  const profiles = await prisma.validationProfile.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
    select: profileListSelect
  });

  return profiles;
}

async function getTemplatesByProfileCode(profileCode) {
  const profile = await prisma.validationProfile.findFirst({
    where: {
      code: profileCode,
      isActive: true
    },
    select: profileSummarySelect
  });

  if (!profile) {
    throw createTemplateError(PROFILE_NOT_FOUND, "Profile not found");
  }

  const templates = await prisma.template.findMany({
    where: {
      profileId: profile.id,
      isActive: true
    },
    orderBy: { displayOrder: "asc" },
    select: templateListSelect
  });

  return { profile, templates };
}

async function getTemplateByCode(templateCode) {
  const template = await prisma.template.findFirst({
    where: {
      code: templateCode,
      isActive: true
    },
    select: {
      ...templateListSelect,
      profile: {
        select: profileSummarySelect
      },
      sections: {
        select: {
          isRequired: true
        }
      }
    }
  });

  if (!template) {
    throw createTemplateError(TEMPLATE_NOT_FOUND, "Template not found");
  }

  const sectionCount = template.sections.length;
  const requiredSectionCount = template.sections.filter((section) => section.isRequired).length;
  const { sections, ...templateSummary } = template;

  return {
    ...templateSummary,
    sectionCount,
    requiredSectionCount
  };
}

async function getTemplateSections(templateCode) {
  const template = await prisma.template.findFirst({
    where: {
      code: templateCode,
      isActive: true
    },
    select: {
      id: true,
      name: true,
      code: true,
      documentType: true,
      sections: {
        orderBy: { displayOrder: "asc" },
        select: {
          id: true,
          sectionNumber: true,
          title: true,
          description: true,
          guidanceText: true,
          exampleText: true,
          placeholderText: true,
          isRequired: true,
          validationTag: true,
          displayOrder: true
        }
      }
    }
  });

  if (!template) {
    throw createTemplateError(TEMPLATE_NOT_FOUND, "Template not found");
  }

  const { sections, ...templateSummary } = template;

  return {
    template: templateSummary,
    sections
  };
}

module.exports = {
  PROFILE_NOT_FOUND,
  TEMPLATE_NOT_FOUND,
  getProfiles,
  getTemplatesByProfileCode,
  getTemplateByCode,
  getTemplateSections
};
