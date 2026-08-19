import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, BellOff, Clock, Shield, CheckCircle2, Mail } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";

export default function ControlNotificationMonitor({ controls }) {
  const [enabled, setEnabled] = useState(true);
  const [notificationThreshold, setNotificationThreshold] = useState(14);
  const [monitoringActive, setMonitoringActive] = useState(false);
  const [upcomingControls, setUpcomingControls] = useState([]);

  useEffect(() => {
    if (enabled && monitoringActive) {
      checkControlsAndNotify();
      const interval = setInterval(checkControlsAndNotify, 3600000);
      return () => clearInterval(interval);
    }
  }, [enabled, monitoringActive, controls, notificationThreshold]);

  const getNextReviewDate = (control) => {
    if (!control.last_tested_date) return null;
    
    const lastTest = new Date(control.last_tested_date);
    const frequency = {
      'monthly': 30,
      'quarterly': 90,
      'semi_annually': 180,
      'annually': 365
    }[control.review_frequency] || 90;
    
    return new Date(lastTest.getTime() + frequency * 24 * 60 * 60 * 1000);
  };

  const checkControlsAndNotify = async () => {
    try {
      const user = await base44.auth.me();
      const now = new Date();
      
      const critical = controls.filter(control => {
        if (control.status === 'retired') return false;
        
        const nextReview = getNextReviewDate(control);
        if (!nextReview) return false;
        
        const daysUntilReview = differenceInDays(nextReview, now);
        const isHighPriority = control.effectiveness >= 4 || control.linked_risks?.length > 0;
        
        return daysUntilReview <= notificationThreshold && 
               daysUntilReview >= 0 && 
               isHighPriority;
      });

      setUpcomingControls(critical);

      for (const control of critical) {
        const nextReview = getNextReviewDate(control);
        const daysUntilReview = differenceInDays(nextReview, now);
        
        const existingNotifications = await base44.entities.Notification.filter({
          user_email: user.email,
          entity_id: control.id,
          type: 'control_review_due'
        });

        const lastNotification = existingNotifications[0];
        const shouldNotify = !lastNotification || 
          differenceInDays(now, new Date(lastNotification.created_date)) >= 1;

        if (shouldNotify) {
          await base44.entities.Notification.create({
            user_email: control.owner || user.email,
            type: 'control_review_due',
            title: `Control Review Due: ${control.name}`,
            message: `Control "${control.name}" (Effectiveness: ${control.effectiveness}/5) requires review in ${daysUntilReview} day(s).`,
            priority: 'medium',
            entity_type: 'Control',
            entity_id: control.id,
            action_url: `/controls/${control.id}`,
            metadata: {
              effectiveness: control.effectiveness,
              days_until_review: daysUntilReview,
              domain: control.domain
            }
          });

          if (control.owner) {
            await base44.integrations.Core.SendEmail({
              to: control.owner,
              subject: `🛡️ Control Review Reminder: ${control.name}`,
              body: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 8px 8px 0 0;">
                    <h2 style="color: white; margin: 0;">🛡️ Control Review Reminder</h2>
                  </div>
                  <div style="background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
                    <h3 style="color: #1f2937; margin-top: 0;">${control.name}</h3>
                    
                    <div style="background: #ecfdf5; padding: 15px; border-left: 4px solid #10b981; margin: 15px 0;">
                      <p style="margin: 0; color: #065f46;"><strong>Review due in ${daysUntilReview} day(s)</strong></p>
                      <p style="margin: 5px 0 0 0; color: #065f46;">Next Review: ${format(nextReview, 'MMM d, yyyy')}</p>
                    </div>
                    
                    <table style="width: 100%; margin: 15px 0; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px; background: #f9fafb; border: 1px solid #e5e7eb;"><strong>Effectiveness:</strong></td>
                        <td style="padding: 8px; border: 1px solid #e5e7eb;">${control.effectiveness}/5</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px; background: #f9fafb; border: 1px solid #e5e7eb;"><strong>Domain:</strong></td>
                        <td style="padding: 8px; border: 1px solid #e5e7eb;">${control.domain}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px; background: #f9fafb; border: 1px solid #e5e7eb;"><strong>Frequency:</strong></td>
                        <td style="padding: 8px; border: 1px solid #e5e7eb;">${control.review_frequency}</td>
                      </tr>
                    </table>
                    
                    <p style="color: #6b7280; margin: 15px 0;">Please schedule and complete the control review to maintain compliance and effectiveness.</p>
                    
                    <div style="text-align: center; margin-top: 20px;">
                      <a href="${window.location.origin}/controls" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Control Details</a>
                    </div>
                  </div>
                </div>
              `
            });
          }
        }
      }

      if (critical.length > 0) {
        toast.info(`${critical.length} control(s) due for review soon`);
      }
    } catch (error) {
      console.error('Control notification error:', error);
    }
  };

  const startMonitoring = async () => {
    setMonitoringActive(true);
    await checkControlsAndNotify();
    toast.success("Control monitoring activated");
  };

  return (
    <Card className="bg-gradient-to-br from-emerald-500/5 via-[#1a2332] to-green-500/5 border-emerald-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
              {enabled ? <Bell className="h-5 w-5 text-emerald-400" /> : <BellOff className="h-5 w-5 text-slate-500" />}
            </div>
            <div>
              <CardTitle className="text-lg">Automated Control Review Notifications</CardTitle>
              <p className="text-xs text-slate-400 mt-1">Proactive alerts for control testing schedules</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="enable-control-notifications" className="text-sm text-slate-400">Enable</Label>
              <Switch id="enable-control-notifications" checked={enabled} onCheckedChange={setEnabled} />
            </div>
            {enabled && !monitoringActive && (
              <Button onClick={startMonitoring} className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700" size="sm">
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
            <p className="text-slate-400 text-sm">Control notifications are disabled</p>
          </div>
        ) : !monitoringActive ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-emerald-400/30 mx-auto mb-3" />
            <p className="text-slate-400 text-sm mb-2">Monitoring not yet started</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-[#0f1623] rounded-lg border border-[#2a3548]">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm text-white">Notification Threshold</Label>
                <Badge className="bg-emerald-500/20 text-emerald-400">{notificationThreshold} days before review</Badge>
              </div>
              <div className="flex gap-2">
                {[7, 14, 30, 60].map(days => (
                  <Button
                    key={days}
                    size="sm"
                    variant={notificationThreshold === days ? "default" : "outline"}
                    onClick={() => setNotificationThreshold(days)}
                    className={notificationThreshold === days ? "bg-emerald-600" : ""}
                  >
                    {days}d
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-white font-medium">Monitoring Active</p>
                <p className="text-xs text-slate-400 mt-0.5">Checking every hour for controls due for review</p>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400">{upcomingControls.length} Tracked</Badge>
            </div>

            {upcomingControls.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-400" />
                  Controls Due for Review
                </h4>
                <div className="space-y-2">
                  {upcomingControls.map((control, idx) => {
                    const nextReview = getNextReviewDate(control);
                    const daysUntilReview = differenceInDays(nextReview, new Date());
                    
                    return (
                      <Card key={idx} className="bg-[#0f1623] border-emerald-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-semibold text-white mb-1">{control.name}</h5>
                              <div className="flex items-center gap-2 text-xs">
                                <Badge className="bg-emerald-500/20 text-emerald-400">Effectiveness: {control.effectiveness}/5</Badge>
                                <Badge className="bg-blue-500/20 text-blue-400">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {daysUntilReview}d remaining
                                </Badge>
                              </div>
                            </div>
                            <Mail className="h-4 w-4 text-emerald-400" />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="p-3 bg-[#0f1623] rounded-lg border border-[#2a3548] text-xs text-slate-400">
              <strong className="text-white">Criteria:</strong> High-effectiveness controls (≥4/5) or controls with linked risks within {notificationThreshold} days of review
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}