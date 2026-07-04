import { NextResponse } from 'next/server';
import { supabase } from '@core/database/supabase';
import { RedisConn } from '@core/database/redis';
import { Qdrant } from '@core/database/qdrant';

export async function GET() {
  let dbStatus = 'healthy';
  let redisStatus = 'healthy';
  let vectorDbStatus = 'healthy';

  // 1. Test Supabase Database Connection
  try {
    const { error } = await supabase.from('workspaces').select('id').limit(1);
    if (error) dbStatus = 'warning';
  } catch {
    dbStatus = 'warning';
  }

  // 2. Test Redis connection
  const redisClient = RedisConn.getClient();
  if (!redisClient || redisClient.status !== 'ready') {
    redisStatus = 'warning';
  }

  // 3. Test Qdrant Vector database
  try {
    await Qdrant.initCollection('test_health_connection', 1536);
  } catch {
    vectorDbStatus = 'warning';
  }

  return NextResponse.json({
    success: true,
    data: {
      database: dbStatus,
      redis: redisStatus,
      vectorDb: vectorDbStatus,
      timestamp: new Date().toISOString(),
    },
  });
}
export const dynamic = 'force-dynamic';
