import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/admin-auth';
import { getMergedLevels, readStorage, writeStorage } from '@/lib/level-storage';
import { levels as builtinLevels } from '@/lib/levels';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = Number(params.id);
  const levels = getMergedLevels();
  const level = levels.find(l => l.id === id);

  if (!level) {
    return NextResponse.json({ error: 'Level not found' }, { status: 404 });
  }

  return NextResponse.json(level);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = Number(params.id);
  const storage = readStorage();
  const isBuiltIn = builtinLevels.some(l => l.id === id);

  try {
    const body = await request.json();

    if (isBuiltIn) {
      // Store as override — only changed fields
      const { isBuiltIn: _ib, sortOrder: _so, id: _id, ...overrideData } = body;
      storage.overrides[String(id)] = overrideData;
    } else {
      // Update custom level in place
      const idx = storage.custom.findIndex(l => l.id === id);
      if (idx === -1) {
        return NextResponse.json({ error: 'Level not found' }, { status: 404 });
      }
      storage.custom[idx] = { ...storage.custom[idx], ...body, id, isBuiltIn: false };
    }

    writeStorage(storage);

    const levels = getMergedLevels();
    const updated = levels.find(l => l.id === id);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = Number(params.id);
  const isBuiltIn = builtinLevels.some(l => l.id === id);

  if (isBuiltIn) {
    // For built-in levels, remove overrides to reset to default
    const storage = readStorage();
    delete storage.overrides[String(id)];
    storage.order = storage.order.filter(oid => oid !== id);
    writeStorage(storage);
    return NextResponse.json({ message: 'Built-in level reset to defaults' });
  }

  const storage = readStorage();
  const idx = storage.custom.findIndex(l => l.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: 'Level not found' }, { status: 404 });
  }

  storage.custom.splice(idx, 1);
  storage.order = storage.order.filter(oid => oid !== id);
  writeStorage(storage);

  return NextResponse.json({ message: 'Level deleted' });
}
