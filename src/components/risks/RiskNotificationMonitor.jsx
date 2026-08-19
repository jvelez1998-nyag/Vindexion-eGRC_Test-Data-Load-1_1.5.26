import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, BellOff, Clock, AlertTriangle, CheckCircle2, Mail } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";

export default function RiskNotificationMonitor({ risks }) {
  const [enabled, setEnabled] = useState(true);
  const [notificationThreshold, setNotificationThreshold] = useState(7); // days before due date
  const [monitoringActive, setMonitoringActive] = useState(false);
  const [upcomingRisks, setUpcomingRisks] = useState([]);

  useEffect(() => {
    if (enabled && monitoringActive) {
      checkRisksAndNotify();
      const interval = setInterval(checkRisksAndNotify, 3600000); // Every hour
      return () => clearInterval(interval);
    }
  }, [enabled, monitoringActive, risks, notificationThreshold]);

  const checkRisksAndNotify = async () => {
    try {
      const user = await base44.auth.me();
      const now = new Date();
      
      // Find high-priority risks nearing due date
      const critical = risks.filter(risk => {
        if (!risk.due_date || risk.status === 'closed') return false;
        
        const dueDate = new Date(risk.due_date);
        const daysUntilDue = differenceInDays(dueDate, now);
        const score = (risk.dynamic_score || risk.likelihood * risk.impact);
        
        return daysUntilDue <= notificationThreshold && 
               daysUntilDue >= 0 && 
               score >= 12; // High priority threshold
      });

      setUpcomingRisks(critical);

      // Send notifications for critical risks
      for (const risk of critical) {
        const daysUntilDue = differenceInDays(new Date(risk.due_date), now);
        const existingNotifications = await base44.entities.Notification.filter({
          user_email: user.email,
          entity_id: risk.id,
          type: 'risk_overdue'
        });

        // Only notify if not already notified today
        const lastNotification = existingNotifications[0];
        const shouldNotify = !lastNotification || 
          differenceInDays(now, new Date(lastNotification.created_date)) >= 1;

        if (shouldNotify) {
          await base44.entities.Notification.create({
            user_email: risk.owner || user.email,
            type: 'risk_overdue',
            title: `High-Priority Risk Due Soon: ${risk.title}`,
            message: `Risk "${risk.title}" (Score: ${risk.dynamic_score || risk.likelihood * risk.impact}) is due in ${daysUntilDue} day(s). Immediate action required.`,
            priority: 'high',
            entity_type: 'Risk',
            entity_id: risk.id,
            action_url: `/risks/${risk.id}`,
            metadata: {
              risk_score: risk.dynamic_score || risk.likelihood * risk.impact,
              days_until_due: daysUntilDue,
              category: risk.category
            }
          });

          // Send email notification
          if (risk.owner) {
            await base44.integrations.Core.SendEmail({
              to: risk.owner,
              subject: `⚠️ High-Priority Risk Alert: ${risk.title}`,
              body: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 20px; border-radius: 8px 8px 0 0;">
                    <h2 style="color: white; margin: 0;">⚠️ High-Priority Risk Alert</h2>
                  </div>
                  <div style="background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
                    <h3 style="color: #1f2937; margin-top: 0;">${risk.title}</h3>
                    
                    <div style="background: #fef2f2; padding: 15px; border-left: 4px solid #ef4444; margin: 15px 0;">
                      <p style="margin: 0; color: #991b1b;"><strong>Due in ${daysUntilDue} day(s)</strong></p>
                      <p style="margin: 5px 0 0 0; color: #991b1b;">Due Date: ${format(new Date(risk.due_date), 'MMM d, yyyy')}</p>
                    </div>
                    
                    <table style="width: 100%; margin: 15px 0; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px; background: #f9fafb; border: 1px solid #e5e7eb;"><strong>Risk Score:</strong></td>
                        <td style="padding: 8px; border: 1px solid #e5e7eb;">${risk.dynamic_score || risk.likelihood * risk.impact}/25</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px; background: #f9fafb; border: 1px solid #e5e7eb;"><strong>Category:</strong></td>
                        <td style="padding: 8px; border: 1px solid #e5e7eb;">${risk.category}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px; background: #f9fafb; border: 1px solid #e5e7eb;"><strong>Status:</strong></td>
                        <td style="padding: 8px; border: 1px solid #e5e7eb;">${risk.status}</td>
                      </tr>
                    </table>
                    
                    ${risk.mitigation_plan ? `
                      <div style="margin: 15px 0;">
                        <strong>Mitigation Plan:</strong>
                        <p style="color: #6b7280; margin: 5px 0;">${risk.mitigation_plan}</p>
                      </div>
                    ` : ''}
                    
                    <p style="color: #6b7280; margin: 15px 0;">This is an automated alert for high-priority risks approaching their due date. Please review and take necessary action.</p>
                    
                    <div style="text-align: center; margin-top: 20px;">
                      <a href="${window.location.origin}/risks" style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Risk Details</a>
                    </div>
                  </div>
                </div>
              `
            });
          }
        }
      }

      if (critical.length > 0) {
        toast.warning(`${critical.length} high-priority risk(s) due soon`, {
          description: "Notifications sent to risk owners"
        });
      }
    } catch (error) {
      console.error('Notification monitoring error:', error);
    }
  };

  const startMonitoring = async () => {
    setMonitoringActive(true);
    await checkRisksAndNotify();
    toast.success("Risk monitoring activated");
  };

  return (
    <Card className="bg-gradient-to-br from-amber-500/5 via-[#1a2332] to-orange-500/5 border-amber-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30">
              {enabled ? (
                <Bell className="h-5 w-5 text-amber-400" />
              ) : (
                <BellOff className="h-5 w-5 text-slate-500" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">Automated Risk Notifications</CardTitle>
              <p className="text-xs text-slate-400 mt-1">Proactive alerts for high-priority risks</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="enable-notifications" className="text-sm text-slate-400">Enable</Label>
              <Switch
                id="enable-notifications"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
            </div>
            {enabled && !monitoringActive && (
              <Button
                onClick={startMonitoring}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                size="sm"
              >
                <Bell className="h-4 w-4 mr-2" />
                Start Monitoring
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {!enabled ? (
          <div className="text-center py-8">
            <BellOff className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Risk notifications are disabled</p>
            <p className="text-slate-500 text-xs mt-1">Enable to receive automated alerts</p>
          </div>
        ) : !monitoringActive ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-amber-400/30 mx-auto mb-3" />
            <p className="text-slate-400 text-sm mb-2">Monitoring not yet started</p>
            <p className="text-slate-500 text-xs">Click "Start Monitoring" to activate automated notifications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Settings */}
            <div className="p-4 bg-[#0f1623] rounded-lg border border-[#2a3548]">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm text-white">Notification Threshold</Label>
                <Badge className="bg-amber-500/20 text-amber-400">
                  {notificationThreshold} days before due date
                </Badge>
              </div>
              <div className="flex gap-2">
                {[3, 7, 14, 30].map(days => (
                  <Button
                    key={days}
                    size="sm"
                    variant={notificationThreshold === days ? "default" : "outline"}
                    onClick={() => setNotificationThreshold(days)}
                    className={notificationThreshold === days ? "bg-amber-600" : ""}
                  >
                    {days}d
                  </Button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-white font-medium">Monitoring Active</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Checking every hour for high-priority risks
                </p>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400">
                {upcomingRisks.length} Tracked
              </Badge>
            </div>

            {/* Upcoming Risks */}
            {upcomingRisks.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-400" />
                  High-Priority Risks Due Soon
                </h4>
                <div className="space-y-2">
                  {upcomingRisks.map((risk, idx) => {
                    const daysUntilDue = differenceInDays(new Date(risk.due_date), new Date());
                    
                    return (
                      <Card key={idx} className="bg-[#0f1623] border-amber-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-semibold text-white mb-1">{risk.title}</h5>
                              <div className="flex items-center gap-2 text-xs">
                                <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">
                                  Score: {risk.dynamic_score || risk.likelihood * risk.impact}
                                </Badge>
                                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {daysUntilDue}d remaining
                                </Badge>
                              </div>
                            </div>
                            <Mail className="h-4 w-4 text-amber-400" />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="p-3 bg-[#0f1623] rounded-lg border border-[#2a3548] text-xs text-slate-400">
              <strong className="text-white">Notification Criteria:</strong> High-priority risks (score ≥12) within {notificationThreshold} days of due date
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}