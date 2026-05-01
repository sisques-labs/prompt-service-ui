import { ApolloClient, InMemoryCache } from "@apollo/client/core";
import { HttpLink } from "@apollo/client/link/http";

function makeClient(uri: string) {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({ uri }),
    defaultOptions: {
      watchQuery: { fetchPolicy: "network-only" },
      query: { fetchPolicy: "network-only" },
    },
  });
}

export const promptsClient = makeClient(
  process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "/graphql"
);

export const auditClient = makeClient(
  process.env.NEXT_PUBLIC_AUDIT_GRAPHQL_URL ?? "/audit-graphql"
);
