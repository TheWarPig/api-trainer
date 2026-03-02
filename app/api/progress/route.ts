import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql, ensureProgressTable } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await ensureProgressTable();

  const rows = await sql`
    SELECT completed_levels, tutorial_seen
    FROM user_progress
    WHERE clerk_user_id = ${userId}
  `;

  if (rows.length === 0) {
    return NextResponse.json({ completedLevels: [], tutorialSeen: false });
  }

  return NextResponse.json({
    completedLevels: rows[0].completed_levels,
    tutorialSeen: rows[0].tutorial_seen,
  });
}

export async function PUT(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await ensureProgressTable();

  const body = await request.json();
  const completedLevels = body.completedLevels ?? [];
  const tutorialSeen = body.tutorialSeen ?? false;

  await sql`
    INSERT INTO user_progress (clerk_user_id, completed_levels, tutorial_seen, updated_at)
    VALUES (${userId}, ${JSON.stringify(completedLevels)}::jsonb, ${tutorialSeen}, now())
    ON CONFLICT (clerk_user_id) DO UPDATE SET
      completed_levels = ${JSON.stringify(completedLevels)}::jsonb,
      tutorial_seen = ${tutorialSeen},
      updated_at = now()
  `;

  return NextResponse.json({ ok: true });
}
