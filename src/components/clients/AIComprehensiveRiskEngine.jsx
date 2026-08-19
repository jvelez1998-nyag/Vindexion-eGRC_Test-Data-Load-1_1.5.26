import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Shield, AlertTriangle, TrendingUp, CheckCircle2, Loader2, Sparkles, Target, Zap } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";
import AIImplementationPlanner from "./AIImplementationPlanner";

export default function AIComprehensiveRiskEngine({ client, allClients, onApplyRecommendations }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const runComprehensiveAssessment = async () => {
    setAnalyzing(true);
    try {
      // Calculate industry benchmarks
      const industryPeers = allClients.filter(c => c.industry === client.industry && c.id !== client.id);
      const industryAvgRisk = industryPeers.length > 0 
        ? industryPeers.reduce((sum, c) => sum + (c.risk_score || 50), 0) / industryPeers.length 
        : 50;
      const industryAvgCompliance = industryPeers.length > 0
        ? industryPeers.reduce((sum, c) => sum + (c.compliance_score || 50), 0) / industryPeers.length
        : 50;

      // Prepare comprehensive context
      const prompt = `You are an expert GRC analyst. Perform a comprehensive risk assessment for this client and provide actionable recommendations.

CLIENT PROFILE:
- Name: ${client.name}
- Industry: ${client.industry}
- Type: ${client.client_type}
- Status: ${client.status}
- Data Classification: ${client.data_classification || 'Not specified'}

CURRENT METRICS:
- Risk Score: ${client.risk_score || 'Not assessed'}
- Risk Level: ${client.risk_level || 'Not assessed'}
- Compliance Score: ${client.compliance_score || 'Not assessed'}
- Control Maturity: ${client.control_maturity || 'Not assessed'}
- Security Posture: ${client.security_posture || 'Not assessed'}
- Incident Count: ${client.incident_count || 0}
- Critical Issues: ${client.critical_issues || 0}

REGULATORY REQUIREMENTS:
${(client.regulatory_frameworks || []).length > 0 ? client.regulatory_frameworks.join(', ') : 'None specified'}

IDENTIFIED COMPLIANCE GAPS:
${(client.compliance_gaps || []).length > 0 ? client.compliance_gaps.join(', ') : 'None identified'}

INDUSTRY BENCHMARKS:
- Average Industry Risk Score: ${industryAvgRisk.toFixed(1)}
- Average Industry Compliance Score: ${industryAvgCompliance.toFixed(1)}
- Your Position: ${client.risk_score > industryAvgRisk ? 'Higher risk than peers' : 'Lower risk than peers'}

ANALYSIS REQUIRED:
1. **Risk Assessment**: Analyze all risk factors considering industry, size, data sensitivity, and regulatory requirements
2. **Control Recommendations**: Suggest specific controls that would be most effective for this client
3. **Mitigation Strategies**: Provide prioritized mitigation actions with timelines
4. **Compliance Gap Prediction**: Identify likely compliance gaps based on industry trends and client characteristics
5. **Future Risk Forecast**: Predict emerging risks for the next 6-12 months

Provide your response in the following JSON structure:
{
  "overall_risk_assessment": {
    "score": <number 0-100>,
    "level": "low|medium|high|critical",
    "trend": "improving|stable|deteriorating",
    "summary": "<brief summary>"
  },
  "risk_factors": [
    {
      "category": "<risk category>",
      "severity": "low|medium|high|critical",
      "likelihood": "low|medium|high",
      "impact": "<description>",
      "score": <number 0-100>
    }
  ],
  "recommended_controls": [
    {
      "name": "<control name>",
      "type": "preventive|detective|corrective",
      "priority": "low|medium|high|critical",
      "description": "<description>",
      "implementation_effort": "low|medium|high",
      "expected_impact": "<expected impact>"
    }
  ],
  "mitigation_strategies": [
    {
      "title": "<strategy title>",
      "priority": "P1|P2|P3",
      "timeline": "<timeline>",
      "actions": ["<action 1>", "<action 2>"],
      "cost_estimate": "low|medium|high",
      "risk_reduction": <number 0-100>
    }
  ],
  "predicted_compliance_gaps": [
    {
      "framework": "<framework name>",
      "gap_area": "<area>",
      "likelihood": "low|medium|high",
      "severity": "low|medium|high|critical",
      "recommendation": "<recommendation>"
    }
  ],
  "emerging_risks": [
    {
      "risk": "<risk description>",
      "timeframe": "<timeframe>",
      "probability": "low|medium|high",
      "impact": "low|medium|high|critical",
      "preparedness_actions": ["<action 1>", "<action 2>"]
    }
  ],
  "key_recommendations": ["<recommendation 1>", "<recommendation 2>", "<recommendation 3>"],
  "executive_summary": "<markdown formatted executive summary>"
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_risk_assessment: { type: "object" },
            risk_factors: { type: "array" },
            recommended_controls: { type: "array" },
            mitigation_strategies: { type: "array" },
            predicted_compliance_gaps: { type: "array" },
            emerging_risks: { type: "array" },
            key_recommendations: { type: "array" },
            executive_summary: { type: "string" }
          }
        }
      });

      setAnalysis(response);
      toast.success("Comprehensive assessment completed");
    } catch (error) {
      console.error(error);
      toast.error("Assessment failed: " + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const applyRecommendations = () => {
    if (analysis && onApplyRecommendations) {
      const updates = {
        risk_score: analysis.overall_risk_assessment.score,
        risk_level: analysis.overall_risk_assessment.level,
        compliance_gaps: analysis.predicted_compliance_gaps.map(g => g.gap_area),
        notes: `AI Assessment - ${new Date().toLocaleDateString()}\n\n${analysis.executive_summary}`
      };
      onApplyRecommendations(updates);
      toast.success("Recommendations applied to client profile");
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'low': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getPriorityColor = (priority) => {
    if (priority === 'P1' || priority === 'critical') return 'bg-rose-500/10 text-rose-400';
    if (priority === 'P2' || priority === 'high') return 'bg-orange-500/10 text-orange-400';
    if (priority === 'P3' || priority === 'medium') return 'bg-amber-500/10 text-amber-400';
    return 'bg-blue-500/10 text-blue-400';
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Brain className="h-5 w-5 text-violet-400" />
            AI Comprehensive Risk Assessment
          </CardTitle>
          <Button
            onClick={runComprehensiveAssessment}
            disabled={analyzing}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Run Assessment
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {analysis && (
        <CardContent className="space-y-6">
          {/* Overall Risk Assessment */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">Overall Risk Assessment</h3>
              <Badge className={getSeverityColor(analysis.overall_risk_assessment.level)}>
                {analysis.overall_risk_assessment.level}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mb-2">
              <div className="flex-1">
                <Progress value={analysis.overall_risk_assessment.score} className="h-2" />
              </div>
              <span className="text-2xl font-bold text-white">{analysis.overall_risk_assessment.score}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className={`h-4 w-4 ${
                analysis.overall_risk_assessment.trend === 'improving' ? 'text-emerald-400' :
                analysis.overall_risk_assessment.trend === 'stable' ? 'text-blue-400' : 'text-rose-400'
              }`} />
              <span className="text-slate-300">Trend: {analysis.overall_risk_assessment.trend}</span>
            </div>
            <p className="text-slate-300 text-sm mt-3">{analysis.overall_risk_assessment.summary}</p>
          </div>

          <Tabs defaultValue="risks" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-[#151d2e]">
              <TabsTrigger value="risks">Risk Factors</TabsTrigger>
              <TabsTrigger value="controls">Controls</TabsTrigger>
              <TabsTrigger value="mitigation">Mitigation</TabsTrigger>
              <TabsTrigger value="gaps">Compliance Gaps</TabsTrigger>
              <TabsTrigger value="emerging">Emerging Risks</TabsTrigger>
            </TabsList>

            <TabsContent value="risks" className="space-y-3">
              {analysis.risk_factors?.map((risk, idx) => (
                <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="h-4 w-4 text-amber-400" />
                          <h4 className="text-white font-semibold">{risk.category}</h4>
                        </div>
                        <p className="text-slate-300 text-sm">{risk.impact}</p>
                      </div>
                      <Badge className={getSeverityColor(risk.severity)}>
                        {risk.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Likelihood:</span>
                        <Badge className="text-xs">{risk.likelihood}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Score:</span>
                        <span className="text-sm font-semibold text-white">{risk.score}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="controls" className="space-y-3">
              {analysis.recommended_controls?.map((control, idx) => (
                <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Shield className="h-4 w-4 text-blue-400" />
                          <h4 className="text-white font-semibold">{control.name}</h4>
                        </div>
                        <p className="text-slate-300 text-sm">{control.description}</p>
                      </div>
                      <Badge className={getPriorityColor(control.priority)}>
                        {control.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs">
                      <Badge className="bg-cyan-500/10 text-cyan-400">{control.type}</Badge>
                      <span className="text-slate-500">Effort: {control.implementation_effort}</span>
                    </div>
                    <div className="mt-2 p-2 rounded bg-emerald-500/5 border border-emerald-500/20">
                      <span className="text-xs text-emerald-400">Expected Impact: {control.expected_impact}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="mitigation" className="space-y-3">
              {analysis.mitigation_strategies?.map((strategy, idx) => (
                <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="h-4 w-4 text-emerald-400" />
                          <h4 className="text-white font-semibold">{strategy.title}</h4>
                        </div>
                        <Badge className={getPriorityColor(strategy.priority)}>{strategy.priority}</Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500">Timeline</div>
                        <div className="text-sm text-white font-semibold">{strategy.timeline}</div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      {strategy.actions?.map((action, aIdx) => (
                        <div key={aIdx} className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          <span className="text-sm text-slate-300">{action}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs">
                      <span className="text-slate-500">Cost: {strategy.cost_estimate}</span>
                      <span className="text-emerald-400">Risk Reduction: {strategy.risk_reduction}%</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="gaps" className="space-y-3">
              {analysis.predicted_compliance_gaps?.map((gap, idx) => (
                <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="h-4 w-4 text-amber-400" />
                          <h4 className="text-white font-semibold">{gap.framework}</h4>
                        </div>
                        <p className="text-slate-300 text-sm font-medium">{gap.gap_area}</p>
                      </div>
                      <Badge className={getSeverityColor(gap.severity)}>
                        {gap.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-slate-500">Likelihood:</span>
                      <Badge className="text-xs">{gap.likelihood}</Badge>
                    </div>
                    <div className="mt-3 p-3 rounded bg-blue-500/5 border border-blue-500/20">
                      <span className="text-xs text-blue-400">{gap.recommendation}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="emerging" className="space-y-3">
              {analysis.emerging_risks?.map((risk, idx) => (
                <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="h-4 w-4 text-violet-400" />
                          <h4 className="text-white font-semibold">{risk.risk}</h4>
                        </div>
                        <Badge className="text-xs">{risk.timeframe}</Badge>
                      </div>
                      <Badge className={getSeverityColor(risk.impact)}>
                        {risk.impact} impact
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-slate-500">Probability:</span>
                      <Badge className="text-xs">{risk.probability}</Badge>
                    </div>
                    <div className="mt-3">
                      <div className="text-xs text-slate-500 mb-1">Preparedness Actions:</div>
                      {risk.preparedness_actions?.map((action, aIdx) => (
                        <div key={aIdx} className="flex items-center gap-2 mt-1">
                          <CheckCircle2 className="h-3 w-3 text-blue-400" />
                          <span className="text-sm text-slate-300">{action}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          {/* Key Recommendations */}
          <Card className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-emerald-500/20">
            <CardContent className="p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                Key Recommendations
              </h3>
              <div className="space-y-2">
                {analysis.key_recommendations?.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-300">{rec}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Executive Summary */}
          <Card className="bg-[#151d2e] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-white text-base">Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <ReactMarkdown className="prose prose-sm prose-invert max-w-none text-slate-300">
                {analysis.executive_summary}
              </ReactMarkdown>
            </CardContent>
          </Card>

          {/* Apply Button */}
          <Button
            onClick={applyRecommendations}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Apply Recommendations to Client Profile
          </Button>

          {/* Implementation Planner */}
          <AIImplementationPlanner
            client={client}
            recommendedControls={analysis.recommended_controls}
            mitigationStrategies={analysis.mitigation_strategies}
          />
        </CardContent>
      )}
    </Card>
  );
}