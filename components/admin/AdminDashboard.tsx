'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserButton } from '@clerk/nextjs';
import type { SerializableLevel, Difficulty } from '@/lib/types';
import LevelEditor from './LevelEditor';

const difficultyColor: Record<Difficulty, string> = {
  Beginner: 'text-emerald-400',
  Easy:     'text-green-400',
  Medium:   'text-yellow-400',
  Hard:     'text-orange-400',
  Expert:   'text-red-400',
};

const difficultyBg: Record<Difficulty, string> = {
  Beginner: 'bg-emerald-400/10',
  Easy:     'bg-green-400/10',
  Medium:   'bg-yellow-400/10',
  Hard:     'bg-orange-400/10',
  Expert:   'bg-red-400/10',
};

export default function AdminDashboard() {
  const [levels, setLevels] = useState<SerializableLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Partial<SerializableLevel> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const fetchLevels = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/levels');
      if (!res.ok) {
        setError('Failed to load levels');
        return;
      }
      const data = await res.json();
      setLevels(data);
      setError('');
    } catch {
      setError('Failed to load levels');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLevels(); }, [fetchLevels]);

  const handleEdit = (level: SerializableLevel) => {
    setEditing({ ...level });
    setIsNew(false);
  };

  const handleNew = () => {
    setEditing({
      title: '',
      difficulty: 'Easy',
      concept: '',
      description: '',
      task: '',
      hints: [],
      successMessage: '',
      successCriteria: '',
      validationRules: [],
      defaultMethod: 'GET',
      defaultUrl: '',
      defaultHeaders: [],
      defaultBody: '',
      endpoints: [],
      tip: '',
      isBuiltIn: false,
      sortOrder: levels.length,
    });
    setIsNew(true);
  };

  const handleSave = async (data: Partial<SerializableLevel>) => {
    setSaving(true);
    try {
      const url = isNew ? '/api/admin/levels' : `/api/admin/levels/${data.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || 'Failed to save');
        setSaving(false);
        return;
      }

      setEditing(null);
      await fetchLevels();
    } catch {
      setError('Failed to save level');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (level: SerializableLevel) => {
    const msg = level.isBuiltIn
      ? `Reset "${level.title}" to defaults? This removes all edits.`
      : `Delete "${level.title}"? This cannot be undone.`;

    if (!confirm(msg)) return;

    try {
      const res = await fetch(`/api/admin/levels/${level.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || 'Failed to delete');
        return;
      }
      await fetchLevels();
    } catch {
      setError('Failed to delete level');
    }
  };

  // ── Drag-and-drop reorder ──
  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    const newLevels = [...levels];
    const [moved] = newLevels.splice(dragIndex, 1);
    newLevels.splice(index, 0, moved);
    setLevels(newLevels);
    setDragIndex(index);
  };

  const handleDragEnd = async () => {
    setDragIndex(null);
    // Save new order
    const order = levels.map(l => l.id);
    try {
      await fetch('/api/admin/levels/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order }),
      });
    } catch {
      setError('Failed to save order');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-deepest)]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-[var(--color-bg-surface)] border-b border-[var(--color-border-primary)] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-[#FF6C37] flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-[var(--color-text-primary)]">Level Manager</h1>
            <p className="text-xs text-[var(--color-text-dimmed)]">{levels.length} levels total</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="text-xs px-3 py-1.5 rounded border border-[var(--color-border-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-hover-overlay)] transition-colors"
          >
            Back to Trainer
          </a>
          <button
            onClick={handleNew}
            className="text-xs px-3 py-1.5 rounded bg-[#FF6C37] text-white hover:bg-[#e55e2f] font-semibold transition-colors"
          >
            + Add Level
          </button>
          <UserButton />
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="mx-6 mt-4 p-3 rounded bg-red-400/10 border border-red-400/30 text-xs text-red-400 flex items-center justify-between">
          {error}
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-300">&#x2715;</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-sm text-[var(--color-text-dimmed)]">
          Loading levels...
        </div>
      )}

      {/* Level table */}
      {!loading && (
        <div className="px-6 py-4 flex-1 overflow-y-auto">
          <div className="rounded-lg border border-[var(--color-border-primary)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--color-bg-surface)]">
                  <th className="w-8 px-3 py-2.5 text-left text-[10px] uppercase tracking-wider text-[var(--color-text-dimmed)]">#</th>
                  <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider text-[var(--color-text-dimmed)]">Title</th>
                  <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider text-[var(--color-text-dimmed)]">Difficulty</th>
                  <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider text-[var(--color-text-dimmed)]">Concept</th>
                  <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider text-[var(--color-text-dimmed)]">Type</th>
                  <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider text-[var(--color-text-dimmed)]">Rules</th>
                  <th className="px-3 py-2.5 text-right text-[10px] uppercase tracking-wider text-[var(--color-text-dimmed)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {levels.map((level, i) => (
                  <tr
                    key={level.id}
                    draggable
                    onDragStart={() => handleDragStart(i)}
                    onDragOver={e => handleDragOver(e, i)}
                    onDragEnd={handleDragEnd}
                    className={`
                      border-t border-[var(--color-border-secondary)] transition-colors cursor-grab active:cursor-grabbing
                      ${dragIndex === i ? 'bg-[#FF6C37]/10' : 'hover:bg-[var(--color-hover-overlay)]'}
                    `}
                  >
                    <td className="px-3 py-2.5 text-xs text-[var(--color-text-dimmed)] font-mono">
                      <span className="cursor-grab text-[var(--color-text-faint)] mr-1">&#x2807;</span>
                      {level.id}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs font-medium text-[var(--color-text-primary)]">{level.title}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded ${difficultyColor[level.difficulty]} ${difficultyBg[level.difficulty]}`}>
                        {level.difficulty}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-[var(--color-text-muted)]">{level.concept}</td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        level.isBuiltIn
                          ? 'bg-blue-400/10 text-blue-400'
                          : 'bg-purple-400/10 text-purple-400'
                      }`}>
                        {level.isBuiltIn ? 'Built-in' : 'Custom'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-[var(--color-text-dimmed)]">
                      {level.validationRules?.length || 0}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button
                        onClick={() => handleEdit(level)}
                        className="text-xs text-[#FF6C37] hover:text-[#e55e2f] mr-3 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(level)}
                        className={`text-xs transition-colors ${
                          level.isBuiltIn
                            ? 'text-yellow-400 hover:text-yellow-300'
                            : 'text-red-400 hover:text-red-300'
                        }`}
                      >
                        {level.isBuiltIn ? 'Reset' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-[10px] text-[var(--color-text-faint)] text-center">
            Drag rows to reorder levels. Changes are saved automatically.
          </p>
        </div>
      )}

      {/* Editor modal */}
      {editing && !saving && (
        <LevelEditor
          key={editing.id ?? 'new'}
          level={editing}
          isNew={isNew}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}

      {/* Saving overlay */}
      {saving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="px-6 py-4 rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] text-sm text-[var(--color-text-muted)]">
            Saving...
          </div>
        </div>
      )}
    </div>
  );
}
