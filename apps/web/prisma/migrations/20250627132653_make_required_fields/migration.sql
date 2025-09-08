/*
  Warnings:

  - Made the column `startTime` on table `BondingCurve` required. This step will fail if there are existing NULL values in that column.
  - Made the column `reserveBalance` on table `BondingCurve` required. This step will fail if there are existing NULL values in that column.
  - Made the column `totalSupply` on table `BondingCurve` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "BondingCurve" ALTER COLUMN "startTime" SET NOT NULL,
ALTER COLUMN "reserveBalance" SET NOT NULL,
ALTER COLUMN "totalSupply" SET NOT NULL;
