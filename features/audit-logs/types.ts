export interface AuditLog {
  id: string;
  eventId: string;
  eventType: string;
  topic: string;
  aggregateRootId: string;
  aggregateRootType: string;
  entityId: string;
  entityType: string;
  occurredAt: string;
  payload: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedAuditLogs {
  items: AuditLog[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
