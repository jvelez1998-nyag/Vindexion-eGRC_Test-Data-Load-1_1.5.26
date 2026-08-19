import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { 
  Plus, Save, Trash2, GripVertical, Brain, Loader2, 
  Sparkles, Users, Bell, Clock, CheckCircle2, GitBranch
} from "lucide-react";
import { toast } from "sonner";

export default function AIWorkflowBuilder({ onSave }) {
  const [workflow, setWorkflow] = useState({
    name: "",
    description: "",
    process_type: "incident_response",
    trigger_type: "manual",
    steps: [],
    status: "draft"
  });
  const [loadingAI, setLoadingAI] = useState(false);

  const queryClient = useQueryClient();

  const saveWorkflowMutation = useMutation({
    mutationFn: (data) => base44.entities.AutomationRule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success("Workflow saved successfully");
      if (onSave) onSave();
    }
  });

  const processTypes = [
    { value: "incident_response", label: "Incident Response" },
    { value: "risk_assessment", label: "Risk Assessment Review" },
    { value: "control_testing", label: "Control Testing" },
    { value: "compliance_review", label: "Compliance Review" },
    { value: "vendor_onboarding", label: "Vendor Onboarding" },
    { value: "audit_preparation", label: "Audit Preparation" }
  ];

  const triggerTypes = [
    { value: "manual", label: "Manual Trigger" },
    { value: "entity_created", label: "When Entity Created" },
    { value: "entity_updated", label: "When Entity Updated" },
    { value: "status_change", label: "When Status Changes" },
    { value: "scheduled", label: "Scheduled (Time-based)" },
    { value: "threshold_breach", label: "When Threshold Breached" }
  ];

  const generateAISteps = async () => {
    setLoadingAI(true);
    try {
      const processInfo = processTypes.find(p => p.value === workflow.process_type);
      
      const prompt = `Generate a comprehensive workflow for: ${processInfo?.label}

Process Description: ${workflow.description || 'Standard GRC process workflow'}

Create a detailed workflow with the following structure:
1. Each step should have a clear name, description, and action type
2. Include role assignments (who should perform each step)
3. Add time estimates for SLA tracking
4. Include conditions for branching logic where applicable
5. Specify notification requirements

Action types available:
- task_assignment: Assign a task to a user/role
- approval: Require approval from specified role
- notification: Send notification to stakeholders
- data_collection: Collect required information
- review: Review and validate data
- decision: Make a decision with conditional branches
- escalation: Escalate to higher authority
- documentation: Document outcomes

Roles available:
- risk_manager, compliance_officer, auditor, control_owner, 
- incident_responder, security_analyst, executive, department_head

Generate 5-8 logical workflow steps that follow best practices for ${processInfo?.label}.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            workflow_summary: { type: "string" },
            steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  step_name: { type: "string" },
                  description: { type: "string" },
                  action_type: { type: "string" },
                  assigned_role: { type: "string" },
                  estimated_time_hours: { type: "number" },
                  requires_approval: { type: "boolean" },
                  send_notification: { type: "boolean" },
                  conditional_logic: { type: "string" }
                }
              }
            }
          }
        }
      });

      const aiSteps = result.steps.map((step, idx) => ({
        id: `step-${Date.now()}-${idx}`,
        ...step,
        order: idx + 1
      }));

      setWorkflow({ ...workflow, steps: aiSteps });
      toast.success(`Generated ${aiSteps.length} workflow steps`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate workflow");
    } finally {
      setLoadingAI(false);
    }
  };

  const addManualStep = () => {
    const newStep = {
      id: `step-${Date.now()}`,
      step_name: "New Step",
      description: "",
      action_type: "task_assignment",
      assigned_role: "risk_manager",
      estimated_time_hours: 24,
      requires_approval: false,
      send_notification: true,
      order: workflow.steps.length + 1
    };
    setWorkflow({ ...workflow, steps: [...workflow.steps, newStep] });
  };

  const updateStep = (id, updates) => {
    setWorkflow({
      ...workflow,
      steps: workflow.steps.map(s => s.id === id ? { ...s, ...updates } : s)
    });
  };

  const removeStep = (id) => {
    setWorkflow({
      ...workflow,
      steps: workflow.steps.filter(s => s.id !== id).map((s, idx) => ({ ...s, order: idx + 1 }))
    });
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(workflow.steps);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    const reorderedSteps = items.map((s, idx) => ({ ...s, order: idx + 1 }));
    setWorkflow({ ...workflow, steps: reorderedSteps });
  };

  const saveWorkflow = () => {
    if (!workflow.name || workflow.steps.length === 0) {
      toast.error("Please provide workflow name and at least one step");
      return;
    }

    const workflowData = {
      name: workflow.name,
      description: workflow.description,
      trigger_type: workflow.trigger_type,
      trigger_config: { process_type: workflow.process_type },
      actions: workflow.steps.map(step => ({
        type: step.action_type,
        config: {
          name: step.step_name,
          description: step.description,
          assigned_role: step.assigned_role,
          estimated_time_hours: step.estimated_time_hours,
          requires_approval: step.requires_approval,
          send_notification: step.send_notification,
          conditional_logic: step.conditional_logic,
          order: step.order
        }
      })),
      status: "active"
    };

    saveWorkflowMutation.mutate(workflowData);
  };

  const actionTypeColors = {
    task_assignment: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    approval: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    notification: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    data_collection: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    review: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    decision: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    escalation: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    documentation: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Configuration Panel */}
      <Card className="bg-[#1a2332] border-[#2a3548] lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base">Workflow Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm text-slate-400 mb-2">Workflow Name</Label>
            <Input
              value={workflow.name}
              onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
              placeholder="e.g., Incident Response Process"
              className="bg-[#151d2e] border-[#2a3548] text-white"
            />
          </div>

          <div>
            <Label className="text-sm text-slate-400 mb-2">Description</Label>
            <Textarea
              value={workflow.description}
              onChange={(e) => setWorkflow({ ...workflow, description: e.target.value })}
              placeholder="Describe the workflow purpose..."
              className="bg-[#151d2e] border-[#2a3548] text-white min-h-[80px]"
            />
          </div>

          <div>
            <Label className="text-sm text-slate-400 mb-2">Process Type</Label>
            <Select value={workflow.process_type} onValueChange={(val) => setWorkflow({ ...workflow, process_type: val })}>
              <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                {processTypes.map(type => (
                  <SelectItem key={type.value} value={type.value} className="text-white">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm text-slate-400 mb-2">Trigger Type</Label>
            <Select value={workflow.trigger_type} onValueChange={(val) => setWorkflow({ ...workflow, trigger_type: val })}>
              <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                {triggerTypes.map(type => (
                  <SelectItem key={type.value} value={type.value} className="text-white">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 border-t border-[#2a3548] space-y-2">
            <Button 
              onClick={generateAISteps}
              disabled={loadingAI}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {loadingAI ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" /> AI Generate Steps</>
              )}
            </Button>
            <Button 
              onClick={addManualStep}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Manual Step
            </Button>
            <Button 
              onClick={saveWorkflow}
              disabled={saveWorkflowMutation.isPending}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Workflow
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Builder */}
      <Card className="bg-[#1a2332] border-[#2a3548] lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-indigo-400" />
              Workflow Steps
            </CardTitle>
            <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
              {workflow.steps.length} steps
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {workflow.steps.length === 0 ? (
            <div className="text-center py-12">
              <GitBranch className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-2">No workflow steps yet</p>
              <p className="text-sm text-slate-500">Use AI to generate steps or add them manually</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="steps">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {workflow.steps.map((step, index) => (
                      <Draggable key={step.id} draggableId={step.id} index={index}>
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="bg-[#151d2e] border-[#2a3548]"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div {...provided.dragHandleProps} className="mt-1">
                                  <GripVertical className="h-5 w-5 text-slate-600 cursor-move" />
                                </div>
                                
                                <div className="flex-1 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <Badge className="bg-slate-700 text-white text-xs">
                                      Step {step.order}
                                    </Badge>
                                    <div className="flex items-center gap-2">
                                      <Badge className={actionTypeColors[step.action_type] || "bg-slate-500/20"}>
                                        {step.action_type?.replace(/_/g, ' ')}
                                      </Badge>
                                      <Button
                                        onClick={() => removeStep(step.id)}
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 text-rose-400 hover:text-rose-300"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  <Input
                                    value={step.step_name}
                                    onChange={(e) => updateStep(step.id, { step_name: e.target.value })}
                                    placeholder="Step name"
                                    className="bg-[#0f1623] border-[#2a3548] text-white font-semibold"
                                  />

                                  <Textarea
                                    value={step.description}
                                    onChange={(e) => updateStep(step.id, { description: e.target.value })}
                                    placeholder="Step description"
                                    className="bg-[#0f1623] border-[#2a3548] text-white text-sm"
                                    rows={2}
                                  />

                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <Label className="text-xs text-slate-400 mb-1">Assigned Role</Label>
                                      <Select
                                        value={step.assigned_role}
                                        onValueChange={(val) => updateStep(step.id, { assigned_role: val })}
                                      >
                                        <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white text-sm h-8">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                                          <SelectItem value="risk_manager">Risk Manager</SelectItem>
                                          <SelectItem value="compliance_officer">Compliance Officer</SelectItem>
                                          <SelectItem value="auditor">Auditor</SelectItem>
                                          <SelectItem value="control_owner">Control Owner</SelectItem>
                                          <SelectItem value="incident_responder">Incident Responder</SelectItem>
                                          <SelectItem value="security_analyst">Security Analyst</SelectItem>
                                          <SelectItem value="executive">Executive</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div>
                                      <Label className="text-xs text-slate-400 mb-1">Time (hours)</Label>
                                      <Input
                                        type="number"
                                        value={step.estimated_time_hours}
                                        onChange={(e) => updateStep(step.id, { estimated_time_hours: parseInt(e.target.value) })}
                                        className="bg-[#0f1623] border-[#2a3548] text-white text-sm h-8"
                                      />
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-4 text-sm">
                                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={step.requires_approval}
                                        onChange={(e) => updateStep(step.id, { requires_approval: e.target.checked })}
                                        className="rounded"
                                      />
                                      <CheckCircle2 className="h-4 w-4" />
                                      Requires Approval
                                    </label>
                                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={step.send_notification}
                                        onChange={(e) => updateStep(step.id, { send_notification: e.target.checked })}
                                        className="rounded"
                                      />
                                      <Bell className="h-4 w-4" />
                                      Send Notification
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </CardContent>
      </Card>
    </div>
  );
}