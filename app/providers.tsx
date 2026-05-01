"use client";
import { ApolloProvider } from "@apollo/client/react";
import { useMemo } from "react";
import { Toaster } from "@/components/ui/sonner";
import { makeApolloClient } from "@/app/lib/graphql";

export function Providers({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => makeApolloClient(), []);
  return (
    <ApolloProvider client={client}>
      {children}
      <Toaster richColors position="bottom-right" />
    </ApolloProvider>
  );
}
