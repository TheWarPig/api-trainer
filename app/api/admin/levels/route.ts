import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/admin-auth';
import { getAllLevels, upsertLevel, getNextCustomId } from '@/lib/level-storage';
import type { SerializableLevel } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!await checkAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const levels = await getAllLevels();
  return NextResponse.json(levels);
}

export async function POST(request: Request) {
  if (!await checkAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const levels = await getAllLevels();

    const newId = await getNextCustomId();
    const newLevel: SerializableLevel = {
      id: newId,
      title: body.title || 'New Level',
      difficulty: body.difficulty || 'Easy',
      concept: body.concept || '',
      description: body.description || '',
      task: body.task || '',
      hints: body.hints || [],
      successMessage: body.successMessage || '',
      successCriteria: body.successCriteria || '',
      validationRules: body.validationRules || [],
      defaultMethod: body.defaultMethod || 'GET',
      defaultUrl: body.defaultUrl || '',
      defaultHeaders: body.defaultHeaders || [],
      defaultBody: body.defaultBody || '',
      endpoints: body.endpoints || [],
      tip: body.tip || '',
      multiStep: body.multiStep || undefined,
      isBuiltIn: false,
      sortOrder: levels.length,
    };

    await upsertLevel(newLevel);

    return NextResponse.json(newLevel, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
