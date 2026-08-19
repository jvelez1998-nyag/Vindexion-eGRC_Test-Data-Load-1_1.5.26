import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Network, Shield, FileCheck, Scale, Search, Link as LinkIcon, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function RiskMappingHub({ assessments = [] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: () => base44.entities.Control.list(),
  });

  const { data: compliance = [] } = useQuery({
    queryKey: ['compliance'],
    queryFn: () => base44.entities.Compliance.list(),
  });

  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: () => base44.entities.Risk.list(),
  });

  const { data: frameworks = [] } = useQuery({
    queryKey: ['framework-mappings'],
    queryFn: () => base44.entities.FrameworkMapping.list(),
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => base44.entities.Incident.list(),
  });

  const { data: audits = [] } = useQuery({
    queryKey: ['audits'],
    queryFn: () => base44.entities.Audit.list(),
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => base44.entities.Vendor.list(),
  });

  const { data: guidance = [] } = useQuery({
    queryKey: ['guidance'],
    queryFn: () => base44.entities.Guidance.list(),
  });

  const RiskControlMapping = () => {
    const mappings = assessments.map(assessment => {
      const linkedControls = controls.filter(c => 
        assessment.linked_controls?.includes(c.id)
      );
      return { assessment, controls: linkedControls };
    }).filter(m => m.controls.length > 0);

    const filteredMappings = mappings.filter(m => 
      m.assessment.assessment_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.controls.some(c => c.control_name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search risk-control mappings..."
              className="pl-9 bg-[#151d2e] border-[#2a3548] text-white"
            />
          </div>
          <Badge className="bg-blue-500/20 text-blue-400 px-3 py-1">
            {filteredMappings.length} Mappings
          </Badge>
        </div>

        <ScrollArea className="h-[600px]">
          <div className="space-y-3 pr-4">
            {filteredMappings.map((mapping, idx) => (
              <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-rose-500/10">
                      <AlertTriangle className="h-5 w-5 text-rose-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white text-sm mb-2">
                        {mapping.assessment.assessment_name || mapping.assessment.title}
                      </h4>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-rose-500/10 text-rose-400 text-xs">
                          Risk Score: {(mapping.assessment.residual_likelihood || 0) * (mapping.assessment.residual_impact || 0)}
                        </Badge>
                        <Badge className="bg-indigo-500/10 text-indigo-400 text-xs">
                          {mapping.controls.length} Controls
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {mapping.controls.map((control) => (
                          <div key={control.id} className="flex items-center gap-2 p-2 rounded bg-[#151d2e] border border-[#2a3548]">
                            <Shield className="h-4 w-4 text-blue-400" />
                            <span className="text-sm text-white flex-1">{control.control_name}</span>
                            <Badge className={`text-xs ${
                              control.effectiveness === 'effective' ? 'bg-emerald-500/10 text-emerald-400' :
                              control.effectiveness === 'partially_effective' ? 'bg-amber-500/10 text-amber-400' :
                              'bg-rose-500/10 text-rose-400'
                            }`}>
                              {control.effectiveness || 'Not Tested'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredMappings.length === 0 && (
              <div className="text-center py-12">
                <Network className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No risk-control mappings found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  };

  const RiskComplianceMapping = () => {
    const mappings = assessments.map(assessment => {
      const linkedCompliance = compliance.filter(c => 
        assessment.regulatory_mappings?.includes(c.requirement_id) ||
        c.linked_risks?.includes(assessment.id)
      );
      return { assessment, compliance: linkedCompliance };
    }).filter(m => m.compliance.length > 0);

    const filteredMappings = mappings.filter(m => 
      m.assessment.assessment_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.compliance.some(c => c.requirement_name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search risk-compliance mappings..."
              className="pl-9 bg-[#151d2e] border-[#2a3548] text-white"
            />
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-400 px-3 py-1">
            {filteredMappings.length} Mappings
          </Badge>
        </div>

        <ScrollArea className="h-[600px]">
          <div className="space-y-3 pr-4">
            {filteredMappings.map((mapping, idx) => (
              <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-rose-500/10">
                      <AlertTriangle className="h-5 w-5 text-rose-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white text-sm mb-2">
                        {mapping.assessment.assessment_name || mapping.assessment.title}
                      </h4>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-rose-500/10 text-rose-400 text-xs">
                          Risk Score: {(mapping.assessment.residual_likelihood || 0) * (mapping.assessment.residual_impact || 0)}
                        </Badge>
                        <Badge className="bg-emerald-500/10 text-emerald-400 text-xs">
                          {mapping.compliance.length} Policies
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {mapping.compliance.map((comp) => (
                          <div key={comp.id} className="flex items-center gap-2 p-2 rounded bg-[#151d2e] border border-[#2a3548]">
                            <FileCheck className="h-4 w-4 text-emerald-400" />
                            <div className="flex-1">
                              <div className="text-sm text-white">{comp.requirement_name}</div>
                              <div className="text-xs text-slate-500">{comp.framework}</div>
                            </div>
                            <Badge className={`text-xs ${
                              comp.compliance_status === 'compliant' ? 'bg-emerald-500/10 text-emerald-400' :
                              comp.compliance_status === 'partially_compliant' ? 'bg-amber-500/10 text-amber-400' :
                              'bg-rose-500/10 text-rose-400'
                            }`}>
                              {comp.compliance_status || 'Not Assessed'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredMappings.length === 0 && (
              <div className="text-center py-12">
                <FileCheck className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No risk-compliance mappings found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  };

  const RiskRegulationMapping = () => {
    const regulationMappings = guidance.map(g => {
      const linkedRisks = risks.filter(r => r.linked_guidance?.includes(g.id));
      const linkedAssessments = assessments.filter(a => a.regulatory_mappings?.includes(g.framework));
      const linkedControls = controls.filter(c => c.linked_guidance?.includes(g.id));
      
      return {
        regulation: g.framework,
        requirement: g.requirement_id,
        name: g.requirement_name,
        risks: linkedRisks,
        assessments: linkedAssessments,
        controls: linkedControls
      };
    }).filter(m => m.risks.length > 0 || m.assessments.length > 0 || m.controls.length > 0);

    const filteredMappings = regulationMappings.filter(m => 
      m.regulation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search risk-regulation mappings..."
              className="pl-9 bg-[#151d2e] border-[#2a3548] text-white"
            />
          </div>
          <Badge className="bg-indigo-500/20 text-indigo-400 px-3 py-1">
            {filteredMappings.length} Regulations
          </Badge>
        </div>

        <ScrollArea className="h-[600px]">
          <div className="space-y-3 pr-4">
            {filteredMappings.map((mapping, idx) => (
              <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-indigo-500/10">
                      <Scale className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white text-base mb-1">
                        {mapping.regulation} - {mapping.requirement}
                      </h4>
                      <p className="text-xs text-slate-400 mb-3">{mapping.name}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-rose-500/10 text-rose-400 text-xs">
                          {mapping.risks.length} Risks
                        </Badge>
                        <Badge className="bg-blue-500/10 text-blue-400 text-xs">
                          {mapping.controls.length} Controls
                        </Badge>
                        <Badge className="bg-cyan-500/10 text-cyan-400 text-xs">
                          {mapping.assessments.length} Assessments
                        </Badge>
                      </div>
                      {mapping.risks.length > 0 && (
                        <div className="space-y-1 mb-2">
                          <div className="text-xs text-slate-500">Linked Risks:</div>
                          {mapping.risks.slice(0, 3).map((risk) => (
                            <div key={risk.id} className="text-xs text-slate-300 ml-2">• {risk.risk_title}</div>
                          ))}
                          {mapping.risks.length > 3 && (
                            <div className="text-xs text-slate-500 ml-2">+ {mapping.risks.length - 3} more</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredMappings.length === 0 && (
              <div className="text-center py-12">
                <Scale className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No risk-regulation mappings found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  };

  const RiskIncidentMapping = () => {
    const mappings = incidents.map(incident => {
      const linkedRisks = risks.filter(r => incident.linked_risks?.includes(r.id));
      const linkedControls = controls.filter(c => incident.linked_controls?.includes(c.id));
      
      return { incident, risks: linkedRisks, controls: linkedControls };
    }).filter(m => m.risks.length > 0);

    const filteredMappings = mappings.filter(m => 
      m.incident.incident_title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search risk-incident mappings..."
              className="pl-9 bg-[#151d2e] border-[#2a3548] text-white"
            />
          </div>
          <Badge className="bg-orange-500/20 text-orange-400 px-3 py-1">
            {filteredMappings.length} Mappings
          </Badge>
        </div>

        <ScrollArea className="h-[600px]">
          <div className="space-y-3 pr-4">
            {filteredMappings.map((mapping, idx) => (
              <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                      <AlertTriangle className="h-5 w-5 text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white text-sm mb-2">
                        {mapping.incident.incident_title}
                      </h4>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={`text-xs ${
                          mapping.incident.severity === 'critical' ? 'bg-rose-500/10 text-rose-400' :
                          mapping.incident.severity === 'high' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          {mapping.incident.severity}
                        </Badge>
                        <Badge className="bg-rose-500/10 text-rose-400 text-xs">
                          {mapping.risks.length} Risks
                        </Badge>
                        <Badge className="bg-blue-500/10 text-blue-400 text-xs">
                          {mapping.controls.length} Controls
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {mapping.risks.map((risk) => (
                          <div key={risk.id} className="flex items-center gap-2 p-2 rounded bg-[#151d2e] border border-[#2a3548]">
                            <AlertTriangle className="h-4 w-4 text-rose-400" />
                            <span className="text-sm text-white flex-1">{risk.risk_title}</span>
                            <Badge className="text-xs bg-rose-500/10 text-rose-400">
                              Score: {(risk.residual_likelihood || 0) * (risk.residual_impact || 0)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredMappings.length === 0 && (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No risk-incident mappings found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  };

  const RiskVendorMapping = () => {
    const mappings = vendors.map(vendor => {
      const linkedRisks = risks.filter(r => vendor.linked_risks?.includes(r.id));
      const linkedControls = controls.filter(c => vendor.linked_controls?.includes(c.id));
      
      return { vendor, risks: linkedRisks, controls: linkedControls };
    }).filter(m => m.risks.length > 0);

    const filteredMappings = mappings.filter(m => 
      m.vendor.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search risk-vendor mappings..."
              className="pl-9 bg-[#151d2e] border-[#2a3548] text-white"
            />
          </div>
          <Badge className="bg-violet-500/20 text-violet-400 px-3 py-1">
            {filteredMappings.length} Mappings
          </Badge>
        </div>

        <ScrollArea className="h-[600px]">
          <div className="space-y-3 pr-4">
            {filteredMappings.map((mapping, idx) => (
              <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-violet-500/10">
                      <Shield className="h-5 w-5 text-violet-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white text-sm mb-2">
                        {mapping.vendor.vendor_name}
                      </h4>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={`text-xs ${
                          mapping.vendor.criticality === 'critical' ? 'bg-rose-500/10 text-rose-400' :
                          mapping.vendor.criticality === 'high' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {mapping.vendor.criticality}
                        </Badge>
                        <Badge className="bg-rose-500/10 text-rose-400 text-xs">
                          {mapping.risks.length} Risks
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {mapping.risks.map((risk) => (
                          <div key={risk.id} className="flex items-center gap-2 p-2 rounded bg-[#151d2e] border border-[#2a3548]">
                            <AlertTriangle className="h-4 w-4 text-rose-400" />
                            <span className="text-sm text-white flex-1">{risk.risk_title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredMappings.length === 0 && (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No risk-vendor mappings found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  };

  const FrameworkMapping = () => {
    const mappings = frameworks.map(fw => {
      const sourceRisks = risks.filter(r => r.framework === fw.source_framework);
      const targetControls = controls.filter(c => c.framework === fw.target_framework);
      
      return { framework: fw, risks: sourceRisks, controls: targetControls };
    }).filter(m => m.risks.length > 0 || m.controls.length > 0);

    const filteredMappings = mappings.filter(m => 
      m.framework.source_framework?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.framework.target_framework?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search framework mappings..."
              className="pl-9 bg-[#151d2e] border-[#2a3548] text-white"
            />
          </div>
          <Badge className="bg-purple-500/20 text-purple-400 px-3 py-1">
            {filteredMappings.length} Mappings
          </Badge>
        </div>

        <ScrollArea className="h-[600px]">
          <div className="space-y-3 pr-4">
            {filteredMappings.map((mapping, idx) => (
              <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge className="bg-purple-500/10 text-purple-400">
                      {mapping.framework.source_framework}
                    </Badge>
                    <span className="text-slate-500">→</span>
                    <Badge className="bg-indigo-500/10 text-indigo-400">
                      {mapping.framework.target_framework}
                    </Badge>
                    <Badge className="ml-auto bg-emerald-500/10 text-emerald-400">
                      {mapping.framework.coverage_percentage}% Coverage
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-slate-500 mb-2">Source Risks</div>
                      <Badge className="bg-rose-500/10 text-rose-400">{mapping.risks.length} Risks</Badge>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-2">Target Controls</div>
                      <Badge className="bg-blue-500/10 text-blue-400">{mapping.controls.length} Controls</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredMappings.length === 0 && (
              <div className="text-center py-12">
                <Network className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No framework mappings found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Network className="h-5 w-5 text-indigo-400" />
          Risk Mapping & Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="control" className="space-y-4">
          <TabsList className="bg-[#151d2e] border border-[#2a3548] flex-wrap h-auto">
            <TabsTrigger value="control" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
              <Shield className="h-4 w-4 mr-2" />
              Risk-Control
            </TabsTrigger>
            <TabsTrigger value="compliance" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              <FileCheck className="h-4 w-4 mr-2" />
              Risk-Compliance
            </TabsTrigger>
            <TabsTrigger value="regulation" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">
              <Scale className="h-4 w-4 mr-2" />
              Risk-Regulation
            </TabsTrigger>
            <TabsTrigger value="incident" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Risk-Incident
            </TabsTrigger>
            <TabsTrigger value="vendor" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400">
              <Shield className="h-4 w-4 mr-2" />
              Risk-Vendor
            </TabsTrigger>
            <TabsTrigger value="framework" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              <Network className="h-4 w-4 mr-2" />
              Framework Cross-Walk
            </TabsTrigger>
          </TabsList>

          <TabsContent value="control">
            <RiskControlMapping />
          </TabsContent>

          <TabsContent value="compliance">
            <RiskComplianceMapping />
          </TabsContent>

          <TabsContent value="regulation">
            <RiskRegulationMapping />
          </TabsContent>

          <TabsContent value="incident">
            <RiskIncidentMapping />
          </TabsContent>

          <TabsContent value="vendor">
            <RiskVendorMapping />
          </TabsContent>

          <TabsContent value="framework">
            <FrameworkMapping />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}