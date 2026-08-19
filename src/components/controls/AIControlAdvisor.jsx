import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Loader2, Shield, ArrowRight, CheckCircle2 } from "lucide-react";

export default function AIControlAdvisor({ open, onOpenChange, onCreateControl, existingControls = [] }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const getRecommendations = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Recommend security controls for this scenario:

${input}

Existing controls: ${JSON.stringify(existingControls.slice(0, 10).map(c => ({ name: c.name, domain: c.domain })))}

Provide control recommendations with name, description, category, domain, and implementation priority.`,
        response_json_schema: {
          type: "object",
          properties: {
            controls: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  category: { type: "string", enum: ["preventive", "detective", "corrective", "directive"] },
                  domain: { type: "string", enum: ["access_control", "data_protection", "network_security", "incident_response", "business_continuity", "vendor_management", "physical_security", "hr_security"] },
                  priority: { type: "string", enum: ["high", "medium", "low"] },
                  implementation_notes: { type: "string" }
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

  const priorityColors = {
    high: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  };

  const handleCreate = (control) => {
    onCreateControl({
      name: control.name,
      description: control.description,
      category: control.category,
      domain: control.domain,
      status: 'planned'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#1a2332] border-[#2a3548] text-white max-h-[85vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-400" />
            AI Control Advisor
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(85vh-100px)] p-6 pt-4">
          {!result ? (
            <div className="space-y-4">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="bg-[#151d2e] border-[#2a3548] text-white h-32"
                placeholder="Describe your security concern, risk, or area needing controls..."
              />
              <Button onClick={getRecommendations} disabled={loading || !input.trim()} className="w-full bg-violet-600 hover:bg-violet-700">
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Get Recommendations
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {result.controls?.map((control, idx) => (
                <div key={idx} className="p-4 bg-[#151d2e] rounded-xl border border-[#2a3548]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-blue-400" />
                        <h4 className="font-medium text-white">{control.name}</h4>
                      </div>
                      <p className="text-sm text-slate-400 mb-2">{control.description}</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge className="text-[9px] bg-blue-500/10 text-blue-400 capitalize">{control.category}</Badge>
                        <Badge className="text-[9px] bg-slate-500/10 text-slate-400 capitalize">{control.domain?.replace(/_/g, ' ')}</Badge>
                        <Badge className={`text-[9px] ${priorityColors[control.priority]}`}>{control.priority}</Badge>
                      </div>
                      <p className="text-xs text-slate-500">{control.implementation_notes}</p>
                    </div>
                    <Button size="sm" onClick={() => handleCreate(control)} className="bg-indigo-600 hover:bg-indigo-700">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={() => { setResult(null); setInput(''); }} className="w-full border-[#2a3548]">
                Get More Recommendations
              </Button>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}