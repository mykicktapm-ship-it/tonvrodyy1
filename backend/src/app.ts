import express, { Request, Response } from "express";
import cors from "cors";
import referralRouter from "./referral";
import invitesRouter from "./invites";

const app = express();
app.use(cors());
app.use(express.json());

// Root route stub
app.get("/", (_req: Request, res: Response) => {
  res.send("Backend работает 🚀");
});

// Health check route
app.get("/api/status", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "Backend running",
    timestamp: new Date().toISOString(),
  });
});

// Feature routes
app.use("/api/referrals", referralRouter);
app.use("/api/invites", invitesRouter);

// Diagnostics
app.get("/api/tg/status", (_req: Request, res: Response) => {
  res.json({ enabled: !!process.env.TG_BOT_TOKEN });
});
app.get("/api/supabase/status", (_req: Request, res: Response) => {
  res.json({ url: process.env.SUPABASE_URL || null, anon: !!process.env.SUPABASE_ANON_KEY });
});

// Fallback route
app.use("*", (_req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;

