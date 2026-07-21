UPDATE "ShareToken"
SET "expiresAt" = "createdAt" + INTERVAL '30 days'
WHERE "expiresAt" IS NULL;

ALTER TABLE "ShareToken"
ALTER COLUMN "expiresAt" SET NOT NULL;
