import fs from 'fs';
import path from 'path';
import { levels as builtinLevels } from './levels';
import { builtinValidationMap } from './builtin-validation-map';
import type { LevelStorage, SerializableLevel } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'levels.json');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readStorage(): LevelStorage {
  ensureDir();
  if (!fs.existsSync(DATA_FILE)) {
    return { overrides: {}, custom: [], order: [] };
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw) as LevelStorage;
  } catch {
    return { overrides: {}, custom: [], order: [] };
  }
}

export function writeStorage(data: LevelStorage) {
  ensureDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function builtinToSerializable(level: typeof builtinLevels[number], index: number): SerializableLevel {
  const { validate, ...rest } = level;
  void validate;
  return {
    ...rest,
    validationRules: builtinValidationMap[level.id] || [],
    isBuiltIn: true,
    sortOrder: index,
  };
}

export function getMergedLevels(): SerializableLevel[] {
  const storage = readStorage();

  // Convert built-in levels to serializable
  const merged: SerializableLevel[] = builtinLevels.map((lvl, i) => {
    const base = builtinToSerializable(lvl, i);
    const override = storage.overrides[String(lvl.id)];
    if (override) {
      return { ...base, ...override, id: lvl.id, isBuiltIn: true };
    }
    return base;
  });

  // Add custom levels
  for (const custom of storage.custom) {
    merged.push({ ...custom, isBuiltIn: false });
  }

  // Apply ordering if defined
  if (storage.order.length > 0) {
    const orderMap = new Map(storage.order.map((id, idx) => [id, idx]));
    merged.sort((a, b) => {
      const ai = orderMap.has(a.id) ? orderMap.get(a.id)! : 9999;
      const bi = orderMap.has(b.id) ? orderMap.get(b.id)! : 9999;
      return ai - bi;
    });
  }

  // Update sortOrder to match final position
  merged.forEach((lvl, i) => { lvl.sortOrder = i; });

  return merged;
}

export function getNextCustomId(): number {
  const storage = readStorage();
  const builtinIds = builtinLevels.map(l => l.id);
  const customIds = storage.custom.map(l => l.id);
  const allIds = [...builtinIds, ...customIds];
  return Math.max(...allIds, 0) + 1;
}
