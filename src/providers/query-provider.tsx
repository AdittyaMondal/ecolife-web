'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

/** Defaults from PRD-v2 §9.2. One client per browser session. */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 86_400_000,
        retry: 2,
        refetchOnWindowFocus: true,
      },
    },
  });
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // useState, not a module-level client: on the server one client per request,
  // in the browser one that survives re-renders but not a reload.
  const [queryClient] = useState(makeQueryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
