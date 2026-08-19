import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Loader2, TrendingUp, TrendingDown, AlertTriangle, RefreshCw, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function DynamicThreatScoring({ risks, onScoresUpdated }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [threatData, setThreatData] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchThreatIntelligence = async () => {
    setAnalyzing(true);
    try {
      const riskCategories = [...new Set(risks.map(r => r.category))];
      
      const prompt = `You are a cybersecurity threat intelligence analyst. Fetch current threat landscape data for these risk categories:

RISK CATEGORIES: ${riskCategories.join(', ')}
TOTAL RISKS: ${risks.length}

TASK: Research and provide current external threat intelligence:
1. Recent threat trends for each category
2. Industry-specific threat levels (0-100 scale)
3. Emerging vulnerabilities and exploits
4. Threat actor activity levels
5. Geographic threat concentration
6. Recommended risk score adjustments

Analyze real-world threat data, security bulletins, CVE databases, and industry reports.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            threat_landscape: {
              type: "object",
              properties: {
                overall_threat_level: { type: "number" },
                trend: { type: "string" },
                summary: { type: "string" }
              }
            },
            category_threats: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  threat_level: { type: "number" },
                  active_threats: { type: "array", items: { type: "string" } },
                  severity_multiplier: { type: "number" },
                  recommendations: { type: "array", items: { type: "string" } }
                }
              }
            },
            risk_adjustments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  risk_id: { type: "string" },
                  current_score: { type: "number" },
                  adjusted_score: { type: "number" },
                  adjustment_reason: { type: "string" },
                  threat_indicators: { type: "array", items: { type: "string" } }
                }
              }
            },
            emerging_threats: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  threat_name: { type: "string" },
                  description: { type: "string" },
                  severity: { type: "string" },
                  affected_categories: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      // Enrich with actual risk data
      const enrichedData = response.risk_adjustments.map(adj => {
        const risk = risks.find(r => r.id === adj.risk_id) || risks.find(r => r.title === adj.risk_id);
        const categoryThreat = response.category_threats.find(ct => ct.category === risk?.category);
        return {
          ...adj,
          risk,
          categoryThreat,
          change: adj.adjusted_score - adj.current_score
        };
      });

      setThreatData({
        ...response,
        enrichedRisks: enrichedData
      });
      setLastUpdate(new Date());
      toast.success("Threat intelligence updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch threat intelligence");
    } finally {
      setAnalyzing(false);
    }
  };

  const applyDynamicScores = async () => {
    try {
      const updates = threatData.enrichedRisks.map(item => {
        if (!item.risk) return null;
        
        const newLikelihood = Math.min(5, Math.round(
          (item.risk.likelihood || 0) * (item.categoryThreat?.severity_multiplier || 1)
        ));
        
        return base44.entities.Risk.update(item.risk.id, {
          dynamic_threat_score: item.adjusted_score,
          threat_adjusted_likelihood: newLikelihood,
          last_threat_update: new Date().toISOString(),
          threat_indicators: item.threat_indicators,
          threat_adjustment_reason: item.adjustment_reason
        });
      }).filter(Boolean);

      await Promise.all(updates);
      toast.success(`Updated ${updates.length} risk scores`);
      onScoresUpdated && onScoresUpdated();
    } catch (error) {
      console.error(error);
      toast.error("Failed to apply scores");
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'text-rose-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-amber-400';
      case 'low': return 'text-blue-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-4">
      {/* Threat Intelligence Dashboard */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-cyan-400" />
                Dynamic Threat Intelligence Scoring
              </CardTitle>
              <p className="text-sm text-slate-400 mt-1">
                Real-time risk scoring based on external threat data
              </p>
            </div>
            <Button 
              onClick={fetchThreatIntelligence}
              disabled={analyzing}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Update Intelligence
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!threatData.threat_landscape ? (
            <div className="text-center py-8">
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 w-fit mx-auto mb-4">
                <Activity className="h-8 w-8 text-cyan-400" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">
                Fetch Threat Intelligence
              </h3>
              <p className="text-sm text-slate-400">
                Analyze {risks.length} risks against current threat landscape
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overall Threat Level */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-400 mb-1">Overall Threat Level</div>
                    <div className="flex items-center gap-2">
                      <div className="text-3xl font-bold text-white">
                        {threatData.threat_landscape.overall_threat_level}
                      </div>
                      <Badge className={
                        threatData.threat_landscape.trend === 'increasing' 
                          ? 'bg-rose-500/10 text-rose-400' 
                          : threatData.threat_landscape.trend === 'decreasing'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-slate-500/10 text-slate-400'
                      }>
                        {threatData.threat_landscape.trend === 'increasing' && <TrendingUp className="h-3 w-3 mr-1" />}
                        {threatData.threat_landscape.trend === 'decreasing' && <TrendingDown className="h-3 w-3 mr-1" />}
                        {threatData.threat_landscape.trend}
                      </Badge>
                    </div>
                  </div>
                  {lastUpdate && (
                    <div className="text-xs text-slate-500">
                      Updated: {lastUpdate.toLocaleTimeString()}
                    </div>
                  )}
                </div>
                <Progress 
                  value={threatData.threat_landscape.overall_threat_level} 
                  className="h-2 mb-3 bg-[#151d2e]"
                />
                <p className="text-sm text-slate-400">{threatData.threat_landscape.summary}</p>
              </div>

              {/* Category Threats */}
              {threatData.category_threats && threatData.category_threats.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Category Threat Levels</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    {threatData.category_threats.map((cat, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-white capitalize">{cat.category}</div>
                          <Badge className="bg-cyan-500/10 text-cyan-400">
                            {cat.threat_level}/100
                          </Badge>
                        </div>
                        <Progress value={cat.threat_level} className="h-1.5 mb-2 bg-[#0f1623]" />
                        {cat.active_threats && cat.active_threats.length > 0 && (
                          <div className="space-y-1">
                            {cat.active_threats.slice(0, 2).map((threat, i) => (
                              <div key={i} className="text-xs text-slate-500 flex items-start gap-1">
                                <AlertTriangle className="h-3 w-3 text-amber-400 mt-0.5 flex-shrink-0" />
                                {threat}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk Score Adjustments */}
              {threatData.enrichedRisks && threatData.enrichedRisks.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-white">Risk Score Adjustments</h4>
                    <Button 
                      size="sm"
                      onClick={applyDynamicScores}
                      className="bg-cyan-600 hover:bg-cyan-700"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Apply Updates
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {threatData.enrichedRisks.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <div className="font-medium text-white text-sm mb-1">
                              {item.risk?.title || 'Unknown Risk'}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs border-[#2a3548] text-slate-400">
                                Current: {item.current_score}
                              </Badge>
                              <span className="text-slate-600">→</span>
                              <Badge className="bg-cyan-500/10 text-cyan-400 text-xs">
                                Adjusted: {item.adjusted_score}
                              </Badge>
                              {item.change !== 0 && (
                                <Badge className={item.change > 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}>
                                  {item.change > 0 ? '+' : ''}{item.change}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mb-2">{item.adjustment_reason}</p>
                        {item.threat_indicators && item.threat_indicators.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.threat_indicators.map((indicator, i) => (
                              <Badge key={i} variant="outline" className="text-[10px] border-amber-500/30 text-amber-400">
                                {indicator}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Emerging Threats */}
              {threatData.emerging_threats && threatData.emerging_threats.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Emerging Threats</h4>
                  <div className="space-y-2">
                    {threatData.emerging_threats.slice(0, 3).map((threat, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/20">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="font-medium text-white text-sm">{threat.threat_name}</div>
                          <Badge className={getSeverityColor(threat.severity)}>
                            {threat.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">{threat.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {threat.affected_categories?.map((cat, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] border-[#2a3548] text-slate-400">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}