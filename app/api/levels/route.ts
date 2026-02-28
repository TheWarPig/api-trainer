import { NextResponse } from 'next/server';
import { getAllLevels } from '@/lib/level-storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  const levels = await getAllLevels();
  return NextResponse.json(levels);
}
