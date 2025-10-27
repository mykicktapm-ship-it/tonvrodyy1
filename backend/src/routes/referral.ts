import { Router } from 'express';

/**
 * Simple in-memory storage for referrals. In a real application this would
 * be persisted in a database. Each record contains a userId and optional
 * referrerId.
 */
interface ReferralRecord {
  userId: string;
  referrerId?: string;
}

const records: ReferralRecord[] = [];
const router = Router();

// Create or update a referral record
router.post('/', (req, res) => {
  const { userId, referrerId } = req.body as ReferralRecord;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  const existingIndex = records.findIndex((r) => r.userId === userId);
  if (existingIndex >= 0) {
    records[existingIndex].referrerId = referrerId;
  } else {
    records.push({ userId, referrerId });
  }
  return res.status(201).json({ userId, referrerId });
});

// Retrieve all referral records (for testing/demo purposes)
router.get('/', (_req, res) => {
  res.json({ records });
});

export default router;