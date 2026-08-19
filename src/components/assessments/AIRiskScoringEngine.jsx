import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Loader2, TrendingUp, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function AIRiskScoringEngine({ 
  risks = [], 
  controlTests = [], 
  incidents = [],
  controls = []
}) {
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [scoring, setScoring] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Risk.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
      toast.success("Risk score updated");
    }
  });

  const calculateAIScore = async () => {
    if (!selectedRisk) return;

    setScoring(true);
    try {
      // Gather contextual data
      const linkedControls = controls.filter(c => 
        selectedRisk.linked_controls?.includes(c.id)
      );

      const relatedIncidents = incidents.filter(i =>
        i.linked_risks?.includes(selectedRisk.id) ||
        i.description?.toLowerCase().includes(selectedRisk.title?.toLowerCase())
      );

      const relevantTests = controlTests.filter(t =>
        linkedControls.some(c => c.id === t.control_id)
      );

      const context = {
        risk: {
          title: selectedRisk.title,
          category: selectedRisk.category,
          description: selectedRisk.description,
          current_likelihood: selectedRisk.likelihood,
          current_impact: selectedRisk.impact
        },
        linked_controls: linkedControls.map(c => ({
          name: c.name,
          status: c.status,
          effectiveness: c.effectiveness,
          domain: c.domain
        })),
        control_test_results: relevantTests.map(t => ({
          result: t.test_result,
          date: t.test_date,
          control: t.control_name
        })),
        related_incidents: relatedIncidents.map(i => ({
          type: i.incident_type,
          severity: i.severity,
          date: i.reported_date,
          status: i.status
        })),
        metrics: {
          control_failure_rate: relevantTests.filter(t => t.test_result === 'failed').length / Math.max(relevantTests.length, 1),
          recent_incident_count: relatedIncidents.filter(i => {
            const daysSince = (Date.now() - new Date(i.reported_date)) / (1000 * 60 * 60 * 24);
            return daysSince <= 90;
          }).length,
          avg_control_effectiveness: linkedControls.reduce((sum, c) => sum + (c.effectiveness || 0), 0) / Math.max(linkedControls.length, 1)
        }
      };

      const prompt = `As an expert risk quantification analyst, calculate an accurate AI-driven risk score:

RISK CONTEXT:
${JSON.stringify(context, null, 2)}

CALCULATE:

1. AI-Adjusted Likelihood (1-5):
   - Base on control test failure rates
   - Consider incident frequency patterns
   - Factor in control effectiveness
   - Account for emerging trends

2. AI-Adjusted Impact (1-5):
   - Analyze historical incident severity
   - Consider business process criticality
   - Account for control coverage gaps
   - Evaluate potential cascading effects

3. Dynamic Risk Score:
   - Primary score = likelihood × impact
   - Control effectiveness multiplier
   - Incident history adjustment
   - Trend velocity factor

4. Confidence Metrics:
   - Data sufficiency score (0-100%)
   - Prediction confidence (0-100%)
   - Recommendation strength

5. Score Rationale:
   - Key drivers of the score
   - Data patterns observed
   - Significant changes from current score

Be analytical and data-driven in your calculations.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            ai_likelihood: { type: "number" },
            ai_impact: { type: "number" },
            dynamic_score: { type: "number" },
            control_effectiveness_factor: { type: "number" },
            incident_history_factor: { type: "number" },
            trend_velocity: { type: "string" },
            confidence_score: { type: "number" },
            data_sufficiency: { type: "number" },
            score_rationale: { type: "string" },
            key_drivers: { type: "array", items: { type: "string" } },
            score_change_analysis: { type: "string" },
            recommended_actions: { type: "array", items: { type: "string" } },
            next_review_date: { type: "string" }
          }
        }
      });

      setScoreResult(result);
      toast.success("AI scoring complete");
    } catch (error) {
      console.error(error);
      toast.error("Failed to calculate AI score");
    } finally {
      setScoring(false);
    }
  };

  const applyAIScore = async () => {
    if (!selectedRisk || !scoreResult) return;

    const updateData = {
      likelihood: scoreResult.ai_likelihood,
      impact: scoreResult.ai_impact,
      dynamic_score: scoreResult.dynamic_score,
      control_effectiveness_factor: scoreResult.control_effectiveness_factor,
      incident_history_factor: scoreResult.incident_history_factor,
      last_assessment_date: new Date().toISOString()
    };

    updateMutation.mutate({ id: selectedRisk.id, data: updateData });
    setScoreResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Risk Selection */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base">Select Risk for AI Scoring</CardTitle>
        </CardHeader>
        <CardContent>
          <Select 
            value={selectedRisk?.id || ""} 
            onValueChange={(id) => {
              setSelectedRisk(risks.find(r => r.id === id));
              setScoreResult(null);
            }}
          >
            <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
              <SelectValue placeholder="Select a risk..." />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
              {risks.map(risk => (
                <SelectItem key={risk.id} value={risk.id}>
                  {risk.title} - Current Score: {(risk.likelihood || 0) * (risk.impact || 0)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedRisk && (
            <Button
              onClick={calculateAIScore}
              disabled={scoring}
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700"
            >
              {scoring ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Calculating AI Score...</>
              ) : (
                <><Calculator className="h-4 w-4 mr-2" /> Calculate AI Score</>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Score Results */}
      {scoreResult && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white">AI-Calculated Score</h3>
                <Button onClick={applyAIScore} className="bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Apply to Risk
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-[#1a2332] rounded-xl border border-rose-500/20 text-center">
                  <div className="text-xs text-slate-400 mb-1">Likelihood</div>
                  <div className="text-3xl font-bold text-rose-400">{scoreResult.ai_likelihood}</div>
                </div>
                <div className="p-4 bg-[#1a2332] rounded-xl border border-amber-500/20 text-center">
                  <div className="text-xs text-slate-400 mb-1">Impact</div>
                  <div className="text-3xl font-bold text-amber-400">{scoreResult.ai_impact}</div>
                </div>
                <div className="p-4 bg-[#1a2332] rounded-xl border border-purple-500/20 text-center">
                  <div className="text-xs text-slate-400 mb-1">Dynamic Score</div>
                  <div className="text-3xl font-bold text-purple-400">{scoreResult.dynamic_score}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-[#151d2e] rounded border border-[#2a3548]">
                  <Label className="text-xs text-slate-500 mb-2 block">Score Rationale:</Label>
                  <p className="text-sm text-slate-200">{scoreResult.score_rationale}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#151d2e] rounded border border-emerald-500/20">
                    <div className="text-xs text-slate-400 mb-1">Control Effectiveness</div>
                    <div className="text-sm font-semibold text-emerald-400">
                      Factor: {scoreResult.control_effectiveness_factor?.toFixed(2)}
                    </div>
                  </div>
                  <div className="p-3 bg-[#151d2e] rounded border border-amber-500/20">
                    <div className="text-xs text-slate-400 mb-1">Incident History</div>
                    <div className="text-sm font-semibold text-amber-400">
                      Factor: {scoreResult.incident_history_factor?.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-slate-500 mb-2 block">Key Drivers:</Label>
                  <div className="space-y-1">
                    {scoreResult.key_drivers?.map((driver, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <TrendingUp className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                        <span>{driver}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}