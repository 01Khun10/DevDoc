-- DropIndex
DROP INDEX "ValidationRule_ruleCode_key";

-- CreateIndex
CREATE UNIQUE INDEX "ValidationRule_profileId_ruleCode_key" ON "ValidationRule"("profileId", "ruleCode");

