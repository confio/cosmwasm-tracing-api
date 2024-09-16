import { QueryDslQueryContainer } from "@elastic/elasticsearch/lib/api/types";
import { Request, Response } from "express";
import { z } from "zod";
import { elasticClient } from "../lib/elasticsearch/client";
import { matchFields, matchTags } from "../lib/elasticsearch/queries";
import { env } from "../lib/env";

const reqQuerySchema = z.object({
  traceID: z.optional(z.string()),
  spanID: z.optional(z.string()),
  operationName: z.optional(z.string()),
  tags: z
    .optional(
      z
        .string()
        .transform((v) => Object.entries(JSON.parse(v)))
        .pipe(z.array(z.tuple([z.string(), z.string()]))),
    )
    .transform((v) => v ?? []),
});

export async function getTxs(req: Request, res: Response) {
  try {
    const { tags, ...fieldsReqQuery } = reqQuerySchema.parse(req.query);

    const fields = Object.entries(fieldsReqQuery).filter(
      (entry): entry is [string, string] => entry[1] !== undefined,
    );

    const must: QueryDslQueryContainer[] = [
      ...matchFields(fields),
      ...matchTags(tags),
    ];

    //TODO -  add pagination
    const result = await elasticClient.search({
      index: env.SPAN_INDEX,
      ...(must.length && { query: { bool: { must } } }),
      size: 15,
    });

    const txs = result.hits.hits;

    res.status(200).send({ txs });
  } catch (error: unknown) {
    res
      .status(500)
      .send(
        error instanceof Error ? error.message : "Could not get transactions",
      );
  }
}
