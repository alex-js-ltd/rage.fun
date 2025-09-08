-- CreateTable
CREATE TABLE "TopHolder" (
    "owner" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopHolder_pkey" PRIMARY KEY ("tokenId","owner")
);

-- CreateIndex
CREATE INDEX "TopHolder_tokenId_idx" ON "TopHolder"("tokenId");

-- CreateIndex
CREATE INDEX "TopHolder_address_idx" ON "TopHolder"("address");

-- AddForeignKey
ALTER TABLE "TopHolder" ADD CONSTRAINT "TopHolder_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "TokenMetadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;
