import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, Clock, TrendingUp, CheckCircle2, Mail } from "lucide-react";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";

export default function RemediationProgressMonitor() {
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ['remediation-tasks'],
    queryFn: () => base44.entities.RemediationTask.list()
  });

  const sendReminderMutation = useMutation({
    mutationFn: async ({ task }) => {
      await base44.integrations.Core.SendEmail({
        to: task.owner,
        subject: `Remediation Task Reminder: ${task.title}`,
        body: `
          <h2>Remediation Task Reminder</h2>
          <p>This is a reminder about your assigned remediation task:</p>
          <h3>${task.title}</h3>
          <p><strong>Priority:</strong> ${task.priority}</p>
          <p><strong>Due Date:</strong> ${task.due_date ? format(new Date(task.due_date), 'PPP') : 'Not set'}</p>
          <p><strong>Current Status:</strong> ${task.status}</p>
          <p><strong>Progress:</strong> ${task.progress_percentage}%</p>
          ${task.description ? `<p><strong>Description:</strong> ${task.description}</p>` : ''}
          <p>Please update the task status in the GRC platform.</p>
        `
      });
      
      await base44.entities.RemediationTask.update(task.id, {
        reminder_sent: true,
        last_reminder_date: new Date().toISOString().split('T')[0]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remediation-tasks'] });
      toast.success("Reminder sent");
    }
  });

  // Categorize tasks
  const overdueTasks = tasks.filter(t => {
    if (!t.due_date || t.status === 'completed') return false;
    return differenceInDays(new Date(t.due_date), new Date()) < 0;
  });

  const dueSoonTasks = tasks.filter(t => {
    if (!t.due_date || t.status === 'completed') return false;
    const days = differenceInDays(new Date(t.due_date), new Date());
    return days >= 0 && days <= 7;
  });

  const blockedTasks = tasks.filter(t => t.status === 'blocked');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const avgProgress = tasks.length 
    ? Math.round(tasks.reduce((sum, t) => sum + (t.progress_percentage || 0), 0) / tasks.length)
    : 0;

  const completionRate = tasks.length
    ? Math.round((completedTasks.length / tasks.length) * 100)
    : 0;

  // Auto-send reminders for overdue tasks
  useEffect(() => {
    const autoRemind = async () => {
      for (const task of overdueTasks) {
        if (!task.reminder_sent && task.owner) {
          const lastReminder = task.last_reminder_date ? new Date(task.last_reminder_date) : null;
          const daysSinceReminder = lastReminder ? differenceInDays(new Date(), lastReminder) : 999;
          
          // Send reminder if no reminder sent or last reminder was 7+ days ago
          if (daysSinceReminder >= 7) {
            await sendReminderMutation.mutateAsync({ task });
          }
        }
      }
    };

    if (overdueTasks.length > 0) {
      autoRemind();
    }
  }, [overdueTasks.length]);

  const statusColors = {
    not_started: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    under_review: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blocked: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  };

  return (
    <div className="space-y-4">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Completion Rate</span>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">{completionRate}%</p>
            <p className="text-xs text-slate-500 mt-1">{completedTasks.length} of {tasks.length} completed</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Avg Progress</span>
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">{avgProgress}%</p>
            <p className="text-xs text-slate-500 mt-1">{inProgressTasks.length} in progress</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-rose-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Overdue</span>
              <AlertTriangle className="h-4 w-4 text-rose-400" />
            </div>
            <p className="text-2xl font-bold text-rose-400">{overdueTasks.length}</p>
            <p className="text-xs text-slate-500 mt-1">Require attention</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Due Soon</span>
              <Clock className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-400">{dueSoonTasks.length}</p>
            <p className="text-xs text-slate-500 mt-1">Within 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Bell className="h-5 w-5 text-amber-400" />
            Alerts & Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {overdueTasks.length === 0 && dueSoonTasks.length === 0 && blockedTasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">All tasks are on track!</p>
                </div>
              ) : (
                <>
                  {overdueTasks.map(task => (
                    <div key={task.id} className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-white mb-1">{task.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className="text-[9px] bg-rose-500/20 text-rose-400 border-rose-500/30">
                              Overdue by {Math.abs(differenceInDays(new Date(task.due_date), new Date()))} days
                            </Badge>
                            <Badge className={`text-[9px] ${statusColors[task.status]}`}>
                              {task.status?.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                        </div>
                        {task.owner && (
                          <Button
                            onClick={() => sendReminderMutation.mutate({ task })}
                            disabled={sendReminderMutation.isPending}
                            size="sm"
                            variant="outline"
                            className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                          >
                            <Mail className="h-3 w-3 mr-1" />
                            Remind
                          </Button>
                        )}
                      </div>
                      {task.owner && <p className="text-xs text-slate-400">Assigned to: {task.owner}</p>}
                    </div>
                  ))}

                  {dueSoonTasks.map(task => (
                    <div key={task.id} className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-white mb-1">{task.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className="text-[9px] bg-amber-500/20 text-amber-400 border-amber-500/30">
                              Due in {differenceInDays(new Date(task.due_date), new Date())} days
                            </Badge>
                            <Badge className={`text-[9px] ${statusColors[task.status]}`}>
                              {task.status?.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {task.owner && <p className="text-xs text-slate-400">Assigned to: {task.owner}</p>}
                      <Progress value={task.progress_percentage || 0} className="h-1.5 mt-2" />
                    </div>
                  ))}

                  {blockedTasks.map(task => (
                    <div key={task.id} className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-white mb-1">{task.title}</h4>
                        <Badge className="text-[9px] bg-rose-500/20 text-rose-400 border-rose-500/30">
                          Blocked
                        </Badge>
                      </div>
                      {task.blockers?.length > 0 && (
                        <p className="text-xs text-slate-400 mt-2">Blockers: {task.blockers.join(', ')}</p>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}