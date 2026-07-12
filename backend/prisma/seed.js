const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { profiles, templates, validationRules } = require("../src/data/templates");

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@devdoc.local";
const DEMO_PASSWORD = "demo1234";
const DEMO_PROJECT_NAME = "Demo — Library Portal";

async function seedProfiles() {
  for (const profile of profiles) {
    await prisma.validationProfile.upsert({
      where: { code: profile.code },
      update: {
        name: profile.name,
        description: profile.description,
        audience: profile.audience,
        tone: profile.tone,
        displayOrder: profile.displayOrder,
        isActive: true
      },
      create: {
        name: profile.name,
        code: profile.code,
        description: profile.description,
        audience: profile.audience,
        tone: profile.tone,
        displayOrder: profile.displayOrder,
        isActive: true
      }
    });
  }
}

async function seedTemplatesAndSections() {
  for (const template of templates) {
    const profile = await prisma.validationProfile.findUnique({
      where: { code: template.profileCode }
    });

    if (!profile) {
      throw new Error(`Missing profile for template ${template.code}: ${template.profileCode}`);
    }

    const savedTemplate = await prisma.template.upsert({
      where: { code: template.code },
      update: {
        profileId: profile.id,
        name: template.name,
        documentType: template.documentType,
        description: template.description,
        recommendedFor: template.recommendedFor,
        displayOrder: template.displayOrder,
        isActive: true
      },
      create: {
        profileId: profile.id,
        name: template.name,
        code: template.code,
        documentType: template.documentType,
        description: template.description,
        recommendedFor: template.recommendedFor,
        displayOrder: template.displayOrder,
        isActive: true
      }
    });

    for (const templateSection of template.sections) {
      await prisma.templateSection.upsert({
        where: {
          templateId_sectionNumber: {
            templateId: savedTemplate.id,
            sectionNumber: templateSection.sectionNumber
          }
        },
        update: {
          title: templateSection.title,
          description: templateSection.description,
          guidanceText: templateSection.guidanceText,
          exampleText: templateSection.exampleText,
          placeholderText: templateSection.placeholderText,
          isRequired: templateSection.isRequired,
          validationTag: templateSection.validationTag,
          displayOrder: templateSection.displayOrder,
          parentSectionId: null
        },
        create: {
          templateId: savedTemplate.id,
          sectionNumber: templateSection.sectionNumber,
          title: templateSection.title,
          description: templateSection.description,
          guidanceText: templateSection.guidanceText,
          exampleText: templateSection.exampleText,
          placeholderText: templateSection.placeholderText,
          isRequired: templateSection.isRequired,
          validationTag: templateSection.validationTag,
          displayOrder: templateSection.displayOrder,
          parentSectionId: null
        }
      });
    }
  }
}

async function seedValidationRules() {
  for (const rule of validationRules) {
    const profile = await prisma.validationProfile.findUnique({
      where: { code: rule.profileCode }
    });

    if (!profile) {
      throw new Error(`Missing profile for validation rule ${rule.ruleCode}: ${rule.profileCode}`);
    }

    const template = rule.templateCode
      ? await prisma.template.findUnique({ where: { code: rule.templateCode } })
      : null;

    await prisma.validationRule.upsert({
      where: {
        profileId_ruleCode: {
          profileId: profile.id,
          ruleCode: rule.ruleCode
        }
      },
      update: {
        profileId: profile.id,
        templateId: template ? template.id : null,
        ruleName: rule.ruleName,
        ruleCategory: rule.ruleCategory,
        severity: rule.severity,
        checkKey: rule.checkKey,
        message: rule.message,
        suggestedFix: rule.suggestedFix,
        isActive: rule.isActive !== false
      },
      create: {
        profileId: profile.id,
        templateId: template ? template.id : null,
        ruleCode: rule.ruleCode,
        ruleName: rule.ruleName,
        ruleCategory: rule.ruleCategory,
        severity: rule.severity,
        checkKey: rule.checkKey,
        message: rule.message,
        suggestedFix: rule.suggestedFix,
        isActive: rule.isActive !== false
      }
    });
  }
}

