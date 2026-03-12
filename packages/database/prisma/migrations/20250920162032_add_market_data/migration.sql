-- CreateTable
CREATE TABLE "public"."MarketData" (
    "id" TEXT NOT NULL,
    "price" BIGINT NOT NULL,
    "marketCap" BIGINT NOT NULL,
    "liquidity" BIGINT NOT NULL,
    "volume" BIGINT NOT NULL,
    "buyCount" INTEGER NOT NULL,
    "sellCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tokenId" TEXT NOT NULL,

    CONSTRAINT "MarketData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MarketData_tokenId_key" ON "public"."MarketData"("tokenId");

-- CreateIndex
CREATE INDEX "MarketData_tokenId_idx" ON "public"."MarketData"("tokenId");

-- AddForeignKey
ALTER TABLE "public"."MarketData" ADD CONSTRAINT "MarketData_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "public"."Token"("id") ON DELETE CASCADE ON UPDATE CASCADE;
