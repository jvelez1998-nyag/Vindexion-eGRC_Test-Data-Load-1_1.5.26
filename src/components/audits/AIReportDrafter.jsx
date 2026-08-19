import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Loader2, FileText, Download, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function AIReportDrafter({ audit }) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const { data: findings = [] } = useQuery({
    queryKey: ['findings', audit?.id],
    queryFn: () => base44.entities.AuditFinding.filter({ audit_id: audit?.id }),
    enabled: !!audit?.id
  });

  const { data: workpapers = [] } = useQuery({
    queryKey: ['workpapers', audit?.id],
    queryFn: () => base44.entities.AuditWorkpaper.filter({ audit_id: audit?.id }),
    enabled: !!audit?.id
  });

  const generateReport = async () => {
    if (!audit) {
      toast.error("No audit selected");
      return;
    }

    setLoading(true);
    try {
      const criticalFindings = findings.filter(f => f.severity === 'critical');
      const highFindings = findings.filter(f => f.severity === 'high');
      
      const prompt = `Generate a comprehensive professional audit report for "${audit.title}".

AUDIT DETAILS:
Type: ${audit.type}
Scope: ${audit.scope}
Status: ${audit.status}
Auditor: ${audit.auditor || 'N/A'}
Duration: ${audit.start_date} to ${audit.end_date || 'In Progress'}

FINDINGS SUMMARY:
Total Findings: ${findings.length}
Critical: ${criticalFindings.length}
High: ${highFindings.length}
Medium: ${findings.filter(f => f.severity === 'medium').length}
Low: ${findings.filter(f => f.severity === 'low').length}

KEY FINDINGS:
${findings.slice(0, 8).map(f => `
- [${f.severity.toUpperCase()}] ${f.title}
  Category: ${f.category}
  Condition: ${f.condition}
  Effect: ${f.effect}
  Recommendation: ${f.recommendation}
`).join('\n')}

WORKPAPERS COMPLETED: ${workpapers.length}

Generate a professional audit report with:

1. **Executive Summary** (2-3 paragraphs)
   - Overall audit objective and scope
   - Key findings summary
   - Overall opinion/conclusion
   - Critical recommendations

2. **Audit Objectives & Scope**
   - What was audited
   - Methodology
   - Period covered
   - Limitations (if any)

3. **Detailed Findings** (for each finding)
   - Finding title and severity
   - Criteria (what should be)
   - Condition (what is)
   - Cause (why the gap exists)
   - Effect (impact/risk)
   - Recommendation
   - Management response (placeholder)

4. **Risk Assessment**
   - Risk rating of each finding
   - Aggregate risk exposure
   - Priority remediation areas

5. **Recommendations Summary**
   - Prioritized action items
   - Quick wins vs. strategic initiatives
   - Timeline suggestions

6. **Conclusion**
   - Overall assessment
   - Path forward
   - Follow-up requirements

Format in professional markdown. Use tables where appropriate. Be detailed and actionable.`;

      const reportContent = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setReport(reportContent);
      toast.success("Audit report generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (report) {
      navigator.clipboard.writeText(report);
      toast.success("Report copied to clipboard");
    }
  };

  const downloadReport = () => {
    if (!report) return;
    
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-report-${audit?.title?.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  };

  if (!report) {
    return (
      <Card className="bg-[#1a2332] border-[#2a3548] p-8 text-center">
        <div className="p-4 rounded-full bg-indigo-500/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Brain className="h-8 w-8 text-indigo-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">AI Audit Report Drafter</h3>
        <p className="text-slate-400 text-sm mb-6 max-w-2xl mx-auto">
          Generate a comprehensive, professional audit report based on {findings.length} findings and {workpapers.length} workpapers
        </p>
        
        {audit && (
          <div className="grid grid-cols-4 gap-4 mb-6 max-w-2xl mx-auto">
            <div className="p-3 bg-[#151d2e] rounded-lg border border-[#2a3548]">
              <div className="text-2xl font-bold text-white">{findings.length}</div>
              <div className="text-xs text-slate-500">Total Findings</div>
            </div>
            <div className="p-3 bg-[#151d2e] rounded-lg border border-[#2a3548]">
              <div className="text-2xl font-bold text-rose-400">{findings.filter(f => f.severity === 'critical').length}</div>
              <div className="text-xs text-slate-500">Critical</div>
            </div>
            <div className="p-3 bg-[#151d2e] rounded-lg border border-[#2a3548]">
              <div className="text-2xl font-bold text-orange-400">{findings.filter(f => f.severity === 'high').length}</div>
              <div className="text-xs text-slate-500">High</div>
            </div>
            <div className="p-3 bg-[#151d2e] rounded-lg border border-[#2a3548]">
              <div className="text-2xl font-bold text-blue-400">{workpapers.length}</div>
              <div className="text-xs text-slate-500">Workpapers</div>
            </div>
          </div>
        )}

        <Button onClick={generateReport} disabled={loading || !audit} className="bg-indigo-600 hover:bg-indigo-700">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Generate Audit Report
            </>
          )}
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Draft Report Generated</h3>
            <p className="text-sm text-slate-400">Review, edit, and finalize your audit report</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={copyToClipboard} variant="outline" size="sm" className="border-[#2a3548]">
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          <Button onClick={downloadReport} variant="outline" size="sm" className="border-[#2a3548]">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button onClick={() => setReport(null)} variant="outline" size="sm" className="border-[#2a3548]">
            New Report
          </Button>
        </div>
      </div>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <ScrollArea className="h-[700px] p-6">
          <div className="prose prose-invert prose-slate max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-3xl font-bold text-white mb-4 mt-6">{children}</h1>,
                h2: ({ children }) => <h2 className="text-2xl font-semibold text-white mb-3 mt-5">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xl font-semibold text-white mb-2 mt-4">{children}</h3>,
                p: ({ children }) => <p className="text-slate-300 mb-3 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="list-disc ml-6 mb-3 text-slate-300 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal ml-6 mb-3 text-slate-300 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-slate-300">{children}</li>,
                strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                em: ({ children }) => <em className="text-indigo-300">{children}</em>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-indigo-500 pl-4 my-3 text-slate-400 italic">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full border border-[#2a3548] rounded-lg">{children}</table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-[#151d2e]">{children}</thead>,
                tbody: ({ children }) => <tbody className="divide-y divide-[#2a3548]">{children}</tbody>,
                tr: ({ children }) => <tr>{children}</tr>,
                th: ({ children }) => (
                  <th className="px-4 py-2 text-left text-sm font-semibold text-white">{children}</th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-2 text-sm text-slate-300">{children}</td>
                ),
                code: ({ inline, children }) => 
                  inline ? (
                    <code className="px-1.5 py-0.5 rounded bg-[#151d2e] text-indigo-400 text-sm">{children}</code>
                  ) : (
                    <code className="block p-3 rounded bg-[#151d2e] text-slate-300 text-sm overflow-x-auto my-2">{children}</code>
                  )
              }}
            >
              {report}
            </ReactMarkdown>
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}