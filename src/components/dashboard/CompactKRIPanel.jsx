import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Minus, Activity, RefreshCw, Brain, AlertTriangle, TrendingUp as TrendUp, Zap } from "lucide-react";
import DrillDownModal from "@/components/ui/drill-down-modal";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function CompactKRIPanel({ indicators, risks }) {
  const [drillDown, setDrillDown] = useState({ open: false, title: '', data: null, type: '' });
  const [aiSummary, setAiSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const calculateKRIValue = (indicator) => {
    if (indicator?.current_value !== undefined) {
      return indicator.current_value;
    }
    const relevantRisks = Array.isArray(risks) ? risks.filter(r => 
      r && indicator?.linked_assessment && r.id === indicator.linked_assessment
    ) : [];
    const avgScore = relevantRisks.length > 0
      ? relevantRisks.reduce((sum, r) => sum + ((r.likelihood || 0) * (r.impact || 0)), 0) / relevantRisks.length
      : 0;
    return Math.round(avgScore * 4);
  };

  const calculateKRIStatus = (indicator) => {
    const value = calculateKRIValue(indicator);
    const target = indicator.target_value || 80;
    const thresholdGreen = indicator.threshold_green || 80;
    const thresholdAmber = indicator.threshold_amber || 60;
    const thresholdRed = indicator.threshold_red || 40;
    
    const direction = indicator.direction || 'higher_better';
    let status = 'good';
    
    if (direction === 'higher_better') {
      if (value >= thresholdGreen) status = 'good';
      else if (value >= thresholdAmber) status = 'warning';
      else status = 'critical';
    } else {
      if (value <= thresholdGreen) status = 'good';
      else if (value <= thresholdAmber) status = 'warning';
      else status = 'critical';
    }

    const trend = value > target ? 'up' : value < target ? 'down' : 'stable';
    
    return {
      value,
      target,
      percentage: Math.min(Math.round((value / (target || 100)) * 100), 100),
      trend,
      status
    };
  };

  const kriIndicators = Array.isArray(indicators) ? indicators.filter(i => i && i.indicator_type === 'kri') : [];
  const topKRIs = kriIndicators.slice(0, 4);
  const overallRiskScore = Array.isArray(risks) && risks.length > 0
    ? Math.round(risks.filter(r => r).reduce((sum, r) => sum + ((r.likelihood || 0) * (r.impact || 0)), 0) / risks.filter(r => r).length)
    : 0;

  const generateAISummary = async () => {
    setLoading(true);
    try {
      const kriData = topKRIs.map(kri => {
        const status = calculateKRIStatus(kri);
        return {
          name: kri.name,
          current: status.value,
          target: status.target,
          status: status.status,
          trend: status.trend
        };
      });

      const prompt = `Analyze these Key Risk Indicators and provide a structured executive summary:

Overall Risk Score: ${overallRiskScore}/25
Active KRIs: ${kriIndicators.length}

KRI Details:
${kriData.map(k => `- ${k.name}: ${k.current}/${k.target} (${k.status}, trending ${k.trend})`).join('\n')}

Total Risks in Portfolio: ${Array.isArray(risks) ? risks.length : 0}
Critical Risks: ${Array.isArray(risks) ? risks.filter(r => r && (r.likelihood || 0) * (r.impact || 0) >= 16).length : 0}

Provide a JSON response with this exact structure:
{
  "overall_posture": "One sentence overall assessment",
  "risk_level": "low|medium|high|critical",
  "key_concerns": ["concern 1", "concern 2"],
  "positive_trends": ["trend 1", "trend 2"],
  "recommendations": ["action 1", "action 2"]
}

Keep each item concise and actionable.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            overall_posture: { type: "string" },
            risk_level: { type: "string", enum: ["low", "medium", "high", "critical"] },
            key_concerns: { type: "array", items: { type: "string" } },
            positive_trends: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });

      setAiSummary(result);
      toast.success("AI summary generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate AI summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (indicators?.length > 0 && risks?.length > 0 && !aiSummary) {
      generateAISummary();
    }
  }, [indicators, risks]);

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-400" />
              Key Risk Indicators (KRI)
            </CardTitle>
            <p className="text-xs text-slate-500 mt-1">Real-time monitoring of critical risk metrics and thresholds</p>
          </div>
          <Button 
            size="sm" 
            onClick={generateAISummary}
            disabled={loading}
            className="h-7 px-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* AI Summary */}
          {aiSummary && (
            <div className="relative overflow-hidden p-4 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 border border-indigo-500/30 rounded-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
                    <Brain className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      AI Risk Intelligence Summary
                    </h4>
                    <p className="text-[9px] text-slate-500">Generated by Advanced Analytics Engine</p>
                  </div>
                  <Badge className={`text-[9px] px-1.5 py-0.5 ${
                    aiSummary.risk_level === 'critical' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                    aiSummary.risk_level === 'high' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    aiSummary.risk_level === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {aiSummary.risk_level?.toUpperCase()}
                  </Badge>
                </div>

                {/* Overall Posture */}
                <div className="p-2.5 bg-[#0f1623]/50 rounded-lg border border-[#2a3548]/50">
                  <p className="text-xs text-slate-200 leading-relaxed">{aiSummary.overall_posture}</p>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Key Concerns */}
                  {aiSummary.key_concerns?.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="h-3 w-3 text-rose-400" />
                        <span className="text-[10px] font-semibold text-rose-400">Key Concerns</span>
                      </div>
                      <div className="space-y-1">
                        {aiSummary.key_concerns.map((concern, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-[10px] text-slate-300">
                            <div className="w-1 h-1 rounded-full bg-rose-400 mt-1 flex-shrink-0"></div>
                            <span className="leading-tight">{concern}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Positive Trends */}
                  {aiSummary.positive_trends?.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <TrendUp className="h-3 w-3 text-emerald-400" />
                        <span className="text-[10px] font-semibold text-emerald-400">Positive Trends</span>
                      </div>
                      <div className="space-y-1">
                        {aiSummary.positive_trends.map((trend, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-[10px] text-slate-300">
                            <div className="w-1 h-1 rounded-full bg-emerald-400 mt-1 flex-shrink-0"></div>
                            <span className="leading-tight">{trend}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Recommendations */}
                {aiSummary.recommendations?.length > 0 && (
                  <div className="p-2.5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-lg space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Zap className="h-3 w-3 text-indigo-400" />
                      <span className="text-[10px] font-semibold text-indigo-400">Recommended Actions</span>
                    </div>
                    <div className="space-y-1">
                      {aiSummary.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[10px] text-slate-200">
                          <span className="text-indigo-400 font-semibold flex-shrink-0">{idx + 1}.</span>
                          <span className="leading-tight">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Overall Risk Score */}
          <div 
            className="p-2 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-lg cursor-pointer hover:bg-indigo-500/15 transition-colors"
            onClick={() => setDrillDown({ open: true, title: 'Risk Portfolio', data: risks, type: 'risk' })}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-white font-medium">Overall Risk Exposure</span>
              <span className="text-base font-bold text-indigo-400">{overallRiskScore}<span className="text-xs text-slate-500">/25</span></span>
            </div>
            <Progress value={(overallRiskScore / 25) * 100} className="h-1.5 [&>div]:bg-indigo-500" />
            <p className="text-[10px] text-slate-400 mt-1">Aggregate risk score across portfolio</p>
          </div>

          {/* Individual KRIs */}
          <div className="space-y-2">
            {topKRIs.length > 0 ? topKRIs.map((kri, idx) => {
              const status = calculateKRIStatus(kri);
              const TrendIcon = status.trend === 'up' ? TrendingUp : status.trend === 'down' ? TrendingDown : Minus;
              
              return (
                <div 
                  key={idx} 
                  className="p-2 rounded-lg bg-[#0f1623] border border-[#2a3548] cursor-pointer hover:bg-[#151d2e] transition-colors"
                  onClick={() => setDrillDown({ 
                    open: true, 
                    title: kri.name, 
                    data: { ...kri, ...status }, 
                    type: 'indicator' 
                  })}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-white font-medium line-clamp-1">{kri.name}</p>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold text-white">{status.value}</span>
                      <TrendIcon className={`h-3 w-3 ${
                        status.trend === 'up' ? 'text-rose-400' : 
                        status.trend === 'down' ? 'text-emerald-400' : 
                        'text-slate-400'
                      }`} />
                    </div>
                  </div>
                  <Progress 
                    value={status.percentage} 
                    className={`h-1.5 ${
                      status.status === 'critical' ? '[&>div]:bg-rose-500' :
                      status.status === 'warning' ? '[&>div]:bg-amber-500' :
                      '[&>div]:bg-emerald-500'
                    }`}
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Target: {status.target} {kri.unit || ''}</p>
                </div>
              );
            }) : (
              <div className="text-center py-4">
                <p className="text-xs text-slate-500">No KRI indicators configured</p>
                <p className="text-[10px] text-slate-600 mt-1">Add KRIs to monitor key risk metrics</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <DrillDownModal 
        open={drillDown.open}
        onClose={() => setDrillDown({ open: false, title: '', data: null, type: '' })}
        title={drillDown.title}
        data={drillDown.data}
        type={drillDown.type}
      />
    </Card>
  );
}