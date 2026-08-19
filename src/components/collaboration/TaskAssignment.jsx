import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, AlertCircle, Plus, Edit2, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function TaskAssignment({ entityType, entityId, entityTitle }) {
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(user => setCurrentUser(user)).catch(() => {});
  }, []);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    task_type: "remediation",
    assigned_to: "",
    priority: "medium",
    due_date: "",
    effort_hours: ""
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', entityType, entityId],
    queryFn: async () => {
      const allTasks = await base44.entities.Task.filter({ 
        related_entity_type: entityType, 
        related_entity_id: entityId 
      }, '-created_date');
      return allTasks;
    }
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', entityType, entityId] });
      setTaskFormOpen(false);
      resetForm();
      toast.success("Task assigned");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', entityType, entityId] });
      setEditingTask(null);
      toast.success("Task updated");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Task.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', entityType, entityId] });
      toast.success("Task deleted");
    }
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      task_type: "remediation",
      assigned_to: "",
      priority: "medium",
      due_date: "",
      effort_hours: ""
    });
    setEditingTask(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const taskData = {
      ...formData,
      related_entity_type: entityType,
      related_entity_id: entityId,
      assigned_by: currentUser?.email
    };

    if (editingTask) {
      updateMutation.mutate({ id: editingTask.id, data: taskData });
    } else {
      createMutation.mutate(taskData);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      task_type: task.task_type,
      assigned_to: task.assigned_to,
      priority: task.priority,
      due_date: task.due_date || "",
      effort_hours: task.effort_hours || ""
    });
    setTaskFormOpen(true);
  };

  const handleQuickStatusUpdate = (taskId, newStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const updates = { status: newStatus };
      if (newStatus === 'completed' && !task.completion_date) {
        updates.completion_date = new Date().toISOString().split('T')[0];
        updates.progress_percentage = 100;
      }
      updateMutation.mutate({ id: taskId, data: { ...task, ...updates } });
    }
  };

  const statusColors = {
    not_started: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    under_review: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blocked: 'bg-red-500/10 text-red-400 border-red-500/20'
  };

  const priorityColors = {
    low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    critical: 'bg-red-500/10 text-red-400 border-red-500/20'
  };

  return (
    <>
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Tasks ({tasks.length})
            </CardTitle>
            <Button onClick={() => { resetForm(); setTaskFormOpen(true); }} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-3 w-3 mr-1" />
              Assign Task
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3 pr-4">
              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No tasks assigned yet</p>
                </div>
              ) : (
                tasks.map(task => (
                  <div key={task.id} className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-white text-sm flex-1">{task.title}</h4>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-blue-400" onClick={() => handleEdit(task)}>
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-400" onClick={() => deleteMutation.mutate(task.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-400 mb-2">{task.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge className={`text-[10px] border ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </Badge>
                      <Badge className={`text-[10px] border ${statusColors[task.status]}`}>
                        {task.status.replace(/_/g, ' ')}
                      </Badge>
                      <Badge className="text-[10px] bg-slate-500/10 text-slate-400 border-slate-500/20">
                        {task.task_type.replace(/_/g, ' ')}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {task.assigned_to}
                      </div>
                      {task.due_date && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}
                        </div>
                      )}
                    </div>

                    {task.status !== 'completed' && (
                      <div className="flex gap-2 mt-2">
                        {task.status === 'not_started' && (
                          <Button size="sm" variant="outline" onClick={() => handleQuickStatusUpdate(task.id, 'in_progress')} className="h-6 text-xs border-blue-500/30 text-blue-400">
                            Start
                          </Button>
                        )}
                        {task.status === 'in_progress' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleQuickStatusUpdate(task.id, 'under_review')} className="h-6 text-xs border-purple-500/30 text-purple-400">
                              Review
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleQuickStatusUpdate(task.id, 'completed')} className="h-6 text-xs border-emerald-500/30 text-emerald-400">
                              Complete
                            </Button>
                          </>
                        )}
                        {task.status === 'under_review' && (
                          <Button size="sm" variant="outline" onClick={() => handleQuickStatusUpdate(task.id, 'completed')} className="h-6 text-xs border-emerald-500/30 text-emerald-400">
                            Complete
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={taskFormOpen} onOpenChange={setTaskFormOpen}>
        <DialogContent className="bg-[#1a2332] border-[#2a3548] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'Assign New Task'}</DialogTitle>
            <p className="text-sm text-slate-400">for {entityTitle}</p>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-white">Task Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Review control effectiveness"
                className="bg-[#151d2e] border-[#2a3548] text-white"
                required
              />
            </div>

            <div>
              <Label className="text-white">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide detailed task instructions..."
                className="bg-[#151d2e] border-[#2a3548] text-white"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Task Type</Label>
                <Select value={formData.task_type} onValueChange={(value) => setFormData({ ...formData, task_type: value })}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="remediation" className="text-white">Remediation</SelectItem>
                    <SelectItem value="review" className="text-white">Review</SelectItem>
                    <SelectItem value="assessment" className="text-white">Assessment</SelectItem>
                    <SelectItem value="audit" className="text-white">Audit</SelectItem>
                    <SelectItem value="compliance" className="text-white">Compliance</SelectItem>
                    <SelectItem value="control_testing" className="text-white">Control Testing</SelectItem>
                    <SelectItem value="documentation" className="text-white">Documentation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white">Assign To *</Label>
                <Select value={formData.assigned_to} onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.email} className="text-white">
                        {user.full_name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="low" className="text-white">Low</SelectItem>
                    <SelectItem value="medium" className="text-white">Medium</SelectItem>
                    <SelectItem value="high" className="text-white">High</SelectItem>
                    <SelectItem value="critical" className="text-white">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white">Due Date</Label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-white">Estimated Effort (hours)</Label>
              <Input
                type="number"
                value={formData.effort_hours}
                onChange={(e) => setFormData({ ...formData, effort_hours: e.target.value })}
                placeholder="8"
                className="bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setTaskFormOpen(false)} className="border-[#2a3548]">
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                {editingTask ? 'Update Task' : 'Assign Task'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}