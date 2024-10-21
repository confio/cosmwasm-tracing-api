import { QueryDslQueryContainer } from "@elastic/elasticsearch/lib/api/types";
import { DbSpan } from "../../types/txs";
import { env } from "../env";
import { elasticClient } from "./client";

const matchFields = (
  fields: Array<[string, string]>,
): QueryDslQueryContainer[] =>
  fields.map(([key, value]) => ({ match: { [key]: { query: value } } }));

const matchTags = (tags: Array<[string, string]>): QueryDslQueryContainer[] =>
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

export const getAllSpans = async (
  fields: [string, string][],
  tags: [string, string][],
  numTraces: number,
  searchAfter?: number,
) => {
  const must = [...matchFields(fields), ...matchTags(tags)];

  const spans: DbSpan[] = [];
  let traceIds: string[] = [];

  //SECTION - eagerly query filtered spans until end reached or traceIds.length === numTraces
  do {
    const result = await elasticClient.search({
      index: env.SPAN_INDEX,
      size: 100, //NOTE - arbitrary value, can be adjusted for performance
      sort: [{ startTime: "desc" }],
      ...(must.length && { query: { bool: { must } } }),
      ...((searchAfter || spans.length) && {
        search_after: [
          spans.length
            ? spans[spans.length - 1]?._source.startTime
            : searchAfter,
        ],
      }),
    });

    if (result.hits.hits.length === 0) {
      break;
    }

    spans.push(...spans, ...(result.hits.hits as unknown as DbSpan[]));

    traceIds = Array.from(new Set(spans.map((span) => span._source.traceID)));
  } while (traceIds.length < numTraces);

  //SECTION - query all spans from each trace
  const allSpans = (
    await Promise.all(
      traceIds.flatMap(async (traceId) => {
        const spans: DbSpan[] = [];

        while (true) {
          const result = await elasticClient.search({
            index: env.SPAN_INDEX,
            size: 100, //NOTE - arbitrary value, can be adjusted for performance
            sort: [{ startTime: "desc" }],
            query: {
              bool: { must: { match: { traceID: { query: traceId } } } },
            },
            ...(spans.length && {
              search_after: [spans[spans.length - 1]?._source.startTime],
            }),
          });

          if (result.hits.hits.length === 0) {
            break;
          }

          spans.push(...spans, ...(result.hits.hits as unknown as DbSpan[]));
        }

        return spans;
      }),
    )
  ).flatMap((span) => span);

  //SECTION - sort spans by descending startTime and return numTraces traces max
  traceIds.sort((a, b) => {
    const spansA = allSpans.filter((span) => span._source.traceID === a);
    const spansB = allSpans.filter((span) => span._source.traceID === b);
    const minStartTimeA = Math.min(
      ...spansA.map((span) => span._source.startTime),
    );
    const minStartTimeB = Math.min(
      ...spansB.map((span) => span._source.startTime),
    );

    return minStartTimeA - minStartTimeB;
  });

  const truncatedTraceIds = traceIds.slice(0, numTraces);

  const truncatedSpans = allSpans.filter((span) =>
    truncatedTraceIds.includes(span._source.traceID),
  );

  return truncatedSpans;
};
