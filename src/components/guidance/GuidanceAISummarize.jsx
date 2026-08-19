import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, FileText, CheckCircle2, Lightbulb } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function GuidanceAISummarize({ guidance }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateSummary = async () => {
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Summarize this regulatory/compliance guidance document in a clear, actionable format:

Title: ${guidance.title}
Framework: ${guidance.framework}
Category: ${guidance.category}
Reference ID: ${guidance.reference_id || 'N/A'}

Description: ${guidance.description || 'N/A'}

Requirements: ${guidance.requirements || 'N/A'}

Implementation Tips: ${guidance.implementation_tips || 'N/A'}

Evidence Examples: ${guidance.evidence_examples || 'N/A'}

Provide:
1. A brief executive summary (2-3 sentences)
2. Key takeaways (bullet points)
3. Critical action items
4. Common pitfalls to avoid`,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            key_takeaways: { type: "array", items: { type: "string" } },
            action_items: { type: "array", items: { type: "string" } },
            pitfalls: { type: "array", items: { type: "string" } }
          }
        }
      });

      setSummary(result);
    } catch (error) {
      console.error('Error generating summary:', error);
    }
    setLoading(false);
  };

  if (!summary) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={generateSummary}
        disabled={loading}
        className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10 hover:text-violet-300"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5 mr-1.5" />
        )}
        AI Summary
      </Button>
    );
  }

  return (
    <div className="space-y-4 mt-4 p-4 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 rounded-xl border border-violet-500/20">
      <div className="flex items-center gap-2 text-violet-400">
        <Sparkles className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wider">AI Summary</span>
      </div>

      <div>
        <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          Executive Summary
        </h4>
        <p className="text-sm text-slate-300">{summary.executive_summary}</p>
      </div>

      {summary.key_takeaways?.length > 0 && (
        <div>
          <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Key Takeaways
          </h4>
          <ul className="space-y-1">
            {summary.key_takeaways.map((item, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-emerald-400 mt-1">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary.action_items?.length > 0 && (
        <div>
          <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Lightbulb className="h-3.5 w-3.5" />
            Action Items
          </h4>
          <ul className="space-y-1">
            {summary.action_items.map((item, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-indigo-400 mt-1">→</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary.pitfalls?.length > 0 && (
        <div>
          <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5 text-amber-400">
            ⚠️ Common Pitfalls
          </h4>
          <ul className="space-y-1">
            {summary.pitfalls.map((item, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-amber-400 mt-1">!</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={generateSummary}
        disabled={loading}
        className="text-xs text-slate-500 hover:text-slate-300"
      >
        {loading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : null}
        Regenerate
      </Button>
    </div>
  );
}