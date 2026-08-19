import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Activity, TrendingUp, AlertTriangle, Loader2, Bell, Newspaper, DollarSign, Shield, RefreshCw, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AIContinuousMonitoring() {
  const [monitoring, setMonitoring] = useState(false);
  const [monitoringData, setMonitoringData] = useState({});
  const [selectedVendor, setSelectedVendor] = useState(null);
  const queryClient = useQueryClient();

  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => base44.entities.Vendor.list('-created_date')
  });

  const createNotificationMutation = useMutation({
    mutationFn: (data) => base44.entities.Notification.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const monitorVendor = async (vendor) => {
    setMonitoring(true);
    setSelectedVendor(vendor);
    
    try {
      const prompt = `You are an AI vendor risk intelligence analyst. Monitor and analyze external data for this vendor:

VENDOR: ${vendor.vendor_name}
Website: ${vendor.website || 'N/A'}
Type: ${vendor.vendor_type}
Current Risk Level: ${vendor.criticality}

Search for and analyze:
1. Recent news articles and press releases
2. Financial health indicators and reports
3. Security incidents, breaches, or vulnerabilities
4. Regulatory actions or compliance issues
5. Leadership changes or strategic shifts
6. Customer complaints or service issues

Provide a JSON response:
{
  "monitoring_date": "${format(new Date(), 'yyyy-MM-dd')}",
  "overall_risk_change": "<increased|decreased|stable>",
  "risk_score_adjustment": <number -20 to +20>,
  "news_alerts": [
    {
      "headline": "<headline>",
      "source": "<source>",
      "date": "<date>",
      "sentiment": "<positive|negative|neutral>",
      "risk_impact": "<critical|high|medium|low>",
      "summary": "<brief summary>",
      "implications": "<risk implications>"
    }
  ],
  "financial_indicators": {
    "health_status": "<strong|stable|concerning|critical>",
    "key_findings": [
      "<finding>"
    ],
    "risk_indicators": [
      "<indicator>"
    ]
  },
  "security_incidents": [
    {
      "incident_type": "<type>",
      "severity": "<critical|high|medium|low>",
      "date": "<date>",
      "description": "<description>",
      "impact_on_relationship": "<description>"
    }
  ],
  "regulatory_updates": [
    {
      "type": "<type>",
      "description": "<description>",
      "impact": "<critical|high|medium|low>"
    }
  ],
  "risk_alerts": [
    {
      "alert_type": "<financial|security|operational|compliance|reputational>",
      "severity": "<critical|high|medium|low>",
      "title": "<alert title>",
      "description": "<detailed description>",
      "recommended_action": "<immediate action recommendation>",
      "urgency": "<immediate|urgent|normal>"
    }
  ],
  "assessment_update_suggestions": [
    {
      "area": "<assessment area>",
      "current_score": <number>,
      "suggested_score": <number>,
      "rationale": "<reason for change>",
      "evidence": "<supporting evidence>"
    }
  ],
  "recommended_actions": [
    {
      "action": "<action description>",
      "priority": "<critical|high|medium|low>",
      "timeframe": "<immediate|days|weeks|months>"
    }
  ],
  "monitoring_summary": "<comprehensive summary of findings>"
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            monitoring_date: { type: "string" },
            overall_risk_change: { type: "string" },
            risk_score_adjustment: { type: "number" },
            news_alerts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  headline: { type: "string" },
                  source: { type: "string" },
                  date: { type: "string" },
                  sentiment: { type: "string" },
                  risk_impact: { type: "string" },
                  summary: { type: "string" },
                  implications: { type: "string" }
                }
              }
            },
            financial_indicators: {
              type: "object",
              properties: {
                health_status: { type: "string" },
                key_findings: { type: "array", items: { type: "string" } },
                risk_indicators: { type: "array", items: { type: "string" } }
              }
            },
            security_incidents: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  incident_type: { type: "string" },
                  severity: { type: "string" },
                  date: { type: "string" },
                  description: { type: "string" },
                  impact_on_relationship: { type: "string" }
                }
              }
            },
            regulatory_updates: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  description: { type: "string" },
                  impact: { type: "string" }
                }
              }
            },
            risk_alerts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  alert_type: { type: "string" },
                  severity: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  recommended_action: { type: "string" },
                  urgency: { type: "string" }
                }
              }
            },
            assessment_update_suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  area: { type: "string" },
                  current_score: { type: "number" },
                  suggested_score: { type: "number" },
                  rationale: { type: "string" },
                  evidence: { type: "string" }
                }
              }
            },
            recommended_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  timeframe: { type: "string" }
                }
              }
            },
            monitoring_summary: { type: "string" }
          }
        }
      });

      setMonitoringData(prev => ({
        ...prev,
        [vendor.id]: response
      }));

      // Create notifications for critical alerts
      if (response.risk_alerts?.length > 0) {
        const criticalAlerts = response.risk_alerts.filter(a => a.severity === 'critical' || a.urgency === 'immediate');
        
        for (const alert of criticalAlerts) {
          await createNotificationMutation.mutateAsync({
            user_email: vendor.lead_coordinator || 'admin@company.com',
            type: 'vendor_risk_change',
            title: `Critical Alert: ${vendor.vendor_name}`,
            message: alert.title,
            priority: 'critical',
            entity_type: 'Vendor',
            entity_id: vendor.id,
            metadata: { alert }
          });
        }
      }

      toast.success(`Monitoring complete: ${response.risk_alerts?.length || 0} alerts found`);
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to monitor vendor");
    } finally {
      setMonitoring(false);
      setSelectedVendor(null);
    }
  };

  const monitorAllCriticalVendors = async () => {
    const criticalVendors = vendors.filter(v => v.criticality === 'critical' || v.risk_tier === 'tier_1');
    setMonitoring(true);
    
    for (const vendor of criticalVendors) {
      try {
        await monitorVendor(vendor);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Failed to monitor ${vendor.vendor_name}`, error);
      }
    }
    
    setMonitoring(false);
    toast.success(`Monitored ${criticalVendors.length} critical vendors`);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-emerald-400';
      case 'negative': return 'text-rose-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Activity className="h-7 w-7 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl text-white">AI Continuous Monitoring</CardTitle>
                <p className="text-sm text-slate-400 mt-1">
                  Real-time vendor risk intelligence from news, financial data, and security feeds
                </p>
              </div>
            </div>
            <Button 
              onClick={monitorAllCriticalVendors} 
              disabled={monitoring}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {monitoring ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Monitoring...</>
              ) : (
                <><RefreshCw className="h-4 w-4 mr-2" /> Monitor All Critical</>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-blue-400" />
              <p className="text-xs text-slate-400">Vendors Monitored</p>
            </div>
            <p className="text-2xl font-bold text-white">{Object.keys(monitoringData).length}</p>
            <p className="text-xs text-slate-500 mt-1">Active monitoring</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-5 w-5 text-rose-400" />
              <p className="text-xs text-slate-400">Critical Alerts</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {Object.values(monitoringData).reduce(
                (sum, m) => sum + (m.risk_alerts?.filter(a => a.severity === 'critical').length || 0),
                0
              )}
            </p>
            <p className="text-xs text-slate-500 mt-1">Require action</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Newspaper className="h-5 w-5 text-amber-400" />
              <p className="text-xs text-slate-400">News Alerts</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {Object.values(monitoringData).reduce(
                (sum, m) => sum + (m.news_alerts?.length || 0),
                0
              )}
            </p>
            <p className="text-xs text-slate-500 mt-1">Recent updates</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-purple-400" />
              <p className="text-xs text-slate-400">Security Incidents</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {Object.values(monitoringData).reduce(
                (sum, m) => sum + (m.security_incidents?.length || 0),
                0
              )}
            </p>
            <p className="text-xs text-slate-500 mt-1">Detected</p>
          </CardContent>
        </Card>
      </div>

      {/* Monitoring Results */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base text-white">Vendor Intelligence Dashboard</CardTitle>
          <p className="text-xs text-slate-400 mt-1">
            AI-powered monitoring of external risk indicators and proactive alerts
          </p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[700px]">
            <div className="space-y-4 pr-4">
              {vendors.map(vendor => {
                const data = monitoringData[vendor.id];
                const isMonitoring = monitoring && selectedVendor?.id === vendor.id;
                
                return (
                  <div key={vendor.id} className="p-4 rounded-lg bg-gradient-to-br from-[#151d2e] to-[#0f1623] border border-[#2a3548]">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-white">{vendor.vendor_name}</h4>
                          <Badge className={getSeverityColor(vendor.criticality)}>
                            {vendor.criticality}
                          </Badge>
                          {data?.overall_risk_change && (
                            <Badge className={
                              data.overall_risk_change === 'increased' ? 'bg-rose-500/20 text-rose-400' :
                              data.overall_risk_change === 'decreased' ? 'bg-emerald-500/20 text-emerald-400' :
                              'bg-slate-500/20 text-slate-400'
                            }>
                              Risk {data.overall_risk_change}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{vendor.vendor_type}</p>
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => monitorVendor(vendor)}
                        disabled={isMonitoring}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isMonitoring ? (
                          <><Loader2 className="h-3 w-3 animate-spin mr-2" /> Monitoring...</>
                        ) : (
                          <><Activity className="h-3 w-3 mr-2" /> Monitor Now</>
                        )}
                      </Button>
                    </div>

                    {data && (
                      <Tabs defaultValue="alerts" className="mt-4">
                        <TabsList className="bg-[#0f1623] border border-[#2a3548]">
                          <TabsTrigger value="alerts" className="text-xs">
                            Alerts ({data.risk_alerts?.length || 0})
                          </TabsTrigger>
                          <TabsTrigger value="news" className="text-xs">
                            News ({data.news_alerts?.length || 0})
                          </TabsTrigger>
                          <TabsTrigger value="financial" className="text-xs">
                            Financial
                          </TabsTrigger>
                          <TabsTrigger value="security" className="text-xs">
                            Security ({data.security_incidents?.length || 0})
                          </TabsTrigger>
                          <TabsTrigger value="recommendations" className="text-xs">
                            Actions ({data.recommended_actions?.length || 0})
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="alerts" className="mt-3">
                          {data.risk_alerts?.length > 0 ? (
                            <div className="space-y-2">
                              {data.risk_alerts.map((alert, idx) => (
                                <div key={idx} className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <AlertTriangle className="h-4 w-4 text-rose-400" />
                                      <p className="text-xs font-medium text-white">{alert.title}</p>
                                    </div>
                                    <Badge className={getSeverityColor(alert.severity)}>
                                      {alert.severity}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-slate-400 mb-2">{alert.description}</p>
                                  <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20">
                                    <p className="text-xs font-medium text-blue-400 mb-1">Recommended Action:</p>
                                    <p className="text-xs text-slate-300">{alert.recommended_action}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 text-center py-4">No alerts detected</p>
                          )}
                        </TabsContent>

                        <TabsContent value="news" className="mt-3">
                          {data.news_alerts?.length > 0 ? (
                            <div className="space-y-2">
                              {data.news_alerts.map((news, idx) => (
                                <div key={idx} className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                                  <div className="flex items-start justify-between mb-1">
                                    <p className="text-xs font-medium text-white">{news.headline}</p>
                                    <Badge className={getSeverityColor(news.risk_impact)}>
                                      {news.risk_impact}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs text-slate-500">{news.source}</span>
                                    <span className="text-xs text-slate-500">•</span>
                                    <span className="text-xs text-slate-500">{news.date}</span>
                                    <Badge variant="outline" className={`text-xs ${getSentimentColor(news.sentiment)}`}>
                                      {news.sentiment}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-slate-400 mb-2">{news.summary}</p>
                                  <div className="p-2 rounded bg-amber-500/5 border border-amber-500/20">
                                    <p className="text-xs text-amber-300">{news.implications}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 text-center py-4">No news alerts</p>
                          )}
                        </TabsContent>

                        <TabsContent value="financial" className="mt-3">
                          {data.financial_indicators ? (
                            <div className="space-y-3">
                              <div className="p-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-xs font-semibold text-white">Financial Health</p>
                                  <Badge className={
                                    data.financial_indicators.health_status === 'strong' ? 'bg-emerald-500/20 text-emerald-400' :
                                    data.financial_indicators.health_status === 'stable' ? 'bg-blue-500/20 text-blue-400' :
                                    data.financial_indicators.health_status === 'concerning' ? 'bg-amber-500/20 text-amber-400' :
                                    'bg-rose-500/20 text-rose-400'
                                  }>
                                    {data.financial_indicators.health_status}
                                  </Badge>
                                </div>
                                
                                {data.financial_indicators.key_findings?.length > 0 && (
                                  <div className="mb-3">
                                    <p className="text-xs font-medium text-slate-300 mb-1">Key Findings:</p>
                                    <ul className="space-y-1">
                                      {data.financial_indicators.key_findings.map((finding, idx) => (
                                        <li key={idx} className="text-xs text-slate-400 flex items-start gap-1">
                                          <DollarSign className="h-3 w-3 text-amber-400 mt-0.5 flex-shrink-0" />
                                          {finding}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {data.financial_indicators.risk_indicators?.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-rose-400 mb-1">Risk Indicators:</p>
                                    <ul className="space-y-1">
                                      {data.financial_indicators.risk_indicators.map((indicator, idx) => (
                                        <li key={idx} className="text-xs text-slate-400 flex items-start gap-1">
                                          <AlertTriangle className="h-3 w-3 text-rose-400 mt-0.5 flex-shrink-0" />
                                          {indicator}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 text-center py-4">No financial data available</p>
                          )}
                        </TabsContent>

                        <TabsContent value="security" className="mt-3">
                          {data.security_incidents?.length > 0 ? (
                            <div className="space-y-2">
                              {data.security_incidents.map((incident, idx) => (
                                <div key={idx} className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/20">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <Shield className="h-4 w-4 text-rose-400" />
                                      <p className="text-xs font-medium text-white">{incident.incident_type}</p>
                                    </div>
                                    <Badge className={getSeverityColor(incident.severity)}>
                                      {incident.severity}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-slate-400 mb-2">{incident.description}</p>
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs text-slate-500">{incident.date}</span>
                                  </div>
                                  <div className="p-2 rounded bg-[#151d2e]">
                                    <p className="text-xs font-medium text-rose-400 mb-1">Impact on Relationship:</p>
                                    <p className="text-xs text-slate-300">{incident.impact_on_relationship}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 text-center py-4">No security incidents detected</p>
                          )}
                        </TabsContent>

                        <TabsContent value="recommendations" className="mt-3">
                          <div className="space-y-3">
                            {/* Assessment Update Suggestions */}
                            {data.assessment_update_suggestions?.length > 0 && (
                              <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                                <p className="text-xs font-semibold text-purple-400 mb-2 flex items-center gap-2">
                                  <TrendingUp className="h-3 w-3" />
                                  Assessment Update Suggestions
                                </p>
                                <div className="space-y-2">
                                  {data.assessment_update_suggestions.map((suggestion, idx) => (
                                    <div key={idx} className="p-2 rounded bg-[#0f1623]">
                                      <div className="flex items-center justify-between mb-1">
                                        <p className="text-xs font-medium text-white">{suggestion.area}</p>
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-slate-400">{suggestion.current_score}</span>
                                          <span className="text-xs text-slate-500">→</span>
                                          <span className={`text-xs font-semibold ${
                                            suggestion.suggested_score < suggestion.current_score ? 'text-rose-400' : 'text-emerald-400'
                                          }`}>
                                            {suggestion.suggested_score}
                                          </span>
                                        </div>
                                      </div>
                                      <p className="text-xs text-slate-400 mb-1">{suggestion.rationale}</p>
                                      <p className="text-xs text-slate-500">Evidence: {suggestion.evidence}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Recommended Actions */}
                            {data.recommended_actions?.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-xs font-semibold text-white flex items-center gap-2">
                                  <Bell className="h-3 w-3 text-blue-400" />
                                  Recommended Actions
                                </p>
                                {data.recommended_actions.map((action, idx) => (
                                  <div key={idx} className="p-2 rounded bg-[#0f1623] border border-[#2a3548]">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                      <p className="text-xs font-medium text-white">{action.action}</p>
                                      <Badge className={getSeverityColor(action.priority)}>
                                        {action.priority}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-slate-500">Timeframe: {action.timeframe}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Summary */}
                            {data?.monitoring_summary && (
                              <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                                <p className="text-xs font-semibold text-blue-400 mb-2">Monitoring Summary</p>
                                <p className="text-xs text-slate-300 leading-relaxed">{data.monitoring_summary}</p>
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}