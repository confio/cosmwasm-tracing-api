# CosmWasm Tracing API

## Run locally

This app expects a reachable Elasticsearch node. It will connect to it and serve the configured span index on the specified port.

### Setting up Elasticsearch

From the layer-sdk repo and with Docker installed and started, run:

```bash
./scripts/build_docker.sh
./localnode/run_elastic.sh
cd js && npm install && npm run test
```

### Running the API

Copy the `.env.sample` in the root of this repo to a new `.env.local` file. There you will be able to configure the Elasticsearch node URL, the span index, and the port this app will listen on. If you omit it, it will listen on port `4000`.

Example `.env.local`:

```bash
ELASTIC_NODE_URL="http://localhost:9200"
SPAN_INDEX="jaeger-span-YYYY-MM-DD"
PORT=4000
```

`SPAN_INDEX` should have the corresponding `YYYY-MM-DD` of the day you ran the `./localnode/run_elastic.sh` script. You can confirm that by running:

`curl http://localhost:9200/_cat/indices`

Then you can start this Node app in dev mode or prod mode by running `npm run dev` or `npm run start`, respectively, after installing its dependencies with `npm install`.

## Query

This API serves spans that can be queried at `/api/v1/txs`. It currently returns as many as 15 results and supports no pagination. You can filter the queried spans by exactly matching its fields, or by matching its tags with wildcards.

### Query without filters

`localhost:4000/api/v1/txs`

### Queries filtering fields

`localhost:4000/api/v1/txs?traceID=04d653edcb74899f23939de5bf80bbd5`

`localhost:4000/api/v1/txs?operationName=send_async`

### Queries filtering tags

`localhost:4000/api/v1/txs?tags={"height":"772"}`

`localhost:4000/api/v1/txs?tags={"tx_hash":"51B60C806E4F685C8A7FC79CBB72BF860B566B354F2C57B023407DD7AD633CB7"}`

`localhost:4000/api/v1/txs?tags={"tx":"*signer: slay3r1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmvk3r3j*"}`


### Combining fields and tags

`localhost:4000/api/v1/txs?traceID=3a94a753fa4cbf199f16f98cf72c478c&tags={"tx_hash":"51B60C806E4F685C8A7FC79CBB72BF860B566B354F2C57B023407DD7AD633CB7"}`
