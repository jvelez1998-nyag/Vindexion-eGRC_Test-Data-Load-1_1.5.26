import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Loader2, FileText, Download } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AIExecutiveSummaryGenerator({ client, risks = [], audits = [], incidents = [] }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  const generateSummary = async () => {
    setLoading(true);
    try {
      const prompt = `As an executive report writer, create a comprehensive executive summary for this client.

CLIENT PROFILE:
${JSON.stringify(client, null, 2)}

LINKED RISKS: ${risks.length} risks identified
LINKED AUDITS: ${audits.length} audits conducted
LINKED INCIDENTS: ${incidents.length} incidents recorded

Create a professional executive summary in markdown format with:

## Executive Summary
Brief 2-3 sentence overview of the client's GRC posture

## Key Highlights
- 3-5 bullet points of positive achievements
- Use specific metrics where available

## Risk Profile
### Overall Assessment
Brief narrative on risk landscape

### Top 3 Risks
1. **Risk Name**: Brief description, impact, and current status
2. **Risk Name**: Brief description, impact, and current status
3. **Risk Name**: Brief description, impact, and current status

## Compliance Status
- Current compliance score and trends
- Key compliance achievements
- Areas requiring attention

## Critical Findings
- Top 3-5 most critical issues requiring immediate attention
- Include severity and business impact

## Recommendations
### Immediate Actions (0-30 days)
1. Specific action with expected outcome
2. Specific action with expected outcome

### Short-term Actions (1-3 months)
1. Specific action with expected outcome
2. Specific action with expected outcome

### Strategic Actions (3-12 months)
1. Specific action with expected outcome
2. Specific action with expected outcome

## Performance Metrics
- Table or list of key metrics with trends
- Include: Compliance Score, Risk Score, Control Maturity, Security Posture

## Conclusion
Brief 2-3 sentence conclusion with overall assessment and outlook

Write in clear, executive-friendly language. Use metrics. Be concise but comprehensive.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt
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

  const downloadSummary = () => {
    const blob = new Blob([summary], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${client.name.replace(/\s+/g, '_')}_Executive_Summary.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Summary downloaded");
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-400" />
            AI Executive Summary
          </CardTitle>
          {summary && (
            <Button
              size="sm"
              variant="outline"
              onClick={downloadSummary}
              className="border-[#2a3548] text-slate-400 h-7"
            >
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!summary ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-indigo-400 mx-auto mb-3" />
            <p className="text-sm text-slate-400 mb-4">
              Generate a comprehensive executive-ready summary highlighting key risks, findings, and strategic recommendations
            </p>
            <Button 
              onClick={generateSummary}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Executive Summary
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[600px]">
              <Card className="bg-[#151d2e] border-[#2a3548]">
                <CardContent className="p-4">
                  <ReactMarkdown
                    className="prose prose-sm prose-invert max-w-none"
                    components={{
                      h1: ({ children }) => <h1 className="text-xl font-bold text-white mb-3 pb-2 border-b border-[#2a3548]">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-lg font-bold text-white mb-2 mt-4">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-base font-semibold text-cyan-400 mb-2 mt-3">{children}</h3>,
                      p: ({ children }) => <p className="text-sm text-slate-300 mb-3 leading-relaxed">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc ml-5 mb-3 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal ml-5 mb-3 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="text-sm text-slate-300">{children}</li>,
                      strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-3">
                          <table className="min-w-full border border-[#2a3548] rounded">{children}</table>
                        </div>
                      ),
                      thead: ({ children }) => <thead className="bg-[#1a2332]">{children}</thead>,
                      th: ({ children }) => <th className="px-3 py-2 text-left text-xs font-semibold text-white border-b border-[#2a3548]">{children}</th>,
                      td: ({ children }) => <td className="px-3 py-2 text-xs text-slate-300 border-b border-[#2a3548]">{children}</td>
                    }}
                  >
                    {summary}
                  </ReactMarkdown>
                </CardContent>
              </Card>
            </ScrollArea>

            <Button 
              onClick={generateSummary}
              disabled={loading}
              variant="outline"
              size="sm"
              className="w-full border-[#2a3548] text-slate-400"
            >
              <Brain className="h-3 w-3 mr-2" />
              Regenerate
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}