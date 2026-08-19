import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, CheckCircle2, User, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function AITaskAssignmentEngine({ vendor, users = [] }) {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const suggestNextSteps = async () => {
    setLoading(true);
    try {
      const prompt = `Analyze vendor status and suggest next steps with task assignments:

**VENDOR:** ${vendor.name}
**STATUS:** ${vendor.status}
**RISK SCORE:** ${vendor.ai_risk_score || 'Not assessed'}
**COMPLIANCE SCORE:** ${vendor.compliance_score || 'Not assessed'}
**TIER:** ${vendor.tier}
**SERVICES:** ${vendor.services_provided}
**DATA ACCESS:** ${vendor.data_access_level}
**LAST REVIEW:** ${vendor.last_review_date || 'Never'}

Based on vendor status and risk profile, suggest 5-8 next steps including:
1. Immediate actions (next 7 days)
2. Short-term actions (1-4 weeks)
3. Medium-term actions (1-3 months)

For each task, specify:
- Task name and description
- Recommended assignee role (Security Team, Compliance Officer, Risk Manager, Procurement, Legal, etc.)
- Priority level
- Estimated effort (hours)
- Dependencies
- Success criteria`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            recommended_path: { type: "string" },
            next_steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  task_name: { type: "string" },
                  description: { type: "string" },
                  assignee_role: { type: "string" },
                  priority: { type: "string" },
                  timeframe: { type: "string" },
                  estimated_hours: { type: "number" },
                  dependencies: {
                    type: "array",
                    items: { type: "string" }
                  },
                  success_criteria: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            }
          }
        }
      });

      setSuggestions(result);
      toast.success("Next steps generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate suggestions");
    } finally {
      setLoading(false);
    }
  };

  const createTaskMutation = useMutation({
    mutationFn: async (task) => {
      const daysMap = {
        'immediate': 7,
        '1-2 weeks': 14,
        '2-4 weeks': 28,
        '1-3 months': 90
      };
      const days = daysMap[task.timeframe] || 14;

      return base44.entities.VendorOnboardingTask.create({
        vendor_id: vendor.id,
        task_name: task.task_name,
        description: task.description,
        task_type: 'general',
        priority: task.priority,
        status: 'pending',
        assigned_role: task.assignee_role,
        estimated_hours: task.estimated_hours,
        due_date: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-onboarding-tasks'] });
      toast.success("Task created");
    }
  });

  const createAllTasksMutation = useMutation({
    mutationFn: async () => {
      const tasks = suggestions.next_steps.map(task => {
        const daysMap = {
          'immediate': 7,
          '1-2 weeks': 14,
          '2-4 weeks': 28,
          '1-3 months': 90
        };
        const days = daysMap[task.timeframe] || 14;

        return {
          vendor_id: vendor.id,
          task_name: task.task_name,
          description: task.description,
          task_type: 'general',
          priority: task.priority,
          status: 'pending',
          assigned_role: task.assignee_role,
          estimated_hours: task.estimated_hours,
          due_date: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
        };
      });

      return base44.entities.VendorOnboardingTask.bulkCreate(tasks);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-onboarding-tasks'] });
      toast.success("All tasks created");
      setSuggestions(null);
    }
  });

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'critical': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-400" />
            AI Task Assignment Engine
          </CardTitle>
          <Button
            onClick={suggestNextSteps}
            disabled={loading}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
            ) : (
              <><Brain className="h-4 w-4 mr-2" /> Suggest Next Steps</>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!suggestions ? (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">AI will analyze vendor and suggest intelligent next steps</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30 p-4">
              <h4 className="text-sm font-semibold text-white mb-2">AI Analysis</h4>
              <p className="text-sm text-slate-300 mb-3">{suggestions.summary}</p>
              <div className="p-3 bg-[#151d2e] rounded border border-indigo-500/30">
                <p className="text-xs text-slate-400 mb-1">Recommended Path:</p>
                <p className="text-sm text-white">{suggestions.recommended_path}</p>
              </div>
            </Card>

            {/* Action Header */}
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">Suggested Tasks</h4>
              <Button
                onClick={() => createAllTasksMutation.mutate()}
                disabled={createAllTasksMutation.isPending}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Create All Tasks
              </Button>
            </div>

            {/* Tasks */}
            <div className="space-y-2">
              {suggestions.next_steps?.map((task, idx) => (
                <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h5 className="text-sm font-semibold text-white mb-1">{task.task_name}</h5>
                      <p className="text-sm text-slate-300 mb-2">{task.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">
                          <User className="h-3 w-3 mr-1" />
                          {task.assignee_role}
                        </Badge>
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          <Calendar className="h-3 w-3 mr-1" />
                          {task.timeframe}
                        </Badge>
                        <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">
                          {task.estimated_hours}h
                        </Badge>
                      </div>

                      {task.dependencies?.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs text-slate-500 mb-1">Dependencies:</p>
                          <div className="space-y-0.5">
                            {task.dependencies.map((dep, i) => (
                              <div key={i} className="text-xs text-slate-400">• {dep}</div>
                            ))}
                          </div>
                        </div>
                      )}

                      {task.success_criteria?.length > 0 && (
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Success Criteria:</p>
                          <div className="space-y-0.5">
                            {task.success_criteria.map((criteria, i) => (
                              <div key={i} className="text-xs text-emerald-400 flex items-start gap-1">
                                <CheckCircle2 className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                <span>{criteria}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => createTaskMutation.mutate(task)}
                    disabled={createTaskMutation.isPending}
                    size="sm"
                    variant="outline"
                    className="w-full border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
                  >
                    Create Task
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}