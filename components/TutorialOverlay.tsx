'use client';

import { useEffect, useRef, useState } from 'react';

interface Step {
  type: 'fullscreen' | 'spotlight';
  targetId?: string;
  title: string;
  content: string;
  cardPosition?: 'right' | 'left' | 'above' | 'below';
}

const steps: Step[] = [
  {
    type: 'fullscreen',
    title: 'Welcome to API Trainer',
    content: `An API (Application Programming Interface) is how software talks to other software. When you open an app and it loads your feed, the weather, or your messages — it's making API calls behind the scenes.\n\nIn this trainer you'll learn to send real HTTP requests and read the responses, exactly like developers do every day.`,
  },
  {
    type: 'spotlight',
    targetId: 'tutorial-assignment',
    title: 'Your Assignment',
    content: 'Each level gives you a task to complete. Read the description, understand what the endpoint expects, then build your request to pass the challenge.',
    cardPosition: 'left',
  },
  {
    type: 'spotlight',
    targetId: 'tutorial-request-builder',
    title: 'Build Your Request',
    content: 'Craft your HTTP request here. Choose a method (GET, POST, PUT…), enter the URL, add headers or a body, then hit Send.',
    cardPosition: 'below',
  },
  {
    type: 'spotlight',
    targetId: 'tutorial-response',
    title: 'Read the Response',
    content: "After sending, the server's response appears here — status code, headers, and JSON body. A 200 means success!",
    cardPosition: 'above',
  },
  {
    type: 'spotlight',
    targetId: 'tutorial-sidebar',
    title: 'Levels & Progress',
    content: 'Navigate levels here. Green checkmarks show what you have completed. Your progress is saved automatically.',
    cardPosition: 'right',
  },
  {
    type: 'spotlight',
    targetId: 'tutorial-btn-docs',
    title: 'API Documentation',
    content: 'Open the full API reference anytime — every endpoint, its parameters, and example responses.',
    cardPosition: 'below',
  },
  {
    type: 'spotlight',
    targetId: 'tutorial-btn-db',
    title: 'DB Explorer',
    content: 'Peek at the mock database in real time. Watch the data change as your API calls create, update, or delete records.',
    cardPosition: 'below',
  },
  {
    type: 'fullscreen',
    title: "You're Ready!",
    content: "You know the layout — now it's time to practice. Start with Level 1 and work your way up. Each challenge builds real API skills you'll use as a developer.",
  },
];

interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

function computeCardPosition(
  rect: DOMRect,
  preferred: 'right' | 'left' | 'above' | 'below',
  cardW = 320,
  cardH = 220,
): { top: number; left: number } {
  const pad = 16;
  const gap = 16;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let top = 0;
  let left = 0;

  if (preferred === 'right') {
    left = rect.right + gap;
    top = rect.top + rect.height / 2 - cardH / 2;
  } else if (preferred === 'left') {
    left = rect.left - gap - cardW;
    top = rect.top + rect.height / 2 - cardH / 2;
  } else if (preferred === 'above') {
    left = rect.left + rect.width / 2 - cardW / 2;
    top = rect.top - gap - cardH;
  } else {
    left = rect.left + rect.width / 2 - cardW / 2;
    top = rect.bottom + gap;
  }

  left = Math.max(pad, Math.min(left, vw - cardW - pad));
  top = Math.max(pad, Math.min(top, vh - cardH - pad));

  return { top, left };
}

