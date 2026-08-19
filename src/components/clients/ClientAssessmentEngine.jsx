import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, Loader2, CheckCircle2, AlertTriangle, 
  TrendingUp, Shield, Target, Zap 
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function ClientAssessmentEngine({ client, onAssessmentComplete }) {
  const [assessing, setAssessing] = useState(false);
  const [assessment, setAssessment] = useState(null);

  const runAssessment = async () => {
    setAssessing(true);
    try {
      const prompt = `You are an expert GRC consultant. Conduct a comprehensive risk and compliance assessment for this client.

CLIENT PROFILE:
- Name: ${client.name}
- Industry: ${client.industry}
- Type: ${client.client_type}
- Current Risk Score: ${client.risk_score || 'Not assessed'}
- Compliance Score: ${client.compliance_score || 'Not assessed'}
- Control Maturity: ${client.control_maturity || 'Not assessed'}
- Security Posture: ${client.security_posture || 'Not assessed'}
- Status: ${client.status}
- Incidents: ${client.incident_count || 0}
- Findings: ${client.finding_count || 0}
- Critical Issues: ${client.critical_issues || 0}
- Data Classification: ${client.data_classification}
- Regulatory Frameworks: ${client.regulatory_frameworks?.join(', ') || 'None specified'}

PROVIDE A COMPREHENSIVE ASSESSMENT:

1. **Executive Summary**
   - Overall client risk level
   - Key concerns
   - Priority areas

2. **Risk Assessment** (Score 0-100)
   - Calculated risk score based on profile
   - Risk factors analysis
   - Industry-specific risks
   - Justification for score

3. **Compliance Assessment** (Score 0-100)
   - Compliance maturity level
   - Framework alignment
   - Gap analysis
   - Justification for score

4. **Control Environment** (Score 0-100)
   - Control maturity assessment
   - Control coverage
   - Key control weaknesses
   - Justification for score

5. **Security Posture** (Score 0-100)
   - Security capability assessment
   - Vulnerability areas
   - Security recommendations
   - Justification for score

6. **Compliance Gaps**
   - List specific compliance gaps
   - Regulatory requirements not met
   - Priority level for each gap

7. **Recommendations**
   - Immediate actions (next 30 days)
   - Short-term improvements (3 months)
   - Long-term strategy (6-12 months)
   - Resource requirements

8. **Next Review Date**
   - Recommended date based on risk level
   - Review frequency justification

Return JSON:
{
  "risk_score": number,
  "compliance_score": number,
  "control_maturity": number,
  "security_posture": number,
  "risk_level": "low|medium|high|critical",
  "compliance_gaps": ["gap1", "gap2", ...],
  "next_review_date": "YYYY-MM-DD",
  "summary": "executive summary markdown",
  "detailed_analysis": "full assessment markdown"
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            risk_score: { type: "number" },
            compliance_score: { type: "number" },
            control_maturity: { type: "number" },
            security_posture: { type: "number" },
            risk_level: { type: "string" },
            compliance_gaps: { type: "array" },
            next_review_date: { type: "string" },
            summary: { type: "string" },
            detailed_analysis: { type: "string" }
          }
        }
      });

      setAssessment(response);
      toast.success("Assessment complete!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to run assessment");
    } finally {
      setAssessing(false);
    }
  };

  const applyAssessment = () => {
    if (assessment && onAssessmentComplete) {
      onAssessmentComplete({
        risk_score: assessment.risk_score,
        compliance_score: assessment.compliance_score,
        control_maturity: assessment.control_maturity,
        security_posture: assessment.security_posture,
        risk_level: assessment.risk_level,
        compliance_gaps: assessment.compliance_gaps,
        next_review_date: assessment.next_review_date,
        last_assessment_date: new Date().toISOString().split('T')[0],
        assessment_history: [
          ...(client.assessment_history || []),
          {
            date: new Date().toISOString(),
            risk_score: assessment.risk_score,
            compliance_score: assessment.compliance_score,
            control_maturity: assessment.control_maturity,
            security_posture: assessment.security_posture
          }
        ]
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-violet-400" />
              <div>
                <h3 className="text-sm font-semibold text-white">AI-Powered Assessment</h3>
                <p className="text-xs text-slate-400">Comprehensive risk & compliance evaluation</p>
              </div>
            </div>
            <Button 
              onClick={runAssessment}
              disabled={assessing}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              {assessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assessing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Run Assessment
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {assessment && (
        <div className="space-y-4">
          {/* Scores Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Shield className="h-4 w-4 text-blue-400" />
                  <Badge className={`text-xs ${
                    assessment.compliance_score >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                    assessment.compliance_score >= 60 ? 'bg-blue-500/20 text-blue-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {assessment.compliance_score}
                  </Badge>
                </div>
                <div className="text-xs text-slate-400">Compliance</div>
                <Progress value={assessment.compliance_score} className="mt-2 h-1.5" />
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                  <Badge className={`text-xs ${
                    assessment.risk_score < 30 ? 'bg-emerald-500/20 text-emerald-400' :
                    assessment.risk_score < 60 ? 'bg-blue-500/20 text-blue-400' :
                    'bg-rose-500/20 text-rose-400'
                  }`}>
                    {assessment.risk_score}
                  </Badge>
                </div>
                <div className="text-xs text-slate-400">Risk Score</div>
                <Progress value={assessment.risk_score} className="mt-2 h-1.5" />
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <Badge className={`text-xs ${
                    assessment.control_maturity >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                    assessment.control_maturity >= 60 ? 'bg-blue-500/20 text-blue-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {assessment.control_maturity}
                  </Badge>
                </div>
                <div className="text-xs text-slate-400">Controls</div>
                <Progress value={assessment.control_maturity} className="mt-2 h-1.5" />
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Zap className="h-4 w-4 text-purple-400" />
                  <Badge className={`text-xs ${
                    assessment.security_posture >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                    assessment.security_posture >= 60 ? 'bg-blue-500/20 text-blue-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {assessment.security_posture}
                  </Badge>
                </div>
                <div className="text-xs text-slate-400">Security</div>
                <Progress value={assessment.security_posture} className="mt-2 h-1.5" />
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                <Target className="h-4 w-4 text-cyan-400" />
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ReactMarkdown 
                className="prose prose-sm prose-invert max-w-none"
                components={{
                  p: ({children}) => <p className="text-slate-300 mb-2 text-sm">{children}</p>,
                  strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                  ul: ({children}) => <ul className="list-disc ml-4 space-y-1">{children}</ul>,
                  li: ({children}) => <li className="text-slate-300 text-sm">{children}</li>,
                }}
              >
                {assessment.summary}
              </ReactMarkdown>
            </CardContent>
          </Card>

          {/* Compliance Gaps */}
          {assessment.compliance_gaps?.length > 0 && (
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  Compliance Gaps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {assessment.compliance_gaps.map((gap, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 rounded bg-amber-500/5 border border-amber-500/20">
                      <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-300">{gap}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed Analysis */}
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                <Brain className="h-4 w-4 text-violet-400" />
                Detailed Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <ReactMarkdown 
                  className="prose prose-sm prose-invert max-w-none pr-4"
                  components={{
                    h1: ({children}) => <h1 className="text-lg font-bold text-white mb-3 mt-4 first:mt-0">{children}</h1>,
                    h2: ({children}) => <h2 className="text-base font-semibold text-white mb-2 mt-3">{children}</h2>,
                    h3: ({children}) => <h3 className="text-sm font-medium text-white mb-2 mt-2">{children}</h3>,
                    p: ({children}) => <p className="text-slate-300 mb-2 text-sm leading-relaxed">{children}</p>,
                    ul: ({children}) => <ul className="list-disc ml-4 mb-3 space-y-1">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal ml-4 mb-3 space-y-1">{children}</ol>,
                    li: ({children}) => <li className="text-slate-300 text-sm">{children}</li>,
                    strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                  }}
                >
                  {assessment.detailed_analysis}
                </ReactMarkdown>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Apply Button */}
          <Button 
            onClick={applyAssessment}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Apply Assessment to Client
          </Button>
        </div>
      )}
    </div>
  );
}