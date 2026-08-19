import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Brain, Loader2, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function AIOnboardingChecklistGenerator({ vendorType, criticality, dataAccessLevel, onChecklistGenerated }) {
  const [generating, setGenerating] = useState(false);
  const [checklist, setChecklist] = useState(null);
  const [completedItems, setCompletedItems] = useState([]);

  const generateChecklist = async () => {
    setGenerating(true);
    
    try {
      const prompt = `You are an AI vendor onboarding specialist. Generate a comprehensive, tailored onboarding checklist for this vendor profile:

Vendor Type: ${vendorType}
Criticality Level: ${criticality}
Data Access Level: ${dataAccessLevel}

Generate a structured onboarding checklist with:
1. Tasks organized by onboarding phase
2. Priority and due date recommendations
3. Task dependencies
4. Required documentation
5. Approval requirements

Provide a JSON response:
{
  "checklist_title": "<descriptive title>",
  "estimated_duration_days": <number>,
  "phases": [
    {
      "phase_name": "<phase name>",
      "phase_description": "<description>",
      "duration_days": <number>,
      "tasks": [
        {
          "task_id": "<unique_id>",
          "task_title": "<task title>",
          "description": "<detailed description>",
          "task_type": "<assessment|documentation|verification|compliance_check>",
          "priority": "<critical|high|medium|low>",
          "estimated_hours": <number>,
          "assigned_role": "<who should complete this>",
          "dependencies": ["<task_id>"],
          "required_documents": [
            "<document name>"
          ],
          "approval_required": <boolean>,
          "approval_role": "<who approves>",
          "completion_criteria": "<what defines completion>"
        }
      ]
    }
  ],
  "critical_milestones": [
    {
      "milestone": "<milestone name>",
      "day": <number>,
      "description": "<description>"
    }
  ],
  "risk_considerations": [
    "<consideration>"
  ],
  "success_criteria": [
    "<criterion>"
  ]
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            checklist_title: { type: "string" },
            estimated_duration_days: { type: "number" },
            phases: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  phase_name: { type: "string" },
                  phase_description: { type: "string" },
                  duration_days: { type: "number" },
                  tasks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        task_id: { type: "string" },
                        task_title: { type: "string" },
                        description: { type: "string" },
                        task_type: { type: "string" },
                        priority: { type: "string" },
                        estimated_hours: { type: "number" },
                        assigned_role: { type: "string" },
                        dependencies: { type: "array", items: { type: "string" } },
                        required_documents: { type: "array", items: { type: "string" } },
                        approval_required: { type: "boolean" },
                        approval_role: { type: "string" },
                        completion_criteria: { type: "string" }
                      }
                    }
                  }
                }
              }
            },
            critical_milestones: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  milestone: { type: "string" },
                  day: { type: "number" },
                  description: { type: "string" }
                }
              }
            },
            risk_considerations: { type: "array", items: { type: "string" } },
            success_criteria: { type: "array", items: { type: "string" } }
          }
        }
      });

      setChecklist(response);
      onChecklistGenerated?.(response);
      toast.success(`Generated ${response.phases.reduce((sum, p) => sum + p.tasks.length, 0)} onboarding tasks`);
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate checklist");
    } finally {
      setGenerating(false);
    }
  };

  const toggleTask = (taskId) => {
    setCompletedItems(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const getSeverityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-rose-500/20 text-rose-400';
      case 'high': return 'bg-orange-500/20 text-orange-400';
      case 'medium': return 'bg-amber-500/20 text-amber-400';
      case 'low': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const totalTasks = checklist?.phases.reduce((sum, p) => sum + p.tasks.length, 0) || 0;
  const completionPercentage = totalTasks > 0 ? Math.round((completedItems.length / totalTasks) * 100) : 0;

  return (
    <div className="space-y-4">
      {!checklist ? (
        <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
          <CardContent className="p-6 text-center">
            <Brain className="h-12 w-12 text-indigo-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">AI Checklist Generator</h3>
            <p className="text-sm text-slate-400 mb-4">
              Generate a tailored onboarding checklist based on vendor profile
            </p>
            <Button 
              onClick={generateChecklist} 
              disabled={generating}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {generating ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating...</>
              ) : (
                <><Brain className="h-4 w-4 mr-2" /> Generate Checklist</>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Checklist Header */}
          <Card className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-white">{checklist.checklist_title}</h3>
                <Badge className="bg-emerald-500/20 text-emerald-400">
                  {completionPercentage}% Complete
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Estimated Duration: {checklist.estimated_duration_days} days | {completedItems.length} of {totalTasks} tasks completed
              </p>
              <div className="h-2 bg-[#0f1623] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Phases */}
          {checklist.phases.map((phase, phaseIdx) => (
            <Card key={phaseIdx} className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base text-white">
                      Phase {phaseIdx + 1}: {phase.phase_name}
                    </CardTitle>
                    <p className="text-xs text-slate-400 mt-1">{phase.phase_description}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {phase.duration_days} days
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {phase.tasks.map((task) => {
                    const isCompleted = completedItems.includes(task.task_id);
                    const hasDependencies = task.dependencies && task.dependencies.length > 0;
                    const dependenciesMet = !hasDependencies || 
                      task.dependencies.every(dep => completedItems.includes(dep));
                    
                    return (
                      <div 
                        key={task.task_id} 
                        className={`p-3 rounded-lg border transition-all ${
                          isCompleted 
                            ? 'bg-emerald-500/5 border-emerald-500/30' 
                            : !dependenciesMet
                            ? 'bg-slate-500/5 border-slate-500/20 opacity-60'
                            : 'bg-[#0f1623] border-[#2a3548]'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isCompleted}
                            onCheckedChange={() => toggleTask(task.task_id)}
                            disabled={!dependenciesMet}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-1">
                              <p className={`text-sm font-medium ${isCompleted ? 'line-through text-slate-500' : 'text-white'}`}>
                                {task.task_title}
                              </p>
                              <Badge className={getSeverityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-400 mb-2">{task.description}</p>
                            
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <Badge variant="outline" className="text-xs">
                                {task.task_type?.replace(/_/g, ' ')}
                              </Badge>
                              <span className="text-slate-500">•</span>
                              <span className="text-slate-500">{task.assigned_role}</span>
                              <span className="text-slate-500">•</span>
                              <span className="text-slate-500">{task.estimated_hours}h</span>
                              {task.approval_required && (
                                <>
                                  <span className="text-slate-500">•</span>
                                  <Badge variant="outline" className="text-xs text-amber-400">
                                    Approval: {task.approval_role}
                                  </Badge>
                                </>
                              )}
                            </div>

                            {task.required_documents?.length > 0 && (
                              <div className="mt-2 p-2 rounded bg-[#151d2e]">
                                <p className="text-xs font-medium text-slate-300 mb-1">Required Documents:</p>
                                <ul className="space-y-0.5">
                                  {task.required_documents.map((doc, idx) => (
                                    <li key={idx} className="text-xs text-slate-400">• {doc}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Success Criteria */}
          {checklist.success_criteria?.length > 0 && (
            <Card className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-400" />
                  Success Criteria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {checklist.success_criteria.map((criterion, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                      <CheckCircle2 className="h-3 w-3 text-blue-400 mt-0.5 flex-shrink-0" />
                      {criterion}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}