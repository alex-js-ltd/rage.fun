import { prisma } from "@repo/database";
import { PublicKey as PK } from "@solana/web3.js";
import "server-only";

export async function getUser(publicKey: string) {
  const pk = new PK(publicKey);
  if (!PK.isOnCurve(pk.toBytes())) {
    console.log("Invalid public key: not on the Ed25519 curve");
    return null;
  }

  const user = await prisma.user.upsert({
    where: { id: publicKey },
    update: {}, // If user already exists, no updates will be made
    create: { id: publicKey },
  });

  return user;
}
