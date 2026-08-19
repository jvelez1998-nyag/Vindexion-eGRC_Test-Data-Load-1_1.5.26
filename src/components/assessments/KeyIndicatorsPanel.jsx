import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, MoreVertical, Pencil, Trash2, Activity, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

const indicatorTypes = [
  { value: "kpi", label: "KPI - Key Performance Indicator", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { value: "kci", label: "KCI - Key Control Indicator", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { value: "kri", label: "KRI - Key Risk Indicator", color: "bg-rose-500/10 text-rose-400 border-rose-500/20" }
];
const frequencies = ["daily", "weekly", "monthly", "quarterly", "annually"];

function getIndicatorStatus(indicator) {
  if (!indicator.current_value || !indicator.threshold_green) return { status: 'unknown', color: 'bg-slate-500' };
  const { current_value, threshold_green, threshold_amber, threshold_red, direction } = indicator;
  
  if (direction === 'higher_better') {
    if (current_value >= threshold_green) return { status: 'green', color: 'bg-emerald-500' };
    if (threshold_amber && current_value >= threshold_amber) return { status: 'amber', color: 'bg-amber-500' };
    return { status: 'red', color: 'bg-rose-500' };
  } else {
    if (current_value <= threshold_green) return { status: 'green', color: 'bg-emerald-500' };
    if (threshold_amber && current_value <= threshold_amber) return { status: 'amber', color: 'bg-amber-500' };
    return { status: 'red', color: 'bg-rose-500' };
  }
}

export default function KeyIndicatorsPanel({ indicators }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ 
    name: "", indicator_type: "", description: "", metric: "", unit: "", 
    current_value: null, target_value: null, threshold_green: null, threshold_amber: null, threshold_red: null,
    direction: "higher_better", frequency: "", data_source: "", owner: "", status: "active"
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.KeyIndicator.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['key-indicators'] }); setFormOpen(false); toast.success("Indicator added"); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.KeyIndicator.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['key-indicators'] }); setFormOpen(false); setEditing(null); toast.success("Indicator updated"); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.KeyIndicator.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['key-indicators'] }); toast.success("Indicator removed"); }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...formData,
      current_value: formData.current_value ? parseFloat(formData.current_value) : null,
      target_value: formData.target_value ? parseFloat(formData.target_value) : null,
      threshold_green: formData.threshold_green ? parseFloat(formData.threshold_green) : null,
      threshold_amber: formData.threshold_amber ? parseFloat(formData.threshold_amber) : null,
      threshold_red: formData.threshold_red ? parseFloat(formData.threshold_red) : null
    };
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  const openEdit = (item) => { setEditing(item); setFormData(item); setFormOpen(true); };
  const openNew = () => { 
    setEditing(null); 
    setFormData({ name: "", indicator_type: "", description: "", metric: "", unit: "", current_value: null, target_value: null, threshold_green: null, threshold_amber: null, threshold_red: null, direction: "higher_better", frequency: "", data_source: "", owner: "", status: "active" }); 
    setFormOpen(true); 
  };

  const filtered = indicators.filter(i => {
    const matchesSearch = !search || i.name?.toLowerCase().includes(search.toLowerCase()) || i.metric?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || i.indicator_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const kpis = filtered.filter(i => i.indicator_type === 'kpi');
  const kcis = filtered.filter(i => i.indicator_type === 'kci');
  const kris = filtered.filter(i => i.indicator_type === 'kri');

  const IndicatorCard = ({ indicator }) => {
    const typeConfig = indicatorTypes.find(t => t.value === indicator.indicator_type);
    const statusInfo = getIndicatorStatus(indicator);
    
    return (
      <Card className="bg-[#1a2332] border-[#2a3548] p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2.5 h-2.5 rounded-full ${statusInfo.color}`} />
              <Badge className={`text-[10px] border uppercase ${typeConfig?.color}`}>{indicator.indicator_type}</Badge>
            </div>
            <h4 className="font-medium text-white">{indicator.name}</h4>
            <p className="text-xs text-slate-500 mt-1">{indicator.metric}</p>
            <div className="flex items-center gap-4 mt-3">
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Current</p>
                <p className="text-lg font-bold text-white">{indicator.current_value ?? '-'}{indicator.unit && <span className="text-xs text-slate-400 ml-1">{indicator.unit}</span>}</p>
              </div>
              {indicator.target_value && (
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">Target</p>
                  <p className="text-lg font-bold text-slate-400">{indicator.target_value}{indicator.unit && <span className="text-xs ml-1">{indicator.unit}</span>}</p>
                </div>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-[#2a3548]"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1a2332] border-[#2a3548]">
              <DropdownMenuItem onClick={() => openEdit(indicator)} className="text-white hover:bg-[#2a3548]"><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => deleteMutation.mutate(indicator.id)} className="text-rose-400 hover:bg-rose-500/10"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-[#1a2332] border border-[#2a3548]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input placeholder="Search indicators..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-[#151d2e] border-[#2a3548] text-white" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-36 bg-[#151d2e] border-[#2a3548] text-white"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent className="bg-[#1a2332] border-[#2a3548]">
            <SelectItem value="all" className="text-white hover:bg-[#2a3548]">All Types</SelectItem>
            <SelectItem value="kpi" className="text-white hover:bg-[#2a3548]">KPI</SelectItem>
            <SelectItem value="kci" className="text-white hover:bg-[#2a3548]">KCI</SelectItem>
            <SelectItem value="kri" className="text-white hover:bg-[#2a3548]">KRI</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={openNew} className="gap-2 bg-indigo-600 hover:bg-indigo-700"><Plus className="h-4 w-4" />Add Indicator</Button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-xl bg-[#1a2332] border border-[#2a3548]">
          <Activity className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">No indicators found</h3>
          <p className="text-slate-500 mt-1">Add KPIs, KCIs, and KRIs to track metrics</p>
        </div>
      ) : (
        <div className="space-y-6">
          {kpis.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-blue-400 mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4" />KPI - Performance ({kpis.length})</h3>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{kpis.map(i => <IndicatorCard key={i.id} indicator={i} />)}</div>
            </div>
          )}
          {kcis.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-emerald-400 mb-3 flex items-center gap-2"><Activity className="h-4 w-4" />KCI - Control ({kcis.length})</h3>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{kcis.map(i => <IndicatorCard key={i.id} indicator={i} />)}</div>
            </div>
          )}
          {kris.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-rose-400 mb-3 flex items-center gap-2"><TrendingDown className="h-4 w-4" />KRI - Risk ({kris.length})</h3>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{kris.map(i => <IndicatorCard key={i.id} indicator={i} />)}</div>
            </div>
          )}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="bg-[#1a2332] border-[#2a3548] text-white sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Indicator" : "Add Indicator"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name *</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="bg-[#151d2e] border-[#2a3548]" /></div>
              <div className="space-y-2"><Label>Type *</Label>
                <Select value={formData.indicator_type} onValueChange={(v) => setFormData({...formData, indicator_type: v})}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548]"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">{indicatorTypes.map(t => <SelectItem key={t.value} value={t.value} className="text-white hover:bg-[#2a3548]">{t.value.toUpperCase()}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Metric *</Label><Input value={formData.metric} onChange={(e) => setFormData({...formData, metric: e.target.value})} required placeholder="What is being measured" className="bg-[#151d2e] border-[#2a3548]" /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Current Value</Label><Input type="number" step="any" value={formData.current_value ?? ""} onChange={(e) => setFormData({...formData, current_value: e.target.value})} className="bg-[#151d2e] border-[#2a3548]" /></div>
              <div className="space-y-2"><Label>Target Value</Label><Input type="number" step="any" value={formData.target_value ?? ""} onChange={(e) => setFormData({...formData, target_value: e.target.value})} className="bg-[#151d2e] border-[#2a3548]" /></div>
              <div className="space-y-2"><Label>Unit</Label><Input value={formData.unit || ""} onChange={(e) => setFormData({...formData, unit: e.target.value})} placeholder="%, $, etc" className="bg-[#151d2e] border-[#2a3548]" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Green ≤/≥</Label><Input type="number" step="any" value={formData.threshold_green ?? ""} onChange={(e) => setFormData({...formData, threshold_green: e.target.value})} className="bg-[#151d2e] border-[#2a3548]" /></div>
              <div className="space-y-2"><Label>Amber ≤/≥</Label><Input type="number" step="any" value={formData.threshold_amber ?? ""} onChange={(e) => setFormData({...formData, threshold_amber: e.target.value})} className="bg-[#151d2e] border-[#2a3548]" /></div>
              <div className="space-y-2"><Label>Red ≤/≥</Label><Input type="number" step="any" value={formData.threshold_red ?? ""} onChange={(e) => setFormData({...formData, threshold_red: e.target.value})} className="bg-[#151d2e] border-[#2a3548]" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Direction</Label>
                <Select value={formData.direction || "higher_better"} onValueChange={(v) => setFormData({...formData, direction: v})}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548]"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="higher_better" className="text-white hover:bg-[#2a3548]">Higher is better</SelectItem>
                    <SelectItem value="lower_better" className="text-white hover:bg-[#2a3548]">Lower is better</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Frequency</Label>
                <Select value={formData.frequency || ""} onValueChange={(v) => setFormData({...formData, frequency: v})}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548]"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">{frequencies.map(f => <SelectItem key={f} value={f} className="text-white hover:bg-[#2a3548] capitalize">{f}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Owner</Label><Input value={formData.owner || ""} onChange={(e) => setFormData({...formData, owner: e.target.value})} type="email" className="bg-[#151d2e] border-[#2a3548]" /></div>
          </form>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)} className="bg-transparent border-[#2a3548] text-white hover:bg-[#2a3548]">Cancel</Button>
            <Button onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700">{editing ? "Update" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}