// Optional SEED_DEMO=true path: a small fully-linked sample project owned by
// the demo user, hitting 100 readiness (all required sections complete, every
// requirement traced, every FR covered + implemented + verified).
async function seedDemoProject() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const demoUser = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: { name: "Demo User", email: DEMO_EMAIL, passwordHash }
  });

  // Recreate for a deterministic state on every seed run.
  await prisma.project.deleteMany({
    where: { ownerId: demoUser.id, name: DEMO_PROJECT_NAME }
  });

  const template = await prisma.template.findFirst({
    where: { isActive: true, documentType: "SRS" },
    orderBy: { displayOrder: "asc" },
    include: { sections: { orderBy: { displayOrder: "asc" } } }
  });
  if (!template) throw new Error("Demo seed requires a seeded SRS template");

  const project = await prisma.project.create({
    data: {
      ownerId: demoUser.id,
      profileId: template.profileId,
      name: DEMO_PROJECT_NAME,
      description:
        "Sample project showing a fully documented and traced library portal at 100 readiness."
    }
  });

  const document = await prisma.document.create({
    data: {
      projectId: project.id,
      templateId: template.id,
      title: `${DEMO_PROJECT_NAME} — SRS`,
      documentType: template.documentType,
      status: "COMPLETE",
      completionPercent: 100,
      sections: {
        create: template.sections.map((section) => ({
          sectionNumber: section.sectionNumber,
          title: section.title,
          description: section.description,
          guidanceText: section.guidanceText,
          exampleText: section.exampleText,
          placeholderText: section.placeholderText,
          isRequired: section.isRequired,
          validationTag: section.validationTag,
          displayOrder: section.displayOrder,
          status: "COMPLETE",
          content: `The library portal ${section.title.toLowerCase()} covers member registration, catalog search, and book loans. Members search the catalog, borrow available books, and receive return reminders by email.`
        }))
      }
    },
    include: { sections: { orderBy: { displayOrder: "asc" } } }
  });
  const firstSection = document.sections[0];

  const [ucSearch, ucBorrow] = await Promise.all([
    prisma.useCase.create({
      data: {
        projectId: project.id,
        code: "UC-001",
        title: "Search the catalog",
        description: "A member searches the book catalog by title, author, or ISBN and views availability."
      }
    }),
    prisma.useCase.create({
      data: {
        projectId: project.id,
        code: "UC-002",
        title: "Borrow a book",
        description: "A member borrows an available book; the loan is recorded and a due date is assigned."
      }
    })
  ]);

  const [frSearch, frBorrow, nfrPerformance] = await Promise.all([
    prisma.requirement.create({
      data: {
        projectId: project.id,
        code: "FR-001",
        type: "FR",
        title: "Catalog search",
        description: "The system shall let members search the catalog by title, author, or ISBN.",
        priority: "HIGH",
        status: "VERIFIED",
        acceptanceCriteria: "Given a catalog with 1000 books, a title search returns matching results with availability status."
      }
    }),
    prisma.requirement.create({
      data: {
        projectId: project.id,
        code: "FR-002",
        type: "FR",
        title: "Book loan checkout",
        description: "The system shall record a loan with a 14-day due date when a member borrows an available book.",
        priority: "HIGH",
        status: "VERIFIED",
        acceptanceCriteria: "Given an available book, checkout creates a loan record and sets the due date 14 days ahead."
      }
    }),
    prisma.requirement.create({
      data: {
        projectId: project.id,
        code: "NFR-001",
        type: "NFR",
        title: "Search response time",
        description: "Catalog search results shall be returned within 2 seconds at the 95th percentile.",
        priority: "MEDIUM",
        status: "APPROVED",
        acceptanceCriteria: "Load test with 100 concurrent members keeps p95 search latency under 2 seconds."
      }
    })
  ]);

  const designElement = await prisma.designElement.create({
    data: {
      projectId: project.id,
      code: "DE-001",
      title: "Catalog and loan service",
      description: "Backend service handling catalog search queries and loan checkout transactions.",
      elementType: "SERVICE"
    }
  });

  const testCase = await prisma.testCase.create({
    data: {
      projectId: project.id,
      code: "TC-001",
      title: "Search and borrow flow",
      description: "Search for a book by title, open it, and complete a checkout as a member.",
      expectedResult: "The book appears in search results and the loan is recorded with a 14-day due date.",
      status: "PASSED"
    }
  });

  const link = (sourceType, sourceId, targetType, targetId, linkType) => ({
    projectId: project.id,
    sourceType,
    sourceId,
    targetType,
    targetId,
    linkType
  });

  await prisma.traceabilityLink.createMany({
    data: [
      // Every requirement traced to the document.
      link("REQUIREMENT", frSearch.id, "DOCUMENT_SECTION", firstSection.id, "described_by"),
      link("REQUIREMENT", frBorrow.id, "DOCUMENT_SECTION", firstSection.id, "described_by"),
      link("REQUIREMENT", nfrPerformance.id, "DOCUMENT_SECTION", firstSection.id, "described_by"),
      // Every FR covered, implemented, and verified.
      link("USE_CASE", ucSearch.id, "REQUIREMENT", frSearch.id, "covers"),
      link("USE_CASE", ucBorrow.id, "REQUIREMENT", frBorrow.id, "covers"),
      link("REQUIREMENT", frSearch.id, "DESIGN_ELEMENT", designElement.id, "implemented_by"),
      link("REQUIREMENT", frBorrow.id, "DESIGN_ELEMENT", designElement.id, "implemented_by"),
      link("REQUIREMENT", frSearch.id, "TEST_CASE", testCase.id, "verified_by"),
      link("REQUIREMENT", frBorrow.id, "TEST_CASE", testCase.id, "verified_by"),
      // Use cases described in the document.
      link("USE_CASE", ucSearch.id, "DOCUMENT_SECTION", firstSection.id, "described_by"),
      link("USE_CASE", ucBorrow.id, "DOCUMENT_SECTION", firstSection.id, "described_by")
    ]
  });

  console.log(`Demo project seeded: ${DEMO_PROJECT_NAME} (login ${DEMO_EMAIL} / ${DEMO_PASSWORD})`);
}

async function printSummary() {
  const profileCount = await prisma.validationProfile.count();
  const templateCount = await prisma.template.count();
  const validationRuleCount = await prisma.validationRule.count();
  const savedTemplates = await prisma.template.findMany({
    orderBy: [{ profile: { displayOrder: "asc" } }, { displayOrder: "asc" }],
    select: {
      code: true,
      sections: {
        select: {
          isRequired: true
        }
      }
    }
  });

  console.log("DevDoc seed summary");
  console.log(`Profiles: ${profileCount}`);
  console.log(`Templates: ${templateCount}`);

  for (const template of savedTemplates) {
    const sectionCount = template.sections.length;
    const requiredSectionCount = template.sections.filter((section) => section.isRequired).length;

    console.log(
      `${template.code}: ${sectionCount} sections, ${requiredSectionCount} required`
    );
  }

  console.log(`Validation rules: ${validationRuleCount}`);
}

async function main() {
  await seedProfiles();
  await seedTemplatesAndSections();
  await seedValidationRules();
  if (process.env.SEED_DEMO === "true") {
    await seedDemoProject();
  }
  await printSummary();
}

main()
  .catch((error) => {
    console.error("Seed failed");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