export default function TutorialOverlay({ isOpen, onClose }: TutorialOverlayProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  // Reset to step 0 each time the overlay opens
  useEffect(() => {
    if (isOpen) setStepIndex(0);
  }, [isOpen]);

  // Measure target element and keep rect in sync
  useEffect(() => {
    if (!isOpen || step.type === 'fullscreen' || !step.targetId) {
      setTargetRect(null);
      return;
    }

    function measure() {
      const el = document.getElementById(step.targetId!);
      if (el) setTargetRect(el.getBoundingClientRect());
    }

    measure();

    const el = document.getElementById(step.targetId);
    observerRef.current?.disconnect();
    if (el) {
      observerRef.current = new ResizeObserver(measure);
      observerRef.current.observe(el);
    }

    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      observerRef.current?.disconnect();
    };
  }, [isOpen, stepIndex, step.targetId, step.type]);

  if (!isOpen) return null;

  function handleNext() {
    if (isLast) {
      onClose();
    } else {
      setStepIndex(i => i + 1);
    }
  }

  const nextLabel = stepIndex === 0 ? 'Begin Tour' : isLast ? 'Start Learning' : 'Next →';

  // Dot row shared between card types
  const dots = (
    <div className="flex items-center gap-1.5">
      {steps.map((_, i) => (
        <span
          key={i}
          className={
            i === stepIndex
              ? 'w-4 h-1.5 rounded-full bg-[#FF6C37]'
              : 'w-1.5 h-1.5 rounded-full bg-[var(--color-border-hover)]'
          }
        />
      ))}
    </div>
  );

  // ── Fullscreen step ──────────────────────────────────────────────────────────
  if (step.type === 'fullscreen') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div
          key={stepIndex}
          className="tutorial-card-enter relative z-10 w-[480px] bg-[var(--color-bg-surface)] rounded-2xl shadow-2xl p-8"
          onClick={e => e.stopPropagation()}
        >
          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 rounded-xl bg-[#FF6C37]/20 flex items-center justify-center">
              {isLast ? (
                <svg className="w-7 h-7 text-[#FF6C37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-7 h-7 text-[#FF6C37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 9l3 3-3 3m5 0h3" />
                </svg>
              )}
            </div>
          </div>

          <h2 className="text-xl font-bold text-[var(--color-text-primary)] text-center mb-3">{step.title}</h2>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed text-center whitespace-pre-line mb-8">
            {step.content}
          </p>

          <div className="flex justify-center mb-6">{dots}</div>

          <div className="flex items-center justify-between">
            {!isLast ? (
              <button
                onClick={onClose}
                className="text-sm text-[var(--color-text-dimmed)] hover:text-[var(--color-text-muted)] transition-colors"
              >
                Skip tour
              </button>
            ) : (
              <span />
            )}
            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-full bg-[#FF6C37] hover:bg-[#e85c28] text-white text-sm font-semibold transition-colors"
            >
              {nextLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Spotlight step ───────────────────────────────────────────────────────────
  const cardW = 320;
  const cardPos = targetRect
    ? computeCardPosition(targetRect, step.cardPosition ?? 'right', cardW)
    : { top: 20, left: 20 };

  const holePad = 8;

  // SVG cannot apply backdrop-filter, so we tile 4 divs around the hole.
  // Each panel gets backdrop-blur-sm + the dark tint, and handles its own click.
  const panelBase = 'fixed bg-black/60 backdrop-blur-sm';

  return (
    <>
      {/* 4-panel blurred overlay surrounding the spotlight hole */}
      {targetRect ? (
        <>
          {/* Top */}
          <div
            className={panelBase}
            style={{ zIndex: 40, inset: 0, bottom: 'auto', height: Math.max(0, targetRect.top - holePad) }}
          />
          {/* Bottom */}
          <div
            className={panelBase}
            style={{ zIndex: 40, inset: 0, top: targetRect.bottom + holePad }}
          />
          {/* Left */}
          <div
            className={panelBase}
            style={{
              zIndex: 40,
              top: targetRect.top - holePad,
              left: 0,
              width: Math.max(0, targetRect.left - holePad),
              height: targetRect.height + holePad * 2,
            }}
          />
          {/* Right */}
          <div
            className={panelBase}
            style={{
              zIndex: 40,
              top: targetRect.top - holePad,
              left: targetRect.right + holePad,
              right: 0,
              height: targetRect.height + holePad * 2,
            }}
          />
        </>
      ) : (
        /* Fallback while rect is not yet measured */
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          style={{ zIndex: 40 }}
        />
      )}

      {/* Tutorial card */}
      <div
        key={stepIndex}
        className="tutorial-card-enter fixed w-80 bg-[var(--color-bg-surface)] rounded-xl shadow-xl p-5"
        style={{ zIndex: 50, top: cardPos.top, left: cardPos.left }}
      >
        <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-2">{step.title}</h3>
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-4">{step.content}</p>

        <div className="mb-4">{dots}</div>

        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs text-[var(--color-text-dimmed)] hover:text-[var(--color-text-muted)] transition-colors"
          >
            Skip tour
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-1.5 rounded-full bg-[#FF6C37] hover:bg-[#e85c28] text-white text-xs font-semibold transition-colors"
          >
            {nextLabel}
          </button>
        </div>
      </div>
    </>
  );
}
