import { NextResponse } from 'next/server';

export const GET = async () => {
  return NextResponse.json({ 
    ok: true, 
    version: process.env.VERCEL_GIT_COMMIT_SHA ?? 'local',
    timestamp: new Date().toISOString()
  });
};
