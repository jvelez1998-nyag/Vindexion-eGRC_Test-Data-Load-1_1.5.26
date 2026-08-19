import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import EntityLinker from "@/components/linking/EntityLinker";
import LinkedEntitiesPanel from "@/components/linking/LinkedEntitiesPanel";
import { Link2 } from "lucide-react";

const frameworks = ["SOC2", "ISO27001", "GDPR", "HIPAA", "PCI-DSS", "NIST", "CCPA", "Other"];

const statuses = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "implemented", label: "Implemented" },
  { value: "verified", label: "Verified" },
  { value: "non_compliant", label: "Non-Compliant" }
];

export default function ComplianceForm({ open, onOpenChange, item, onSubmit, isSubmitting }) {
  const [linkerOpen, setLinkerOpen] = useState(false);
  const [formData, setFormData] = useState({
    framework: "",
    requirement: "",
    requirement_id: "",
    description: "",
    status: "not_started",
    linked_questions: [],
    linked_controls: [],
    linked_risks: [],
    owner: "",
    due_date: "",
    evidence_url: "",
    notes: ""
  });

  useEffect(() => {
    if (open) {
      if (item) {
        setFormData({
          framework: item.framework || "",
          requirement: item.requirement || "",
          requirement_id: item.requirement_id || "",
          description: item.description || "",
          status: item.status || "not_started",
          linked_questions: item.linked_questions || [],
          linked_controls: item.linked_controls || [],
          linked_risks: item.linked_risks || [],
          owner: item.owner || "",
          due_date: item.due_date || "",
          evidence_url: item.evidence_url || "",
          notes: item.notes || ""
        });
      } else {
        setFormData({
          framework: "",
          requirement: "",
          requirement_id: "",
          description: "",
          status: "not_started",
          owner: "",
          due_date: "",
          evidence_url: "",
          notes: ""
        });
      }
    }
  }, [open, item]);

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
          <DialogTitle className="text-xl font-semibold">{item ? "Edit Requirement" : "Add Requirement"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Framework *</Label>
              <Select value={formData.framework} onValueChange={(v) => handleChange("framework", v)}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue placeholder="Select framework" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  {frameworks.map(f => (
                    <SelectItem key={f} value={f} className="text-white hover:bg-[#2a3548]">{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="requirement_id">Requirement ID</Label>
              <Input 
                id="requirement_id" 
                value={formData.requirement_id || ""} 
                onChange={(e) => handleChange("requirement_id", e.target.value)}
                placeholder="e.g., CC6.1"
                className="bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirement">Requirement *</Label>
            <Input 
              id="requirement" 
              value={formData.requirement} 
              onChange={(e) => handleChange("requirement", e.target.value)}
              placeholder="Enter requirement title"
              required
              className="bg-[#151d2e] border-[#2a3548] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={formData.description || ""} 
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Detailed description"
              rows={3}
              className="bg-[#151d2e] border-[#2a3548] text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="owner">Owner</Label>
              <Input 
                id="owner" 
                type="email"
                value={formData.owner || ""} 
                onChange={(e) => handleChange("owner", e.target.value)}
                placeholder="owner@company.com"
                className="bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input 
                id="due_date" 
                type="date"
                value={formData.due_date || ""} 
                onChange={(e) => handleChange("due_date", e.target.value)}
                className="bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="evidence_url">Evidence URL</Label>
              <Input 
                id="evidence_url" 
                value={formData.evidence_url || ""} 
                onChange={(e) => handleChange("evidence_url", e.target.value)}
                placeholder="https://..."
                className="bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>
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
              {isSubmitting ? "Saving..." : item ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <EntityLinker
        open={linkerOpen}
        onOpenChange={setLinkerOpen}
        sourceEntity={formData}
        sourceType="compliance"
        onLinksUpdated={(links) => {
          setFormData(prev => ({
            ...prev,
            linked_questions: links.questions || [],
            linked_controls: links.controls || [],
            linked_risks: links.risks || []
          }));
        }}
      />
    </Dialog>
  );
}