const { calculateCompletionPercent } = require("../src/services/documentService");
const {
  validateCreateDocumentFromTemplateInput,
  validateUpdateDocumentSectionInput
} = require("../src/validators/documentValidator");

describe("calculateCompletionPercent", () => {
  test("uses required sections when a document has required sections", () => {
    expect(
      calculateCompletionPercent([
        { isRequired: true, status: "COMPLETE" },
        { isRequired: true, status: "EMPTY" },
        { isRequired: false, status: "COMPLETE" }
      ])
    ).toBe(50);
  });

  test("falls back to all sections when none are required", () => {
    expect(
      calculateCompletionPercent([
        { isRequired: false, status: "COMPLETE" },
        { isRequired: false, status: "EMPTY" }
      ])
    ).toBe(50);
  });

  test("empty documents are 0 percent complete", () => {
    expect(calculateCompletionPercent([])).toBe(0);
  });
});

describe("documentValidator", () => {
  test("accepts a template code and trims an optional title", () => {
    expect(
      validateCreateDocumentFromTemplateInput({
        templateCode: " STD_SCOPE ",
        title: " Project scope "
      })
    ).toMatchObject({
      isValid: true,
      values: { templateCode: "STD_SCOPE", title: "Project scope" }
    });
  });

  test("allows null section content so clearing a section works", () => {
    expect(validateUpdateDocumentSectionInput({ content: null })).toMatchObject({
      isValid: true,
      values: { content: null }
    });
  });

  test("rejects oversized section content", () => {
    const result = validateUpdateDocumentSectionInput({ content: "x".repeat(20001) });
    expect(result.isValid).toBe(false);
    expect(result.fields.content).toBe("Content must be 20000 characters or less");
  });
});
