import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, Shield } from "lucide-react";
import { toast } from "sonner";

export default function VendorAssessmentForm({ open, onOpenChange, vendorId, onSuccess }) {
  const [formData, setFormData] = useState({
    assessment_date: new Date().toISOString().split('T')[0],
    assessment_type: "annual",
    assessor: "",
    status: "in_progress",
    security_controls_score: "",
    data_protection_score: "",
    incident_response_score: "",
    business_continuity_score: "",
    compliance_score: "",
    overall_score: "",
    risk_rating: "medium",
    notes: ""
  });

  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const dataToSave = {
        vendor_id: vendorId,
        ...data
      };
      
      // Convert scores to numbers
      ['security_controls_score', 'data_protection_score', 'incident_response_score', 
       'business_continuity_score', 'compliance_score', 'overall_score'].forEach(field => {
        if (dataToSave[field]) dataToSave[field] = parseFloat(dataToSave[field]);
      });

      return base44.entities.VendorAssessment.create(dataToSave);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-assessments'] });
      toast.success("Assessment created");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Failed to create assessment");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#1a2332] border-[#2a3548] text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-400" />
            New Vendor Assessment
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Assessment Date *</Label>
              <Input
                type="date"
                value={formData.assessment_date}
                onChange={(e) => setFormData({ ...formData, assessment_date: e.target.value })}
                required
                className="bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Assessment Type *</Label>
              <Select value={formData.assessment_type} onValueChange={(value) => setFormData({ ...formData, assessment_type: value })}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                  <SelectItem value="initial">Initial</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="triggered">Triggered</SelectItem>
                  <SelectItem value="contract_renewal">Contract Renewal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Assessment Scores (0-100)</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Security Controls</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.security_controls_score}
                  onChange={(e) => setFormData({ ...formData, security_controls_score: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Data Protection</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.data_protection_score}
                  onChange={(e) => setFormData({ ...formData, data_protection_score: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Incident Response</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.incident_response_score}
                  onChange={(e) => setFormData({ ...formData, incident_response_score: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Business Continuity</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.business_continuity_score}
                  onChange={(e) => setFormData({ ...formData, business_continuity_score: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Compliance</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.compliance_score}
                  onChange={(e) => setFormData({ ...formData, compliance_score: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Overall Score</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.overall_score}
                  onChange={(e) => setFormData({ ...formData, overall_score: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Risk Rating</Label>
              <Select value={formData.risk_rating} onValueChange={(value) => setFormData({ ...formData, risk_rating: value })}>
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
              <Label>Assessor</Label>
              <Input
                value={formData.assessor}
                onChange={(e) => setFormData({ ...formData, assessor: e.target.value })}
                className="bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-[#151d2e] border-[#2a3548] text-white"
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-[#2a3548]">
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">
              {saveMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</>
              ) : (
                <><Save className="h-4 w-4 mr-2" /> Save Assessment</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}