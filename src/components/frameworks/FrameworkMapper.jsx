import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Link2, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const frameworkRequirements = {
  ISO27001: [
    { id: "A.5.1", name: "Policies for information security", domain: "governance" },
    { id: "A.5.2", name: "Information security roles and responsibilities", domain: "governance" },
    { id: "A.8.1", name: "User endpoint devices", domain: "access_control" },
    { id: "A.8.2", name: "Privileged access rights", domain: "access_control" },
    { id: "A.8.3", name: "Information access restriction", domain: "access_control" },
    { id: "A.8.4", name: "Access to source code", domain: "access_control" },
    { id: "A.8.5", name: "Secure authentication", domain: "access_control" },
    { id: "A.9.1", name: "Configuration management", domain: "network_security" },
    { id: "A.9.2", name: "Information deletion", domain: "data_protection" },
    { id: "A.9.3", name: "Data masking", domain: "data_protection" },
    { id: "A.9.4", name: "Data leakage prevention", domain: "data_protection" },
    { id: "A.10.1", name: "Cryptographic controls", domain: "data_protection" },
    { id: "A.11.1", name: "Physical security perimeters", domain: "physical_security" },
    { id: "A.11.2", name: "Physical entry", domain: "physical_security" },
    { id: "A.12.1", name: "Event logging", domain: "network_security" },
    { id: "A.12.2", name: "Log protection", domain: "network_security" },
    { id: "A.12.3", name: "Administrator and operator logs", domain: "network_security" },
    { id: "A.13.1", name: "Network security", domain: "network_security" },
    { id: "A.13.2", name: "Security of network services", domain: "network_security" },
    { id: "A.14.1", name: "Backup", domain: "business_continuity" },
    { id: "A.15.1", name: "Incident management", domain: "incident_response" },
    { id: "A.16.1", name: "Business continuity planning", domain: "business_continuity" }
  ],
  NIST: [
    { id: "ID.AM-1", name: "Physical devices and systems inventory", domain: "asset_management" },
    { id: "ID.AM-2", name: "Software platforms inventory", domain: "asset_management" },
    { id: "ID.RA-1", name: "Asset vulnerabilities identification", domain: "risk_assessment" },
    { id: "PR.AC-1", name: "Identity and credential management", domain: "access_control" },
    { id: "PR.AC-4", name: "Least privilege", domain: "access_control" },
    { id: "PR.DS-1", name: "Data-at-rest protection", domain: "data_protection" },
    { id: "PR.DS-2", name: "Data-in-transit protection", domain: "data_protection" },
    { id: "PR.PT-1", name: "Audit logging", domain: "network_security" },
    { id: "DE.CM-1", name: "Network monitoring", domain: "network_security" },
    { id: "DE.CM-4", name: "Malware detection", domain: "network_security" },
    { id: "RS.RP-1", name: "Response plan execution", domain: "incident_response" },
    { id: "RC.RP-1", name: "Recovery plan execution", domain: "business_continuity" }
  ],
  SOC2: [
    { id: "CC1.1", name: "Control environment", domain: "governance" },
    { id: "CC2.1", name: "Communication and information", domain: "governance" },
    { id: "CC3.1", name: "Risk assessment process", domain: "risk_assessment" },
    { id: "CC6.1", name: "Logical access controls", domain: "access_control" },
    { id: "CC6.6", name: "Encryption of data", domain: "data_protection" },
    { id: "CC7.1", name: "System monitoring", domain: "network_security" },
    { id: "CC7.2", name: "Security incident detection", domain: "incident_response" },
    { id: "CC8.1", name: "Change management", domain: "network_security" },
    { id: "CC9.1", name: "Vendor management", domain: "vendor_management" },
    { id: "A1.1", name: "System availability", domain: "business_continuity" },
    { id: "C1.1", name: "Confidentiality controls", domain: "data_protection" },
    { id: "P1.1", name: "Privacy notice", domain: "privacy" }
  ]
};

