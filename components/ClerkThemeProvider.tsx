'use client';

import { useState, useEffect } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

export default function ClerkThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const html = document.documentElement;
    setIsDark(html.classList.contains('dark'));

    const observer = new MutationObserver(() => {
      setIsDark(html.classList.contains('dark'));
    });
    observer.observe(html, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <ClerkProvider appearance={isDark ? { baseTheme: dark } : undefined}>
      {children}
    </ClerkProvider>
  );
}
