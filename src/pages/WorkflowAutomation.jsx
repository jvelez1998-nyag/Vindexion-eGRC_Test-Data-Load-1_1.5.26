import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, 
  Plus, 
  Settings, 
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Activity,
  GitBranch,
  Calendar,
  BarChart3,
  Copy,
  Trash2,
  Play,
  Pause
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import WorkflowBuilder from "@/components/workflow/WorkflowBuilder";
import WorkflowAnalytics from "@/components/workflow/WorkflowAnalytics";
import TaskManagement from "@/components/workflow/TaskManagement";
import ScheduledWorkflows from "@/components/workflow/ScheduledWorkflows";
import AIWorkflowBuilder from "@/components/workflow/AIWorkflowBuilder";
import OverdueTaskMonitor from "@/components/workflow/OverdueTaskMonitor";

export default function WorkflowAutomation() {
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const queryClient = useQueryClient();

  const { data: rules = [] } = useQuery({
    queryKey: ['automation-rules'],
    queryFn: () => base44.entities.AutomationRule.list()
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['automation-tasks'],
    queryFn: () => base44.entities.AutomationTask.list('-created_date')
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const createRuleMutation = useMutation({
    mutationFn: (data) => base44.entities.AutomationRule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      setRuleFormOpen(false);
      setEditingRule(null);
      toast.success("Automation rule created");
    }
  });

  const updateRuleMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AutomationRule.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      setRuleFormOpen(false);
      setEditingRule(null);
      toast.success("Rule updated");
    }
  });

  const toggleRuleMutation = useMutation({
    mutationFn: ({ id, enabled }) => base44.entities.AutomationRule.update(id, { is_enabled: enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast.success("Rule status updated");
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AutomationTask.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-tasks'] });
      toast.success("Task updated");
    }
  });

  const handleRuleSubmit = (data) => {
    if (editingRule) {
      updateRuleMutation.mutate({ id: editingRule.id, data });
    } else {
      createRuleMutation.mutate(data);
    }
  };

  const duplicateRuleMutation = useMutation({
    mutationFn: async (rule) => {
      const { id, created_date, updated_date, created_by, execution_count, last_executed, ...data } = rule;
      return base44.entities.AutomationRule.create({ ...data, name: `${data.name} (Copy)`, is_enabled: false });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast.success("Rule duplicated");
    }
  });

  const deleteRuleMutation = useMutation({
    mutationFn: (id) => base44.entities.AutomationRule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast.success("Rule deleted");
    }
  });

  const testRuleMutation = useMutation({
    mutationFn: async (ruleId) => {
      const rule = rules.find(r => r.id === ruleId);
      if (window.executeAutomation) {
        await window.executeAutomation(ruleId, { test: true, title: 'Test Trigger' }, 'manual_test');
      }
    },
    onSuccess: () => {
      toast.success("Test automation triggered");
    }
  });

  const activeRules = rules.filter(r => r.is_enabled).length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="min-h-screen bg-[#0f1623] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 border border-purple-500/20">
              <Zap className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Workflow Automation</h1>
              <p className="text-slate-400 text-sm">Intelligent automation based on AI insights</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <GitBranch className="h-4 w-4 mr-2" />
              {viewMode === 'grid' ? 'List View' : 'Grid View'}
            </Button>
            <Button onClick={() => { setEditingRule(null); setBuilderOpen(true); }} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Zap className="h-4 w-4 text-purple-400" />
                <div className="text-2xl font-bold text-white">{activeRules}</div>
              </div>
              <div className="text-xs text-slate-400">Active Rules</div>
              <div className="text-xs text-purple-400 mt-1">{rules.length} total</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-4 w-4 text-amber-400" />
                <div className="text-2xl font-bold text-white">{pendingTasks}</div>
              </div>
              <div className="text-xs text-slate-400">Pending Tasks</div>
              <div className="text-xs text-amber-400 mt-1">Awaiting action</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <div className="text-2xl font-bold text-white">{completedTasks}</div>
              </div>
              <div className="text-xs text-slate-400">Completed</div>
              <div className="text-xs text-emerald-400 mt-1">
                {tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}% completion
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                <div className="text-2xl font-bold text-white">{tasks.length}</div>
              </div>
              <div className="text-xs text-slate-400">Total Tasks</div>
              <div className="text-xs text-blue-400 mt-1">Auto-generated</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="rules" className="space-y-6">
          <TabsList className="bg-[#1a2332] border border-[#2a3548]">
            <TabsTrigger value="rules">
              <Zap className="h-4 w-4 mr-2" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="scheduled">
              <Calendar className="h-4 w-4 mr-2" />
              Scheduled
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-4">
            {rules.length === 0 ? (
              <Card className="bg-[#1a2332] border-[#2a3548]">
                <CardContent className="p-12 text-center">
                  <Zap className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No workflows yet</h3>
                  <p className="text-slate-400 mb-4">Build intelligent workflows with visual designer and AI triggers</p>
                  <Button onClick={() => setBuilderOpen(true)} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Build First Workflow
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === 'grid' ? "grid lg:grid-cols-2 gap-4" : "space-y-3"}>
                {rules.map(rule => (
                  <Card key={rule.id} className="bg-[#1a2332] border-[#2a3548] hover:border-purple-500/40 transition-all group">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-white">{rule.name}</h3>
                            <Badge className={`${rule.is_enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'} border-0`}>
                              {rule.is_enabled ? <Activity className="h-3 w-3 mr-1" /> : <Pause className="h-3 w-3 mr-1" />}
                              {rule.is_enabled ? 'Active' : 'Paused'}
                            </Badge>
                            <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">
                              {rule.trigger_type.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-400 mb-3">{rule.description}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              {rule.action_type.replace(/_/g, ' ')}
                            </span>
                            <span className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {rule.priority_level}
                            </span>
                            <span className="flex items-center gap-1">
                              <Activity className="h-3 w-3" />
                              {rule.execution_count || 0}x
                            </span>
                            {rule.last_executed && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(rule.last_executed), 'MMM d')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Switch
                            checked={rule.is_enabled}
                            onCheckedChange={(checked) => toggleRuleMutation.mutate({ id: rule.id, enabled: checked })}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-3 border-t border-[#2a3548] opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setEditingRule(rule); setBuilderOpen(true); }}
                          className="text-slate-400 hover:text-white h-7 text-xs"
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => testRuleMutation.mutate(rule.id)}
                          className="text-slate-400 hover:text-emerald-400 h-7 text-xs"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Test
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicateRuleMutation.mutate(rule)}
                          className="text-slate-400 hover:text-blue-400 h-7 text-xs"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Duplicate
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteRuleMutation.mutate(rule.id)}
                          className="text-slate-400 hover:text-rose-400 h-7 text-xs"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tasks">
            <TaskManagement tasks={tasks} onUpdateTask={(id, data) => updateTaskMutation.mutate({ id, data })} />
          </TabsContent>

          <TabsContent value="scheduled">
            <ScheduledWorkflows rules={rules} onToggleRule={(id, enabled) => toggleRuleMutation.mutate({ id, enabled })} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <OverdueTaskMonitor />
            <WorkflowAnalytics rules={rules} tasks={tasks} />
          </TabsContent>
        </Tabs>

        {/* Workflow Builder */}
        {builderOpen && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-[#0f1623] rounded-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-[#0f1623] border-b border-[#2a3548] p-4 flex items-center justify-between z-10">
                <h2 className="text-xl font-bold text-white">AI Workflow Builder</h2>
                <Button onClick={() => setBuilderOpen(false)} variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-6">
                <AIWorkflowBuilder onSave={() => setBuilderOpen(false)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}