const prisma = require("../utils/prisma");
const {
  PROJECT_NOT_FOUND,
  TEMPLATE_NOT_FOUND,
  PROFILE_MISMATCH,
  DOCUMENT_NOT_FOUND,
  SECTION_NOT_FOUND
} = require("../constants/errorCodes");

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

function calculateSectionStatus(content) {
  if (content === null || content.trim() === "") {
    return "EMPTY";
  }

  return "COMPLETE";
}

function calculateCompletionPercent(sections) {
  if (sections.length === 0) {
    return 0;
  }

  const requiredSections = sections.filter((section) => section.isRequired);
  const sectionsForCompletion = requiredSections.length > 0 ? requiredSections : sections;
  const completedSections = sectionsForCompletion.filter(
    (section) => section.status === "COMPLETE"
  );

  return Math.round((completedSections.length / sectionsForCompletion.length) * 100);
}

function calculateDocumentStatus(completionPercent) {
  if (completionPercent === 0) {
    return "DRAFT";
  }

  if (completionPercent === 100) {
    return "COMPLETE";
  }

  return "IN_PROGRESS";
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

async function getDocumentById(ownerId, projectId, documentId) {
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      projectId,
      project: {
        ownerId
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

  if (!document) {
    throw createDocumentError(DOCUMENT_NOT_FOUND, "Document not found");
  }

  return document;
}

async function updateDocumentSection(ownerId, projectId, documentId, sectionId, values) {
  return prisma.$transaction(async (tx) => {
    const document = await tx.document.findFirst({
      where: {
        id: documentId,
        projectId,
        project: {
          ownerId
        }
      },
      select: {
        id: true
      }
    });

    if (!document) {
      throw createDocumentError(DOCUMENT_NOT_FOUND, "Document not found");
    }

    const existingSection = await tx.documentSection.findFirst({
      where: {
        id: sectionId,
        documentId: document.id
      },
      select: {
        id: true
      }
    });

    if (!existingSection) {
      throw createDocumentError(SECTION_NOT_FOUND, "Section not found");
    }

    const sectionStatus = calculateSectionStatus(values.content);
    const updatedSection = await tx.documentSection.update({
      where: { id: existingSection.id },
      data: {
        content: values.content,
        status: sectionStatus
      },
      select: {
        id: true,
        documentId: true,
        sectionNumber: true,
        title: true,
        content: true,
        status: true,
        updatedAt: true
      }
    });

    const sections = await tx.documentSection.findMany({
      where: { documentId: document.id },
      select: {
        isRequired: true,
        status: true
      }
    });

    const completionPercent = calculateCompletionPercent(sections);
    const documentStatus = calculateDocumentStatus(completionPercent);
    const updatedDocument = await tx.document.update({
      where: { id: document.id },
      data: {
        completionPercent,
        status: documentStatus
      },
      select: {
        id: true,
        status: true,
        completionPercent: true,
        updatedAt: true
      }
    });

    return {
      section: updatedSection,
      document: updatedDocument
    };
  });
}

async function getSectionLinkedArtefacts(ownerId, projectId, documentId, sectionId) {
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      projectId,
      project: { ownerId }
    },
    select: { id: true }
  });

  if (!document) {
    throw createDocumentError(DOCUMENT_NOT_FOUND, "Document not found");
  }

  const section = await prisma.documentSection.findFirst({
    where: {
      id: sectionId,
      documentId: document.id
    },
    select: { id: true }
  });

  if (!section) {
    throw createDocumentError(SECTION_NOT_FOUND, "Section not found");
  }

  const links = await prisma.traceabilityLink.findMany({
    where: {
      projectId,
      targetType: "DOCUMENT_SECTION",
      targetId: sectionId
    }
  });

  const reqIds = links.filter((l) => l.sourceType === "REQUIREMENT").map((l) => l.sourceId);
  const ucIds = links.filter((l) => l.sourceType === "USE_CASE").map((l) => l.sourceId);

  const requirements =
    reqIds.length > 0
      ? await prisma.requirement.findMany({
          where: { id: { in: reqIds } },
          select: { id: true, code: true, type: true, title: true, status: true }
        })
      : [];

  const useCases =
    ucIds.length > 0
      ? await prisma.useCase.findMany({
          where: { id: { in: ucIds } },
          select: { id: true, code: true, title: true, description: true }
        })
      : [];

  const formattedRequirements = requirements.map((r) => {
    const link = links.find((l) => l.sourceId === r.id);
    return { ...r, linkType: link ? link.linkType : null };
  });

  const formattedUseCases = useCases.map((u) => {
    const link = links.find((l) => l.sourceId === u.id);
    return { ...u, linkType: link ? link.linkType : null };
  });

  return {
    linkedArtefacts: {
      requirements: formattedRequirements,
      useCases: formattedUseCases,
      summary: {
        requirementCount: formattedRequirements.length,
        useCaseCount: formattedUseCases.length,
        hasLinks: formattedRequirements.length > 0 || formattedUseCases.length > 0
      }
    }
  };
}

module.exports = {
  PROJECT_NOT_FOUND,
  TEMPLATE_NOT_FOUND,
  PROFILE_MISMATCH,
  DOCUMENT_NOT_FOUND,
  SECTION_NOT_FOUND,
  calculateCompletionPercent,
  createDocumentFromTemplate,
  getDocumentById,
  updateDocumentSection,
  getSectionLinkedArtefacts
};
