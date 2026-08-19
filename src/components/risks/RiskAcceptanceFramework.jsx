import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, AlertCircle, FileCheck, User, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function RiskAcceptanceFramework({ risk }) {
  const [justification, setJustification] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const isEligibleForAcceptance = () => {
    const score = risk.residual_risk_score || (risk.residual_likelihood * risk.residual_impact);
    return score <= 6 && ['low', 'medium'].includes(risk.overall_risk_rating?.toLowerCase());
  };

  const generateAcceptanceJustification = async () => {
    setLoading(true);
    try {
      const prompt = `Generate a risk acceptance justification for the following low-priority risk:

**RISK:**
- Title: ${risk.title}
- Category: ${risk.category}
- Residual Risk Score: ${risk.residual_risk_score} (L${risk.residual_likelihood} × I${risk.residual_impact})
- Risk Rating: ${risk.overall_risk_rating}
- Description: ${risk.description}
- Controls: ${risk.control_environment_summary || 'No controls documented'}

**REQUIREMENTS:**
1. Assess if this risk is truly acceptable based on:
   - Residual risk level
   - Cost of mitigation vs. potential loss
   - Existing control environment
   - Organizational risk appetite
   - Regulatory requirements

2. Provide a structured justification including:
   - Why acceptance is appropriate
   - Cost-benefit analysis
   - Monitoring requirements
   - Acceptance conditions
   - Review frequency

3. Flag any concerns if acceptance is NOT recommended`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommendation: { type: "string" },
            is_acceptable: { type: "boolean" },
            justification: { type: "string" },
            cost_benefit_analysis: { type: "string" },
            monitoring_requirements: {
              type: "array",
              items: { type: "string" }
            },
            acceptance_conditions: {
              type: "array",
              items: { type: "string" }
            },
            review_frequency: { type: "string" },
            concerns: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setAiSuggestion(result);
      setJustification(result.justification);
      toast.success("AI justification generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate justification");
    } finally {
      setLoading(false);
    }
  };

  const acceptRiskMutation = useMutation({
    mutationFn: async () => {
      if (!justification) {
        throw new Error("Justification is required");
      }

      const user = await base44.auth.me();
      
      return base44.entities.Risk.update(risk.id, {
        status: 'accepted',
        risk_treatment_strategy: 'accept',
        mitigation_plan: `${risk.mitigation_plan || ''}\n\n**RISK ACCEPTANCE DOCUMENTATION**\nAccepted by: ${user.email}\nDate: ${new Date().toISOString()}\nJustification:\n${justification}\n\nMonitoring Requirements:\n${aiSuggestion?.monitoring_requirements?.map(r => `- ${r}`).join('\n') || 'Standard monitoring'}\n\nNext Review: ${aiSuggestion?.review_frequency || '6 months'}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
      toast.success("Risk accepted");
    }
  });

  if (!isEligibleForAcceptance()) {
    return (
      <Card className="bg-gradient-to-r from-rose-500/10 to-orange-500/10 border-rose-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-rose-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">Not Eligible for Acceptance</h4>
              <p className="text-sm text-slate-300">
                This risk has a {risk.overall_risk_rating} rating and a residual risk score of {risk.residual_risk_score}. 
                Only low to medium risks (score ≤ 6) are eligible for acceptance without executive approval.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-emerald-400" />
          Risk Acceptance Framework
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Eligibility Status */}
        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30 p-4">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <div>
              <h4 className="text-sm font-semibold text-white">Eligible for Risk Acceptance</h4>
              <p className="text-xs text-slate-400">
                Residual risk score: {risk.residual_risk_score} | Rating: {risk.overall_risk_rating}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2 bg-[#151d2e] rounded border border-emerald-500/30">
              <p className="text-slate-400 mb-1">Likelihood</p>
              <p className="text-white font-semibold">{risk.residual_likelihood}/5</p>
            </div>
            <div className="p-2 bg-[#151d2e] rounded border border-emerald-500/30">
              <p className="text-slate-400 mb-1">Impact</p>
              <p className="text-white font-semibold">{risk.residual_impact}/5</p>
            </div>
            <div className="p-2 bg-[#151d2e] rounded border border-emerald-500/30">
              <p className="text-slate-400 mb-1">Score</p>
              <p className="text-emerald-400 font-semibold">{risk.residual_risk_score}/25</p>
            </div>
          </div>
        </Card>

        {/* AI Suggestion */}
        {aiSuggestion && (
          <Card className={`p-4 ${aiSuggestion.is_acceptable ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
            <h4 className="text-sm font-semibold text-white mb-2">AI Recommendation</h4>
            <Badge className={aiSuggestion.is_acceptable ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mb-3' : 'bg-amber-500/20 text-amber-400 border-amber-500/30 mb-3'}>
              {aiSuggestion.recommendation}
            </Badge>
            
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-400 mb-1 font-medium">Cost-Benefit Analysis:</p>
                <p className="text-sm text-slate-300">{aiSuggestion.cost_benefit_analysis}</p>
              </div>

              {aiSuggestion.acceptance_conditions?.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-1 font-medium">Acceptance Conditions:</p>
                  <div className="space-y-1">
                    {aiSuggestion.acceptance_conditions.map((condition, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-1 flex-shrink-0" />
                        <span>{condition}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {aiSuggestion.monitoring_requirements?.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-1 font-medium">Monitoring Requirements:</p>
                  <div className="space-y-1">
                    {aiSuggestion.monitoring_requirements.map((req, idx) => (
                      <div key={idx} className="text-sm text-slate-300">• {req}</div>
                    ))}
                  </div>
                </div>
              )}

              {aiSuggestion.concerns?.length > 0 && (
                <div>
                  <p className="text-xs text-amber-400 mb-1 font-medium">⚠️ Concerns:</p>
                  <div className="space-y-1">
                    {aiSuggestion.concerns.map((concern, idx) => (
                      <div key={idx} className="text-sm text-amber-300">• {concern}</div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Calendar className="h-3 w-3" />
                Review Frequency: {aiSuggestion.review_frequency}
              </div>
            </div>
          </Card>
        )}

        {/* Justification */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-slate-400">Acceptance Justification</label>
            <Button
              onClick={generateAcceptanceJustification}
              disabled={loading}
              size="sm"
              variant="outline"
              className="border-[#2a3548] h-7"
            >
              {loading ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3 w-3 mr-1" />
              )}
              AI Generate
            </Button>
          </div>
          <Textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Provide detailed justification for accepting this risk..."
            className="bg-[#151d2e] border-[#2a3548] text-white min-h-[120px]"
          />
        </div>

        {/* Accept Button */}
        <Button
          onClick={() => acceptRiskMutation.mutate()}
          disabled={!justification || acceptRiskMutation.isPending}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          {acceptRiskMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileCheck className="h-4 w-4 mr-2" />
          )}
          Accept Risk
        </Button>

        <p className="text-xs text-slate-500 text-center">
          Risk acceptance will be documented with your approval and requires periodic review
        </p>
      </CardContent>
    </Card>
  );
}