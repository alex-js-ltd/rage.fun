"use server";

import { SubmissionResult } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { HarvestYieldSchema } from "@/app/utils/schemas";
import { program, connection } from "@/app/utils/setup";
import { getHarvestYieldIx, buildTransaction } from "@repo/rage";

import { auth } from "@/app/auth";

import { PublicKey } from "@solana/web3.js";
import { isInstructionError, getErrorMessage } from "@/app/utils/setup";

export type State =
  | (SubmissionResult<string[]> & {
      serializedTx?: Uint8Array;
      errMessage?: string;
      requestId?: string;
    })
  | undefined;

export async function harvestYield(_prevState: State, formData: FormData) {
  const requestId = crypto.randomUUID();
  const session = await auth();

  const submission = parseWithZod(formData, {
    schema: HarvestYieldSchema,
  });

  if (submission.status !== "success" || !session?.user?.id) {
    return {
      ...submission.reply(),
      serializedTx: undefined,
      errMessage: undefined,
      requestId,
    };
  }

  const { creator, mint } = submission.value;

  const payer = new PublicKey(session?.user?.id);

  const ix = await getHarvestYieldIx({
    program,
    creator,
    mint,
  });

  const transaction = await buildTransaction({
    connection,
    payer,
    instructions: [ix],
    signers: [],
  });

  const sim = await connection.simulateTransaction(transaction);

  if (sim.value.err !== null && !isInstructionError(sim.value.err)) {
    return {
      ...submission.reply(),
      serializedTx: undefined,
      errMessage: "unknown error",
      requestId,
    };
  } else if (sim.value.err !== null && isInstructionError(sim.value.err)) {
    const code = sim.value.err.InstructionError[1].Custom;
    const errMessage = getErrorMessage(code);

    return {
      ...submission.reply(),
      serializedTx: undefined,
      errMessage,
      requestId,
    };
  }

  return {
    ...submission.reply(),
    serializedTx: transaction.serialize(),
    errMessage: undefined,
    requestId,
  };
}
