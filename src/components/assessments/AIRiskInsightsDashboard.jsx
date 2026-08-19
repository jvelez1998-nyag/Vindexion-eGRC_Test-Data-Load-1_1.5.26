import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, TrendingUp, AlertTriangle, Target, Sparkles, Loader2, ArrowUp, ArrowDown, Activity, Shield, Zap } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

export default function AIRiskInsightsDashboard({ assessments }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);

  const generateInsights = async () => {
    if (assessments.length === 0) {
      toast.error("No assessment data available");
      return;
    }

    setLoading(true);
    try {
      // Prepare historical data
      const historicalData = assessments.map(a => ({
        id: a.id,
        title: a.title,
        category: a.risk_category,
        type: a.assessment_type,
        inherent_likelihood: a.inherent_likelihood || 0,
        inherent_impact: a.inherent_impact || 0,
        residual_likelihood: a.residual_likelihood || 0,
        residual_impact: a.residual_impact || 0,
        control_effectiveness: a.control_effectiveness || 0,
        date: a.created_date,
        status: a.lifecycle_status
      }));

      const prompt = `You are an advanced risk intelligence analyst. Analyze this historical risk assessment data and provide comprehensive insights.

HISTORICAL RISK DATA:
${JSON.stringify(historicalData, null, 2)}

Provide detailed analysis including:

1. RISK TRENDS (last 6 months):
   - Overall risk trend direction
   - Category-specific trends
   - Control effectiveness trends
   - Key observations

2. PREDICTIVE ANALYTICS (next 6 months):
   - Identify 5 high-risk areas likely to emerge
   - Predict which risk categories will increase
   - Estimate likelihood of critical incidents
   - Project control effectiveness needs

3. ACTIONABLE RECOMMENDATIONS (top 10):
   - Specific mitigation strategies
   - Priority controls to implement
   - Resource allocation suggestions
   - Process improvements

4. RISK VELOCITY ANALYSIS:
   - Fastest growing risk categories
   - Risks with increasing impact
   - Areas requiring immediate attention

5. CONTROL GAP ANALYSIS:
   - Areas with weak control effectiveness
   - Recommended control enhancements
   - Budget priorities

6. EMERGING RISK PATTERNS:
   - New risk types appearing
   - Correlation patterns
   - Industry-specific threats

Return structured JSON with charts data and insights.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            overall_risk_score: { type: "number" },
            risk_trajectory: { type: "string", enum: ["improving", "stable", "deteriorating"] },
            trend_data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  month: { type: "string" },
                  inherent_risk: { type: "number" },
                  residual_risk: { type: "number" },
                  control_effectiveness: { type: "number" }
                }
              }
            },
            category_analysis: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  current_risk: { type: "number" },
                  predicted_risk: { type: "number" },
                  trend: { type: "string" },
                  change_percentage: { type: "number" }
                }
              }
            },
            predictions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  risk_area: { type: "string" },
                  probability: { type: "number" },
                  potential_impact: { type: "string" },
                  timeframe: { type: "string" },
                  warning_signs: { type: "array", items: { type: "string" } }
                }
              }
            },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  priority: { type: "number" },
                  title: { type: "string" },
                  description: { type: "string" },
                  expected_impact: { type: "string" },
                  effort: { type: "string" },
                  estimated_cost: { type: "string" }
                }
              }
            },
            risk_velocity: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  velocity_score: { type: "number" },
                  direction: { type: "string" }
                }
              }
            },
            control_gaps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  area: { type: "string" },
                  current_effectiveness: { type: "number" },
                  target_effectiveness: { type: "number" },
                  gap: { type: "number" },
                  recommendation: { type: "string" }
                }
              }
            },
            emerging_patterns: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  pattern: { type: "string" },
                  description: { type: "string" },
                  threat_level: { type: "string" }
                }
              }
            },
            key_metrics: {
              type: "object",
              properties: {
                avg_inherent_risk: { type: "number" },
                avg_residual_risk: { type: "number" },
                avg_control_effectiveness: { type: "number" },
                high_risk_count: { type: "number" },
                critical_gaps: { type: "number" }
              }
            }
          }
        }
      });

      setInsights(response);
      toast.success("AI insights generated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate insights");
    } finally {
      setLoading(false);
    }
  };

  if (!insights && !loading) {
    return (
      <Card className="bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-blue-500/10 border-purple-500/20">
        <CardContent className="p-12 text-center">
          <div className="mb-6">
            <div className="inline-flex p-4 rounded-full bg-purple-500/20 border border-purple-500/30 mb-4">
              <Brain className="h-12 w-12 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">AI Risk Intelligence Dashboard</h3>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Leverage advanced AI to analyze historical risk data, predict future trends, and receive actionable recommendations for enhanced risk management.
            </p>
          </div>
          <Button 
            onClick={generateInsights}
            disabled={loading || assessments.length === 0}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Analyzing {assessments.length} Assessments...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Generate AI Insights
              </>
            )}
          </Button>
          {assessments.length === 0 && (
            <p className="text-sm text-amber-400 mt-4">No assessment data available. Please create assessments first.</p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="bg-[#1a2332] border-[#2a3548] p-12">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Processing Risk Intelligence</h3>
          <p className="text-slate-400">Analyzing trends, generating predictions, and formulating recommendations...</p>
        </div>
      </Card>
    );
  }

  const trajectoryConfig = {
    improving: { color: "text-emerald-400", icon: ArrowDown, bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
    stable: { color: "text-blue-400", icon: Activity, bg: "bg-blue-500/10", border: "border-blue-500/30" },
    deteriorating: { color: "text-rose-400", icon: ArrowUp, bg: "bg-rose-500/10", border: "border-rose-500/30" }
  };

  const trajectory = trajectoryConfig[insights.risk_trajectory] || trajectoryConfig.stable;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-400" />
            AI Risk Intelligence
          </h2>
          <p className="text-sm text-slate-400 mt-1">Advanced predictive analytics and strategic recommendations</p>
        </div>
        <Button 
          onClick={generateInsights}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Refresh Insights
        </Button>
      </div>

      {/* Executive Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`${trajectory.bg} border ${trajectory.border} p-5`}>
          <div className="flex items-center justify-between mb-3">
            <trajectory.icon className={`h-6 w-6 ${trajectory.color}`} />
            <Badge className={`${trajectory.bg} ${trajectory.color} border ${trajectory.border}`}>
              {insights.risk_trajectory}
            </Badge>
          </div>
          <div className="text-sm text-slate-400">Risk Trajectory</div>
          <div className="text-2xl font-bold text-white mt-1">
            {insights.overall_risk_score.toFixed(1)}/10
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 p-5">
          <div className="flex items-center justify-between mb-3">
            <AlertTriangle className="h-6 w-6 text-amber-400" />
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
              Critical
            </Badge>
          </div>
          <div className="text-sm text-slate-400">High Risk Areas</div>
          <div className="text-2xl font-bold text-white mt-1">
            {insights.key_metrics.high_risk_count}
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20 p-5">
          <div className="flex items-center justify-between mb-3">
            <Shield className="h-6 w-6 text-rose-400" />
            <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">
              Gaps
            </Badge>
          </div>
          <div className="text-sm text-slate-400">Control Gaps</div>
          <div className="text-2xl font-bold text-white mt-1">
            {insights.key_metrics.critical_gaps}
          </div>
        </Card>
      </div>

      {/* Executive Summary Text */}
      <Card className="bg-gradient-to-r from-[#1a2332] to-[#151d2e] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-400" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 leading-relaxed">{insights.executive_summary}</p>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="bg-[#1a2332] border border-[#2a3548]">
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
          <TabsTrigger value="predictions">Predictive Analytics</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="velocity">Risk Velocity</TabsTrigger>
          <TabsTrigger value="gaps">Control Gaps</TabsTrigger>
        </TabsList>

        {/* Trend Analysis */}
        <TabsContent value="trends" className="space-y-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-lg">Risk Trends Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={insights.trend_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="inherent_risk" stackId="1" stroke="#ef4444" fill="#ef444440" name="Inherent Risk" />
                  <Area type="monotone" dataKey="residual_risk" stackId="2" stroke="#f59e0b" fill="#f59e0b40" name="Residual Risk" />
                  <Line type="monotone" dataKey="control_effectiveness" stroke="#10b981" strokeWidth={2} name="Control Effectiveness" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-lg">Category Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={insights.category_analysis}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                  <XAxis dataKey="category" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend />
                  <Bar dataKey="current_risk" fill="#6366f1" name="Current Risk" />
                  <Bar dataKey="predicted_risk" fill="#a855f7" name="Predicted Risk" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {insights.category_analysis.map((cat, idx) => (
              <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white capitalize">{cat.category}</h4>
                  <Badge className={`${
                    cat.trend === 'increasing' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                    cat.trend === 'decreasing' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                    'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  }`}>
                    {cat.change_percentage > 0 ? '+' : ''}{cat.change_percentage}%
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-slate-500 text-xs">Current</div>
                    <div className="text-white font-semibold">{cat.current_risk.toFixed(1)}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs">Predicted</div>
                    <div className="text-white font-semibold">{cat.predicted_risk.toFixed(1)}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Predictions */}
        <TabsContent value="predictions" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4 pr-4">
              {insights.predictions.map((pred, idx) => (
                <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-amber-400" />
                        <h3 className="font-semibold text-white text-lg">{pred.risk_area}</h3>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">
                          {pred.probability}% Probability
                        </Badge>
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                          {pred.potential_impact}
                        </Badge>
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          {pred.timeframe}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#1a2332] rounded-lg p-3">
                    <p className="text-xs text-slate-400 font-medium mb-2">Warning Signs:</p>
                    <ul className="space-y-1">
                      {pred.warning_signs.map((sign, i) => (
                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                          <Zap className="h-3 w-3 text-amber-400 mt-0.5 flex-shrink-0" />
                          {sign}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>

          {insights.emerging_patterns.length > 0 && (
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-lg">Emerging Risk Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.emerging_patterns.map((pattern, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-white">{pattern.pattern}</h4>
                        <Badge className={`${
                          pattern.threat_level === 'high' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                          pattern.threat_level === 'medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                          'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }`}>
                          {pattern.threat_level}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400">{pattern.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Recommendations */}
        <TabsContent value="recommendations">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4 pr-4">
              {insights.recommendations.sort((a, b) => a.priority - b.priority).map((rec, idx) => (
                <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-5">
                  <div className="flex items-start gap-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${
                      rec.priority === 1 ? 'bg-rose-500/20 text-rose-400 border-2 border-rose-500/30' :
                      rec.priority <= 3 ? 'bg-orange-500/20 text-orange-400 border-2 border-orange-500/30' :
                      'bg-blue-500/20 text-blue-400 border-2 border-blue-500/30'
                    }`}>
                      {rec.priority}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-lg mb-2">{rec.title}</h3>
                      <p className="text-slate-300 mb-3">{rec.description}</p>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-[#1a2332] rounded p-2">
                          <div className="text-xs text-slate-500 mb-1">Expected Impact</div>
                          <div className="text-sm font-medium text-emerald-400">{rec.expected_impact}</div>
                        </div>
                        <div className="bg-[#1a2332] rounded p-2">
                          <div className="text-xs text-slate-500 mb-1">Effort</div>
                          <div className="text-sm font-medium text-blue-400">{rec.effort}</div>
                        </div>
                        <div className="bg-[#1a2332] rounded p-2">
                          <div className="text-xs text-slate-500 mb-1">Est. Cost</div>
                          <div className="text-sm font-medium text-amber-400">{rec.estimated_cost}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Risk Velocity */}
        <TabsContent value="velocity">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-lg">Risk Velocity Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={insights.risk_velocity}>
                  <PolarGrid stroke="#2a3548" />
                  <PolarAngleAxis dataKey="category" stroke="#94a3b8" />
                  <PolarRadiusAxis stroke="#94a3b8" />
                  <Radar name="Velocity Score" dataKey="velocity_score" stroke="#a855f7" fill="#a855f7" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {insights.risk_velocity.map((vel, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white capitalize">{vel.category}</h4>
                      <Badge className={`${
                        vel.direction === 'accelerating' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                        vel.direction === 'decelerating' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                        'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      }`}>
                        {vel.direction}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-white">{vel.velocity_score.toFixed(1)}</div>
                    <div className="text-xs text-slate-500">Velocity Score</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Control Gaps */}
        <TabsContent value="gaps">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4 pr-4">
              {insights.control_gaps.map((gap, idx) => (
                <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-white text-lg">{gap.area}</h3>
                    <Badge className={`${
                      gap.gap >= 3 ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                      gap.gap >= 2 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                      'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    }`}>
                      Gap: {gap.gap.toFixed(1)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="bg-[#1a2332] rounded p-3 text-center">
                      <div className="text-xs text-slate-500 mb-1">Current</div>
                      <div className="text-xl font-bold text-white">{gap.current_effectiveness.toFixed(1)}</div>
                    </div>
                    <div className="bg-[#1a2332] rounded p-3 text-center">
                      <div className="text-xs text-slate-500 mb-1">Target</div>
                      <div className="text-xl font-bold text-emerald-400">{gap.target_effectiveness.toFixed(1)}</div>
                    </div>
                    <div className="bg-[#1a2332] rounded p-3 text-center">
                      <div className="text-xs text-slate-500 mb-1">Gap</div>
                      <div className="text-xl font-bold text-rose-400">{gap.gap.toFixed(1)}</div>
                    </div>
                  </div>
                  <div className="bg-indigo-500/5 rounded-lg p-3">
                    <p className="text-xs text-indigo-400 font-medium mb-1">Recommendation:</p>
                    <p className="text-sm text-slate-300">{gap.recommendation}</p>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}