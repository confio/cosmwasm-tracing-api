import { Request, Response } from "express";
import { z } from "zod";
import { getAllSpans } from "../lib/elasticsearch/queries";
import { env } from "../lib/env";
import { getApiTxsFromDbSpans } from "../lib/txs";

const reqQuerySchema = z.object({
  searchAfter: z.optional(z.number({ coerce: true })),
  tags: z
    .optional(
      z
        .string()
        .transform((v) => Object.entries(JSON.parse(v)))
        .pipe(z.array(z.tuple([z.string(), z.string()]))),
    )
    .transform((v) => v ?? []),
  traceID: z.optional(z.string()),
  operationName: z.optional(z.string()),
});

export async function getTxs(req: Request, res: Response) {
  try {
    const { searchAfter, tags, ...fieldsReqQuery } = reqQuerySchema.parse(
      req.query,
    );

    const fields = Object.entries(fieldsReqQuery).filter(
      (entry): entry is [string, string] => entry[1] !== undefined,
    );

    const allSpans = await getAllSpans(
      fields,
      tags,
      env.TXS_PAGE_SIZE,
      searchAfter,
    );
    const txs = getApiTxsFromDbSpans(allSpans);

    res.status(200).send({ txs });
  } catch (error: unknown) {
    res
      .status(500)
      .send(
        error instanceof Error ? error.message : "Could not get transactions",
      );
  }
}
