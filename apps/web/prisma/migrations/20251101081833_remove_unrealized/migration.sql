/*
  Warnings:

  - You are about to drop the column `unrealizedPnl` on the `Pnl` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Pnl" DROP COLUMN "unrealizedPnl";
