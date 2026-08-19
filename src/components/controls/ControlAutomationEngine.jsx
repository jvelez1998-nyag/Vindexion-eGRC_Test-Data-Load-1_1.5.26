import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Clock, Bell, TrendingUp, AlertTriangle, Shield, CheckCircle2, Activity, Settings, Database, Wrench } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function ControlAutomationEngine() {
  const queryClient = useQueryClient();
  const [automations, setAutomations] = useState({
    auto_effectiveness_calc: true,
    test_reminders: true,
    failure_alerts: true,
    periodic_testing: true,
    control_monitoring: true,
    compliance_tracking: true,
    gap_detection: false,
    optimization_suggestions: true
  });

  const [newSchedule, setNewSchedule] = useState({
    control_id: '',
    frequency: 'monthly',
    trigger_type: 'schedule'
  });

  const [newIntegration, setNewIntegration] = useState({
    name: '',
    type: 'siem',
    endpoint: '',
    api_key: ''
  });

  const [newRemediation, setNewRemediation] = useState({
    control_id: '',
    failure_condition: '',
    action_type: 'notify',
    action_config: ''
  });

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: () => base44.entities.Control.list(),
  });

  const { data: schedules = [] } = useQuery({
    queryKey: ['control-test-schedules'],
    queryFn: () => base44.entities.ControlTestSchedule.list(),
  });

  const workflows = [
    {
      id: 'auto_effectiveness_calc',
      title: 'Auto Effectiveness Calculation',
      description: 'Automatically calculate control effectiveness based on test results',
      icon: Activity,
      color: 'indigo',
      benefit: 'Real-time control health'
    },
    {
      id: 'test_reminders',
      title: 'Testing Reminders',
      description: 'Send automated reminders for upcoming control tests',
      icon: Bell,
      color: 'violet',
      benefit: 'Never miss a test'
    },
    {
      id: 'failure_alerts',
      title: 'Control Failure Alerts',
      description: 'Alert stakeholders immediately when controls fail testing',
      icon: AlertTriangle,
      color: 'rose',
      benefit: 'Immediate awareness'
    },
    {
      id: 'periodic_testing',
      title: 'Automated Periodic Testing',
      description: 'Auto-schedule and execute tests based on control frequency',
      icon: Clock,
      color: 'amber',
      benefit: 'Consistent testing'
    },
    {
      id: 'control_monitoring',
      title: 'Continuous Control Monitoring',
      description: 'Monitor control performance and detect anomalies',
      icon: TrendingUp,
      color: 'emerald',
      benefit: 'Proactive management'
    },
    {
      id: 'compliance_tracking',
      title: 'Compliance Tracking',
      description: 'Track control compliance with frameworks and regulations',
      icon: Shield,
      color: 'blue',
      benefit: 'Regulatory readiness'
    },
    {
      id: 'gap_detection',
      title: 'Control Gap Detection',
      description: 'Use AI to identify control coverage gaps',
      icon: Zap,
      color: 'cyan',
      benefit: 'Complete coverage'
    },
    {
      id: 'optimization_suggestions',
      title: 'AI Optimization Suggestions',
      description: 'Get AI recommendations for improving control effectiveness',
      icon: CheckCircle2,
      color: 'purple',
      benefit: 'Continuous improvement'
    }
  ];

  const toggleAutomation = (id) => {
    setAutomations(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const createScheduleMutation = useMutation({
    mutationFn: (data) => base44.entities.ControlTestSchedule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['control-test-schedules']);
      toast.success("Test schedule created");
      setNewSchedule({ control_id: '', frequency: 'monthly', trigger_type: 'schedule' });
    }
  });

  const handleCreateSchedule = () => {
    const control = controls.find(c => c.id === newSchedule.control_id);
    if (!control) return;

    const nextTestDate = new Date();
    switch(newSchedule.frequency) {
      case 'daily': nextTestDate.setDate(nextTestDate.getDate() + 1); break;
      case 'weekly': nextTestDate.setDate(nextTestDate.getDate() + 7); break;
      case 'monthly': nextTestDate.setMonth(nextTestDate.getMonth() + 1); break;
      case 'quarterly': nextTestDate.setMonth(nextTestDate.getMonth() + 3); break;
      default: nextTestDate.setMonth(nextTestDate.getMonth() + 1);
    }

    createScheduleMutation.mutate({
      control_id: newSchedule.control_id,
      schedule_name: `Auto-test: ${control.name}`,
      frequency: newSchedule.frequency,
      next_test_date: nextTestDate.toISOString().split('T')[0],
      auto_execute: true,
      is_active: true
    });
  };

  const activeCount = Object.values(automations).filter(Boolean).length;

  const colorClasses = {
    indigo: 'from-indigo-500/10 to-purple-500/10 border-indigo-500/20',
    violet: 'from-violet-500/10 to-purple-500/10 border-violet-500/20',
    rose: 'from-rose-500/10 to-red-500/10 border-rose-500/20',
    emerald: 'from-emerald-500/10 to-green-500/10 border-emerald-500/20',
    amber: 'from-amber-500/10 to-orange-500/10 border-amber-500/20',
    blue: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20',
    cyan: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/20',
    purple: 'from-purple-500/10 to-violet-500/10 border-purple-500/20'
  };

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="bg-[#1a2332] border border-[#2a3548]">
        <TabsTrigger value="overview">
          <Activity className="h-4 w-4 mr-2" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="schedules">
          <Clock className="h-4 w-4 mr-2" />
          Test Schedules
        </TabsTrigger>
        <TabsTrigger value="integrations">
          <Database className="h-4 w-4 mr-2" />
          Integrations
        </TabsTrigger>
        <TabsTrigger value="remediation">
          <Wrench className="h-4 w-4 mr-2" />
          Auto-Remediation
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white mb-1">{activeCount}</div>
                <div className="text-sm text-slate-400">Active Rules</div>
              </div>
              <Zap className="h-8 w-8 text-indigo-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white mb-1">24/7</div>
                <div className="text-sm text-slate-400">Monitoring</div>
              </div>
              <Activity className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white mb-1">~20h</div>
                <div className="text-sm text-slate-400">Saved/Month</div>
              </div>
              <Clock className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automation Rules */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-lg">Automation & Monitoring Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {workflows.map(workflow => {
              const Icon = workflow.icon;
              const isActive = automations[workflow.id];
              
              return (
                <Card key={workflow.id} className={`bg-gradient-to-br ${colorClasses[workflow.color]} transition-all`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-lg bg-${workflow.color}-500/10 border border-${workflow.color}-500/20`}>
                          <Icon className={`h-5 w-5 text-${workflow.color}-400`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-white">{workflow.title}</h4>
                            <Badge className={isActive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-500/20 text-slate-400'}>
                              {isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-400 mb-2">{workflow.description}</p>
                          <div className="text-xs text-slate-500">
                            Benefit: {workflow.benefit}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={isActive}
                          onCheckedChange={() => toggleAutomation(workflow.id)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Benefits Summary */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base">Automation Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium">Proactive Control Management</p>
                  <p className="text-xs text-slate-400">Identify issues before they impact operations</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium">Reduced Manual Effort</p>
                  <p className="text-xs text-slate-400">Automate repetitive control testing and monitoring</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium">Enhanced Visibility</p>
                  <p className="text-xs text-slate-400">Real-time control effectiveness dashboards</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium">Better Decision Making</p>
                  <p className="text-xs text-slate-400">AI-powered insights for control optimization</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </TabsContent>

      <TabsContent value="schedules" className="space-y-6">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base">Create Automated Test Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Select Control</label>
                <Select value={newSchedule.control_id} onValueChange={(v) => setNewSchedule({...newSchedule, control_id: v})}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue placeholder="Choose control..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    {controls.map(c => (
                      <SelectItem key={c.id} value={c.id} className="text-white">
                        {c.name || c.control_id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Test Frequency</label>
                <Select value={newSchedule.frequency} onValueChange={(v) => setNewSchedule({...newSchedule, frequency: v})}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="daily" className="text-white">Daily</SelectItem>
                    <SelectItem value="weekly" className="text-white">Weekly</SelectItem>
                    <SelectItem value="monthly" className="text-white">Monthly</SelectItem>
                    <SelectItem value="quarterly" className="text-white">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={handleCreateSchedule} className="w-full bg-indigo-600 hover:bg-indigo-700">
                  <Clock className="h-4 w-4 mr-2" />
                  Create Schedule
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base">Active Test Schedules ({schedules.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {schedules.length === 0 ? (
                <p className="text-sm text-slate-400">No automated schedules configured yet</p>
              ) : (
                schedules.map(schedule => {
                  const control = controls.find(c => c.id === schedule.control_id);
                  return (
                    <Card key={schedule.id} className="bg-[#151d2e] border-[#2a3548]">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-white mb-1">
                              {control?.name || 'Unknown Control'}
                            </h4>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-blue-500/10 text-blue-400 text-xs">
                                {schedule.frequency}
                              </Badge>
                              {schedule.auto_execute && (
                                <Badge className="bg-emerald-500/10 text-emerald-400 text-xs">
                                  Auto-execute
                                </Badge>
                              )}
                              <span className="text-xs text-slate-500">
                                Next: {schedule.next_test_date || 'Not scheduled'}
                              </span>
                            </div>
                          </div>
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="integrations" className="space-y-6">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base">Configure External System Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Integration Name</label>
                <Input
                  value={newIntegration.name}
                  onChange={(e) => setNewIntegration({...newIntegration, name: e.target.value})}
                  placeholder="e.g., Production SIEM"
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">System Type</label>
                <Select value={newIntegration.type} onValueChange={(v) => setNewIntegration({...newIntegration, type: v})}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="siem" className="text-white">SIEM (Splunk, QRadar)</SelectItem>
                    <SelectItem value="vuln_scanner" className="text-white">Vulnerability Scanner</SelectItem>
                    <SelectItem value="cloud_security" className="text-white">Cloud Security (AWS, Azure)</SelectItem>
                    <SelectItem value="iam" className="text-white">IAM System</SelectItem>
                    <SelectItem value="endpoint" className="text-white">Endpoint Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">API Endpoint</label>
                <Input
                  value={newIntegration.endpoint}
                  onChange={(e) => setNewIntegration({...newIntegration, endpoint: e.target.value})}
                  placeholder="https://api.example.com"
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">API Key / Token</label>
                <Input
                  type="password"
                  value={newIntegration.api_key}
                  onChange={(e) => setNewIntegration({...newIntegration, api_key: e.target.value})}
                  placeholder="••••••••••••"
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
            </div>

            <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
              <Database className="h-4 w-4 mr-2" />
              Test & Save Integration
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base">Evidence Collection Capabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="h-5 w-5 text-blue-400" />
                  <h4 className="font-medium text-white">SIEM Integration</h4>
                </div>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li>• Auto-collect security event logs</li>
                  <li>• Analyze authentication patterns</li>
                  <li>• Detect anomalous activities</li>
                  <li>• Generate compliance reports</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-br from-rose-500/10 to-orange-500/10 border border-rose-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="h-5 w-5 text-rose-400" />
                  <h4 className="font-medium text-white">Vulnerability Scanner</h4>
                </div>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li>• Continuous vulnerability assessment</li>
                  <li>• Patch compliance verification</li>
                  <li>• Configuration drift detection</li>
                  <li>• Security posture scoring</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <Database className="h-5 w-5 text-emerald-400" />
                  <h4 className="font-medium text-white">Cloud Security</h4>
                </div>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li>• Cloud config compliance checks</li>
                  <li>• IAM policy verification</li>
                  <li>• Resource tagging validation</li>
                  <li>• Encryption status monitoring</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-purple-400" />
                  <h4 className="font-medium text-white">Endpoint Security</h4>
                </div>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li>• Antivirus status verification</li>
                  <li>• Patch deployment tracking</li>
                  <li>• Device compliance monitoring</li>
                  <li>• Threat detection data</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="remediation" className="space-y-6">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base">Configure Automated Remediation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Control to Monitor</label>
                <Select value={newRemediation.control_id} onValueChange={(v) => setNewRemediation({...newRemediation, control_id: v})}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue placeholder="Choose control..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    {controls.map(c => (
                      <SelectItem key={c.id} value={c.id} className="text-white">
                        {c.name || c.control_id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Failure Condition</label>
                <Select value={newRemediation.failure_condition} onValueChange={(v) => setNewRemediation({...newRemediation, failure_condition: v})}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue placeholder="Select condition..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="test_failed" className="text-white">Test Failed</SelectItem>
                    <SelectItem value="effectiveness_low" className="text-white">Effectiveness &lt; 60%</SelectItem>
                    <SelectItem value="exception_detected" className="text-white">Exception Detected</SelectItem>
                    <SelectItem value="compliance_breach" className="text-white">Compliance Breach</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Remediation Action</label>
                <Select value={newRemediation.action_type} onValueChange={(v) => setNewRemediation({...newRemediation, action_type: v})}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="notify" className="text-white">Send Notification</SelectItem>
                    <SelectItem value="create_ticket" className="text-white">Create Ticket</SelectItem>
                    <SelectItem value="trigger_workflow" className="text-white">Trigger Workflow</SelectItem>
                    <SelectItem value="disable_access" className="text-white">Disable Access (Critical)</SelectItem>
                    <SelectItem value="revert_config" className="text-white">Revert Configuration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Action Configuration</label>
                <Input
                  value={newRemediation.action_config}
                  onChange={(e) => setNewRemediation({...newRemediation, action_config: e.target.value})}
                  placeholder="e.g., email@example.com, workflow_id"
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
            </div>

            <Button className="w-full bg-rose-600 hover:bg-rose-700">
              <Wrench className="h-4 w-4 mr-2" />
              Save Remediation Rule
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base">Remediation Action Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                <div className="flex items-start gap-3">
                  <Bell className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-white mb-1">Notifications & Alerts</h4>
                    <p className="text-xs text-slate-400">Send email/Slack alerts to control owners and stakeholders</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                <div className="flex items-start gap-3">
                  <Settings className="h-5 w-5 text-emerald-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-white mb-1">Automated Ticket Creation</h4>
                    <p className="text-xs text-slate-400">Create tickets in JIRA, ServiceNow for remediation tracking</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-amber-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-white mb-1">Workflow Triggers</h4>
                    <p className="text-xs text-slate-400">Initiate approval workflows or remediation playbooks</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#151d2e] border border-rose-500/30">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-rose-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-white mb-1">Critical Actions</h4>
                    <p className="text-xs text-slate-400">Disable access, revert configs, quarantine systems (requires approval)</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}