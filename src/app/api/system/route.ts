import { NextResponse } from 'next/server';
import os from 'os';

export async function GET() {
  const memoryUsage = process.memoryUsage();
  
  return NextResponse.json({
    uptimeSeconds: process.uptime(),
    platform: os.platform(),
    arch: os.arch(),
    totalMemoryBytes: os.totalmem(),
    freeMemoryBytes: os.freemem(),
    loadAverage: os.loadavg(),
    nodeVersion: process.version,
    memoryUsage: {
      rss: memoryUsage.rss,
      heapTotal: memoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed,
      external: memoryUsage.external,
    },
    timestamp: new Date().toISOString(),
  });
}
export const dynamic = 'force-dynamic';
