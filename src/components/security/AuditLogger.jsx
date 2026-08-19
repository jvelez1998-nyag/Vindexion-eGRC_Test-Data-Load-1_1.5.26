import { base44 } from "@/api/base44Client";

class AuditLogger {
  constructor() {
    this.queue = [];
    this.flushInterval = setInterval(() => this.flush(), 5000);
  }

  async log(action, entityType, entityId, changes, metadata = {}) {
    const entry = {
      action,
      entity_type: entityType,
      entity_id: entityId,
      user_email: await this.getCurrentUser(),
      ip_address: await this.getClientIP(),
      changes: typeof changes === 'string' ? changes : JSON.stringify(changes),
      metadata: JSON.stringify(metadata),
      timestamp: new Date().toISOString()
    };

    this.queue.push(entry);

    if (this.queue.length >= 10) {
      this.flush();
    }
  }

  async flush() {
    if (this.queue.length === 0) return;

    const entries = [...this.queue];
    this.queue = [];

    try {
      for (const entry of entries) {
        await base44.entities.AuditLog.create(entry);
      }
    } catch (error) {
      console.error("Failed to flush audit logs:", error);
      // Re-queue failed entries
      this.queue.unshift(...entries);
    }
  }

  async getCurrentUser() {
    try {
      const user = await base44.auth.me();
      return user?.email || 'anonymous';
    } catch {
      return 'anonymous';
    }
  }

  async getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  // Specific logging methods
  logCreate(entityType, entityId, data) {
    return this.log('create', entityType, entityId, { created: data });
  }

  logUpdate(entityType, entityId, oldData, newData) {
    return this.log('update', entityType, entityId, { old: oldData, new: newData });
  }

  logDelete(entityType, entityId, data) {
    return this.log('delete', entityType, entityId, { deleted: data });
  }

  logAccess(entityType, entityId) {
    return this.log('access', entityType, entityId, { accessed: true });
  }

  logExport(entityType, count, format) {
    return this.log('export', entityType, null, { count, format });
  }

  logLogin(success, method = 'password') {
    return this.log('login', 'user', null, { success, method });
  }

  logLogout() {
    return this.log('logout', 'user', null, { logout: true });
  }

  logFailedAccess(entityType, entityId, reason) {
    return this.log('access_denied', entityType, entityId, { reason });
  }

  logSecurityEvent(eventType, severity, details) {
    return this.log('security_event', 'system', null, { event_type: eventType, severity, details });
  }
}

export const auditLogger = new AuditLogger();

// Intercept base44 operations
const originalCreate = base44.entities.Control?.create;
const originalUpdate = base44.entities.Control?.update;
const originalDelete = base44.entities.Control?.delete;

// Helper to wrap entity operations with audit logging
export function wrapEntityWithAudit(entityName) {
  const entity = base44.entities[entityName];
  if (!entity) return;

  const original = {
    create: entity.create,
    update: entity.update,
    delete: entity.delete
  };

  entity.create = async function(data) {
    const result = await original.create.call(this, data);
    auditLogger.logCreate(entityName, result.id, data);
    return result;
  };

  entity.update = async function(id, data) {
    const result = await original.update.call(this, id, data);
    auditLogger.logUpdate(entityName, id, {}, data);
    return result;
  };

  entity.delete = async function(id) {
    const result = await original.delete.call(this, id);
    auditLogger.logDelete(entityName, id, {});
    return result;
  };
}