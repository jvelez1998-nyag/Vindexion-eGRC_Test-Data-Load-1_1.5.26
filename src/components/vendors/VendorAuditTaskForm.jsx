import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function VendorAuditTaskForm({ open, onOpenChange, auditId, onSuccess }) {
  const [formData, setFormData] = useState({
    task_title: "",
    description: "",
    task_type: "document_review",
    assigned_to: "",
    assigned_to_vendor: false,
    priority: "medium",
    due_date: ""
  });

  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: (data) => base44.entities.VendorAuditTask.create({
      vendor_audit_id: auditId,
      ...data,
      status: 'not_started'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-audit-tasks'] });
      toast.success("Task created");
      onSuccess?.();
      resetForm();
    }
  });

  const resetForm = () => {
    setFormData({
      task_title: "",
      description: "",
      task_type: "document_review",
      assigned_to: "",
      assigned_to_vendor: false,
      priority: "medium",
      due_date: ""
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createTaskMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#1a2332] border-[#2a3548] text-white">
        <DialogHeader>
          <DialogTitle>Add Audit Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Task Title *</Label>
            <Input
              value={formData.task_title}
              onChange={(e) => setFormData({ ...formData, task_title: e.target.value })}
              required
              className="bg-[#151d2e] border-[#2a3548] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-[#151d2e] border-[#2a3548] text-white"
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Task Type</Label>
              <Select value={formData.task_type} onValueChange={(value) => setFormData({ ...formData, task_type: value })}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                  <SelectItem value="document_review">Document Review</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="system_test">System Test</SelectItem>
                  <SelectItem value="site_visit">Site Visit</SelectItem>
                  <SelectItem value="data_analysis">Data Analysis</SelectItem>
                  <SelectItem value="vendor_response">Vendor Response</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Assigned To (Email) *</Label>
              <Input
                type="email"
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                required
                className="bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={formData.assigned_to_vendor}
              onCheckedChange={(checked) => setFormData({ ...formData, assigned_to_vendor: checked })}
            />
            <Label>Assign to vendor (external task)</Label>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-[#2a3548]">
              Cancel
            </Button>
            <Button type="submit" disabled={createTaskMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">
              {createTaskMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating...</>
              ) : (
                <><Save className="h-4 w-4 mr-2" /> Create Task</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}