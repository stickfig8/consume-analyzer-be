import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import { pool } from "./configs/db.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { router } from "./routes/index.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      status: "ok",
      db: "connected",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      db: "disconnected",
    });
  }
});

app.get("/api", (req: Request, res: Response) => {
  res.send("Consume Analyzer API");
});

app.use(errorMiddleware);
app.use("/api", router);
