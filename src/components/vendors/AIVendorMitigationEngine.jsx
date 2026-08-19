import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Shield, Target, Zap, Loader2, CheckCircle2, AlertTriangle, FileText, Clock } from "lucide-react";
import { toast } from "sonner";

export default function AIVendorMitigationEngine() {
  const [generating, setGenerating] = useState(false);
  const [strategies, setStrategies] = useState({});

  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => base44.entities.Vendor.list('-created_date')
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['vendor-assessments'],
    queryFn: () => base44.entities.VendorAssessment.list()
  });

  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: () => base44.entities.Risk.list()
  });

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: () => base44.entities.Control.list()
  });

  const generateMitigationStrategy = async (vendor) => {
    setGenerating(true);
    
    try {
      const vendorAssessments = assessments.filter(a => a.vendor_id === vendor.id);
      const latestAssessment = vendorAssessments[0];

      const prompt = `You are an AI risk mitigation strategist. Generate comprehensive, actionable mitigation strategies for this vendor's identified risks:

VENDOR PROFILE:
- Name: ${vendor.vendor_name}
- Type: ${vendor.vendor_type}
- Criticality: ${vendor.criticality}
- Risk Tier: ${vendor.risk_tier}
- Security Score: ${vendor.security_score || 'Not scored'}
- Data Access: ${vendor.data_access_level}
- Compliance: ${vendor.compliance_status}

ASSESSMENT FINDINGS:
${latestAssessment ? `
- Overall Score: ${latestAssessment.overall_score}/100
- Security Controls: ${latestAssessment.security_controls_score}/100
- Data Protection: ${latestAssessment.data_protection_score}/100
- Incident Response: ${latestAssessment.incident_response_score}/100
- Business Continuity: ${latestAssessment.business_continuity_score}/100
- Findings: ${JSON.stringify(latestAssessment.findings)}
- Recommendations: ${latestAssessment.recommendations?.join('; ')}
` : 'No assessment data available'}

ORGANIZATIONAL CONTEXT:
- Total Risks: ${risks.length}
- Total Controls: ${controls.length}

Provide a JSON response with this exact structure:
{
  "executive_summary": "<brief overview of mitigation approach>",
  "risk_level": "<critical|high|medium|low>",
  "priority": "<immediate|urgent|normal|low>",
  "mitigation_strategies": [
    {
      "category": "<contractual|technical|operational|compliance|financial>",
      "strategy": "<strategy name>",
      "description": "<detailed description>",
      "priority": "<critical|high|medium|low>",
      "effort": "<high|medium|low>",
      "cost": "<high|medium|low>",
      "timeframe": "<immediate|30_days|90_days|6_months|ongoing>",
      "implementation_steps": [
        "<step description>"
      ],
      "expected_impact": "<description of expected risk reduction>",
      "success_metrics": [
        "<metric to track>"
      ]
    }
  ],
  "contract_recommendations": [
    {
      "clause": "<clause name>",
      "recommendation": "<detailed recommendation>",
      "priority": "<critical|high|medium|low>"
    }
  ],
  "control_enhancements": [
    {
      "control_area": "<area name>",
      "enhancement": "<description>",
      "benefit": "<expected benefit>"
    }
  ],
  "monitoring_plan": {
    "kpis": [
      {"metric": "<metric name>", "target": "<target value>", "frequency": "<monitoring frequency>"}
    ],
    "escalation_triggers": [
      "<trigger description>"
    ],
    "review_schedule": "<schedule description>"
  },
  "contingency_plans": [
    {
      "scenario": "<failure scenario>",
      "response": "<contingency response>",
      "alternative_vendors": "<suggestions or 'None identified'>"
    }
  ],
  "estimated_risk_reduction": <number 0-100>,
  "implementation_roadmap": [
    {"phase": "<phase name>", "duration": "<duration>", "key_activities": ["<activity>"]}
  ]
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            risk_level: { type: "string" },
            priority: { type: "string" },
            mitigation_strategies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  strategy: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string" },
                  effort: { type: "string" },
                  cost: { type: "string" },
                  timeframe: { type: "string" },
                  implementation_steps: { type: "array", items: { type: "string" } },
                  expected_impact: { type: "string" },
                  success_metrics: { type: "array", items: { type: "string" } }
                }
              }
            },
            contract_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  clause: { type: "string" },
                  recommendation: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            control_enhancements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  control_area: { type: "string" },
                  enhancement: { type: "string" },
                  benefit: { type: "string" }
                }
              }
            },
            monitoring_plan: {
              type: "object",
              properties: {
                kpis: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      metric: { type: "string" },
                      target: { type: "string" },
                      frequency: { type: "string" }
                    }
                  }
                },
                escalation_triggers: { type: "array", items: { type: "string" } },
                review_schedule: { type: "string" }
              }
            },
            contingency_plans: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  scenario: { type: "string" },
                  response: { type: "string" },
                  alternative_vendors: { type: "string" }
                }
              }
            },
            estimated_risk_reduction: { type: "number" },
            implementation_roadmap: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  phase: { type: "string" },
                  duration: { type: "string" },
                  key_activities: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      setStrategies(prev => ({
        ...prev,
        [vendor.id]: response
      }));

      toast.success(`Mitigation strategy generated: ${response.estimated_risk_reduction}% risk reduction`);
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate mitigation strategy");
    } finally {
      setGenerating(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/20">
              <Brain className="h-7 w-7 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-xl text-white">AI Mitigation Strategy Engine</CardTitle>
              <p className="text-sm text-slate-400 mt-1">
                Generate tailored, actionable mitigation strategies for vendor risks
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-5 w-5 text-emerald-400" />
              <p className="text-xs text-slate-400">Strategies Generated</p>
            </div>
            <p className="text-2xl font-bold text-white">{Object.keys(strategies).length}</p>
            <p className="text-xs text-slate-500 mt-1">Vendors analyzed</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-blue-400" />
              <p className="text-xs text-slate-400">Avg Risk Reduction</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {Object.keys(strategies).length > 0
                ? Math.round(
                    Object.values(strategies).reduce(
                      (sum, s) => sum + (s.estimated_risk_reduction || 0),
                      0
                    ) / Object.keys(strategies).length
                  )
                : 0}%
            </p>
            <p className="text-xs text-slate-500 mt-1">Expected reduction</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <p className="text-xs text-slate-400">High Priority</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {Object.values(strategies).filter(s => 
                s.priority === 'immediate' || s.priority === 'urgent'
              ).length}
            </p>
            <p className="text-xs text-slate-500 mt-1">Urgent actions</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <p className="text-xs text-slate-400">Total Strategies</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {Object.values(strategies).reduce(
                (sum, s) => sum + (s.mitigation_strategies?.length || 0),
                0
              )}
            </p>
            <p className="text-xs text-slate-500 mt-1">Actions identified</p>
          </CardContent>
        </Card>
      </div>

      {/* Vendors with Strategies */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base text-white">Vendor Mitigation Strategies</CardTitle>
          <p className="text-xs text-slate-400 mt-1">
            AI-generated, tailored mitigation strategies for each vendor's specific risks
          </p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[700px]">
            <div className="space-y-4 pr-4">
              {vendors.map(vendor => {
                const strategy = strategies[vendor.id];
                
                return (
                  <div key={vendor.id} className="p-4 rounded-lg bg-gradient-to-br from-[#151d2e] to-[#0f1623] border border-[#2a3548]">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-white">{vendor.vendor_name}</h4>
                          <Badge className={getSeverityColor(vendor.criticality)}>
                            {vendor.criticality}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500">{vendor.vendor_type}</p>
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => generateMitigationStrategy(vendor)}
                        disabled={generating}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        {generating ? (
                          <><Loader2 className="h-3 w-3 animate-spin mr-2" /> Generating...</>
                        ) : (
                          <><Zap className="h-3 w-3 mr-2" /> Generate Strategy</>
                        )}
                      </Button>
                    </div>

                    {strategy && (
                      <div className="space-y-4">
                        {/* Executive Summary */}
                        <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-emerald-400">Executive Summary</p>
                            <Badge className={getSeverityColor(strategy.priority)}>
                              {strategy.priority} priority
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-300 leading-relaxed">{strategy.executive_summary}</p>
                          <div className="mt-2 pt-2 border-t border-emerald-500/20">
                            <p className="text-xs text-slate-400">
                              Estimated Risk Reduction: <span className="font-semibold text-emerald-400">{strategy.estimated_risk_reduction}%</span>
                            </p>
                          </div>
                        </div>

                        {/* Mitigation Strategies */}
                        {strategy.mitigation_strategies?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-white mb-2 flex items-center gap-2">
                              <Shield className="h-3 w-3 text-emerald-400" />
                              Mitigation Strategies ({strategy.mitigation_strategies.length})
                            </p>
                            <div className="space-y-3">
                              {strategy.mitigation_strategies.map((strat, idx) => {
                                return (
                                  <div key={idx} className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                                    <div className="flex items-start gap-2 mb-2">
                                      <Shield className="h-4 w-4 text-emerald-400 mt-0.5" />
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                          <p className="text-xs font-medium text-white">{strat.strategy}</p>
                                          <Badge className={getSeverityColor(strat.priority)}>
                                            {strat.priority}
                                          </Badge>
                                        </div>
                                        <p className="text-xs text-slate-400 mb-2">{strat.description}</p>
                                        
                                        <div className="flex items-center gap-2 mb-2">
                                          <Badge variant="outline" className="text-xs">
                                            {strat.category}
                                          </Badge>
                                          <Badge variant="outline" className="text-xs">
                                            <Clock className="h-2.5 w-2.5 mr-1" />
                                            {strat.timeframe?.replace(/_/g, ' ')}
                                          </Badge>
                                          <Badge variant="outline" className="text-xs">
                                            Effort: {strat.effort}
                                          </Badge>
                                          <Badge variant="outline" className="text-xs">
                                            Cost: {strat.cost}
                                          </Badge>
                                        </div>

                                        {strat.implementation_steps?.length > 0 && (
                                          <div className="mt-2 p-2 rounded bg-[#151d2e]">
                                            <p className="text-xs font-medium text-slate-300 mb-1">Implementation Steps:</p>
                                            <ol className="list-decimal list-inside space-y-0.5">
                                              {strat.implementation_steps.map((step, stepIdx) => (
                                                <li key={stepIdx} className="text-xs text-slate-400">{step}</li>
                                              ))}
                                            </ol>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Contract Recommendations */}
                        {strategy.contract_recommendations?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-white mb-2 flex items-center gap-2">
                              <FileText className="h-3 w-3 text-blue-400" />
                              Contract Enhancements
                            </p>
                            <div className="space-y-2">
                              {strategy.contract_recommendations.map((rec, idx) => (
                                <div key={idx} className="p-2 rounded bg-[#0f1623] border border-[#2a3548]">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <p className="text-xs font-medium text-white">{rec.clause}</p>
                                    <Badge className={getSeverityColor(rec.priority)}>
                                      {rec.priority}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-slate-400">{rec.recommendation}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Implementation Roadmap */}
                        {strategy.implementation_roadmap?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-white mb-2 flex items-center gap-2">
                              <Target className="h-3 w-3 text-purple-400" />
                              Implementation Roadmap
                            </p>
                            <div className="space-y-2">
                              {strategy.implementation_roadmap.map((phase, idx) => (
                                <div key={idx} className="p-2 rounded bg-[#0f1623] border border-[#2a3548]">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="text-xs font-medium text-white">Phase {idx + 1}: {phase.phase}</p>
                                    <Badge variant="outline" className="text-xs">
                                      {phase.duration}
                                    </Badge>
                                  </div>
                                  <ul className="space-y-0.5">
                                    {phase.key_activities?.map((activity, actIdx) => (
                                      <li key={actIdx} className="text-xs text-slate-400 flex items-start gap-1">
                                        <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                                        {activity}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}