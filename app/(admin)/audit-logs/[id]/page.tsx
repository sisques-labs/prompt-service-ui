"use client";
import { useQuery } from "@apollo/client/react";
import { useParams, useRouter } from "next/navigation";
import { auditClient } from "@/app/lib/apollo";
import { AUDIT_LOG } from "@/features/audit-logs/graphql";
import { AuditLog } from "@/features/audit-logs/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuditLogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data, loading } = useQuery<{ auditLog: AuditLog }>(AUDIT_LOG, {
    client: auditClient,
    variables: { id },
  });

  if (loading) return <div className="text-muted-foreground py-16 text-center">Cargando...</div>;
  const log = data?.auditLog;
  if (!log) return <div className="text-muted-foreground py-16 text-center">Log no encontrado</div>;

  function formatDate(d: string) {
    return new Date(d).toLocaleString("es-ES", { dateStyle: "long", timeStyle: "medium" });
  }

  let parsedPayload: unknown = null;
  try { parsedPayload = JSON.parse(log.payload); } catch { parsedPayload = log.payload; }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>← Volver</Button>
        <Badge variant="outline" className="font-mono">{log.eventType}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          ["Event ID", log.eventId],
          ["Topic", log.topic],
          ["Aggregate Type", log.aggregateRootType],
          ["Aggregate ID", log.aggregateRootId],
          ["Entity Type", log.entityType],
          ["Entity ID", log.entityId],
          ["Occurred At", formatDate(log.occurredAt)],
          ["Created At", formatDate(log.createdAt)],
        ].map(([label, value]) => (
          <div key={label} className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground font-medium">{label}</span>
            <span className="text-sm font-mono break-all">{value}</span>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground font-normal">Payload</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs font-mono bg-muted rounded p-4 overflow-auto max-h-96 whitespace-pre-wrap">
            {JSON.stringify(parsedPayload, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
