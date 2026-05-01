"use client";
import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { auditClient } from "@/app/lib/apollo";
import { AUDIT_LOGS } from "@/features/audit-logs/graphql";
import { AuditLog, PaginatedAuditLogs } from "@/features/audit-logs/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

function buildCriteria(page: number, perPage: number, filters: { eventType: string; aggregateRootType: string }) {
  const f = [];
  if (filters.eventType.trim()) f.push({ field: "eventType", operator: "LIKE", value: filters.eventType.trim() });
  if (filters.aggregateRootType.trim()) f.push({ field: "aggregateRootType", operator: "LIKE", value: filters.aggregateRootType.trim() });
  return { filters: f, pagination: { page, perPage }, sorts: [{ field: "occurredAt", direction: "DESC" }] };
}

export default function AuditLogsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const perPage = 20;
  const [filters, setFilters] = useState({ eventType: "", aggregateRootType: "" });
  const [applied, setApplied] = useState({ eventType: "", aggregateRootType: "" });

  const { data, loading } = useQuery<{ auditLogs: PaginatedAuditLogs }>(AUDIT_LOGS, {
    client: auditClient,
    variables: { criteria: buildCriteria(page, perPage, applied) },
  });

  function applyFilters() {
    setApplied({ ...filters });
    setPage(1);
  }

  function clearFilters() {
    setFilters({ eventType: "", aggregateRootType: "" });
    setApplied({ eventType: "", aggregateRootType: "" });
    setPage(1);
  }

  const result = data?.auditLogs;
  const logs = result?.items ?? [];
  const totalPages = result?.totalPages ?? 0;

  function formatDate(d: string) {
    return new Date(d).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "medium" });
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Audit Logs</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <Input
          placeholder="Event type..."
          value={filters.eventType}
          onChange={(e) => setFilters((f) => ({ ...f, eventType: e.target.value }))}
          className="w-44"
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
        />
        <Input
          placeholder="Aggregate type..."
          value={filters.aggregateRootType}
          onChange={(e) => setFilters((f) => ({ ...f, aggregateRootType: e.target.value }))}
          className="w-44"
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
        />
        <Button onClick={applyFilters} size="sm">Filtrar</Button>
        {(applied.eventType || applied.aggregateRootType) && (
          <Button onClick={clearFilters} size="sm" variant="ghost">Limpiar</Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Cargando...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No hay audit logs.</div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Type</TableHead>
                <TableHead>Aggregate</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Occurred At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow
                  key={log.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/audit-logs/${log.id}`)}
                >
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">{log.eventType}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className="text-muted-foreground">{log.aggregateRootType}/</span>
                    <span className="font-mono text-xs">{log.aggregateRootId.slice(0, 8)}…</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{log.entityType}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{log.topic}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(log.occurredAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-muted-foreground">{result?.total} total</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              ‹ Anterior
            </Button>
            <span className="text-sm">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Siguiente ›
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
