import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function AIPatternAnalyzer({ data, dataType = "risks" }) {
  const [loading, setLoading] = useState(false);
  const [patterns, setPatterns] = useState(null);

  const analyzePatterns = async () => {
    setLoading(true);
    try {
      const qualitativeData = data.map(item => ({
        title: item.title || item.name,
        description: item.description || item.notes || "",
        category: item.category || item.domain || item.type,
        status: item.status
      }));

      const prompt = `Analyze the following ${dataType} data and identify emerging patterns, trends, and insights:

DATA:
${qualitativeData.slice(0, 50).map(d => `- ${d.title}: ${d.description.substring(0, 200)}`).join('\n')}

Provide:
1. Key emerging patterns (3-5 patterns)
2. Trend analysis
3. Risk areas of concern
4. Recommendations for action`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            patterns: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  pattern: { type: "string" },
                  frequency: { type: "string" },
                  severity: { type: "string" }
                }
              }
            },
            trends: { type: "string" },
            concerns: {
              type: "array",
              items: { type: "string" }
            },
            recommendations: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setPatterns(response);
      toast.success("Pattern analysis complete");
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze patterns");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548] p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">AI Pattern Analysis</h3>
        </div>
        <Button 
          onClick={analyzePatterns} 
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
          {loading ? "Analyzing..." : "Analyze Patterns"}
        </Button>
      </div>

      {patterns ? (
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-3">Emerging Patterns</h4>
            <div className="space-y-2">
              {patterns.patterns?.map((p, idx) => (
                <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-3">
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-white flex-1">{p.pattern}</p>
                    <Badge className={`text-[10px] ml-2 ${
                      p.severity === 'high' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      p.severity === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {p.frequency}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-2">Trend Analysis</h4>
            <Card className="bg-[#151d2e] border-[#2a3548] p-3">
              <p className="text-sm text-slate-300">{patterns.trends}</p>
            </Card>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-2">Areas of Concern</h4>
            <div className="space-y-2">
              {patterns.concerns?.map((c, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                  <p className="text-sm text-slate-400">{c}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-2">Recommendations</h4>
            <div className="space-y-2">
              {patterns.recommendations?.map((r, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                  <p className="text-sm text-slate-400">{r}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Brain className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Analyze {data.length} {dataType} to identify patterns</p>
        </div>
      )}
    </Card>
  );
}