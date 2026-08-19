import { base44 } from "@/api/base44Client";

/**
 * Helper utility to create notifications from anywhere in the app
 */
export const NotificationHelper = {
  /**
   * Notify about framework compliance changes
   */
  async notifyFrameworkComplianceChange(userEmail, framework, oldRate, newRate, details) {
    const priority = Math.abs(newRate - oldRate) >= 10 ? 'high' : 'medium';
    const direction = newRate > oldRate ? 'improved' : 'declined';
    
    return base44.entities.Notification.create({
      user_email: userEmail,
      type: 'framework_compliance_change',
      title: `${framework} Compliance ${direction === 'improved' ? 'Improved' : 'Alert'}`,
      message: `Compliance rate ${direction} from ${oldRate}% to ${newRate}%`,
      priority,
      entity_type: 'Framework',
      action_url: '/ComplianceFrameworks',
      metadata: { framework, oldRate, newRate, details }
    });
  },

  /**
   * Notify about AI-generated insights
   */
  async notifyAIInsight(userEmail, insightTitle, summary, entityType, entityId, actionUrl) {
    return base44.entities.Notification.create({
      user_email: userEmail,
      type: 'ai_insight_generated',
      title: insightTitle,
      message: summary,
      priority: 'medium',
      entity_type: entityType,
      entity_id: entityId,
      action_url: actionUrl,
      metadata: { ai_generated: true }
    });
  },

  /**
   * Notify about AI recommendations
   */
  async notifyAIRecommendation(userEmail, title, recommendation, priority = 'medium', actionUrl) {
    return base44.entities.Notification.create({
      user_email: userEmail,
      type: 'ai_recommendation',
      title,
      message: recommendation,
      priority,
      action_url: actionUrl,
      metadata: { ai_generated: true }
    });
  },

  /**
   * Notify about successful import
   */
  async notifyImportSuccess(userEmail, entityType, count, details) {
    return base44.entities.Notification.create({
      user_email: userEmail,
      type: 'import_success',
      title: 'Import Completed Successfully',
      message: `Successfully imported ${count} ${entityType} records`,
      priority: 'low',
      metadata: { entityType, count, details }
    });
  },

  /**
   * Notify about failed import
   */
  async notifyImportFailed(userEmail, entityType, error) {
    return base44.entities.Notification.create({
      user_email: userEmail,
      type: 'import_failed',
      title: 'Import Failed',
      message: `Failed to import ${entityType}: ${error}`,
      priority: 'high',
      metadata: { entityType, error }
    });
  },

  /**
   * Notify about successful export
   */
  async notifyExportSuccess(userEmail, entityType, count) {
    return base44.entities.Notification.create({
      user_email: userEmail,
      type: 'export_success',
      title: 'Export Completed',
      message: `Successfully exported ${count} ${entityType} records`,
      priority: 'low',
      metadata: { entityType, count }
    });
  },

  /**
   * Notify about failed export
   */
  async notifyExportFailed(userEmail, entityType, error) {
    return base44.entities.Notification.create({
      user_email: userEmail,
      type: 'export_failed',
      title: 'Export Failed',
      message: `Failed to export ${entityType}: ${error}`,
      priority: 'high',
      metadata: { entityType, error }
    });
  },

  /**
   * Check user preferences before sending notification
   */
  async shouldNotify(userEmail, notificationType) {
    try {
      const prefs = await base44.entities.NotificationPreference.filter({ user_email: userEmail });
      if (prefs.length === 0) return true; // Default to enabled if no preferences set

      const preference = prefs[0];
      
      // Map notification types to preference fields
      const preferenceMap = {
        'framework_compliance_change': 'framework_compliance_change',
        'ai_insight_generated': 'ai_insights',
        'ai_recommendation': 'ai_recommendations',
        'import_success': 'import_export_operations',
        'import_failed': 'import_export_operations',
        'export_success': 'import_export_operations',
        'export_failed': 'import_export_operations'
      };

      const prefField = preferenceMap[notificationType];
      return prefField ? preference[prefField] !== false : true;
    } catch (error) {
      console.error('Error checking notification preferences:', error);
      return true; // Default to enabled on error
    }
  },

  /**
   * Create notification with preference check
   */
  async createWithPreferenceCheck(userEmail, notificationType, notificationData) {
    const shouldSend = await this.shouldNotify(userEmail, notificationType);
    if (shouldSend) {
      return base44.entities.Notification.create({
        user_email: userEmail,
        type: notificationType,
        ...notificationData
      });
    }
    return null;
  },

  /**
   * Notify about vendor risk change
   */
  async notifyVendorRiskChange(userEmail, vendorName, oldRating, newRating, vendorId) {
    return base44.entities.Notification.create({
      user_email: userEmail,
      type: 'vendor_risk_change',
      title: 'Vendor Risk Change',
      message: `"${vendorName}" risk rating changed from ${oldRating} to ${newRating}`,
      priority: newRating === 'critical' ? 'critical' : 'high',
      entity_type: 'Vendor',
      entity_id: vendorId,
      action_url: '/VendorManagement',
      metadata: { oldRating, newRating }
    });
  }
};

export default NotificationHelper;