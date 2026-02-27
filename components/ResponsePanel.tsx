'use client';

import { useState } from 'react';

export interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: unknown;
  bodyRaw: string;
  time: number;
  size: number;
}

interface ResponsePanelProps {
  response: ResponseData | null;
  isLoading: boolean;
}

function statusColor(code: number): string {
  if (code < 300) return 'text-emerald-400';
  if (code < 400) return 'text-blue-400';
  if (code < 500) return 'text-yellow-400';
  return 'text-red-400';
}

function statusBg(code: number): string {
  if (code < 300) return 'bg-emerald-400/10 border-emerald-400/30';
  if (code < 400) return 'bg-blue-400/10 border-blue-400/30';
  if (code < 500) return 'bg-yellow-400/10 border-yellow-400/30';
  return 'bg-red-400/10 border-red-400/30';
}

function statusDot(code: number): string {
  if (code < 300) return 'bg-emerald-400';
  if (code < 400) return 'bg-blue-400';
  if (code < 500) return 'bg-yellow-400';
  return 'bg-red-400';
}

function formatJson(json: string): string {
  try {
    // Safely highlight JSON syntax
    const escaped = json
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return escaped.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      match => {
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            // key
            return `<span class="json-key">${match}</span>`;
          }
          // string value
          return `<span class="json-string">${match}</span>`;
        }
        if (/true|false/.test(match)) return `<span class="json-bool">${match}</span>`;
        if (/null/.test(match))       return `<span class="json-null">${match}</span>`;
        return `<span class="json-number">${match}</span>`;
      }
    );
  } catch {
    return json;
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

export default function ResponsePanel({ response, isLoading }: ResponsePanelProps) {
  const [tab, setTab] = useState<'body' | 'headers'>('body');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!response) return;
    copyToClipboard(response.bodyRaw);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const prettyBody = (() => {
    if (!response) return '';
    try {
      return JSON.stringify(JSON.parse(response.bodyRaw), null, 2);
    } catch {
      return response.bodyRaw;
    }
  })();

  return (
    <div className="flex flex-col border-t border-[var(--color-border-primary)] bg-[var(--color-bg-deepest)] h-full">
      {/* Response status bar */}
      <div className="flex items-center gap-3 px-3 py-2 bg-[var(--color-bg-surface)] border-b border-[var(--color-border-primary)] shrink-0">
        <span className="text-xs font-semibold text-[var(--color-text-dimmed)] uppercase tracking-wider">Response</span>

        {isLoading && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
            <svg className="animate-spin w-3.5 h-3.5 text-[#FF6C37]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Sending request…
          </div>
        )}

        {response && !isLoading && (
          <>
            {/* Status badge */}
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs font-bold ${statusBg(response.status)} ${statusColor(response.status)}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusDot(response.status)}`} />
              {response.status} {response.statusText}
            </div>

            {/* Time */}
            <div className="flex items-center gap-1 text-xs text-[var(--color-text-dimmed)]">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span className="text-[var(--color-text-secondary)]">{response.time}ms</span>
            </div>

            {/* Size */}
            <div className="flex items-center gap-1 text-xs text-[var(--color-text-dimmed)]">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/>
              </svg>
              <span className="text-[var(--color-text-secondary)]">{formatSize(response.size)}</span>
            </div>

            {/* Tabs */}
            <div className="ml-auto flex gap-0 border border-[var(--color-border-primary)] rounded overflow-hidden text-xs">
              {(['body', 'headers'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1 capitalize transition-colors ${
                    tab === t ? 'bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="text-xs text-[var(--color-text-dimmed)] hover:text-[var(--color-text-secondary)] transition-colors flex items-center gap-1"
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                  </svg>
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                  Copy
                </>
              )}
            </button>
          </>
        )}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        {!response && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-[var(--color-text-faint)]">
            <svg className="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
            <p className="text-sm">Hit Send to get a response</p>
            <p className="text-xs opacity-60">Ctrl+Enter / Cmd+Enter to send</p>
          </div>
        )}

        {response && tab === 'body' && (
          <pre
            className="p-4 text-xs font-mono leading-relaxed text-[var(--color-text-secondary)] whitespace-pre-wrap break-all"
            dangerouslySetInnerHTML={{ __html: formatJson(prettyBody) }}
          />
        )}

        {response && tab === 'headers' && (
          <div className="p-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[var(--color-text-faint)] text-left border-b border-[var(--color-border-tertiary)]">
                  <th className="pb-2 font-medium uppercase tracking-wider pr-6">Key</th>
                  <th className="pb-2 font-medium uppercase tracking-wider">Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(response.headers).map(([k, v]) => (
                  <tr key={k} className="border-b border-[var(--color-bg-subtle)] hover:bg-[var(--color-hover-overlay)]">
                    <td className="py-1.5 pr-6 font-mono text-[var(--color-json-key)]">{k}</td>
                    <td className="py-1.5 font-mono text-[var(--color-json-string)] break-all">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
