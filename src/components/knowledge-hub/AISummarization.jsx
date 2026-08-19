import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, FileText, Copy } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function AISummarization() {
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summaryType, setSummaryType] = useState("executive");

  const generateSummary = async (type) => {
    if (!content.trim()) {
      toast.error("Please enter content to summarize");
      return;
    }

    setLoading(true);
    setSummaryType(type);
    try {
      const prompts = {
        executive: `Provide an executive summary of this GRC content. Focus on high-level insights, key takeaways, and strategic implications. Keep it concise (3-5 paragraphs).`,
        detailed: `Provide a detailed summary of this GRC content. Include main points, requirements, procedures, and important details. Organize by sections.`,
        technical: `Provide a technical summary focusing on implementation details, technical requirements, controls, and specifications.`,
        compliance: `Provide a compliance-focused summary highlighting regulatory requirements, obligations, penalties, and compliance steps.`
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `${prompts[type]}\n\n**CONTENT TO SUMMARIZE:**\n${content}`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            key_points: {
              type: "array",
              items: { type: "string" }
            },
            action_items: {
              type: "array",
              items: { type: "string" }
            },
            risk_level: { type: "string" },
            complexity: { type: "string" }
          }
        }
      });

      setSummary(result);
      toast.success("Summary generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  const copySummary = () => {
    if (!summary) return;
    const text = `${summary.summary}\n\nKey Points:\n${summary.key_points?.join('\n')}\n\nAction Items:\n${summary.action_items?.join('\n')}`;
    navigator.clipboard.writeText(text);
    toast.success("Summary copied");
  };

  return (
    <div className="space-y-4">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            AI Content Summarization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Paste content to summarize:</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste regulations, policies, long documents, or any GRC content..."
              className="bg-[#0f1623] border-[#2a3548] text-white min-h-[200px]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => generateSummary("executive")}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {loading && summaryType === "executive" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Executive Summary
            </Button>
            <Button
              onClick={() => generateSummary("detailed")}
              disabled={loading}
              variant="outline"
              className="border-[#2a3548]"
            >
              {loading && summaryType === "detailed" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
              Detailed
            </Button>
            <Button
              onClick={() => generateSummary("technical")}
              disabled={loading}
              variant="outline"
              className="border-[#2a3548]"
            >
              {loading && summaryType === "technical" && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Technical
            </Button>
            <Button
              onClick={() => generateSummary("compliance")}
              disabled={loading}
              variant="outline"
              className="border-[#2a3548]"
            >
              {loading && summaryType === "compliance" && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Compliance
            </Button>
          </div>
        </CardContent>
      </Card>

      {summary && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">Summary</CardTitle>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  {summaryType}
                </Badge>
              </div>
              <Button onClick={copySummary} size="sm" variant="outline" className="border-[#2a3548]">
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Badge className={
                summary.risk_level === 'High' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                summary.risk_level === 'Medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              }>
                Risk: {summary.risk_level}
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                Complexity: {summary.complexity}
              </Badge>
            </div>

            <div className="prose prose-sm prose-invert max-w-none">
              <ReactMarkdown>{summary.summary}</ReactMarkdown>
            </div>

            {summary.key_points?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Key Points</h4>
                <div className="space-y-1">
                  {summary.key_points.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                      <p className="text-sm text-slate-300">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {summary.action_items?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Action Items</h4>
                <div className="space-y-1">
                  {summary.action_items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                      <p className="text-sm text-slate-300">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}