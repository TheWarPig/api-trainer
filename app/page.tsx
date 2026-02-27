'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import RequestBuilder, { type HeaderRow } from '@/components/RequestBuilder';
import ResponsePanel, { type ResponseData } from '@/components/ResponsePanel';
import AssignmentPanel from '@/components/AssignmentPanel';
import DataExplorer from '@/components/DataExplorer';
import ApiDocs from '@/components/ApiDocs';
import { levels } from '@/lib/levels';

const STORAGE_KEY = 'api-trainer-completed';

function loadCompleted(): Set<number> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as number[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveCompleted(s: Set<number>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(s)));
  } catch {}
}

function buildHeaders(rows: HeaderRow[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const r of rows) {
    if (r.enabled && r.key.trim()) {
      out[r.key.trim()] = r.value;
    }
  }
  return out;
}

export default function Home() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set());
  const [justCompleted, setJustCompleted] = useState<Set<number>>(new Set());

  // Request builder state
  const [method,  setMethod]  = useState('GET');
  const [url,     setUrl]     = useState('/api/users');
  const [headers, setHeaders] = useState<HeaderRow[]>([{ key: '', value: '', enabled: true }]);
  const [body,    setBody]    = useState('');

  // Response state
  const [response,      setResponse]      = useState<ResponseData | null>(null);
  const [isLoading,     setIsLoading]     = useState(false);
  const [sendError,     setSendError]     = useState('');

  // Data explorer
  const [explorerOpen,  setExplorerOpen]  = useState(false);
  const [refreshToken,  setRefreshToken]  = useState(0);

  // API docs
  const [docsOpen, setDocsOpen] = useState(false);

  // Theme
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  }, []);

  // Sync isDark state with the actual class on mount
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const responseRef = useRef<HTMLDivElement>(null);

  // Load completed from localStorage
  useEffect(() => {
    const c = loadCompleted();
    setCompletedLevels(c);
    setJustCompleted(c);
  }, []);

  // Apply level defaults when switching levels
  const applyLevel = useCallback((levelId: number) => {
    const lvl = levels.find(l => l.id === levelId);
    if (!lvl) return;
    setMethod('GET');
    setUrl('');
    setHeaders([{ key: '', value: '', enabled: true }]);
    setBody('');
    setResponse(null);
    setSendError('');
  }, []);

  const handleSelectLevel = useCallback((id: number) => {
    setCurrentLevel(id);
    applyLevel(id);
  }, [applyLevel]);

  useEffect(() => {
    applyLevel(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = useCallback(async () => {
    if (!url.trim()) return;
    setIsLoading(true);
    setSendError('');

    const resolvedUrl = url.startsWith('http')
      ? url
      : `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;

    const reqHeaders = buildHeaders(headers);
    const hasBody = ['POST', 'PUT', 'PATCH'].includes(method);

    const start = Date.now();

    try {
      const fetchOptions: RequestInit = {
        method,
        headers: reqHeaders,
      };
      if (hasBody && body.trim()) {
        fetchOptions.body = body;
      }

      const res = await fetch(resolvedUrl, fetchOptions);
      const elapsed = Date.now() - start;

      const resHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => { resHeaders[k] = v; });

      const rawText = await res.text();
      let parsed: unknown;
      try { parsed = JSON.parse(rawText); } catch { parsed = rawText; }

      const responseData: ResponseData = {
        status:     res.status,
        statusText: res.statusText || (res.ok ? 'OK' : 'Error'),
        headers:    resHeaders,
        body:       parsed,
        bodyRaw:    rawText,
        time:       elapsed,
        size:       new TextEncoder().encode(rawText).length,
      };

      setResponse(responseData);

      // Validate level
      const lvl = levels.find(l => l.id === currentLevel);
      if (lvl && !completedLevels.has(currentLevel)) {
        const passed = lvl.validate({
          method,
          url: resolvedUrl,
          requestHeaders: reqHeaders,
          requestBody:    hasBody && body.trim() ? (() => { try { return JSON.parse(body); } catch { return body; } })() : null,
          statusCode:     res.status,
          responseHeaders: resHeaders,
          responseBody:   parsed,
        });

        if (passed) {
          const next = new Set(completedLevels);
          next.add(currentLevel);
          setCompletedLevels(next);
          setJustCompleted(prev => new Set(Array.from(prev).concat(currentLevel)));
          saveCompleted(next);
        }
      }
    } catch (err: unknown) {
      const elapsed = Date.now() - start;
      const msg = err instanceof Error ? err.message : 'Network error';
      setSendError(msg);
      setResponse({
        status:     0,
        statusText: 'Network Error',
        headers:    {},
        body:       { error: msg },
        bodyRaw:    JSON.stringify({ error: msg }),
        time:       elapsed,
        size:       0,
      });
    } finally {
      setIsLoading(false);
      setRefreshToken(t => t + 1);
    }
  }, [url, method, headers, body, currentLevel, completedLevels]);

  const handleNextLevel = useCallback(() => {
    if (currentLevel < levels.length) {
      const next = currentLevel + 1;
      setCurrentLevel(next);
      applyLevel(next);
    }
  }, [currentLevel, applyLevel]);

  const handleReset = useCallback(async () => {
    try {
      await fetch('/api/reset', { method: 'POST' });
      setRefreshToken(t => t + 1);
    } catch {}
  }, []);

  const handleClearProgress = useCallback(() => {
    if (confirm('Reset all your progress? This cannot be undone.')) {
      const empty = new Set<number>();
      setCompletedLevels(empty);
      setJustCompleted(empty);
      saveCompleted(empty);
      setCurrentLevel(1);
      applyLevel(1);
    }
  }, [applyLevel]);

  const level = levels.find(l => l.id === currentLevel)!;
  const isComplete = justCompleted.has(currentLevel);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--color-bg-deepest)]">
      {/* ── Top Header ── */}
      <header className="flex items-center gap-4 px-4 py-2.5 bg-[var(--color-bg-surface)] border-b border-[var(--color-border-primary)] shrink-0 z-10">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-md bg-[#FF6C37] flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 9l3 3-3 3m5 0h3"/>
            </svg>
          </div>
          <div>
            <span className="text-sm font-bold text-[var(--color-text-primary)] tracking-tight">API Trainer</span>
            <span className="ml-2 text-[10px] text-[#FF6C37] font-semibold">QA Edition</span>
          </div>
        </div>

        {/* Center: level indicator */}
        <div className="flex-1 flex items-center justify-center gap-2">
          {levels.map(l => (
            <button
              key={l.id}
              onClick={() => {
                const isUnlocked = l.id === 1 || completedLevels.has(l.id - 1) || completedLevels.has(l.id);
                if (isUnlocked) handleSelectLevel(l.id);
              }}
              title={l.title}
              className={`
                w-6 h-6 rounded-full text-[10px] font-bold transition-all shrink-0
                ${l.id === currentLevel
                  ? 'bg-[#FF6C37] text-white scale-110 shadow-lg shadow-[#FF6C37]/30'
                  : completedLevels.has(l.id)
                    ? 'bg-emerald-500/80 text-white hover:bg-emerald-500'
                    : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-dimmed)] hover:bg-[var(--color-bg-hover)]'
                }
              `}
            >
              {completedLevels.has(l.id) && l.id !== currentLevel ? '✓' : l.id}
            </button>
          ))}
          <span className="ml-2 text-xs text-[var(--color-text-dimmed)]">
            {completedLevels.size}/{levels.length} complete
          </span>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* API Docs toggle */}
          <button
            onClick={() => setDocsOpen(o => !o)}
            className={`
              flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border transition-colors font-medium
              ${docsOpen
                ? 'bg-blue-400/20 border-blue-400/50 text-blue-400'
                : 'bg-[var(--color-bg-elevated)] border-[var(--color-border-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:border-[#666]'}
            `}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            API Docs
          </button>

          {/* Data Explorer toggle */}
          <button
            onClick={() => setExplorerOpen(o => !o)}
            className={`
              flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border transition-colors font-medium
              ${explorerOpen
                ? 'bg-[#FF6C37]/20 border-[#FF6C37]/50 text-[#FF6C37]'
                : 'bg-[var(--color-bg-elevated)] border-[var(--color-border-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:border-[#666]'}
            `}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/>
            </svg>
            DB Explorer
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-7 h-7 flex items-center justify-center rounded-md text-[var(--color-text-dimmed)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-hover-overlay)] transition-colors"
            title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
              </svg>
            )}
          </button>

          <button
            onClick={handleClearProgress}
            className="text-xs text-[var(--color-text-faint)] hover:text-[var(--color-text-secondary)] transition-colors px-2 py-1 rounded hover:bg-[var(--color-hover-overlay)]"
          >
            Clear Progress
          </button>
        </div>
      </header>

      {/* ── Main 3-Column Layout ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Levels sidebar */}
        <Sidebar
          currentLevel={currentLevel}
          completedLevels={completedLevels}
          onSelectLevel={handleSelectLevel}
        />

        {/* Center: Request + Response */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Request builder (top ~55%) */}
          <div style={{ height: '55%' }} className="overflow-hidden border-b border-[var(--color-border-primary)]">
            <RequestBuilder
              method={method}
              url={url}
              headers={headers}
              body={body}
              isSending={isLoading}
              onMethodChange={setMethod}
              onUrlChange={setUrl}
              onHeadersChange={setHeaders}
              onBodyChange={setBody}
              onSend={handleSend}
            />
          </div>

          {/* Response panel (bottom ~45%) */}
          <div ref={responseRef} className="overflow-hidden" style={{ height: '45%' }}>
            <ResponsePanel response={response} isLoading={isLoading} />
          </div>

          {/* Error banner */}
          {sendError && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 max-w-sm">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              {sendError}
            </div>
          )}
        </main>

        {/* Right: Assignment panel */}
        <AssignmentPanel
          level={level}
          isComplete={isComplete}
          onNextLevel={handleNextLevel}
          onReset={handleReset}
          isLastLevel={currentLevel === levels.length}
        />
      </div>

      {/* ── API Docs Panel ── */}
      <ApiDocs open={docsOpen} onClose={() => setDocsOpen(false)} />

      {/* ── Data Explorer Drawer ── */}
      <DataExplorer
        open={explorerOpen}
        onClose={() => setExplorerOpen(false)}
        refreshToken={refreshToken}
      />
    </div>
  );
}
