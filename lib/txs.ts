import { ApiTx, ApiTxSchema, DbSpan, DbTx } from "../types/txs";

export const getApiTxsFromDbSpans = (
  spans: readonly DbSpan[],
): readonly ApiTx[] =>
  spans
    .reduce<readonly DbTx[]>((prevTxs, span) => {
      const foundTx = prevTxs.find((tx) => tx.traceId === span._source.traceID);

      if (!foundTx) {
        return [
          ...prevTxs,
          {
            traceId: span._source.traceID,
            startTime: span._source.startTime,
            spans: [span],
          },
        ];
      }

      const spans = [...foundTx.spans, span].sort(
        (a, b) => a._source.startTime - b._source.startTime,
      );

      const tx: DbTx = {
        traceId: foundTx.traceId,
        startTime: Math.min(foundTx.startTime, span._source.startTime),
        spans,
      };

      const txs = prevTxs.toSpliced(prevTxs.indexOf(foundTx), 1, tx);
      return txs;
    }, [])
    .map((tx) => ApiTxSchema.parse(tx))
    .sort((a, b) => b.startTime - a.startTime);
