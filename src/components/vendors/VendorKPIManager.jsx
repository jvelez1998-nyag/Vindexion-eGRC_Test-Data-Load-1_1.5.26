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
import { Plus, Target, TrendingUp, TrendingDown, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function VendorKPIManager({ vendor }) {
  const [showForm, setShowForm] = useState(false);
  const [editingKPI, setEditingKPI] = useState(null);
  const [formData, setFormData] = useState({
    kpi_name: "",
    description: "",
    measurement_type: "percentage",
    target_value: "",
    threshold_critical: "",
    threshold_warning: "",
    unit: "%",
    frequency: "monthly",
    category: "performance",
    weight: 1,
    is_active: true
  });

  const queryClient = useQueryClient();

  const { data: kpis = [] } = useQuery({
    queryKey: ['vendor-kpis', vendor.id],
    queryFn: () => base44.entities.VendorKPI.filter({ vendor_id: vendor.id })
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ['vendor-performance', vendor.id],
    queryFn: () => base44.entities.VendorPerformanceMetric.filter({ vendor_id: vendor.id }, '-metric_date')
  });

  const createKPIMutation = useMutation({
    mutationFn: (data) => editingKPI 
      ? base44.entities.VendorKPI.update(editingKPI.id, data)
      : base44.entities.VendorKPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-kpis'] });
      toast.success(editingKPI ? "KPI updated" : "KPI created");
      setShowForm(false);
      setEditingKPI(null);
      resetForm();
    }
  });

  const deleteKPIMutation = useMutation({
    mutationFn: (id) => base44.entities.VendorKPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-kpis'] });
      toast.success("KPI deleted");
    }
  });

  const resetForm = () => {
    setFormData({
      kpi_name: "",
      description: "",
      measurement_type: "percentage",
      target_value: "",
      threshold_critical: "",
      threshold_warning: "",
      unit: "%",
      frequency: "monthly",
      category: "performance",
      weight: 1,
      is_active: true
    });
  };

  const handleEdit = (kpi) => {
    setEditingKPI(kpi);
    setFormData(kpi);
    setShowForm(true);
  };

  const handleSubmit = () => {
    createKPIMutation.mutate({
      vendor_id: vendor.id,
      ...formData,
      target_value: parseFloat(formData.target_value),
      threshold_critical: formData.threshold_critical ? parseFloat(formData.threshold_critical) : null,
      threshold_warning: formData.threshold_warning ? parseFloat(formData.threshold_warning) : null,
      weight: parseFloat(formData.weight)
    });
  };

  const getKPIStatus = (kpi) => {
    const recentMetrics = metrics.filter(m => 
      m.metric_type.includes(kpi.kpi_name.toLowerCase().replace(/\s+/g, '_'))
    ).slice(0, 3);

    if (recentMetrics.length === 0) return { status: 'no_data', color: 'text-slate-500' };

    const avgValue = recentMetrics.reduce((sum, m) => sum + m.metric_value, 0) / recentMetrics.length;
    
    if (avgValue >= kpi.target_value) return { status: 'on_target', color: 'text-emerald-400' };
    if (kpi.threshold_warning && avgValue >= kpi.threshold_warning) return { status: 'warning', color: 'text-amber-400' };
    return { status: 'critical', color: 'text-rose-400' };
  };

  const activeKPIs = kpis.filter(k => k.is_active);

  return (
    <>
      <Card className="bg-[#151d2e] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Key Performance Indicators</CardTitle>
            <Button onClick={() => setShowForm(true)} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Add KPI
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeKPIs.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No KPIs defined yet</p>
          ) : (
            activeKPIs.map((kpi) => {
              const status = getKPIStatus(kpi);
              return (
                <Card key={kpi.id} className="bg-[#1a2332] border-[#2a3548] p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className={`h-4 w-4 ${status.color}`} />
                        <h4 className="font-medium text-white text-sm">{kpi.kpi_name}</h4>
                        <Badge className="text-xs bg-slate-500/20 text-slate-400">
                          {kpi.category}
                        </Badge>
                      </div>
                      {kpi.description && (
                        <p className="text-xs text-slate-400">{kpi.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(kpi)} className="h-7 w-7">
                        <Edit className="h-3 w-3 text-slate-400" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteKPIMutation.mutate(kpi.id)} className="h-7 w-7">
                        <Trash2 className="h-3 w-3 text-slate-400" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-slate-400">Target:</span>
                      <span className="text-white font-semibold ml-2">
                        {kpi.target_value} {kpi.unit}
                      </span>
                    </div>
                    <Badge className={
                      status.status === 'on_target' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      status.status === 'warning' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                      status.status === 'critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                      'bg-slate-500/20 text-slate-400 border-slate-500/30'
                    }>
                      {status.status === 'on_target' ? '✓ On Target' :
                       status.status === 'warning' ? '⚠ Warning' :
                       status.status === 'critical' ? '✗ Critical' : 'No Data'}
                    </Badge>
                  </div>
                </Card>
              );
            })
          )}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-[#1a2332] border-[#2a3548] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingKPI ? 'Edit KPI' : 'Add KPI'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label>KPI Name *</Label>
              <Input
                value={formData.kpi_name}
                onChange={(e) => setFormData({ ...formData, kpi_name: e.target.value })}
                className="bg-[#151d2e] border-[#2a3548] text-white"
                placeholder="e.g., Response Time SLA"
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
                <Label>Measurement Type *</Label>
                <Select value={formData.measurement_type} onValueChange={(value) => setFormData({ ...formData, measurement_type: value })}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                    <SelectItem value="score">Score</SelectItem>
                    <SelectItem value="boolean">Yes/No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="quality">Quality</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
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
                <Label>Warning Threshold</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.threshold_warning}
                  onChange={(e) => setFormData({ ...formData, threshold_warning: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>

              <div className="space-y-2">
                <Label>Critical Threshold</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.threshold_critical}
                  onChange={(e) => setFormData({ ...formData, threshold_critical: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Unit</Label>
                <Input
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                  placeholder="%"
                />
              </div>

              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
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

              <div className="space-y-2">
                <Label>Weight (0-1)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#151d2e] rounded-lg">
              <div>
                <div className="font-medium text-white text-sm">Active KPI</div>
                <div className="text-xs text-slate-400">Track this KPI in performance calculations</div>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={() => { setShowForm(false); setEditingKPI(null); resetForm(); }} variant="outline" className="flex-1 border-[#2a3548]">
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.kpi_name || !formData.target_value} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                {editingKPI ? 'Update' : 'Create'} KPI
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}