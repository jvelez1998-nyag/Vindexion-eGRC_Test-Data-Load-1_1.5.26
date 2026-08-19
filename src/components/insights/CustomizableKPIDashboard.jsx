import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Save, Edit, Trash2, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export default function CustomizableKPIDashboard({ data }) {
  const [kpis, setKpis] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingKPI, setEditingKPI] = useState(null);

  useEffect(() => {
    // Load saved KPIs from localStorage
    const saved = localStorage.getItem('custom_kpis');
    if (saved) {
      setKpis(JSON.parse(saved));
    } else {
      // Default KPIs
      setKpis([
        {
          id: '1',
          name: 'Critical Risks',
          metric: 'risk_count',
          filter: 'critical',
          target: 5,
          visualization: 'number'
        },
        {
          id: '2',
          name: 'Control Effectiveness',
          metric: 'control_effectiveness',
          filter: 'all',
          target: 90,
          visualization: 'gauge'
        },
        {
          id: '3',
          name: 'Compliance Rate',
          metric: 'compliance_rate',
          filter: 'all',
          target: 95,
          visualization: 'gauge'
        },
        {
          id: '4',
          name: 'Risk Trend (30d)',
          metric: 'risk_trend',
          filter: 'all',
          target: 0,
          visualization: 'line'
        }
      ]);
    }
  }, []);

  const saveKPIs = (newKPIs) => {
    setKpis(newKPIs);
    localStorage.setItem('custom_kpis', JSON.stringify(newKPIs));
    toast.success("KPIs saved");
  };

  const calculateKPIValue = (kpi) => {
    switch (kpi.metric) {
      case 'risk_count':
        if (kpi.filter === 'critical') {
          return data.risks.filter(r => ((r.residual_likelihood || 0) * (r.residual_impact || 0)) >= 16).length;
        } else if (kpi.filter === 'high') {
          return data.risks.filter(r => ((r.residual_likelihood || 0) * (r.residual_impact || 0)) >= 12).length;
        }
        return data.risks.length;
      
      case 'control_effectiveness':
        const effectiveControls = data.controls.filter(c => c.effectiveness === 'effective').length;
        return data.controls.length > 0 ? Math.round((effectiveControls / data.controls.length) * 100) : 0;
      
      case 'compliance_rate':
        const compliant = data.compliance.filter(c => c.compliance_status === 'compliant').length;
        return data.compliance.length > 0 ? Math.round((compliant / data.compliance.length) * 100) : 0;
      
      case 'incident_count':
        if (kpi.filter === 'open') {
          return data.incidents.filter(i => i.status !== 'closed').length;
        }
        return data.incidents.length;
      
      case 'vendor_risk':
        return data.vendors.filter(v => v.criticality === 'critical' || v.criticality === 'high').length;
      
      case 'risk_trend':
        return data.risks
          .filter(r => {
            const daysAgo = Math.floor((new Date() - new Date(r.created_date)) / (1000 * 60 * 60 * 24));
            return daysAgo <= 30;
          })
          .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
          .reduce((acc, risk, idx, arr) => {
            const week = Math.floor(idx / (arr.length / 4));
            if (!acc[week]) acc[week] = { week: `W${week + 1}`, count: 0 };
            acc[week].count++;
            return acc;
          }, []);
      
      default:
        return 0;
    }
  };

  const addKPI = () => {
    setEditingKPI({
      id: Date.now().toString(),
      name: '',
      metric: 'risk_count',
      filter: 'all',
      target: 10,
      visualization: 'number'
    });
    setEditModalOpen(true);
  };

  const saveKPI = () => {
    if (!editingKPI.name) {
      toast.error("KPI name is required");
      return;
    }
    
    const updated = editingKPI.id && kpis.find(k => k.id === editingKPI.id)
      ? kpis.map(k => k.id === editingKPI.id ? editingKPI : k)
      : [...kpis, editingKPI];
    
    saveKPIs(updated);
    setEditModalOpen(false);
    setEditingKPI(null);
  };

  const deleteKPI = (id) => {
    saveKPIs(kpis.filter(k => k.id !== id));
  };

  const renderVisualization = (kpi, value) => {
    if (kpi.visualization === 'number') {
      const isAboveTarget = value > kpi.target;
      return (
        <div className="flex items-center justify-between">
          <div className="text-4xl font-bold text-white">{value}</div>
          <div className="flex flex-col items-end">
            <Badge className={`${isAboveTarget ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              Target: {kpi.target}
            </Badge>
            {isAboveTarget ? (
              <TrendingUp className="h-5 w-5 text-rose-400 mt-1" />
            ) : (
              <TrendingDown className="h-5 w-5 text-emerald-400 mt-1" />
            )}
          </div>
        </div>
      );
    } else if (kpi.visualization === 'gauge') {
      const percentage = Math.min(100, (value / 100) * 100);
      const isGood = value >= kpi.target;
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-white">{value}%</div>
            <Badge className={`${isGood ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
              Target: {kpi.target}%
            </Badge>
          </div>
          <div className="w-full h-3 bg-[#151d2e] rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${isGood ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      );
    } else if (kpi.visualization === 'line' && Array.isArray(value)) {
      return (
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={value}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
            <XAxis dataKey="week" stroke="#64748b" style={{ fontSize: '10px' }} />
            <YAxis stroke="#64748b" style={{ fontSize: '10px' }} />
            <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548' }} />
            <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-400" />
              Customizable KPI Dashboard
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button onClick={addKPI} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" />
                Add KPI
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kpis.map(kpi => {
              const value = calculateKPIValue(kpi);
              return (
                <Card key={kpi.id} className="bg-[#151d2e] border-[#2a3548]">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm text-slate-300">{kpi.name}</CardTitle>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingKPI(kpi);
                            setEditModalOpen(true);
                          }}
                          className="h-6 w-6 text-slate-400 hover:text-white"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteKPI(kpi.id)}
                          className="h-6 w-6 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {renderVisualization(kpi, value)}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="bg-[#1a2332] border-[#2a3548]">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingKPI?.id && kpis.find(k => k.id === editingKPI.id) ? 'Edit KPI' : 'Add New KPI'}
            </DialogTitle>
          </DialogHeader>
          {editingKPI && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-2 block">KPI Name</label>
                <Input
                  value={editingKPI.name}
                  onChange={(e) => setEditingKPI({...editingKPI, name: e.target.value})}
                  placeholder="e.g., Critical Risks"
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-2 block">Metric</label>
                <Select value={editingKPI.metric} onValueChange={(val) => setEditingKPI({...editingKPI, metric: val})}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="risk_count" className="text-white hover:bg-[#2a3548]">Risk Count</SelectItem>
                    <SelectItem value="control_effectiveness" className="text-white hover:bg-[#2a3548]">Control Effectiveness %</SelectItem>
                    <SelectItem value="compliance_rate" className="text-white hover:bg-[#2a3548]">Compliance Rate %</SelectItem>
                    <SelectItem value="incident_count" className="text-white hover:bg-[#2a3548]">Incident Count</SelectItem>
                    <SelectItem value="vendor_risk" className="text-white hover:bg-[#2a3548]">High-Risk Vendors</SelectItem>
                    <SelectItem value="risk_trend" className="text-white hover:bg-[#2a3548]">Risk Trend</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-2 block">Filter</label>
                <Select value={editingKPI.filter} onValueChange={(val) => setEditingKPI({...editingKPI, filter: val})}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="all" className="text-white hover:bg-[#2a3548]">All</SelectItem>
                    <SelectItem value="critical" className="text-white hover:bg-[#2a3548]">Critical</SelectItem>
                    <SelectItem value="high" className="text-white hover:bg-[#2a3548]">High</SelectItem>
                    <SelectItem value="open" className="text-white hover:bg-[#2a3548]">Open/Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-2 block">Target Value</label>
                <Input
                  type="number"
                  value={editingKPI.target}
                  onChange={(e) => setEditingKPI({...editingKPI, target: parseInt(e.target.value)})}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-2 block">Visualization</label>
                <Select value={editingKPI.visualization} onValueChange={(val) => setEditingKPI({...editingKPI, visualization: val})}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="number" className="text-white hover:bg-[#2a3548]">Number</SelectItem>
                    <SelectItem value="gauge" className="text-white hover:bg-[#2a3548]">Progress Gauge</SelectItem>
                    <SelectItem value="line" className="text-white hover:bg-[#2a3548]">Line Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <Button onClick={saveKPI} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save KPI
                </Button>
                <Button onClick={() => setEditModalOpen(false)} variant="outline" className="flex-1 border-[#2a3548]">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}