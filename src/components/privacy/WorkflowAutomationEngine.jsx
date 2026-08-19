import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Zap, Plus, Settings, Bell, Mail, Users, Database } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function WorkflowAutomationEngine() {
  const [newRule, setNewRule] = useState({
    name: '',
    trigger: 'dsar_logged',
    workflow: 'dsar_processing',
    conditions: {},
    actions: [],
    enabled: true
  });

  const queryClient = useQueryClient();

  const { data: automationRules = [] } = useQuery({
    queryKey: ['privacy-automation-rules'],
    queryFn: () => [], // Would fetch from AutomationRule entity
    initialData: []
  });

  const createRuleMutation = useMutation({
    mutationFn: (rule) => {
      toast.success(`Automation rule "${rule.name}" created`);
      return Promise.resolve(rule);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['privacy-automation-rules'] })
  });

  const triggers = [
    { value: 'dsar_logged', label: 'DSAR Request Logged', description: 'When a data subject access request is submitted' },
    { value: 'pia_required', label: 'PIA Required', description: 'When a project involving PII is flagged' },
    { value: 'consent_withdrawn', label: 'Consent Withdrawn', description: 'When user withdraws consent' },
    { value: 'breach_detected', label: 'Breach Detected', description: 'When a potential data breach is detected' },
    { value: 'vendor_onboarded', label: 'Vendor Onboarded', description: 'When a new vendor processes personal data' },
    { value: 'retention_deadline', label: 'Retention Deadline', description: 'When data retention period expires' },
    { value: 'task_overdue', label: 'Task Overdue', description: 'When workflow task exceeds deadline' }
  ];

  const workflows = [
    { value: 'dsar_processing', label: 'DSAR Processing' },
    { value: 'pia_assessment', label: 'PIA Assessment' },
    { value: 'breach_response', label: 'Breach Response' },
    { value: 'consent_management', label: 'Consent Management' },
    { value: 'vendor_assessment', label: 'Vendor Privacy Assessment' },
    { value: 'data_deletion', label: 'Data Deletion Workflow' }
  ];

  const integrations = [
    { value: 'jira', label: 'Jira', icon: '🎫', type: 'ticketing' },
    { value: 'servicenow', label: 'ServiceNow', icon: '🔧', type: 'ticketing' },
    { value: 'slack', label: 'Slack', icon: '💬', type: 'communication' },
    { value: 'email', label: 'Email', icon: '📧', type: 'communication' },
    { value: 'workday', label: 'Workday', icon: '👥', type: 'hr' },
    { value: 'salesforce', label: 'Salesforce', icon: '☁️', type: 'crm' }
  ];

  const actionTypes = [
    { value: 'create_task', label: 'Create Task', icon: Plus },
    { value: 'assign_user', label: 'Auto-assign User', icon: Users },
    { value: 'send_notification', label: 'Send Notification', icon: Bell },
    { value: 'send_email', label: 'Send Email', icon: Mail },
    { value: 'create_ticket', label: 'Create Ticket (External)', icon: Database },
    { value: 'escalate', label: 'Escalate', icon: Zap }
  ];

  const handleCreateRule = () => {
    if (!newRule.name || !newRule.trigger || !newRule.workflow) {
      toast.error("Please fill in all required fields");
      return;
    }
    createRuleMutation.mutate(newRule);
    setNewRule({
      name: '',
      trigger: 'dsar_logged',
      workflow: 'dsar_processing',
      conditions: {},
      actions: [],
      enabled: true
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-400" />
            Workflow Automation Engine
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-400 mb-2 block">Rule Name</Label>
              <Input
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                placeholder="e.g., Auto-process DSAR requests"
                className="bg-[#0f1623] border-[#2a3548] text-white"
              />
            </div>
            <div>
              <Label className="text-slate-400 mb-2 block">Trigger Event</Label>
              <Select value={newRule.trigger} onValueChange={(v) => setNewRule({ ...newRule, trigger: v })}>
                <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  {triggers.map(trigger => (
                    <SelectItem key={trigger.value} value={trigger.value} className="text-white">
                      {trigger.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-slate-400 mb-2 block">Initiate Workflow</Label>
            <Select value={newRule.workflow} onValueChange={(v) => setNewRule({ ...newRule, workflow: v })}>
              <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                {workflows.map(wf => (
                  <SelectItem key={wf.value} value={wf.value} className="text-white">
                    {wf.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
            <div>
              <div className="text-sm text-white font-medium">Enable Rule</div>
              <div className="text-xs text-slate-500">Activate automation immediately</div>
            </div>
            <Switch
              checked={newRule.enabled}
              onCheckedChange={(checked) => setNewRule({ ...newRule, enabled: checked })}
            />
          </div>

          <Button onClick={handleCreateRule} className="w-full bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Automation Rule
          </Button>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-400" />
              Reminder & Escalation Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                <div>
                  <div className="text-sm text-white">1st Reminder</div>
                  <div className="text-xs text-slate-500">2 days before deadline</div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                <div>
                  <div className="text-sm text-white">2nd Reminder</div>
                  <div className="text-xs text-slate-500">1 day before deadline</div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                <div>
                  <div className="text-sm text-white">Overdue Alert</div>
                  <div className="text-xs text-slate-500">On deadline day</div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f1623] border border-amber-500/30">
                <div>
                  <div className="text-sm text-white">Escalate to Manager</div>
                  <div className="text-xs text-amber-400">2 days overdue</div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-400" />
              System Integrations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {integrations.map(integration => (
              <div key={integration.value} className="flex items-center justify-between p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{integration.icon}</span>
                  <div>
                    <div className="text-sm text-white font-medium">{integration.label}</div>
                    <div className="text-xs text-slate-500 capitalize">{integration.type}</div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-[#2a3548] text-xs">
                  <Settings className="h-3 w-3 mr-1" />
                  Configure
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base">Pre-configured Automation Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: 'Auto-process DSARs', trigger: 'DSAR Logged', workflow: 'DSAR Processing', enabled: true, executions: 47 },
            { name: 'PIA for PII projects', trigger: 'PIA Required', workflow: 'PIA Assessment', enabled: true, executions: 12 },
            { name: 'Consent withdrawal handler', trigger: 'Consent Withdrawn', workflow: 'Consent Management', enabled: true, executions: 8 },
            { name: 'Overdue task escalation', trigger: 'Task Overdue', workflow: 'Multiple', enabled: true, executions: 23 },
            { name: 'Vendor privacy check', trigger: 'Vendor Onboarded', workflow: 'Vendor Assessment', enabled: false, executions: 0 }
          ].map((rule, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-[#0f1623] border border-[#2a3548]">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-sm font-semibold text-white">{rule.name}</div>
                  <Badge className={rule.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}>
                    {rule.enabled ? 'Active' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>Trigger: {rule.trigger}</span>
                  <span>→</span>
                  <span>Workflow: {rule.workflow}</span>
                  <span>•</span>
                  <span>{rule.executions} executions</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={rule.enabled} />
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}