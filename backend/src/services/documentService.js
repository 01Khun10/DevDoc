const prisma = require("../utils/prisma");

const PROJECT_NOT_FOUND = "PROJECT_NOT_FOUND";
const TEMPLATE_NOT_FOUND = "TEMPLATE_NOT_FOUND";
const PROFILE_MISMATCH = "PROFILE_MISMATCH";

function createDocumentError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function mapTemplateSectionsToDocumentSections(sections) {
  return sections.map((section) => ({
    sectionNumber: section.sectionNumber,
    title: section.title,
    description: section.description,
    guidanceText: section.guidanceText,
    exampleText: section.exampleText,
    placeholderText: section.placeholderText,
    isRequired: section.isRequired,
    validationTag: section.validationTag,
    displayOrder: section.displayOrder
  }));
}

async function createDocumentFromTemplate(ownerId, projectId, values) {
  return prisma.$transaction(async (tx) => {
    const project = await tx.project.findFirst({
      where: {
        id: projectId,
        ownerId
      },
      select: {
        id: true,
        profileId: true
      }
    });

    if (!project) {
      throw createDocumentError(PROJECT_NOT_FOUND, "Project not found");
    }

    const template = await tx.template.findFirst({
      where: {
        code: values.templateCode,
        isActive: true
      },
      select: {
        id: true,
        profileId: true,
        name: true,
        code: true,
        documentType: true,
        sections: {
          orderBy: { displayOrder: "asc" },
          select: {
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
      throw createDocumentError(TEMPLATE_NOT_FOUND, "Template not found");
    }

    if (project.profileId && project.profileId !== template.profileId) {
      throw createDocumentError(PROFILE_MISMATCH, "Template profile does not match this project");
    }

    if (!project.profileId) {
      await tx.project.update({
        where: { id: project.id },
        data: { profileId: template.profileId }
      });
    }

    const document = await tx.document.create({
      data: {
        projectId: project.id,
        templateId: template.id,
        title: values.title || template.name,
        documentType: template.documentType,
        status: "DRAFT",
        completionPercent: 0,
        sections: {
          create: mapTemplateSectionsToDocumentSections(template.sections)
        }
      },
      select: {
        id: true,
        projectId: true,
        templateId: true,
        title: true,
        documentType: true,
        status: true,
        completionPercent: true,
        createdAt: true,
        updatedAt: true,
        template: {
          select: {
            id: true,
            name: true,
            code: true,
            documentType: true
          }
        },
        sections: {
          orderBy: { displayOrder: "asc" },
          select: {
            id: true,
            documentId: true,
            sectionNumber: true,
            title: true,
            description: true,
            guidanceText: true,
            exampleText: true,
            placeholderText: true,
            content: true,
            isRequired: true,
            validationTag: true,
            status: true,
            displayOrder: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });

    return document;
  });
}

module.exports = {
  PROJECT_NOT_FOUND,
  TEMPLATE_NOT_FOUND,
  PROFILE_MISMATCH,
  createDocumentFromTemplate
};
