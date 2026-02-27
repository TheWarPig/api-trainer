import { NextResponse } from 'next/server';
import { getMergedLevels } from '@/lib/level-storage';

export async function GET() {
  const levels = getMergedLevels();
  return NextResponse.json(levels);
}
