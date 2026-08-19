import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Loader2, FileText, Copy } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function AISummaryGenerator({ data, context, type = "assessment" }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");

  const generateSummary = async () => {
    setLoading(true);
    try {
      let prompt = "";
      
      if (type === "assessment") {
        prompt = `Generate a comprehensive executive summary for the following risk assessment:

ASSESSMENT DATA:
${JSON.stringify(data, null, 2)}

Provide:
1. Executive Summary (2-3 paragraphs)
2. Key Findings (bullet points)
3. Risk Rating Justification
4. Recommended Actions
5. Timeline and Priority

Format the response in clear, professional markdown.`;
      } else if (type === "finding") {
        prompt = `Generate a detailed summary of the following audit finding:

FINDING DATA:
${JSON.stringify(data, null, 2)}

Provide:
1. Finding Overview
2. Root Cause Analysis
3. Business Impact
4. Management Response Assessment
5. Remediation Recommendations

Format the response in clear, professional markdown.`;
      } else {
        prompt = `Analyze and summarize the following data:

DATA:
${JSON.stringify(data, null, 2)}

${context ? `Context: ${context}` : ''}

Provide a comprehensive, well-structured summary with key insights and recommendations.`;
      }

      const response = await base44.integrations.Core.InvokeLLM({
        prompt
      });

      setSummary(response);
      toast.success("Summary generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  const copySummary = () => {
    navigator.clipboard.writeText(summary);
    toast.success("Summary copied to clipboard");
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548] p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">AI Summary Generator</h3>
        </div>
        <div className="flex gap-2">
          {summary && (
            <Button 
              variant="outline"
              onClick={copySummary}
              className="border-[#2a3548] hover:bg-[#2a3548] text-slate-300"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          )}
          <Button 
            onClick={generateSummary} 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
            {loading ? "Generating..." : "Generate Summary"}
          </Button>
        </div>
      </div>

      {summary ? (
        <Card className="bg-[#151d2e] border-[#2a3548] p-4">
          <ReactMarkdown 
            className="prose prose-sm prose-invert max-w-none text-slate-300"
            components={{
              h1: ({children}) => <h1 className="text-xl font-bold text-white mb-3">{children}</h1>,
              h2: ({children}) => <h2 className="text-lg font-semibold text-white mb-2 mt-4">{children}</h2>,
              h3: ({children}) => <h3 className="text-base font-medium text-white mb-2 mt-3">{children}</h3>,
              p: ({children}) => <p className="text-slate-300 mb-3">{children}</p>,
              ul: ({children}) => <ul className="list-disc ml-5 mb-3 space-y-1">{children}</ul>,
              ol: ({children}) => <ol className="list-decimal ml-5 mb-3 space-y-1">{children}</ol>,
              li: ({children}) => <li className="text-slate-300">{children}</li>,
              strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
            }}
          >
            {summary}
          </ReactMarkdown>
        </Card>
      ) : (
        <div className="text-center py-8">
          <Brain className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Generate an AI-powered executive summary</p>
        </div>
      )}
    </Card>
  );
}