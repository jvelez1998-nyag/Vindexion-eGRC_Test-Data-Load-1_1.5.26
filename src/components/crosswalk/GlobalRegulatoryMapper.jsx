import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Search, AlertTriangle, CheckCircle2, Loader2, Sparkles, Shield, FileText, TrendingUp, Target } from "lucide-react";
import { toast } from "sonner";

export default function GlobalRegulatoryMapper({ controls = [], compliance = [] }) {
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedFramework, setSelectedFramework] = useState("all");
  const [mappingResults, setMappingResults] = useState(null);
  const [gapAnalysis, setGapAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const regions = [
    { id: "USA", name: "United States", frameworks: ["SOX", "GLBA", "FCRA", "FFIEC", "SEC", "CFTC"] },
    { id: "UK", name: "United Kingdom", frameworks: ["FCA", "PRA", "Consumer Duty", "SM&CR"] },
    { id: "EMEA", name: "EMEA", frameworks: ["GDPR", "DORA", "MiFID II", "PSD2", "AI Act"] },
    { id: "UAE", name: "UAE", frameworks: ["CBUAE", "DFSA", "FSRA", "AML/CFT"] },
    { id: "LATAM", name: "LATAM", frameworks: ["BCB", "CNBV", "CMF", "SFC"] }
  ];

  const allFrameworks = regions.flatMap(r => r.frameworks);

  const runAIMapping = async () => {
    setLoading(true);
    try {
      const controlsSample = controls.slice(0, 30).map(c => ({
        name: c.name,
        description: c.description,
        domain: c.domain,
        category: c.category,
        framework_mappings: c.framework_mappings
      }));

      const complianceSample = compliance.slice(0, 30).map(c => ({
        framework: c.framework,
        requirement: c.requirement,
        status: c.status,
        description: c.description
      }));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a global regulatory compliance expert. Analyze the organization's controls and compliance posture against global regulatory requirements.

CURRENT CONTROLS:
${JSON.stringify(controlsSample, null, 2)}

CURRENT COMPLIANCE STATUS:
${JSON.stringify(complianceSample, null, 2)}

REGIONAL FOCUS: ${selectedRegion === "all" ? "All regions" : selectedRegion}
FRAMEWORK FOCUS: ${selectedFramework === "all" ? "All frameworks" : selectedFramework}

Perform a comprehensive regulatory mapping and gap analysis covering:

1. REGULATORY MAPPING: Map existing controls to specific regulatory requirements across:
   - USA: SOX, GLBA, FCRA, FFIEC, SEC, CFTC
   - UK: FCA, PRA, Consumer Duty, SM&CR
   - EMEA: GDPR, DORA, MiFID II, PSD2, EU AI Act
   - UAE: CBUAE, DFSA, FSRA, AML/CFT requirements
   - LATAM: BCB (Brazil), CNBV (Mexico), CMF (Chile), SFC (Colombia)

2. GAP ANALYSIS: Identify:
   - Missing controls for critical regulatory requirements
   - Weak or ineffective controls
   - Controls with no regulatory mapping
   - High-priority gaps by region and framework

3. CONTROL RECOMMENDATIONS: For each gap, suggest:
   - Specific control name and description
   - Implementation priority (critical/high/medium)
   - Applicable regulatory requirements
   - Implementation guidance

4. POLICY UPDATES: Recommend policy enhancements to meet regulatory requirements

Provide detailed, actionable intelligence.`,
        response_json_schema: {
          type: "object",
          properties: {
            mapping_summary: {
              type: "object",
              properties: {
                total_controls: { type: "number" },
                mapped_controls: { type: "number" },
                unmapped_controls: { type: "number" },
                coverage_percentage: { type: "number" }
              }
            },
            regional_coverage: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  region: { type: "string" },
                  frameworks_covered: { type: "array", items: { type: "string" } },
                  coverage_score: { type: "number" },
                  critical_gaps: { type: "number" }
                }
              }
            },
            control_mappings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  control_name: { type: "string" },
                  mapped_regulations: { type: "array", items: { type: "string" } },
                  coverage_strength: { type: "string" }
                }
              }
            },
            identified_gaps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  regulation: { type: "string" },
                  region: { type: "string" },
                  framework: { type: "string" },
                  requirement: { type: "string" },
                  gap_description: { type: "string" },
                  risk_level: { type: "string" },
                  current_state: { type: "string" }
                }
              }
            },
            recommended_controls: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  control_name: { type: "string" },
                  control_description: { type: "string" },
                  addresses_regulations: { type: "array", items: { type: "string" } },
                  priority: { type: "string" },
                  implementation_guidance: { type: "string" },
                  estimated_effort: { type: "string" }
                }
              }
            },
            policy_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  policy_area: { type: "string" },
                  current_gap: { type: "string" },
                  recommended_update: { type: "string" },
                  regulatory_driver: { type: "string" }
                }
              }
            }
          }
        }
      });

      setMappingResults(result);
      setGapAnalysis(result.identified_gaps);
      toast.success("Regulatory mapping complete");
    } catch (error) {
      console.error('Mapping error:', error);
      toast.error("Failed to complete regulatory mapping");
    } finally {
      setLoading(false);
    }
  };

  const riskColors = {
    critical: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    high: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    medium: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-br from-[#1a2332] via-[#1e2840] to-indigo-950/20 border border-indigo-500/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Global Regulatory Mapper
                </CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">AI-powered control mapping and gap analysis across global regulations</p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="all" className="text-white">All Regions</SelectItem>
                {regions.map(region => (
                  <SelectItem key={region.id} value={region.id} className="text-white">
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedFramework} onValueChange={setSelectedFramework}>
              <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white">
                <SelectValue placeholder="Select framework" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="all" className="text-white">All Frameworks</SelectItem>
                {allFrameworks.map(framework => (
                  <SelectItem key={framework} value={framework} className="text-white">
                    {framework}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={runAIMapping} disabled={loading} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Run AI Analysis
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {mappingResults && (
        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList className="bg-[#1a2332] border border-[#2a3548]">
            <TabsTrigger value="summary"><TrendingUp className="h-4 w-4 mr-2" />Summary</TabsTrigger>
            <TabsTrigger value="gaps"><AlertTriangle className="h-4 w-4 mr-2" />Gaps ({mappingResults.identified_gaps?.length || 0})</TabsTrigger>
            <TabsTrigger value="recommendations"><Target className="h-4 w-4 mr-2" />Recommendations</TabsTrigger>
            <TabsTrigger value="policies"><FileText className="h-4 w-4 mr-2" />Policies</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-[#1a2332] border-[#2a3548]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Coverage</p>
                      <p className="text-2xl font-bold text-white">{mappingResults.mapping_summary?.coverage_percentage}%</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1a2332] border-[#2a3548]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Mapped Controls</p>
                      <p className="text-2xl font-bold text-white">{mappingResults.mapping_summary?.mapped_controls}</p>
                    </div>
                    <Shield className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1a2332] border-[#2a3548]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Identified Gaps</p>
                      <p className="text-2xl font-bold text-rose-400">{mappingResults.identified_gaps?.length || 0}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-rose-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1a2332] border-[#2a3548]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Recommendations</p>
                      <p className="text-2xl font-bold text-indigo-400">{mappingResults.recommended_controls?.length || 0}</p>
                    </div>
                    <Target className="h-8 w-8 text-indigo-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm">Regional Coverage Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mappingResults.regional_coverage?.map((region, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-white">{region.region}</h4>
                        <Badge className={region.coverage_score >= 80 ? 'bg-emerald-500/20 text-emerald-400' : region.coverage_score >= 60 ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'}>
                          {region.coverage_score}% coverage
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {region.frameworks_covered?.map((fw, fIdx) => (
                          <Badge key={fIdx} variant="outline" className="text-xs">{fw}</Badge>
                        ))}
                      </div>
                      {region.critical_gaps > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-rose-400">
                          <AlertTriangle className="h-3 w-3" />
                          {region.critical_gaps} critical gaps identified
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gaps">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm">Identified Compliance Gaps</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-3">
                    {mappingResults.identified_gaps?.map((gap, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={riskColors[gap.risk_level?.toLowerCase()] || riskColors.medium}>
                                {gap.risk_level}
                              </Badge>
                              <Badge variant="outline">{gap.region}</Badge>
                              <Badge variant="outline">{gap.framework}</Badge>
                            </div>
                            <h4 className="text-sm font-semibold text-white">{gap.requirement}</h4>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">{gap.gap_description}</p>
                        <div className="pt-2 border-t border-[#2a3548]">
                          <p className="text-xs text-slate-500">Current State: <span className="text-slate-300">{gap.current_state}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm">Recommended Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-3">
                    {mappingResults.recommended_controls?.map((control, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={riskColors[control.priority?.toLowerCase()] || riskColors.medium}>
                                {control.priority} priority
                              </Badge>
                              <Badge variant="outline" className="text-xs">{control.estimated_effort}</Badge>
                            </div>
                            <h4 className="text-sm font-semibold text-white mb-2">{control.control_name}</h4>
                            <p className="text-xs text-slate-300 mb-3">{control.control_description}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Addresses Regulations:</p>
                            <div className="flex flex-wrap gap-1">
                              {control.addresses_regulations?.map((reg, rIdx) => (
                                <Badge key={rIdx} className="bg-blue-500/20 text-blue-400 text-[10px]">{reg}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="pt-2 border-t border-indigo-500/20">
                            <p className="text-xs text-slate-400 mb-1">Implementation Guidance:</p>
                            <p className="text-xs text-slate-300">{control.implementation_guidance}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm">Policy Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-3">
                    {mappingResults.policy_recommendations?.map((policy, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-white mb-2">{policy.policy_area}</h4>
                            <div className="space-y-2">
                              <div>
                                <p className="text-xs text-rose-400 mb-1">Current Gap:</p>
                                <p className="text-xs text-slate-300">{policy.current_gap}</p>
                              </div>
                              <div>
                                <p className="text-xs text-emerald-400 mb-1">Recommended Update:</p>
                                <p className="text-xs text-slate-300">{policy.recommended_update}</p>
                              </div>
                              <div className="pt-2 border-t border-[#2a3548]">
                                <Badge variant="outline" className="text-xs">
                                  {policy.regulatory_driver}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!mappingResults && !loading && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-12 text-center">
            <Globe className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Ready to Map Regulations</h3>
            <p className="text-sm text-slate-400 mb-4">Select regions and frameworks, then run AI analysis to identify gaps and get recommendations</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}