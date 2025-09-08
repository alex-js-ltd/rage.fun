/*
  Warnings:

  - You are about to drop the `TopHolder` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TopHolder" DROP CONSTRAINT "TopHolder_tokenId_fkey";

-- DropTable
DROP TABLE "TopHolder";
