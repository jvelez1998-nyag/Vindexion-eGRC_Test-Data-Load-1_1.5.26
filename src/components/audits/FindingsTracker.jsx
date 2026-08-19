import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function FindingsTracker({ open, onOpenChange, auditId }) {
  const [formData, setFormData] = useState({
    title: "",
    audit_id: auditId || "",
    severity: "medium",
    category: "control_deficiency",
    description: "",
    criteria: "",
    condition: "",
    cause: "",
    effect: "",
    recommendation: "",
    responsible_party: "",
    target_date: "",
    status: "open"
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.AuditFinding.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-findings'] });
      onOpenChange(false);
      toast.success("Finding created");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({ ...formData, audit_id: auditId });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Document Audit Finding</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="mx-6 bg-[#151d2e] border border-[#2a3548]">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="action">Action Plan</TabsTrigger>
            </TabsList>
            <ScrollArea className="h-[50vh]">
              <TabsContent value="details" className="px-6 space-y-4 mt-4">
                <div>
                  <Label>Title *</Label>
                  <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required className="mt-1 bg-[#151d2e] border-[#2a3548]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Severity *</Label>
                    <Select value={formData.severity} onValueChange={(v) => setFormData({...formData, severity: v})}>
                      <SelectTrigger className="mt-1 bg-[#151d2e] border-[#2a3548]"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        <SelectItem value="critical" className="text-white">Critical</SelectItem>
                        <SelectItem value="high" className="text-white">High</SelectItem>
                        <SelectItem value="medium" className="text-white">Medium</SelectItem>
                        <SelectItem value="low" className="text-white">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Category *</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                      <SelectTrigger className="mt-1 bg-[#151d2e] border-[#2a3548]"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        <SelectItem value="control_deficiency" className="text-white">Control Deficiency</SelectItem>
                        <SelectItem value="compliance_violation" className="text-white">Compliance Violation</SelectItem>
                        <SelectItem value="inefficiency" className="text-white">Inefficiency</SelectItem>
                        <SelectItem value="risk_exposure" className="text-white">Risk Exposure</SelectItem>
                        <SelectItem value="best_practice" className="text-white">Best Practice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={4} className="mt-1 bg-[#151d2e] border-[#2a3548]" />
                </div>
              </TabsContent>
              <TabsContent value="analysis" className="px-6 space-y-4 mt-4">
                <div>
                  <Label>Criteria (What should be)</Label>
                  <Textarea value={formData.criteria} onChange={(e) => setFormData({...formData, criteria: e.target.value})} rows={3} className="mt-1 bg-[#151d2e] border-[#2a3548]" />
                </div>
                <div>
                  <Label>Condition (What is)</Label>
                  <Textarea value={formData.condition} onChange={(e) => setFormData({...formData, condition: e.target.value})} rows={3} className="mt-1 bg-[#151d2e] border-[#2a3548]" />
                </div>
                <div>
                  <Label>Cause (Why it happened)</Label>
                  <Textarea value={formData.cause} onChange={(e) => setFormData({...formData, cause: e.target.value})} rows={3} className="mt-1 bg-[#151d2e] border-[#2a3548]" />
                </div>
                <div>
                  <Label>Effect (Impact)</Label>
                  <Textarea value={formData.effect} onChange={(e) => setFormData({...formData, effect: e.target.value})} rows={3} className="mt-1 bg-[#151d2e] border-[#2a3548]" />
                </div>
              </TabsContent>
              <TabsContent value="action" className="px-6 space-y-4 mt-4">
                <div>
                  <Label>Recommendation</Label>
                  <Textarea value={formData.recommendation} onChange={(e) => setFormData({...formData, recommendation: e.target.value})} rows={4} className="mt-1 bg-[#151d2e] border-[#2a3548]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Responsible Party</Label>
                    <Input value={formData.responsible_party} onChange={(e) => setFormData({...formData, responsible_party: e.target.value})} className="mt-1 bg-[#151d2e] border-[#2a3548]" />
                  </div>
                  <div>
                    <Label>Target Date</Label>
                    <Input type="date" value={formData.target_date} onChange={(e) => setFormData({...formData, target_date: e.target.value})} className="mt-1 bg-[#151d2e] border-[#2a3548]" />
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
          <DialogFooter className="p-6 pt-4 border-t border-[#2a3548]">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-[#2a3548]">Cancel</Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Create Finding</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}