export default function FrameworkMapper({ framework, controls }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [selectedControls, setSelectedControls] = useState([]);
  const [domainFilter, setDomainFilter] = useState("all");

  const queryClient = useQueryClient();

  const requirements = frameworkRequirements[framework] || [];

  const updateMappingMutation = useMutation({
    mutationFn: async ({ controlId, mapping }) => {
      const control = controls.find(c => c.id === controlId);
      const updatedMappings = { ...control.framework_mappings };
      
      if (!updatedMappings[framework]) {
        updatedMappings[framework] = [];
      }
      
      if (!updatedMappings[framework].includes(mapping)) {
        updatedMappings[framework].push(mapping);
      }

      return base44.entities.Control.update(controlId, {
        framework_mappings: updatedMappings
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['controls'] });
      toast.success("Mapping updated");
    }
  });

  const bulkMapMutation = useMutation({
    mutationFn: async () => {
      const promises = selectedControls.map(controlId => {
        const control = controls.find(c => c.id === controlId);
        const updatedMappings = { ...control.framework_mappings };
        
        if (!updatedMappings[framework]) {
          updatedMappings[framework] = [];
        }
        
        if (!updatedMappings[framework].includes(selectedRequirement.id)) {
          updatedMappings[framework].push(selectedRequirement.id);
        }

        return base44.entities.Control.update(controlId, {
          framework_mappings: updatedMappings
        });
      });

      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['controls'] });
      toast.success(`Mapped ${selectedControls.length} controls`);
      setSelectedControls([]);
      setSelectedRequirement(null);
    }
  });

  const filteredRequirements = requirements.filter(req => {
    const matchesSearch = searchQuery === "" ||
      req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDomain = domainFilter === "all" || req.domain === domainFilter;
    
    return matchesSearch && matchesDomain;
  });

  const filteredControls = controls.filter(c =>
    !selectedRequirement ||
    c.domain === selectedRequirement.domain ||
    c.category === "preventive" ||
    c.category === "detective"
  );

  const getMappedCount = (reqId) => {
    return controls.filter(c => c.framework_mappings?.[framework]?.includes(reqId)).length;
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Requirements List */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search requirements..."
                  className="pl-10 bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
              <Select value={domainFilter} onValueChange={setDomainFilter}>
                <SelectTrigger className="w-40 bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                  <SelectItem value="all">All Domains</SelectItem>
                  <SelectItem value="access_control">Access Control</SelectItem>
                  <SelectItem value="data_protection">Data Protection</SelectItem>
                  <SelectItem value="network_security">Network Security</SelectItem>
                  <SelectItem value="incident_response">Incident Response</SelectItem>
                  <SelectItem value="business_continuity">Business Continuity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <h3 className="text-sm font-semibold text-white">Framework Requirements</h3>
            <ScrollArea className="h-[600px]">
              <div className="space-y-2 pr-4">
                {filteredRequirements.map(req => {
                  const mappedCount = getMappedCount(req.id);
                  const isSelected = selectedRequirement?.id === req.id;

                  return (
                    <Card
                      key={req.id}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-500/10 border-indigo-500/50'
                          : 'bg-[#151d2e] border-[#2a3548] hover:border-[#3a4558]'
                      }`}
                      onClick={() => setSelectedRequirement(req)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white text-sm">{req.id}</h4>
                            <p className="text-xs text-slate-400 mt-1">{req.name}</p>
                          </div>
                          <Badge className={`ml-2 ${
                            mappedCount > 0
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                          }`}>
                            {mappedCount > 0 ? (
                              <><CheckCircle2 className="h-3 w-3 mr-1" /> {mappedCount}</>
                            ) : (
                              <><XCircle className="h-3 w-3 mr-1" /> 0</>
                            )}
                          </Badge>
                        </div>
                        <Badge className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/20">
                          {req.domain}
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Controls Mapping */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardContent className="p-6">
          {!selectedRequirement ? (
            <div className="text-center py-12">
              <Link2 className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Select a requirement to map controls</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-1">{selectedRequirement.id}</h3>
                <p className="text-sm text-slate-400 mb-2">{selectedRequirement.name}</p>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {selectedRequirement.domain}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white">
                  Available Controls ({selectedControls.length} selected)
                </h4>
                <Button
                  onClick={() => bulkMapMutation.mutate()}
                  disabled={selectedControls.length === 0 || bulkMapMutation.isPending}
                  size="sm"
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-500/20"
                >
                  {bulkMapMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Link2 className="h-4 w-4 mr-2" />
                  )}
                  Map Selected
                </Button>
              </div>

              <ScrollArea className="h-[500px]">
                <div className="space-y-2 pr-4">
                  {filteredControls.map(control => {
                    const isAlreadyMapped = control.framework_mappings?.[framework]?.includes(selectedRequirement.id);
                    const isSelected = selectedControls.includes(control.id);

                    return (
                      <Card
                        key={control.id}
                        className={`${
                          isAlreadyMapped
                            ? 'bg-emerald-500/5 border-emerald-500/30'
                            : isSelected
                            ? 'bg-indigo-500/10 border-indigo-500/50'
                            : 'bg-[#151d2e] border-[#2a3548]'
                        }`}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedControls(prev => [...prev, control.id]);
                                } else {
                                  setSelectedControls(prev => prev.filter(id => id !== control.id));
                                }
                              }}
                              disabled={isAlreadyMapped}
                            />
                            <div className="flex-1">
                              <h5 className="text-sm font-medium text-white">{control.name}</h5>
                              <p className="text-xs text-slate-400 mt-1">{control.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className="text-[10px] bg-slate-500/10 text-slate-400 border-slate-500/20">
                                  {control.domain}
                                </Badge>
                                {isAlreadyMapped && (
                                  <Badge className="text-[10px] bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Mapped
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}