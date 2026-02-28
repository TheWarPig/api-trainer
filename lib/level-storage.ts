import { ensureTable, sql, rowToLevel } from './db';
import type { SerializableLevel } from './types';

export async function getAllLevels(): Promise<SerializableLevel[]> {
  await ensureTable();
  // Note: ORDER BY is done in JS because the neon driver has a bug
  // where SELECT * with ORDER BY on an integer column can drop rows.
  const rows = await sql`SELECT * FROM levels`;
  return rows
    .map(row => rowToLevel(row as Record<string, unknown>))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export const getMergedLevels = getAllLevels;

export async function getLevelById(id: number): Promise<SerializableLevel | null> {
  await ensureTable();
  const rows = await sql`SELECT * FROM levels WHERE id = ${id}`;
  if (rows.length === 0) return null;
  return rowToLevel(rows[0] as Record<string, unknown>);
}

export async function upsertLevel(level: SerializableLevel): Promise<void> {
  await ensureTable();
  await sql`
    INSERT INTO levels (id, sort_order, is_built_in, title, difficulty, concept,
      description, task, hints, success_message, success_criteria, validation_rules,
      default_method, default_url, default_headers, default_body, endpoints, tip, multi_step)
    VALUES (
      ${level.id},
      ${level.sortOrder},
      ${level.isBuiltIn},
      ${level.title},
      ${level.difficulty},
      ${level.concept},
      ${level.description},
      ${level.task},
      ${JSON.stringify(level.hints)}::jsonb,
      ${level.successMessage},
      ${level.successCriteria},
      ${JSON.stringify(level.validationRules)}::jsonb,
      ${level.defaultMethod},
      ${level.defaultUrl},
      ${level.defaultHeaders ? JSON.stringify(level.defaultHeaders) : null}::jsonb,
      ${level.defaultBody ?? null},
      ${JSON.stringify(level.endpoints)}::jsonb,
      ${level.tip ?? null},
      ${level.multiStep ? JSON.stringify(level.multiStep) : null}::jsonb
    )
    ON CONFLICT (id) DO UPDATE SET
      sort_order = EXCLUDED.sort_order,
      is_built_in = EXCLUDED.is_built_in,
      title = EXCLUDED.title,
      difficulty = EXCLUDED.difficulty,
      concept = EXCLUDED.concept,
      description = EXCLUDED.description,
      task = EXCLUDED.task,
      hints = EXCLUDED.hints,
      success_message = EXCLUDED.success_message,
      success_criteria = EXCLUDED.success_criteria,
      validation_rules = EXCLUDED.validation_rules,
      default_method = EXCLUDED.default_method,
      default_url = EXCLUDED.default_url,
      default_headers = EXCLUDED.default_headers,
      default_body = EXCLUDED.default_body,
      endpoints = EXCLUDED.endpoints,
      tip = EXCLUDED.tip,
      multi_step = EXCLUDED.multi_step
  `;
}

export async function deleteLevel(id: number): Promise<void> {
  await ensureTable();
  await sql`DELETE FROM levels WHERE id = ${id}`;
}

export async function getNextCustomId(): Promise<number> {
  await ensureTable();
  const rows = await sql`SELECT MAX(id) as max_id FROM levels`;
  return (Number(rows[0].max_id) || 0) + 1;
}

export async function updateSortOrders(orderedIds: number[]): Promise<void> {
  await ensureTable();
  for (let i = 0; i < orderedIds.length; i++) {
    await sql`UPDATE levels SET sort_order = ${i} WHERE id = ${orderedIds[i]}`;
  }
}
