import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, AlertTriangle, Plus } from "lucide-react";
import { toast } from "sonner";

export default function AIRiskSuggestions({ controls, incidents, onCreateRisk }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const analyzeTrends = async () => {
    setLoading(true);
    try {
      const ineffectiveControls = controls.filter(c => c.status === 'ineffective' || c.effectiveness < 3);
      const recentIncidents = incidents.filter(i => {
        const date = new Date(i.reported_date || i.created_date);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return date > thirtyDaysAgo;
      });

      const prompt = `Analyze the following GRC data and suggest potential risks:

INEFFECTIVE CONTROLS (${ineffectiveControls.length}):
${ineffectiveControls.slice(0, 10).map(c => `- ${c.name} (${c.domain}, Status: ${c.status})`).join('\n')}

RECENT INCIDENTS (Last 30 days, ${recentIncidents.length}):
${recentIncidents.slice(0, 10).map(i => `- ${i.title} (${i.incident_type}, Severity: ${i.severity})`).join('\n')}

Based on these control weaknesses and incident trends, suggest 5 potential risks that should be monitored. For each risk, provide:
1. Risk title
2. Category (operational, financial, strategic, compliance, cybersecurity, reputational)
3. Description
4. Estimated likelihood (1-5)
5. Estimated impact (1-5)
6. Rationale`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  category: { type: "string" },
                  description: { type: "string" },
                  likelihood: { type: "number" },
                  impact: { type: "number" },
                  rationale: { type: "string" }
                }
              }
            }
          }
        }
      });

      setSuggestions(response.risks || []);
      toast.success("AI analysis complete");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate suggestions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548] p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">AI Risk Suggestions</h3>
        </div>
        <Button 
          onClick={analyzeTrends} 
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
          {loading ? "Analyzing..." : "Analyze Trends"}
        </Button>
      </div>

      {suggestions.length > 0 ? (
        <div className="space-y-3">
          {suggestions.map((risk, idx) => (
            <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-white mb-1">{risk.title}</h4>
                  <Badge className="text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/20">
                    {risk.category}
                  </Badge>
                </div>
                <Badge className={`text-[10px] ${
                  risk.likelihood * risk.impact >= 16 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                  risk.likelihood * risk.impact >= 9 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                }`}>
                  Score: {risk.likelihood * risk.impact}
                </Badge>
              </div>
              <p className="text-sm text-slate-400 mb-3">{risk.description}</p>
              <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                <span>Likelihood: {risk.likelihood}/5</span>
                <span>Impact: {risk.impact}/5</span>
              </div>
              <div className="bg-[#0f1623] rounded p-2 mb-3">
                <p className="text-xs text-slate-400"><span className="font-medium text-purple-400">AI Rationale:</span> {risk.rationale}</p>
              </div>
              <Button 
                size="sm" 
                onClick={() => onCreateRisk(risk)}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-3 w-3 mr-1" />
                Create Risk
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Click "Analyze Trends" to get AI-powered risk suggestions</p>
        </div>
      )}
    </Card>
  );
}