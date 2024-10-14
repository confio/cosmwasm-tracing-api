import { z } from "zod";

const DbSpanSchema = z.object({
  _source: z.object({
    traceID: z.string(),
    spanID: z.string(),
    references: z
      .array(
        z.object({
          refType: z.string(),
          traceID: z.string(),
          spanID: z.string(),
        }),
      )
      .readonly(),
    operationName: z.string(),
    tags: z
      .array(z.object({ key: z.string(), type: z.string(), value: z.string() }))
      .readonly(),
    startTime: z.number(),
    duration: z.number(),
  }),
});

const ApiSpanSchema = DbSpanSchema.transform(({ _source: span }) => ({
  traceId: span.traceID,
  spanId: span.spanID,
  parentSpanId:
    span.references.find(
      (ref) => ref.traceID === span.traceID && ref.refType === "CHILD_OF",
    )?.spanID ?? null,
  operationName: span.operationName,
  tags: Array.from(span.tags.map(({ key, value }) => [key, value])),
  startTime: span.startTime,
  duration: span.duration,
}));

export const DbTxSchema = z.object({
  traceId: z.string(),
  startTime: z.number(),
  spans: z.array(DbSpanSchema).readonly(),
});

export const ApiTxSchema = z.object({
  traceId: z.string(),
  startTime: z.number(),
  spans: z.array(ApiSpanSchema).readonly(),
});

export type DbSpan = Readonly<z.infer<typeof DbSpanSchema>>;
export type ApiSpan = Readonly<z.infer<typeof ApiSpanSchema>>;
export type DbTx = Readonly<z.infer<typeof DbTxSchema>>;
export type ApiTx = Readonly<z.infer<typeof ApiTxSchema>>;
