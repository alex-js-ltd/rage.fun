-- CreateTable
CREATE TABLE "Nsfw" (
    "tokenId" TEXT NOT NULL,
    "isNsfw" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Nsfw_pkey" PRIMARY KEY ("tokenId")
);

-- AddForeignKey
ALTER TABLE "Nsfw" ADD CONSTRAINT "Nsfw_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "TokenMetadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;
