import cors from "cors";
import express from "express";
import { env } from "./lib/env";
import { getTxs } from "./routes/getTxs";

const router = express.Router();
router.get("/txs", getTxs);

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/v1", router);

const PORT = env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
