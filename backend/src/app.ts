import express, { Request, Response } from "express";
import cors from "cors";
import referralRouter from "./referral";
import invitesRouter from "./invites";
import webhookRouter from "./telegram/webhook";
import usersRoutes from "./routes/users";
import lobbiesRoutes from "./routes/lobbies";
import walletsRoutes from "./routes/wallets";
import logsRoutes from "./routes/logs";
import requestContext from "./middleware/requestContext";

const app = express();
app.use(cors());
app.use(express.json());
app.use(requestContext());

// Root
app.get("/", (_req: Request, res: Response) => {
  res.send("Backend works");
});

// Health + metrics
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});
app.get('/metrics', (_req: Request, res: Response) => {
  res.json({ uptime: process.uptime(), memory: process.memoryUsage().rss });
});

// Routers
app.use("/api/referrals", referralRouter);
app.use("/api/invites", invitesRouter);
app.use("/tg/webhook", webhookRouter);
app.use("/api/users", usersRoutes);
app.use("/api/lobbies", lobbiesRoutes);
app.use("/api/wallets", walletsRoutes);
app.use("/api/logs", logsRoutes);

// 404 fallback (оставлено для предсказуемости)
app.use("*", (_req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
