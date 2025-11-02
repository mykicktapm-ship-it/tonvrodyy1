import express, { Request, Response } from "express";
import cors from "cors";
import referralRouter from "./referral";
import invitesRouter from "./invites";

const app = express();
app.use(cors());
app.use(express.json());

// Health check route
app.get("/api/status", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "Backend running",
    timestamp: new Date().toISOString(),
  });
});

// Referral logic routes
app.use("/api/referrals", referralRouter);
app.use("/api/invites", invitesRouter);

// Fallback route
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
