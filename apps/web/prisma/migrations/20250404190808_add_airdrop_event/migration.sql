-- CreateTable
CREATE TABLE "AirdropEvent" (
    "id" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "time" BIGINT NOT NULL,
    "amount" BIGINT NOT NULL,
    "signature" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,

    CONSTRAINT "AirdropEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AirdropEvent_tokenId_idx" ON "AirdropEvent"("tokenId");

-- AddForeignKey
ALTER TABLE "AirdropEvent" ADD CONSTRAINT "AirdropEvent_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "TokenMetadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;
