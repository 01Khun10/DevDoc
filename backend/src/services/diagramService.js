const prisma = require("../utils/prisma");
const { PROJECT_NOT_FOUND } = require("../constants/errorCodes");

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
  if (type === "DESIGN_ELEMENT") {
    return code ? code.replace(/[^a-zA-Z0-9_]/g, "_") : `DE_${index}`;
  }
  if (type === "TEST_CASE") {
    return code ? code.replace(/[^a-zA-Z0-9_]/g, "_") : `TC_${index}`;
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

    const designElements = await tx.designElement.findMany({
      where: { projectId: project.id },
      orderBy: { code: "asc" }
    });

    const testCases = await tx.testCase.findMany({
      where: { projectId: project.id },
      orderBy: { code: "asc" }
    });

    const links = await tx.traceabilityLink.findMany({
      where: { projectId: project.id }
    });

    let plantUml = "@startuml\nleft to right direction\nskinparam shadowing false\nskinparam packageStyle rectangle\n\n";

    if (
      useCases.length === 0 &&
      requirements.length === 0 &&
      documentSections.length === 0 &&
      designElements.length === 0 &&
      testCases.length === 0
    ) {
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
          designElementCount: 0,
          testCaseCount: 0,
          linkCount: 0
        }
      };
    }

    // Maps for aliases
    const ucAliases = new Map();
    const reqAliases = new Map();
    const secAliases = new Map();
    const deAliases = new Map();
    const tcAliases = new Map();

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

    if (designElements.length > 0) {
      plantUml += "package \"Design Elements\" {\n";
      designElements.forEach((de, idx) => {
        const alias = generateSafeAlias("DESIGN_ELEMENT", de.id, de.code, idx);
        deAliases.set(de.id, alias);
        const label = escapeLabel(`${de.code}\\n${de.title}`);
        plantUml += `  rectangle "${label}" as ${alias}\n`;
      });
      plantUml += "}\n\n";
    }

    if (testCases.length > 0) {
      plantUml += "package \"Test Cases\" {\n";
      testCases.forEach((tc, idx) => {
        const alias = generateSafeAlias("TEST_CASE", tc.id, tc.code, idx);
        tcAliases.set(tc.id, alias);
        const label = escapeLabel(`${tc.code}\\n${tc.title}`);
        plantUml += `  rectangle "${label}" as ${alias}\n`;
      });
      plantUml += "}\n\n";
    }

    const getAlias = (type, id) => {
      if (type === "USE_CASE") return ucAliases.get(id);
      if (type === "REQUIREMENT") return reqAliases.get(id);
      if (type === "DOCUMENT_SECTION") return secAliases.get(id);
      if (type === "DESIGN_ELEMENT") return deAliases.get(id);
      if (type === "TEST_CASE") return tcAliases.get(id);
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
        designElementCount: designElements.length,
        testCaseCount: testCases.length,
        linkCount: links.length
      }
    };
  });
}

async function requireProject(tx, ownerId, projectId) {
  const project = await tx.project.findFirst({
    where: { id: projectId, ownerId },
    select: { id: true }
  });

  if (!project) {
    throw createDiagramError(PROJECT_NOT_FOUND, "Project not found");
  }

  return project;
}

async function generateUseCasePlantUml(ownerId, projectId) {
  return prisma.$transaction(async (tx) => {
    const project = await requireProject(tx, ownerId, projectId);

    const useCases = await tx.useCase.findMany({
      where: { projectId: project.id },
      orderBy: { code: "asc" }
    });

    const boLinks = await tx.traceabilityLink.findMany({
      where: {
        projectId: project.id,
        sourceType: "BUSINESS_OBJECTIVE",
        targetType: "USE_CASE",
        linkType: "initiates"
      }
    });

    let plantUml = "@startuml\nleft to right direction\nskinparam shadowing false\n\n";
    plantUml += "actor \"User\" as user\n";

    const initiatedUcIds = new Set(boLinks.map((link) => link.targetId));
    const hasStakeholder = initiatedUcIds.size > 0;
    if (hasStakeholder) {
      plantUml += "actor \"Stakeholder\" as stakeholder\n";
    }

    plantUml += "rectangle \"System\" {\n";
    if (useCases.length === 0) {
      plantUml += "  usecase \"No use cases yet\" as EMPTY\n";
    }
    const ucAliases = new Map();
    useCases.forEach((uc, idx) => {
      const alias = generateSafeAlias("USE_CASE", uc.id, uc.code, idx);
      ucAliases.set(uc.id, alias);
      plantUml += `  usecase "${escapeLabel(`${uc.code} ${uc.title}`)}" as ${alias}\n`;
    });
    plantUml += "}\n\n";

    useCases.forEach((uc) => {
      plantUml += `user --> ${ucAliases.get(uc.id)}\n`;
      if (initiatedUcIds.has(uc.id)) {
        plantUml += `stakeholder --> ${ucAliases.get(uc.id)}\n`;
      }
    });

    plantUml += "@enduml\n";

    return {
      type: "USE_CASE",
      format: "PLANTUML",
      title: "Use Case Diagram",
      plantUml,
      summary: {
        useCaseCount: useCases.length,
        actorCount: hasStakeholder ? 2 : 1,
        initiatesLinkCount: boLinks.length
      }
    };
  });
}

async function generateComponentPlantUml(ownerId, projectId) {
  return prisma.$transaction(async (tx) => {
    const project = await requireProject(tx, ownerId, projectId);

    const designElements = await tx.designElement.findMany({
      where: { projectId: project.id },
      orderBy: { code: "asc" }
    });

    const deLinks = await tx.traceabilityLink.findMany({
      where: {
        projectId: project.id,
        sourceType: "DESIGN_ELEMENT",
        targetType: "DESIGN_ELEMENT"
      }
    });

    let plantUml = "@startuml\nskinparam componentStyle rectangle\nskinparam shadowing false\n\n";

    if (designElements.length === 0) {
      plantUml += "note \"No design elements yet\" as NOTE\n@enduml\n";
      return {
        type: "COMPONENT",
        format: "PLANTUML",
        title: "Component Diagram",
        plantUml,
        summary: { designElementCount: 0, linkCount: 0 }
      };
    }

    const deAliases = new Map();
    designElements.forEach((de, idx) => {
      const alias = generateSafeAlias("DESIGN_ELEMENT", de.id, de.code, idx);
      deAliases.set(de.id, alias);
      plantUml += `[${escapeLabel(`${de.code} ${de.title}`)}] as ${alias}\n`;
    });
    plantUml += "\n";

    let drawnLinks = 0;
    deLinks.forEach((link) => {
      const sourceAlias = deAliases.get(link.sourceId);
      const targetAlias = deAliases.get(link.targetId);
      if (sourceAlias && targetAlias) {
        plantUml += `${sourceAlias} --> ${targetAlias} : ${link.linkType}\n`;
        drawnLinks += 1;
      }
    });

    plantUml += "@enduml\n";

    return {
      type: "COMPONENT",
      format: "PLANTUML",
      title: "Component Diagram",
      plantUml,
      summary: { designElementCount: designElements.length, linkCount: drawnLinks }
    };
  });
}

module.exports = {
  PROJECT_NOT_FOUND,
  generateSafeAlias,
  escapeLabel,
  generateTraceabilityTreePlantUml,
  generateUseCasePlantUml,
  generateComponentPlantUml
};
