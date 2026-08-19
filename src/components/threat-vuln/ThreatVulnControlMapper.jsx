import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Link as LinkIcon, Shield, AlertTriangle, X, CheckCircle2, Loader2, Brain } from "lucide-react";
import { toast } from "sonner";

export default function ThreatVulnControlMapper() {
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [selectedVuln, setSelectedVuln] = useState(null);
  const [searchControl, setSearchControl] = useState("");
  const [generatingMappings, setGeneratingMappings] = useState(false);

  const queryClient = useQueryClient();

  const { data: threats = [] } = useQuery({
    queryKey: ['threats'],
    queryFn: () => base44.entities.Threat.list('-updated_date', 50)
  });

  const { data: vulnerabilities = [] } = useQuery({
    queryKey: ['vulnerabilities'],
    queryFn: () => base44.entities.Vulnerability.list('-updated_date', 50)
  });

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: () => base44.entities.Control.list('-updated_date', 100)
  });

  const updateThreatMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Threat.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threats'] });
      toast.success("Threat mapping updated");
    }
  });

  const updateVulnMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Vulnerability.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vulnerabilities'] });
      toast.success("Vulnerability mapping updated");
    }
  });

  const linkControlToThreat = (controlId) => {
    if (!selectedThreat) return;
    const linkedControls = selectedThreat.linked_controls || [];
    if (!linkedControls.includes(controlId)) {
      updateThreatMutation.mutate({
        id: selectedThreat.id,
        data: {
          linked_controls: [...linkedControls, controlId]
        }
      });
    }
  };

  const unlinkControlFromThreat = (controlId) => {
    if (!selectedThreat) return;
    const linkedControls = selectedThreat.linked_controls || [];
    updateThreatMutation.mutate({
      id: selectedThreat.id,
      data: {
        linked_controls: linkedControls.filter(id => id !== controlId)
      }
    });
  };

  const linkControlToVuln = (controlId) => {
    if (!selectedVuln) return;
    const linkedControls = selectedVuln.linked_controls || [];
    if (!linkedControls.includes(controlId)) {
      updateVulnMutation.mutate({
        id: selectedVuln.id,
        data: {
          linked_controls: [...linkedControls, controlId]
        }
      });
    }
  };

  const unlinkControlFromVuln = (controlId) => {
    if (!selectedVuln) return;
    const linkedControls = selectedVuln.linked_controls || [];
    updateVulnMutation.mutate({
      id: selectedVuln.id,
      data: {
        linked_controls: linkedControls.filter(id => id !== controlId)
      }
    });
  };

  const generateAIMappings = async () => {
    if (!selectedThreat && !selectedVuln) return;
    
    setGeneratingMappings(true);
    try {
      const item = selectedThreat || selectedVuln;
      const itemType = selectedThreat ? 'threat' : 'vulnerability';
      
      const prompt = `Analyze this ${itemType} and recommend the most relevant controls from the control library:

${itemType.toUpperCase()}:
${JSON.stringify(item, null, 2)}

CONTROL LIBRARY:
${controls.slice(0, 20).map(c => `- ${c.name} (${c.domain}): ${c.description?.substring(0, 100)}`).join('\n')}

Return a JSON array of control IDs that would best address this ${itemType}. Format: ["control_id_1", "control_id_2", ...]`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            control_ids: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      const controlIds = response.control_ids || [];
      if (selectedThreat) {
        updateThreatMutation.mutate({
          id: selectedThreat.id,
          data: {
            linked_controls: [...new Set([...(selectedThreat.linked_controls || []), ...controlIds])]
          }
        });
      } else {
        updateVulnMutation.mutate({
          id: selectedVuln.id,
          data: {
            linked_controls: [...new Set([...(selectedVuln.linked_controls || []), ...controlIds])]
          }
        });
      }
      
      toast.success("AI mappings generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate mappings");
    } finally {
      setGeneratingMappings(false);
    }
  };

  const filteredControls = controls.filter(c => 
    c.name?.toLowerCase().includes(searchControl.toLowerCase()) ||
    c.domain?.toLowerCase().includes(searchControl.toLowerCase())
  );

  const selectedItem = selectedThreat || selectedVuln;
  const linkedControlIds = selectedItem?.linked_controls || [];
  const linkedControls = controls.filter(c => linkedControlIds.includes(c.id));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Threats & Vulnerabilities */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-white">Threats & Vulnerabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-3">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-rose-400 mb-1">THREATS ({threats.length})</div>
              {threats.map(threat => (
                <div
                  key={threat.id}
                  onClick={() => { setSelectedThreat(threat); setSelectedVuln(null); }}
                  className={`p-2 rounded-lg border cursor-pointer transition-all ${
                    selectedThreat?.id === threat.id
                      ? 'bg-rose-500/20 border-rose-500/40'
                      : 'bg-[#0f1623] border-[#2a3548] hover:border-rose-500/30'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-3 w-3 text-rose-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{threat.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge className="text-[9px] bg-rose-500/20 text-rose-400">{threat.severity}</Badge>
                        <span className="text-[9px] text-slate-500">
                          {(threat.linked_controls || []).length} controls
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="text-xs font-semibold text-amber-400 mb-1 mt-4">VULNERABILITIES ({vulnerabilities.length})</div>
              {vulnerabilities.map(vuln => (
                <div
                  key={vuln.id}
                  onClick={() => { setSelectedVuln(vuln); setSelectedThreat(null); }}
                  className={`p-2 rounded-lg border cursor-pointer transition-all ${
                    selectedVuln?.id === vuln.id
                      ? 'bg-amber-500/20 border-amber-500/40'
                      : 'bg-[#0f1623] border-[#2a3548] hover:border-amber-500/30'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Shield className="h-3 w-3 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{vuln.title}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge className="text-[9px] bg-amber-500/20 text-amber-400">{vuln.severity}</Badge>
                        {vuln.cve_id && (
                          <span className="text-[9px] text-slate-500">{vuln.cve_id}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Control Library */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-white">Control Library</CardTitle>
          <div className="mt-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500" />
              <Input
                value={searchControl}
                onChange={(e) => setSearchControl(e.target.value)}
                placeholder="Search controls..."
                className="pl-7 h-8 text-xs bg-[#0f1623] border-[#2a3548] text-white"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedItem ? (
            <div className="flex flex-col items-center justify-center h-[600px] text-center">
              <Shield className="h-12 w-12 text-slate-600 mb-3" />
              <p className="text-sm text-slate-400">Select a threat or vulnerability to map controls</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-3">
              <div className="space-y-1.5">
                {filteredControls.map(control => {
                  const isLinked = linkedControlIds.includes(control.id);
                  return (
                    <div
                      key={control.id}
                      className={`p-2 rounded-lg border transition-all ${
                        isLinked
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : 'bg-[#0f1623] border-[#2a3548]'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white">{control.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{control.domain}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            if (isLinked) {
                              selectedThreat ? unlinkControlFromThreat(control.id) : unlinkControlFromVuln(control.id);
                            } else {
                              selectedThreat ? linkControlToThreat(control.id) : linkControlToVuln(control.id);
                            }
                          }}
                          className={`h-6 w-6 p-0 ${
                            isLinked
                              ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400'
                              : 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400'
                          }`}
                        >
                          {isLinked ? <X className="h-3 w-3" /> : <LinkIcon className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Mapped Controls */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-white">Mapped Controls</CardTitle>
            {selectedItem && (
              <Button
                size="sm"
                onClick={generateAIMappings}
                disabled={generatingMappings}
                className="h-7 text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {generatingMappings ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <Brain className="h-3 w-3 mr-1" />
                    AI Suggest
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!selectedItem ? (
            <div className="flex flex-col items-center justify-center h-[600px] text-center">
              <CheckCircle2 className="h-12 w-12 text-slate-600 mb-3" />
              <p className="text-sm text-slate-400">Mapped controls will appear here</p>
            </div>
          ) : linkedControls.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[600px] text-center">
              <LinkIcon className="h-12 w-12 text-slate-600 mb-3" />
              <p className="text-sm text-slate-400">No controls mapped yet</p>
              <Button
                size="sm"
                onClick={generateAIMappings}
                disabled={generatingMappings}
                className="mt-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                <Brain className="h-3 w-3 mr-1" />
                Generate AI Suggestions
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-3">
              <div className="space-y-2">
                {linkedControls.map(control => (
                  <div
                    key={control.id}
                    className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          <p className="text-xs font-medium text-white">{control.name}</p>
                        </div>
                        <p className="text-[10px] text-slate-400">{control.description?.substring(0, 100)}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => selectedThreat ? unlinkControlFromThreat(control.id) : unlinkControlFromVuln(control.id)}
                        className="h-6 w-6 p-0 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="text-[9px] bg-indigo-500/20 text-indigo-400">{control.domain}</Badge>
                      <Badge className="text-[9px] bg-slate-500/20 text-slate-400">{control.category}</Badge>
                      {control.effectiveness && (
                        <span className="text-[9px] text-slate-500">Effectiveness: {control.effectiveness}/5</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}