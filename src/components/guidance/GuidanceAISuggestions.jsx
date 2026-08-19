import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, ChevronRight, AlertTriangle, Shield, FileCheck } from "lucide-react";

export default function GuidanceAISuggestions({ guidance, onSelectGuidance }) {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: () => base44.entities.Risk.list('-created_date', 20)
  });

  const { data: compliance = [] } = useQuery({
    queryKey: ['compliance'],
    queryFn: () => base44.entities.Compliance.list('-created_date', 20)
  });

  const { data: audits = [] } = useQuery({
    queryKey: ['audits'],
    queryFn: () => base44.entities.Audit.list('-created_date', 10)
  });

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const context = {
        risks: risks.slice(0, 10).map(r => ({ title: r.title, category: r.category, status: r.status, severity: (r.likelihood || 0) * (r.impact || 0) })),
        compliance: compliance.slice(0, 10).map(c => ({ framework: c.framework, requirement: c.requirement, status: c.status })),
        audits: audits.slice(0, 5).map(a => ({ title: a.title, type: a.type, findings: a.findings_count, status: a.status })),
        availableGuidance: guidance.map(g => ({ id: g.id, title: g.title, framework: g.framework, category: g.category }))
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze the following GRC data and suggest the most relevant guidance documents from the available library.

Current Risks: ${JSON.stringify(context.risks)}
Compliance Status: ${JSON.stringify(context.compliance)}
Recent Audits: ${JSON.stringify(context.audits)}
Available Guidance: ${JSON.stringify(context.availableGuidance)}

Based on:
1. High-severity or critical risks that need attention
2. Non-compliant or in-progress compliance requirements
3. Audit findings and gaps

Suggest up to 5 most relevant guidance documents with explanations of why they're relevant.`,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  guidance_id: { type: "string" },
                  reason: { type: "string" },
                  priority: { type: "string", enum: ["high", "medium", "low"] },
                  related_items: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      setSuggestions(result.suggestions || []);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    }
    setLoading(false);
  };

  const getGuidanceById = (id) => guidance.find(g => g.id === id);

  const priorityColors = {
    high: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548] p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-violet-500/10">
            <Sparkles className="h-4 w-4 text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">AI Suggestions</h3>
            <p className="text-[10px] text-slate-500">Based on your risks, compliance & audits</p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={generateSuggestions}
          disabled={loading}
          className="bg-violet-600 hover:bg-violet-700 text-xs"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
          {suggestions ? 'Refresh' : 'Generate'}
        </Button>
      </div>

      {!suggestions && !loading && (
        <p className="text-xs text-slate-500 text-center py-4">
          Click generate to get AI-powered guidance suggestions based on your current GRC data
        </p>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 text-violet-400 animate-spin" />
        </div>
      )}

      {suggestions && suggestions.length > 0 && (
        <div className="space-y-3">
          {suggestions.map((suggestion, idx) => {
            const guidanceItem = getGuidanceById(suggestion.guidance_id);
            if (!guidanceItem) return null;

            return (
              <div
                key={idx}
                className="p-3 bg-[#151d2e] rounded-lg border border-[#2a3548] hover:border-violet-500/30 cursor-pointer transition-all"
                onClick={() => onSelectGuidance(guidanceItem)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`text-[9px] border ${priorityColors[suggestion.priority]}`}>
                        {suggestion.priority}
                      </Badge>
                      <span className="text-[10px] text-slate-500">{guidanceItem.framework}</span>
                    </div>
                    <h4 className="text-sm font-medium text-white truncate">{guidanceItem.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{suggestion.reason}</p>
                    {suggestion.related_items?.length > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-[10px] text-slate-500">Related:</span>
                        {suggestion.related_items.slice(0, 2).map((item, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 bg-[#1a2332] rounded text-slate-400 border border-[#2a3548]">
                            {item}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500 flex-shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {suggestions && suggestions.length === 0 && (
        <p className="text-xs text-slate-500 text-center py-4">
          No specific suggestions at this time. Your GRC posture looks good!
        </p>
      )}
    </Card>
  );
}