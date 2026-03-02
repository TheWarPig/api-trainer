import type { Metadata } from 'next';
import ClerkThemeProvider from '@/components/ClerkThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'API Trainer',
  description: 'Learn API testing interactively with 10 hands-on levels',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <ClerkThemeProvider>{children}</ClerkThemeProvider>
      </body>
    </html>
  );
}
