import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

const frameworks = ['SOX', 'SOC2', 'ISO27001', 'GDPR', 'PCI-DSS', 'HIPAA', 'NIST'];

export default function AIComplianceGap({ open, onOpenChange, compliance = [], onCreateRequirement }) {
  const [framework, setFramework] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const analyzeGaps = async () => {
    if (!framework) return;
    setLoading(true);
    try {
      const existingReqs = compliance.filter(c => c.framework === framework).map(c => c.requirement);
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze ${framework} compliance gaps. Current requirements tracked: ${JSON.stringify(existingReqs)}

Identify:
1. Missing key requirements for ${framework}
2. Priority level for each gap
3. Brief description of what's needed`,
        response_json_schema: {
          type: "object",
          properties: {
            framework_summary: { type: "string" },
            gaps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  requirement: { type: "string" },
                  requirement_id: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string", enum: ["critical", "high", "medium", "low"] }
                }
              }
            },
            coverage_assessment: { type: "string" }
          }
        }
      });
      setResult(response);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const priorityColors = {
    critical: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    high: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  };

  const handleCreate = (gap) => {
    onCreateRequirement({
      framework,
      requirement: gap.requirement,
      requirement_id: gap.requirement_id,
      description: gap.description,
      status: 'not_started'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#1a2332] border-[#2a3548] text-white max-h-[85vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-400" />
            AI Compliance Gap Analysis
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(85vh-100px)] p-6 pt-4">
          {!result ? (
            <div className="space-y-4">
              <Select value={framework} onValueChange={setFramework}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue placeholder="Select framework to analyze" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  {frameworks.map(f => (
                    <SelectItem key={f} value={f} className="text-white hover:bg-[#2a3548]">{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={analyzeGaps} disabled={loading || !framework} className="w-full bg-violet-600 hover:bg-violet-700">
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Analyze Gaps
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-[#151d2e] rounded-lg border border-[#2a3548]">
                <p className="text-sm text-slate-300">{result.framework_summary}</p>
                <p className="text-xs text-slate-500 mt-2">{result.coverage_assessment}</p>
              </div>
              
              <p className="text-xs text-slate-500 uppercase tracking-wider">Identified Gaps ({result.gaps?.length || 0})</p>
              
              {result.gaps?.map((gap, idx) => (
                <div key={idx} className="p-4 bg-[#151d2e] rounded-xl border border-[#2a3548]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-amber-400" />
                        <h4 className="font-medium text-white text-sm">{gap.requirement}</h4>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="text-[9px]" variant="outline">{gap.requirement_id}</Badge>
                        <Badge className={`text-[9px] ${priorityColors[gap.priority]}`}>{gap.priority}</Badge>
                      </div>
                      <p className="text-xs text-slate-400">{gap.description}</p>
                    </div>
                    <Button size="sm" onClick={() => handleCreate(gap)} className="bg-indigo-600 hover:bg-indigo-700">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" onClick={() => { setResult(null); setFramework(''); }} className="w-full border-[#2a3548]">
                Analyze Another Framework
              </Button>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}