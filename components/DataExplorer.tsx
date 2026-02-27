'use client';

import { useState, useEffect, useCallback } from 'react';
import type { User, Product, Order } from '@/lib/store';

interface AllData {
  users:    User[];
  products: Product[];
  orders:   Order[];
}

interface DataExplorerProps {
  open: boolean;
  onClose: () => void;
  /** Bump this to trigger a refresh from outside (e.g. after every Send) */
  refreshToken: number;
}

type Table = 'users' | 'products' | 'orders';

const TABLE_ICONS: Record<Table, string> = {
  users:    '👤',
  products: '📦',
  orders:   '🛒',
};

/* ── tiny helper: render a cell value nicely ── */
function Cell({ value }: { value: unknown }) {
  if (value === null || value === undefined) return <span className="text-[var(--color-text-faint)] italic">null</span>;
  if (typeof value === 'boolean')
    return (
      <span className={value ? 'text-emerald-400' : 'text-red-400'}>
        {String(value)}
      </span>
    );
  if (typeof value === 'number') return <span className="text-[var(--color-json-number)]">{String(value)}</span>;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value))
    return <span className="text-[var(--color-text-muted)] text-[10px]">{value.replace('T', ' ').replace('Z', '')}</span>;
  return <span className="text-[var(--color-json-string)]">{String(value)}</span>;
}

export default function DataExplorer({ open, onClose, refreshToken }: DataExplorerProps) {
  const [data,    setData]    = useState<AllData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [table,   setTable]   = useState<Table>('users');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/data');
      const json = await res.json() as AllData;
      setData(json);
    } catch {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on open and whenever refreshToken changes
  useEffect(() => {
    if (open) fetchData();
  }, [open, refreshToken, fetchData]);

  if (!open) return null;

  const rows    = data ? data[table] : [];
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
  const count   = rows.length;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Drawer — slides up from the bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-[var(--color-bg-deepest)] border-t border-[var(--color-border-primary)] rounded-t-xl shadow-2xl"
           style={{ height: '60vh' }}>

        {/* Header bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border-primary)] bg-[var(--color-bg-panel)] rounded-t-xl shrink-0">
          <svg className="w-4 h-4 text-[#FF6C37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/>
          </svg>
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">Mock Database</span>
          <span className="text-xs text-[var(--color-text-dimmed)]">Live view of server-side data</span>

          {/* Table tabs */}
          <div className="flex gap-1 ml-4">
            {(['users', 'products', 'orders'] as Table[]).map(t => (
              <button
                key={t}
                onClick={() => setTable(t)}
                className={`
                  flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors
                  ${table === t
                    ? 'bg-[#FF6C37] text-white'
                    : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'}
                `}
              >
                <span>{TABLE_ICONS[t]}</span>
                {t}
                {data && (
                  <span className={`text-[10px] px-1 rounded-full font-bold ${
                    table === t ? 'bg-white/20 text-white' : 'bg-[var(--color-border-muted)] text-[var(--color-text-muted)]'
                  }`}>
                    {data[t].length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Refresh */}
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors px-2 py-1 rounded hover:bg-[var(--color-hover-overlay)] disabled:opacity-50"
          >
            <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Refresh
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-[var(--color-text-dimmed)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-hover-overlay)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Table area */}
        <div className="flex-1 overflow-auto">
          {error && (
            <div className="flex items-center gap-2 m-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
              {error}
            </div>
          )}

          {!error && loading && !data && (
            <div className="flex items-center justify-center h-full gap-2 text-[var(--color-text-dimmed)] text-sm">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Loading…
            </div>
          )}

          {data && columns.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-[var(--color-text-faint)] gap-2">
              <span className="text-3xl">🗑️</span>
              <p className="text-sm">This table is empty</p>
            </div>
          )}

          {data && columns.length > 0 && (
            <table className="w-full text-xs border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[var(--color-bg-panel)] border-b border-[var(--color-border-secondary)]">
                  {columns.map(col => (
                    <th key={col}
                        className="px-4 py-2.5 text-left font-semibold text-[var(--color-text-muted)] uppercase tracking-wider whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(rows as unknown as Record<string, unknown>[]).map((row, i) => (
                  <tr key={i}
                      className="border-b border-[var(--color-bg-subtle)] hover:bg-[var(--color-hover-overlay)] transition-colors">
                    {columns.map(col => (
                      <td key={col} className="px-4 py-2 font-mono whitespace-nowrap">
                        <Cell value={row[col]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer: row count */}
        {data && (
          <div className="px-4 py-2 border-t border-[var(--color-border-tertiary)] bg-[var(--color-bg-panel)] shrink-0 flex items-center gap-2">
            <span className="text-[11px] text-[var(--color-text-faint)]">
              {TABLE_ICONS[table]} <span className="capitalize">{table}</span>:{' '}
              <span className="text-[var(--color-text-muted)] font-semibold">{count}</span> row{count !== 1 ? 's' : ''}
            </span>
            <span className="text-[var(--color-text-faint)]">·</span>
            <span className="text-[11px] text-[var(--color-text-faint)]">
              Data resets each time the server restarts or you click <span className="text-[var(--color-text-muted)]">Reset Mock Data</span>
            </span>
          </div>
        )}
      </div>
    </>
  );
}
