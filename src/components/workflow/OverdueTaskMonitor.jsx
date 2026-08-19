import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, User, Bell } from "lucide-react";

export default function OverdueTaskMonitor() {
  const { data: tasks = [] } = useQuery({
    queryKey: ['all-workflow-tasks'],
    queryFn: () => base44.entities.AutomationTask.list('-created_date', 100),
    refetchInterval: 60000 // Check every minute
  });

  const overdueTasks = tasks.filter(task => {
    if (task.status === 'completed') return false;
    return new Date(task.due_date) < new Date();
  });

  useEffect(() => {
    // Send notifications for overdue tasks
    const sendOverdueNotifications = async () => {
      for (const task of overdueTasks) {
        // Check if notification was already sent today
        const lastNotification = task.last_notification_date;
        const today = new Date().toDateString();
        
        if (!lastNotification || new Date(lastNotification).toDateString() !== today) {
          try {
            await base44.integrations.Core.SendEmail({
              to: `${task.assigned_role}@example.com`,
              subject: `⚠️ Overdue Task: ${task.task_name}`,
              body: `URGENT: The following task is overdue and requires immediate attention.\n\nTask: ${task.task_name}\nDescription: ${task.description}\nDue Date: ${new Date(task.due_date).toLocaleString()}\nDays Overdue: ${Math.floor((new Date() - new Date(task.due_date)) / (1000 * 60 * 60 * 24))}\n\nPlease complete this task as soon as possible.`
            });

            // Update last notification date
            await base44.entities.AutomationTask.update(task.id, {
              last_notification_date: new Date().toISOString()
            });
          } catch (error) {
            console.error('Failed to send overdue notification:', error);
          }
        }
      }
    };

    if (overdueTasks.length > 0) {
      sendOverdueNotifications();
    }
  }, [overdueTasks]);

  if (overdueTasks.length === 0) return null;

  return (
    <Card className="bg-gradient-to-r from-rose-500/10 to-orange-500/10 border-rose-500/30">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-rose-400" />
          Overdue Tasks ({overdueTasks.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {overdueTasks.slice(0, 5).map(task => {
            const daysOverdue = Math.floor((new Date() - new Date(task.due_date)) / (1000 * 60 * 60 * 24));
            
            return (
              <Card key={task.id} className="bg-[#151d2e] border-rose-500/30 p-3">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-semibold text-white">{task.task_name}</h4>
                  <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-xs">
                    {daysOverdue}d overdue
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mb-2">{task.description}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {task.assigned_role?.replace(/_/g, ' ')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Bell className="h-3 w-3" />
                    Notification sent
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}