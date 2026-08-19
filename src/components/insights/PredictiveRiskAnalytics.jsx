import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, Brain, Loader2, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function PredictiveRiskAnalytics({ data }) {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);

  const runPredictiveAnalysis = async () => {
    setLoading(true);
    try {
      const riskData = (data.risks || []).map(r => ({
        title: r.risk_title,
        score: (r.residual_likelihood || 0) * (r.residual_impact || 0),
        category: r.category,
        status: r.status,
        created: r.created_date
      }));

      const incidentData = (data.incidents || []).map(i => ({
        title: i.incident_title,
        severity: i.severity,
        status: i.status,
        date: i.occurrence_date
      }));

      const controlData = (data.controls || []).map(c => ({
        name: c.control_name,
        effectiveness: c.effectiveness,
        type: c.control_type,
        last_test: c.last_test_date
      }));

      const prompt = `You are an AI risk analyst. Analyze this enterprise risk data and provide predictive insights.

RISK DATA:
${JSON.stringify(riskData.slice(0, 20), null, 2)}

INCIDENT DATA:
${JSON.stringify(incidentData.slice(0, 15), null, 2)}

CONTROL DATA:
${JSON.stringify(controlData.slice(0, 15), null, 2)}

ANALYZE AND PROVIDE:
1. 5 emerging risk predictions for the next 6 months (each with probability 0-100%, impact level, risk category, early warning indicators)
2. 3 risk trends with trajectory (increasing, stable, decreasing) and supporting evidence
3. 4 strategic recommendations based on predictive analysis
4. Overall risk outlook summary (50 words max)

Format as JSON with this structure:
{
  "emerging_risks": [{"risk": "...", "probability": 75, "impact": "high", "category": "...", "indicators": ["...", "..."]}],
  "trends": [{"trend": "...", "trajectory": "increasing", "evidence": "..."}],
  "recommendations": ["...", "...", "...", "..."],
  "outlook": "..."
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            emerging_risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  risk: { type: "string" },
                  probability: { type: "number" },
                  impact: { type: "string" },
                  category: { type: "string" },
                  indicators: { type: "array", items: { type: "string" } }
                }
              }
            },
            trends: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  trend: { type: "string" },
                  trajectory: { type: "string" },
                  evidence: { type: "string" }
                }
              }
            },
            recommendations: { type: "array", items: { type: "string" } },
            outlook: { type: "string" }
          }
        }
      });

      setPredictions(response);
      toast.success("Predictive analysis complete");
    } catch (error) {
      console.error(error);
      toast.error("Failed to run predictive analysis");
    } finally {
      setLoading(false);
    }
  };

  const riskScoreTrend = (data.risks || [])
    .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
    .reduce((acc, risk, idx) => {
      const month = new Date(risk.created_date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const existing = acc.find(a => a.month === month);
      const score = (risk.residual_likelihood || 0) * (risk.residual_impact || 0);
      
      if (existing) {
        existing.avgScore = (existing.avgScore * existing.count + score) / (existing.count + 1);
        existing.count++;
      } else {
        acc.push({ month, avgScore: score, count: 1 });
      }
      return acc;
    }, [])
    .slice(-6);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-5 w-5 text-indigo-400" />
              AI-Powered Predictive Risk Analytics
            </CardTitle>
            <Button 
              onClick={runPredictiveAnalysis}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Run Analysis
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 mb-4">
            Advanced machine learning algorithms analyze historical patterns, incident trends, and control effectiveness to predict future risks
          </p>
        </CardContent>
      </Card>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base">6-Month Risk Score Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={riskScoreTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
              <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend />
              <Line type="monotone" dataKey="avgScore" stroke="#6366f1" strokeWidth={2} name="Avg Risk Score" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {predictions && (
        <>
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-400" />
                Predicted Emerging Risks (Next 6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {predictions.emerging_risks?.map((risk, idx) => (
                  <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-white mb-2">{risk.risk}</h4>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-rose-500/20 text-rose-400">
                              {risk.probability}% Probability
                            </Badge>
                            <Badge className={`${
                              risk.impact === 'critical' || risk.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                              risk.impact === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {risk.impact} Impact
                            </Badge>
                            <Badge className="bg-indigo-500/20 text-indigo-400">{risk.category}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-slate-500">Early Warning Indicators:</div>
                        {risk.indicators?.map((indicator, i) => (
                          <div key={i} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-amber-400">⚠</span>
                            <span>{indicator}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  Risk Trends & Trajectories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {predictions.trends?.map((trend, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                      <div className="flex items-start gap-3">
                        {trend.trajectory === 'increasing' ? (
                          <TrendingUp className="h-4 w-4 text-rose-400 mt-1" />
                        ) : trend.trajectory === 'decreasing' ? (
                          <TrendingDown className="h-4 w-4 text-emerald-400 mt-1" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-amber-400 mt-1" />
                        )}
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white mb-1">{trend.trend}</div>
                          <div className="text-xs text-slate-400">{trend.evidence}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-400" />
                  Strategic Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {predictions.recommendations?.map((rec, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                      <div className="flex items-start gap-2">
                        <span className="text-indigo-400 font-bold">{idx + 1}.</span>
                        <span className="text-sm text-slate-300">{rec}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <CardContent className="p-6">
              <h4 className="text-sm font-semibold text-purple-400 mb-2">Overall Risk Outlook</h4>
              <p className="text-sm text-slate-300">{predictions.outlook}</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}