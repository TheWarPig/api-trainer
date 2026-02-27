import { NextResponse } from 'next/server';
import { resetDb } from '@/lib/store';

export async function POST() {
  resetDb();
  return NextResponse.json({ message: 'Data reset to initial state.' });
}
