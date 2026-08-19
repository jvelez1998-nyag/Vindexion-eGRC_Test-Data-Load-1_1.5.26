import { useState, useEffect } from "react";
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
import AutoEnrichmentButton from "@/components/enrichment/AutoEnrichmentButton";

export default function VendorForm({ open, onOpenChange, vendor, onSuccess }) {
  const [formData, setFormData] = useState({
    vendor_name: "",
    vendor_type: "technology",
    description: "",
    criticality: "medium",
    risk_tier: "tier_2",
    status: "active",
    primary_contact: "",
    contact_email: "",
    contact_phone: "",
    website: "",
    contract_start_date: "",
    contract_end_date: "",
    contract_value: "",
    auto_renewal: false,
    notice_period_days: "",
    next_review_date: "",
    data_access_level: "limited",
    certifications: [],
    notes: ""
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (vendor) {
      setFormData({
        vendor_name: vendor.vendor_name || "",
        vendor_type: vendor.vendor_type || "technology",
        description: vendor.description || "",
        criticality: vendor.criticality || "medium",
        risk_tier: vendor.risk_tier || "tier_2",
        status: vendor.status || "active",
        primary_contact: vendor.primary_contact || "",
        contact_email: vendor.contact_email || "",
        contact_phone: vendor.contact_phone || "",
        website: vendor.website || "",
        contract_start_date: vendor.contract_start_date || "",
        contract_end_date: vendor.contract_end_date || "",
        contract_value: vendor.contract_value || "",
        auto_renewal: vendor.auto_renewal || false,
        notice_period_days: vendor.notice_period_days || "",
        next_review_date: vendor.next_review_date || "",
        data_access_level: vendor.data_access_level || "limited",
        certifications: vendor.certifications || [],
        notes: vendor.notes || ""
      });
    } else {
      setFormData({
        vendor_name: "",
        vendor_type: "technology",
        description: "",
        criticality: "medium",
        risk_tier: "tier_2",
        status: "active",
        primary_contact: "",
        contact_email: "",
        contact_phone: "",
        website: "",
        contract_start_date: "",
        contract_end_date: "",
        contract_value: "",
        auto_renewal: false,
        notice_period_days: "",
        next_review_date: "",
        data_access_level: "limited",
        certifications: [],
        notes: ""
      });
    }
  }, [vendor, open]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (vendor) {
        return base44.entities.Vendor.update(vendor.id, data);
      } else {
        return base44.entities.Vendor.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success(vendor ? "Vendor updated" : "Vendor created");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Failed to save vendor");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = { ...formData };
    if (dataToSave.contract_value) dataToSave.contract_value = parseFloat(dataToSave.contract_value);
    if (dataToSave.notice_period_days) dataToSave.notice_period_days = parseInt(dataToSave.notice_period_days);
    saveMutation.mutate(dataToSave);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#1a2332] border-[#2a3548] text-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{vendor ? "Edit Vendor" : "Add Vendor"}</DialogTitle>
            {vendor && (
              <AutoEnrichmentButton
                entityType="vendor"
                entity={vendor}
                relatedData={{}}
                onUpdate={(id, updates) => {
                  setFormData(prev => ({ ...prev, ...updates }));
                }}
              />
            )}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Basic Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vendor Name *</Label>
                <Input
                  value={formData.vendor_name}
                  onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                  required
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Vendor Type *</Label>
                <Select value={formData.vendor_type} onValueChange={(value) => setFormData({ ...formData, vendor_type: value })}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="cloud">Cloud</SelectItem>
                    <SelectItem value="saas">SaaS</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="data">Data</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Criticality</Label>
                <Select value={formData.criticality} onValueChange={(value) => setFormData({ ...formData, criticality: value })}>
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
                <Label>Risk Tier</Label>
                <Select value={formData.risk_tier} onValueChange={(value) => setFormData({ ...formData, risk_tier: value })}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                    <SelectItem value="tier_1">Tier 1 (Highest)</SelectItem>
                    <SelectItem value="tier_2">Tier 2</SelectItem>
                    <SelectItem value="tier_3">Tier 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4 pt-4 border-t border-[#2a3548]">
            <h3 className="text-sm font-semibold text-white">Contact Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Primary Contact</Label>
                <Input
                  value={formData.primary_contact}
                  onChange={(e) => setFormData({ ...formData, primary_contact: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
            </div>
          </div>

          {/* Contract Info */}
          <div className="space-y-4 pt-4 border-t border-[#2a3548]">
            <h3 className="text-sm font-semibold text-white">Contract Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contract Start Date</Label>
                <Input
                  type="date"
                  value={formData.contract_start_date}
                  onChange={(e) => setFormData({ ...formData, contract_start_date: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Contract End Date</Label>
                <Input
                  type="date"
                  value={formData.contract_end_date}
                  onChange={(e) => setFormData({ ...formData, contract_end_date: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Contract Value (Annual)</Label>
                <Input
                  type="number"
                  value={formData.contract_value}
                  onChange={(e) => setFormData({ ...formData, contract_value: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Notice Period (Days)</Label>
                <Input
                  type="number"
                  value={formData.notice_period_days}
                  onChange={(e) => setFormData({ ...formData, notice_period_days: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.auto_renewal}
                onCheckedChange={(checked) => setFormData({ ...formData, auto_renewal: checked })}
              />
              <Label>Auto-Renewal</Label>
            </div>
          </div>

          {/* Security & Compliance */}
          <div className="space-y-4 pt-4 border-t border-[#2a3548]">
            <h3 className="text-sm font-semibold text-white">Security & Compliance</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Next Review Date</Label>
                <Input
                  type="date"
                  value={formData.next_review_date}
                  onChange={(e) => setFormData({ ...formData, next_review_date: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Data Access Level</Label>
                <Select value={formData.data_access_level} onValueChange={(value) => setFormData({ ...formData, data_access_level: value })}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="limited">Limited</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="extensive">Extensive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-[#151d2e] border-[#2a3548] text-white"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-[#2a3548]">
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">
              {saveMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</>
              ) : (
                <><Save className="h-4 w-4 mr-2" /> Save Vendor</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}