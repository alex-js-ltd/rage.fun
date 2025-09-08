-- CreateTable
CREATE TABLE "HarvestEvent" (
    "id" TEXT NOT NULL,
    "signer" TEXT NOT NULL,
    "time" BIGINT NOT NULL,
    "lamports" BIGINT NOT NULL,
    "tokenId" TEXT NOT NULL,

    CONSTRAINT "HarvestEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HarvestEvent_tokenId_idx" ON "HarvestEvent"("tokenId");

-- AddForeignKey
ALTER TABLE "HarvestEvent" ADD CONSTRAINT "HarvestEvent_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "TokenMetadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;
