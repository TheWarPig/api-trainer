'use client';

import { useState } from 'react';

interface AdminLoginProps {
  onLogin: (token: string) => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        setError('Invalid password');
        setLoading(false);
        return;
      }

      const data = await res.json();
      sessionStorage.setItem('admin-token', data.token);
      onLogin(data.token);
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-deepest)]">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-8 bg-[var(--color-bg-surface)] rounded-lg border border-[var(--color-border-primary)]"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-md bg-[#FF6C37] flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-[var(--color-text-primary)]">Admin Panel</h1>
            <p className="text-xs text-[var(--color-text-dimmed)]">Level Management</p>
          </div>
        </div>

        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter admin password"
          autoFocus
          className="w-full px-3 py-2 text-sm rounded border bg-[var(--color-bg-elevated)] border-[var(--color-border-input)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:outline-none focus:border-[#FF6C37] transition-colors"
        />

        {error && (
          <p className="mt-2 text-xs text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          className="mt-4 w-full py-2 text-sm font-semibold rounded bg-[#FF6C37] text-white hover:bg-[#e55e2f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
