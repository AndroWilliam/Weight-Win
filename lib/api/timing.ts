import { NextRequest, NextResponse } from 'next/server';

export type TimedHandler = (req: NextRequest, ctx?: any) => Promise<NextResponse>;

export function withTiming(fn: TimedHandler): TimedHandler {
  return async (req, ctx) => {
    const start = Date.now();
    try {
      const res = await fn(req, ctx);
      const dur = Date.now() - start;
      res.headers.set('Server-Timing', `total;dur=${dur}`);
      return res;
    } catch (err: any) {
      const dur = Date.now() - start;
      const errorRes = NextResponse.json(
        { error: 'Internal server error' }, 
        { status: 500 }
      );
      errorRes.headers.set('Server-Timing', `total;dur=${dur}`);
      throw err; // Re-throw to maintain error handling
    }
  };
}
