-- AlterTable
ALTER TABLE "TraceabilityLink" ADD COLUMN     "lastVerifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ValidationRun" ADD COLUMN     "metrics" JSONB;
