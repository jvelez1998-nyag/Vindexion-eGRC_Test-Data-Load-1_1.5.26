import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Loader2, Network, Shield, AlertTriangle, FileCheck, BookOpen, Activity, Target, Zap, HelpCircle, Globe } from "lucide-react";
import { toast } from "sonner";
import CrossWalkDashboard from "@/components/crosswalk/CrossWalkDashboard";
import CrossWalkMappingEngine from "@/components/crosswalk/CrossWalkMappingEngine";
import CrossWalkGapAnalyzer from "@/components/crosswalk/CrossWalkGapAnalyzer";
import CrossWalkAutomation from "@/components/crosswalk/CrossWalkAutomation";
import CrossWalkUserGuide from "@/components/crosswalk/CrossWalkUserGuide";
import CrossWalkMatrixView from "@/components/crosswalk/CrossWalkMatrixView";
import CrossWalkAIInsights from "@/components/crosswalk/CrossWalkAIInsights";
import FrameworkInterdependencies from "@/components/crosswalk/FrameworkInterdependencies";
import GlobalRegulatoryMapper from "@/components/crosswalk/GlobalRegulatoryMapper";

export default function CrossWalkMapping() {
  const [loading, setLoading] = useState(false);
  const [mappings, setMappings] = useState(null);
  const [selectedFramework, setSelectedFramework] = useState("all");
  const [selectedRiskCategory, setSelectedRiskCategory] = useState("all");

  const queryClient = useQueryClient();

  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: async () => {
      const data = await base44.entities.Risk.list();
      return data || [];
    }
  });

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: async () => {
      const data = await base44.entities.Control.list();
      return data || [];
    }
  });

  const { data: compliance = [] } = useQuery({
    queryKey: ['compliance'],
    queryFn: async () => {
      const data = await base44.entities.Compliance.list();
      return data || [];
    }
  });

  const { data: guidance = [] } = useQuery({
    queryKey: ['guidance'],
    queryFn: async () => {
      const data = await base44.entities.Guidance.list();
      return data || [];
    }
  });

  const { data: frameworkMappings = [] } = useQuery({
    queryKey: ['framework-mappings'],
    queryFn: async () => {
      const data = await base44.entities.FrameworkMapping.list();
      return data || [];
    }
  });

  const createMappingMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.FrameworkMapping.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['framework-mappings'] });
      toast.success("Mapping created");
    }
  });

  const generateCrossWalkMapping = async () => {
    setLoading(true);
    try {
      const prompt = `You are an expert in GRC (Governance, Risk, and Compliance) framework mapping and regulatory compliance. Perform an intelligent cross-walk analysis to map relationships between risks, controls, regulations, and frameworks.

ORGANIZATIONAL DATA:

RISKS (${risks.length} total):
${risks.slice(0, 15).map((r, i) => `
${i + 1}. ${r.title}
   - Category: ${r.category}
   - Residual Score: ${(r.residual_likelihood || 0) * (r.residual_impact || 0)}
   - Status: ${r.status}
`).join('\n')}

CONTROLS (${controls.length} total):
${controls.slice(0, 15).map((c, i) => `
${i + 1}. ${c.name}
   - Domain: ${c.domain}
   - Category: ${c.category}
   - Status: ${c.status}
   - Framework Mappings: ${JSON.stringify(c.framework_mappings || {})}
`).join('\n')}

COMPLIANCE REQUIREMENTS (${compliance.length} total):
${compliance.slice(0, 15).map((comp, i) => `
${i + 1}. ${comp.requirement}
   - Framework: ${comp.framework}
   - Status: ${comp.status}
`).join('\n')}

GUIDANCE & POLICIES (${guidance.length} total):
${guidance.slice(0, 10).map((g, i) => `
${i + 1}. ${g.title}
   - Framework: ${g.framework}
   - Category: ${g.category}
`).join('\n')}

ANALYSIS REQUIRED:

1. **Risk-to-Control Mappings** (15-20 mappings):
   - Map each risk to relevant controls
   - Confidence score (0-100)
   - Gap assessment (well-controlled, partially-controlled, uncontrolled)
   - Recommendation if gaps exist

2. **Control-to-Framework Mappings** (20-30 mappings):
   - Map controls to regulatory frameworks (SOX, ISO27001, NIST, GDPR, etc.)
   - Multiple frameworks per control
   - Compliance coverage percentage
   - Framework overlap analysis

3. **Risk-to-Regulation Mappings** (15-20 mappings):
   - Which regulations address which risks
   - Regulatory requirements that mitigate risks
   - Compliance priorities

4. **Framework Cross-Walk** (Major frameworks):
   - ISO 27001 ↔ NIST CSF
   - SOX ↔ COBIT
   - GDPR ↔ ISO 27001
   - PCI-DSS ↔ ISO 27001
   Show overlapping controls and unique requirements

5. **Gap Analysis**:
   - Risks without adequate controls
   - Controls not mapped to frameworks
   - Regulations without supporting controls
   - Recommended mappings

6. **Coverage Matrix**:
   - Overall framework coverage (%)
   - Risk coverage by controls (%)
   - Control effectiveness across frameworks

Return comprehensive, accurate mappings based on industry standards and best practices.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            risk_control_mappings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  risk_id: { type: "string" },
                  risk_title: { type: "string" },
                  mapped_controls: { type: "array", items: { type: "string" } },
                  confidence_score: { type: "number" },
                  coverage_status: { type: "string" },
                  gap_recommendation: { type: "string" }
                }
              }
            },
            control_framework_mappings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  control_name: { type: "string" },
                  frameworks: {
                    type: "object",
                    properties: {
                      ISO27001: { type: "array", items: { type: "string" } },
                      NIST: { type: "array", items: { type: "string" } },
                      SOX: { type: "array", items: { type: "string" } },
                      GDPR: { type: "array", items: { type: "string" } },
                      COBIT: { type: "array", items: { type: "string" } },
                      PCI_DSS: { type: "array", items: { type: "string" } }
                    }
                  },
                  coverage_percentage: { type: "number" }
                }
              }
            },
            risk_regulation_mappings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  risk_title: { type: "string" },
                  regulations: { type: "array", items: { type: "string" } },
                  requirements: { type: "array", items: { type: "string" } },
                  priority: { type: "string" }
                }
              }
            },
            framework_crosswalk: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  framework_pair: { type: "string" },
                  overlapping_controls: { type: "array", items: { type: "string" } },
                  unique_to_first: { type: "array", items: { type: "string" } },
                  unique_to_second: { type: "array", items: { type: "string" } },
                  overlap_percentage: { type: "number" }
                }
              }
            },
            gap_analysis: {
              type: "object",
              properties: {
                uncontrolled_risks: { type: "array", items: { type: "string" } },
                unmapped_controls: { type: "array", items: { type: "string" } },
                regulations_without_controls: { type: "array", items: { type: "string" } },
                recommendations: { type: "array", items: { type: "string" } }
              }
            },
            coverage_matrix: {
              type: "object",
              properties: {
                framework_coverage: {
                  type: "object",
                  properties: {
                    ISO27001: { type: "number" },
                    NIST: { type: "number" },
                    SOX: { type: "number" },
                    GDPR: { type: "number" },
                    COBIT: { type: "number" }
                  }
                },
                risk_coverage: { type: "number" },
                overall_maturity: { type: "string" }
              }
            }
          }
        }
      });

      setMappings(response);
      toast.success("Cross-walk mapping completed");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate mappings");
    } finally {
      setLoading(false);
    }
  };

  const frameworks = ["ISO27001", "NIST", "SOX", "GDPR", "COBIT", "PCI_DSS"];
  const riskCategories = [...new Set(risks.map(r => r.category))];

  // These filtered lists are dependent on `mappings` being available.
  // They will be defined within the `mappings && (...)` block in the 'legacy' tab.
  // For the current structure, they are moved to be conditionally defined.
  const filteredRiskControlMappings = mappings?.risk_control_mappings?.filter(m => 
    (selectedRiskCategory === "all" || m.risk_title.toLowerCase().includes(selectedRiskCategory.toLowerCase()))
  ) || [];

  const filteredControlFrameworkMappings = mappings?.control_framework_mappings?.filter(m =>
    selectedFramework === "all" || Object.keys(m.frameworks).some(fw => 
      fw.toLowerCase().includes(selectedFramework.toLowerCase()) && m.frameworks[fw].length > 0
    )
  ) || [];


  return (
    <div className="min-h-screen bg-[#0f1623] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 shadow-lg shadow-violet-500/10">
            <Network className="h-7 w-7 text-violet-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-violet-200 to-purple-300 bg-clip-text text-transparent">
              Cross-Walk Mapping Center
            </h1>
            <p className="text-slate-400 text-sm mt-1">AI-powered framework alignment and gap analysis</p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-[#1a2332] border border-[#2a3548] p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-violet-400">
              <Activity className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="global-mapper" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-indigo-400">
              <Globe className="h-4 w-4 mr-2" />
              Global Mapper
            </TabsTrigger>
            <TabsTrigger value="mapping-engine" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-blue-400">
              <Network className="h-4 w-4 mr-2" />
              Mapping Engine
            </TabsTrigger>
            <TabsTrigger value="gap-analyzer" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-orange-500/20 data-[state=active]:text-amber-400">
              <Target className="h-4 w-4 mr-2" />
              Gap Analyzer
            </TabsTrigger>
            <TabsTrigger value="automation" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-green-500/20 data-[state=active]:text-emerald-400">
              <Zap className="h-4 w-4 mr-2" />
              Automation
            </TabsTrigger>
            <TabsTrigger value="user-guide" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-purple-400">
              <HelpCircle className="h-4 w-4 mr-2" />
              User Guide
            </TabsTrigger>
            <TabsTrigger value="legacy">Legacy Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Hero Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-violet-500/20">
                        <Network className="h-5 w-5 text-violet-400" />
                      </div>
                      <Badge className="bg-violet-500/20 text-violet-400 text-xs">Active</Badge>
                    </div>
                    <div className="text-2xl font-bold text-white">{frameworkMappings.length}</div>
                    <div className="text-xs text-slate-400">Total Mappings</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-emerald-500/20">
                        <Shield className="h-5 w-5 text-emerald-400" />
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">Mapped</Badge>
                    </div>
                    <div className="text-2xl font-bold text-white">{controls.length}</div>
                    <div className="text-xs text-slate-400">Controls</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <FileCheck className="h-5 w-5 text-blue-400" />
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-400 text-xs">Tracked</Badge>
                    </div>
                    <div className="text-2xl font-bold text-white">{compliance.length}</div>
                    <div className="text-xs text-slate-400">Requirements</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-amber-500/20">
                        <Target className="h-5 w-5 text-amber-400" />
                      </div>
                      <Badge className="bg-amber-500/20 text-amber-400 text-xs">Coverage</Badge>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {frameworkMappings.length > 0 ? Math.round((frameworkMappings.filter(m => m.mapping_status === 'complete').length / frameworkMappings.length) * 100) : 0}%
                    </div>
                    <div className="text-xs text-slate-400">Completion</div>
                  </CardContent>
                </Card>
              </div>

              <CrossWalkDashboard
                mappings={frameworkMappings}
                frameworks={['SOX', 'SOC2', 'ISO27001', 'PCI-DSS', 'HIPAA', 'NIST CSF', 'COBIT', 'GDPR']}
                onStartMapping={() => {}}
              />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FrameworkInterdependencies
                  mappings={frameworkMappings}
                  frameworks={['SOX', 'SOC2', 'ISO27001', 'NIST', 'GDPR', 'COBIT']}
                />
                <CrossWalkAIInsights
                  mappings={frameworkMappings}
                  controls={controls}
                />
              </div>
              
              <CrossWalkMatrixView
                mappings={frameworkMappings}
                frameworks={['SOX', 'SOC2', 'ISO27001', 'NIST', 'GDPR', 'COBIT']}
              />
            </div>
          </TabsContent>

          <TabsContent value="global-mapper">
            <GlobalRegulatoryMapper 
              controls={controls}
              compliance={compliance}
            />
          </TabsContent>

          <TabsContent value="mapping-engine">
            <CrossWalkMappingEngine
              onComplete={(data) => {
                createMappingMutation.mutate(data);
              }}
            />
          </TabsContent>

          <TabsContent value="gap-analyzer">
            <CrossWalkGapAnalyzer
              existingControls={controls}
              existingCompliance={compliance}
            />
          </TabsContent>

          <TabsContent value="automation">
            <CrossWalkAutomation />
          </TabsContent>

          <TabsContent value="user-guide">
            <CrossWalkUserGuide />
          </TabsContent>

          <TabsContent value="legacy">
            {!mappings && (
              <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
                <CardContent className="p-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                      <Brain className="h-12 w-12 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">AI Cross-Walk Analysis</h3>
                      <p className="text-slate-400 max-w-md mx-auto mb-4">
                        Generate intelligent mappings between risks, controls, regulations, and frameworks. 
                        Identify gaps and overlaps with AI-powered analysis.
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm text-slate-500 mb-6">
                        <div className="flex items-center gap-2 justify-center">
                          <AlertTriangle className="h-4 w-4" />
                          <span>{risks.length} Risks</span>
                        </div>
                        <div className="flex items-center gap-2 justify-center">
                          <Shield className="h-4 w-4" />
                          <span>{controls.length} Controls</span>
                        </div>
                        <div className="flex items-center gap-2 justify-center">
                          <FileCheck className="h-4 w-4" />
                          <span>{compliance.length} Requirements</span>
                        </div>
                        <div className="flex items-center gap-2 justify-center">
                          <BookOpen className="h-4 w-4" />
                          <span>{guidance.length} Guidance</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={generateCrossWalkMapping}
                      disabled={loading}
                      className="bg-cyan-600 hover:bg-cyan-700"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Analyzing Relationships...
                        </>
                      ) : (
                        <>
                          <Brain className="h-5 w-5 mr-2" />
                          Generate Cross-Walk Mappings
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            {mappings && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                      <Network className="h-6 w-6 text-cyan-400" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-white">Cross-Walk Mapping Analysis</h1>
                      <p className="text-slate-400 text-sm">AI-generated relationship mappings</p>
                    </div>
                  </div>
                  <Button onClick={generateCrossWalkMapping} variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
                    <Brain className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>
                </div>

                {/* Executive Summary */}
                <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
                  <CardHeader>
                    <CardTitle className="text-base">Executive Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 leading-relaxed mb-4">{mappings.executive_summary}</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 bg-[#1a2332]/50 rounded-lg">
                        <div className="text-2xl font-bold text-cyan-400">{mappings.coverage_matrix.risk_coverage}%</div>
                        <div className="text-xs text-slate-400 mt-1">Risk Coverage</div>
                      </div>
                      <div className="p-3 bg-[#1a2332]/50 rounded-lg">
                        <div className="text-2xl font-bold text-cyan-400">{Object.values(mappings.coverage_matrix.framework_coverage).reduce((a, b) => a + b, 0) / Object.keys(mappings.coverage_matrix.framework_coverage).length}%</div>
                        <div className="text-xs text-slate-400 mt-1">Avg Framework Coverage</div>
                      </div>
                      <div className="p-3 bg-[#1a2332]/50 rounded-lg">
                        <div className="text-sm font-bold text-cyan-400">{mappings.coverage_matrix.overall_maturity}</div>
                        <div className="text-xs text-slate-400 mt-1">Maturity Level</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Tabs defaultValue="risk-control" className="space-y-6">
          <TabsList className="bg-[#1a2332] border border-[#2a3548]">
            <TabsTrigger value="risk-control">Risk ↔ Control</TabsTrigger>
            <TabsTrigger value="control-framework">Control ↔ Framework</TabsTrigger>
            <TabsTrigger value="risk-regulation">Risk ↔ Regulation</TabsTrigger>
            <TabsTrigger value="crosswalk">Framework Cross-Walk</TabsTrigger>
            <TabsTrigger value="gaps">Gap Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="risk-control" className="space-y-4">
            <div className="flex items-center gap-3">
              <Select value={selectedRiskCategory} onValueChange={setSelectedRiskCategory}>
                <SelectTrigger className="w-48 bg-[#1a2332] border-[#2a3548] text-white">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  <SelectItem value="all" className="text-white">All Categories</SelectItem>
                  {riskCategories.map(cat => (
                    <SelectItem key={cat} value={cat} className="text-white capitalize">{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="h-[600px]">
              <div className="space-y-3 pr-4">
                {filteredRiskControlMappings.map((mapping, idx) => (
                  <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-2">{mapping.risk_title}</h4>
                          <Badge className={`${mapping.coverage_status === 'well-controlled' ? 'bg-emerald-500/20 text-emerald-400' : mapping.coverage_status === 'partially-controlled' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'} border-0`}>
                            {mapping.coverage_status}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-cyan-400">{mapping.confidence_score}%</div>
                          <div className="text-xs text-slate-500">Confidence</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-slate-400">Mapped Controls:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {mapping.mapped_controls.map((ctrl, i) => (
                            <Badge key={i} className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                              {ctrl}
                            </Badge>
                          ))}
                        </div>
                        {mapping.gap_recommendation && (
                          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 mt-2">
                            <div className="text-xs text-amber-400">{mapping.gap_recommendation}</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="control-framework" className="space-y-4">
            <div className="flex items-center gap-3">
              <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                <SelectTrigger className="w-48 bg-[#1a2332] border-[#2a3548] text-white">
                  <SelectValue placeholder="Filter by framework" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  <SelectItem value="all" className="text-white">All Frameworks</SelectItem>
                  {frameworks.map(fw => (
                    <SelectItem key={fw} value={fw} className="text-white">{fw}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="h-[600px]">
              <div className="space-y-3 pr-4">
                {filteredControlFrameworkMappings.map((mapping, idx) => (
                  <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-white flex-1">{mapping.control_name}</h4>
                        <div className="text-right">
                          <div className="text-xl font-bold text-cyan-400">{mapping.coverage_percentage}%</div>
                          <div className="text-xs text-slate-500">Coverage</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(mapping.frameworks).map(([framework, items]) => (
                          items.length > 0 && (
                            <div key={framework}>
                              <div className="text-xs font-medium text-slate-400 mb-1">{framework}:</div>
                              <div className="flex flex-wrap gap-1">
                                {items.map((item, i) => (
                                  <Badge key={i} className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs">
                                    {item}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="risk-regulation" className="space-y-4">
            <ScrollArea className="h-[600px]">
              <div className="space-y-3 pr-4">
                {mappings.risk_regulation_mappings.map((mapping, idx) => (
                  <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-white flex-1">{mapping.risk_title}</h4>
                        <Badge className={`${mapping.priority === 'High' || mapping.priority === 'Critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/10 text-blue-400'} border-0`}>
                          {mapping.priority} Priority
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-slate-400">Applicable Regulations:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {mapping.regulations.map((reg, i) => (
                            <Badge key={i} className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">
                              {reg}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-xs font-medium text-slate-400 mt-3">Key Requirements:</div>
                        <ul className="space-y-1">
                          {mapping.requirements.map((req, i) => (
                            <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                              <span className="text-cyan-400 mt-0.5">•</span>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="crosswalk" className="space-y-4">
            {mappings.framework_crosswalk.map((crosswalk, idx) => (
              <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{crosswalk.framework_pair}</span>
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                      {crosswalk.overlap_percentage}% Overlap
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-xs font-medium text-emerald-400 mb-2">Overlapping Controls:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {crosswalk.overlapping_controls.map((ctrl, i) => (
                        <Badge key={i} className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                          {ctrl}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs font-medium text-blue-400 mb-2">Unique to First:</div>
                      <div className="flex flex-wrap gap-1">
                        {crosswalk.unique_to_first.slice(0, 5).map((ctrl, i) => (
                          <Badge key={i} className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                            {ctrl}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-purple-400 mb-2">Unique to Second:</div>
                      <div className="flex flex-wrap gap-1">
                        {crosswalk.unique_to_second.slice(0, 5).map((ctrl, i) => (
                          <Badge key={i} className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">
                            {ctrl}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="gaps" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-[#1a2332] border-rose-500/30">
                <CardHeader>
                  <CardTitle className="text-base text-rose-400">Uncontrolled Risks</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {mappings.gap_analysis.uncontrolled_risks.map((risk, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-rose-400 mt-0.5 flex-shrink-0" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-[#1a2332] border-amber-500/30">
                <CardHeader>
                  <CardTitle className="text-base text-amber-400">Unmapped Controls</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {mappings.gap_analysis.unmapped_controls.map((ctrl, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <Shield className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                        {ctrl}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-[#1a2332] border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-base text-blue-400">Regulations Without Controls</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {mappings.gap_analysis.regulations_without_controls.map((reg, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <FileCheck className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        {reg}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-[#1a2332] border-emerald-500/30">
                <CardHeader>
                  <CardTitle className="text-base text-emerald-400">Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {mappings.gap_analysis.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5">→</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
                </Tabs>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}