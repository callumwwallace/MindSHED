import type { AppRouter } from '@mindshed/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import { useState, type ReactNode } from 'react';
import superjson from 'superjson';

export const trpc = createTRPCReact<AppRouter>();

// On a physical device "localhost" is the phone, not your Mac — set
// EXPO_PUBLIC_API_URL in apps/mobile/.env to your Mac's LAN IP, e.g.
// EXPO_PUBLIC_API_URL=http://192.168.1.20:3000
const apiUrl = process.env.EXPO_PUBLIC_API_URL
  ?? (__DEV__ ? 'http://localhost:3000' : 'https://api-not-configured.invalid');

export const apiClient = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: `${apiUrl}/trpc`, transformer: superjson })],
});

export function ApiProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() => apiClient);
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
