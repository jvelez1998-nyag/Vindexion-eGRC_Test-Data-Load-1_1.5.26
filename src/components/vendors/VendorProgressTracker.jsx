import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, CheckCircle2, Clock, AlertTriangle, Target } from "lucide-react";

export default function VendorProgressTracker({ vendor }) {
  const { data: tasks = [] } = useQuery({
    queryKey: ['vendor-tasks', vendor.id],
    queryFn: () => base44.entities.VendorOnboardingTask.filter({ vendor_id: vendor.id })
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['vendor-reviews', vendor.id],
    queryFn: () => base44.entities.VendorReview.filter({ vendor_id: vendor.id })
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const overdueTasks = tasks.filter(t => {
    if (!t.due_date || t.status === 'completed') return false;
    return new Date(t.due_date) < new Date();
  }).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getStatusBadge = () => {
    if (vendor.status === 'active') return { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', text: 'Active' };
    if (vendor.status === 'pending') return { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', text: 'Pending' };
    if (vendor.status === 'onboarding') return { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', text: 'Onboarding' };
    return { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', text: vendor.status };
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
              Progress Overview
            </CardTitle>
            <Badge className={statusBadge.color}>{statusBadge.text}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Overall Completion</span>
              <span className="text-lg font-bold text-white">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-3" />
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 bg-[#151d2e] rounded border border-[#2a3548] text-center">
              <div className="text-xl font-bold text-white">{totalTasks}</div>
              <div className="text-xs text-slate-400">Total Tasks</div>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded border border-emerald-500/30 text-center">
              <div className="text-xl font-bold text-emerald-400">{completedTasks}</div>
              <div className="text-xs text-slate-400">Completed</div>
            </div>
            <div className="p-3 bg-blue-500/10 rounded border border-blue-500/30 text-center">
              <div className="text-xl font-bold text-blue-400">{inProgressTasks}</div>
              <div className="text-xs text-slate-400">In Progress</div>
            </div>
            <div className="p-3 bg-amber-500/10 rounded border border-amber-500/30 text-center">
              <div className="text-xl font-bold text-amber-400">{overdueTasks}</div>
              <div className="text-xs text-slate-400">Overdue</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Breakdown */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base">Task Details</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-6">
              <Target className="h-10 w-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No tasks assigned yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.slice(0, 5).map(task => (
                <div key={task.id} className="p-3 bg-[#151d2e] rounded border border-[#2a3548]">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h5 className="text-sm font-medium text-white mb-1">{task.task_name}</h5>
                      <p className="text-xs text-slate-400">{task.description}</p>
                    </div>
                    <Badge className={
                      task.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }>
                      {task.status === 'completed' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {task.status === 'in_progress' && <Clock className="h-3 w-3 mr-1" />}
                      {task.status === 'pending' && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {task.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    {task.assigned_role && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {task.assigned_role}
                      </span>
                    )}
                    {task.due_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review History */}
      {reviews.length > 0 && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base">Review History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reviews.slice(0, 3).map(review => (
                <div key={review.id} className="p-3 bg-[#151d2e] rounded border border-[#2a3548]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{review.review_type}</span>
                    <Badge className={
                      review.overall_rating === 'excellent' ? 'bg-emerald-500/20 text-emerald-400' :
                      review.overall_rating === 'good' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-amber-500/20 text-amber-400'
                    }>
                      {review.overall_rating}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">
                    {new Date(review.review_date).toLocaleDateString()} by {review.reviewer}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}