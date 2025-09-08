/*
  Warnings:

  - Made the column `connectorWeight` on table `BondingCurve` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "BondingCurve" ALTER COLUMN "connectorWeight" SET NOT NULL;
