import { Router } from 'express';
import referralRouter from './referral.js';

const router = Router();

router.use('/referral', referralRouter);

// Additional routes can be registered here

export default router;