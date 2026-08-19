import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Edit, Users, Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function RemediationTaskManager({ findingId, findingTitle }) {
  const [editingTask, setEditingTask] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ['remediation-tasks', findingId],
    queryFn: () => base44.entities.RemediationTask.list().then(all => 
      all.filter(t => !findingId || t.finding_id === findingId)
    )
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.RemediationTask.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remediation-tasks'] });
      setDialogOpen(false);
      setEditingTask(null);
      toast.success("Task updated");
    }
  });

  const [formData, setFormData] = useState({
    owner: '',
    due_date: '',
    status: 'not_started',
    progress_percentage: 0
  });

  useEffect(() => {
    if (editingTask) {
      setFormData({
        owner: editingTask.owner || '',
        due_date: editingTask.due_date || '',
        status: editingTask.status || 'not_started',
        progress_percentage: editingTask.progress_percentage || 0
      });
    }
  }, [editingTask]);

  const handleSubmit = () => {
    const updateData = { ...formData };
    if (formData.status === 'completed' && !editingTask.completion_date) {
      updateData.completion_date = new Date().toISOString().split('T')[0];
      updateData.progress_percentage = 100;
    }
    updateMutation.mutate({
      id: editingTask.id,
      data: updateData
    });
  };

  const statusColors = {
    not_started: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    under_review: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blocked: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  };

  const priorityColors = {
    critical: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    low: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  };

  const getOverdueStatus = (dueDate, status) => {
    if (!dueDate || status === 'completed') return null;
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <CardTitle className="text-base text-white flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          Remediation Tasks
          {findingTitle && <span className="text-slate-500 text-xs font-normal">for {findingTitle}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No remediation tasks yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {tasks.map(task => {
                const isOverdue = getOverdueStatus(task.due_date, task.status);
                return (
                  <div key={task.id} className="p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-white mb-2">{task.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge className={`text-[9px] ${priorityColors[task.priority]}`}>
                            {task.priority}
                          </Badge>
                          <Badge className={`text-[9px] ${statusColors[task.status]}`}>
                            {task.status?.replace(/_/g, ' ')}
                          </Badge>
                          {task.ai_generated && (
                            <Badge className="text-[9px] bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                              AI Generated
                            </Badge>
                          )}
                          {isOverdue && (
                            <Badge className="text-[9px] bg-rose-500/10 text-rose-400 border-rose-500/20">
                              <AlertCircle className="h-2 w-2 mr-1" />
                              Overdue
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          setEditingTask(task);
                          setDialogOpen(true);
                        }}
                        size="sm"
                        variant="outline"
                        className="border-[#2a3548] hover:bg-[#2a3548]"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-400 mb-3">{task.description}</p>
                    )}

                    <div className="space-y-2 mb-3">
                      {task.owner && (
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Users className="h-3 w-3" />
                          <span>{task.owner}</span>
                        </div>
                      )}
                      {task.due_date && (
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Clock className="h-3 w-3" />
                          <span className={isOverdue ? 'text-rose-400' : ''}>
                            Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                      )}
                    </div>

                    {task.progress_percentage > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Progress</span>
                          <span className="text-slate-400">{task.progress_percentage}%</span>
                        </div>
                        <Progress value={task.progress_percentage} className="h-1.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#1a2332] border-[#2a3548] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign & Update Task</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Task Owner</label>
                <Select value={formData.owner} onValueChange={(val) => setFormData({...formData, owner: val})}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.email} className="text-white hover:bg-[#2a3548]">
                        {user.full_name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Due Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left bg-[#151d2e] border-[#2a3548] hover:bg-[#2a3548]">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {formData.due_date ? format(new Date(formData.due_date), 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#1a2332] border-[#2a3548]">
                    <Calendar
                      mode="single"
                      selected={formData.due_date ? new Date(formData.due_date) : undefined}
                      onSelect={(date) => setFormData({...formData, due_date: date ? format(date, 'yyyy-MM-dd') : ''})}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Status</label>
                <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="not_started" className="text-white hover:bg-[#2a3548]">Not Started</SelectItem>
                    <SelectItem value="in_progress" className="text-white hover:bg-[#2a3548]">In Progress</SelectItem>
                    <SelectItem value="under_review" className="text-white hover:bg-[#2a3548]">Under Review</SelectItem>
                    <SelectItem value="completed" className="text-white hover:bg-[#2a3548]">Completed</SelectItem>
                    <SelectItem value="blocked" className="text-white hover:bg-[#2a3548]">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Progress: {formData.progress_percentage}%</label>
                <Input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress_percentage}
                  onChange={(e) => setFormData({...formData, progress_percentage: parseInt(e.target.value)})}
                  className="w-full"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-[#2a3548] hover:bg-[#2a3548]">
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={updateMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}