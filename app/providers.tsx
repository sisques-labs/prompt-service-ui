"use client";
import { ApolloProvider } from "@apollo/client/react";
import { Toaster } from "@/components/ui/sonner";
import { promptsClient } from "@/app/lib/apollo";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={promptsClient}>
      {children}
      <Toaster richColors position="bottom-right" />
    </ApolloProvider>
  );
}
