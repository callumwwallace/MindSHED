import type { AppRouter } from '@mindshed/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import { useState, type ReactNode } from 'react';
import superjson from 'superjson';

export const trpc = createTRPCReact<AppRouter>();

// On a physical device "localhost" is the phone, not your Mac — set
// EXPO_PUBLIC_API_URL in apps/mobile/.env to your Mac's LAN IP, e.g.
// EXPO_PUBLIC_API_URL=http://192.168.1.20:3000
const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export function ApiProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({ url: `${apiUrl}/trpc`, transformer: superjson }),
      ],
    }),
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
