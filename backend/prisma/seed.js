const { PrismaClient } = require("@prisma/client");
const { profiles, templates, validationRules } = require("../src/data/templates");

const prisma = new PrismaClient();

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
      where: { ruleCode: rule.ruleCode },
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
