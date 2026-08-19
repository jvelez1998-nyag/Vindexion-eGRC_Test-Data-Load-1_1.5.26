import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardCheck, Upload, MessageSquare, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import VendorTaskDetail from "@/components/vendors/VendorTaskDetail";
import VendorAuditProgress from "@/components/vendors/VendorAuditProgress";

export default function VendorPortal() {
  const [userEmail, setUserEmail] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(user => setUserEmail(user?.email)).catch(() => {});
  }, []);

  const { data: myTasks = [], isLoading } = useQuery({
    queryKey: ['vendor-tasks', userEmail],
    queryFn: () => base44.entities.VendorAuditTask.filter({ 
      assigned_to: userEmail,
      assigned_to_vendor: true 
    }, '-due_date'),
    enabled: !!userEmail
  });

  const { data: audits = [] } = useQuery({
    queryKey: ['vendor-audits', userEmail],
    queryFn: async () => {
      const auditIds = [...new Set(myTasks.map(t => t.vendor_audit_id))];
      if (auditIds.length === 0) return [];
      const auditsData = await Promise.all(
        auditIds.map(id => base44.entities.VendorAudit.filter({ id }))
      );
      return auditsData.flat();
    },
    enabled: myTasks.length > 0
  });

  const taskStatusColors = {
    not_started: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    in_progress: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    pending_review: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    blocked: "bg-rose-500/20 text-rose-400 border-rose-500/30"
  };

  const pendingTasks = myTasks.filter(t => !['completed'].includes(t.status));
  const overdueTasks = pendingTasks.filter(t => t.due_date && new Date(t.due_date) < new Date());

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f1623] p-6 flex items-center justify-center">
        <div className="text-white">Loading portal...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1623] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
            <ClipboardCheck className="h-7 w-7 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Vendor Portal</h1>
            <p className="text-slate-400 text-sm">Manage your audit tasks and submissions</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <ClipboardCheck className="h-8 w-8 text-blue-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{myTasks.length}</p>
                  <p className="text-xs text-slate-400">Total Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-amber-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{pendingTasks.length}</p>
                  <p className="text-xs text-slate-400">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-rose-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{overdueTasks.length}</p>
                  <p className="text-xs text-slate-400">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {myTasks.filter(t => t.status === 'completed').length}
                  </p>
                  <p className="text-xs text-slate-400">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="bg-[#151d2e] border border-[#2a3548]">
            <TabsTrigger value="tasks">My Tasks</TabsTrigger>
            <TabsTrigger value="audits">Audit Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks">
            {myTasks.length === 0 ? (
              <Card className="bg-[#1a2332] border-[#2a3548] p-12 text-center">
                <ClipboardCheck className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No tasks assigned</h3>
                <p className="text-slate-400">You don't have any audit tasks at the moment</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {myTasks.map(task => {
                  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
                  return (
                    <Card 
                      key={task.id}
                      className="bg-[#1a2332] border-[#2a3548] hover:border-[#3a4558] cursor-pointer transition-all"
                      onClick={() => setSelectedTask(task)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white mb-1">{task.task_title}</h3>
                            {task.description && (
                              <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
                            )}
                          </div>
                          <Badge className={taskStatusColors[task.status]}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <Badge className="text-[10px] bg-slate-500/10 text-slate-400">
                            {task.task_type.replace('_', ' ')}
                          </Badge>
                          {task.due_date && (
                            <span className={isOverdue ? 'text-rose-400' : ''}>
                              Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                            </span>
                          )}
                          {isOverdue && <AlertCircle className="h-3 w-3 text-rose-400" />}
                        </div>

                        {task.evidence_urls?.length > 0 && (
                          <div className="mt-3 flex items-center gap-2">
                            <Upload className="h-3 w-3 text-emerald-400" />
                            <span className="text-xs text-emerald-400">
                              {task.evidence_urls.length} file(s) uploaded
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="audits">
            {audits.length === 0 ? (
              <Card className="bg-[#1a2332] border-[#2a3548] p-12 text-center">
                <ClipboardCheck className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No active audits</h3>
                <p className="text-slate-400">You're not part of any active audits</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {audits.map(audit => (
                  <VendorAuditProgress 
                    key={audit.id} 
                    audit={audit} 
                    tasks={myTasks.filter(t => t.vendor_audit_id === audit.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Task Detail Modal */}
      <VendorTaskDetail
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
        task={selectedTask}
        userEmail={userEmail}
      />
    </div>
  );
}