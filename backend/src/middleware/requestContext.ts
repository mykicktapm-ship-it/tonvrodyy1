import type { Request, Response, NextFunction } from 'express';
import { logEvent } from '../services/supabase';
import crypto from 'crypto';

export default function requestContext() {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const id = crypto.randomUUID();
    const xfwd = req.headers['x-forwarded-for'];
    const ip = Array.isArray(xfwd) ? xfwd[0] : (xfwd as string) || req.ip || null;
    const ua = (req.headers['user-agent'] as string) || null;
    (req as any).id = id;
    (req as any).clientIp = ip;
    (req as any).userAgent = ua;

    res.on('finish', () => {
      const durationMs = Date.now() - start;
      logEvent({
        level: 'info',
        action: 'http.access',
        data: { method: req.method, url: req.originalUrl || req.url, status: res.statusCode, durationMs },
        requestId: id,
        ip: ip,
        ua: ua,
        source: 'middleware/requestContext',
      });
    });
    next();
  };
}

