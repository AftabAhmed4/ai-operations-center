import React from 'react';
import { RootNavigator } from './src/navigation/RootNavigator';
import { NativeWindStyleSheet } from "nativewind";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

NativeWindStyleSheet.setOutput({
  default: "native",
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigator />
    </QueryClientProvider>
  );
}
