import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, AlertCircle, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function KRIThresholdMonitor({ kris, onRefresh }) {
  const [monitoringEnabled, setMonitoringEnabled] = useState(false);
  const [breaches, setBreaches] = useState([]);

  useEffect(() => {
    if (monitoringEnabled) {
      checkThresholds();
      const interval = setInterval(checkThresholds, 300000); // Every 5 minutes
      return () => clearInterval(interval);
    }
  }, [monitoringEnabled, kris]);

  const checkThresholds = async () => {
    const currentBreaches = [];

    for (const kri of kris) {
      if (!kri.alert_enabled || kri.status !== 'active') continue;

      const status = calculateStatus(kri);
      
      if (status === 'red' || status === 'amber') {
        currentBreaches.push({ kri, status });

        // Send notifications
        if (kri.alert_recipients?.length > 0) {
          for (const recipient of kri.alert_recipients) {
            try {
              await base44.entities.Notification.create({
                user_email: recipient,
                type: 'kri_threshold_breach',
                title: `KRI Alert: ${kri.name}`,
                message: `${kri.name} has breached ${status} threshold. Current value: ${kri.current_value} ${kri.unit}`,
                priority: status === 'red' ? 'critical' : 'high',
                entity_type: 'KeyIndicator',
                entity_id: kri.id,
                metadata: {
                  current_value: kri.current_value,
                  threshold_status: status,
                  target_value: kri.target_value
                }
              });

              await base44.integrations.Core.SendEmail({
                to: recipient,
                subject: `🚨 KRI Alert: ${kri.name}`,
                body: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: ${status === 'red' ? '#ef4444' : '#f59e0b'}; padding: 20px; border-radius: 8px 8px 0 0;">
                      <h2 style="color: white; margin: 0;">🚨 KRI Threshold Alert</h2>
                    </div>
                    <div style="background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
                      <h3 style="color: #1f2937; margin-top: 0;">${kri.name}</h3>
                      
                      <div style="background: #fee2e2; padding: 15px; border-left: 4px solid ${status === 'red' ? '#ef4444' : '#f59e0b'}; margin: 15px 0;">
                        <p style="margin: 0; color: #991b1b;"><strong>Status: ${status.toUpperCase()}</strong></p>
                      </div>
                      
                      <table style="width: 100%; margin: 15px 0; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 8px; background: #f9fafb; border: 1px solid #e5e7eb;"><strong>Current Value:</strong></td>
                          <td style="padding: 8px; border: 1px solid #e5e7eb;">${kri.current_value} ${kri.unit || ''}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px; background: #f9fafb; border: 1px solid #e5e7eb;"><strong>Target Value:</strong></td>
                          <td style="padding: 8px; border: 1px solid #e5e7eb;">${kri.target_value} ${kri.unit || ''}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px; background: #f9fafb; border: 1px solid #e5e7eb;"><strong>${status === 'red' ? 'Red' : 'Amber'} Threshold:</strong></td>
                          <td style="padding: 8px; border: 1px solid #e5e7eb;">${status === 'red' ? kri.threshold_red : kri.threshold_amber} ${kri.unit || ''}</td>
                        </tr>
                      </table>
                      
                      <p style="color: #6b7280;">Please review and take appropriate action to bring this indicator back within acceptable thresholds.</p>
                    </div>
                  </div>
                `
              });
            } catch (error) {
              console.error(`Failed to send alert for ${kri.name}`, error);
            }
          }
        }
      }
    }

    setBreaches(currentBreaches);
    if (currentBreaches.length > 0) {
      toast.warning(`${currentBreaches.length} KRI threshold breach(es) detected`);
    }
  };

  const calculateStatus = (kri) => {
    const { current_value, threshold_green, threshold_amber, threshold_red, direction } = kri;
    
    if (direction === "lower_better") {
      if (current_value <= threshold_green) return "green";
      if (current_value <= threshold_amber) return "amber";
      return "red";
    } else {
      if (current_value >= threshold_green) return "green";
      if (current_value >= threshold_amber) return "amber";
      return "red";
    }
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-500/5 via-[#1a2332] to-purple-500/5 border-indigo-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-indigo-400" />
            <CardTitle className="text-sm">Threshold Monitoring</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-slate-400">Auto-Monitor</Label>
            <Switch checked={monitoringEnabled} onCheckedChange={setMonitoringEnabled} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!monitoringEnabled ? (
          <p className="text-xs text-slate-500 text-center py-4">Enable monitoring to track threshold breaches</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-2 bg-indigo-500/10 border border-indigo-500/30 rounded">
              <CheckCircle2 className="h-4 w-4 text-indigo-400" />
              <span className="text-xs text-white">Monitoring active • Checking every 5 minutes</span>
            </div>

            {breaches.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-amber-400">⚠️ Active Breaches ({breaches.length})</p>
                {breaches.map(({ kri, status }, idx) => (
                  <div key={idx} className="p-2 bg-[#0f1623] rounded border border-[#2a3548]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white">{kri.name}</span>
                      <Badge className={
                        status === 'red' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                      }>
                        {status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Current: {kri.current_value} {kri.unit} • Target: {kri.target_value} {kri.unit}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs text-emerald-400">All KRIs within thresholds</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}