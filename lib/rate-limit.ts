type Result = { success: boolean; remaining?: number };

const memoryBuckets = new Map<string, { tokens: number; ts: number }>();

export async function limitByIp(ip: string, key: string, perMinute = 30): Promise<Result> {
  const now = Date.now();
  const bucketKey = `${key}:${ip}`;
  const state = memoryBuckets.get(bucketKey) ?? { tokens: perMinute, ts: now };
  const refill = Math.floor((now - state.ts) / 60000) * perMinute;
  const tokens = Math.min(perMinute, state.tokens + Math.max(0, refill));
  const next = tokens > 0 ? tokens - 1 : 0;
  memoryBuckets.set(bucketKey, { tokens: next, ts: now });
  return { success: next >= 0, remaining: next };
}

export function ipFromRequest(req: Request): string {
  const h = (name: string) => (req.headers?.get(name) || '');
  return h('x-forwarded-for')?.split(',')[0]?.trim()
      || h('x-real-ip')
      || (req as any).ip
      || 'anonymous';
}
