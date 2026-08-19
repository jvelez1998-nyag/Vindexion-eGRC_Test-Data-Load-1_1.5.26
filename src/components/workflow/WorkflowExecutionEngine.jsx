import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, CheckCircle2, Clock, AlertCircle, 
  User, Bell, ArrowRight, Loader2
} from "lucide-react";
import { toast } from "sonner";

export default function WorkflowExecutionEngine({ entityType, entityId }) {
  const [activeWorkflows, setActiveWorkflows] = useState([]);
  const queryClient = useQueryClient();

  const { data: workflows = [] } = useQuery({
    queryKey: ['workflows', entityType],
    queryFn: async () => {
      const rules = await base44.entities.AutomationRule.filter({ status: 'active' });
      return rules.filter(r => 
        r.trigger_config?.process_type && 
        (r.trigger_type === 'manual' || r.trigger_type === 'entity_created')
      );
    }
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['workflow-tasks', entityId],
    queryFn: () => base44.entities.AutomationTask.filter({ entity_id: entityId }),
    enabled: !!entityId
  });

  const executeWorkflowMutation = useMutation({
    mutationFn: async ({ workflowId, entityId }) => {
      const workflow = workflows.find(w => w.id === workflowId);
      if (!workflow) throw new Error("Workflow not found");

      // Create tasks for each workflow step
      const taskPromises = workflow.actions.map(async (action, idx) => {
        const dueDate = new Date();
        dueDate.setHours(dueDate.getHours() + (action.config?.estimated_time_hours || 24));

        return base44.entities.AutomationTask.create({
          workflow_id: workflowId,
          entity_type: entityType,
          entity_id: entityId,
          step_order: action.config?.order || idx + 1,
          task_name: action.config?.name,
          description: action.config?.description,
          action_type: action.type,
          assigned_role: action.config?.assigned_role,
          requires_approval: action.config?.requires_approval || false,
          status: idx === 0 ? 'pending' : 'waiting',
          due_date: dueDate.toISOString(),
          created_date: new Date().toISOString()
        });
      });

      await Promise.all(taskPromises);

      // Send notification for first task
      const firstAction = workflow.actions[0];
      if (firstAction?.config?.send_notification) {
        await base44.integrations.Core.SendEmail({
          to: `${firstAction.config.assigned_role}@example.com`,
          subject: `New Task: ${firstAction.config.name}`,
          body: `A new workflow task has been assigned to you.\n\nWorkflow: ${workflow.name}\nTask: ${firstAction.config.name}\n\nPlease complete this task within ${firstAction.config.estimated_time_hours} hours.`
        });
      }

      return workflow;
    },
    onSuccess: (workflow) => {
      queryClient.invalidateQueries({ queryKey: ['workflow-tasks'] });
      toast.success(`Workflow "${workflow.name}" started`);
    }
  });

  const completeTaskMutation = useMutation({
    mutationFn: async (taskId) => {
      const task = tasks.find(t => t.id === taskId);
      await base44.entities.AutomationTask.update(taskId, { 
        status: 'completed',
        completed_date: new Date().toISOString()
      });

      // Activate next task in sequence
      const nextTask = tasks.find(t => 
        t.workflow_id === task.workflow_id && 
        t.step_order === task.step_order + 1 &&
        t.status === 'waiting'
      );

      if (nextTask) {
        await base44.entities.AutomationTask.update(nextTask.id, { status: 'pending' });
        
        // Send notification
        await base44.integrations.Core.SendEmail({
          to: `${nextTask.assigned_role}@example.com`,
          subject: `New Task: ${nextTask.task_name}`,
          body: `A workflow task has been assigned to you.\n\nTask: ${nextTask.task_name}\nDescription: ${nextTask.description}\n\nDue: ${new Date(nextTask.due_date).toLocaleDateString()}`
        });
      }

      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-tasks'] });
      toast.success("Task completed");
    }
  });

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'overdue': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'waiting': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const groupedTasks = tasks.reduce((acc, task) => {
    const workflowId = task.workflow_id;
    if (!acc[workflowId]) acc[workflowId] = [];
    acc[workflowId].push(task);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Available Workflows */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base">Start Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {workflows.map(workflow => (
              <Card key={workflow.id} className="bg-[#151d2e] border-[#2a3548] p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white mb-1">{workflow.name}</h4>
                    <p className="text-xs text-slate-400">{workflow.description}</p>
                  </div>
                  <Button
                    onClick={() => executeWorkflowMutation.mutate({ workflowId: workflow.id, entityId })}
                    disabled={executeWorkflowMutation.isPending}
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 h-8"
                  >
                    <Play className="h-3 w-3" />
                  </Button>
                </div>
                <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-xs">
                  {workflow.actions?.length || 0} steps
                </Badge>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Workflows */}
      {Object.keys(groupedTasks).map(workflowId => {
        const workflowTasks = groupedTasks[workflowId].sort((a, b) => a.step_order - b.step_order);
        const workflow = workflows.find(w => w.id === workflowId);
        const completedTasks = workflowTasks.filter(t => t.status === 'completed').length;
        const progress = (completedTasks / workflowTasks.length) * 100;

        return (
          <Card key={workflowId} className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{workflow?.name || 'Workflow'}</CardTitle>
                  <p className="text-xs text-slate-400 mt-1">
                    {completedTasks} of {workflowTasks.length} steps completed
                  </p>
                </div>
                <Badge className={progress === 100 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}>
                  {progress.toFixed(0)}% Complete
                </Badge>
              </div>
              <Progress value={progress} className="h-2 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workflowTasks.map((task, idx) => {
                  const isOverdue = new Date(task.due_date) < new Date() && task.status !== 'completed';
                  const displayStatus = isOverdue ? 'overdue' : task.status;

                  return (
                    <Card key={task.id} className="bg-[#151d2e] border-[#2a3548] p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {task.status === 'completed' ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                          ) : task.status === 'pending' ? (
                            <Clock className="h-5 w-5 text-amber-400" />
                          ) : isOverdue ? (
                            <AlertCircle className="h-5 w-5 text-rose-400" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-slate-600" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="text-sm font-semibold text-white mb-1">
                                Step {task.step_order}: {task.task_name}
                              </h4>
                              <p className="text-xs text-slate-400">{task.description}</p>
                            </div>
                            <Badge className={getTaskStatusColor(displayStatus)}>
                              {displayStatus}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-slate-400 mb-2">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {task.assigned_role?.replace(/_/g, ' ')}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Due: {new Date(task.due_date).toLocaleDateString()}
                            </div>
                            {task.requires_approval && (
                              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                                Requires Approval
                              </Badge>
                            )}
                          </div>

                          {task.status === 'pending' && (
                            <Button
                              onClick={() => completeTaskMutation.mutate(task.id)}
                              disabled={completeTaskMutation.isPending}
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 h-7 text-xs"
                            >
                              {completeTaskMutation.isPending ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                              )}
                              Mark Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}