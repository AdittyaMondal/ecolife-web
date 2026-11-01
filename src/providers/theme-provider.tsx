'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * Dark mode via a `.dark` class on <html>, matching the `@custom-variant dark`
 * in globals.css. next-themes injects a blocking inline script, so the class is
 * set before first paint and there is no flash; the root <html> carries
 * suppressHydrationWarning because that script writes to it.
 *
 * Light is the default, and `enableSystem` is off.
 *
 * It used to be `defaultTheme="system"` with `enableSystem`, which meant the
 * dashboard opened dark for anyone whose OS is dark — the reported bug. The
 * flag is removed rather than merely overridden because the only control in
 * the UI is a binary toggle (`setTheme(resolvedTheme === 'dark' ? 'light' :
 * 'dark')` in the app layout). It can never set 'system', so with a light
 * default the option was unreachable configuration: it decided the first paint
 * and then nothing could return to it.
 *
 * A visitor's explicit choice still wins — next-themes persists it to
 * localStorage and that takes precedence over this default on every later
 * visit. If following the OS is ever wanted again, add a three-way control at
 * the same time, not just the flag.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
