import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Loader2, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

export default function ControlFailurePrediction({ data }) {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);

  const predictFailures = async () => {
    setLoading(true);
    try {
      const controlData = data.controls.map(c => ({
        id: c.id,
        name: c.control_name,
        type: c.control_type,
        effectiveness: c.effectiveness,
        frequency: c.frequency,
        last_test: c.last_test_date,
        days_since_test: c.last_test_date ? Math.floor((new Date() - new Date(c.last_test_date)) / (1000 * 60 * 60 * 24)) : 999,
        owner: c.control_owner,
        automated: c.is_automated
      }));

      const incidentHistory = data.incidents.filter(i => i.linked_controls?.length > 0).map(i => ({
        linked_controls: i.linked_controls,
        severity: i.severity,
        date: i.occurrence_date
      }));

      const prompt = `You are an AI control effectiveness predictor. Analyze control data and incident history to predict potential control failures.

CONTROL DATA (n=${controlData.length}):
${JSON.stringify(controlData.slice(0, 30), null, 2)}

INCIDENT HISTORY WITH CONTROL LINKS (n=${incidentHistory.length}):
${JSON.stringify(incidentHistory.slice(0, 15), null, 2)}

PREDICT CONTROL FAILURES:
1. Identify 8-10 controls at highest risk of failure in next 90 days
2. For each: control_name, failure_probability (0-100), risk_factors (array), predicted_impact, time_to_failure_days, mitigation_actions (array)
3. Consider: test frequency, last test date, effectiveness trends, linked incident patterns, automation status
4. Provide early warning indicators

Return JSON:
{
  "high_risk_controls": [{"control": "...", "probability": 75, "risk_factors": ["...", "..."], "impact": "...", "days_to_failure": 30, "mitigations": ["...", "..."]}],
  "summary": {"total_at_risk": 10, "critical": 3, "high": 4, "medium": 3}
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            high_risk_controls: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  control: { type: "string" },
                  probability: { type: "number" },
                  risk_factors: { type: "array", items: { type: "string" } },
                  impact: { type: "string" },
                  days_to_failure: { type: "number" },
                  mitigations: { type: "array", items: { type: "string" } }
                }
              }
            },
            summary: {
              type: "object",
              properties: {
                total_at_risk: { type: "number" },
                critical: { type: "number" },
                high: { type: "number" },
                medium: { type: "number" }
              }
            }
          }
        }
      });

      setPredictions(response);
      toast.success(`Identified ${response.summary?.total_at_risk || 0} controls at risk`);
    } catch (error) {
      console.error(error);
      toast.error("Control failure prediction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-400" />
              Control Failure Prediction Engine
            </CardTitle>
            <Button 
              onClick={predictFailures}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <AlertTriangle className="h-4 w-4 mr-2" />}
              Predict Failures
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400">
            Predictive models analyze control testing history, effectiveness trends, and incident patterns to forecast potential control failures
          </p>
        </CardContent>
      </Card>

      {predictions && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-white mb-1">{predictions.summary?.total_at_risk || 0}</div>
                <div className="text-xs text-slate-400">Controls At Risk</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-rose-400 mb-1">{predictions.summary?.critical || 0}</div>
                <div className="text-xs text-slate-400">Critical Risk</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-amber-400 mb-1">{predictions.summary?.high || 0}</div>
                <div className="text-xs text-slate-400">High Risk</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/20">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-400 mb-1">{predictions.summary?.medium || 0}</div>
                <div className="text-xs text-slate-400">Medium Risk</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {predictions.high_risk_controls?.map((control, idx) => (
              <Card key={idx} className="bg-[#1a2332] border-[#2a3548] hover:border-blue-500/40 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${
                      control.probability >= 75 ? 'bg-rose-500/20' :
                      control.probability >= 50 ? 'bg-amber-500/20' :
                      'bg-yellow-500/20'
                    }`}>
                      <Shield className={`h-5 w-5 ${
                        control.probability >= 75 ? 'text-rose-400' :
                        control.probability >= 50 ? 'text-amber-400' :
                        'text-yellow-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-base font-semibold text-white mb-2">{control.control}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className={`${
                              control.probability >= 75 ? 'bg-rose-500/20 text-rose-400' :
                              control.probability >= 50 ? 'bg-amber-500/20 text-amber-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {control.probability}% Failure Risk
                            </Badge>
                            <Badge className="bg-blue-500/20 text-blue-400">
                              {control.days_to_failure} days
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="text-xs text-slate-500 mb-2">Failure Probability</div>
                        <Progress value={control.probability} className="h-2" />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
                        <div className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                          <div className="text-xs font-semibold text-slate-400 mb-2">Risk Factors:</div>
                          <ul className="space-y-1">
                            {control.risk_factors?.map((factor, i) => (
                              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                                <span className="text-rose-400">•</span>
                                <span>{factor}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <div className="text-xs font-semibold text-emerald-400 mb-2">Mitigation Actions:</div>
                          <ul className="space-y-1">
                            {control.mitigations?.map((action, i) => (
                              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                                <span className="text-emerald-400">✓</span>
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                        <div className="text-xs font-semibold text-indigo-400 mb-1">Predicted Impact:</div>
                        <div className="text-sm text-slate-300">{control.impact}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}