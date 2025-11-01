/*
  Warnings:

  - You are about to drop the `Pnl` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Pnl" DROP CONSTRAINT "Pnl_tokenId_fkey";

-- DropTable
DROP TABLE "public"."Pnl";

-- CreateTable
CREATE TABLE "public"."TokenPnl" (
    "signer" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "bought" BIGINT NOT NULL,
    "sold" BIGINT NOT NULL,
    "realizedPnl" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TokenPnl_pkey" PRIMARY KEY ("signer","tokenId")
);

-- CreateTable
CREATE TABLE "public"."UserPnl" (
    "userId" TEXT NOT NULL,
    "bought" BIGINT NOT NULL,
    "sold" BIGINT NOT NULL,
    "realizedPnl" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPnl_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE INDEX "TokenPnl_tokenId_idx" ON "public"."TokenPnl"("tokenId");

-- CreateIndex
CREATE INDEX "TokenPnl_signer_idx" ON "public"."TokenPnl"("signer");

-- AddForeignKey
ALTER TABLE "public"."TokenPnl" ADD CONSTRAINT "TokenPnl_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "public"."Token"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserPnl" ADD CONSTRAINT "UserPnl_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
