import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Loader2, TrendingUp, TrendingDown, Activity, RefreshCw, Zap } from "lucide-react";
import { toast } from "sonner";

export default function AIRiskScoreUpdater({ risks, controls, incidents, onScoresUpdated }) {
  const [loading, setLoading] = useState(false);
  const [updates, setUpdates] = useState([]);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(false);
  const queryClient = useQueryClient();

  const updateRiskMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Risk.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
    }
  });

  const calculateDynamicScores = async () => {
    setLoading(true);
    setUpdates([]);
    
    try {
      // Limit concurrent API calls to prevent freezing
      const batchSize = 3;
      const results = [];
      
      for (let i = 0; i < risks.length; i += batchSize) {
        const batch = risks.slice(i, i + batchSize);
        const batchPromises = batch.map(async (risk) => {
        // Get recent incidents related to this risk
        const relatedIncidents = incidents.filter(i => 
          risk.linked_incidents?.includes(i.id) ||
          i.incident_type?.toLowerCase().includes(risk.category?.toLowerCase()) ||
          i.description?.toLowerCase().includes(risk.title?.toLowerCase())
        );

        const recentIncidents = relatedIncidents.filter(i =>
          new Date(i.created_date) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        );

        // Get linked controls
        const linkedControls = controls.filter(c => risk.linked_controls?.includes(c.id));
        const avgControlEffectiveness = linkedControls.length > 0
          ? linkedControls.reduce((sum, c) => sum + (c.effectiveness || 3), 0) / linkedControls.length
          : 3;

        const prompt = `As a dynamic risk scoring expert, calculate updated risk scores based on current data.

RISK DETAILS:
Title: ${risk.title}
Category: ${risk.category}
Current Inherent: ${risk.inherent_likelihood}x${risk.inherent_impact} = ${risk.inherent_risk_score}
Current Residual: ${risk.residual_likelihood || 0}x${risk.residual_impact || 0} = ${risk.residual_risk_score || 0}
Status: ${risk.status}

CONTROL ENVIRONMENT:
Linked Controls: ${linkedControls.length}
Average Control Effectiveness: ${avgControlEffectiveness.toFixed(1)}/5
Control Details:
${linkedControls.slice(0, 5).map(c => `- ${c.name}: ${c.effectiveness}/5 (${c.status})`).join('\n')}

INCIDENT HISTORY:
Total Related Incidents: ${relatedIncidents.length}
Recent Incidents (90 days): ${recentIncidents.length}
Critical Incidents: ${relatedIncidents.filter(i => i.severity === 'critical').length}

Recent Incident Details:
${recentIncidents.slice(0, 3).map(i => `- ${i.title} (${i.severity}, ${i.status})`).join('\n')}

TASK: Calculate updated risk scores considering:
1. Control effectiveness (higher effectiveness = lower residual risk)
2. Recent incident frequency (more incidents = higher likelihood)
3. Incident severity (critical incidents = higher impact)
4. Current mitigation progress

Return NUMERIC scores (1-5) and clear rationale.`;

        const response = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              updated_inherent_likelihood: { type: "number" },
              updated_inherent_impact: { type: "number" },
              updated_residual_likelihood: { type: "number" },
              updated_residual_impact: { type: "number" },
              control_effectiveness_factor: { type: "number" },
              incident_history_factor: { type: "number" },
              dynamic_score: { type: "number" },
              score_change_rationale: { type: "string" },
              trend: { type: "string" },
              confidence: { type: "string" }
            }
          }
        });

        const inherentScore = response.updated_inherent_likelihood * response.updated_inherent_impact;
        const residualScore = response.updated_residual_likelihood * response.updated_residual_impact;

        return {
          riskId: risk.id,
          riskTitle: risk.title,
          oldInherentScore: risk.inherent_risk_score,
          newInherentScore: inherentScore,
          oldResidualScore: risk.residual_risk_score,
          newResidualScore: residualScore,
          updates: {
            inherent_likelihood: response.updated_inherent_likelihood,
            inherent_impact: response.updated_inherent_impact,
            inherent_risk_score: inherentScore,
            residual_likelihood: response.updated_residual_likelihood,
            residual_impact: response.updated_residual_impact,
            residual_risk_score: residualScore,
            control_effectiveness_factor: response.control_effectiveness_factor,
            incident_history_factor: response.incident_history_factor,
            dynamic_score: response.dynamic_score,
            last_assessment_date: new Date().toISOString()
          },
          rationale: response.score_change_rationale,
          trend: response.trend,
          confidence: response.confidence
        };
        });
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }
      
      setUpdates(results);
      toast.success(`Dynamic scores calculated for ${results.length} risks`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to calculate dynamic scores");
    } finally {
      setLoading(false);
    }
  };

  const applyAllUpdates = async () => {
    for (const update of updates) {
      await updateRiskMutation.mutateAsync({
        id: update.riskId,
        data: update.updates
      });
    }
    toast.success("All risk scores updated");
    if (onScoresUpdated) onScoresUpdated();
    setUpdates([]);
  };

  const trendColors = {
    increasing: 'text-rose-400',
    decreasing: 'text-emerald-400',
    stable: 'text-slate-400'
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20">
              <Activity className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">AI Dynamic Risk Scoring</h3>
              <p className="text-xs text-slate-400">Automatically update risk scores based on controls and incidents</p>
            </div>
          </div>
          <Button
            onClick={calculateDynamicScores}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Calculate Scores
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="p-3 bg-[#151d2e] rounded-lg border border-[#2a3548]">
            <div className="text-2xl font-bold text-indigo-400">{risks.length}</div>
            <div className="text-xs text-slate-500">Risks to Analyze</div>
          </div>
          <div className="p-3 bg-[#151d2e] rounded-lg border border-[#2a3548]">
            <div className="text-2xl font-bold text-blue-400">{controls.length}</div>
            <div className="text-xs text-slate-500">Controls Evaluated</div>
          </div>
          <div className="p-3 bg-[#151d2e] rounded-lg border border-[#2a3548]">
            <div className="text-2xl font-bold text-amber-400">{incidents.length}</div>
            <div className="text-xs text-slate-500">Incidents Analyzed</div>
          </div>
        </div>
      </Card>

      {updates.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-white">Calculated Updates ({updates.length})</h4>
            <Button onClick={applyAllUpdates} disabled={updateRiskMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700">
              <Zap className="h-4 w-4 mr-2" />
              Apply All Updates
            </Button>
          </div>

          <div className="space-y-3">
            {updates.map((update, idx) => {
              const inherentChange = update.newInherentScore - (update.oldInherentScore || 0);
              const residualChange = update.newResidualScore - (update.oldResidualScore || 0);

              return (
                <Card key={idx} className="bg-[#1a2332] border-[#2a3548] p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h5 className="font-medium text-white flex-1">{update.riskTitle}</h5>
                    <div className="flex items-center gap-2">
                      {update.trend === 'increasing' && <TrendingUp className="h-4 w-4 text-rose-400" />}
                      {update.trend === 'decreasing' && <TrendingDown className="h-4 w-4 text-emerald-400" />}
                      <span className={`text-sm font-semibold ${trendColors[update.trend]}`}>
                        {update.trend}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-[#151d2e] rounded-lg border border-[#2a3548]">
                      <div className="text-xs text-slate-500 mb-1">Inherent Risk</div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-orange-400">{update.oldInherentScore || 0}</span>
                        <span className="text-slate-500">→</span>
                        <span className="text-lg font-bold text-rose-400">{update.newInherentScore}</span>
                        {inherentChange !== 0 && (
                          <Badge className={`text-[10px] ${inherentChange > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            {inherentChange > 0 ? '+' : ''}{inherentChange}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-[#151d2e] rounded-lg border border-[#2a3548]">
                      <div className="text-xs text-slate-500 mb-1">Residual Risk</div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-amber-400">{update.oldResidualScore || 0}</span>
                        <span className="text-slate-500">→</span>
                        <span className="text-lg font-bold text-blue-400">{update.newResidualScore}</span>
                        {residualChange !== 0 && (
                          <Badge className={`text-[10px] ${residualChange > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            {residualChange > 0 ? '+' : ''}{residualChange}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#151d2e] rounded-lg border border-[#2a3548] mb-3">
                    <div className="text-xs text-slate-500 mb-2">AI Rationale</div>
                    <p className="text-sm text-slate-300">{update.rationale}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-slate-500">Control Factor: </span>
                        <span className="text-white">{update.updates.control_effectiveness_factor?.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Incident Factor: </span>
                        <span className="text-white">{update.updates.incident_history_factor?.toFixed(2)}</span>
                      </div>
                    </div>
                    <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                      {update.confidence} Confidence
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}