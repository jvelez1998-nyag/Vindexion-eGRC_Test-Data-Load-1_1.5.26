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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, Plus, Star, CheckCircle2, XCircle, Minus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const metricTypes = {
  sla_compliance: { label: "SLA Compliance", unit: "%", target: 99 },
  response_time: { label: "Response Time", unit: "hours", target: 24 },
  uptime: { label: "System Uptime", unit: "%", target: 99.9 },
  quality: { label: "Service Quality", unit: "score", target: 4 },
  delivery_time: { label: "Delivery Timeliness", unit: "days", target: 0 },
  cost_performance: { label: "Cost Performance", unit: "score", target: 4 },
  innovation: { label: "Innovation Score", unit: "score", target: 3 },
  support_quality: { label: "Support Quality", unit: "score", target: 4 }
};

export default function VendorPerformanceTracking({ vendor }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    metric_type: "sla_compliance",
    metric_date: new Date().toISOString().split('T')[0],
    metric_value: "",
    target_value: "",
    rating: 3,
    period: "monthly",
    category: "operational",
    notes: ""
  });

  const queryClient = useQueryClient();

  const { data: metrics = [] } = useQuery({
    queryKey: ['vendor-performance', vendor.id],
    queryFn: () => base44.entities.VendorPerformanceMetric.filter({ vendor_id: vendor.id }, '-metric_date')
  });

  const createMetricMutation = useMutation({
    mutationFn: (data) => base44.entities.VendorPerformanceMetric.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-performance'] });
      toast.success("Performance metric logged");
      setShowForm(false);
      resetForm();
    }
  });

  const resetForm = () => {
    setFormData({
      metric_type: "sla_compliance",
      metric_date: new Date().toISOString().split('T')[0],
      metric_value: "",
      target_value: "",
      rating: 3,
      period: "monthly",
      category: "operational",
      notes: ""
    });
  };

  const handleSubmit = () => {
    const metricConfig = metricTypes[formData.metric_type];
    const targetValue = formData.target_value || metricConfig.target;
    const metricValue = parseFloat(formData.metric_value);
    
    const meets_sla = metricValue >= targetValue;
    const impact = metricValue >= targetValue ? "positive" : 
                   metricValue >= targetValue * 0.9 ? "neutral" : "negative";

    createMetricMutation.mutate({
      vendor_id: vendor.id,
      ...formData,
      metric_value: metricValue,
      target_value: parseFloat(targetValue),
      unit: metricConfig.unit,
      meets_sla,
      impact
    });
  };

  const getAverageRating = () => {
    if (metrics.length === 0) return 0;
    return (metrics.reduce((sum, m) => sum + (m.rating || 0), 0) / metrics.length).toFixed(1);
  };

  const getSLACompliance = () => {
    const slaMetrics = metrics.filter(m => m.meets_sla !== null);
    if (slaMetrics.length === 0) return 0;
    return ((slaMetrics.filter(m => m.meets_sla).length / slaMetrics.length) * 100).toFixed(0);
  };

  const recentMetrics = metrics.slice(0, 10);

  return (
    <>
      <Card className="bg-[#151d2e] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Performance Tracking</CardTitle>
            <Button onClick={() => setShowForm(true)} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Log Metric
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-[#1a2332] border-[#2a3548] p-3">
              <div className="flex items-center gap-2 mb-1">
                {[1,2,3,4,5].map(star => (
                  <Star key={star} className={`h-3 w-3 ${star <= Math.round(getAverageRating()) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                ))}
              </div>
              <div className="text-lg font-bold text-white">{getAverageRating()}</div>
              <div className="text-xs text-slate-400">Avg Rating</div>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548] p-3">
              <div className="text-2xl font-bold text-emerald-400">{getSLACompliance()}%</div>
              <div className="text-xs text-slate-400">SLA Compliance</div>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548] p-3">
              <div className="text-2xl font-bold text-white">{metrics.length}</div>
              <div className="text-xs text-slate-400">Total Metrics</div>
            </Card>
          </div>

          {/* Recent Metrics */}
          <div className="space-y-2">
            <Label className="text-xs text-slate-400">Recent Performance Logs</Label>
            {recentMetrics.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No metrics logged yet</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recentMetrics.map((metric) => (
                  <Card key={metric.id} className="bg-[#1a2332] border-[#2a3548] p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium text-white text-sm">
                          {metricTypes[metric.metric_type]?.label}
                        </div>
                        <div className="text-xs text-slate-400">
                          {format(new Date(metric.metric_date), 'MMM d, yyyy')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {metric.meets_sla ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-rose-400" />
                        )}
                        <Badge className={
                          metric.impact === 'positive' ? 'bg-emerald-500/20 text-emerald-400' :
                          metric.impact === 'negative' ? 'bg-rose-500/20 text-rose-400' :
                          'bg-slate-500/20 text-slate-400'
                        }>
                          {metric.impact}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-300">
                        <span className="font-semibold text-white">{metric.metric_value}</span>
                        {metric.unit && <span className="text-slate-500"> {metric.unit}</span>}
                        {metric.target_value && (
                          <span className="text-slate-500"> / {metric.target_value} target</span>
                        )}
                      </div>
                      {metric.rating && (
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map(star => (
                            <Star key={star} className={`h-3 w-3 ${star <= metric.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                          ))}
                        </div>
                      )}
                    </div>
                    {metric.notes && (
                      <p className="text-xs text-slate-400 mt-2">{metric.notes}</p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-[#1a2332] border-[#2a3548] text-white">
          <DialogHeader>
            <DialogTitle>Log Performance Metric</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Metric Type *</Label>
              <Select value={formData.metric_type} onValueChange={(value) => setFormData({ ...formData, metric_type: value, target_value: metricTypes[value].target })}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                  {Object.entries(metricTypes).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={formData.metric_date}
                  onChange={(e) => setFormData({ ...formData, metric_date: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>

              <div className="space-y-2">
                <Label>Period</Label>
                <Select value={formData.period} onValueChange={(value) => setFormData({ ...formData, period: value })}>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Value * ({metricTypes[formData.metric_type]?.unit})</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.metric_value}
                  onChange={(e) => setFormData({ ...formData, metric_value: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>

              <div className="space-y-2">
                <Label>Target ({metricTypes[formData.metric_type]?.unit})</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.target_value || metricTypes[formData.metric_type]?.target}
                  onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Rating (1-5 stars)</Label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(rating => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating })}
                    className="focus:outline-none"
                  >
                    <Star className={`h-6 w-6 ${rating <= formData.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'} hover:text-amber-300 transition-colors`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="quality">Quality</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="bg-[#151d2e] border-[#2a3548] text-white"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setShowForm(false)} variant="outline" className="flex-1 border-[#2a3548]">
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.metric_value} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                Log Metric
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}