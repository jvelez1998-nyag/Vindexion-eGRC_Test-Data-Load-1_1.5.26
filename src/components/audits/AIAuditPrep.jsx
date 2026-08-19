import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Loader2, FileText, CheckCircle2, AlertTriangle, ClipboardList, Target, ListChecks, Copy } from "lucide-react";
import { toast } from "sonner";

export default function AIAuditPrep({ open, onOpenChange, controls = [], compliance = [], risks = [], incidents = [], findings = [] }) {
  const [auditType, setAuditType] = useState('');
  const [scope, setScope] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [checklist, setChecklist] = useState(null);
  const [highRiskAreas, setHighRiskAreas] = useState(null);
  const [scopeStatement, setScopeStatement] = useState(null);

  const generateChecklist = async () => {
    if (!auditType) return;
    setLoading(true);
    try {
      const context = {
        controls: controls.slice(0, 20).map(c => ({ name: c.name, domain: c.domain, status: c.status, effectiveness: c.effectiveness })),
        compliance: compliance.slice(0, 20).map(c => ({ framework: c.framework, requirement: c.requirement, status: c.status }))
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a comprehensive audit checklist for a ${auditType} audit${scope ? ` with scope: ${scope}` : ''}.

Context:
- Controls: ${JSON.stringify(context.controls)}
- Compliance: ${JSON.stringify(context.compliance)}

Create a detailed, actionable checklist organized by audit phases:
1. Pre-audit Planning
2. Documentation Review
3. Control Testing
4. Evidence Collection
5. Interviews & Observations
6. Findings Documentation
7. Closeout Activities

Each item should be specific and include what to verify or test.`,
        response_json_schema: {
          type: "object",
          properties: {
            phases: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  phase: { type: "string" },
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        task: { type: "string" },
                        priority: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });
      setChecklist(response);
      toast.success("Checklist generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate checklist");
    }
    setLoading(false);
  };

  const identifyHighRiskAreas = async () => {
    if (!auditType) return;
    setLoading(true);
    try {
      const historicalData = {
        recentFindings: findings.slice(0, 15).map(f => ({ 
          severity: f.severity, 
          category: f.category, 
          title: f.title 
        })),
        recentIncidents: incidents.slice(0, 10).map(i => ({ 
          severity: i.severity, 
          type: i.incident_type, 
          status: i.status 
        })),
        criticalRisks: risks.filter(r => (r.likelihood || 0) * (r.impact || 0) >= 12).map(r => ({ 
          title: r.title, 
          category: r.category,
          score: (r.likelihood || 0) * (r.impact || 0)
        })),
        ineffectiveControls: controls.filter(c => c.status === 'ineffective' || c.effectiveness < 3).map(c => ({
          name: c.name,
          domain: c.domain,
          status: c.status
        }))
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze historical data and identify high-risk areas for a ${auditType} audit${scope ? ` (scope: ${scope})` : ''}.

Historical Data:
${JSON.stringify(historicalData, null, 2)}

Identify:
1. Top 5 high-risk areas based on past findings, incidents, and current risk profile
2. Specific concerns for each area
3. Recommended focus during the audit
4. Preventive measures to discuss

Be specific and data-driven in your analysis.`,
        response_json_schema: {
          type: "object",
          properties: {
            highRiskAreas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  area: { type: "string" },
                  riskLevel: { type: "string" },
                  concerns: { type: "array", items: { type: "string" } },
                  auditFocus: { type: "string" },
                  preventiveMeasures: { type: "array", items: { type: "string" } }
                }
              }
            },
            overallAssessment: { type: "string" }
          }
        }
      });
      setHighRiskAreas(response);
      toast.success("High-risk areas identified");
    } catch (error) {
      console.error(error);
      toast.error("Failed to identify risk areas");
    }
    setLoading(false);
  };

  const generateScopeStatement = async () => {
    if (!auditType) return;
    setLoading(true);
    try {
      const context = {
        totalControls: controls.length,
        controlDomains: [...new Set(controls.map(c => c.domain))],
        frameworks: [...new Set(compliance.map(c => c.framework))],
        riskCount: risks.length,
        recentIncidents: incidents.filter(i => {
          const date = new Date(i.occurred_date || i.created_date);
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          return date >= sixMonthsAgo;
        }).length
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Draft a professional audit scope statement for a ${auditType} audit${scope ? ` with focus: ${scope}` : ''}.

Organization Context:
- Total Controls: ${context.totalControls}
- Control Domains: ${context.controlDomains.join(', ')}
- Compliance Frameworks: ${context.frameworks.join(', ')}
- Active Risks: ${context.riskCount}
- Recent Incidents (6 months): ${context.recentIncidents}

Create a formal scope statement including:
1. Audit Objective
2. Scope (what's included)
3. Out of Scope (what's excluded)
4. Audit Period
5. Key Focus Areas
6. Methodology Overview
7. Expected Deliverables

Write in a professional, formal tone suitable for audit documentation.`,
        response_json_schema: {
          type: "object",
          properties: {
            objective: { type: "string" },
            inScope: { type: "array", items: { type: "string" } },
            outOfScope: { type: "array", items: { type: "string" } },
            auditPeriod: { type: "string" },
            keyFocusAreas: { type: "array", items: { type: "string" } },
            methodology: { type: "string" },
            deliverables: { type: "array", items: { type: "string" } }
          }
        }
      });
      setScopeStatement(response);
      toast.success("Scope statement generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate scope statement");
    }
    setLoading(false);
  };

  const generatePrepGuide = async () => {
    if (!auditType) return;
    setLoading(true);
    try {
      const context = {
        controls: controls.slice(0, 15).map(c => ({ name: c.name, domain: c.domain, status: c.status })),
        compliance: compliance.slice(0, 15).map(c => ({ framework: c.framework, requirement: c.requirement, status: c.status }))
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create an audit preparation guide for a ${auditType} audit${scope ? ` focused on: ${scope}` : ''}.

Current controls: ${JSON.stringify(context.controls)}
Compliance status: ${JSON.stringify(context.compliance)}

Provide:
1. Key areas to focus on
2. Evidence/documentation to prepare
3. Potential gaps or concerns to address
4. Interview preparation tips
5. Common findings to avoid`,
        response_json_schema: {
          type: "object",
          properties: {
            focus_areas: { type: "array", items: { type: "object", properties: { area: { type: "string" }, importance: { type: "string" } } } },
            evidence_needed: { type: "array", items: { type: "string" } },
            gaps_to_address: { type: "array", items: { type: "object", properties: { gap: { type: "string" }, recommendation: { type: "string" } } } },
            interview_tips: { type: "array", items: { type: "string" } },
            common_findings: { type: "array", items: { type: "string" } }
          }
        }
      });
      setResult(response);
      toast.success("Prep guide generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate prep guide");
    }
    setLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-[#1a2332] border-[#2a3548] text-white max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-400" />
            AI Audit Preparation Assistant
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mx-6 bg-[#151d2e] border border-[#2a3548]">
            <TabsTrigger value="overview" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400">Overview</TabsTrigger>
            <TabsTrigger value="checklist" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400">Checklist</TabsTrigger>
            <TabsTrigger value="risks" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400">Risk Areas</TabsTrigger>
            <TabsTrigger value="scope" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400">Scope Statement</TabsTrigger>
          </TabsList>

          <ScrollArea className="max-h-[calc(90vh-150px)] px-6">
            {/* Input Section (shown on all tabs if nothing generated) */}
            {!result && !checklist && !highRiskAreas && !scopeStatement && (
              <div className="space-y-4 py-4">
                <div>
                  <Label className="text-slate-400">Audit Type *</Label>
                  <Select value={auditType} onValueChange={setAuditType}>
                    <SelectTrigger className="mt-1 bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue placeholder="Select audit type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="SOC2" className="text-white hover:bg-[#2a3548]">SOC 2</SelectItem>
                      <SelectItem value="ISO27001" className="text-white hover:bg-[#2a3548]">ISO 27001</SelectItem>
                      <SelectItem value="SOX" className="text-white hover:bg-[#2a3548]">SOX</SelectItem>
                      <SelectItem value="PCI-DSS" className="text-white hover:bg-[#2a3548]">PCI-DSS</SelectItem>
                      <SelectItem value="HIPAA" className="text-white hover:bg-[#2a3548]">HIPAA</SelectItem>
                      <SelectItem value="GDPR" className="text-white hover:bg-[#2a3548]">GDPR</SelectItem>
                      <SelectItem value="internal" className="text-white hover:bg-[#2a3548]">Internal Audit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-400">Scope (optional)</Label>
                  <Input
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    className="mt-1 bg-[#151d2e] border-[#2a3548] text-white"
                    placeholder="e.g., Access controls, Data protection..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={generatePrepGuide} disabled={loading || !auditType} className="bg-violet-600 hover:bg-violet-700">
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                    Generate Overview
                  </Button>
                  <Button onClick={generateChecklist} disabled={loading || !auditType} variant="outline" className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10">
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ListChecks className="h-4 w-4 mr-2" />}
                    Generate Checklist
                  </Button>
                  <Button onClick={identifyHighRiskAreas} disabled={loading || !auditType} variant="outline" className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10">
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <AlertTriangle className="h-4 w-4 mr-2" />}
                    Identify Risks
                  </Button>
                  <Button onClick={generateScopeStatement} disabled={loading || !auditType} variant="outline" className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10">
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Target className="h-4 w-4 mr-2" />}
                    Draft Scope
                  </Button>
                </div>
              </div>
            )}

            <TabsContent value="overview" className="space-y-4 py-4">
              {result ? (
                <div className="space-y-5">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                      <ClipboardList className="h-3 w-3" /> Focus Areas
                    </p>
                    <div className="space-y-2">
                      {result.focus_areas?.map((item, i) => (
                        <div key={i} className="p-2 bg-[#151d2e] rounded-lg flex items-center gap-2">
                          <span className="text-indigo-400">•</span>
                          <span className="text-sm text-white flex-1">{item.area}</span>
                          <Badge className="text-[9px] bg-slate-500/10 text-slate-400">{item.importance}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                      <FileText className="h-3 w-3" /> Evidence to Prepare
                    </p>
                    <ul className="space-y-1">
                      {result.evidence_needed?.map((e, i) => (
                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5" /> {e}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Gaps to Address
                    </p>
                    <div className="space-y-2">
                      {result.gaps_to_address?.map((g, i) => (
                        <div key={i} className="p-2 bg-amber-500/5 rounded-lg border border-amber-500/20">
                          <p className="text-sm text-amber-400">{g.gap}</p>
                          <p className="text-xs text-slate-400 mt-1">→ {g.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Interview Tips</p>
                    <ul className="space-y-1">
                      {result.interview_tips?.map((t, i) => (
                        <li key={i} className="text-xs text-slate-400">• {t}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-12">Click "Generate Overview" to create a preparation guide</p>
              )}
            </TabsContent>

            <TabsContent value="checklist" className="space-y-4 py-4">
              {checklist ? (
                <div className="space-y-5">
                  <div className="flex justify-end">
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(JSON.stringify(checklist.phases, null, 2))} className="border-[#2a3548]">
                      <Copy className="h-3 w-3 mr-2" /> Copy Checklist
                    </Button>
                  </div>
                  {checklist.phases?.map((phase, idx) => (
                    <div key={idx} className="space-y-3">
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <ListChecks className="h-4 w-4 text-violet-400" />
                        {phase.phase}
                      </h3>
                      <div className="space-y-2">
                        {phase.items?.map((item, i) => (
                          <div key={i} className="p-3 bg-[#151d2e] rounded-lg flex items-start gap-3">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm text-white">{item.task}</p>
                              {item.priority && (
                                <Badge className={`mt-1 text-[9px] ${
                                  item.priority === 'High' ? 'bg-rose-500/10 text-rose-400' :
                                  item.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                                  'bg-slate-500/10 text-slate-400'
                                }`}>
                                  {item.priority} Priority
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-12">Click "Generate Checklist" to create an audit checklist</p>
              )}
            </TabsContent>

            <TabsContent value="risks" className="space-y-4 py-4">
              {highRiskAreas ? (
                <div className="space-y-5">
                  {highRiskAreas.overallAssessment && (
                    <div className="p-4 bg-violet-500/5 rounded-lg border border-violet-500/20">
                      <p className="text-sm text-slate-300">{highRiskAreas.overallAssessment}</p>
                    </div>
                  )}
                  {highRiskAreas.highRiskAreas?.map((area, idx) => (
                    <div key={idx} className="p-4 bg-[#151d2e] rounded-lg border border-[#2a3548]">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-base font-semibold text-white">{area.area}</h3>
                        <Badge className={`text-xs ${
                          area.riskLevel === 'Critical' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          area.riskLevel === 'High' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {area.riskLevel}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Concerns:</p>
                          <ul className="space-y-1">
                            {area.concerns?.map((concern, i) => (
                              <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                                <AlertTriangle className="h-3 w-3 text-amber-400 mt-0.5 flex-shrink-0" />
                                {concern}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Audit Focus:</p>
                          <p className="text-xs text-slate-300">{area.auditFocus}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Preventive Measures:</p>
                          <ul className="space-y-1">
                            {area.preventiveMeasures?.map((measure, i) => (
                              <li key={i} className="text-xs text-slate-400">→ {measure}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-12">Click "Identify Risks" to analyze high-risk areas based on historical data</p>
              )}
            </TabsContent>

            <TabsContent value="scope" className="space-y-4 py-4">
              {scopeStatement ? (
                <div className="space-y-5">
                  <div className="flex justify-end">
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(JSON.stringify(scopeStatement, null, 2))} className="border-[#2a3548]">
                      <Copy className="h-3 w-3 mr-2" /> Copy Statement
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-[#151d2e] rounded-lg border border-[#2a3548]">
                    <h3 className="text-sm font-semibold text-white mb-2">Audit Objective</h3>
                    <p className="text-sm text-slate-300">{scopeStatement.objective}</p>
                  </div>

                  <div className="p-4 bg-[#151d2e] rounded-lg border border-[#2a3548]">
                    <h3 className="text-sm font-semibold text-white mb-2">In Scope</h3>
                    <ul className="space-y-1">
                      {scopeStatement.inScope?.map((item, i) => (
                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-[#151d2e] rounded-lg border border-[#2a3548]">
                    <h3 className="text-sm font-semibold text-white mb-2">Out of Scope</h3>
                    <ul className="space-y-1">
                      {scopeStatement.outOfScope?.map((item, i) => (
                        <li key={i} className="text-sm text-slate-400">• {item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[#151d2e] rounded-lg border border-[#2a3548]">
                      <h3 className="text-sm font-semibold text-white mb-2">Audit Period</h3>
                      <p className="text-sm text-slate-300">{scopeStatement.auditPeriod}</p>
                    </div>
                    <div className="p-4 bg-[#151d2e] rounded-lg border border-[#2a3548]">
                      <h3 className="text-sm font-semibold text-white mb-2">Key Focus Areas</h3>
                      <ul className="space-y-1">
                        {scopeStatement.keyFocusAreas?.map((area, i) => (
                          <li key={i} className="text-xs text-slate-300">• {area}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-[#151d2e] rounded-lg border border-[#2a3548]">
                    <h3 className="text-sm font-semibold text-white mb-2">Methodology</h3>
                    <p className="text-sm text-slate-300">{scopeStatement.methodology}</p>
                  </div>

                  <div className="p-4 bg-[#151d2e] rounded-lg border border-[#2a3548]">
                    <h3 className="text-sm font-semibold text-white mb-2">Expected Deliverables</h3>
                    <ul className="space-y-1">
                      {scopeStatement.deliverables?.map((item, i) => (
                        <li key={i} className="text-sm text-slate-300">• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-12">Click "Draft Scope" to generate a formal audit scope statement</p>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}