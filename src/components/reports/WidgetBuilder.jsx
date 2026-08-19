import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutGrid, BarChart3, PieChart, LineChart, Table, 
  Gauge, Grid3X3, AlertTriangle, FileCheck, Shield, ClipboardCheck, Calculator
} from "lucide-react";

const widgetTypes = [
  { id: 'stat_card', label: 'Stat Card', icon: LayoutGrid },
  { id: 'pie_chart', label: 'Pie Chart', icon: PieChart },
  { id: 'bar_chart', label: 'Bar Chart', icon: BarChart3 },
  { id: 'line_chart', label: 'Line Chart', icon: LineChart },
  { id: 'table', label: 'Data Table', icon: Table },
  { id: 'heat_map', label: 'Heat Map', icon: Grid3X3 },
  { id: 'gauge', label: 'Gauge', icon: Gauge },
];

const dataSources = [
  { id: 'risks', label: 'Risks', icon: AlertTriangle },
  { id: 'compliance', label: 'Compliance', icon: FileCheck },
  { id: 'controls', label: 'Controls', icon: Shield },
  { id: 'audits', label: 'Audits', icon: ClipboardCheck },
  { id: 'assessments', label: 'Assessments', icon: Calculator },
];

const metrics = {
  risks: ['count', 'open_count', 'critical_count', 'by_category', 'by_status', 'average_score'],
  compliance: ['count', 'compliance_rate', 'by_framework', 'by_status', 'gap_count'],
  controls: ['count', 'effective_count', 'by_domain', 'by_category', 'average_effectiveness'],
  audits: ['count', 'findings_count', 'critical_findings', 'by_type', 'by_status'],
  assessments: ['count', 'by_category', 'by_status', 'average_inherent', 'average_residual'],
};

const groupByOptions = {
  risks: ['category', 'status', 'owner'],
  compliance: ['framework', 'status', 'owner'],
  controls: ['domain', 'category', 'status'],
  audits: ['type', 'status', 'auditor'],
  assessments: ['risk_category', 'lifecycle_status', 'assessment_type'],
};

export default function WidgetBuilder({ open, onOpenChange, widget, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    name: '',
    widget_type: 'stat_card',
    data_source: 'risks',
    metric: 'count',
    filters: {},
    group_by: '',
    size: 'medium',
    color_scheme: 'default',
    show_trend: false,
    status: 'active'
  });

  useEffect(() => {
    if (open) {
      if (widget) {
        setFormData({
          name: widget.name || '',
          widget_type: widget.widget_type || 'stat_card',
          data_source: widget.data_source || 'risks',
          metric: widget.metric || 'count',
          filters: widget.filters || {},
          group_by: widget.group_by || '',
          size: widget.size || 'medium',
          color_scheme: widget.color_scheme || 'default',
          show_trend: widget.show_trend || false,
          status: widget.status || 'active'
        });
      } else {
        setFormData({
          name: '',
          widget_type: 'stat_card',
          data_source: 'risks',
          metric: 'count',
          filters: {},
          group_by: '',
          size: 'medium',
          color_scheme: 'default',
          show_trend: false,
          status: 'active'
        });
      }
    }
  }, [open, widget]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const currentMetrics = metrics[formData.data_source] || [];
  const currentGroupBy = groupByOptions[formData.data_source] || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-[#1a2332] border-[#2a3548] text-white max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-indigo-400" />
            {widget ? 'Edit Widget' : 'Create Widget'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <ScrollArea className="h-[55vh] px-6">
            <div className="space-y-5 py-4">
              <div>
                <Label className="text-slate-400">Widget Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 bg-[#151d2e] border-[#2a3548] text-white"
                  placeholder="e.g., Open Risks Count"
                  required
                />
              </div>

              <div>
                <Label className="text-slate-400 mb-2 block">Widget Type</Label>
                <div className="grid grid-cols-4 gap-2">
                  {widgetTypes.map(type => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, widget_type: type.id })}
                      className={`p-3 rounded-lg border flex flex-col items-center gap-1.5 transition-all ${
                        formData.widget_type === type.id
                          ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                          : 'bg-[#151d2e] border-[#2a3548] text-slate-400 hover:border-[#3a4558]'
                      }`}
                    >
                      <type.icon className="h-5 w-5" />
                      <span className="text-[10px]">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-slate-400 mb-2 block">Data Source</Label>
                <div className="grid grid-cols-5 gap-2">
                  {dataSources.map(source => (
                    <button
                      key={source.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, data_source: source.id, metric: 'count', group_by: '' })}
                      className={`p-3 rounded-lg border flex flex-col items-center gap-1.5 transition-all ${
                        formData.data_source === source.id
                          ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                          : 'bg-[#151d2e] border-[#2a3548] text-slate-400 hover:border-[#3a4558]'
                      }`}
                    >
                      <source.icon className="h-4 w-4" />
                      <span className="text-[10px]">{source.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-400">Metric</Label>
                  <Select value={formData.metric} onValueChange={(v) => setFormData({ ...formData, metric: v })}>
                    <SelectTrigger className="mt-1 bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      {currentMetrics.map(m => (
                        <SelectItem key={m} value={m} className="text-white hover:bg-[#2a3548] capitalize">
                          {m.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-400">Group By</Label>
                  <Select value={formData.group_by} onValueChange={(v) => setFormData({ ...formData, group_by: v })}>
                    <SelectTrigger className="mt-1 bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value={null} className="text-white hover:bg-[#2a3548]">None</SelectItem>
                      {currentGroupBy.map(g => (
                        <SelectItem key={g} value={g} className="text-white hover:bg-[#2a3548] capitalize">
                          {g.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-400">Size</Label>
                  <Select value={formData.size} onValueChange={(v) => setFormData({ ...formData, size: v })}>
                    <SelectTrigger className="mt-1 bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="small" className="text-white hover:bg-[#2a3548]">Small</SelectItem>
                      <SelectItem value="medium" className="text-white hover:bg-[#2a3548]">Medium</SelectItem>
                      <SelectItem value="large" className="text-white hover:bg-[#2a3548]">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-400">Color Scheme</Label>
                  <Select value={formData.color_scheme} onValueChange={(v) => setFormData({ ...formData, color_scheme: v })}>
                    <SelectTrigger className="mt-1 bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="default" className="text-white hover:bg-[#2a3548]">Default</SelectItem>
                      <SelectItem value="risk" className="text-white hover:bg-[#2a3548]">Risk (Red)</SelectItem>
                      <SelectItem value="success" className="text-white hover:bg-[#2a3548]">Success (Green)</SelectItem>
                      <SelectItem value="warning" className="text-white hover:bg-[#2a3548]">Warning (Amber)</SelectItem>
                      <SelectItem value="info" className="text-white hover:bg-[#2a3548]">Info (Blue)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={formData.show_trend}
                  onCheckedChange={(checked) => setFormData({ ...formData, show_trend: checked })}
                  className="border-[#2a3548]"
                />
                <Label className="text-slate-400 text-sm">Show trend indicator</Label>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 pt-4 border-t border-[#2a3548]">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-[#2a3548] hover:bg-[#2a3548]">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
              {isLoading ? 'Saving...' : widget ? 'Update Widget' : 'Create Widget'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}