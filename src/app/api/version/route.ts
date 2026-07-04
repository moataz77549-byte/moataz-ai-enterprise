import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    version: '1.0.0-alpha.0',
    environment: process.env.NODE_ENV || 'production',
    commit: process.env.VERCEL_GIT_COMMIT_SHA || 'dev-commit-local-hash',
    tag: 'release-v1.0.0-alpha.0',
  });
}
export const dynamic = 'force-dynamic';
