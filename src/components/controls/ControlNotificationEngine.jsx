import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, AlertTriangle, CheckCircle2, Clock, XCircle, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function ControlNotificationEngine() {
  const [alerts, setAlerts] = useState([]);
  const queryClient = useQueryClient();

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: () => base44.entities.Control.list()
  });

  const { data: controlTests = [] } = useQuery({
    queryKey: ['control-tests'],
    queryFn: () => base44.entities.ControlTest.list()
  });

  const { data: schedules = [] } = useQuery({
    queryKey: ['control-test-schedules'],
    queryFn: () => base44.entities.ControlTestSchedule.list()
  });

  const createNotificationMutation = useMutation({
    mutationFn: (data) => base44.entities.Notification.create(data)
  });

  // Analyze and generate alerts
  useEffect(() => {
    if (controls.length === 0) return;

    const newAlerts = [];
    const today = new Date();

    // Check for failed tests
    const recentFailedTests = controlTests.filter(test => {
      const testDate = new Date(test.test_date);
      const daysDiff = (today - testDate) / (1000 * 60 * 60 * 24);
      return test.test_result === 'failed' && daysDiff <= 7;
    });

    recentFailedTests.forEach(test => {
      const control = controls.find(c => c.id === test.control_id);
      if (control) {
        newAlerts.push({
          type: 'test_failure',
          severity: 'high',
          title: 'Control Test Failed',
          message: `Control "${control.name}" failed testing on ${new Date(test.test_date).toLocaleDateString()}`,
          controlId: control.id,
          controlName: control.name,
          actionRequired: true
        });
      }
    });

    // Check for ineffective controls
    const ineffectiveControls = controls.filter(c => c.status === 'ineffective' || c.effectiveness < 3);
    ineffectiveControls.forEach(control => {
      newAlerts.push({
        type: 'ineffective_control',
        severity: 'high',
        title: 'Ineffective Control Detected',
        message: `Control "${control.name}" is marked as ineffective or has low effectiveness (${control.effectiveness}/5)`,
        controlId: control.id,
        controlName: control.name,
        actionRequired: true
      });
    });

    // Check for upcoming tests
    schedules.filter(s => s.is_active && s.next_test_date).forEach(schedule => {
      const nextTest = new Date(schedule.next_test_date);
      const daysTillTest = Math.ceil((nextTest - today) / (1000 * 60 * 60 * 24));
      
      if (daysTillTest > 0 && daysTillTest <= (schedule.notification_days_before || 7)) {
        const control = controls.find(c => c.id === schedule.control_id);
        if (control) {
          newAlerts.push({
            type: 'upcoming_test',
            severity: 'medium',
            title: 'Upcoming Control Test',
            message: `Control "${control.name}" is scheduled for testing in ${daysTillTest} day(s)`,
            controlId: control.id,
            controlName: control.name,
            actionRequired: false
          });
        }
      }
    });

    // Check for controls without recent tests
    controls.forEach(control => {
      if (!control.last_tested_date) {
        newAlerts.push({
          type: 'never_tested',
          severity: 'medium',
          title: 'Control Never Tested',
          message: `Control "${control.name}" has no testing history`,
          controlId: control.id,
          controlName: control.name,
          actionRequired: true
        });
      } else {
        const lastTest = new Date(control.last_tested_date);
        const daysSinceTest = Math.ceil((today - lastTest) / (1000 * 60 * 60 * 24));
        
        if (daysSinceTest > 180) {
          newAlerts.push({
            type: 'overdue_test',
            severity: 'high',
            title: 'Control Testing Overdue',
            message: `Control "${control.name}" hasn't been tested in ${daysSinceTest} days`,
            controlId: control.id,
            controlName: control.name,
            actionRequired: true
          });
        }
      }
    });

    setAlerts(newAlerts);
  }, [controls, controlTests, schedules]);

  const handleSendNotification = async (alert) => {
    const control = controls.find(c => c.id === alert.controlId);
    if (!control) return;

    const recipients = [control.owner, control.tester].filter(Boolean);
    
    for (const recipient of recipients) {
      await createNotificationMutation.mutateAsync({
        user_email: recipient,
        title: alert.title,
        message: alert.message,
        type: alert.type,
        priority: alert.severity,
        metadata: {
          control_id: control.id,
          control_name: control.name
        }
      });
    }

    toast.success(`Notification sent to ${recipients.length} recipient(s)`);
  };

  const severityColors = {
    critical: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    low: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  };

  const typeIcons = {
    test_failure: XCircle,
    ineffective_control: AlertTriangle,
    upcoming_test: Clock,
    never_tested: AlertTriangle,
    overdue_test: Clock
  };

  const criticalAlerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'high');
  const otherAlerts = alerts.filter(a => a.severity === 'medium' || a.severity === 'low');

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-[#1a2332] border-[#2a3548] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 mb-1">Total Alerts</div>
              <div className="text-2xl font-bold text-white">{alerts.length}</div>
            </div>
            <Bell className="h-8 w-8 text-indigo-400 opacity-50" />
          </div>
        </Card>
        <Card className="bg-[#1a2332] border-[#2a3548] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 mb-1">Critical/High</div>
              <div className="text-2xl font-bold text-rose-400">{criticalAlerts.length}</div>
            </div>
            <AlertTriangle className="h-8 w-8 text-rose-400 opacity-50" />
          </div>
        </Card>
        <Card className="bg-[#1a2332] border-[#2a3548] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 mb-1">Action Required</div>
              <div className="text-2xl font-bold text-amber-400">{alerts.filter(a => a.actionRequired).length}</div>
            </div>
            <TrendingUp className="h-8 w-8 text-amber-400 opacity-50" />
          </div>
        </Card>
        <Card className="bg-[#1a2332] border-[#2a3548] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 mb-1">Test Failures</div>
              <div className="text-2xl font-bold text-orange-400">{alerts.filter(a => a.type === 'test_failure').length}</div>
            </div>
            <XCircle className="h-8 w-8 text-orange-400 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Alerts List */}
      <Card className="bg-[#1a2332] border-[#2a3548] p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Active Alerts & Notifications</h3>
        
        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-slate-400">No alerts - all controls are healthy</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-4 pr-4">
              {/* Critical/High Alerts */}
              {criticalAlerts.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-rose-400 mb-3">Critical & High Priority ({criticalAlerts.length})</h4>
                  <div className="space-y-3">
                    {criticalAlerts.map((alert, idx) => {
                      const Icon = typeIcons[alert.type];
                      return (
                        <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-rose-500/10">
                              <Icon className="h-5 w-5 text-rose-400" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h5 className="font-medium text-white mb-1">{alert.title}</h5>
                                  <p className="text-sm text-slate-400">{alert.message}</p>
                                </div>
                                <Badge className={severityColors[alert.severity]}>
                                  {alert.severity}
                                </Badge>
                              </div>
                              {alert.actionRequired && (
                                <div className="flex items-center gap-2 mt-3">
                                  <Badge className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/20">
                                    Action Required
                                  </Badge>
                                  <Button
                                    size="sm"
                                    onClick={() => handleSendNotification(alert)}
                                    className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700"
                                  >
                                    <Bell className="h-3 w-3 mr-1" />
                                    Notify Stakeholders
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Other Alerts */}
              {otherAlerts.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-amber-400 mb-3">Medium & Low Priority ({otherAlerts.length})</h4>
                  <div className="space-y-3">
                    {otherAlerts.map((alert, idx) => {
                      const Icon = typeIcons[alert.type];
                      return (
                        <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-amber-500/10">
                              <Icon className="h-4 w-4 text-amber-400" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h5 className="font-medium text-white text-sm mb-1">{alert.title}</h5>
                                  <p className="text-xs text-slate-400">{alert.message}</p>
                                </div>
                                <Badge className={severityColors[alert.severity]}>
                                  {alert.severity}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </Card>
    </div>
  );
}