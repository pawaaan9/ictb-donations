import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const TOTAL_BRICKS = 134500;

const redisUrl = process.env.UPSTASH_REDIS_URL;
const redisToken = process.env.UPSTASH_REDIS_TOKEN;

let redis: Redis | null = null;
if (redisUrl && redisToken) {
  redis = new Redis({ url: redisUrl, token: redisToken });
}

export async function GET(request: NextRequest) {
  if (!redisUrl || !redisToken) {
    return NextResponse.json({ error: 'Redis config missing: UPSTASH_REDIS_URL or UPSTASH_REDIS_TOKEN not set.' }, { status: 500 });
  }
  try {
    // Get sponsored count from Redis
    const sponsored = await redis!.get<number>('bricks:sponsored');
    const sponsoredCount = typeof sponsored === 'number' ? sponsored : Number(sponsored) || 0;
    const available = TOTAL_BRICKS - sponsoredCount;
    return NextResponse.json({
      total: TOTAL_BRICKS,
      sponsored: sponsoredCount,
      available,
    });
  } catch (error) {
    console.error('Redis error in /api/bricks:', error);
    return NextResponse.json({ error: 'Failed to fetch brick data', details: String(error) }, { status: 500 });
  }
}
