-- CreateTable
CREATE TABLE "public"."Pnl" (
    "signer" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "bought" BIGINT NOT NULL,
    "sold" BIGINT NOT NULL,
    "realizedPnl" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pnl_pkey" PRIMARY KEY ("signer","tokenId")
);

-- CreateIndex
CREATE INDEX "Pnl_tokenId_idx" ON "public"."Pnl"("tokenId");

-- CreateIndex
CREATE INDEX "Pnl_signer_idx" ON "public"."Pnl"("signer");

-- AddForeignKey
ALTER TABLE "public"."Pnl" ADD CONSTRAINT "Pnl_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "public"."Token"("id") ON DELETE CASCADE ON UPDATE CASCADE;
