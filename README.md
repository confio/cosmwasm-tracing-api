# CosmWasm Tracing API

## Run

You can run this node app in dev mode or prod mode by running `npm run dev` or `npm run start`, respectively, after installing its dependencies with `npm install`.

## Query

This API serves spans that can be queried at `/api/v1/txs`. It currently returns as many as 15 results and supports no pagination. You can filter the queried spans by exactly matching its fields, or by matching its tags with wildcards.

### Query without filters

`localhost:4000/api/v1/txs`

### Queries filtering fields

`localhost:4000/api/v1/txs?traceID=04d653edcb74899f23939de5bf80bbd5`

`localhost:4000/api/v1/txs?operationName=send_async`

## Queries filtering tags

`localhost:4000/api/v1/txs?tags={"height":"772"}`

`localhost:4000/api/v1/txs?tags={"tx_hash":"51B60C806E4F685C8A7FC79CBB72BF860B566B354F2C57B023407DD7AD633CB7"}`

`localhost:4000/api/v1/txs?tags={"tx":"*signer: slay3r1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmvk3r3j*"}`


## Combining fields and tags

`localhost:4000/api/v1/txs?traceID=3a94a753fa4cbf199f16f98cf72c478c&tags={"tx_hash":"51B60C806E4F685C8A7FC79CBB72BF860B566B354F2C57B023407DD7AD633CB7"}`
