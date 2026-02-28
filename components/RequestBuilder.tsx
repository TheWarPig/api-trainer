'use client';

import { useState, useEffect } from 'react';

export interface HeaderRow {
  key: string;
  value: string;
  enabled: boolean;
}

interface ParamRow {
  key: string;
  value: string;
  enabled: boolean;
}

interface RequestBuilderProps {
  method: string;
  url: string;
  headers: HeaderRow[];
  body: string;
  isSending: boolean;
  onMethodChange: (m: string) => void;
  onUrlChange: (u: string) => void;
  onHeadersChange: (h: HeaderRow[]) => void;
  onBodyChange: (b: string) => void;
  onSend: () => void;
}

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const METHOD_COLORS: Record<string, string> = {
  GET:    'text-[#61AFFE]',
  POST:   'text-[#49CC90]',
  PUT:    'text-[#FCA130]',
  PATCH:  'text-[#50E3C2]',
  DELETE: 'text-[#F93E3E]',
};

const METHOD_BG: Record<string, string> = {
  GET:    'bg-[#61AFFE]/10 border-[#61AFFE]/30',
  POST:   'bg-[#49CC90]/10 border-[#49CC90]/30',
  PUT:    'bg-[#FCA130]/10 border-[#FCA130]/30',
  PATCH:  'bg-[#50E3C2]/10 border-[#50E3C2]/30',
  DELETE: 'bg-[#F93E3E]/10 border-[#F93E3E]/30',
};

function urlToParams(url: string): ParamRow[] {
  try {
    const u = new URL(url, 'http://x');
    const rows: ParamRow[] = [];
    u.searchParams.forEach((v, k) => rows.push({ key: k, value: v, enabled: true }));
    if (rows.length === 0) rows.push({ key: '', value: '', enabled: true });
    return rows;
  } catch {
    return [{ key: '', value: '', enabled: true }];
  }
}

function paramsToUrl(base: string, params: ParamRow[]): string {
  try {
    const u = new URL(base.split('?')[0], 'http://x');
    params.forEach(p => {
      if (p.enabled && p.key.trim()) u.searchParams.set(p.key.trim(), p.value);
    });
    const qs = u.searchParams.toString();
    const path = u.pathname;
    return qs ? `${path}?${qs}` : path;
  } catch {
    return base;
  }
}

