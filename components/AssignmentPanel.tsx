'use client';

import { useState } from 'react';
import { type Level, type Difficulty } from '@/lib/levels';

interface AssignmentPanelProps {
  level: Level;
  isComplete: boolean;
  onNextLevel: () => void;
  onReset: () => void;
  isLastLevel: boolean;
}

const difficultyStyle: Record<Difficulty, { bg: string; text: string; border: string }> = {
  Beginner: { bg: 'bg-emerald-400/10', text: 'text-emerald-400', border: 'border-emerald-400/30' },
  Easy:     { bg: 'bg-green-400/10',   text: 'text-green-400',   border: 'border-green-400/30'   },
  Medium:   { bg: 'bg-yellow-400/10',  text: 'text-yellow-400',  border: 'border-yellow-400/30'  },
  Hard:     { bg: 'bg-orange-400/10',  text: 'text-orange-400',  border: 'border-orange-400/30'  },
  Expert:   { bg: 'bg-red-400/10',     text: 'text-red-400',     border: 'border-red-400/30'     },
};

const methodColor: Record<string, string> = {
  GET:    'text-[#61AFFE] bg-[#61AFFE]/10 border-[#61AFFE]/30',
  POST:   'text-[#49CC90] bg-[#49CC90]/10 border-[#49CC90]/30',
  PUT:    'text-[#FCA130] bg-[#FCA130]/10 border-[#FCA130]/30',
  PATCH:  'text-[#50E3C2] bg-[#50E3C2]/10 border-[#50E3C2]/30',
  DELETE: 'text-[#F93E3E] bg-[#F93E3E]/10 border-[#F93E3E]/30',
};

