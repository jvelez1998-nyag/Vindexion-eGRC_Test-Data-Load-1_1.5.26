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
import { Plus, Search, MoreVertical, Pencil, Trash2, Library } from "lucide-react";
import { toast } from "sonner";

const categories = ["strategic", "operational", "financial", "compliance", "technology", "cyber", "third_party", "reputational"];
const riskTypes = ["it", "operational", "security", "financial"];

export default function RiskLibraryPanel({ riskLibrary }) {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ risk_id: "", name: "", description: "", category: "", subcategory: "", risk_type: "", typical_causes: "", typical_impacts: "", status: "active" });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.RiskLibrary.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['risk-library'] }); setFormOpen(false); toast.success("Risk added to library"); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.RiskLibrary.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['risk-library'] }); setFormOpen(false); setEditing(null); toast.success("Risk updated"); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.RiskLibrary.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['risk-library'] }); toast.success("Risk removed"); }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) updateMutation.mutate({ id: editing.id, data: formData });
    else createMutation.mutate(formData);
  };

  const openEdit = (item) => {
    setEditing(item);
    setFormData(item);
    setFormOpen(true);
  };

  const openNew = () => {
    setEditing(null);
    setFormData({ risk_id: "", name: "", description: "", category: "", subcategory: "", risk_type: "", typical_causes: "", typical_impacts: "", status: "active" });
    setFormOpen(true);
  };

  const filtered = riskLibrary.filter(r => 
    !search || r.name?.toLowerCase().includes(search.toLowerCase()) || r.risk_id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-[#1a2332] border border-[#2a3548]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input placeholder="Search risk library..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-[#151d2e] border-[#2a3548] text-white" />
        </div>
        <Button onClick={openNew} className="gap-2 bg-indigo-600 hover:bg-indigo-700"><Plus className="h-4 w-4" />Add Risk</Button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-xl bg-[#1a2332] border border-[#2a3548]">
          <Library className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">Risk library empty</h3>
          <p className="text-slate-500 mt-1">Add standard risks to reuse in assessments</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map(risk => (
            <Card key={risk.id} className="bg-[#1a2332] border-[#2a3548] p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-500 font-mono">{risk.risk_id}</span>
                    <Badge className="text-[10px] border bg-slate-500/10 text-slate-400 border-slate-500/20 capitalize">{risk.category}</Badge>
                  </div>
                  <h4 className="font-medium text-white">{risk.name}</h4>
                  {risk.description && <p className="text-sm text-slate-400 mt-1 line-clamp-2">{risk.description}</p>}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-[#2a3548]"><MoreVertical className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#1a2332] border-[#2a3548]">
                    <DropdownMenuItem onClick={() => openEdit(risk)} className="text-white hover:bg-[#2a3548]"><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => deleteMutation.mutate(risk.id)} className="text-rose-400 hover:bg-rose-500/10"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="bg-[#1a2332] border-[#2a3548] text-white">
          <DialogHeader><DialogTitle>{editing ? "Edit Risk" : "Add Risk to Library"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Risk ID *</Label><Input value={formData.risk_id} onChange={(e) => setFormData({...formData, risk_id: e.target.value})} required className="bg-[#151d2e] border-[#2a3548]" /></div>
              <div className="space-y-2"><Label>Category *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548]"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">{categories.map(c => <SelectItem key={c} value={c} className="text-white hover:bg-[#2a3548] capitalize">{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Name *</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="bg-[#151d2e] border-[#2a3548]" /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={formData.description || ""} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={2} className="bg-[#151d2e] border-[#2a3548]" /></div>
            <div className="space-y-2"><Label>Risk Type</Label>
              <Select value={formData.risk_type || ""} onValueChange={(v) => setFormData({...formData, risk_type: v})}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548]"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">{riskTypes.map(t => <SelectItem key={t} value={t} className="text-white hover:bg-[#2a3548] uppercase">{t}</SelectItem>)}</SelectContent>
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