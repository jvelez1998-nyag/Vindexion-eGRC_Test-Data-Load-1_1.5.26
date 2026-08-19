import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Clock, User } from "lucide-react";
import { toast } from "sonner";

export default function QuickActionPanel({ open, onOpenChange, issue, issueType }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: issue ? `Remediate: ${issue.title || issue.name || 'Issue'}` : '',
    description: '',
    assigned_to: '',
    due_date: '',
    priority: 'high',
    status: 'todo'
  });

  const createTaskMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      toast.success('Remediation task created');
      onOpenChange(false);
      resetForm();
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      assigned_to: '',
      due_date: '',
      priority: 'high',
      status: 'todo'
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const taskData = {
      ...formData,
      category: issueType || 'remediation',
      linked_entity_id: issue?.id,
      linked_entity_type: issueType,
      metadata: {
        source: 'report_dashboard',
        issue_title: issue?.title || issue?.name,
        severity: issue?.severity || issue?.risk_level || issue?.impact,
        created_from: 'quick_action'
      }
    };

    createTaskMutation.mutate(taskData);
  };

  const getIssueContext = () => {
    if (!issue) return null;

    switch(issueType) {
      case 'risk':
        return {
          label: 'Risk',
          icon: AlertTriangle,
          color: 'rose',
          details: [
            { label: 'Severity', value: issue.risk_level || 'N/A' },
            { label: 'Likelihood', value: issue.likelihood ? `${issue.likelihood}/5` : 'N/A' },
            { label: 'Impact', value: issue.impact ? `${issue.impact}/5` : 'N/A' }
          ]
        };
      case 'compliance':
        return {
          label: 'Compliance Gap',
          icon: CheckCircle2,
          color: 'amber',
          details: [
            { label: 'Framework', value: issue.framework || 'N/A' },
            { label: 'Status', value: issue.status || 'N/A' },
            { label: 'Requirement', value: issue.requirement || 'N/A' }
          ]
        };
      case 'finding':
        return {
          label: 'Audit Finding',
          icon: Clock,
          color: 'blue',
          details: [
            { label: 'Severity', value: issue.severity || 'N/A' },
            { label: 'Category', value: issue.category || 'N/A' },
            { label: 'Status', value: issue.status || 'N/A' }
          ]
        };
      default:
        return null;
    }
  };

  const context = getIssueContext();
  const Icon = context?.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a2332] border-[#2a3548] text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-400" />
            Create Remediation Task
          </DialogTitle>
        </DialogHeader>

        {context && (
          <div className={`p-4 rounded-lg bg-gradient-to-br from-${context.color}-500/10 to-${context.color}-500/5 border border-${context.color}-500/20`}>
            <div className="flex items-start gap-3">
              {Icon && <Icon className={`h-5 w-5 text-${context.color}-400 mt-0.5`} />}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`bg-${context.color}-500/20 text-${context.color}-400`}>
                    {context.label}
                  </Badge>
                  <span className="text-sm font-medium text-white">{issue.title || issue.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  {context.details.map((detail, idx) => (
                    <div key={idx}>
                      <span className="text-slate-500">{detail.label}:</span>
                      <span className="text-slate-300 ml-1 font-medium">{detail.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label className="text-slate-300">Task Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="bg-[#0f1623] border-[#2a3548] text-white mt-1"
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <Label className="text-slate-300">Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-[#0f1623] border-[#2a3548] text-white mt-1 h-24"
              placeholder="Describe the remediation actions needed..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Assign To (Email)</Label>
              <Input
                type="email"
                value={formData.assigned_to}
                onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
                className="bg-[#0f1623] border-[#2a3548] text-white mt-1"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <Label className="text-slate-300">Due Date</Label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                className="bg-[#0f1623] border-[#2a3548] text-white mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Priority</Label>
              <Select value={formData.priority} onValueChange={(val) => setFormData({...formData, priority: val})}>
                <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-300">Status</Label>
              <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#2a3548]">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-[#2a3548]">
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={createTaskMutation.isPending}>
              {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}