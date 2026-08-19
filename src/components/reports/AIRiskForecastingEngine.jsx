import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, AlertTriangle, Target, Brain, 
  Loader2, LineChart, BarChart3, Activity, Zap
} from "lucide-react";
import { toast } from "sonner";
import { LineChart as RechartsLine, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

export default function AIRiskForecastingEngine({ data }) {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeHorizon, setTimeHorizon] = useState("6months");

  const generateForecast = async () => {
    setLoading(true);
    try {
      // Prepare historical data analysis
      const risksByMonth = {};
      const incidentsByMonth = {};
      const controlFailuresByMonth = {};

      // Aggregate historical data by month
      data.risks?.forEach(risk => {
        const month = new Date(risk.created_date).toISOString().slice(0, 7);
        if (!risksByMonth[month]) risksByMonth[month] = { total: 0, high: 0, critical: 0 };
        risksByMonth[month].total++;
        if (risk.overall_risk_rating === 'high') risksByMonth[month].high++;
        if (risk.overall_risk_rating === 'critical') risksByMonth[month].critical++;
      });

      data.incidents?.forEach(incident => {
        const month = new Date(incident.reported_date || incident.created_date).toISOString().slice(0, 7);
        if (!incidentsByMonth[month]) incidentsByMonth[month] = { total: 0, severe: 0 };
        incidentsByMonth[month].total++;
        if (incident.severity === 'high' || incident.severity === 'critical') incidentsByMonth[month].severe++;
      });

      data.controls?.forEach(control => {
        if (control.status === 'ineffective') {
          const month = new Date(control.updated_date || control.created_date).toISOString().slice(0, 7);
          if (!controlFailuresByMonth[month]) controlFailuresByMonth[month] = 0;
          controlFailuresByMonth[month]++;
        }
      });

      const prompt = `You are an advanced GRC predictive analytics AI. Analyze the following historical data and generate forecasts for the next ${timeHorizon === '3months' ? '3 months' : timeHorizon === '6months' ? '6 months' : '12 months'}.

HISTORICAL DATA SUMMARY:
- Total Risks: ${data.risks?.length || 0}
- High/Critical Risks: ${data.risks?.filter(r => r.overall_risk_rating === 'high' || r.overall_risk_rating === 'critical').length || 0}
- Total Incidents: ${data.incidents?.length || 0}
- High Severity Incidents: ${data.incidents?.filter(i => i.severity === 'high' || i.severity === 'critical').length || 0}
- Ineffective Controls: ${data.controls?.filter(c => c.status === 'ineffective').length || 0}
- Total Controls: ${data.controls?.length || 0}

RISK TRENDS BY MONTH:
${Object.entries(risksByMonth).slice(-6).map(([month, stats]) => 
  `${month}: ${stats.total} total (${stats.high} high, ${stats.critical} critical)`
).join('\n')}

INCIDENT TRENDS BY MONTH:
${Object.entries(incidentsByMonth).slice(-6).map(([month, stats]) => 
  `${month}: ${stats.total} total (${stats.severe} severe)`
).join('\n')}

Generate a comprehensive forecast that includes:
1. Risk trend forecast (predict total risks, high-risk count, critical-risk count for each of the next periods)
2. Incident forecast (predict incident volumes and severity distribution)
3. Control effectiveness trend
4. High-impact event predictions (top 5 most likely events with probability %)
5. Risk category trends (which categories will see increases/decreases)
6. Early warning indicators (key metrics to watch)
7. Recommended preventive actions

Provide quantitative predictions based on trend analysis, seasonality, and statistical patterns.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            forecast_summary: { type: "string" },
            risk_forecast: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  period: { type: "string" },
                  total_risks: { type: "number" },
                  high_risks: { type: "number" },
                  critical_risks: { type: "number" },
                  confidence: { type: "number" }
                }
              }
            },
            incident_forecast: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  period: { type: "string" },
                  total_incidents: { type: "number" },
                  severe_incidents: { type: "number" },
                  confidence: { type: "number" }
                }
              }
            },
            control_effectiveness_trend: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  period: { type: "string" },
                  effectiveness_score: { type: "number" }
                }
              }
            },
            high_impact_events: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  event: { type: "string" },
                  probability: { type: "number" },
                  impact: { type: "string" },
                  category: { type: "string" }
                }
              }
            },
            category_trends: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  trend: { type: "string" },
                  change_percentage: { type: "number" }
                }
              }
            },
            early_warnings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  indicator: { type: "string" },
                  current_value: { type: "string" },
                  threshold: { type: "string" },
                  status: { type: "string" }
                }
              }
            },
            preventive_actions: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setForecast(result);
      toast.success("Forecast generated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate forecast");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
              <Brain className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">AI Risk Forecasting Engine</h2>
              <p className="text-slate-400 text-sm mt-1">
                Predictive analytics for future risk trends and high-impact events
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(e.target.value)}
              className="bg-[#151d2e] border-[#2a3548] text-white rounded-lg px-4 py-2 text-sm"
            >
              <option value="3months">3 Months</option>
              <option value="6months">6 Months</option>
              <option value="12months">12 Months</option>
            </select>
            <Button 
              onClick={generateForecast}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
              ) : (
                <><TrendingUp className="h-4 w-4 mr-2" /> Generate Forecast</>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {forecast && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-[#1a2332] border border-[#2a3548]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="risks">Risk Forecast</TabsTrigger>
            <TabsTrigger value="incidents">Incident Forecast</TabsTrigger>
            <TabsTrigger value="events">High-Impact Events</TabsTrigger>
            <TabsTrigger value="warnings">Early Warnings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-400" />
                  Forecast Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed">{forecast.forecast_summary}</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {forecast.category_trends?.slice(0, 3).map((trend, idx) => (
                <Card key={idx} className="bg-[#1a2332] border-[#2a3548] p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-semibold text-white">{trend.category}</h4>
                    <Badge className={
                      trend.trend === 'increasing' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                      trend.trend === 'decreasing' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }>
                      {trend.trend}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {trend.change_percentage > 0 ? '+' : ''}{trend.change_percentage}%
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Projected change</p>
                </Card>
              ))}
            </div>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base">Preventive Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {forecast.preventive_actions?.map((action, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        {idx + 1}
                      </Badge>
                      <p className="text-sm text-slate-300 flex-1">{action}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risks">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base">Risk Volume Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={forecast.risk_forecast}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                    <XAxis dataKey="period" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                      labelStyle={{ color: '#e2e8f0' }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="total_risks" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} name="Total Risks" />
                    <Area type="monotone" dataKey="high_risks" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="High Risks" />
                    <Area type="monotone" dataKey="critical_risks" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Critical Risks" />
                  </AreaChart>
                </ResponsiveContainer>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {forecast.risk_forecast?.slice(0, 3).map((period, idx) => (
                    <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-4">
                      <h4 className="text-sm text-slate-400 mb-2">{period.period}</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300">Total:</span>
                          <span className="text-white font-semibold">{period.total_risks}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300">High:</span>
                          <span className="text-amber-400 font-semibold">{period.high_risks}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300">Critical:</span>
                          <span className="text-rose-400 font-semibold">{period.critical_risks}</span>
                        </div>
                      </div>
                      <Badge className="mt-3 bg-indigo-500/20 text-indigo-400 border-indigo-500/30 text-xs">
                        {period.confidence}% confidence
                      </Badge>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incidents">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base">Incident Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={forecast.incident_forecast}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                    <XAxis dataKey="period" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                      labelStyle={{ color: '#e2e8f0' }}
                    />
                    <Legend />
                    <Bar dataKey="total_incidents" fill="#3b82f6" name="Total Incidents" />
                    <Bar dataKey="severe_incidents" fill="#ef4444" name="Severe Incidents" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base">Control Effectiveness Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLine data={forecast.control_effectiveness_trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                    <XAxis dataKey="period" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                      labelStyle={{ color: '#e2e8f0' }}
                    />
                    <Line type="monotone" dataKey="effectiveness_score" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} name="Effectiveness %" />
                  </RechartsLine>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-400" />
                  High-Impact Event Predictions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {forecast.high_impact_events?.map((event, idx) => (
                    <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-white mb-1">{event.event}</h4>
                          <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-xs">
                            {event.category}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-rose-400">{event.probability}%</div>
                          <p className="text-xs text-slate-400">Probability</p>
                        </div>
                      </div>
                      <Badge className={
                        event.impact === 'critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                        event.impact === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                        'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }>
                        {event.impact} impact
                      </Badge>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="warnings">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                  Early Warning Indicators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {forecast.early_warnings?.map((warning, idx) => (
                    <Card key={idx} className={`p-4 ${
                      warning.status === 'critical' ? 'bg-rose-500/10 border-rose-500/30' :
                      warning.status === 'warning' ? 'bg-amber-500/10 border-amber-500/30' :
                      'bg-emerald-500/10 border-emerald-500/30'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-white mb-1">{warning.indicator}</h4>
                          <div className="flex items-center gap-4 text-sm text-slate-300">
                            <span>Current: <span className="font-semibold">{warning.current_value}</span></span>
                            <span>Threshold: <span className="font-semibold">{warning.threshold}</span></span>
                          </div>
                        </div>
                        <Badge className={
                          warning.status === 'critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                          warning.status === 'warning' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                          'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        }>
                          {warning.status}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}