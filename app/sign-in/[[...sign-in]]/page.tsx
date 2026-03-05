'use client';

import { SignIn } from '@clerk/nextjs';

/* ── Floating element data ── */

const METHODS = [
  { label: 'GET',    color: '#61AFFE' },
  { label: 'POST',   color: '#49CC90' },
  { label: 'PUT',    color: '#FCA130' },
  { label: 'PATCH',  color: '#50E3C2' },
  { label: 'DELETE', color: '#F93E3E' },
  { label: 'GET',    color: '#61AFFE' },
  { label: 'POST',   color: '#49CC90' },
  { label: 'DELETE', color: '#F93E3E' },
];

const STATUS_CODES = [
  { label: '200', color: '#49CC90' },
  { label: '201', color: '#49CC90' },
  { label: '204', color: '#49CC90' },
  { label: '301', color: '#61AFFE' },
  { label: '400', color: '#FCA130' },
  { label: '401', color: '#F93E3E' },
  { label: '403', color: '#F93E3E' },
  { label: '404', color: '#FCA130' },
  { label: '500', color: '#F93E3E' },
  { label: '503', color: '#F93E3E' },
];

const SYMBOLS = [
  { label: '{ }',   color: 'var(--color-text-dimmed)' },
  { label: '[ ]',   color: 'var(--color-text-dimmed)' },
  { label: ': ',     color: 'var(--color-text-dimmed)' },
  { label: '{ }',   color: 'var(--color-text-dimmed)' },
  { label: '"..."', color: 'var(--color-json-string)' },
  { label: 'null',  color: 'var(--color-json-null)' },
  { label: 'true',  color: 'var(--color-json-bool)' },
];

const ENDPOINTS = [
  { label: '/api/users',       color: 'var(--color-text-muted)' },
  { label: '/api/products',    color: 'var(--color-text-muted)' },
  { label: '/api/auth/login',  color: 'var(--color-text-muted)' },
  { label: '/api/orders',      color: 'var(--color-text-muted)' },
  { label: '/api/v2/items',    color: 'var(--color-text-muted)' },
  { label: '/api/search?q=',   color: 'var(--color-text-muted)' },
];

const HEADERS = [
  { label: 'Content-Type: application/json', color: 'var(--color-text-faint)' },
  { label: 'Authorization: Bearer ***',      color: 'var(--color-text-faint)' },
  { label: 'Accept: */*',                    color: 'var(--color-text-faint)' },
  { label: 'X-API-Key: ***',                 color: 'var(--color-text-faint)' },
];

/* Deterministic pseudo-random seed so positions are stable across renders */
function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

type FloatingItem = { label: string; color: string; kind: 'method' | 'status' | 'symbol' | 'endpoint' | 'header' };

const ALL_ITEMS: FloatingItem[] = [
  ...METHODS.map(m => ({ ...m, kind: 'method' as const })),
  ...STATUS_CODES.map(s => ({ ...s, kind: 'status' as const })),
  ...SYMBOLS.map(s => ({ ...s, kind: 'symbol' as const })),
  ...ENDPOINTS.map(e => ({ ...e, kind: 'endpoint' as const })),
  ...HEADERS.map(h => ({ ...h, kind: 'header' as const })),
];

/* Title letters for staggered animation */
const TITLE = 'API Trainer';

export default function SignInPage() {
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[var(--color-bg-deepest)] overflow-hidden">

      {/* ── Floating background elements ── */}
      <div className="absolute inset-0" aria-hidden="true">
        {ALL_ITEMS.map((item, i) => {
          const r = (seed: number) => seededRandom(i * 100 + seed);
          const top = r(1) * 90;                        // 0-90%
          const left = r(2) * 90;                       // 0-90%
          const opacity = 0.18 + r(3) * 0.22;           // 0.18-0.40
          const duration = 6 + r(4) * 10;               // 6-16s
          const delay = -(r(5) * 12);                   // stagger start
          const dx = (r(6) - 0.5) * 120;                // -60..60px
          const dy = (r(7) - 0.5) * 90;                 // -45..45px
          const fontSize = item.kind === 'header' ? 11 : item.kind === 'endpoint' ? 13 : item.kind === 'method' ? 15 : 14;

          const isPill = item.kind === 'method' || item.kind === 'status';

          return (
            <span
              key={`${item.label}-${i}`}
              className="sign-in-float"
              style={{
                top: `${top}%`,
                left: `${left}%`,
                fontSize,
                color: item.color,
                '--float-opacity': opacity,
                '--float-duration': `${duration}s`,
                '--float-delay': `${delay}s`,
                '--float-dx': `${dx}px`,
                '--float-dy': `${dy}px`,
                ...(isPill ? {
                  border: `1px solid`,
                  borderColor: item.color,
                  borderRadius: 8,
                  padding: '3px 10px',
                  backgroundColor: 'color-mix(in srgb, currentColor 8%, transparent)',
                } : {}),
              } as React.CSSProperties}
            >
              {item.label}
            </span>
          );
        })}
      </div>

      {/* ── Side-by-side: branding + sign-in ── */}
      <div className="sign-in-card-enter relative z-10 flex items-center gap-12 px-8 max-w-5xl">

        {/* Left — branding & description */}
        <div className="flex flex-col items-start gap-5 max-w-md shrink-0">
          {/* Logo + title row */}
          <div className="flex items-center gap-3">
            <div className="sign-in-logo-glow w-11 h-11 rounded-xl bg-[#FF6C37] flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 9l3 3-3 3m5 0h3" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
              {TITLE.split('').map((char, i) => (
                <span
                  key={i}
                  className="sign-in-letter"
                  style={{ animationDelay: `${0.3 + i * 0.05}s` }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </h1>
          </div>

          {/* Extended description */}
          <div className="sign-in-tagline flex flex-col gap-2.5">
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              API Trainer is an interactive learning platform designed to teach you
              how to work with REST APIs — from crafting your first GET request to
              mastering authentication, error handling, and complex workflows.
            </p>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              Follow guided, hands-on lessons that walk you through real API calls
              step by step. Build requests, inspect responses, understand status
              codes and headers — all inside a live sandbox with instant feedback.
              No setup required.
            </p>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              Whether you&apos;re a beginner exploring APIs for the first time or a
              developer looking to sharpen your skills, API Trainer gives you a safe,
              structured environment to practice and learn at your own pace.
            </p>
          </div>
        </div>

        {/* Right — Clerk sign-in widget */}
        <div className="shrink-0">
          <SignIn />
        </div>
      </div>
    </div>
  );
}
