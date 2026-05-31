import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useUIStore } from "@/stores/ui.store";

// Extracted so tests can import and invoke it directly without going through
// the module-level singleton QueryClient.
export const handleMutationError = (error: unknown) => {
  const message =
    error instanceof Error ? error.message : "Ocurrió un error inesperado";
  useUIStore.getState().showToast(message, "error");
};

// MutationCache es el mecanismo correcto en React Query v5 para capturar
// errores globales de todas las mutations, incluyendo las que tienen onSuccess propio.
const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: handleMutationError,
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const QueryProvider = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

export default QueryProvider;
