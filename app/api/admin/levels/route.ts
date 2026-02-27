import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/admin-auth';
import { getMergedLevels, readStorage, writeStorage, getNextCustomId } from '@/lib/level-storage';
import type { SerializableLevel } from '@/lib/types';

export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const levels = getMergedLevels();
  return NextResponse.json(levels);
}

export async function POST(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const storage = readStorage();

    const newId = getNextCustomId();
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
      sortOrder: getMergedLevels().length,
    };

    storage.custom.push(newLevel);
    // Add to order
    if (storage.order.length > 0) {
      storage.order.push(newId);
    }
    writeStorage(storage);

    return NextResponse.json(newLevel, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
