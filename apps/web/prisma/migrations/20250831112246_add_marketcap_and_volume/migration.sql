/*
  Warnings:

  - Made the column `marketCap` on table `BondingCurve` required. This step will fail if there are existing NULL values in that column.
  - Made the column `volume` on table `BondingCurve` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "BondingCurve" ALTER COLUMN "marketCap" SET NOT NULL,
ALTER COLUMN "volume" SET NOT NULL;
