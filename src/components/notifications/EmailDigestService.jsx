import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format, subDays, startOfWeek, startOfDay } from "date-fns";

export default function EmailDigestService({ userEmail }) {
  const { data: preferences } = useQuery({
    queryKey: ['notification-preferences', userEmail],
    queryFn: async () => {
      const prefs = await base44.entities.NotificationPreference.filter({ user_email: userEmail });
      return prefs[0];
    },
    enabled: !!userEmail
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications-unread', userEmail],
    queryFn: () => base44.entities.Notification.filter({ 
      user_email: userEmail,
      read: false 
    }, '-created_date', 100),
    enabled: !!userEmail && preferences?.email_notifications
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (emailData) => {
      return base44.integrations.Core.SendEmail(emailData);
    }
  });

  useEffect(() => {
    if (!userEmail || !preferences?.email_notifications || !notifications.length) return;

    const now = new Date();
    const shouldSendDaily = preferences.email_frequency === 'daily' && now.getHours() === 8; // 8 AM
    const shouldSendWeekly = preferences.email_frequency === 'weekly' && now.getDay() === 1 && now.getHours() === 8; // Monday 8 AM

    if (!shouldSendDaily && !shouldSendWeekly && preferences.email_frequency !== 'immediate') return;

    // Filter notifications based on frequency
    let notificationsToSend = notifications;
    
    if (preferences.email_frequency === 'daily') {
      const yesterday = startOfDay(subDays(now, 1));
      notificationsToSend = notifications.filter(n => 
        new Date(n.created_date) >= yesterday
      );
    } else if (preferences.email_frequency === 'weekly') {
      const lastWeek = startOfWeek(now);
      notificationsToSend = notifications.filter(n => 
        new Date(n.created_date) >= lastWeek
      );
    }

    if (!notificationsToSend.length) return;

    // Group notifications by priority
    const critical = notificationsToSend.filter(n => n.priority === 'critical');
    const high = notificationsToSend.filter(n => n.priority === 'high');
    const medium = notificationsToSend.filter(n => n.priority === 'medium');
    const low = notificationsToSend.filter(n => n.priority === 'low');

    // Build email HTML
    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #0f1623; color: #e2e8f0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #1a2332; border-radius: 12px; padding: 30px; }
          .header { border-bottom: 2px solid #2a3548; padding-bottom: 20px; margin-bottom: 20px; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
          .header p { color: #94a3b8; margin: 5px 0 0 0; font-size: 14px; }
          .summary { background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 8px; padding: 15px; margin-bottom: 20px; }
          .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 10px; }
          .summary-item { text-align: center; }
          .summary-number { font-size: 24px; font-weight: bold; }
          .summary-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; }
          .critical { color: #f87171; }
          .high { color: #fb923c; }
          .medium { color: #fbbf24; }
          .low { color: #60a5fa; }
          .section { margin-bottom: 25px; }
          .section-title { color: #ffffff; font-size: 16px; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
          .notification { background: #0f1623; border: 1px solid #2a3548; border-radius: 8px; padding: 12px; margin-bottom: 8px; }
          .notification-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 6px; }
          .notification-title { color: #ffffff; font-weight: 500; font-size: 14px; }
          .notification-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
          .notification-message { color: #cbd5e1; font-size: 13px; line-height: 1.5; }
          .notification-time { color: #64748b; font-size: 11px; margin-top: 6px; }
          .cta { background: #6366f1; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block; margin-top: 20px; font-weight: 500; }
          .footer { border-top: 1px solid #2a3548; padding-top: 20px; margin-top: 30px; text-align: center; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Your ${preferences.email_frequency === 'daily' ? 'Daily' : preferences.email_frequency === 'weekly' ? 'Weekly' : ''} Notification Digest</h1>
            <p>${format(now, 'EEEE, MMMM d, yyyy')}</p>
          </div>

          <div class="summary">
            <div style="font-size: 14px; font-weight: 600; color: #e2e8f0; margin-bottom: 10px;">Summary</div>
            <div class="summary-grid">
              <div class="summary-item">
                <div class="summary-number critical">${critical.length}</div>
                <div class="summary-label">Critical</div>
              </div>
              <div class="summary-item">
                <div class="summary-number high">${high.length}</div>
                <div class="summary-label">High</div>
              </div>
              <div class="summary-item">
                <div class="summary-number medium">${medium.length}</div>
                <div class="summary-label">Medium</div>
              </div>
              <div class="summary-item">
                <div class="summary-number low">${low.length}</div>
                <div class="summary-label">Low</div>
              </div>
            </div>
          </div>

          ${critical.length > 0 ? `
          <div class="section">
            <div class="section-title">
              <span style="color: #f87171;">●</span> Critical Priority
            </div>
            ${critical.map(n => `
              <div class="notification" style="border-color: #7f1d1d;">
                <div class="notification-header">
                  <div class="notification-title">${n.title}</div>
                  <span class="notification-badge" style="background: rgba(248, 113, 113, 0.2); color: #f87171;">CRITICAL</span>
                </div>
                <div class="notification-message">${n.message}</div>
                <div class="notification-time">${format(new Date(n.created_date), 'MMM d, h:mm a')}</div>
              </div>
            `).join('')}
          </div>
          ` : ''}

          ${high.length > 0 ? `
          <div class="section">
            <div class="section-title">
              <span style="color: #fb923c;">●</span> High Priority
            </div>
            ${high.map(n => `
              <div class="notification" style="border-color: #7c2d12;">
                <div class="notification-header">
                  <div class="notification-title">${n.title}</div>
                  <span class="notification-badge" style="background: rgba(251, 146, 60, 0.2); color: #fb923c;">HIGH</span>
                </div>
                <div class="notification-message">${n.message}</div>
                <div class="notification-time">${format(new Date(n.created_date), 'MMM d, h:mm a')}</div>
              </div>
            `).join('')}
          </div>
          ` : ''}

          ${medium.length > 0 ? `
          <div class="section">
            <div class="section-title">
              <span style="color: #fbbf24;">●</span> Medium Priority
            </div>
            ${medium.slice(0, 5).map(n => `
              <div class="notification">
                <div class="notification-header">
                  <div class="notification-title">${n.title}</div>
                  <span class="notification-badge" style="background: rgba(251, 191, 36, 0.2); color: #fbbf24;">MEDIUM</span>
                </div>
                <div class="notification-message">${n.message}</div>
                <div class="notification-time">${format(new Date(n.created_date), 'MMM d, h:mm a')}</div>
              </div>
            `).join('')}
            ${medium.length > 5 ? `<p style="color: #94a3b8; font-size: 12px; margin-top: 8px;">+ ${medium.length - 5} more medium priority notifications</p>` : ''}
          </div>
          ` : ''}

          <a href="${window.location.origin}" class="cta">View All Notifications in Platform</a>

          <div class="footer">
            <p>Vindexion eGRC Hub™ - Enterprise Governance, Risk & Compliance Platform</p>
            <p style="margin-top: 8px;">To manage your notification preferences, visit the <a href="${window.location.origin}/NotificationSettings" style="color: #6366f1;">Notification Settings</a> page.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    sendEmailMutation.mutate({
      to: userEmail,
      subject: `${preferences.email_frequency === 'immediate' ? '🔴' : '📬'} ${notificationsToSend.length} Notification${notificationsToSend.length !== 1 ? 's' : ''} - Vindexion eGRC Hub`,
      body: emailBody,
      from_name: 'Vindexion eGRC Hub'
    });

  }, [userEmail, preferences, notifications]);

  return null; // Background service
}