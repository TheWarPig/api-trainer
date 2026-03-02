import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';
import { getLevelById, upsertLevel, deleteLevel, getAllLevels, updateSortOrders } from '@/lib/level-storage';
import { levels as builtinLevels } from '@/lib/levels';
import { builtinValidationMap } from '@/lib/builtin-validation-map';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  if (!await checkAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = Number(params.id);
  const level = await getLevelById(id);

  if (!level) {
    return NextResponse.json({ error: 'Level not found' }, { status: 404 });
  }

  return NextResponse.json(level);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!await checkAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = Number(params.id);
  const level = await getLevelById(id);

  if (!level) {
    return NextResponse.json({ error: 'Level not found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { id: _id, sortOrder: _so, ...updateData } = body;
    const updated = { ...level, ...updateData, id };
    await upsertLevel(updated);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!await checkAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = Number(params.id);
  const level = await getLevelById(id);

  if (!level) {
    return NextResponse.json({ error: 'Level not found' }, { status: 404 });
  }

  if (level.isBuiltIn) {
    // Reset built-in level to original defaults
    const builtin = builtinLevels.find(l => l.id === id);
    if (builtin) {
      const { validate, ...rest } = builtin;
      void validate;
      const resetLevel = {
        ...rest,
        validationRules: builtinValidationMap[id] || [],
        isBuiltIn: true as const,
        sortOrder: level.sortOrder,
      };
      await upsertLevel(resetLevel);
    }
    return NextResponse.json({ message: 'Built-in level reset to defaults' });
  }

  await deleteLevel(id);
  // Re-stamp sort orders for remaining levels
  const remaining = await getAllLevels();
  const orderedIds = remaining.map(l => l.id);
  await updateSortOrders(orderedIds);

  return NextResponse.json({ message: 'Level deleted' });
}
