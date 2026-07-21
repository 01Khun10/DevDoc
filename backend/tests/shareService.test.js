jest.mock("../src/utils/prisma", () => ({
  project: { findFirst: jest.fn(), findUnique: jest.fn() },
  shareToken: { findFirst: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
  validationRun: { findFirst: jest.fn() },
  useCase: { findMany: jest.fn() },
  requirement: { findMany: jest.fn() },
  documentSection: { findMany: jest.fn() },
  designElement: { findMany: jest.fn() },
  testCase: { findMany: jest.fn() },
  traceabilityLink: { findMany: jest.fn() }
}));

const prisma = require("../src/utils/prisma");
const { SHARE_TOKEN_NOT_FOUND, createShareToken, getSharedReport } = require("../src/services/shareService");

describe("shareService expiry", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-07-21T12:00:00.000Z"));
    jest.clearAllMocks();
    prisma.project.findFirst.mockResolvedValue({ id: "project-1" });
    prisma.shareToken.findFirst.mockResolvedValue(null);
    prisma.shareToken.create.mockImplementation(({ data }) => Promise.resolve(data));
  });

  afterEach(() => jest.useRealTimers());

  // TC-BE-SHARE-009
  test("defaults new share links to a 30-day expiry", async () => {
    const result = await createShareToken("owner-1", "project-1");

    expect(result.expiresAt).toEqual(new Date("2026-08-20T12:00:00.000Z"));
    expect(prisma.shareToken.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ expiresAt: result.expiresAt })
    }));
  });

  // TC-BE-SHARE-010
  test("rejects an expiry more than 365 days away", async () => {
    await expect(createShareToken("owner-1", "project-1", "2027-07-22T12:00:00.000Z"))
      .rejects.toMatchObject({ code: "INVALID_EXPIRY" });
    await expect(createShareToken("owner-1", "project-1", "not-a-date"))
      .rejects.toMatchObject({ code: "INVALID_EXPIRY" });
    expect(prisma.shareToken.create).not.toHaveBeenCalled();
  });

  // TC-BE-SHARE-011
  test("rejects expired public share links", async () => {
    prisma.shareToken.findUnique.mockResolvedValue({
      projectId: "project-1",
      expiresAt: new Date("2026-07-21T11:59:59.000Z")
    });

    await expect(getSharedReport("expired-token"))
      .rejects.toMatchObject({ code: SHARE_TOKEN_NOT_FOUND });
  });
});
