import { Client } from "@elastic/elasticsearch";
import { env } from "../env";

export const elasticClient = new Client({ node: env.ELASTIC_NODE_URL });
