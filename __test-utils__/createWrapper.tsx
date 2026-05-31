import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Crea un QueryClient sin reintentos (apto para tests) y su wrapper para renderHook.
 * Retorna { wrapper, queryClient } — desestructurar solo lo que se necesite.
 *
 * Uso básico:
 *   renderHook(() => useX(), { wrapper: createWrapper().wrapper })
 *
 * Cuando se necesita el cliente para asserts de caché:
 *   const { wrapper, queryClient } = createWrapper()
 *   renderHook(() => useX(), { wrapper })
 */
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  return { wrapper, queryClient };
};

export default createWrapper;
