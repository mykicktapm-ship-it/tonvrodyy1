import { z } from 'zod';

export const CreateLobbySchema = z.object({
  appId: z.string().min(1),
  seats: z.number().int().min(2).max(100),
  stakeTon: z.number().nonnegative(),
  isPrivate: z.boolean().optional(),
  password: z.string().optional(),
});

export const JoinLobbySchema = z.object({
  appId: z.string().min(1),
  password: z.string().optional(),
});

