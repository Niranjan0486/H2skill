import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authenticateFirebase } from "./src/middleware/auth";
import { runPipeline, handlePipelineError } from "../backend/pipeline";
import type { FactoryInput } from "../backend/types";
import { transformPipelineOutputToAnalysisResult } from "./src/utils/transform";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true,
}));
app.use(express.json());

// Public health endpoint
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "render-backend",
    timestamp: new Date().toISOString(),
  });
});

// Example protected endpoint
app.get("/api/me", authenticateFirebase, (req, res) => {
  // @ts-ignore - added by middleware
  const user = req.user || null;
  res.json({
    ok: true,
    user,
  });
});

// Protected pipeline endpoint - runs runPipeline server-side
app.post("/api/analyze-factory", authenticateFirebase, async (req, res) => {
  try {
    const input = req.body as FactoryInput;

    const pipelineOutput = await runPipeline(input);
    const analysisResult = transformPipelineOutputToAnalysisResult(
      pipelineOutput,
    );

    res.json(analysisResult);
  } catch (error) {
    const errorInfo = handlePipelineError(error);
    console.error("Pipeline error (server):", errorInfo);
    res.status(400).json({ error: errorInfo.error });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Render backend listening on port ${port}`);
});

