import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

export default function ClientForm({ open, onOpenChange, client, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    name: "",
    client_type: "enterprise",
    industry: "",
    status: "active",
    risk_level: "medium",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    address: "",
    relationship_manager: "",
    data_classification: "internal",
    notes: ""
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || "",
        client_type: client.client_type || "enterprise",
        industry: client.industry || "",
        status: client.status || "active",
        risk_level: client.risk_level || "medium",
        contact_name: client.contact_name || "",
        contact_email: client.contact_email || "",
        contact_phone: client.contact_phone || "",
        address: client.address || "",
        relationship_manager: client.relationship_manager || "",
        data_classification: client.data_classification || "internal",
        notes: client.notes || ""
      });
    } else {
      setFormData({
        name: "",
        client_type: "enterprise",
        industry: "",
        status: "active",
        risk_level: "medium",
        contact_name: "",
        contact_email: "",
        contact_phone: "",
        address: "",
        relationship_manager: "",
        data_classification: "internal",
        notes: ""
      });
    }
  }, [client, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {client ? 'Edit Client' : 'Add New Client'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white border-b border-[#2a3548] pb-2">
                  Basic Information
                </h3>

                <div>
                  <Label className="text-slate-300">Client Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter client name"
                    className="mt-1.5 bg-[#151d2e] border-[#2a3548] text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-slate-300">Client Type *</Label>
                    <Select value={formData.client_type} onValueChange={(value) => setFormData({ ...formData, client_type: value })}>
                      <SelectTrigger className="mt-1.5 bg-[#151d2e] border-[#2a3548] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        <SelectItem value="enterprise" className="text-white">Enterprise</SelectItem>
                        <SelectItem value="mid_market" className="text-white">Mid-Market</SelectItem>
                        <SelectItem value="small_business" className="text-white">Small Business</SelectItem>
                        <SelectItem value="government" className="text-white">Government</SelectItem>
                        <SelectItem value="non_profit" className="text-white">Non-Profit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-slate-300">Industry *</Label>
                    <Input
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      placeholder="e.g., Financial Services"
                      className="mt-1.5 bg-[#151d2e] border-[#2a3548] text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-slate-300">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger className="mt-1.5 bg-[#151d2e] border-[#2a3548] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        <SelectItem value="active" className="text-white">Active</SelectItem>
                        <SelectItem value="inactive" className="text-white">Inactive</SelectItem>
                        <SelectItem value="prospect" className="text-white">Prospect</SelectItem>
                        <SelectItem value="at_risk" className="text-white">At Risk</SelectItem>
                        <SelectItem value="churned" className="text-white">Churned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-slate-300">Risk Level</Label>
                    <Select value={formData.risk_level} onValueChange={(value) => setFormData({ ...formData, risk_level: value })}>
                      <SelectTrigger className="mt-1.5 bg-[#151d2e] border-[#2a3548] text-white">
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
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white border-b border-[#2a3548] pb-2 mt-4">
                  Contact Information
                </h3>

                <div>
                  <Label className="text-slate-300">Contact Name</Label>
                  <Input
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    placeholder="Primary contact person"
                    className="mt-1.5 bg-[#151d2e] border-[#2a3548] text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-slate-300">Contact Email</Label>
                    <Input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      placeholder="email@example.com"
                      className="mt-1.5 bg-[#151d2e] border-[#2a3548] text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-300">Contact Phone</Label>
                    <Input
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="mt-1.5 bg-[#151d2e] border-[#2a3548] text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-slate-300">Address</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Street, City, State, ZIP"
                    className="mt-1.5 bg-[#151d2e] border-[#2a3548] text-white"
                  />
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white border-b border-[#2a3548] pb-2 mt-4">
                  Additional Information
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-slate-300">Relationship Manager</Label>
                    <Input
                      value={formData.relationship_manager}
                      onChange={(e) => setFormData({ ...formData, relationship_manager: e.target.value })}
                      placeholder="Manager email"
                      className="mt-1.5 bg-[#151d2e] border-[#2a3548] text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-300">Data Classification</Label>
                    <Select value={formData.data_classification} onValueChange={(value) => setFormData({ ...formData, data_classification: value })}>
                      <SelectTrigger className="mt-1.5 bg-[#151d2e] border-[#2a3548] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        <SelectItem value="public" className="text-white">Public</SelectItem>
                        <SelectItem value="internal" className="text-white">Internal</SelectItem>
                        <SelectItem value="confidential" className="text-white">Confidential</SelectItem>
                        <SelectItem value="restricted" className="text-white">Restricted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-slate-300">Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes about this client..."
                    className="mt-1.5 bg-[#151d2e] border-[#2a3548] text-white h-24"
                  />
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#2a3548]">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="border-[#2a3548] text-slate-400 hover:bg-[#2a3548] hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {client ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                client ? 'Update Client' : 'Create Client'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}