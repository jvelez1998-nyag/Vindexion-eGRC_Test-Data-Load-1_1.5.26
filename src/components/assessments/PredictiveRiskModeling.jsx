import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Brain, TrendingUp, AlertTriangle, Sparkles, Loader2, Target, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function PredictiveRiskModeling({ assessments }) {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);

  const generatePredictions = async () => {
    setLoading(true);
    try {
      const assessmentSummary = assessments.map(a => ({
        type: a.assessment_type,
        category: a.risk_category,
        inherent_score: (a.inherent_likelihood || 0) * (a.inherent_impact || 0),
        residual_score: (a.residual_likelihood || 0) * (a.residual_impact || 0),
        date: a.created_date
      }));

      const prompt = `You are a predictive risk analytics expert. Analyze this risk assessment history:

${JSON.stringify(assessmentSummary, null, 2)}

Provide predictions for:
1. Emerging risk trends (which categories are increasing)
2. Likelihood of new critical risks in next 90 days (0-100%)
3. Top 3 risk areas requiring immediate attention
4. Control effectiveness trends
5. Recommended preventive actions
6. Risk velocity (rate of change)`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            emerging_trends: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  trend: { type: "string" },
                  confidence: { type: "number" }
                }
              }
            },
            critical_risk_probability: { type: "number" },
            attention_areas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  area: { type: "string" },
                  reason: { type: "string" },
                  urgency: { type: "string" }
                }
              }
            },
            control_effectiveness_trend: { type: "string" },
            preventive_actions: { type: "array", items: { type: "string" } },
            risk_velocity: { type: "string" },
            forecast_data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  month: { type: "string" },
                  predicted_critical: { type: "number" },
                  predicted_high: { type: "number" },
                  confidence_interval: { type: "number" }
                }
              }
            }
          }
        }
      });

      setPredictions(response);
      toast.success("Predictions generated successfully");
    } catch (error) {
      toast.error("Failed to generate predictions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-violet-400" />
                Predictive Risk Modeling
              </CardTitle>
              <p className="text-xs text-slate-400 mt-1">AI-powered risk forecasting and trend analysis</p>
            </div>
            <Button
              onClick={generatePredictions}
              disabled={loading || assessments.length === 0}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate Predictions
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!predictions && !loading && (
            <div className="text-center py-12">
              <Brain className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-2">No predictions generated yet</p>
              <p className="text-xs text-slate-500">Click "Generate Predictions" to analyze risk trends</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 text-violet-400 mx-auto mb-4 animate-spin" />
              <p className="text-slate-400">Analyzing risk patterns and generating predictions...</p>
            </div>
          )}

          {predictions && !loading && (
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="bg-[#151d2e] border border-[#2a3548]">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
                <TabsTrigger value="forecast">Forecast</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* Critical Risk Probability */}
                <Card className="bg-[#151d2e] border-[#2a3548]">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-rose-400" />
                        <span className="text-sm text-slate-400">Critical Risk Probability (90 days)</span>
                      </div>
                      <div className="text-3xl font-bold text-white">{predictions.critical_risk_probability}%</div>
                    </div>
                    <div className="w-full bg-[#1a2332] rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-amber-500 to-rose-500 h-2 rounded-full transition-all"
                        style={{ width: `${predictions.critical_risk_probability}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Risk Velocity */}
                <Card className="bg-[#151d2e] border-[#2a3548]">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-5 w-5 text-amber-400" />
                      <span className="text-sm text-slate-400">Risk Velocity</span>
                    </div>
                    <p className="text-white">{predictions.risk_velocity}</p>
                  </CardContent>
                </Card>

                {/* Control Effectiveness */}
                <Card className="bg-[#151d2e] border-[#2a3548]">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-emerald-400" />
                      <span className="text-sm text-slate-400">Control Effectiveness Trend</span>
                    </div>
                    <p className="text-white">{predictions.control_effectiveness_trend}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trends" className="space-y-4">
                <div className="grid gap-4">
                  {predictions.emerging_trends?.map((trend, idx) => (
                    <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-white capitalize">{trend.category}</h4>
                            <p className="text-sm text-slate-400 mt-1">{trend.trend}</p>
                          </div>
                          <Badge className={`${
                            trend.confidence >= 80 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                            trend.confidence >= 60 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                            'bg-slate-500/20 text-slate-400 border-slate-500/30'
                          }`}>
                            {trend.confidence}% confidence
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="forecast">
                {predictions.forecast_data && predictions.forecast_data.length > 0 && (
                  <Card className="bg-[#151d2e] border-[#2a3548]">
                    <CardHeader>
                      <CardTitle className="text-base">90-Day Risk Forecast</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={predictions.forecast_data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                          <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                          <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                          <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548' }} />
                          <Legend wrapperStyle={{ fontSize: '11px' }} />
                          <Line type="monotone" dataKey="predicted_critical" stroke="#ef4444" strokeWidth={2} name="Critical Risks" />
                          <Line type="monotone" dataKey="predicted_high" stroke="#f59e0b" strokeWidth={2} name="High Risks" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="actions" className="space-y-4">
                {/* Attention Areas */}
                <div>
                  <h3 className="text-sm font-medium text-white mb-3">Priority Attention Areas</h3>
                  <div className="space-y-3">
                    {predictions.attention_areas?.map((area, idx) => (
                      <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Target className="h-4 w-4 text-amber-400" />
                                <h4 className="font-medium text-white">{area.area}</h4>
                              </div>
                              <p className="text-sm text-slate-400">{area.reason}</p>
                            </div>
                            <Badge className={`${
                              area.urgency === 'high' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                              area.urgency === 'medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                              'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            }`}>
                              {area.urgency} urgency
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Preventive Actions */}
                <div>
                  <h3 className="text-sm font-medium text-white mb-3">Recommended Preventive Actions</h3>
                  <Card className="bg-[#151d2e] border-[#2a3548]">
                    <CardContent className="p-4">
                      <ul className="space-y-2">
                        {predictions.preventive_actions?.map((action, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                            <span className="text-emerald-400 mt-0.5">→</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}