import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Sparkles, Loader2, AlertTriangle, Shield, BookOpen, 
  ArrowRight, CheckCircle2, Target, TrendingUp
} from "lucide-react";

export default function AIRiskAssessor({ open, onOpenChange, onApplyAssessment }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const { data: controlLibrary = [] } = useQuery({
    queryKey: ['control-library'],
    queryFn: () => base44.entities.ControlLibrary.list()
  });

  const { data: guidance = [] } = useQuery({
    queryKey: ['guidance'],
    queryFn: () => base44.entities.Guidance.list()
  });

  const { data: existingRisks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: () => base44.entities.Risk.list()
  });

  const analyzeRisk = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const context = {
        controlLibrary: controlLibrary.slice(0, 20).map(c => ({ 
          id: c.id, control_id: c.control_id, name: c.name, domain: c.domain, control_type: c.control_type 
        })),
        guidance: guidance.slice(0, 20).map(g => ({ 
          id: g.id, title: g.title, framework: g.framework, category: g.category 
        })),
        existingRisks: existingRisks.slice(0, 10).map(r => ({ 
          title: r.title, category: r.category 
        }))
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a GRC risk assessment expert. Analyze the following risk description and provide a comprehensive risk assessment.

User's Risk Description:
${input}

Available Controls Library:
${JSON.stringify(context.controlLibrary)}

Available Guidance:
${JSON.stringify(context.guidance)}

Existing Risks in the organization:
${JSON.stringify(context.existingRisks)}

Provide:
1. Identified risks (there may be multiple risks from the description)
2. For each risk: title, description, category, inherent likelihood (1-5), inherent impact (1-5), risk treatment recommendation
3. Suggested controls from the library that would mitigate these risks
4. Relevant guidance documents
5. Additional considerations or related risks to watch for`,
        response_json_schema: {
          type: "object",
          properties: {
            identified_risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  category: { type: "string", enum: ["strategic", "operational", "financial", "compliance", "technology", "cyber", "third_party", "reputational"] },
                  inherent_likelihood: { type: "number" },
                  inherent_impact: { type: "number" },
                  risk_treatment: { type: "string", enum: ["accept", "mitigate", "transfer", "avoid"] },
                  rationale: { type: "string" }
                }
              }
            },
            suggested_controls: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  control_id: { type: "string" },
                  name: { type: "string" },
                  relevance: { type: "string" }
                }
              }
            },
            relevant_guidance: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  guidance_id: { type: "string" },
                  title: { type: "string" },
                  relevance: { type: "string" }
                }
              }
            },
            additional_considerations: { type: "string" }
          }
        }
      });

      setResult(response);
    } catch (error) {
      console.error('Error analyzing risk:', error);
    }
    setLoading(false);
  };

  const getRiskLevel = (likelihood, impact) => {
    const score = likelihood * impact;
    if (score >= 16) return { label: 'Critical', color: 'bg-rose-500' };
    if (score >= 9) return { label: 'High', color: 'bg-amber-500' };
    if (score >= 4) return { label: 'Medium', color: 'bg-yellow-500' };
    return { label: 'Low', color: 'bg-emerald-500' };
  };

  const handleApply = (risk) => {
    const controlIds = result.suggested_controls?.map(c => c.control_id) || [];
    onApplyAssessment({
      title: risk.title,
      description: risk.description,
      risk_category: risk.category,
      assessment_type: risk.category === 'cyber' || risk.category === 'technology' ? 'it' : 'operational',
      inherent_likelihood: risk.inherent_likelihood,
      inherent_impact: risk.inherent_impact,
      risk_treatment: risk.risk_treatment,
      linked_controls: controlIds,
      notes: `AI Assessment Rationale: ${risk.rationale}\n\nAdditional Considerations: ${result.additional_considerations || 'N/A'}`
    });
    onOpenChange(false);
  };

  const handleReset = () => {
    setInput('');
    setResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-[#1a2332] border-[#2a3548] text-white max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30">
              <Sparkles className="h-5 w-5 text-violet-400" />
            </div>
            AI Risk Assessor
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {!result ? (
              <>
                <div>
                  <Label className="text-slate-400">Describe the risk scenario or concern</Label>
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="mt-2 bg-[#151d2e] border-[#2a3548] text-white h-32"
                    placeholder="Example: We're migrating our customer database to a new cloud provider. The migration involves sensitive PII data and we need to ensure business continuity during the transition..."
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Be as detailed as possible. Include context about systems, data, processes, and stakeholders involved.
                  </p>
                </div>

                <Button
                  onClick={analyzeRisk}
                  disabled={loading || !input.trim()}
                  className="w-full bg-violet-600 hover:bg-violet-700"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
                  ) : (
                    <><Sparkles className="h-4 w-4 mr-2" /> Analyze Risk</>
                  )}
                </Button>
              </>
            ) : (
              <div className="space-y-6">
                {/* Identified Risks */}
                <div>
                  <h3 className="text-sm font-medium text-white flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    Identified Risks ({result.identified_risks?.length || 0})
                  </h3>
                  <div className="space-y-3">
                    {result.identified_risks?.map((risk, idx) => {
                      const level = getRiskLevel(risk.inherent_likelihood, risk.inherent_impact);
                      const score = risk.inherent_likelihood * risk.inherent_impact;
                      return (
                        <div key={idx} className="p-4 bg-[#151d2e] rounded-xl border border-[#2a3548]">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`w-2 h-2 rounded-full ${level.color}`} />
                                <h4 className="font-medium text-white">{risk.title}</h4>
                              </div>
                              <p className="text-sm text-slate-400 mb-3">{risk.description}</p>
                              
                              <div className="flex flex-wrap gap-2 mb-3">
                                <Badge className="text-[10px] bg-slate-500/10 text-slate-400 border-slate-500/20 capitalize">
                                  {risk.category}
                                </Badge>
                                <Badge className={`text-[10px] border ${
                                  risk.risk_treatment === 'mitigate' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                  risk.risk_treatment === 'transfer' ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' :
                                  risk.risk_treatment === 'avoid' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                } capitalize`}>
                                  {risk.risk_treatment}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-[#1a2332] border border-[#2a3548]">
                                  <Target className="h-3 w-3 text-slate-500" />
                                  <span className="text-slate-400">L:{risk.inherent_likelihood}</span>
                                  <span className="text-slate-600">×</span>
                                  <span className="text-slate-400">I:{risk.inherent_impact}</span>
                                  <span className="text-slate-600">=</span>
                                  <span className={`font-medium ${
                                    score >= 16 ? 'text-rose-400' : 
                                    score >= 9 ? 'text-amber-400' : 
                                    score >= 4 ? 'text-yellow-400' : 'text-emerald-400'
                                  }`}>{score}</span>
                                  <span className="text-slate-500">({level.label})</span>
                                </div>
                              </div>

                              <p className="text-xs text-slate-500 mt-3 italic">"{risk.rationale}"</p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleApply(risk)}
                              className="bg-indigo-600 hover:bg-indigo-700 flex-shrink-0"
                            >
                              <ArrowRight className="h-3.5 w-3.5 mr-1" />
                              Create
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Separator className="bg-[#2a3548]" />

                {/* Suggested Controls */}
                {result.suggested_controls?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-white flex items-center gap-2 mb-3">
                      <Shield className="h-4 w-4 text-blue-400" />
                      Suggested Controls
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {result.suggested_controls.map((control, idx) => (
                        <div key={idx} className="p-3 bg-[#151d2e] rounded-lg border border-[#2a3548]">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-white">{control.name}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{control.relevance}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Relevant Guidance */}
                {result.relevant_guidance?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-white flex items-center gap-2 mb-3">
                      <BookOpen className="h-4 w-4 text-violet-400" />
                      Relevant Guidance
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {result.relevant_guidance.map((g, idx) => (
                        <div key={idx} className="p-3 bg-[#151d2e] rounded-lg border border-[#2a3548]">
                          <div className="flex items-start gap-2">
                            <BookOpen className="h-4 w-4 text-violet-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-white">{g.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{g.relevance}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Considerations */}
                {result.additional_considerations && (
                  <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20">
                    <h3 className="text-sm font-medium text-amber-400 flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4" />
                      Additional Considerations
                    </h3>
                    <p className="text-sm text-slate-300">{result.additional_considerations}</p>
                  </div>
                )}

                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="w-full border-[#2a3548] hover:bg-[#2a3548]"
                >
                  Analyze Another Risk
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}