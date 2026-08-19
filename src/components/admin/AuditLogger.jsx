import { base44 } from "@/api/base44Client";

/**
 * Centralized audit logging utility for Platform Administration
 * Logs all significant administrative actions for compliance and security tracking
 */

export const AuditLogger = {
  /**
   * Log a user-related action
   */
  async logUserAction(action, entityId, details, metadata = {}) {
    return this.log({
      action,
      entity_type: 'User',
      entity_id: entityId,
      details,
      metadata
    });
  },

  /**
   * Log a role-related action
   */
  async logRoleAction(action, entityId, details, metadata = {}) {
    return this.log({
      action,
      entity_type: 'Role',
      entity_id: entityId,
      details,
      metadata
    });
  },

  /**
   * Log an automation rule action
   */
  async logAutomationAction(action, entityId, details, metadata = {}) {
    return this.log({
      action,
      entity_type: 'AutomationRule',
      entity_id: entityId,
      details,
      metadata
    });
  },

  /**
   * Log a notification settings action
   */
  async logNotificationAction(action, entityId, details, metadata = {}) {
    return this.log({
      action,
      entity_type: 'NotificationPreference',
      entity_id: entityId,
      details,
      metadata
    });
  },

  /**
   * Log an assessment configuration action
   */
  async logAssessmentConfigAction(action, entityId, details, metadata = {}) {
    return this.log({
      action,
      entity_type: 'AssessmentTemplate',
      entity_id: entityId,
      details,
      metadata
    });
  },

  /**
   * Log a system configuration action
   */
  async logSystemAction(action, details, metadata = {}) {
    return this.log({
      action,
      entity_type: 'System',
      entity_id: null,
      details,
      metadata
    });
  },

  /**
   * Core logging function
   */
  async log({ action, entity_type, entity_id, details, metadata = {} }) {
    try {
      const user = await base44.auth.me().catch(() => null);
      
      const logEntry = {
        user_email: user?.email || 'system',
        action,
        entity_type,
        entity_id: entity_id || null,
        details,
        timestamp: new Date().toISOString(),
        metadata: {
          ...metadata,
          user_role: user?.role,
          ip_address: metadata.ip_address || 'N/A',
          user_agent: metadata.user_agent || navigator?.userAgent || 'N/A'
        }
      };

      await base44.entities.AuditLog.create(logEntry);
      console.log('[AuditLogger] Logged action:', action);
    } catch (error) {
      console.error('[AuditLogger] Failed to log action:', error);
      // Don't throw - logging failures shouldn't break functionality
    }
  }
};

// Convenience action constants
export const AUDIT_ACTIONS = {
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_DELETED: 'user_deleted',
  USER_ROLE_CHANGED: 'user_role_changed',
  USER_INVITED: 'user_invited',
  
  ROLE_CREATED: 'role_created',
  ROLE_UPDATED: 'role_updated',
  ROLE_DELETED: 'role_deleted',
  ROLE_ASSIGNED: 'role_assigned',
  ROLE_REVOKED: 'role_revoked',
  
  AUTOMATION_CREATED: 'automation_created',
  AUTOMATION_UPDATED: 'automation_updated',
  AUTOMATION_DELETED: 'automation_deleted',
  AUTOMATION_ENABLED: 'automation_enabled',
  AUTOMATION_DISABLED: 'automation_disabled',
  
  NOTIFICATION_SETTINGS_UPDATED: 'notification_settings_updated',
  NOTIFICATION_SENT: 'notification_sent',
  
  ASSESSMENT_CONFIG_CREATED: 'assessment_config_created',
  ASSESSMENT_CONFIG_UPDATED: 'assessment_config_updated',
  ASSESSMENT_CONFIG_DELETED: 'assessment_config_deleted',
  
  INTEGRATION_CONFIGURED: 'integration_configured',
  INTEGRATION_REMOVED: 'integration_removed',
  
  SYSTEM_SETTINGS_UPDATED: 'system_settings_updated',
  SYSTEM_BACKUP_CREATED: 'system_backup_created',
  
  LOGIN: 'user_login',
  LOGOUT: 'user_logout',
  LOGIN_FAILED: 'login_failed'
};

export default AuditLogger;