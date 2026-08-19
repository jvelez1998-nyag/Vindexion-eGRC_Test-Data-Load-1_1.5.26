import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Zap, Brain, AlertTriangle, CheckCircle2, Clock, Play, Pause } from "lucide-react";
import { toast } from "sonner";

export default function AIVendorWorkflowAutomation() {
  const [automationRules, setAutomationRules] = useState([
    {
      id: 'high_risk_due_diligence',
      name: 'High Risk Due Diligence',
      enabled: true,
      trigger: 'vendor_risk_score >= 70',
      actions: ['initiate_due_diligence', 'assign_security_review', 'notify_compliance_team'],
      description: 'Automatically trigger enhanced due diligence for high-risk vendors'
    },
    {
      id: 'compliance_gap_alert',
      name: 'Compliance Gap Alert',
      enabled: true,
      trigger: 'compliance_score < 60',
      actions: ['create_remediation_tasks', 'notify_vendor', 'schedule_review'],
      description: 'Alert and create tasks when vendor compliance drops below threshold'
    },
    {
      id: 'onboarding_workflow',
      name: 'Smart Onboarding',
      enabled: true,
      trigger: 'vendor_status == new',
      actions: ['ai_generate_checklist', 'assign_onboarding_tasks', 'schedule_kickoff'],
      description: 'AI-powered onboarding workflow with intelligent task generation'
    },
    {
      id: 'contract_renewal',
      name: 'Contract Renewal Prep',
      enabled: true,
      trigger: 'contract_expires_in <= 90_days',
      actions: ['performance_review', 'risk_reassessment', 'renewal_recommendation'],
      description: 'Automate contract renewal preparation and vendor re-evaluation'
    }
  ]);

  const queryClient = useQueryClient();

  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => base44.entities.Vendor.list('-updated_date', 100)
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['vendor-onboarding-tasks'],
    queryFn: () => base44.entities.VendorOnboardingTask.list('-created_date', 100)
  });

  // Auto-execute workflows
  useEffect(() => {
    if (vendors.length === 0) return;

    const executeWorkflows = async () => {
      for (const rule of automationRules.filter(r => r.enabled)) {
        for (const vendor of vendors) {
          const shouldTrigger = evaluateTrigger(rule.trigger, vendor);
          
          if (shouldTrigger) {
            await executeWorkflowActions(rule, vendor);
          }
        }
      }
    };

    executeWorkflows();
  }, [vendors, automationRules]);

  const evaluateTrigger = (trigger, vendor) => {
    try {
      if (trigger.includes('vendor_risk_score')) {
        const score = vendor.ai_risk_score || 0;
        return eval(trigger.replace('vendor_risk_score', score));
      }
      if (trigger.includes('compliance_score')) {
        const score = vendor.compliance_score || 0;
        return eval(trigger.replace('compliance_score', score));
      }
      if (trigger.includes('vendor_status')) {
        return vendor.status === 'new' || vendor.status === 'pending';
      }
      if (trigger.includes('contract_expires_in')) {
        if (!vendor.contract_end_date) return false;
        const endDate = new Date(vendor.contract_end_date);
        const daysUntilExpiry = Math.floor((endDate - new Date()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
      }
    } catch (error) {
      console.error('Trigger evaluation error:', error);
    }
    return false;
  };

  const executeWorkflowActions = async (rule, vendor) => {
    // Check if already executed recently
    const lastExecution = vendor[`last_${rule.id}_execution`];
    if (lastExecution) {
      const hoursSinceExecution = (new Date() - new Date(lastExecution)) / (1000 * 60 * 60);
      if (hoursSinceExecution < 24) return; // Don't execute more than once per day
    }

    try {
      for (const action of rule.actions) {
        await executeAction(action, vendor, rule);
      }

      // Mark as executed
      await base44.entities.Vendor.update(vendor.id, {
        [`last_${rule.id}_execution`]: new Date().toISOString()
      });
    } catch (error) {
      console.error('Workflow execution error:', error);
    }
  };

  const executeAction = async (action, vendor, rule) => {
    switch(action) {
      case 'initiate_due_diligence':
        // Create due diligence tasks
        await base44.entities.VendorOnboardingTask.create({
          vendor_id: vendor.id,
          task_name: 'Enhanced Due Diligence Review',
          description: `High risk vendor (Score: ${vendor.ai_risk_score}) requires enhanced due diligence`,
          task_type: 'due_diligence',
          priority: 'high',
          status: 'pending',
          assigned_to: vendor.owner || null,
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
        break;

      case 'assign_security_review':
        await base44.entities.VendorOnboardingTask.create({
          vendor_id: vendor.id,
          task_name: 'Security Assessment',
          description: 'Conduct comprehensive security review',
          task_type: 'security_review',
          priority: 'high',
          status: 'pending',
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        });
        break;

      case 'create_remediation_tasks':
        await base44.entities.VendorOnboardingTask.create({
          vendor_id: vendor.id,
          task_name: 'Compliance Remediation',
          description: `Address compliance gaps (Score: ${vendor.compliance_score || 0}%)`,
          task_type: 'remediation',
          priority: 'high',
          status: 'pending',
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
        break;

      case 'ai_generate_checklist':
        // AI generates onboarding checklist
        const prompt = `Generate onboarding checklist for vendor:
Name: ${vendor.name}
Category: ${vendor.vendor_category}
Services: ${vendor.services_provided}
Data Access: ${vendor.data_access_level}

Provide 10-15 specific onboarding tasks covering security, compliance, legal, and operational areas.`;

        const checklist = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              tasks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    priority: { type: "string" },
                    estimated_days: { type: "number" }
                  }
                }
              }
            }
          }
        });

        // Create tasks from AI checklist
        for (const task of checklist.tasks.slice(0, 10)) {
          await base44.entities.VendorOnboardingTask.create({
            vendor_id: vendor.id,
            task_name: task.name,
            description: task.description,
            task_type: 'onboarding',
            priority: task.priority,
            status: 'pending',
            due_date: new Date(Date.now() + task.estimated_days * 24 * 60 * 60 * 1000).toISOString()
          });
        }
        break;
    }
  };

  const toggleRule = (ruleId) => {
    setAutomationRules(prev => 
      prev.map(rule => 
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  const triggeredVendors = vendors.filter(v => 
    automationRules.some(rule => rule.enabled && evaluateTrigger(rule.trigger, v))
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Zap className="h-5 w-5 text-purple-400" />
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{automationRules.filter(r => r.enabled).length}</div>
                <div className="text-xs text-slate-400">Active Rules</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Clock className="h-5 w-5 text-amber-400" />
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{triggeredVendors.length}</div>
                <div className="text-xs text-slate-400">Triggered Vendors</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{tasks.filter(t => t.status === 'completed').length}</div>
                <div className="text-xs text-slate-400">Tasks Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automation Rules */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            AI Workflow Automation Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {automationRules.map(rule => (
              <Card key={rule.id} className="bg-[#151d2e] border-[#2a3548]">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-white">{rule.name}</h4>
                        <Badge className={rule.enabled ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'}>
                          {rule.enabled ? <Play className="h-3 w-3 mr-1" /> : <Pause className="h-3 w-3 mr-1" />}
                          {rule.enabled ? 'Active' : 'Paused'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400 mb-3">{rule.description}</p>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-slate-500 w-16">Trigger:</span>
                          <code className="text-xs bg-[#0f1623] px-2 py-1 rounded text-purple-400 border border-purple-500/30">
                            {rule.trigger}
                          </code>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-slate-500 w-16">Actions:</span>
                          <div className="flex flex-wrap gap-1">
                            {rule.actions.map((action, idx) => (
                              <Badge key={idx} className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">
                                {action.replace(/_/g, ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={() => toggleRule(rule.id)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Triggered Vendors */}
      {triggeredVendors.length > 0 && (
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              Vendors Requiring Action
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {triggeredVendors.map(vendor => {
                const matchingRules = automationRules.filter(rule => 
                  rule.enabled && evaluateTrigger(rule.trigger, vendor)
                );
                return (
                  <div key={vendor.id} className="p-3 bg-[#151d2e] rounded border border-amber-500/30">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h5 className="text-sm font-semibold text-white">{vendor.name}</h5>
                        <p className="text-xs text-slate-400">{vendor.vendor_category}</p>
                      </div>
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                        {matchingRules.length} rules active
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {matchingRules.map(rule => (
                        <Badge key={rule.id} className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px]">
                          {rule.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}