export default function AssignmentPanel({ level, isComplete, onNextLevel, onReset, isLastLevel }: AssignmentPanelProps) {
  const [hintsOpen, setHintsOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  function copyUrl(path: string, index: number) {
    navigator.clipboard.writeText(path);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  }
  const diff = difficultyStyle[level.difficulty];

  return (
    <aside className="flex flex-col w-72 shrink-0 bg-[var(--color-bg-surface)] border-l border-[var(--color-border-primary)] overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-4 border-b border-[var(--color-border-primary)] bg-[var(--color-bg-panel)]">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-[10px] font-semibold text-[var(--color-text-faint)] uppercase tracking-wider">
            Level {level.id} of 20
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${diff.bg} ${diff.text} ${diff.border}`}>
            {level.difficulty}
          </span>
        </div>
        <h2 className="text-sm font-bold text-[var(--color-text-primary)] leading-tight">{level.title}</h2>
        <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--color-bg-elevated)]">
          <svg className="w-3 h-3 text-[#FF6C37]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
          </svg>
          <span className="text-[10px] text-[var(--color-text-muted)]">Concept:</span>
          <span className="text-[10px] text-[#FF6C37] font-semibold">{level.concept}</span>
        </div>
      </div>

      {/* Completion banner */}
      {isComplete && (
        <div className="mx-3 mt-3 p-3 rounded-lg bg-emerald-400/10 border border-emerald-400/30 success-pulse">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <div>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Level Complete!</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-300/80 mt-0.5">{level.successMessage}</p>
            </div>
          </div>
          {!isLastLevel && (
            <button
              onClick={onNextLevel}
              className="mt-2 w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 rounded text-xs font-semibold text-white transition-colors"
            >
              Next Level →
            </button>
          )}
          {isLastLevel && (
            <div className="mt-2 text-center text-xs text-emerald-700 dark:text-emerald-400 font-bold">
              🏆 You completed all 20 levels!
            </div>
          )}
        </div>
      )}

      {/* Scrollable content */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Concept */}
        <section>
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{level.description}</p>
        </section>

        {/* Task */}
        <section>
          <div className="flex items-center gap-1.5 mb-2">
            <svg className="w-3.5 h-3.5 text-[#FF6C37]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
            </svg>
            <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Your Task</span>
          </div>
          <div className="p-3 rounded-lg bg-[var(--color-bg-deepest)] border border-[var(--color-border-secondary)]">
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">{level.task}</p>
          </div>
        </section>

        {/* Success criteria */}
        <section>
          <div className="flex items-center gap-1.5 mb-1.5">
            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Success Criteria</span>
          </div>
          <p className="text-[11px] text-[var(--color-text-dimmed)] font-mono bg-[var(--color-bg-deepest)] px-3 py-2 rounded border border-[var(--color-border-tertiary)]">
            {level.successCriteria}
          </p>
        </section>

        {/* Hints (collapsible) */}
        <section>
          <button
            onClick={() => setHintsOpen(o => !o)}
            className="flex items-center gap-1.5 w-full text-left group"
          >
            <svg
              className={`w-3.5 h-3.5 text-yellow-400 transition-transform ${hintsOpen ? 'rotate-90' : ''}`}
              fill="currentColor" viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
            </svg>
            <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider group-hover:text-yellow-400 transition-colors">
              Hints ({level.hints.length})
            </span>
          </button>

          {hintsOpen && (
            <ul className="mt-2 space-y-1.5">
              {level.hints.map((hint, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-[var(--color-text-muted)]">
                  <span className="shrink-0 w-4 h-4 rounded-full bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-[9px] text-yellow-700 dark:text-yellow-400 font-bold mt-0.5">
                    {i + 1}
                  </span>
                  {hint}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Tip */}
        {level.tip && (
          <section className="p-3 rounded-lg bg-blue-400/5 border border-blue-400/20">
            <div className="flex items-start gap-2">
              <svg className="w-3.5 h-3.5 text-[var(--color-accent-tip-icon)] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
              <p className="text-[11px] text-[var(--color-accent-tip-text)] leading-relaxed">{level.tip}</p>
            </div>
          </section>
        )}

        {/* API Reference */}
        <section>
          <div className="flex items-center gap-1.5 mb-2">
            <svg className="w-3.5 h-3.5 text-[var(--color-text-dimmed)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span className="text-[11px] font-semibold text-[var(--color-text-dimmed)] uppercase tracking-wider">API Reference</span>
          </div>
          <div className="space-y-1.5">
            {level.endpoints.map((ep, i) => (
              <div key={i} className="group flex items-start gap-2 p-2 rounded bg-[var(--color-bg-deepest)] border border-[var(--color-border-tertiary)]">
                <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded border ${methodColor[ep.method] ?? 'text-gray-400 bg-gray-400/10 border-gray-400/30'}`}>
                  {ep.method}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <code className="text-[11px] text-[var(--color-json-key)] font-mono">{ep.path}</code>
                    {ep.requiresAuth && (
                      <span className="text-[9px] px-1 py-0.5 rounded bg-[var(--color-accent-auth-bg)] border border-[var(--color-accent-auth-border)] text-[var(--color-accent-auth-text)]">
                        🔒 Auth
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[var(--color-text-faint)] mt-0.5">{ep.description}</p>
                  {ep.exampleBody && (
                    <code className="block text-[10px] text-[var(--color-text-faint)] mt-1 font-mono break-all">{ep.exampleBody}</code>
                  )}
                </div>
                <button
                  onClick={() => copyUrl(ep.path, i)}
                  title="Copy URL"
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-[var(--color-text-faint)] hover:text-[var(--color-text-muted)]"
                >
                  {copiedIndex === i ? (
                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Reset data button */}
      <div className="px-4 py-3 border-t border-[var(--color-border-primary)]">
        <button
          onClick={onReset}
          className="w-full py-1.5 text-xs text-[var(--color-text-dimmed)] hover:text-red-400 border border-[var(--color-border-primary)] hover:border-red-400/50 rounded transition-colors flex items-center justify-center gap-1.5"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Reset Mock Data
        </button>
      </div>
    </aside>
  );
}
