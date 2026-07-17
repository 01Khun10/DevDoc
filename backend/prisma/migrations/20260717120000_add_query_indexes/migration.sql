-- CreateIndex
CREATE INDEX "Project_ownerId_createdAt_idx" ON "Project"("ownerId", "createdAt");

-- CreateIndex
CREATE INDEX "Document_projectId_idx" ON "Document"("projectId");

-- CreateIndex
CREATE INDEX "ValidationRun_projectId_idx" ON "ValidationRun"("projectId");

-- CreateIndex
CREATE INDEX "ValidationResult_validationRunId_idx" ON "ValidationResult"("validationRunId");

-- CreateIndex
CREATE INDEX "ShareToken_projectId_idx" ON "ShareToken"("projectId");

-- CreateIndex
CREATE INDEX "ActivityLog_projectId_createdAt_idx" ON "ActivityLog"("projectId", "createdAt");

