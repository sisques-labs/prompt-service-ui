import { gql } from "@apollo/client/core";

const AUDIT_LOG_FIELDS = gql`
  fragment AuditLogFields on AuditLog {
    id eventId eventType topic
    aggregateRootId aggregateRootType
    entityId entityType
    occurredAt payload createdAt updatedAt
  }
`;

export const AUDIT_LOGS = gql`
  ${AUDIT_LOG_FIELDS}
  query AuditLogs($criteria: BaseFindByCriteriaInput) {
    auditLogs(criteria: $criteria) {
      items { ...AuditLogFields }
      total page perPage totalPages
    }
  }
`;

export const AUDIT_LOG = gql`
  ${AUDIT_LOG_FIELDS}
  query AuditLog($id: String!) {
    auditLog(id: $id) { ...AuditLogFields }
  }
`;