export default function RequestBuilder({
  method, url, headers, body,
  isSending, onMethodChange, onUrlChange, onHeadersChange, onBodyChange, onSend,
}: RequestBuilderProps) {
  const [tab, setTab] = useState<'params' | 'headers' | 'body'>('headers');
  const [params, setParams] = useState<ParamRow[]>(() => urlToParams(url));
  const [bodyError, setBodyError] = useState('');

  // Sync params when url changes externally
  useEffect(() => {
    setParams(urlToParams(url));
  }, [url]);

  const handleParamChange = (i: number, field: keyof ParamRow, val: string | boolean) => {
    const next = params.map((p, idx) => idx === i ? { ...p, [field]: val } : p);
    setParams(next);
    onUrlChange(paramsToUrl(url, next));
  };

  const addParam = () => setParams(p => [...p, { key: '', value: '', enabled: true }]);
  const removeParam = (i: number) => {
    const next = params.filter((_, idx) => idx !== i);
    if (next.length === 0) next.push({ key: '', value: '', enabled: true });
    setParams(next);
    onUrlChange(paramsToUrl(url, next));
  };

  const handleHeaderChange = (i: number, field: keyof HeaderRow, val: string | boolean) => {
    onHeadersChange(headers.map((h, idx) => idx === i ? { ...h, [field]: val } : h));
  };
  const addHeader = () => onHeadersChange([...headers, { key: '', value: '', enabled: true }]);
  const removeHeader = (i: number) => onHeadersChange(headers.filter((_, idx) => idx !== i));

  const validateBody = (val: string) => {
    if (!val.trim()) { setBodyError(''); return; }
    try { JSON.parse(val); setBodyError(''); }
    catch { setBodyError('Invalid JSON'); }
  };

  const showBody = ['POST', 'PUT', 'PATCH'].includes(method);
  const activeHeaders = headers.filter(h => h.enabled && h.key.trim()).length;
  const activeParams  = params.filter(p => p.enabled && p.key.trim()).length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) onSend();
  };

  return (
    <div className="flex flex-col h-full">
      {/* URL Bar */}
      <div className="flex items-center gap-2 p-3 bg-[var(--color-bg-surface)] border-b border-[var(--color-border-primary)]">
        {/* Method selector */}
        <div className="relative">
          <select
            value={method}
            onChange={e => onMethodChange(e.target.value)}
            className={`
              appearance-none pl-2 pr-6 py-1.5 rounded border text-sm font-bold cursor-pointer
              bg-transparent outline-none transition-colors
              ${METHOD_COLORS[method] ?? 'text-[var(--color-text-secondary)]'}
              ${METHOD_BG[method] ?? 'bg-[var(--color-bg-elevated)] border-[var(--color-border-muted)]'}
            `}
          >
            {METHODS.map(m => (
              <option key={m} value={m} className="bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] font-bold">
                {m}
              </option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-1.5 top-2.5 w-3 h-3 text-[var(--color-text-dimmed)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Base URL tag */}
        <span className="text-xs text-[var(--color-text-faint)] shrink-0 font-mono">api-trainerx</span>

        {/* URL input */}
        <input
          type="text"
          value={url}
          onChange={e => { onUrlChange(e.target.value); setParams(urlToParams(e.target.value)); }}
          onKeyDown={handleKeyDown}
          placeholder="/api/users"
          spellCheck={false}
          className="flex-1 px-2 py-1.5 bg-[var(--color-bg-deepest)] border border-[var(--color-border-muted)] rounded text-sm font-mono text-[var(--color-text-secondary)] outline-none focus:border-[#FF6C37] transition-colors placeholder:text-[var(--color-text-faint)]"
        />

        {/* Send button */}
        <button
          onClick={onSend}
          disabled={isSending || !url.trim()}
          className="px-4 py-1.5 bg-[#FF6C37] hover:bg-[#e5602f] disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm font-semibold text-white transition-colors shrink-0 flex items-center gap-1.5"
        >
          {isSending ? (
            <>
              <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Sending
            </>
          ) : (
            'Send'
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border-primary)] bg-[var(--color-bg-surface)] text-sm">
        {(['params', 'headers', 'body'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`
              relative px-4 py-2 capitalize transition-colors
              ${tab === t ? 'text-[#FF6C37] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#FF6C37]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'}
            `}
          >
            {t}
            {t === 'params' && activeParams > 0 && (
              <span className="ml-1.5 px-1 py-0.5 text-[9px] rounded-full bg-[#FF6C37]/20 text-[#FF6C37] font-bold">{activeParams}</span>
            )}
            {t === 'headers' && activeHeaders > 0 && (
              <span className="ml-1.5 px-1 py-0.5 text-[9px] rounded-full bg-[#FF6C37]/20 text-[#FF6C37] font-bold">{activeHeaders}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-3 tab-content bg-[var(--color-bg-panel)]">
        {/* PARAMS tab */}
        {tab === 'params' && (
          <div className="space-y-2">
            <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-1.5 text-[10px] text-[var(--color-text-faint)] uppercase tracking-wider px-1">
              <span className="w-4" />
              <span>Key</span>
              <span>Value</span>
              <span className="w-6" />
            </div>
            {params.map((p, i) => (
              <div key={i} className="grid grid-cols-[auto_1fr_1fr_auto] gap-1.5 items-center">
                <input
                  type="checkbox"
                  checked={p.enabled}
                  onChange={e => handleParamChange(i, 'enabled', e.target.checked)}
                  className="w-4 h-4 accent-[#FF6C37]"
                />
                <input
                  value={p.key}
                  onChange={e => handleParamChange(i, 'key', e.target.value)}
                  placeholder="param_key"
                  className="px-2 py-1 bg-[var(--color-bg-deepest)] border border-[var(--color-border-input)] rounded text-xs font-mono text-[var(--color-text-secondary)] outline-none focus:border-[#FF6C37] placeholder:text-[var(--color-text-faint)]"
                />
                <input
                  value={p.value}
                  onChange={e => handleParamChange(i, 'value', e.target.value)}
                  placeholder="value"
                  className="px-2 py-1 bg-[var(--color-bg-deepest)] border border-[var(--color-border-input)] rounded text-xs font-mono text-[var(--color-text-secondary)] outline-none focus:border-[#FF6C37] placeholder:text-[var(--color-text-faint)]"
                />
                <button onClick={() => removeParam(i)} className="w-6 h-6 flex items-center justify-center text-[var(--color-text-faint)] hover:text-red-400 transition-colors">
                  ×
                </button>
              </div>
            ))}
            <button onClick={addParam} className="text-xs text-[#FF6C37] hover:text-[#e5602f] transition-colors mt-1">
              + Add Parameter
            </button>
          </div>
        )}

        {/* HEADERS tab */}
        {tab === 'headers' && (
          <div className="space-y-2">
            <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-1.5 text-[10px] text-[var(--color-text-faint)] uppercase tracking-wider px-1">
              <span className="w-4" />
              <span>Key</span>
              <span>Value</span>
              <span className="w-6" />
            </div>
            {headers.map((h, i) => (
              <div key={i} className="grid grid-cols-[auto_1fr_1fr_auto] gap-1.5 items-center">
                <input
                  type="checkbox"
                  checked={h.enabled}
                  onChange={e => handleHeaderChange(i, 'enabled', e.target.checked)}
                  className="w-4 h-4 accent-[#FF6C37]"
                />
                <input
                  value={h.key}
                  onChange={e => handleHeaderChange(i, 'key', e.target.value)}
                  placeholder="Header-Name"
                  className="px-2 py-1 bg-[var(--color-bg-deepest)] border border-[var(--color-border-input)] rounded text-xs font-mono text-[var(--color-text-secondary)] outline-none focus:border-[#FF6C37] placeholder:text-[var(--color-text-faint)]"
                />
                <input
                  value={h.value}
                  onChange={e => handleHeaderChange(i, 'value', e.target.value)}
                  placeholder="value"
                  className="px-2 py-1 bg-[var(--color-bg-deepest)] border border-[var(--color-border-input)] rounded text-xs font-mono text-[var(--color-text-secondary)] outline-none focus:border-[#FF6C37] placeholder:text-[var(--color-text-faint)]"
                />
                <button onClick={() => removeHeader(i)} className="w-6 h-6 flex items-center justify-center text-[var(--color-text-faint)] hover:text-red-400 transition-colors">
                  ×
                </button>
              </div>
            ))}
            <button onClick={addHeader} className="text-xs text-[#FF6C37] hover:text-[#e5602f] transition-colors mt-1">
              + Add Header
            </button>
          </div>
        )}

        {/* BODY tab */}
        {tab === 'body' && (
          <div className="flex flex-col gap-2 h-full">
            {!showBody && (
              <div className="text-xs text-[var(--color-text-dimmed)] italic px-1">
                {method} requests typically don&apos;t include a body.
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--color-text-dimmed)]">Format:</span>
              <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-bg-elevated)] text-[var(--color-json-string)] font-mono">JSON</span>
              {bodyError && (
                <span className="text-xs text-red-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  {bodyError}
                </span>
              )}
            </div>
            <textarea
              value={body}
              onChange={e => { onBodyChange(e.target.value); validateBody(e.target.value); }}
              onKeyDown={e => {
                if (e.key === 'Tab') {
                  e.preventDefault();
                  const ta = e.currentTarget;
                  const start = ta.selectionStart;
                  const end = ta.selectionEnd;
                  const newVal = body.substring(0, start) + '  ' + body.substring(end);
                  onBodyChange(newVal);
                  validateBody(newVal);
                  requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 2; });
                }
              }}
              placeholder='{  "key": "value"  }'
              spellCheck={false}
              className={`
                flex-1 min-h-[120px] px-3 py-2 bg-[var(--color-bg-deepest)] border rounded text-xs font-mono text-[var(--color-text-secondary)]
                outline-none focus:border-[#FF6C37] resize-none placeholder:text-[var(--color-text-faint)] transition-colors
                ${bodyError ? 'border-red-500/50' : 'border-[var(--color-border-input)]'}
              `}
            />
          </div>
        )}
      </div>
    </div>
  );
}
