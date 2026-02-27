'use client';

import type { SerializableLevel, Difficulty } from '@/lib/types';

interface LevelPreviewProps {
  level: Partial<SerializableLevel>;
}

const difficultyColor: Record<Difficulty, string> = {
  Beginner: 'text-emerald-400',
  Easy:     'text-green-400',
  Medium:   'text-yellow-400',
  Hard:     'text-orange-400',
  Expert:   'text-red-400',
};

export default function LevelPreview({ level }: LevelPreviewProps) {
  return (
    <div className="p-4 space-y-4 bg-[var(--color-bg-panel)] rounded-lg border border-[var(--color-border-secondary)] max-h-[60vh] overflow-y-auto">
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-[var(--color-text-primary)]">
          {level.title || 'Untitled Level'}
        </span>
        {level.difficulty && (
          <span className={`text-xs font-medium ${difficultyColor[level.difficulty]}`}>
            {level.difficulty}
          </span>
        )}
      </div>

      {level.concept && (
        <div className="text-xs text-[var(--color-text-dimmed)]">
          Concept: {level.concept}
        </div>
      )}

      {level.description && (
        <div>
          <h4 className="text-[10px] uppercase tracking-wider text-[var(--color-text-dimmed)] mb-1">Description</h4>
          <p className="text-xs text-[var(--color-text-secondary)] whitespace-pre-wrap">{level.description}</p>
        </div>
      )}

      {level.task && (
        <div>
          <h4 className="text-[10px] uppercase tracking-wider text-[var(--color-text-dimmed)] mb-1">Task</h4>
          <p className="text-xs text-[var(--color-text-secondary)] whitespace-pre-wrap">{level.task}</p>
        </div>
      )}

      {level.hints && level.hints.length > 0 && (
        <div>
          <h4 className="text-[10px] uppercase tracking-wider text-[var(--color-text-dimmed)] mb-1">Hints</h4>
          <ol className="list-decimal list-inside space-y-0.5">
            {level.hints.map((h, i) => (
              <li key={i} className="text-xs text-[var(--color-text-muted)]">{h}</li>
            ))}
          </ol>
        </div>
      )}

      {level.successCriteria && (
        <div>
          <h4 className="text-[10px] uppercase tracking-wider text-[var(--color-text-dimmed)] mb-1">Success Criteria</h4>
          <p className="text-xs text-emerald-400 font-mono">{level.successCriteria}</p>
        </div>
      )}

      {level.tip && (
        <div className="p-2 rounded bg-blue-400/10 border border-blue-400/20">
          <p className="text-xs text-blue-400">Tip: {level.tip}</p>
        </div>
      )}

      {level.defaultMethod && (
        <div>
          <h4 className="text-[10px] uppercase tracking-wider text-[var(--color-text-dimmed)] mb-1">Defaults</h4>
          <div className="text-xs text-[var(--color-text-muted)] font-mono space-y-0.5">
            <div>{level.defaultMethod} {level.defaultUrl}</div>
            {level.defaultHeaders?.map((h, i) => (
              <div key={i}>{h.key}: {h.value}</div>
            ))}
          </div>
        </div>
      )}

      {level.endpoints && level.endpoints.length > 0 && (
        <div>
          <h4 className="text-[10px] uppercase tracking-wider text-[var(--color-text-dimmed)] mb-1">API Reference</h4>
          <div className="space-y-1">
            {level.endpoints.map((ep, i) => (
              <div key={i} className="text-xs font-mono text-[var(--color-text-muted)]">
                <span className="text-[#FF6C37]">{ep.method}</span> {ep.path}
                {ep.requiresAuth && <span className="text-yellow-400 ml-1">(auth)</span>}
                <span className="text-[var(--color-text-faint)] ml-2">— {ep.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {level.validationRules && level.validationRules.length > 0 && (
        <div>
          <h4 className="text-[10px] uppercase tracking-wider text-[var(--color-text-dimmed)] mb-1">
            Validation ({level.validationRules.length} conditions)
          </h4>
          <div className="space-y-0.5">
            {level.validationRules.map((c, i) => (
              <div key={i} className="text-xs font-mono text-[var(--color-text-faint)]">
                {c.field}{c.key ? `[${c.key}]` : ''} {c.operator || '='} {String(c.value ?? '')}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
