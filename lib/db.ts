import { neon } from '@netlify/neon';
import { levels as builtinLevels } from './levels';
import { builtinValidationMap } from './builtin-validation-map';
import type { SerializableLevel } from './types';

const sql = neon();

let initPromise: Promise<void> | null = null;

const SEED_ORDER = [1,2,3,4,12,13,14,5,6,7,11,15,16,8,9,17,18,19,10,20];

function buildSeedData(): SerializableLevel[] {
  const byId = new Map<number, SerializableLevel>();

  for (const level of builtinLevels) {
    const { validate, ...rest } = level;
    void validate;
    byId.set(level.id, {
      ...rest,
      validationRules: builtinValidationMap[level.id] || [],
      isBuiltIn: true,
      sortOrder: 0,
    });
  }

  const ordered: SerializableLevel[] = [];
  for (const id of SEED_ORDER) {
    const lvl = byId.get(id);
    if (lvl) {
      lvl.sortOrder = ordered.length;
      ordered.push(lvl);
    }
  }

  return ordered;
}

export function rowToLevel(row: Record<string, unknown>): SerializableLevel {
  return {
    id: row.id as number,
    sortOrder: row.sort_order as number,
    isBuiltIn: row.is_built_in as boolean,
    title: row.title as string,
    difficulty: row.difficulty as SerializableLevel['difficulty'],
    concept: row.concept as string,
    description: row.description as string,
    task: row.task as string,
    hints: row.hints as string[],
    successMessage: row.success_message as string,
    successCriteria: row.success_criteria as string,
    validationRules: row.validation_rules as SerializableLevel['validationRules'],
    defaultMethod: row.default_method as string,
    defaultUrl: row.default_url as string,
    defaultHeaders: (row.default_headers ?? undefined) as SerializableLevel['defaultHeaders'],
    defaultBody: (row.default_body ?? undefined) as string | undefined,
    endpoints: row.endpoints as SerializableLevel['endpoints'],
    tip: (row.tip ?? undefined) as string | undefined,
    multiStep: (row.multi_step ?? undefined) as SerializableLevel['multiStep'],
  };
}

async function doInit() {
  await sql`DROP TABLE IF EXISTS level_storage`;

  await sql`
    CREATE TABLE IF NOT EXISTS levels (
      id          INTEGER PRIMARY KEY,
      sort_order  INTEGER NOT NULL DEFAULT 0,
      is_built_in BOOLEAN NOT NULL DEFAULT false,
      title       TEXT NOT NULL DEFAULT '',
      difficulty  TEXT NOT NULL DEFAULT 'Easy',
      concept     TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      task        TEXT NOT NULL DEFAULT '',
      hints       JSONB NOT NULL DEFAULT '[]',
      success_message   TEXT NOT NULL DEFAULT '',
      success_criteria  TEXT NOT NULL DEFAULT '',
      validation_rules  JSONB NOT NULL DEFAULT '[]',
      default_method    TEXT NOT NULL DEFAULT 'GET',
      default_url       TEXT NOT NULL DEFAULT '',
      default_headers   JSONB,
      default_body      TEXT,
      endpoints         JSONB NOT NULL DEFAULT '[]',
      tip               TEXT,
      multi_step        JSONB
    )
  `;

  const count = await sql`SELECT COUNT(*) as cnt FROM levels`;
  if (Number(count[0].cnt) === 0) {
    const seedData = buildSeedData();
    for (const level of seedData) {
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
      `;
    }
  }
}

export async function ensureTable() {
  if (!initPromise) {
    initPromise = doInit();
  }
  await initPromise;
}

export { sql };
