import { z } from "zod";

const envSchema = z.object({
  ELASTIC_NODE_URL: z.string().url(),
  SPAN_INDEX: z.string(),
  PORT: z.optional(z.number().positive().int().safe()),
});

export const env = envSchema.parse(process.env);
