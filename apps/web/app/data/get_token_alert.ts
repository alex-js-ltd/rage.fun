import { cache } from "react";
import { prisma, selectTokenAlert as select } from "@repo/database";
import type { TokenAlertRow } from "@repo/database";
import { calculatePercentage } from "@/app/utils/misc";
import "server-only";

export const getTokenAlert = cache(async (mint: string) => {
  const token = await prisma.token.findUniqueOrThrow({
    where: { id: mint },
    select,
  });

  return toTokenAlert(token);
});

function toTokenAlert(token: TokenAlertRow) {
  if (!token.metadata || !token.bondingCurve) {
    throw new Error("Missing required relations");
  }

  const { id, metadata, bondingCurve } = token;

  return {
    id,
    metadata,
    bondingCurve: {
      progress: calculatePercentage(
        bondingCurve.currentReserve,
        bondingCurve.targetReserve,
      ),
      currentReserve: bondingCurve.currentReserve.toString(),
      currentSupply: bondingCurve.currentSupply.toString(),
      decimals: bondingCurve.decimals,
    },
  };
}

export type TokenAlert = ReturnType<typeof toTokenAlert>;
