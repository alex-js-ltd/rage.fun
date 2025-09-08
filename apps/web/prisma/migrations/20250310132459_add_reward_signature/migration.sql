/*
  Warnings:

  - You are about to drop the column `signature` on the `RewardEvent` table. All the data in the column will be lost.
  - You are about to drop the column `tokenId` on the `RewardEvent` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user,signatureId]` on the table `RewardEvent` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `signatureId` to the `RewardEvent` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RewardEvent" DROP CONSTRAINT "RewardEvent_tokenId_fkey";

-- DropIndex
DROP INDEX "RewardEvent_signature_user_key";

-- DropIndex
DROP INDEX "RewardEvent_tokenId_idx";

-- AlterTable
ALTER TABLE "RewardEvent" DROP COLUMN "signature",
DROP COLUMN "tokenId",
ADD COLUMN     "signatureId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "RewardSignature" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tokenId" TEXT NOT NULL,

    CONSTRAINT "RewardSignature_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RewardSignature_tokenId_idx" ON "RewardSignature"("tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "RewardSignature_id_tokenId_key" ON "RewardSignature"("id", "tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "RewardEvent_user_signatureId_key" ON "RewardEvent"("user", "signatureId");

-- AddForeignKey
ALTER TABLE "RewardSignature" ADD CONSTRAINT "RewardSignature_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "TokenMetadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardEvent" ADD CONSTRAINT "RewardEvent_signatureId_fkey" FOREIGN KEY ("signatureId") REFERENCES "RewardSignature"("id") ON DELETE CASCADE ON UPDATE CASCADE;
