/*
  Warnings:

  - A unique constraint covering the columns `[signature,user]` on the table `RewardEvent` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `signature` to the `RewardEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RewardEvent" ADD COLUMN     "signature" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "RewardEvent_signature_user_key" ON "RewardEvent"("signature", "user");
