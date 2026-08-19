import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, Loader2, Lightbulb, TrendingUp, 
  AlertTriangle, Target, Zap, CheckCircle2 
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function ClientAIAnalysis({ client, allClients = [], risks = [], incidents = [], audits = [] }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const prompt = `You are an expert GRC analyst with deep industry knowledge. Provide comprehensive AI-driven insights for this client.

CLIENT DATA:
${JSON.stringify({
  name: client.name,
  industry: client.industry,
  client_type: client.client_type,
  status: client.status,
  risk_score: client.risk_score,
  compliance_score: client.compliance_score,
  control_maturity: client.control_maturity,
  security_posture: client.security_posture,
  risk_level: client.risk_level,
  incident_count: client.incident_count,
  finding_count: client.finding_count,
  critical_issues: client.critical_issues,
  compliance_gaps: client.compliance_gaps
}, null, 2)}

PORTFOLIO CONTEXT:
- Total Clients: ${allClients.length}
- Industry Peers: ${allClients.filter(c => c.industry === client.industry).length}
- Similar Risk Level: ${allClients.filter(c => c.risk_level === client.risk_level).length}

LINKED DATA:
- Associated Risks: ${client.linked_risks?.length || 0}
- Associated Audits: ${client.linked_audits?.length || 0}
- Associated Incidents: ${client.linked_incidents?.length || 0}

PROVIDE COMPREHENSIVE ANALYSIS:

1. **Risk Intelligence**
   - Current risk assessment
   - Risk trend analysis
   - Emerging risk patterns
   - Industry-specific risk factors
   - Peer comparison

2. **Predictive Analytics**
   - Likelihood of future incidents
   - Compliance drift prediction
   - Control effectiveness forecast
   - Resource allocation recommendations

3. **Benchmark Analysis**
   - How client compares to industry peers
   - Performance against portfolio average
   - Best-in-class comparison
   - Areas where client excels/lags

4. **Strategic Recommendations**
   - Top 3 priority actions
   - Quick wins (next 30 days)
   - Strategic initiatives (3-6 months)
   - Long-term transformation (12 months)

5. **Resource Optimization**
   - Where to focus audit efforts
   - Control investment priorities
   - Risk mitigation efficiency
   - Cost-benefit analysis

6. **Client Health Score**
   - Overall health rating (0-100)
   - Key health indicators
   - Warning signs
   - Positive momentum areas

Return as JSON:
{
  "health_score": number,
  "risk_intelligence": "markdown analysis",
  "predictive_analytics": "markdown predictions",
  "benchmark_analysis": "markdown comparison",
  "strategic_recommendations": ["rec1", "rec2", "rec3"],
  "resource_optimization": "markdown guidance",
  "key_insights": ["insight1", "insight2", "insight3"],
  "warning_signs": ["warning1", "warning2"],
  "opportunities": ["opp1", "opp2"]
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            health_score: { type: "number" },
            risk_intelligence: { type: "string" },
            predictive_analytics: { type: "string" },
            benchmark_analysis: { type: "string" },
            strategic_recommendations: { type: "array" },
            resource_optimization: { type: "string" },
            key_insights: { type: "array" },
            warning_signs: { type: "array" },
            opportunities: { type: "array" }
          }
        }
      });

      setAnalysis(response);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate analysis");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-purple-400" />
              <div>
                <h3 className="text-sm font-semibold text-white">Advanced AI Analysis</h3>
                <p className="text-xs text-slate-400">Predictive insights & strategic intelligence</p>
              </div>
            </div>
            <Button 
              onClick={runAnalysis}
              disabled={analyzing}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Insights
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <div className="space-y-4">
          {/* Health Score */}
          <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-2">AI Health Score</h3>
                  <div className={`text-5xl font-bold ${
                    analysis.health_score >= 80 ? 'text-emerald-400' :
                    analysis.health_score >= 60 ? 'text-blue-400' :
                    analysis.health_score >= 40 ? 'text-amber-400' :
                    'text-rose-400'
                  }`}>
                    {analysis.health_score}
                  </div>
                </div>
                <Target className="h-16 w-16 text-cyan-400/20" />
              </div>
            </CardContent>
          </Card>

          {/* Key Insights, Warnings, Opportunities */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-400" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.key_insights.map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <div className="w-1 h-1 rounded-full bg-yellow-400 mt-1.5 flex-shrink-0" />
                      <span className="text-slate-300">{insight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  Warning Signs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.warning_signs.map((warning, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs p-2 rounded bg-amber-500/10 border border-amber-500/20">
                      <AlertTriangle className="h-3 w-3 text-amber-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">{warning}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                  <Zap className="h-4 w-4 text-emerald-400" />
                  Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.opportunities.map((opp, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">{opp}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Strategic Recommendations */}
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                <Target className="h-4 w-4 text-indigo-400" />
                Strategic Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.strategic_recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">
                      {idx + 1}
                    </div>
                    <span className="text-sm text-slate-300">{rec}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis Tabs */}
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-400" />
                Detailed Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="risk" className="w-full">
                <TabsList className="bg-[#151d2e] border border-[#2a3548] grid grid-cols-4 w-full">
                  <TabsTrigger value="risk">Risk</TabsTrigger>
                  <TabsTrigger value="predictive">Predictive</TabsTrigger>
                  <TabsTrigger value="benchmark">Benchmark</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                </TabsList>

                <TabsContent value="risk" className="mt-4">
                  <ScrollArea className="h-[300px]">
                    <ReactMarkdown 
                      className="prose prose-sm prose-invert max-w-none pr-4"
                      components={{
                        h3: ({children}) => <h3 className="text-sm font-semibold text-white mb-2">{children}</h3>,
                        p: ({children}) => <p className="text-slate-300 mb-2 text-xs leading-relaxed">{children}</p>,
                        ul: ({children}) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
                        li: ({children}) => <li className="text-slate-300 text-xs">{children}</li>,
                        strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                      }}
                    >
                      {analysis.risk_intelligence}
                    </ReactMarkdown>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="predictive" className="mt-4">
                  <ScrollArea className="h-[300px]">
                    <ReactMarkdown 
                      className="prose prose-sm prose-invert max-w-none pr-4"
                      components={{
                        h3: ({children}) => <h3 className="text-sm font-semibold text-white mb-2">{children}</h3>,
                        p: ({children}) => <p className="text-slate-300 mb-2 text-xs leading-relaxed">{children}</p>,
                        ul: ({children}) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
                        li: ({children}) => <li className="text-slate-300 text-xs">{children}</li>,
                        strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                      }}
                    >
                      {analysis.predictive_analytics}
                    </ReactMarkdown>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="benchmark" className="mt-4">
                  <ScrollArea className="h-[300px]">
                    <ReactMarkdown 
                      className="prose prose-sm prose-invert max-w-none pr-4"
                      components={{
                        h3: ({children}) => <h3 className="text-sm font-semibold text-white mb-2">{children}</h3>,
                        p: ({children}) => <p className="text-slate-300 mb-2 text-xs leading-relaxed">{children}</p>,
                        ul: ({children}) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
                        li: ({children}) => <li className="text-slate-300 text-xs">{children}</li>,
                        strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                      }}
                    >
                      {analysis.benchmark_analysis}
                    </ReactMarkdown>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="resources" className="mt-4">
                  <ScrollArea className="h-[300px]">
                    <ReactMarkdown 
                      className="prose prose-sm prose-invert max-w-none pr-4"
                      components={{
                        h3: ({children}) => <h3 className="text-sm font-semibold text-white mb-2">{children}</h3>,
                        p: ({children}) => <p className="text-slate-300 mb-2 text-xs leading-relaxed">{children}</p>,
                        ul: ({children}) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
                        li: ({children}) => <li className="text-slate-300 text-xs">{children}</li>,
                        strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                      }}
                    >
                      {analysis.resource_optimization}
                    </ReactMarkdown>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}