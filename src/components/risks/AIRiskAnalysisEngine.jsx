import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Loader2, TrendingUp, AlertTriangle, Shield } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function AIRiskAnalysisEngine({ risks, controls }) {
  const [selectedRisk, setSelectedRisk] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeRisk = async () => {
    if (!selectedRisk) return;

    const risk = risks.find(r => r.id === selectedRisk);
    if (!risk) return;

    setLoading(true);
    try {
      const relatedControls = controls.filter(c => 
        risk.linked_controls?.includes(c.id) || 
        c.risk_category === risk.category
      );

      const prompt = `Perform comprehensive risk analysis:

RISK DETAILS:
Title: ${risk.title}
Category: ${risk.category}
Description: ${risk.description || 'N/A'}
Current Likelihood: ${risk.likelihood}/5
Current Impact: ${risk.impact}/5
Risk Score: ${(risk.likelihood || 0) * (risk.impact || 0)}
Status: ${risk.status}
Mitigation Plan: ${risk.mitigation_plan || 'None'}

RELATED CONTROLS: ${relatedControls.length}
- ${relatedControls.slice(0, 3).map(c => c.name).join('\n- ')}

ANALYSIS REQUIRED:

1. **Risk Assessment**
   - Validate likelihood and impact ratings
   - Identify contributing factors
   - Assess risk velocity and trend

2. **Impact Analysis**
   - Financial impact estimation
   - Operational disruption potential
   - Regulatory/compliance implications
   - Reputational damage assessment

3. **Control Effectiveness**
   - Evaluate existing controls
   - Identify control gaps
   - Recommend additional controls

4. **Mitigation Strategy**
   - Prioritized action plan
   - Quick wins (0-30 days)
   - Medium-term actions (30-90 days)
   - Long-term initiatives (90+ days)

5. **Residual Risk**
   - Post-mitigation likelihood and impact
   - Residual risk acceptability
   - Monitoring requirements

6. **Key Recommendations**
   - Top 3-5 actionable recommendations
   - Resource requirements
   - Success metrics

Format in clear, professional markdown with sections, bullet points, and tables where appropriate.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setAnalysis(response);
      toast.success("Risk analysis complete");
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze risk");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-400" />
            AI Risk Analysis Engine
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Select value={selectedRisk} onValueChange={setSelectedRisk}>
              <SelectTrigger className="flex-1 bg-[#151d2e] border-[#2a3548] text-white">
                <SelectValue placeholder="Select risk to analyze" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                {risks.map(risk => (
                  <SelectItem key={risk.id} value={risk.id} className="text-white hover:bg-[#2a3548]">
                    {risk.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={analyzeRisk} 
              disabled={!selectedRisk || loading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Brain className="h-4 w-4 mr-2" />
              )}
              Analyze
            </Button>
          </div>

          {!analysis && !loading && (
            <div className="text-center py-12">
              <TrendingUp className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-2">No analysis yet</p>
              <p className="text-sm text-slate-500">Select a risk and click Analyze</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <Loader2 className="h-16 w-16 text-indigo-400 mx-auto mb-4 animate-spin" />
              <p className="text-slate-400">Performing comprehensive risk analysis...</p>
            </div>
          )}

          {analysis && !loading && (
            <div className="bg-[#151d2e] border border-[#2a3548] rounded-lg p-6">
              <ReactMarkdown 
                className="prose prose-sm prose-invert max-w-none"
                components={{
                  h1: ({children}) => <h1 className="text-2xl font-bold text-white mb-4 mt-0">{children}</h1>,
                  h2: ({children}) => <h2 className="text-xl font-semibold text-white mb-3 mt-6 first:mt-0">{children}</h2>,
                  h3: ({children}) => <h3 className="text-lg font-medium text-white mb-2 mt-4">{children}</h3>,
                  p: ({children}) => <p className="text-slate-300 mb-3 leading-relaxed">{children}</p>,
                  ul: ({children}) => <ul className="list-disc ml-5 mb-4 space-y-1">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal ml-5 mb-4 space-y-1">{children}</ol>,
                  li: ({children}) => <li className="text-slate-300">{children}</li>,
                  strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                  table: ({children}) => <table className="w-full my-4 border-collapse">{children}</table>,
                  th: ({children}) => <th className="border border-[#2a3548] p-2 bg-[#1a2332] text-white text-left">{children}</th>,
                  td: ({children}) => <td className="border border-[#2a3548] p-2 text-slate-300">{children}</td>,
                  blockquote: ({children}) => (
                    <blockquote className="border-l-4 border-rose-500 pl-4 my-4 text-slate-400 italic">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {analysis}
              </ReactMarkdown>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}