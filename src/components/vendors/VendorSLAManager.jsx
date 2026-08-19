import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Shield, AlertTriangle, Edit, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

export default function VendorSLAManager({ vendor }) {
  const [showForm, setShowForm] = useState(false);
  const [editingSLA, setEditingSLA] = useState(null);
  const [formData, setFormData] = useState({
    sla_name: "",
    description: "",
    sla_type: "uptime",
    target_value: "",
    minimum_acceptable: "",
    unit: "%",
    measurement_period: "monthly",
    priority: "medium",
    penalty_clause: "",
    escalation_procedure: "",
    start_date: "",
    end_date: "",
    is_active: true
  });

  const queryClient = useQueryClient();

  const { data: slas = [] } = useQuery({
    queryKey: ['vendor-slas', vendor.id],
    queryFn: () => base44.entities.VendorSLA.filter({ vendor_id: vendor.id })
  });

  const createSLAMutation = useMutation({
    mutationFn: (data) => editingSLA 
      ? base44.entities.VendorSLA.update(editingSLA.id, data)
      : base44.entities.VendorSLA.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-slas'] });
      toast.success(editingSLA ? "SLA updated" : "SLA created");
      setShowForm(false);
      setEditingSLA(null);
      resetForm();
    }
  });

  const deleteSLAMutation = useMutation({
    mutationFn: (id) => base44.entities.VendorSLA.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-slas'] });
      toast.success("SLA deleted");
    }
  });

  const resetForm = () => {
    setFormData({
      sla_name: "",
      description: "",
      sla_type: "uptime",
      target_value: "",
      minimum_acceptable: "",
      unit: "%",
      measurement_period: "monthly",
      priority: "medium",
      penalty_clause: "",
      escalation_procedure: "",
      start_date: "",
      end_date: "",
      is_active: true
    });
  };

  const handleEdit = (sla) => {
    setEditingSLA(sla);
    setFormData(sla);
    setShowForm(true);
  };

  const handleSubmit = () => {
    createSLAMutation.mutate({
      vendor_id: vendor.id,
      ...formData,
      target_value: parseFloat(formData.target_value),
      minimum_acceptable: formData.minimum_acceptable ? parseFloat(formData.minimum_acceptable) : null
    });
  };

  const activeSLAs = slas.filter(s => s.is_active);

  return (
    <>
      <Card className="bg-[#151d2e] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Service Level Agreements</CardTitle>
            <Button onClick={() => setShowForm(true)} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Add SLA
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeSLAs.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No SLAs defined yet</p>
          ) : (
            activeSLAs.map((sla) => (
              <Card key={sla.id} className="bg-[#1a2332] border-[#2a3548] p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="h-4 w-4 text-blue-400" />
                      <h4 className="font-medium text-white text-sm">{sla.sla_name}</h4>
                      <Badge className={
                        sla.priority === 'critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                        sla.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                        sla.priority === 'medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                        'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      }>
                        {sla.priority}
                      </Badge>
                    </div>
                    {sla.description && (
                      <p className="text-xs text-slate-400 mb-2">{sla.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(sla)} className="h-7 w-7">
                      <Edit className="h-3 w-3 text-slate-400" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteSLAMutation.mutate(sla.id)} className="h-7 w-7">
                      <Trash2 className="h-3 w-3 text-slate-400" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Target:</span>
                    <span className="text-white font-semibold ml-2">
                      {sla.target_value} {sla.unit}
                    </span>
                  </div>
                  {sla.minimum_acceptable && (
                    <div>
                      <span className="text-slate-400">Minimum:</span>
                      <span className="text-white font-semibold ml-2">
                        {sla.minimum_acceptable} {sla.unit}
                      </span>
                    </div>
                  )}
                </div>

                {sla.breach_count > 0 && (
                  <div className="mt-2 flex items-center gap-2 p-2 bg-rose-500/10 rounded">
                    <AlertTriangle className="h-3 w-3 text-rose-400" />
                    <span className="text-xs text-rose-400">
                      {sla.breach_count} breach{sla.breach_count > 1 ? 'es' : ''}
                      {sla.last_breach_date && ` - Last: ${format(parseISO(sla.last_breach_date), 'MMM d, yyyy')}`}
                    </span>
                  </div>
                )}

                {(sla.start_date || sla.end_date) && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="h-3 w-3" />
                    {sla.start_date && <span>{format(parseISO(sla.start_date), 'MMM yyyy')}</span>}
                    {sla.start_date && sla.end_date && <span>-</span>}
                    {sla.end_date && <span>{format(parseISO(sla.end_date), 'MMM yyyy')}</span>}
                  </div>
                )}
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-[#1a2332] border-[#2a3548] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSLA ? 'Edit SLA' : 'Add SLA'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label>SLA Name *</Label>
              <Input
                value={formData.sla_name}
                onChange={(e) => setFormData({ ...formData, sla_name: e.target.value })}
                className="bg-[#151d2e] border-[#2a3548] text-white"
                placeholder="e.g., 99.9% Uptime Guarantee"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-[#151d2e] border-[#2a3548] text-white"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SLA Type *</Label>
                <Select value={formData.sla_type} onValueChange={(value) => setFormData({ ...formData, sla_type: value })}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                    <SelectItem value="uptime">Uptime</SelectItem>
                    <SelectItem value="response_time">Response Time</SelectItem>
                    <SelectItem value="resolution_time">Resolution Time</SelectItem>
                    <SelectItem value="availability">Availability</SelectItem>
                    <SelectItem value="quality">Quality</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
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

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Target Value *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.target_value}
                  onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>

              <div className="space-y-2">
                <Label>Minimum Acceptable</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.minimum_acceptable}
                  onChange={(e) => setFormData({ ...formData, minimum_acceptable: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>

              <div className="space-y-2">
                <Label>Unit</Label>
                <Input
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                  placeholder="%"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Measurement Period</Label>
              <Select value={formData.measurement_period} onValueChange={(value) => setFormData({ ...formData, measurement_period: value })}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Penalty Clause</Label>
              <Textarea
                value={formData.penalty_clause}
                onChange={(e) => setFormData({ ...formData, penalty_clause: e.target.value })}
                className="bg-[#151d2e] border-[#2a3548] text-white"
                rows={2}
                placeholder="What happens if SLA is breached..."
              />
            </div>

            <div className="space-y-2">
              <Label>Escalation Procedure</Label>
              <Textarea
                value={formData.escalation_procedure}
                onChange={(e) => setFormData({ ...formData, escalation_procedure: e.target.value })}
                className="bg-[#151d2e] border-[#2a3548] text-white"
                rows={2}
                placeholder="Who to contact and when..."
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-[#151d2e] rounded-lg">
              <div>
                <div className="font-medium text-white text-sm">Active SLA</div>
                <div className="text-xs text-slate-400">Track compliance for this SLA</div>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={() => { setShowForm(false); setEditingSLA(null); resetForm(); }} variant="outline" className="flex-1 border-[#2a3548]">
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.sla_name || !formData.target_value} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                {editingSLA ? 'Update' : 'Create'} SLA
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}