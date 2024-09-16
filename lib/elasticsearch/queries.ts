import { QueryDslQueryContainer } from "@elastic/elasticsearch/lib/api/types";

export const matchFields = (
  fields: Array<[string, string]>,
): QueryDslQueryContainer[] =>
  fields.map(([key, value]) => ({ match: { [key]: { query: value } } }));

export const matchTags = (
  tags: Array<[string, string]>,
): QueryDslQueryContainer[] =>
  tags.map(([key, value]) => ({
    nested: {
      path: "tags",
      query: {
        bool: {
          must: [
            { match: { "tags.key": key } },
            { wildcard: { "tags.value": { value } } },
          ],
        },
      },
    },
  }));
