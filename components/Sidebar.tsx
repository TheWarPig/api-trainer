'use client';

import type { Difficulty } from '@/lib/types';

interface LevelLike {
  id: number;
  title: string;
  difficulty: Difficulty;
}

interface SidebarProps {
  levels: LevelLike[];
  currentLevel: number;
  completedLevels: Set<number>;
  onSelectLevel: (id: number) => void;
}

const difficultyColor: Record<Difficulty, string> = {
  Beginner: 'text-emerald-400',
  Easy:     'text-green-400',
  Medium:   'text-yellow-400',
  Hard:     'text-orange-400',
  Expert:   'text-red-400',
};

const difficultyDot: Record<Difficulty, string> = {
  Beginner: 'bg-emerald-400',
  Easy:     'bg-green-400',
  Medium:   'bg-yellow-400',
  Hard:     'bg-orange-400',
  Expert:   'bg-red-400',
};

export default function Sidebar({ levels, currentLevel, completedLevels, onSelectLevel }: SidebarProps) {
  const completed = completedLevels.size;

  return (
    <aside className="flex flex-col w-56 shrink-0 bg-[var(--color-bg-surface)] border-r border-[var(--color-border-primary)] min-h-0">
      {/* Header */}
      <div className="px-4 py-4 border-b border-[var(--color-border-primary)]">
        <div className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-dimmed)] mb-1">Progress</div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl font-bold text-[var(--color-text-primary)]">{completed}</span>
          <span className="text-[var(--color-text-dimmed)] text-sm">/ {levels.length} levels</span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-[var(--color-border-primary)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FF6C37] rounded-full transition-all duration-500"
            style={{ width: `${(completed / levels.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Level list */}
      <nav className="flex-1 overflow-y-auto py-2">
        {levels.map((level, idx) => {
          const isCompleted = completedLevels.has(level.id);
          const isActive    = currentLevel === level.id;
          const isLocked    = false;

          return (
            <button
              key={level.id}
              onClick={() => !isLocked && onSelectLevel(level.id)}
              disabled={isLocked}
              className={`
                w-full text-left px-3 py-2.5 flex items-start gap-2.5 transition-colors
                ${isActive    ? 'bg-[#FF6C37]/20 border-l-2 border-[#FF6C37]' : 'border-l-2 border-transparent'}
                ${isLocked    ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[var(--color-hover-overlay)] cursor-pointer'}
              `}
            >
              {/* Status icon */}
              <span className="mt-0.5 shrink-0 w-5 h-5 flex items-center justify-center text-sm">
                {isCompleted ? (
                  <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                ) : isLocked ? (
                  <svg className="w-3.5 h-3.5 text-[var(--color-text-faint)]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                  </svg>
                ) : (
                  <span className={`text-xs font-bold ${isActive ? 'text-[#FF6C37]' : 'text-[var(--color-text-dimmed)]'}`}>
                    {idx + 1}
                  </span>
                )}
              </span>

              {/* Text */}
              <span className="flex-1 min-w-0">
                <span className={`block text-[11px] font-medium leading-tight truncate ${
                  isActive ? 'text-[var(--color-text-primary)]' : isCompleted ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-text-muted)]'
                }`}>
                  {level.title}
                </span>
                <span className={`flex items-center gap-1 mt-0.5 text-[10px] ${difficultyColor[level.difficulty]}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${difficultyDot[level.difficulty]}`} />
                  {level.difficulty}
                </span>
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[var(--color-border-primary)] shrink-0">
        <div className="text-[10px] text-[var(--color-text-faint)] text-center">
          API Trainer
        </div>
      </div>
    </aside>
  );
}
