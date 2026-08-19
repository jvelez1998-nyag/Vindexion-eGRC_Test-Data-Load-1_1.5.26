import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Sparkles, Tags, Copy, AlertTriangle, TrendingUp, Network, Target, Loader2, CheckCircle2, Zap } from "lucide-react";
import { toast } from "sonner";
import { ResponsiveContainer, Sankey, Treemap, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { motion } from "framer-motion";

export default function AIControlInventoryEngine({ controls, risks, compliance, onControlCreate }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  async function runAIAnalysis() {
    setLoading(true);
    try {
      const prompt = `As a GRC control framework expert, analyze the organization's control inventory and provide intelligent insights.

CONTROL INVENTORY (${controls.length} controls):
${controls.slice(0, 25).map((c, i) => `
${i + 1}. ${c.name}
   - Description: ${c.description || 'N/A'}
   - Domain: ${c.domain}
   - Category: ${c.category}
   - Status: ${c.status}
   - Effectiveness: ${c.effectiveness}/5
   - Framework Mappings: ${JSON.stringify(c.framework_mappings || {})}
   - Linked Risks: ${(c.linked_risks || []).length} risks
`).join('\n')}

RISK CONTEXT (${risks.length} risks):
${risks.slice(0, 15).map(r => `- ${r.title} (${r.category}, Score: ${(r.residual_likelihood || 0) * (r.residual_impact || 0)})`).join('\n')}

COMPLIANCE CONTEXT (${compliance.length} requirements):
${compliance.slice(0, 15).map(c => `- ${c.framework}: ${c.requirement}`).join('\n')}

ANALYSIS REQUIRED:

1. **Auto-Categorization & Tagging** (20-30 controls):
   - Analyze control descriptions to suggest optimal tags
   - Categorize controls by function (preventive, detective, corrective)
   - Assign maturity levels
   - Recommend framework mappings if missing

2. **Redundancy Detection** (identify 10-15 overlapping controls):
   - Find controls that serve similar purposes
   - Identify controls with 70%+ overlap
   - Calculate consolidation opportunities
   - Suggest which control to keep as primary

3. **Gap Analysis & Control Suggestions** (suggest 8-12 new controls):
   - Identify risks without adequate controls
   - Find compliance requirements lacking controls
   - Suggest specific new controls with detailed descriptions
   - Prioritize suggestions by impact

4. **Effectiveness Mapping**:
   - Map controls to risks with coverage scores
   - Map controls to regulations with compliance scores
   - Identify high-value controls (protect multiple risks/requirements)
   - Flag low-performing controls

Return comprehensive, actionable intelligence.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            auto_categorization: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  control_name: { type: "string" },
                  suggested_tags: { type: "array", items: { type: "string" } },
                  suggested_category: { type: "string" },
                  maturity_level: { type: "string" },
                  framework_recommendations: { type: "array", items: { type: "string" } },
                  confidence: { type: "number" }
                }
              }
            },
            redundancy_analysis: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  control_group: { type: "array", items: { type: "string" } },
                  overlap_percentage: { type: "number" },
                  reason: { type: "string" },
                  primary_control: { type: "string" },
                  consolidation_recommendation: { type: "string" }
                }
              }
            },
            gap_based_suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  suggested_control_name: { type: "string" },
                  description: { type: "string" },
                  domain: { type: "string" },
                  category: { type: "string" },
                  addresses_risks: { type: "array", items: { type: "string" } },
                  addresses_compliance: { type: "array", items: { type: "string" } },
                  priority: { type: "string" },
                  expected_impact: { type: "string" }
                }
              }
            },
            effectiveness_mapping: {
              type: "object",
              properties: {
                control_to_risk_coverage: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      control_name: { type: "string" },
                      covered_risks: { type: "array", items: { type: "string" } },
                      coverage_score: { type: "number" }
                    }
                  }
                },
                control_to_regulation_coverage: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      control_name: { type: "string" },
                      covered_regulations: { type: "array", items: { type: "string" } },
                      compliance_score: { type: "number" }
                    }
                  }
                },
                high_value_controls: { type: "array", items: { type: "string" } },
                low_performing_controls: { type: "array", items: { type: "string" } }
              }
            },
            statistics: {
              type: "object",
              properties: {
                total_analyzed: { type: "number" },
                redundancies_found: { type: "number" },
                gaps_identified: { type: "number" },
                optimization_potential: { type: "string" }
              }
            }
          }
        }
      });

      setAnalysis(result);
      toast.success("AI analysis complete");
    } catch (error) {
      console.error(error);
      toast.error("Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  async function applyTagging(control) {
    try {
      await base44.entities.Control.update(control.id, {
        tags: control.suggested_tags,
        category: control.suggested_category
      });
      toast.success(`Updated ${control.control_name}`);
    } catch (error) {
      toast.error("Update failed");
    }
  }

  async function createSuggestedControl(suggestion) {
    try {
      const newControl = {
        name: suggestion.suggested_control_name,
        description: suggestion.description,
        domain: suggestion.domain,
        category: suggestion.category,
        status: "planned",
        effectiveness: 3
      };
      await base44.entities.Control.create(newControl);
      toast.success("Control created");
      if (onControlCreate) onControlCreate();
    } catch (error) {
      toast.error("Creation failed");
    }
  }

  if (!analysis) {
    return (
      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
              <Brain className="h-12 w-12 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Control Inventory Intelligence</h3>
              <p className="text-slate-400 max-w-lg mx-auto mb-6">
                Automatically categorize controls, detect redundancies, identify gaps, and visualize effectiveness mappings using advanced AI analysis.
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm text-slate-400 mb-6">
                <div className="flex items-center gap-2 justify-center">
                  <Tags className="h-4 w-4 text-indigo-400" />
                  <span>Auto-Tagging</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <Copy className="h-4 w-4 text-purple-400" />
                  <span>Redundancy Detection</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <Target className="h-4 w-4 text-amber-400" />
                  <span>Gap Analysis</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <Network className="h-4 w-4 text-emerald-400" />
                  <span>Effectiveness Mapping</span>
                </div>
              </div>
            </div>
            <Button 
              onClick={runAIAnalysis}
              disabled={loading || controls.length === 0}
              className="bg-indigo-600 hover:bg-indigo-700"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Analyzing Control Inventory...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Run AI Analysis
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredSuggestions = selectedCategory === "all" 
    ? analysis.gap_based_suggestions 
    : analysis.gap_based_suggestions.filter(s => s.priority === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 p-6"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl"></div>
        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">AI Control Analysis Results</h3>
                <p className="text-xs text-slate-400">Intelligent inventory optimization</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">{analysis.executive_summary}</p>
            
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <div className="text-2xl font-bold text-indigo-400">{analysis.statistics.total_analyzed}</div>
                <div className="text-xs text-slate-400 mt-1">Controls Analyzed</div>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="text-2xl font-bold text-amber-400">{analysis.statistics.redundancies_found}</div>
                <div className="text-xs text-slate-400 mt-1">Redundancies</div>
              </div>
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <div className="text-2xl font-bold text-rose-400">{analysis.statistics.gaps_identified}</div>
                <div className="text-xs text-slate-400 mt-1">Gaps Found</div>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-sm font-bold text-emerald-400">{analysis.statistics.optimization_potential}</div>
                <div className="text-xs text-slate-400 mt-1">Optimization</div>
              </div>
            </div>
          </div>
          <Button onClick={runAIAnalysis} variant="outline" className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
            <Sparkles className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Analysis Tabs */}
      <Tabs defaultValue="categorization" className="space-y-4">
        <TabsList className="bg-[#1a2332] border border-[#2a3548]">
          <TabsTrigger value="categorization">
            <Tags className="h-4 w-4 mr-2" />
            Auto-Categorization
          </TabsTrigger>
          <TabsTrigger value="redundancy">
            <Copy className="h-4 w-4 mr-2" />
            Redundancy Detection
          </TabsTrigger>
          <TabsTrigger value="gaps">
            <Target className="h-4 w-4 mr-2" />
            Gap-Based Suggestions
          </TabsTrigger>
          <TabsTrigger value="mapping">
            <Network className="h-4 w-4 mr-2" />
            Effectiveness Mapping
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categorization" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-3 pr-4">
              {analysis.auto_categorization.map((control, idx) => (
                <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-2">{control.control_name}</h4>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                            {control.suggested_category}
                          </Badge>
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                            Maturity: {control.maturity_level}
                          </Badge>
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                            {control.confidence}% confidence
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => applyTagging(control)}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Apply
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs font-medium text-slate-400 mb-1">Suggested Tags:</div>
                        <div className="flex flex-wrap gap-1">
                          {control.suggested_tags.map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {control.framework_recommendations?.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-slate-400 mb-1">Framework Recommendations:</div>
                          <div className="flex flex-wrap gap-1">
                            {control.framework_recommendations.map((fw, i) => (
                              <Badge key={i} className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                                {fw}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="redundancy" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-3 pr-4">
              {analysis.redundancy_analysis.map((group, idx) => (
                <Card key={idx} className="bg-[#1a2332] border-amber-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Copy className="h-5 w-5 text-amber-400" />
                        <div>
                          <h4 className="font-semibold text-white">Redundancy Group {idx + 1}</h4>
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 mt-1">
                            {group.overlap_percentage}% Overlap
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs font-medium text-slate-400 mb-1">Overlapping Controls:</div>
                        <div className="space-y-1">
                          {group.control_group.map((ctrl, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                              <span className={ctrl === group.primary_control ? 'text-emerald-400' : 'text-slate-300'}>
                                {ctrl === group.primary_control && '⭐ '}
                                {ctrl}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                        <div className="text-xs font-medium text-amber-400 mb-1">Reason:</div>
                        <div className="text-xs text-slate-300">{group.reason}</div>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
                        <div className="text-xs font-medium text-indigo-400 mb-1">Recommendation:</div>
                        <div className="text-xs text-slate-300">{group.consolidation_recommendation}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="gaps" className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Button
              size="sm"
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className={selectedCategory === "all" ? "bg-indigo-600" : ""}
            >
              All Priorities
            </Button>
            <Button
              size="sm"
              variant={selectedCategory === "High" ? "default" : "outline"}
              onClick={() => setSelectedCategory("High")}
              className={selectedCategory === "High" ? "bg-rose-600" : ""}
            >
              High Priority
            </Button>
            <Button
              size="sm"
              variant={selectedCategory === "Medium" ? "default" : "outline"}
              onClick={() => setSelectedCategory("Medium")}
              className={selectedCategory === "Medium" ? "bg-amber-600" : ""}
            >
              Medium Priority
            </Button>
          </div>

          <ScrollArea className="h-[600px]">
            <div className="space-y-3 pr-4">
              {filteredSuggestions.map((suggestion, idx) => (
                <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-white">{suggestion.suggested_control_name}</h4>
                          <Badge className={`${
                            suggestion.priority === 'High' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                            suggestion.priority === 'Medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                            'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          }`}>
                            {suggestion.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400 mb-3">{suggestion.description}</p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => createSuggestedControl(suggestion)}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Zap className="h-4 w-4 mr-1" />
                        Create
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400">Domain:</span>
                        <span className="text-white ml-2">{suggestion.domain}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Category:</span>
                        <span className="text-white ml-2">{suggestion.category}</span>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      {suggestion.addresses_risks?.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-slate-400 mb-1">Addresses Risks:</div>
                          <div className="flex flex-wrap gap-1">
                            {suggestion.addresses_risks.map((risk, i) => (
                              <Badge key={i} className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-xs">
                                {risk}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {suggestion.addresses_compliance?.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-slate-400 mb-1">Addresses Compliance:</div>
                          <div className="flex flex-wrap gap-1">
                            {suggestion.addresses_compliance.map((comp, i) => (
                              <Badge key={i} className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                                {comp}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                      <div className="text-xs text-emerald-400">{suggestion.expected_impact}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="mapping" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm">High-Value Controls</CardTitle>
                <p className="text-xs text-slate-400">Controls protecting multiple risks/requirements</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.effectiveness_mapping.high_value_controls.slice(0, 8).map((ctrl, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <TrendingUp className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <span className="text-sm text-white">{ctrl}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm">Low-Performing Controls</CardTitle>
                <p className="text-xs text-slate-400">Controls requiring attention</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.effectiveness_mapping.low_performing_controls.slice(0, 8).map((ctrl, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
                      <span className="text-sm text-white">{ctrl}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-sm">Control-to-Risk Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3 pr-4">
                  {analysis.effectiveness_mapping.control_to_risk_coverage.map((mapping, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-white">{mapping.control_name}</span>
                        <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                          Score: {mapping.coverage_score}/100
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {mapping.covered_risks.map((risk, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {risk}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}