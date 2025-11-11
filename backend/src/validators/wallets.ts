import { z } from 'zod';

export const LinkWalletSchema = z.object({ appId: z.string().min(1), walletAddress: z.string().min(4) });
export const ActivateWalletSchema = z.object({ appId: z.string().min(1), walletAddress: z.string().min(4) });

