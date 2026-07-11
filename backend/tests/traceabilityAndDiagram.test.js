const { getSupportedLinkType } = require("../src/services/traceabilityService");
const { generateSafeAlias, escapeLabel } = require("../src/services/diagramService");

describe("getSupportedLinkType", () => {
  test.each([
    ["USE_CASE", "REQUIREMENT", "covers"],
    ["USE_CASE", "DOCUMENT_SECTION", "described_by"],
    ["REQUIREMENT", "DOCUMENT_SECTION", "described_by"],
    ["REQUIREMENT", "DESIGN_ELEMENT", "implemented_by"],
    ["REQUIREMENT", "TEST_CASE", "verified_by"]
  ])("%s -> %s is %s", (sourceType, targetType, expected) => {
    expect(getSupportedLinkType(sourceType, targetType)).toBe(expected);
  });

  test("unsupported pairs return null", () => {
    expect(getSupportedLinkType("REQUIREMENT", "USE_CASE")).toBeNull();
    expect(getSupportedLinkType("TEST_CASE", "REQUIREMENT")).toBeNull();
    expect(getSupportedLinkType("DOCUMENT_SECTION", "USE_CASE")).toBeNull();
  });
});

describe("PlantUML builders", () => {
  test("generateSafeAlias sanitizes codes and falls back per type", () => {
    expect(generateSafeAlias("REQUIREMENT", "id", "FR-001", 0)).toBe("FR_001");
    expect(generateSafeAlias("USE_CASE", "id", null, 3)).toBe("UC_3");
    expect(generateSafeAlias("DOCUMENT_SECTION", "id", "1.2", 5)).toBe("SEC_5");
    expect(generateSafeAlias("DESIGN_ELEMENT", "id", "DE-002", 0)).toBe("DE_002");
    expect(generateSafeAlias("TEST_CASE", "id", null, 7)).toBe("TC_7");
    expect(generateSafeAlias("UNKNOWN", "id", null, 9)).toBe("NODE_9");
  });

  test("escapeLabel neutralizes quotes and newlines", () => {
    expect(escapeLabel('Say "hi"\nthere')).toBe("Say 'hi'\\nthere");
    expect(escapeLabel(null)).toBe("");
  });
});
