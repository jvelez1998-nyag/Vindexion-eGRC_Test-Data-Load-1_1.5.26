import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreVertical, Pencil, Trash2, Shield } from "lucide-react";
import { toast } from "sonner";

const controlTypes = ["preventive", "detective", "corrective", "directive", "compensating"];
const controlNatures = ["manual", "automated", "it_dependent"];
const frequencies = ["continuous", "daily", "weekly", "monthly", "quarterly", "annually", "ad_hoc"];
const domains = ["access_control", "data_protection", "network_security", "change_management", "incident_response", "business_continuity", "vendor_management", "physical_security", "hr_security", "asset_management"];

const typeColors = {
  preventive: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  detective: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  corrective: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  directive: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  compensating: 'bg-pink-500/10 text-pink-400 border-pink-500/20'
};

export default function ControlLibraryPanel({ controlLibrary }) {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ control_id: "", name: "", description: "", control_type: "", control_nature: "", control_frequency: "", domain: "", testing_procedure: "", evidence_required: "", owner: "", status: "active" });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ControlLibrary.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['control-library'] }); setFormOpen(false); toast.success("Control added"); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ControlLibrary.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['control-library'] }); setFormOpen(false); setEditing(null); toast.success("Control updated"); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ControlLibrary.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['control-library'] }); toast.success("Control removed"); }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) updateMutation.mutate({ id: editing.id, data: formData });
    else createMutation.mutate(formData);
  };

  const openEdit = (item) => { setEditing(item); setFormData(item); setFormOpen(true); };
  const openNew = () => { setEditing(null); setFormData({ control_id: "", name: "", description: "", control_type: "", control_nature: "", control_frequency: "", domain: "", testing_procedure: "", evidence_required: "", owner: "", status: "active" }); setFormOpen(true); };

  const filtered = controlLibrary.filter(c => !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.control_id?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-[#1a2332] border border-[#2a3548]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input placeholder="Search control library..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-[#151d2e] border-[#2a3548] text-white" />
        </div>
        <Button onClick={openNew} className="gap-2 bg-indigo-600 hover:bg-indigo-700"><Plus className="h-4 w-4" />Add Control</Button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-xl bg-[#1a2332] border border-[#2a3548]">
          <Shield className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">Control library empty</h3>
          <p className="text-slate-500 mt-1">Add standard controls to link in assessments</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map(control => (
            <Card key={control.id} className="bg-[#1a2332] border-[#2a3548] p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-500 font-mono">{control.control_id}</span>
                  </div>
                  <h4 className="font-medium text-white">{control.name}</h4>
                  {control.description && <p className="text-sm text-slate-400 mt-1 line-clamp-2">{control.description}</p>}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge className={`text-[10px] border capitalize ${typeColors[control.control_type] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>{control.control_type}</Badge>
                    <Badge className="text-[10px] border bg-slate-500/10 text-slate-400 border-slate-500/20">{control.domain?.replace(/_/g, ' ')}</Badge>
                    {control.control_nature && <Badge className="text-[10px] border bg-cyan-500/10 text-cyan-400 border-cyan-500/20">{control.control_nature?.replace(/_/g, ' ')}</Badge>}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-[#2a3548]"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#1a2332] border-[#2a3548]">
                    <DropdownMenuItem onClick={() => openEdit(control)} className="text-white hover:bg-[#2a3548]"><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => deleteMutation.mutate(control.id)} className="text-rose-400 hover:bg-rose-500/10"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="bg-[#1a2332] border-[#2a3548] text-white sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Control" : "Add Control to Library"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Control ID *</Label><Input value={formData.control_id} onChange={(e) => setFormData({...formData, control_id: e.target.value})} required className="bg-[#151d2e] border-[#2a3548]" /></div>
              <div className="space-y-2"><Label>Type *</Label>
                <Select value={formData.control_type} onValueChange={(v) => setFormData({...formData, control_type: v})}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548]"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">{controlTypes.map(t => <SelectItem key={t} value={t} className="text-white hover:bg-[#2a3548] capitalize">{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Name *</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="bg-[#151d2e] border-[#2a3548]" /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={formData.description || ""} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={2} className="bg-[#151d2e] border-[#2a3548]" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Domain *</Label>
                <Select value={formData.domain} onValueChange={(v) => setFormData({...formData, domain: v})}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548]"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">{domains.map(d => <SelectItem key={d} value={d} className="text-white hover:bg-[#2a3548]">{d.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Nature</Label>
                <Select value={formData.control_nature || ""} onValueChange={(v) => setFormData({...formData, control_nature: v})}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548]"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">{controlNatures.map(n => <SelectItem key={n} value={n} className="text-white hover:bg-[#2a3548]">{n.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Frequency</Label>
              <Select value={formData.control_frequency || ""} onValueChange={(v) => setFormData({...formData, control_frequency: v})}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548]"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">{frequencies.map(f => <SelectItem key={f} value={f} className="text-white hover:bg-[#2a3548] capitalize">{f.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)} className="bg-transparent border-[#2a3548] text-white hover:bg-[#2a3548]">Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">{editing ? "Update" : "Add"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}