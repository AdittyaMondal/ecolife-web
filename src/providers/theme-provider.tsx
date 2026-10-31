'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * Dark mode via a `.dark` class on <html>, matching the `@custom-variant dark`
 * in globals.css. next-themes injects a blocking inline script, so the class is
 * set before first paint and there is no flash; the root <html> carries
 * suppressHydrationWarning because that script writes to it.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
