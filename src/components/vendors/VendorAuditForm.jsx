import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function VendorAuditForm({ open, onOpenChange, vendor, templates, onSuccess }) {
  const [formData, setFormData] = useState({
    audit_title: "",
    audit_type: "annual",
    template_id: "",
    priority: "medium",
    lead_auditor: "",
    start_date: "",
    due_date: "",
    scope: "",
    objectives: []
  });

  const queryClient = useQueryClient();

  const createAuditMutation = useMutation({
    mutationFn: async (data) => {
      const audit = await base44.entities.VendorAudit.create({
        vendor_id: vendor.id,
        ...data,
        status: 'planned',
        progress_percentage: 0
      });

      // If template selected, create tasks from template
      if (data.template_id) {
        const template = templates.find(t => t.id === data.template_id);
        if (template?.task_templates) {
          const tasks = template.task_templates.map(taskTemplate => ({
            vendor_audit_id: audit.id,
            task_title: taskTemplate.title,
            description: taskTemplate.description,
            task_type: taskTemplate.type || 'document_review',
            assigned_to: taskTemplate.default_assignee || data.lead_auditor,
            priority: taskTemplate.priority || 'medium',
            due_date: taskTemplate.days_offset 
              ? new Date(Date.now() + taskTemplate.days_offset * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              : null
          }));
          
          await base44.entities.VendorAuditTask.bulkCreate(tasks);
        }
      }

      return audit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-audits'] });
      toast.success("Audit created successfully");
      onSuccess?.();
      resetForm();
    },
    onError: () => {
      toast.error("Failed to create audit");
    }
  });

  const resetForm = () => {
    setFormData({
      audit_title: "",
      audit_type: "annual",
      template_id: "",
      priority: "medium",
      lead_auditor: "",
      start_date: "",
      due_date: "",
      scope: "",
      objectives: []
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createAuditMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#1a2332] border-[#2a3548] text-white">
        <DialogHeader>
          <DialogTitle>Initiate Vendor Audit</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Audit Title *</Label>
            <Input
              value={formData.audit_title}
              onChange={(e) => setFormData({ ...formData, audit_title: e.target.value })}
              placeholder="e.g., Annual Security Audit 2025"
              required
              className="bg-[#151d2e] border-[#2a3548] text-white"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Audit Type *</Label>
              <Select value={formData.audit_type} onValueChange={(value) => setFormData({ ...formData, audit_type: value })}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                  <SelectItem value="initial">Initial</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="triggered">Triggered</SelectItem>
                  <SelectItem value="contract_renewal">Contract Renewal</SelectItem>
                  <SelectItem value="incident_response">Incident Response</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Template</Label>
              <Select value={formData.template_id} onValueChange={(value) => setFormData({ ...formData, template_id: value })}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue placeholder="Select template (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                  <SelectItem value={null}>No Template</SelectItem>
                  {templates?.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.template_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label>Lead Auditor Email *</Label>
              <Input
                type="email"
                value={formData.lead_auditor}
                onChange={(e) => setFormData({ ...formData, lead_auditor: e.target.value })}
                required
                className="bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>

            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                required
                className="bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Scope</Label>
            <Textarea
              value={formData.scope}
              onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
              placeholder="Define the audit scope..."
              className="bg-[#151d2e] border-[#2a3548] text-white"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-[#2a3548]">
              Cancel
            </Button>
            <Button type="submit" disabled={createAuditMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">
              {createAuditMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating...</>
              ) : (
                <><Save className="h-4 w-4 mr-2" /> Create Audit</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}