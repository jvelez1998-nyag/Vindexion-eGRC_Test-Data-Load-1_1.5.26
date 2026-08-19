import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Shield, DollarSign, Clock, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";

export default function AIMitigationStrategies({ risk }) {
  const [strategies, setStrategies] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateStrategies = async () => {
    setLoading(true);
    try {
      const prompt = `Generate comprehensive mitigation strategies for the following risk:

**RISK DETAILS:**
- Title: ${risk.title}
- Category: ${risk.category}
- Current Rating: ${risk.overall_risk_rating}
- Inherent Risk Score: ${risk.inherent_risk_score} (L${risk.inherent_likelihood} × I${risk.inherent_impact})
- Residual Risk Score: ${risk.residual_risk_score} (L${risk.residual_likelihood} × I${risk.residual_impact})
- Description: ${risk.description}
- Treatment Strategy: ${risk.risk_treatment_strategy || 'Not defined'}

**EXISTING MITIGATION:**
${risk.mitigation_plan || 'No current mitigation plan'}

Generate 5-7 mitigation strategies covering different approaches:
1. Preventive controls (stop the risk from occurring)
2. Detective controls (identify when risk materializes)
3. Corrective actions (reduce impact after occurrence)
4. Transfer mechanisms (insurance, outsourcing)
5. Technology solutions
6. Process improvements
7. Training and awareness

For each strategy, provide:
- Clear implementation steps
- Cost estimate (Low/Medium/High)
- Time to implement
- Expected risk reduction (%)
- ROI assessment
- Prerequisites
- Potential challenges`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            recommended_approach: { type: "string" },
            strategies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  strategy_name: { type: "string" },
                  type: { type: "string" },
                  description: { type: "string" },
                  implementation_steps: {
                    type: "array",
                    items: { type: "string" }
                  },
                  cost_estimate: { type: "string" },
                  implementation_time: { type: "string" },
                  risk_reduction_percentage: { type: "number" },
                  roi_assessment: { type: "string" },
                  prerequisites: {
                    type: "array",
                    items: { type: "string" }
                  },
                  challenges: {
                    type: "array",
                    items: { type: "string" }
                  },
                  priority: { type: "string" }
                }
              }
            }
          }
        }
      });

      setStrategies(result);
      toast.success("Mitigation strategies generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate strategies");
    } finally {
      setLoading(false);
    }
  };

  const applyStrategy = async (strategy) => {
    const updatedPlan = `${risk.mitigation_plan || ''}\n\n**${strategy.strategy_name}**\n${strategy.implementation_steps.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}`;
    
    try {
      await base44.entities.Risk.update(risk.id, {
        mitigation_plan: updatedPlan
      });
      toast.success("Strategy added to mitigation plan");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update risk");
    }
  };

  const typeColors = {
    preventive: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    detective: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    corrective: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    transfer: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    technology: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    process: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    training: "bg-rose-500/20 text-rose-400 border-rose-500/30"
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-400" />
            AI Mitigation Strategies
          </CardTitle>
          <Button
            onClick={generateStrategies}
            disabled={loading}
            size="sm"
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" /> Generate Strategies</>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!strategies ? (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Generate AI-powered mitigation strategies tailored to this risk</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30 p-4">
              <h4 className="text-sm font-semibold text-white mb-2">Summary</h4>
              <p className="text-sm text-slate-300 mb-3">{strategies.summary}</p>
              <div className="p-3 bg-[#151d2e] rounded-lg border border-emerald-500/30">
                <p className="text-xs text-slate-400 mb-1">Recommended Approach:</p>
                <p className="text-sm text-white">{strategies.recommended_approach}</p>
              </div>
            </Card>

            {/* Strategies */}
            <div className="space-y-3">
              {strategies.strategies?.map((strategy, idx) => (
                <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-sm font-semibold text-white">{strategy.strategy_name}</h4>
                          <Badge className={typeColors[strategy.type.toLowerCase()] || "bg-slate-500/20"}>
                            {strategy.type}
                          </Badge>
                          <Badge className={
                            strategy.priority === 'high' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                            strategy.priority === 'medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                            'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          }>
                            {strategy.priority} priority
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-300 mb-3">{strategy.description}</p>

                        {/* Metrics */}
                        <div className="grid grid-cols-4 gap-3 mb-3">
                          <div className="p-2 bg-[#0f1623] rounded-lg border border-[#2a3548]">
                            <div className="flex items-center gap-1 mb-1">
                              <DollarSign className="h-3 w-3 text-slate-400" />
                              <span className="text-xs text-slate-400">Cost</span>
                            </div>
                            <p className="text-sm text-white font-semibold">{strategy.cost_estimate}</p>
                          </div>
                          <div className="p-2 bg-[#0f1623] rounded-lg border border-[#2a3548]">
                            <div className="flex items-center gap-1 mb-1">
                              <Clock className="h-3 w-3 text-slate-400" />
                              <span className="text-xs text-slate-400">Time</span>
                            </div>
                            <p className="text-sm text-white font-semibold">{strategy.implementation_time}</p>
                          </div>
                          <div className="p-2 bg-[#0f1623] rounded-lg border border-emerald-500/30">
                            <div className="flex items-center gap-1 mb-1">
                              <Shield className="h-3 w-3 text-emerald-400" />
                              <span className="text-xs text-slate-400">Reduction</span>
                            </div>
                            <p className="text-sm text-emerald-400 font-semibold">{strategy.risk_reduction_percentage}%</p>
                          </div>
                          <div className="p-2 bg-[#0f1623] rounded-lg border border-[#2a3548]">
                            <div className="flex items-center gap-1 mb-1">
                              <CheckCircle2 className="h-3 w-3 text-slate-400" />
                              <span className="text-xs text-slate-400">ROI</span>
                            </div>
                            <p className="text-xs text-white font-semibold">{strategy.roi_assessment}</p>
                          </div>
                        </div>

                        {/* Implementation Steps */}
                        <div className="mb-3">
                          <p className="text-xs text-slate-400 mb-2 font-medium">Implementation Steps:</p>
                          <div className="space-y-1">
                            {strategy.implementation_steps.map((step, i) => (
                              <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                <span className="text-emerald-400 mt-0.5">{i + 1}.</span>
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Prerequisites & Challenges */}
                        <div className="grid grid-cols-2 gap-3">
                          {strategy.prerequisites?.length > 0 && (
                            <div>
                              <p className="text-xs text-slate-400 mb-1 font-medium">Prerequisites:</p>
                              <div className="space-y-1">
                                {strategy.prerequisites.map((prereq, i) => (
                                  <div key={i} className="text-xs text-slate-400">• {prereq}</div>
                                ))}
                              </div>
                            </div>
                          )}
                          {strategy.challenges?.length > 0 && (
                            <div>
                              <p className="text-xs text-slate-400 mb-1 font-medium">Challenges:</p>
                              <div className="space-y-1">
                                {strategy.challenges.map((challenge, i) => (
                                  <div key={i} className="text-xs text-amber-400">• {challenge}</div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => applyStrategy(strategy)}
                      size="sm"
                      variant="outline"
                      className="w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                    >
                      <Copy className="h-3 w-3 mr-2" />
                      Add to Mitigation Plan
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}