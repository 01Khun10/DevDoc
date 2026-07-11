const { getNextCode, isDuplicateCodeError, createWithCodeRetry } = require("../src/utils/nextCode");

describe("getNextCode", () => {
  test("starts at 001 when no codes exist", () => {
    expect(getNextCode("FR", [])).toBe("FR-001");
  });

  test("increments the highest existing number", () => {
    expect(getNextCode("FR", ["FR-001", "FR-003", "FR-002"])).toBe("FR-004");
  });

  test("pads to three digits and survives malformed codes", () => {
    expect(getNextCode("UC", ["UC-009", "UC-broken", "junk"])).toBe("UC-010");
  });

  test("crosses into four digits past 999", () => {
    expect(getNextCode("TC", ["TC-999"])).toBe("TC-1000");
  });
});

describe("createWithCodeRetry", () => {
  test("detects P2002 as duplicate-code error", () => {
    expect(isDuplicateCodeError({ code: "P2002" })).toBe(true);
    expect(isDuplicateCodeError({ code: "P2025" })).toBe(false);
    expect(isDuplicateCodeError(null)).toBe(false);
  });

  test("retries exactly once on P2002", async () => {
    let attempts = 0;
    const result = await createWithCodeRetry(async () => {
      attempts += 1;
      if (attempts === 1) {
        const error = new Error("duplicate");
        error.code = "P2002";
        throw error;
      }
      return "created";
    });
    expect(result).toBe("created");
    expect(attempts).toBe(2);
  });

  test("does not retry non-P2002 errors", async () => {
    let attempts = 0;
    await expect(
      createWithCodeRetry(async () => {
        attempts += 1;
        throw new Error("boom");
      })
    ).rejects.toThrow("boom");
    expect(attempts).toBe(1);
  });
});
