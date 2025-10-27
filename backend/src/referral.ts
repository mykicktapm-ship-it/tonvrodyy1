import { Router, Request, Response } from "express";

const router = Router();

// Example referral endpoint
router.post("/register", (req: Request, res: Response) => {
  const { userId, referrerId } = req.body;
  if (!userId || !referrerId) {
    return res.status(400).json({ error: "Missing userId or referrerId" });
  }

  // Placeholder for actual logic (DB insert, TON transaction, etc.)
  res.json({
    message: "Referral registered successfully",
    userId,
    referrerId,
  });
});

router.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  // Example: fetch referral info from DB later
  res.json({
    referralId: id,
    status: "active",
    createdAt: new Date().toISOString(),
  });
});

export default router;
