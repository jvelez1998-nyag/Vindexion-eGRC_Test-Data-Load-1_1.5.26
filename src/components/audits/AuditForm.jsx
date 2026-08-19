import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const types = [
  { value: "internal", label: "Internal" },
  { value: "external", label: "External" },
  { value: "regulatory", label: "Regulatory" }
];

const statuses = [
  { value: "planned", label: "Planned" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "follow_up", label: "Follow Up" }
];

export default function AuditForm({ open, onOpenChange, audit, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    scope: "",
    status: "planned",
    auditor: "",
    start_date: "",
    end_date: "",
    findings_count: 0,
    critical_findings: 0,
    report_url: "",
    notes: ""
  });

  useEffect(() => {
    if (open) {
      if (audit) {
        setFormData({
          title: audit.title || "",
          type: audit.type || "",
          scope: audit.scope || "",
          status: audit.status || "planned",
          auditor: audit.auditor || "",
          start_date: audit.start_date || "",
          end_date: audit.end_date || "",
          findings_count: audit.findings_count || 0,
          critical_findings: audit.critical_findings || 0,
          report_url: audit.report_url || "",
          notes: audit.notes || ""
        });
      } else {
        setFormData({
          title: "",
          type: "",
          scope: "",
          status: "planned",
          auditor: "",
          start_date: "",
          end_date: "",
          findings_count: 0,
          critical_findings: 0,
          report_url: "",
          notes: ""
        });
      }
    }
  }, [open, audit]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-[#1a2332] border-[#2a3548] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{audit ? "Edit Audit" : "Add Audit"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input 
              id="title" 
              value={formData.title} 
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Enter audit title"
              required
              className="bg-[#151d2e] border-[#2a3548] text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select value={formData.type} onValueChange={(v) => handleChange("type", v)}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  {types.map(t => (
                    <SelectItem key={t.value} value={t.value} className="text-white hover:bg-[#2a3548]">{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  {statuses.map(s => (
                    <SelectItem key={s.value} value={s.value} className="text-white hover:bg-[#2a3548]">{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scope">Scope</Label>
            <Textarea 
              id="scope" 
              value={formData.scope || ""} 
              onChange={(e) => handleChange("scope", e.target.value)}
              placeholder="Define the audit scope"
              rows={3}
              className="bg-[#151d2e] border-[#2a3548] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="auditor">Auditor</Label>
            <Input 
              id="auditor" 
              value={formData.auditor || ""} 
              onChange={(e) => handleChange("auditor", e.target.value)}
              placeholder="Auditor name or firm"
              className="bg-[#151d2e] border-[#2a3548] text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input 
                id="start_date" 
                type="date"
                value={formData.start_date || ""} 
                onChange={(e) => handleChange("start_date", e.target.value)}
                className="bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input 
                id="end_date" 
                type="date"
                value={formData.end_date || ""} 
                onChange={(e) => handleChange("end_date", e.target.value)}
                className="bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="findings_count">Total Findings</Label>
              <Input 
                id="findings_count" 
                type="number"
                min="0"
                value={formData.findings_count || 0} 
                onChange={(e) => handleChange("findings_count", parseInt(e.target.value) || 0)}
                className="bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="critical_findings">Critical Findings</Label>
              <Input 
                id="critical_findings" 
                type="number"
                min="0"
                value={formData.critical_findings || 0} 
                onChange={(e) => handleChange("critical_findings", parseInt(e.target.value) || 0)}
                className="bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report_url">Report URL</Label>
            <Input 
              id="report_url" 
              value={formData.report_url || ""} 
              onChange={(e) => handleChange("report_url", e.target.value)}
              placeholder="https://..."
              className="bg-[#151d2e] border-[#2a3548] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              value={formData.notes || ""} 
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Additional notes"
              rows={2}
              className="bg-[#151d2e] border-[#2a3548] text-white"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-[#2a3548] hover:bg-[#2a3548] text-slate-300">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
              {isSubmitting ? "Saving..." : audit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}