import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { Brain, Sparkles, TrendingUp, Filter, BarChart3, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function AIAssessmentIntelligence({ open, onOpenChange, onApplyInsights }) {
  const [activeTab, setActiveTab] = useState("predict");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  
  const [orgProfile, setOrgProfile] = useState({
    industry: "",
    company_size: "",
    region: "",
    revenue: ""
  });

  const handlePreAssessment = async () => {
    if (!orgProfile.industry || !orgProfile.company_size) {
      toast.error("Industry and company size required");
      return;
    }

    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `As a GRC expert, predict risk assessment scores for a company with these characteristics:
        - Industry: ${orgProfile.industry}
        - Company Size: ${orgProfile.company_size}
        - Region: ${orgProfile.region || 'Not specified'}
        - Annual Revenue: ${orgProfile.revenue || 'Not specified'}
        
        Provide a comprehensive pre-assessment analysis including:
        1. Predicted inherent risk scores by category (operational, financial, strategic, compliance, cybersecurity, reputational) on 1-25 scale
        2. Key risk areas to focus on
        3. Recommended control priorities
        4. Industry-specific compliance requirements`,
        response_json_schema: {
          type: "object",
          properties: {
            predicted_scores: {
              type: "object",
              properties: {
                operational: { type: "number" },
                financial: { type: "number" },
                strategic: { type: "number" },
                compliance: { type: "number" },
                cybersecurity: { type: "number" },
                reputational: { type: "number" }
              }
            },
            key_risk_areas: { type: "array", items: { type: "string" } },
            control_priorities: { type: "array", items: { type: "string" } },
            compliance_requirements: { type: "array", items: { type: "string" } }
          }
        }
      });

      setResults({ type: "prediction", data: result });
      toast.success("Pre-assessment complete");
    } catch (error) {
      toast.error("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRiskPrioritization = async () => {
    setLoading(true);
    try {
      const risks = await base44.entities.Risk.list();
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `As a GRC expert, analyze these risks and prioritize them by actual business impact, not just risk scores. Consider:
        - Financial impact
        - Operational disruption
        - Regulatory consequences
        - Reputational damage
        - Strategic alignment
        
        Risks to analyze: ${JSON.stringify(risks.map(r => ({ title: r.title, category: r.category, score: (r.likelihood || 0) * (r.impact || 0), description: r.description })))}
        
        Provide prioritized ranking with business justification.`,
        response_json_schema: {
          type: "object",
          properties: {
            prioritized_risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  risk_title: { type: "string" },
                  priority_rank: { type: "number" },
                  business_impact_score: { type: "number" },
                  justification: { type: "string" },
                  recommended_actions: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      setResults({ type: "prioritization", data: result });
      toast.success("Risk prioritization complete");
    } catch (error) {
      toast.error("Prioritization failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFatigueAnalysis = async () => {
    setLoading(true);
    try {
      const templates = await base44.entities.AssessmentTemplate.list();
      const assessments = await base44.entities.RiskAssessment.list();
      
      const allQuestions = templates.flatMap(t => 
        (t.questionnaire || []).map(q => ({ template: t.name, question: q.question }))
      );

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `As a GRC expert, analyze these assessment questions and identify:
        1. Redundant or duplicate questions across assessments
        2. Questions that could be consolidated
        3. Recommended streamlined questionnaire
        
        Questions: ${JSON.stringify(allQuestions)}`,
        response_json_schema: {
          type: "object",
          properties: {
            redundant_questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question_group: { type: "array", items: { type: "string" } },
                  reason: { type: "string" },
                  consolidation_suggestion: { type: "string" }
                }
              }
            },
            efficiency_score: { type: "number" },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });

      setResults({ type: "fatigue", data: result });
      toast.success("Fatigue analysis complete");
    } catch (error) {
      toast.error("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBenchmarking = async () => {
    if (!orgProfile.industry) {
      toast.error("Industry required for benchmarking");
      return;
    }

    setLoading(true);
    try {
      const risks = await base44.entities.Risk.list();
      const controls = await base44.entities.Control.list();

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `As a GRC expert, provide industry benchmarking analysis for ${orgProfile.industry} industry:
        
        Current Profile:
        - Total Risks: ${risks.length}
        - Risk Categories: ${[...new Set(risks.map(r => r.category))].join(', ')}
        - Total Controls: ${controls.length}
        - Control Domains: ${[...new Set(controls.map(c => c.domain))].join(', ')}
        
        Compare against industry standards and provide:
        1. Industry average metrics
        2. Percentile ranking
        3. Gap analysis
        4. Best practices from industry leaders`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            industry_averages: {
              type: "object",
              properties: {
                risk_count: { type: "number" },
                control_count: { type: "number" },
                critical_risks_percentage: { type: "number" }
              }
            },
            percentile_ranking: { type: "number" },
            gaps: { type: "array", items: { type: "string" } },
            best_practices: { type: "array", items: { type: "string" } },
            peer_comparison: { type: "string" }
          }
        }
      });

      setResults({ type: "benchmark", data: result });
      toast.success("Benchmarking complete");
    } catch (error) {
      toast.error("Benchmarking failed");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 20) return "text-rose-400";
    if (score >= 15) return "text-amber-400";
    if (score >= 10) return "text-yellow-400";
    return "text-emerald-400";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            AI Assessment Intelligence
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mx-6 bg-[#151d2e] border border-[#2a3548]">
            <TabsTrigger value="predict" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">
              <Sparkles className="h-3 w-3 mr-1" /> Pre-Assessment
            </TabsTrigger>
            <TabsTrigger value="prioritize" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">
              <TrendingUp className="h-3 w-3 mr-1" /> Prioritization
            </TabsTrigger>
            <TabsTrigger value="fatigue" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">
              <Filter className="h-3 w-3 mr-1" /> Fatigue Analysis
            </TabsTrigger>
            <TabsTrigger value="benchmark" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">
              <BarChart3 className="h-3 w-3 mr-1" /> Benchmarking
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh]">
            <TabsContent value="predict" className="px-6 space-y-4 mt-4">
              <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                <p className="text-sm text-slate-400 mb-4">ML predicts risk scores based on organizational characteristics before formal assessment</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Industry *</Label>
                    <Select value={orgProfile.industry} onValueChange={(v) => setOrgProfile({...orgProfile, industry: v})}>
                      <SelectTrigger className="mt-1 bg-[#0f1623] border-[#2a3548]"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        <SelectItem value="financial_services" className="text-white">Financial Services</SelectItem>
                        <SelectItem value="healthcare" className="text-white">Healthcare</SelectItem>
                        <SelectItem value="technology" className="text-white">Technology</SelectItem>
                        <SelectItem value="manufacturing" className="text-white">Manufacturing</SelectItem>
                        <SelectItem value="retail" className="text-white">Retail</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Company Size *</Label>
                    <Select value={orgProfile.company_size} onValueChange={(v) => setOrgProfile({...orgProfile, company_size: v})}>
                      <SelectTrigger className="mt-1 bg-[#0f1623] border-[#2a3548]"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        <SelectItem value="small" className="text-white">Small (1-50)</SelectItem>
                        <SelectItem value="medium" className="text-white">Medium (51-500)</SelectItem>
                        <SelectItem value="large" className="text-white">Large (501-5000)</SelectItem>
                        <SelectItem value="enterprise" className="text-white">Enterprise (5000+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Region</Label>
                    <Input value={orgProfile.region} onChange={(e) => setOrgProfile({...orgProfile, region: e.target.value})} placeholder="e.g., North America" className="mt-1 bg-[#0f1623] border-[#2a3548]" />
                  </div>
                  <div>
                    <Label>Annual Revenue</Label>
                    <Input value={orgProfile.revenue} onChange={(e) => setOrgProfile({...orgProfile, revenue: e.target.value})} placeholder="e.g., $10M-$50M" className="mt-1 bg-[#0f1623] border-[#2a3548]" />
                  </div>
                </div>
                <Button onClick={handlePreAssessment} disabled={loading} className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Generate Prediction
                </Button>
              </Card>

              {results?.type === "prediction" && (
                <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                  <h3 className="font-semibold text-white mb-3">Predicted Risk Scores</h3>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {Object.entries(results.data.predicted_scores).map(([category, score]) => (
                      <div key={category} className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                        <p className="text-xs text-slate-500 capitalize mb-1">{category}</p>
                        <p className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-slate-500">Key Risk Areas</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {results.data.key_risk_areas.map((area, idx) => (
                          <Badge key={idx} className="bg-rose-500/10 text-rose-400 border-rose-500/20">{area}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Control Priorities</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {results.data.control_priorities.map((ctrl, idx) => (
                          <Badge key={idx} className="bg-blue-500/10 text-blue-400 border-blue-500/20">{ctrl}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="prioritize" className="px-6 space-y-4 mt-4">
              <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                <p className="text-sm text-slate-400 mb-4">AI ranks risks by actual business impact, not just scores</p>
                <Button onClick={handleRiskPrioritization} disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <TrendingUp className="h-4 w-4 mr-2" />}
                  Analyze Business Impact
                </Button>
              </Card>

              {results?.type === "prioritization" && (
                <div className="space-y-2">
                  {results.data.prioritized_risks.map((risk, idx) => (
                    <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-4">
                      <div className="flex items-start gap-3">
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-lg px-3">#{risk.priority_rank}</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-1">{risk.risk_title}</h4>
                          <p className="text-xs text-slate-400 mb-2">{risk.justification}</p>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">Impact: {risk.business_impact_score}/100</Badge>
                          </div>
                          {risk.recommended_actions.length > 0 && (
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Recommended Actions:</p>
                              <ul className="text-xs text-slate-400 space-y-1">
                                {risk.recommended_actions.map((action, i) => (
                                  <li key={i} className="flex items-start gap-1">
                                    <ArrowRight className="h-3 w-3 text-purple-400 mt-0.5 flex-shrink-0" />
                                    {action}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="fatigue" className="px-6 space-y-4 mt-4">
              <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                <p className="text-sm text-slate-400 mb-4">Identifies redundant questions across multiple assessments</p>
                <Button onClick={handleFatigueAnalysis} disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Filter className="h-4 w-4 mr-2" />}
                  Analyze Assessment Efficiency
                </Button>
              </Card>

              {results?.type === "fatigue" && (
                <>
                  <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-white">Efficiency Score</h3>
                      <div className={`text-3xl font-bold ${results.data.efficiency_score >= 70 ? 'text-emerald-400' : results.data.efficiency_score >= 50 ? 'text-yellow-400' : 'text-rose-400'}`}>
                        {results.data.efficiency_score}%
                      </div>
                    </div>
                  </Card>

                  <div className="space-y-2">
                    {results.data.redundant_questions.map((group, idx) => (
                      <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-4">
                        <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 mb-2">Redundancy Detected</Badge>
                        <p className="text-xs text-slate-500 mb-2">{group.reason}</p>
                        <div className="text-xs text-slate-400 mb-2 space-y-1">
                          {group.question_group.slice(0, 3).map((q, i) => (
                            <div key={i}>• {q}</div>
                          ))}
                        </div>
                        <div className="p-2 rounded bg-[#0f1623] border border-emerald-500/20">
                          <p className="text-xs text-emerald-400">💡 {group.consolidation_suggestion}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="benchmark" className="px-6 space-y-4 mt-4">
              <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                <p className="text-sm text-slate-400 mb-4">Compares risk profile against industry peers using real-time data</p>
                <Button onClick={handleBenchmarking} disabled={loading || !orgProfile.industry} className="w-full bg-purple-600 hover:bg-purple-700">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <BarChart3 className="h-4 w-4 mr-2" />}
                  Run Industry Benchmark
                </Button>
              </Card>

              {results?.type === "benchmark" && (
                <>
                  <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                    <h3 className="font-semibold text-white mb-3">Industry Comparison</h3>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="text-center p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                        <p className="text-xs text-slate-500 mb-1">Percentile</p>
                        <p className="text-2xl font-bold text-purple-400">{results.data.percentile_ranking}th</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                        <p className="text-xs text-slate-500 mb-1">Avg Risks</p>
                        <p className="text-2xl font-bold text-white">{results.data.industry_averages.risk_count}</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                        <p className="text-xs text-slate-500 mb-1">Avg Controls</p>
                        <p className="text-2xl font-bold text-white">{results.data.industry_averages.control_count}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400">{results.data.peer_comparison}</p>
                  </Card>

                  <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                    <h3 className="font-semibold text-white mb-3">Gaps Identified</h3>
                    <div className="space-y-2">
                      {results.data.gaps.map((gap, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-slate-400">
                          <span className="text-amber-400">⚠</span>
                          {gap}
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                    <h3 className="font-semibold text-white mb-3">Best Practices</h3>
                    <div className="space-y-2">
                      {results.data.best_practices.map((practice, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-slate-400">
                          <span className="text-emerald-400">✓</span>
                          {practice}
                        </div>
                      ))}
                    </div>
                  </Card>
                </>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="p-6 pt-4 border-t border-[#2a3548]">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-[#2a3548] hover:bg-[#2a3548]">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}