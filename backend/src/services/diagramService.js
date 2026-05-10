const prisma = require("../utils/prisma");

const PROJECT_NOT_FOUND = "PROJECT_NOT_FOUND";

function createDiagramError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function generateSafeAlias(type, id, code, index) {
  if (type === "USE_CASE") {
    return code ? code.replace(/[^a-zA-Z0-9_]/g, "_") : `UC_${index}`;
  }
  if (type === "REQUIREMENT") {
    return code ? code.replace(/[^a-zA-Z0-9_]/g, "_") : `REQ_${index}`;
  }
  if (type === "DOCUMENT_SECTION") {
    return `SEC_${index}`;
  }
  return `NODE_${index}`;
}

function escapeLabel(text) {
  if (!text) return "";
  // Escape quotes, and replace newlines with \n for PlantUML
  return text.replace(/"/g, "'").replace(/\r?\n/g, "\\n");
}

async function generateTraceabilityTreePlantUml(ownerId, projectId) {
  return prisma.$transaction(async (tx) => {
    const project = await tx.project.findFirst({
      where: {
        id: projectId,
        ownerId
      },
      select: { id: true }
    });

    if (!project) {
      throw createDiagramError(PROJECT_NOT_FOUND, "Project not found");
    }

    const useCases = await tx.useCase.findMany({
      where: { projectId: project.id },
      orderBy: { code: "asc" }
    });

    const requirements = await tx.requirement.findMany({
      where: { projectId: project.id },
      orderBy: { code: "asc" }
    });

    const documentSections = await tx.documentSection.findMany({
      where: {
        document: {
          projectId: project.id
        }
      },
      include: {
        document: {
          select: { title: true }
        }
      },
      orderBy: [
        { document: { title: "asc" } },
        { displayOrder: "asc" }
      ]
    });

    const links = await tx.traceabilityLink.findMany({
      where: { projectId: project.id }
    });

    let plantUml = "@startuml\nleft to right direction\nskinparam shadowing false\nskinparam packageStyle rectangle\n\n";

    if (useCases.length === 0 && requirements.length === 0 && documentSections.length === 0) {
      plantUml += "rectangle \"No traceability data yet\" as EMPTY\n";
      plantUml += "@enduml\n";
      return {
        type: "TRACEABILITY_TREE",
        format: "PLANTUML",
        title: "Traceability Tree",
        plantUml,
        summary: {
          useCaseCount: 0,
          requirementCount: 0,
          documentSectionCount: 0,
          linkCount: 0
        }
      };
    }

    // Maps for aliases
    const ucAliases = new Map();
    const reqAliases = new Map();
    const secAliases = new Map();

    if (useCases.length > 0) {
      plantUml += "package \"Use Cases\" {\n";
      useCases.forEach((uc, idx) => {
        const alias = generateSafeAlias("USE_CASE", uc.id, uc.code, idx);
        ucAliases.set(uc.id, alias);
        const label = escapeLabel(`${uc.code}\\n${uc.title}`);
        plantUml += `  rectangle "${label}" as ${alias}\n`;
      });
      plantUml += "}\n\n";
    }

    if (requirements.length > 0) {
      plantUml += "package \"Requirements\" {\n";
      requirements.forEach((req, idx) => {
        const alias = generateSafeAlias("REQUIREMENT", req.id, req.code, idx);
        reqAliases.set(req.id, alias);
        const label = escapeLabel(`${req.code}\\n${req.title}`);
        plantUml += `  rectangle "${label}" as ${alias}\n`;
      });
      plantUml += "}\n\n";
    }

    if (documentSections.length > 0) {
      plantUml += "package \"Document Sections\" {\n";
      documentSections.forEach((sec, idx) => {
        const alias = generateSafeAlias("DOCUMENT_SECTION", sec.id, null, idx);
        secAliases.set(sec.id, alias);
        const label = escapeLabel(`${sec.document.title}\\nSection ${sec.sectionNumber}\\n${sec.title}`);
        plantUml += `  rectangle "${label}" as ${alias}\n`;
      });
      plantUml += "}\n\n";
    }

    const getAlias = (type, id) => {
      if (type === "USE_CASE") return ucAliases.get(id);
      if (type === "REQUIREMENT") return reqAliases.get(id);
      if (type === "DOCUMENT_SECTION") return secAliases.get(id);
      return null;
    };

    if (links.length > 0) {
      links.forEach((link) => {
        const sourceAlias = getAlias(link.sourceType, link.sourceId);
        const targetAlias = getAlias(link.targetType, link.targetId);
        if (sourceAlias && targetAlias) {
          plantUml += `${sourceAlias} --> ${targetAlias} : ${link.linkType}\n`;
        }
      });
      plantUml += "\n";
    }

    plantUml += "@enduml\n";

    return {
      type: "TRACEABILITY_TREE",
      format: "PLANTUML",
      title: "Traceability Tree",
      plantUml,
      summary: {
        useCaseCount: useCases.length,
        requirementCount: requirements.length,
        documentSectionCount: documentSections.length,
        linkCount: links.length
      }
    };
  });
}

module.exports = {
  PROJECT_NOT_FOUND,
  generateTraceabilityTreePlantUml
};
