import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Loader2, AlertTriangle, Shield, ArrowRight, Target } from "lucide-react";

export default function AIRiskAnalyzer({ open, onOpenChange, onCreateRisk, existingRisks = [] }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const analyzeRisk = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this risk scenario and identify potential risks:

${input}

Existing risks for context: ${JSON.stringify(existingRisks.slice(0, 10).map(r => r.title))}

Identify risks with: title, description, category, likelihood (1-5), impact (1-5), and suggested mitigation.`,
        response_json_schema: {
          type: "object",
          properties: {
            risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  category: { type: "string", enum: ["operational", "financial", "strategic", "compliance", "cybersecurity", "reputational"] },
                  likelihood: { type: "number" },
                  impact: { type: "number" },
                  mitigation_plan: { type: "string" }
                }
              }
            }
          }
        }
      });
      setResult(response);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const getRiskLevel = (l, i) => {
    const score = l * i;
    if (score >= 16) return { label: 'Critical', color: 'bg-rose-500' };
    if (score >= 9) return { label: 'High', color: 'bg-amber-500' };
    if (score >= 4) return { label: 'Medium', color: 'bg-yellow-500' };
    return { label: 'Low', color: 'bg-emerald-500' };
  };

  const handleCreate = (risk) => {
    onCreateRisk({
      title: risk.title,
      description: risk.description,
      category: risk.category,
      likelihood: risk.likelihood,
      impact: risk.impact,
      mitigation_plan: risk.mitigation_plan,
      status: 'identified'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#1a2332] border-[#2a3548] text-white max-h-[85vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-400" />
            AI Risk Analyzer
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(85vh-100px)] p-6 pt-4">
          {!result ? (
            <div className="space-y-4">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="bg-[#151d2e] border-[#2a3548] text-white h-32"
                placeholder="Describe a scenario, process, or concern to analyze for potential risks..."
              />
              <Button onClick={analyzeRisk} disabled={loading || !input.trim()} className="w-full bg-violet-600 hover:bg-violet-700">
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Analyze
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {result.risks?.map((risk, idx) => {
                const level = getRiskLevel(risk.likelihood, risk.impact);
                return (
                  <div key={idx} className="p-4 bg-[#151d2e] rounded-xl border border-[#2a3548]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`w-2 h-2 rounded-full ${level.color}`} />
                          <h4 className="font-medium text-white">{risk.title}</h4>
                        </div>
                        <p className="text-sm text-slate-400 mb-3">{risk.description}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="text-[10px] bg-slate-500/10 text-slate-400 capitalize">{risk.category}</Badge>
                          <span className="text-xs text-slate-500">L:{risk.likelihood} × I:{risk.impact} = {risk.likelihood * risk.impact}</span>
                        </div>
                        <p className="text-xs text-slate-500"><strong className="text-slate-400">Mitigation:</strong> {risk.mitigation_plan}</p>
                      </div>
                      <Button size="sm" onClick={() => handleCreate(risk)} className="bg-indigo-600 hover:bg-indigo-700">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              <Button variant="outline" onClick={() => { setResult(null); setInput(''); }} className="w-full border-[#2a3548]">
                Analyze Another
              </Button>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}