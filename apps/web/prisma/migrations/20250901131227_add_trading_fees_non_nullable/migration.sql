/*
  Warnings:

  - Made the column `tradingFees` on table `BondingCurve` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "BondingCurve" ALTER COLUMN "tradingFees" SET NOT NULL;
