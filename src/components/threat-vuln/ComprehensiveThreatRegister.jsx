import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Search, AlertTriangle, Shield, Edit, Trash2, Eye, X } from "lucide-react";
import { toast } from "sonner";

export default function ComprehensiveThreatRegister() {
  const [view, setView] = useState("threats");
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);

  const queryClient = useQueryClient();

  const { data: threats = [] } = useQuery({
    queryKey: ['threats'],
    queryFn: () => base44.entities.Threat.list('-updated_date', 100)
  });

  const { data: vulnerabilities = [] } = useQuery({
    queryKey: ['vulnerabilities'],
    queryFn: () => base44.entities.Vulnerability.list('-updated_date', 100)
  });

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: () => base44.entities.Control.list('-updated_date', 100)
  });

  const createThreatMutation = useMutation({
    mutationFn: (data) => base44.entities.Threat.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threats'] });
      setFormOpen(false);
      setEditing(null);
      toast.success("Threat created");
    }
  });

  const updateThreatMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Threat.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threats'] });
      setFormOpen(false);
      setEditing(null);
      toast.success("Threat updated");
    }
  });

  const deleteThreatMutation = useMutation({
    mutationFn: (id) => base44.entities.Threat.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threats'] });
      toast.success("Threat deleted");
    }
  });

  const createVulnMutation = useMutation({
    mutationFn: (data) => base44.entities.Vulnerability.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vulnerabilities'] });
      setFormOpen(false);
      setEditing(null);
      toast.success("Vulnerability created");
    }
  });

  const updateVulnMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Vulnerability.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vulnerabilities'] });
      setFormOpen(false);
      setEditing(null);
      toast.success("Vulnerability updated");
    }
  });

  const deleteVulnMutation = useMutation({
    mutationFn: (id) => base44.entities.Vulnerability.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vulnerabilities'] });
      toast.success("Vulnerability deleted");
    }
  });

  const items = view === "threats" ? threats : vulnerabilities;
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(search.toLowerCase()) ||
                          item.title?.toLowerCase().includes(search.toLowerCase()) ||
                          item.description?.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === "all" || item.severity === severityFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const severityColors = {
    critical: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    high: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    low: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    informational: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  };

  const getLinkedControls = (item) => {
    const linkedIds = item.linked_controls || [];
    return controls.filter(c => linkedIds.includes(c.id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setView("threats")}
            className={view === "threats" 
              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" 
              : "bg-[#1a2332] text-slate-400 border border-[#2a3548] hover:bg-[#1e2a3d]"
            }
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Threats ({threats.length})
          </Button>
          <Button
            onClick={() => setView("vulnerabilities")}
            className={view === "vulnerabilities" 
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
              : "bg-[#1a2332] text-slate-400 border border-[#2a3548] hover:bg-[#1e2a3d]"
            }
          >
            <Shield className="h-4 w-4 mr-2" />
            Vulnerabilities ({vulnerabilities.length})
          </Button>
        </div>
        <Button
          onClick={() => { setEditing(null); setFormOpen(true); }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add {view === "threats" ? "Threat" : "Vulnerability"}
        </Button>
      </div>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <Input
                placeholder={`Search ${view}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm bg-[#0f1623] border-[#2a3548] text-white"
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full sm:w-32 h-9 text-sm bg-[#0f1623] border-[#2a3548] text-white">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-32 h-9 text-sm bg-[#0f1623] border-[#2a3548] text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="all">All Status</SelectItem>
                {view === "threats" ? (
                  <>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="monitoring">Monitoring</SelectItem>
                    <SelectItem value="mitigated">Mitigated</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="identified">Identified</SelectItem>
                    <SelectItem value="triaging">Triaging</SelectItem>
                    <SelectItem value="in_remediation">In Remediation</SelectItem>
                    <SelectItem value="remediated">Remediated</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {filteredItems.map(item => {
          const linkedControls = getLinkedControls(item);
          return (
            <Card key={item.id} className="bg-[#1a2332] border-[#2a3548] hover:border-indigo-500/40 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    {view === "threats" ? (
                      <AlertTriangle className="h-5 w-5 text-rose-400 mt-0.5" />
                    ) : (
                      <Shield className="h-5 w-5 text-amber-400 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-white mb-1">
                        {item.name || item.title}
                      </h3>
                      {item.cve_id && (
                        <p className="text-xs text-indigo-400 mb-1">{item.cve_id}</p>
                      )}
                      <p className="text-xs text-slate-400 mb-2 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge className={severityColors[item.severity]}>
                          {item.severity}
                        </Badge>
                        <Badge className="bg-slate-500/20 text-slate-400 text-[10px]">
                          {item.status}
                        </Badge>
                        {view === "threats" && item.threat_type && (
                          <Badge className="bg-indigo-500/20 text-indigo-400 text-[10px]">
                            {item.threat_type.replace(/_/g, ' ')}
                          </Badge>
                        )}
                        {view === "vulnerabilities" && item.cvss_score && (
                          <Badge className="bg-purple-500/20 text-purple-400 text-[10px]">
                            CVSS: {item.cvss_score}
                          </Badge>
                        )}
                        {linkedControls.length > 0 && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">
                            {linkedControls.length} controls
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      onClick={() => { setViewing(item); setDetailsOpen(true); }}
                      className="h-7 w-7 p-0 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => { setEditing(item); setFormOpen(true); }}
                      className="h-7 w-7 p-0 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (confirm(`Delete this ${view === "threats" ? "threat" : "vulnerability"}?`)) {
                          view === "threats" ? deleteThreatMutation.mutate(item.id) : deleteVulnMutation.mutate(item.id);
                        }
                      }}
                      className="h-7 w-7 p-0 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {linkedControls.length > 0 && (
                  <div className="pt-3 border-t border-[#2a3548]">
                    <p className="text-xs text-slate-500 mb-2">Linked Controls:</p>
                    <div className="flex flex-wrap gap-1">
                      {linkedControls.slice(0, 3).map(control => (
                        <Badge key={control.id} className="bg-emerald-500/10 text-emerald-400 text-[10px]">
                          {control.name}
                        </Badge>
                      ))}
                      {linkedControls.length > 3 && (
                        <Badge className="bg-slate-500/10 text-slate-400 text-[10px]">
                          +{linkedControls.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl bg-[#1a2332] border-[#2a3548] text-white max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{viewing?.name || viewing?.title}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            {viewing && (
              <div className="space-y-4 pr-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-500">Severity</p>
                    <Badge className={severityColors[viewing.severity]}>{viewing.severity}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Status</p>
                    <Badge className="bg-slate-500/20 text-slate-400">{viewing.status}</Badge>
                  </div>
                  {view === "threats" && (
                    <>
                      <div>
                        <p className="text-xs text-slate-500">Threat Type</p>
                        <p className="text-sm text-white">{viewing.threat_type?.replace(/_/g, ' ')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Threat Actor</p>
                        <p className="text-sm text-white">{viewing.threat_actor?.replace(/_/g, ' ') || 'Unknown'}</p>
                      </div>
                    </>
                  )}
                  {view === "vulnerabilities" && (
                    <>
                      <div>
                        <p className="text-xs text-slate-500">CVE ID</p>
                        <p className="text-sm text-white">{viewing.cve_id || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">CVSS Score</p>
                        <p className="text-sm text-white">{viewing.cvss_score || 'N/A'}</p>
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-1">Description</p>
                  <p className="text-sm text-slate-300">{viewing.description}</p>
                </div>

                {getLinkedControls(viewing).length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Linked Controls ({getLinkedControls(viewing).length})</p>
                    <div className="space-y-2">
                      {getLinkedControls(viewing).map(control => (
                        <div key={control.id} className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                          <p className="text-xs font-medium text-white">{control.name}</p>
                          <p className="text-[10px] text-slate-400">{control.domain}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}