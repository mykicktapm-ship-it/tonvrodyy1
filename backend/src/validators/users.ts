import { z } from 'zod';

export const UpsertUserSchema = z.object({
  appId: z.string().min(1),
  telegramId: z.string().optional(),
  walletAddress: z.string().optional(),
  action: z.enum(['connect','disconnect']).optional(),
});

