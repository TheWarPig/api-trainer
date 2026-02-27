'use client';

import { useState } from 'react';
import type { SerializableLevel, Difficulty, ApiEndpoint } from '@/lib/types';
import ValidationBuilder from './ValidationBuilder';
import LevelPreview from './LevelPreview';

interface LevelEditorProps {
  level: Partial<SerializableLevel>;
  onSave: (level: Partial<SerializableLevel>) => void;
  onCancel: () => void;
  isNew?: boolean;
}

const TABS = ['Basic Info', 'Task', 'Defaults', 'API Reference', 'Validation', 'Multi-Step', 'Preview'] as const;
type Tab = typeof TABS[number];

const DIFFICULTIES: Difficulty[] = ['Beginner', 'Easy', 'Medium', 'Hard', 'Expert'];
const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

export default function LevelEditor({ level: initial, onSave, onCancel, isNew }: LevelEditorProps) {
  const [data, setData] = useState<Partial<SerializableLevel>>({ ...initial });
  const [tab, setTab] = useState<Tab>('Basic Info');

  const patch = (updates: Partial<SerializableLevel>) => setData(prev => ({ ...prev, ...updates }));

  const handleSave = () => {
    onSave(data);
  };

  // ── Dynamic list helpers ──
  const updateHint = (i: number, val: string) => {
    const hints = [...(data.hints || [])];
    hints[i] = val;
    patch({ hints });
  };
  const removeHint = (i: number) => patch({ hints: (data.hints || []).filter((_, j) => j !== i) });
  const addHint = () => patch({ hints: [...(data.hints || []), ''] });

  const updateHeader = (i: number, field: 'key' | 'value', val: string) => {
    const headers = [...(data.defaultHeaders || [])];
    headers[i] = { ...headers[i], [field]: val };
    patch({ defaultHeaders: headers });
  };
  const removeHeader = (i: number) => patch({ defaultHeaders: (data.defaultHeaders || []).filter((_, j) => j !== i) });
  const addHeader = () => patch({ defaultHeaders: [...(data.defaultHeaders || []), { key: '', value: '' }] });

  const updateEndpoint = (i: number, field: keyof ApiEndpoint, val: unknown) => {
    const eps = [...(data.endpoints || [])];
    eps[i] = { ...eps[i], [field]: val };
    patch({ endpoints: eps });
  };
  const removeEndpoint = (i: number) => patch({ endpoints: (data.endpoints || []).filter((_, j) => j !== i) });
  const addEndpoint = () => patch({ endpoints: [...(data.endpoints || []), { method: 'GET', path: '', description: '' }] });

  const updateStep = (i: number, val: string) => {
    const steps = [...(data.multiStep || [])];
    steps[i] = { label: val, done: false };
    patch({ multiStep: steps });
  };
  const removeStep = (i: number) => patch({ multiStep: (data.multiStep || []).filter((_, j) => j !== i) });
  const addStep = () => patch({ multiStep: [...(data.multiStep || []), { label: '', done: false }] });

  const inputClass = "w-full px-3 py-2 text-sm rounded border bg-[var(--color-bg-elevated)] border-[var(--color-border-input)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:outline-none focus:border-[#FF6C37] transition-colors";
  const labelClass = "block text-xs font-medium text-[var(--color-text-muted)] mb-1";
  const textareaClass = `${inputClass} resize-y min-h-[80px]`;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8">
      <div className="w-full max-w-3xl bg-[var(--color-bg-surface)] rounded-lg border border-[var(--color-border-primary)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-primary)]">
          <h2 className="text-base font-bold text-[var(--color-text-primary)]">
            {isNew ? 'Create New Level' : `Edit Level ${data.id || ''}`}
            {data.isBuiltIn && (
              <span className="ml-2 text-xs font-normal text-[var(--color-text-dimmed)]">(built-in)</span>
            )}
          </h2>
          <button onClick={onCancel} className="text-[var(--color-text-dimmed)] hover:text-[var(--color-text-primary)] text-lg">
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-3 border-b border-[var(--color-border-primary)] overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2 text-xs font-medium rounded-t transition-colors whitespace-nowrap ${
                tab === t
                  ? 'bg-[var(--color-bg-elevated)] text-[#FF6C37] border-b-2 border-[#FF6C37]'
                  : 'text-[var(--color-text-dimmed)] hover:text-[var(--color-text-muted)] hover:bg-[var(--color-hover-overlay)]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {/* ── Basic Info ── */}
          {tab === 'Basic Info' && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Title</label>
                <input className={inputClass} value={data.title || ''} onChange={e => patch({ title: e.target.value })} placeholder="Level title" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className={labelClass}>Difficulty</label>
                  <select
                    className={inputClass}
                    value={data.difficulty || 'Easy'}
                    onChange={e => patch({ difficulty: e.target.value as Difficulty })}
                  >
                    {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className={labelClass}>Concept</label>
                  <input className={inputClass} value={data.concept || ''} onChange={e => patch({ concept: e.target.value })} placeholder="e.g. HTTP GET" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea className={textareaClass} value={data.description || ''} onChange={e => patch({ description: e.target.value })} placeholder="Explain the concept being taught..." rows={4} />
              </div>
              <div>
                <label className={labelClass}>Tip (optional)</label>
                <input className={inputClass} value={data.tip || ''} onChange={e => patch({ tip: e.target.value })} placeholder="A helpful tip for the student" />
              </div>
            </div>
          )}

          {/* ── Task ── */}
          {tab === 'Task' && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Task Instructions</label>
                <textarea className={textareaClass} value={data.task || ''} onChange={e => patch({ task: e.target.value })} placeholder="Describe what the student needs to do..." rows={4} />
              </div>
              <div>
                <label className={labelClass}>Success Message</label>
                <input className={inputClass} value={data.successMessage || ''} onChange={e => patch({ successMessage: e.target.value })} placeholder="Message shown when level is completed" />
              </div>
              <div>
                <label className={labelClass}>Success Criteria (display text)</label>
                <input className={inputClass} value={data.successCriteria || ''} onChange={e => patch({ successCriteria: e.target.value })} placeholder="e.g. GET /api/users → 200 OK" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelClass}>Hints</label>
                  <button type="button" onClick={addHint} className="text-xs text-[#FF6C37] hover:text-[#e55e2f]">+ Add Hint</button>
                </div>
                {(data.hints || []).map((h, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <span className="text-xs text-[var(--color-text-dimmed)] mt-2 w-5">{i + 1}.</span>
                    <input className={`${inputClass} flex-1`} value={h} onChange={e => updateHint(i, e.target.value)} placeholder={`Hint ${i + 1}`} />
                    <button type="button" onClick={() => removeHint(i)} className="text-xs text-red-400 hover:text-red-300 px-2">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Defaults ── */}
          {tab === 'Defaults' && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-32">
                  <label className={labelClass}>Method</label>
                  <select
                    className={inputClass}
                    value={data.defaultMethod || 'GET'}
                    onChange={e => patch({ defaultMethod: e.target.value })}
                  >
                    {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className={labelClass}>URL</label>
                  <input className={inputClass} value={data.defaultUrl || ''} onChange={e => patch({ defaultUrl: e.target.value })} placeholder="/api/..." />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelClass}>Default Headers</label>
                  <button type="button" onClick={addHeader} className="text-xs text-[#FF6C37] hover:text-[#e55e2f]">+ Add Header</button>
                </div>
                {(data.defaultHeaders || []).map((h, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input className={`${inputClass} w-40`} value={h.key} onChange={e => updateHeader(i, 'key', e.target.value)} placeholder="Header name" />
                    <input className={`${inputClass} flex-1`} value={h.value} onChange={e => updateHeader(i, 'value', e.target.value)} placeholder="Header value" />
                    <button type="button" onClick={() => removeHeader(i)} className="text-xs text-red-400 hover:text-red-300 px-2">✕</button>
                  </div>
                ))}
              </div>
              <div>
                <label className={labelClass}>Default Body (JSON)</label>
                <textarea className={`${textareaClass} font-mono text-xs`} value={data.defaultBody || ''} onChange={e => patch({ defaultBody: e.target.value })} placeholder='{"key": "value"}' rows={6} />
              </div>
            </div>
          )}

          {/* ── API Reference ── */}
          {tab === 'API Reference' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <label className={labelClass}>Endpoints</label>
                <button type="button" onClick={addEndpoint} className="text-xs text-[#FF6C37] hover:text-[#e55e2f]">+ Add Endpoint</button>
              </div>
              {(data.endpoints || []).map((ep, i) => (
                <div key={i} className="p-3 rounded border border-[var(--color-border-secondary)] bg-[var(--color-bg-panel)] space-y-2">
                  <div className="flex gap-2">
                    <select
                      className={`${inputClass} w-24 shrink-0`}
                      value={ep.method}
                      onChange={e => updateEndpoint(i, 'method', e.target.value)}
                    >
                      {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <input className={`${inputClass} flex-1 min-w-0`} value={ep.path} onChange={e => updateEndpoint(i, 'path', e.target.value)} placeholder="/api/..." />
                    <button type="button" onClick={() => removeEndpoint(i)} className="text-xs text-red-400 hover:text-red-300 px-2">✕</button>
                  </div>
                  <input className={inputClass} value={ep.description} onChange={e => updateEndpoint(i, 'description', e.target.value)} placeholder="Description" />
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                      <input
                        type="checkbox"
                        checked={ep.requiresAuth || false}
                        onChange={e => updateEndpoint(i, 'requiresAuth', e.target.checked)}
                        className="rounded"
                      />
                      Requires Auth
                    </label>
                    <input
                      className={`${inputClass} flex-1`}
                      value={ep.exampleBody || ''}
                      onChange={e => updateEndpoint(i, 'exampleBody', e.target.value)}
                      placeholder="Example body (optional)"
                    />
                  </div>
                </div>
              ))}
              {(!data.endpoints || data.endpoints.length === 0) && (
                <div className="text-center py-4 text-xs text-[var(--color-text-faint)]">No endpoints defined.</div>
              )}
            </div>
          )}

          {/* ── Validation ── */}
          {tab === 'Validation' && (
            <ValidationBuilder
              conditions={data.validationRules || []}
              onChange={rules => patch({ validationRules: rules })}
            />
          )}

          {/* ── Multi-Step ── */}
          {tab === 'Multi-Step' && (
            <div className="space-y-4">
              <p className="text-xs text-[var(--color-text-dimmed)]">
                Optional: define step labels for multi-step levels (displayed as checkboxes to the student).
              </p>
              <div className="flex items-center justify-between mb-2">
                <label className={labelClass}>Steps</label>
                <button type="button" onClick={addStep} className="text-xs text-[#FF6C37] hover:text-[#e55e2f]">+ Add Step</button>
              </div>
              {(data.multiStep || []).map((s, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <span className="text-xs text-[var(--color-text-dimmed)] mt-2 w-5">{i + 1}.</span>
                  <input className={`${inputClass} flex-1`} value={s.label} onChange={e => updateStep(i, e.target.value)} placeholder="Step label" />
                  <button type="button" onClick={() => removeStep(i)} className="text-xs text-red-400 hover:text-red-300 px-2">✕</button>
                </div>
              ))}
              {(!data.multiStep || data.multiStep.length === 0) && (
                <div className="text-center py-4 text-xs text-[var(--color-text-faint)]">No steps defined (single-step level).</div>
              )}
            </div>
          )}

          {/* ── Preview ── */}
          {tab === 'Preview' && <LevelPreview level={data} />}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-border-primary)]">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded border border-[var(--color-border-hover)] text-[var(--color-text-muted)] hover:bg-[var(--color-hover-overlay)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-semibold rounded bg-[#FF6C37] text-white hover:bg-[#e55e2f] transition-colors"
          >
            {isNew ? 'Create Level' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
