import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Network, Shield, FileCheck, Scale, Search, Link as LinkIcon, AlertTriangle, TrendingUp, Download, Filter, ExternalLink, Users, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Progress } from "@/components/ui/progress";

export default function RiskMappingHubOverhauled({ assessments = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMapping, setSelectedMapping] = useState(null);

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

  const MappingCard = ({ icon: Icon, title, count, color, onClick, children }) => (
    <Card 
      className={`bg-gradient-to-br ${color} border-none cursor-pointer hover:scale-105 transition-all`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-white/10 backdrop-blur-sm`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="text-3xl font-bold text-white">{count}</div>
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
        {children}
      </CardContent>
    </Card>
  );

  const RiskControlMapping = () => {
    const mappings = risks.map(risk => {
      const linkedControls = controls.filter(c => 
        risk.linked_controls?.includes(c.id) || c.linked_risks?.includes(risk.id)
      );
      const linkedAssessments = assessments.filter(a => 
        a.linked_risks?.includes(risk.id)
      );
      
      const controlEffectiveness = linkedControls.length > 0 
        ? Math.round(linkedControls.reduce((sum, c) => 
            sum + (c.effectiveness === 'effective' ? 100 : c.effectiveness === 'partially_effective' ? 50 : 0), 0
          ) / linkedControls.length)
        : 0;
      
      return { 
        risk, 
        controls: linkedControls, 
        assessments: linkedAssessments,
        effectiveness: controlEffectiveness 
      };
    }).filter(m => m.controls.length > 0);

    const filteredMappings = mappings.filter(m => 
      m.risk.risk_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.controls.some(c => c.control_name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const avgCoverage = mappings.length > 0 
      ? Math.round(mappings.reduce((sum, m) => sum + (m.controls.length > 0 ? 100 : 0), 0) / mappings.length)
      : 0;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white mb-1">{filteredMappings.length}</div>
              <div className="text-xs text-slate-400">Risk-Control Mappings</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white mb-1">{avgCoverage}%</div>
              <div className="text-xs text-slate-400">Avg Control Coverage</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white mb-1">
                {mappings.filter(m => m.effectiveness < 50).length}
              </div>
              <div className="text-xs text-slate-400">Gaps Identified</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white mb-1">
                {controls.reduce((sum, c) => sum + (c.linked_risks?.length || 0), 0)}
              </div>
              <div className="text-xs text-slate-400">Total Relationships</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search risks and controls..."
                className="pl-9 bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>
          </CardContent>
        </Card>

        <ScrollArea className="h-[600px]">
          <div className="space-y-3 pr-4">
            {filteredMappings.map((mapping, idx) => (
              <Card key={idx} className="bg-[#1a2332] border-[#2a3548] hover:border-blue-500/40 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 border border-rose-500/30">
                      <AlertTriangle className="h-5 w-5 text-rose-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white text-base mb-2">{mapping.risk.risk_title}</h4>
                          <p className="text-sm text-slate-400 mb-3 line-clamp-2">{mapping.risk.description}</p>
                        </div>
                        <Badge className={`ml-4 ${
                          mapping.effectiveness >= 75 ? 'bg-emerald-500/20 text-emerald-400' :
                          mapping.effectiveness >= 50 ? 'bg-amber-500/20 text-amber-400' :
                          'bg-rose-500/20 text-rose-400'
                        }`}>
                          {mapping.effectiveness}% Effective
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                          <div className="text-xs text-slate-500 mb-1">Risk Score</div>
                          <div className="text-lg font-bold text-white">
                            {(mapping.risk.residual_likelihood || 0) * (mapping.risk.residual_impact || 0)}
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                          <div className="text-xs text-slate-500 mb-1">Controls</div>
                          <div className="text-lg font-bold text-blue-400">{mapping.controls.length}</div>
                        </div>
                        <div className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                          <div className="text-xs text-slate-500 mb-1">Assessments</div>
                          <div className="text-lg font-bold text-cyan-400">{mapping.assessments.length}</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-slate-400 mb-2">Linked Controls:</div>
                        {mapping.controls.map((control) => (
                          <div key={control.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#151d2e] border border-[#2a3548] hover:border-blue-500/40 transition-all group">
                            <Shield className="h-4 w-4 text-blue-400" />
                            <div className="flex-1">
                              <div className="text-sm text-white font-medium">{control.control_name}</div>
                              <div className="text-xs text-slate-500">{control.control_type} • {control.frequency}</div>
                            </div>
                            <Badge className={`text-xs ${
                              control.effectiveness === 'effective' ? 'bg-emerald-500/10 text-emerald-400' :
                              control.effectiveness === 'partially_effective' ? 'bg-amber-500/10 text-amber-400' :
                              'bg-rose-500/10 text-rose-400'
                            }`}>
                              {control.effectiveness || 'Not Tested'}
                            </Badge>
                            <ExternalLink className="h-4 w-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredMappings.length === 0 && (
              <Card className="bg-[#1a2332] border-[#2a3548]">
                <CardContent className="p-12 text-center">
                  <Network className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No risk-control mappings found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  };

  const RiskComplianceMapping = () => {
    const mappings = risks.map(risk => {
      const linkedCompliance = compliance.filter(c => 
        risk.linked_compliance?.includes(c.id) || c.linked_risks?.includes(risk.id)
      );
      const linkedControls = controls.filter(c => risk.linked_controls?.includes(c.id));
      
      return { risk, compliance: linkedCompliance, controls: linkedControls };
    }).filter(m => m.compliance.length > 0);

    const filteredMappings = mappings.filter(m => 
      m.risk.risk_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.compliance.some(c => c.requirement_name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const complianceRate = mappings.length > 0
      ? Math.round(mappings.filter(m => 
          m.compliance.every(c => c.compliance_status === 'compliant')
        ).length / mappings.length * 100)
      : 0;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white mb-1">{filteredMappings.length}</div>
              <div className="text-xs text-slate-400">Risk-Compliance Mappings</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white mb-1">{complianceRate}%</div>
              <div className="text-xs text-slate-400">Compliance Rate</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white mb-1">
                {mappings.filter(m => m.compliance.some(c => c.compliance_status === 'non_compliant')).length}
              </div>
              <div className="text-xs text-slate-400">Non-Compliant Risks</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white mb-1">
                {compliance.reduce((sum, c) => sum + (c.linked_risks?.length || 0), 0)}
              </div>
              <div className="text-xs text-slate-400">Total Relationships</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search risks and compliance policies..."
                className="pl-9 bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>
          </CardContent>
        </Card>

        <ScrollArea className="h-[600px]">
          <div className="space-y-3 pr-4">
            {filteredMappings.map((mapping, idx) => (
              <Card key={idx} className="bg-[#1a2332] border-[#2a3548] hover:border-emerald-500/40 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 border border-rose-500/30">
                      <AlertTriangle className="h-5 w-5 text-rose-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white text-base mb-3">{mapping.risk.risk_title}</h4>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <Badge className="bg-rose-500/10 text-rose-400">
                          Risk Score: {(mapping.risk.residual_likelihood || 0) * (mapping.risk.residual_impact || 0)}
                        </Badge>
                        <Badge className="bg-emerald-500/10 text-emerald-400">
                          {mapping.compliance.length} Policies
                        </Badge>
                        <Badge className="bg-blue-500/10 text-blue-400">
                          {mapping.controls.length} Controls
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-slate-400 mb-2">Compliance Requirements:</div>
                        {mapping.compliance.map((comp) => (
                          <div key={comp.id} className="flex items-start gap-3 p-3 rounded-lg bg-[#151d2e] border border-[#2a3548] hover:border-emerald-500/40 transition-all group">
                            <FileCheck className="h-4 w-4 text-emerald-400 mt-1" />
                            <div className="flex-1">
                              <div className="text-sm text-white font-medium mb-1">{comp.requirement_name}</div>
                              <div className="text-xs text-slate-500 mb-2">{comp.framework} • {comp.requirement_id}</div>
                              {comp.description && (
                                <p className="text-xs text-slate-400 line-clamp-2">{comp.description}</p>
                              )}
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
              <Card className="bg-[#1a2332] border-[#2a3548]">
                <CardContent className="p-12 text-center">
                  <FileCheck className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No risk-compliance mappings found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  };

  const RiskRegulationMapping = () => {
    const regulationMappings = guidance.map(g => {
      const linkedRisks = risks.filter(r => r.linked_guidance?.includes(g.id));
      const linkedControls = controls.filter(c => c.linked_guidance?.includes(g.id));
      const linkedCompliance = compliance.filter(c => c.framework === g.framework);
      
      return {
        guidance: g,
        risks: linkedRisks,
        controls: linkedControls,
        compliance: linkedCompliance
      };
    }).filter(m => m.risks.length > 0 || m.controls.length > 0);

    const filteredMappings = regulationMappings.filter(m => 
      m.guidance.framework?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.guidance.requirement_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const frameworkCount = new Set(guidance.map(g => g.framework)).size;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white mb-1">{filteredMappings.length}</div>
              <div className="text-xs text-slate-400">Regulatory Mappings</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border-violet-500/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white mb-1">{frameworkCount}</div>
              <div className="text-xs text-slate-400">Frameworks Tracked</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white mb-1">
                {regulationMappings.reduce((sum, m) => sum + m.risks.length, 0)}
              </div>
              <div className="text-xs text-slate-400">Risks Mapped</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white mb-1">
                {regulationMappings.reduce((sum, m) => sum + m.controls.length, 0)}
              </div>
              <div className="text-xs text-slate-400">Controls Mapped</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search regulations and requirements..."
                className="pl-9 bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>
          </CardContent>
        </Card>

        <ScrollArea className="h-[600px]">
          <div className="space-y-3 pr-4">
            {filteredMappings.map((mapping, idx) => (
              <Card key={idx} className="bg-[#1a2332] border-[#2a3548] hover:border-indigo-500/40 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                      <Scale className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Badge className="bg-indigo-500/20 text-indigo-400 mb-2">
                            {mapping.guidance.framework}
                          </Badge>
                          <h4 className="font-semibold text-white text-base mb-1">
                            {mapping.guidance.requirement_id}
                          </h4>
                          <p className="text-sm text-slate-400">{mapping.guidance.requirement_name}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 my-4">
                        <div className="p-2 rounded bg-[#151d2e] border border-[#2a3548] text-center">
                          <div className="text-lg font-bold text-rose-400">{mapping.risks.length}</div>
                          <div className="text-xs text-slate-500">Risks</div>
                        </div>
                        <div className="p-2 rounded bg-[#151d2e] border border-[#2a3548] text-center">
                          <div className="text-lg font-bold text-blue-400">{mapping.controls.length}</div>
                          <div className="text-xs text-slate-500">Controls</div>
                        </div>
                        <div className="p-2 rounded bg-[#151d2e] border border-[#2a3548] text-center">
                          <div className="text-lg font-bold text-emerald-400">{mapping.compliance.length}</div>
                          <div className="text-xs text-slate-500">Policies</div>
                        </div>
                      </div>

                      {mapping.risks.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs font-semibold text-slate-400 mb-2">Top Risks:</div>
                          <div className="space-y-1">
                            {mapping.risks.slice(0, 3).map((risk) => (
                              <div key={risk.id} className="flex items-center gap-2 text-sm text-slate-300 p-2 rounded bg-[#151d2e]">
                                <AlertTriangle className="h-3 w-3 text-rose-400" />
                                <span className="flex-1 truncate">{risk.risk_title}</span>
                                <Badge className="bg-rose-500/10 text-rose-400 text-xs">
                                  {(risk.residual_likelihood || 0) * (risk.residual_impact || 0)}
                                </Badge>
                              </div>
                            ))}
                            {mapping.risks.length > 3 && (
                              <div className="text-xs text-slate-500 ml-2">+ {mapping.risks.length - 3} more risks</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredMappings.length === 0 && (
              <Card className="bg-[#1a2332] border-[#2a3548]">
                <CardContent className="p-12 text-center">
                  <Scale className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No risk-regulation mappings found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  };

  const FrameworkCrossWalk = () => {
    const crosswalks = frameworks.map(fw => {
      const sourceRisks = risks.filter(r => r.framework === fw.source_framework);
      const targetControls = controls.filter(c => c.framework === fw.target_framework);
      const gaps = fw.gaps || [];
      
      return { framework: fw, sourceRisks, targetControls, gaps };
    });

    const filteredCrosswalks = crosswalks.filter(cw => 
      cw.framework.source_framework?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cw.framework.target_framework?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white mb-1">{filteredCrosswalks.length}</div>
              <div className="text-xs text-slate-400">Framework Mappings</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white mb-1">
                {crosswalks.length > 0 
                  ? Math.round(crosswalks.reduce((sum, cw) => sum + (cw.framework.coverage_percentage || 0), 0) / crosswalks.length)
                  : 0}%
              </div>
              <div className="text-xs text-slate-400">Avg Coverage</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white mb-1">
                {crosswalks.reduce((sum, cw) => sum + cw.gaps.length, 0)}
              </div>
              <div className="text-xs text-slate-400">Total Gaps</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search framework mappings..."
                className="pl-9 bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>
          </CardContent>
        </Card>

        <ScrollArea className="h-[600px]">
          <div className="space-y-3 pr-4">
            {filteredCrosswalks.map((cw, idx) => (
              <Card key={idx} className="bg-[#1a2332] border-[#2a3548] hover:border-purple-500/40 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-purple-500/20 text-purple-400 text-sm px-3 py-1">
                        {cw.framework.source_framework}
                      </Badge>
                      <Network className="h-4 w-4 text-slate-500" />
                      <Badge className="bg-indigo-500/20 text-indigo-400 text-sm px-3 py-1">
                        {cw.framework.target_framework}
                      </Badge>
                    </div>
                    <Badge className={`${
                      (cw.framework.coverage_percentage || 0) >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                      (cw.framework.coverage_percentage || 0) >= 60 ? 'bg-amber-500/20 text-amber-400' :
                      'bg-rose-500/20 text-rose-400'
                    }`}>
                      {cw.framework.coverage_percentage || 0}% Coverage
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs text-slate-500 mb-2">Coverage Progress</div>
                    <Progress value={cw.framework.coverage_percentage || 0} className="h-2" />
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                      <div className="text-xs text-slate-500 mb-1">Source Risks</div>
                      <div className="text-lg font-bold text-purple-400">{cw.sourceRisks.length}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                      <div className="text-xs text-slate-500 mb-1">Target Controls</div>
                      <div className="text-lg font-bold text-blue-400">{cw.targetControls.length}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                      <div className="text-xs text-slate-500 mb-1">Gaps</div>
                      <div className="text-lg font-bold text-rose-400">{cw.gaps.length}</div>
                    </div>
                  </div>

                  {cw.gaps.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-slate-400 mb-2">Identified Gaps:</div>
                      <div className="space-y-1">
                        {cw.gaps.slice(0, 3).map((gap, i) => (
                          <div key={i} className="text-xs text-slate-300 p-2 rounded bg-rose-500/10 border border-rose-500/20">
                            • {gap.description || gap}
                          </div>
                        ))}
                        {cw.gaps.length > 3 && (
                          <div className="text-xs text-slate-500 ml-2">+ {cw.gaps.length - 3} more gaps</div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {filteredCrosswalks.length === 0 && (
              <Card className="bg-[#1a2332] border-[#2a3548]">
                <CardContent className="p-12 text-center">
                  <Network className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No framework mappings found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-indigo-500/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Network className="h-5 w-5 text-indigo-400" />
            Enterprise Risk Mapping & Cross-Walk Analysis
          </CardTitle>
          <p className="text-sm text-slate-400 mt-2">
            Comprehensive relationship mapping across risks, controls, compliance, regulations, and frameworks
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="control" className="space-y-6">
        <TabsList className="bg-[#1a2332] border border-[#2a3548] flex-wrap h-auto gap-2 p-2">
          <TabsTrigger value="control" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-blue-400">
            <Shield className="h-4 w-4 mr-2" />
            Risk → Control
          </TabsTrigger>
          <TabsTrigger value="compliance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-teal-500/20 data-[state=active]:text-emerald-400">
            <FileCheck className="h-4 w-4 mr-2" />
            Risk → Compliance
          </TabsTrigger>
          <TabsTrigger value="regulation" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-indigo-400">
            <Scale className="h-4 w-4 mr-2" />
            Risk → Regulation
          </TabsTrigger>
          <TabsTrigger value="framework" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-purple-400">
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

        <TabsContent value="framework">
          <FrameworkCrossWalk />
        </TabsContent>
      </Tabs>
    </div>
  );
}