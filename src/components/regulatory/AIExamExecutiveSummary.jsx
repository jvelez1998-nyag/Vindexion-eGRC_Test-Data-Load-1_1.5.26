import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, Loader2, FileText, Download, CheckCircle2, 
  AlertTriangle, TrendingUp, Target, Sparkles 
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function AIExamExecutiveSummary({ exam, findings = [], controls = [], risks = [] }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  const generateSummary = async () => {
    if (!exam) {
      toast.error("No exam selected");
      return;
    }

    setLoading(true);
    try {
      const prompt = `You are an expert regulatory compliance advisor preparing an executive summary for a regulatory examination.

EXAM DETAILS:
- Title: ${exam.exam_title}
- Type: ${exam.exam_type}
- Exam Date: ${exam.exam_date || 'TBD'}
- Status: ${exam.status}
- Workflow Stage: ${exam.workflow_stage || 'Not specified'}
- Readiness Score: ${exam.readiness_score || 0}%
- Lead Coordinator: ${exam.lead_coordinator || 'Not assigned'}
- Team Size: ${exam.team_members?.length || 0}
- Scope Areas: ${exam.scope_areas?.join(', ') || 'Not defined'}

ORGANIZATIONAL CONTEXT:
- Total Findings: ${findings.length}
- Critical Findings: ${findings.filter(f => f.severity === 'critical').length}
- High Risk Areas: ${risks.filter(r => (r.residual_likelihood || 0) * (r.residual_impact || 0) >= 15).length}
- Control Effectiveness: ${controls.filter(c => c.effectiveness >= 4).length} effective controls out of ${controls.length}

${exam.pre_exam_assessment ? `\nPRE-EXAM ASSESSMENT RESULTS:\n${JSON.stringify(exam.pre_exam_assessment, null, 2)}` : ''}

${exam.lessons_learned ? `\nPREVIOUS LESSONS LEARNED:\n${JSON.stringify(exam.lessons_learned, null, 2)}` : ''}

Generate a comprehensive executive summary that includes:

1. **Overview & Purpose**: Brief context about the exam and its strategic importance
2. **Current Status**: Clear statement of preparation progress and readiness
3. **Scope of Examination**: What areas will be covered
4. **Key Strengths**: Areas where the organization is well-prepared
5. **Areas of Concern**: Specific vulnerabilities or gaps identified
6. **Readiness Assessment**: Overall evaluation of preparedness with specific metrics
7. **Critical Action Items**: Top 5-7 priority actions needed before the exam
8. **Resource Requirements**: Team, documentation, and system access needs
9. **Risk Mitigation Strategy**: How identified risks will be addressed
10. **Expected Timeline**: Key milestones and deadlines
11. **Success Criteria**: How we'll measure exam success
12. **Executive Recommendations**: Strategic guidance for leadership

Make this professional, concise, and actionable. Use clear formatting with headers and bullet points.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setSummary(response);
      toast.success("Executive summary generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  const exportSummary = () => {
    if (!summary) return;

    const blob = new Blob([summary], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exam.exam_title.replace(/\s+/g, '-')}-executive-summary.md`;
    a.click();
    toast.success("Summary exported");
  };

  return (
    <div className="space-y-4">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30">
                <Brain className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <CardTitle className="text-lg">AI Executive Summary</CardTitle>
                <p className="text-xs text-slate-400 mt-1">Generate comprehensive exam readiness summary for leadership</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {summary && (
                <Button 
                  onClick={exportSummary}
                  variant="outline"
                  size="sm"
                  className="border-[#2a3548] text-slate-400 hover:text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
              <Button 
                onClick={generateSummary}
                disabled={loading}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Summary
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        {summary && (
          <CardContent>
            <ScrollArea className="h-[700px]">
              <div className="pr-4">
                <Card className="bg-[#151d2e] border-[#2a3548]">
                  <CardContent className="p-6">
                    <ReactMarkdown
                      className="prose prose-invert max-w-none"
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-2xl font-bold text-white mb-4 pb-2 border-b border-violet-500/30">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-xl font-semibold text-white mt-6 mb-3 flex items-center gap-2">
                            <span className="w-1 h-6 bg-violet-500 rounded-full"></span>
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-lg font-semibold text-white mt-4 mb-2">{children}</h3>
                        ),
                        p: ({ children }) => (
                          <p className="text-slate-300 mb-3 leading-relaxed">{children}</p>
                        ),
                        ul: ({ children }) => (
                          <ul className="space-y-2 mb-4 ml-4">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="space-y-2 mb-4 ml-4 list-decimal">{children}</ol>
                        ),
                        li: ({ children }) => (
                          <li className="text-slate-300 flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-violet-400 mt-0.5 flex-shrink-0" />
                            <span>{children}</span>
                          </li>
                        ),
                        strong: ({ children }) => (
                          <strong className="text-white font-semibold">{children}</strong>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-violet-500 pl-4 py-2 my-4 bg-violet-500/5 rounded-r-lg">
                            {children}
                          </blockquote>
                        ),
                        code: ({ inline, children }) => 
                          inline ? (
                            <code className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 text-sm font-mono">
                              {children}
                            </code>
                          ) : (
                            <code className="block p-3 rounded-lg bg-[#0f1623] text-slate-300 text-sm font-mono my-2">
                              {children}
                            </code>
                          )
                      }}
                    >
                      {summary}
                    </ReactMarkdown>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </CardContent>
        )}

        {!summary && !loading && (
          <CardContent>
            <div className="text-center py-12">
              <div className="p-4 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-10 w-10 text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Ready to Generate</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Click the button above to generate a comprehensive executive summary analyzing readiness, 
                risks, action items, and strategic recommendations for this regulatory examination.
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}