import { NextRequest, NextResponse } from 'next/server';
import { fail } from './responses';

export type Handler = (req: NextRequest, ctx?: any, requestId?: string) => Promise<NextResponse>;

export function withHandler(fn: Handler): Handler {
  return async (req, ctx) => {
    const requestId = crypto.randomUUID();
    try {
      const res = await fn(req, ctx, requestId);
      // attach request-id header for clients
      res.headers.set('x-request-id', requestId);
      return res;
    } catch (err: any) {
      console.error('API_ERROR', { requestId, err: err?.stack || String(err) });
      return NextResponse.json(
        fail('INTERNAL', 'Unexpected error'), 
        { 
          status: 500, 
          headers: { 'x-request-id': requestId } 
        }
      );
    }
  };
}
