import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, Shield, Plus, Download, Filter, BookOpen, 
  CheckCircle2, AlertTriangle, Link as LinkIcon, TrendingUp,
  Grid3x3, List, Eye, Network, ChevronRight
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ControlLibraryHub({ onImportControl }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");
  const [frameworkFilter, setFrameworkFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedControl, setSelectedControl] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [linkingMode, setLinkingMode] = useState(false);
  const [selectedForLinking, setSelectedForLinking] = useState([]);

  const queryClient = useQueryClient();

  const { data: controlLibrary = [], isLoading } = useQuery({
    queryKey: ['control-library'],
    queryFn: () => base44.entities.ControlLibrary.list(null, 200),
    staleTime: 600000
  });

  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: () => base44.entities.Risk.list('-updated_date', 100)
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => base44.entities.Incident.list('-updated_date', 100)
  });

  const { data: compliance = [] } = useQuery({
    queryKey: ['compliance'],
    queryFn: () => base44.entities.Compliance.list('-updated_date', 100)
  });

  const filteredLibrary = useMemo(() => {
    return controlLibrary.filter(control => {
      const matchesSearch = !search || 
        control.name?.toLowerCase().includes(search.toLowerCase()) ||
        control.description?.toLowerCase().includes(search.toLowerCase()) ||
        control.control_id?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "all" || control.control_type === categoryFilter;
      const matchesDomain = domainFilter === "all" || control.domain === domainFilter;
      const matchesFramework = frameworkFilter === "all" || 
        control.regulatory_mappings?.includes(frameworkFilter);
      return matchesSearch && matchesCategory && matchesDomain && matchesFramework;
    });
  }, [controlLibrary, search, categoryFilter, domainFilter, frameworkFilter]);

  const categories = {
    preventive: filteredLibrary.filter(c => c.control_type === 'preventive').length,
    detective: filteredLibrary.filter(c => c.control_type === 'detective').length,
    corrective: filteredLibrary.filter(c => c.control_type === 'corrective').length,
    directive: filteredLibrary.filter(c => c.control_type === 'directive').length,
    compensating: filteredLibrary.filter(c => c.control_type === 'compensating').length
  };

  const getLinkedEntities = (control) => {
    const linkedRisks = risks.filter(r => 
      r.linked_controls?.includes(control.control_id) || 
      r.category === control.domain
    );
    const linkedIncidents = incidents.filter(i => 
      i.linked_controls?.includes(control.control_id)
    );
    const linkedCompliance = compliance.filter(c => 
      c.linked_controls?.includes(control.control_id)
    );

    return { linkedRisks, linkedIncidents, linkedCompliance };
  };

  const exportLibrary = () => {
    const data = filteredLibrary.map(c => ({
      'Control ID': c.control_id,
      'Name': c.name,
      'Type': c.control_type,
      'Nature': c.control_nature,
      'Frequency': c.control_frequency,
      'Domain': c.domain,
      'Owner': c.owner,
      'Status': c.status,
      'Description': c.description,
      'Testing Procedure': c.testing_procedure,
      'Evidence Required': c.evidence_required,
      'Regulatory Mappings': c.regulatory_mappings?.join('; ')
    }));
    const csv = [Object.keys(data[0] || {}).join(','), ...data.map(row => Object.values(row).map(v => `"${v || ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `control-library-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success("Library exported");
  };

  const categoryColors = {
    preventive: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    detective: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30',
    corrective: 'from-emerald-500/20 to-green-500/20 border-emerald-500/30',
    directive: 'from-violet-500/20 to-purple-500/20 border-violet-500/30',
    compensating: 'from-pink-500/20 to-rose-500/20 border-pink-500/30'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <BookOpen className="h-7 w-7 text-indigo-400" />
              Centralized Control Library
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Industry-standard controls, frameworks, and best practices
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-3xl font-bold text-indigo-400">{controlLibrary.length}</div>
              <div className="text-xs text-slate-400">Controls</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Category Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.entries(categories).map(([type, count]) => (
          <Card 
            key={type}
            className={`bg-gradient-to-br ${categoryColors[type]} cursor-pointer hover:scale-105 transition-transform`}
            onClick={() => setCategoryFilter(categoryFilter === type ? 'all' : type)}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">{count}</div>
              <div className="text-xs text-slate-300 capitalize">{type}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filters */}
      <Card className="bg-[#1a2332] border-[#2a3548] p-5">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="h-5 w-5 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Search & Filter</h3>
          {(search || categoryFilter !== 'all' || domainFilter !== 'all' || frameworkFilter !== 'all') && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => {
                setSearch('');
                setCategoryFilter('all');
                setDomainFilter('all');
                setFrameworkFilter('all');
              }}
              className="h-7 text-xs text-slate-400 hover:text-white ml-auto"
            >
              Clear
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input 
              placeholder="Search by ID, name, description..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-[#0f1623] border-[#2a3548] text-white placeholder:text-slate-500"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white">
              <SelectValue placeholder="Control Type" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2332] border-[#2a3548]">
              <SelectItem value="all" className="text-white">All Types</SelectItem>
              <SelectItem value="preventive" className="text-white">Preventive</SelectItem>
              <SelectItem value="detective" className="text-white">Detective</SelectItem>
              <SelectItem value="corrective" className="text-white">Corrective</SelectItem>
              <SelectItem value="directive" className="text-white">Directive</SelectItem>
              <SelectItem value="compensating" className="text-white">Compensating</SelectItem>
            </SelectContent>
          </Select>
          <Select value={domainFilter} onValueChange={setDomainFilter}>
            <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white">
              <SelectValue placeholder="Domain" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2332] border-[#2a3548]">
              <SelectItem value="all" className="text-white">All Domains</SelectItem>
              <SelectItem value="access_control" className="text-white">Access Control</SelectItem>
              <SelectItem value="data_protection" className="text-white">Data Protection</SelectItem>
              <SelectItem value="network_security" className="text-white">Network Security</SelectItem>
              <SelectItem value="change_management" className="text-white">Change Management</SelectItem>
              <SelectItem value="incident_response" className="text-white">Incident Response</SelectItem>
              <SelectItem value="business_continuity" className="text-white">Business Continuity</SelectItem>
              <SelectItem value="vendor_management" className="text-white">Vendor Management</SelectItem>
              <SelectItem value="physical_security" className="text-white">Physical Security</SelectItem>
              <SelectItem value="hr_security" className="text-white">HR Security</SelectItem>
              <SelectItem value="asset_management" className="text-white">Asset Management</SelectItem>
            </SelectContent>
          </Select>
          <Select value={frameworkFilter} onValueChange={setFrameworkFilter}>
            <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white">
              <SelectValue placeholder="Framework" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2332] border-[#2a3548]">
              <SelectItem value="all" className="text-white">All Frameworks</SelectItem>
              <SelectItem value="SOX" className="text-white">SOX</SelectItem>
              <SelectItem value="SOC2" className="text-white">SOC2</SelectItem>
              <SelectItem value="ISO27001" className="text-white">ISO 27001</SelectItem>
              <SelectItem value="NIST" className="text-white">NIST CSF</SelectItem>
              <SelectItem value="COBIT" className="text-white">COBIT</SelectItem>
              <SelectItem value="COSO" className="text-white">COSO</SelectItem>
              <SelectItem value="PCI-DSS" className="text-white">PCI-DSS</SelectItem>
              <SelectItem value="HIPAA" className="text-white">HIPAA</SelectItem>
              <SelectItem value="GDPR" className="text-white">GDPR</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#2a3548]">
          <span className="text-sm text-slate-400">
            Showing {filteredLibrary.length} of {controlLibrary.length} controls
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={exportLibrary} variant="outline" className="h-8 gap-2 border-[#2a3548] text-slate-400 hover:text-white">
              <Download className="h-3 w-3" />
              Export
            </Button>
            <Tabs value={viewMode} onValueChange={setViewMode}>
              <TabsList className="h-8 bg-[#0f1623] border border-[#2a3548]">
                <TabsTrigger value="grid" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">
                  <Grid3x3 className="h-3 w-3" />
                </TabsTrigger>
                <TabsTrigger value="list" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">
                  <List className="h-3 w-3" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </Card>

      {/* Controls Grid/List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
        </div>
      ) : filteredLibrary.length === 0 ? (
        <Card className="bg-[#1a2332] border-[#2a3548] p-12 text-center">
          <Shield className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No controls found</h3>
          <p className="text-slate-400 text-sm">Try adjusting your filters</p>
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {filteredLibrary.map(control => {
            const { linkedRisks, linkedIncidents, linkedCompliance } = getLinkedEntities(control);
            const totalLinks = linkedRisks.length + linkedIncidents.length + linkedCompliance.length;

            return (
              <Card 
                key={control.id}
                className="bg-[#1a2332] border-[#2a3548] hover:border-indigo-500/40 transition-all cursor-pointer group"
                onClick={() => {
                  setSelectedControl(control);
                  setDetailOpen(true);
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20 text-[10px]">
                          {control.control_id}
                        </Badge>
                        {control.status === 'active' && (
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        )}
                      </div>
                      <CardTitle className="text-base text-white group-hover:text-indigo-400 transition-colors">
                        {control.name}
                      </CardTitle>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-400 line-clamp-2">{control.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/20 capitalize">
                      {control.control_type}
                    </Badge>
                    <Badge className="text-[10px] bg-violet-500/10 text-violet-400 border-violet-500/20">
                      {control.domain?.replace(/_/g, ' ')}
                    </Badge>
                    {control.control_nature && (
                      <Badge className="text-[10px] bg-cyan-500/10 text-cyan-400 border-cyan-500/20 capitalize">
                        {control.control_nature}
                      </Badge>
                    )}
                  </div>

                  {control.regulatory_mappings && control.regulatory_mappings.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {control.regulatory_mappings.slice(0, 3).map((framework, idx) => (
                        <Badge key={idx} className="text-[10px] bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                          {framework}
                        </Badge>
                      ))}
                      {control.regulatory_mappings.length > 3 && (
                        <Badge className="text-[10px] bg-slate-500/10 text-slate-400 border-slate-500/20">
                          +{control.regulatory_mappings.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {totalLinks > 0 && (
                    <div className="flex items-center gap-2 pt-2 border-t border-[#2a3548]">
                      <LinkIcon className="h-3 w-3 text-emerald-400" />
                      <span className="text-xs text-emerald-400">
                        {linkedRisks.length} risk{linkedRisks.length !== 1 ? 's' : ''}, {linkedIncidents.length} incident{linkedIncidents.length !== 1 ? 's' : ''}, {linkedCompliance.length} requirement{linkedCompliance.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Control Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white overflow-y-auto">
          {selectedControl && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20 text-xs mb-2">
                      {selectedControl.control_id}
                    </Badge>
                    <DialogTitle className="text-2xl">{selectedControl.name}</DialogTitle>
                    <DialogDescription className="text-slate-400 mt-2">
                      {selectedControl.description}
                    </DialogDescription>
                  </div>
                  {onImportControl && (
                    <Button 
                      onClick={() => {
                        onImportControl(selectedControl);
                        setDetailOpen(false);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Import to Controls
                    </Button>
                  )}
                </div>
              </DialogHeader>

              <Tabs defaultValue="details" className="mt-6">
                <TabsList className="bg-[#0f1623] border border-[#2a3548]">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="testing">Testing</TabsTrigger>
                  <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
                  <TabsTrigger value="links">Linked Entities</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Control Type</div>
                      <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 capitalize">
                        {selectedControl.control_type}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Domain</div>
                      <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20">
                        {selectedControl.domain?.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    {selectedControl.control_nature && (
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Nature</div>
                        <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 capitalize">
                          {selectedControl.control_nature}
                        </Badge>
                      </div>
                    )}
                    {selectedControl.control_frequency && (
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Frequency</div>
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 capitalize">
                          {selectedControl.control_frequency}
                        </Badge>
                      </div>
                    )}
                  </div>
                  {selectedControl.owner && (
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Owner</div>
                      <p className="text-sm text-white">{selectedControl.owner}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="testing" className="space-y-4 mt-4">
                  {selectedControl.testing_procedure && (
                    <div>
                      <div className="text-xs text-slate-500 mb-2">Testing Procedure</div>
                      <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                        <p className="text-sm text-slate-300 whitespace-pre-wrap">{selectedControl.testing_procedure}</p>
                      </Card>
                    </div>
                  )}
                  {selectedControl.evidence_required && (
                    <div>
                      <div className="text-xs text-slate-500 mb-2">Evidence Required</div>
                      <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                        <p className="text-sm text-slate-300 whitespace-pre-wrap">{selectedControl.evidence_required}</p>
                      </Card>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="frameworks" className="mt-4">
                  {selectedControl.regulatory_mappings && selectedControl.regulatory_mappings.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedControl.regulatory_mappings.map((framework, idx) => (
                        <Badge key={idx} className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                          {framework}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">No framework mappings</p>
                  )}
                </TabsContent>

                <TabsContent value="links" className="mt-4 space-y-4">
                  {(() => {
                    const { linkedRisks, linkedIncidents, linkedCompliance } = getLinkedEntities(selectedControl);
                    return (
                      <>
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-400" />
                            Linked Risks ({linkedRisks.length})
                          </h4>
                          {linkedRisks.length > 0 ? (
                            <div className="space-y-2">
                              {linkedRisks.map(risk => (
                                <Card key={risk.id} className="bg-[#151d2e] border-[#2a3548] p-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-white">{risk.title}</span>
                                    <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">
                                      {risk.category}
                                    </Badge>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500">No linked risks</p>
                          )}
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-rose-400" />
                            Linked Incidents ({linkedIncidents.length})
                          </h4>
                          {linkedIncidents.length > 0 ? (
                            <div className="space-y-2">
                              {linkedIncidents.map(incident => (
                                <Card key={incident.id} className="bg-[#151d2e] border-[#2a3548] p-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-white">{incident.title}</span>
                                    <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[10px]">
                                      {incident.severity}
                                    </Badge>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500">No linked incidents</p>
                          )}
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            Linked Compliance ({linkedCompliance.length})
                          </h4>
                          {linkedCompliance.length > 0 ? (
                            <div className="space-y-2">
                              {linkedCompliance.map(comp => (
                                <Card key={comp.id} className="bg-[#151d2e] border-[#2a3548] p-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-white">{comp.requirement}</span>
                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                                      {comp.framework}
                                    </Badge>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500">No linked compliance requirements</p>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}