import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Loader2, Target, Clock, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function AIComplianceRecommendations({ complianceItems, controls, risks }) {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      const nonCompliant = complianceItems.filter(i => ['not_started', 'non_compliant', 'in_progress'].includes(i.status));
      
      const prompt = `Generate AI-driven recommendations for achieving and maintaining compliance:

**COMPLIANCE GAPS:**
${nonCompliant.map(item => `- ${item.framework}: ${item.requirement} (Status: ${item.status})`).join('\n')}

**CONTROL STATUS:**
- Total Controls: ${controls.length}
- Effective: ${controls.filter(c => c.status === 'effective').length}
- Need Improvement: ${controls.filter(c => c.status !== 'effective').length}

**RISK ENVIRONMENT:**
- High/Critical Risks: ${risks.filter(r => ['high', 'critical'].includes(r.overall_risk_rating?.toLowerCase())).length}

Provide actionable recommendations for:
1. **Quick Wins** - Low-effort, high-impact actions (< 1 month)
2. **Strategic Initiatives** - Major compliance improvements (1-6 months)
3. **Long-term Compliance** - Sustained compliance programs (6+ months)
4. **Control Enhancements** - Specific control improvements
5. **Risk Mitigation** - Address compliance-related risks
6. **Process Improvements** - Systematic compliance management

For each recommendation:
- Clear action steps
- Expected timeline
- Resource requirements
- Compliance impact
- Risk reduction
- Implementation complexity`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            priority_focus: { type: "string" },
            quick_wins: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  recommendation: { type: "string" },
                  actions: { type: "array", items: { type: "string" } },
                  timeline: { type: "string" },
                  impact: { type: "string" },
                  frameworks: { type: "array", items: { type: "string" } }
                }
              }
            },
            strategic_initiatives: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  initiative: { type: "string" },
                  description: { type: "string" },
                  actions: { type: "array", items: { type: "string" } },
                  timeline: { type: "string" },
                  resources: { type: "string" },
                  compliance_impact: { type: "string" },
                  complexity: { type: "string" }
                }
              }
            },
            long_term_programs: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  program: { type: "string" },
                  objectives: { type: "array", items: { type: "string" } },
                  timeline: { type: "string" }
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
                  priority: { type: "string" }
                }
              }
            }
          }
        }
      });

      setRecommendations(result);
      toast.success("Recommendations generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate recommendations");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-400" />
            AI Compliance Recommendations
          </CardTitle>
          <Button
            onClick={generateRecommendations}
            disabled={loading}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
            ) : (
              <><Lightbulb className="h-4 w-4 mr-2" /> Generate</>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!recommendations ? (
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Get AI-driven recommendations for compliance</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30 p-4">
              <h4 className="text-sm font-semibold text-white mb-2">Strategy Summary</h4>
              <p className="text-sm text-slate-300 mb-3">{recommendations.summary}</p>
              <div className="p-3 bg-[#151d2e] rounded border border-amber-500/30">
                <p className="text-xs text-slate-400 mb-1">Priority Focus:</p>
                <p className="text-sm text-white font-medium">{recommendations.priority_focus}</p>
              </div>
            </Card>

            {/* Quick Wins */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-emerald-400" />
                Quick Wins
              </h4>
              <div className="space-y-2">
                {recommendations.quick_wins?.map((win, idx) => (
                  <Card key={idx} className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30 p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="text-sm font-medium text-white flex-1">{win.recommendation}</h5>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        {win.impact}
                      </Badge>
                    </div>
                    <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="h-3 w-3" />
                      {win.timeline}
                    </div>
                    <div className="space-y-1 mb-2">
                      {win.actions?.map((action, i) => (
                        <div key={i} className="text-xs text-slate-300">• {action}</div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {win.frameworks?.map((fw, i) => (
                        <Badge key={i} className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">
                          {fw}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Strategic Initiatives */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                Strategic Initiatives
              </h4>
              <div className="space-y-2">
                {recommendations.strategic_initiatives?.map((initiative, idx) => (
                  <Card key={idx} className="bg-[#151d2e] border-blue-500/30 p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="text-sm font-semibold text-white">{initiative.initiative}</h5>
                      <Badge className={
                        initiative.complexity === 'high' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                        initiative.complexity === 'medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }>
                        {initiative.complexity}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-300 mb-2">{initiative.description}</p>
                    <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                      <div>
                        <span className="text-slate-400">Timeline: </span>
                        <span className="text-white">{initiative.timeline}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Resources: </span>
                        <span className="text-white">{initiative.resources}</span>
                      </div>
                    </div>
                    <div className="p-2 bg-[#0f1623] rounded border border-blue-500/30 text-xs">
                      <span className="text-slate-400">Impact: </span>
                      <span className="text-blue-300">{initiative.compliance_impact}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Long-term Programs */}
            {recommendations.long_term_programs?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Long-term Compliance Programs</h4>
                <div className="space-y-2">
                  {recommendations.long_term_programs.map((program, idx) => (
                    <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-3">
                      <h5 className="text-sm font-medium text-white mb-2">{program.program}</h5>
                      <div className="space-y-1">
                        {program.objectives?.map((obj, i) => (
                          <div key={i} className="text-xs text-slate-300">• {obj}</div>
                        ))}
                      </div>
                      <div className="mt-2 text-xs text-slate-400">Timeline: {program.timeline}</div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Control Enhancements */}
            {recommendations.control_enhancements?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Control Enhancements</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {recommendations.control_enhancements.map((enh, idx) => (
                    <Card key={idx} className="bg-[#151d2e] border-purple-500/30 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <h6 className="text-sm font-medium text-white">{enh.control_area}</h6>
                        <Badge className={
                          enh.priority === 'high' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                          'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }>
                          {enh.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-300">{enh.enhancement}</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}