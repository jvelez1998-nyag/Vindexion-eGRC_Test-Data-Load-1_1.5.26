import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Loader2, Target, Users, CheckCircle2, TrendingUp, AlertTriangle, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function AIAuditPlanner({ risks, controls, findings, incidents, compliance, onCreateAudit }) {
  const [loading, setLoading] = useState(false);
  const [auditPlan, setAuditPlan] = useState(null);

  const generateAuditPlan = async () => {
    setLoading(true);
    try {
      // Calculate organizational risk profile
      const highRisks = risks.filter(r => ((r.likelihood || 3) * (r.impact || 3)) >= 12);
      const criticalFindings = findings.filter(f => f.severity === 'critical' && f.status === 'open');
      const recentIncidents = incidents.filter(i => {
        const date = new Date(i.occurred_date || i.created_date);
        return date > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      });
      const ineffectiveControls = controls.filter(c => c.effectiveness < 3 || c.status === 'ineffective');
      const nonCompliant = compliance.filter(c => c.status === 'non_compliant');

      // Group findings by category
      const findingsByCategory = {};
      findings.forEach(f => {
        if (!findingsByCategory[f.category]) findingsByCategory[f.category] = [];
        findingsByCategory[f.category].push(f);
      });

      const prompt = `You are an expert audit planning consultant. Generate a comprehensive, AI-driven audit plan for the next audit cycle.

ORGANIZATIONAL RISK PROFILE:
Total Risks: ${risks.length}
High/Critical Risks: ${highRisks.length}
${highRisks.slice(0, 5).map(r => `- ${r.title} (Category: ${r.category}, Score: ${(r.likelihood || 3) * (r.impact || 3)})`).join('\n')}

PAST AUDIT FINDINGS:
Total Findings: ${findings.length}
Critical Open Findings: ${criticalFindings.length}
Findings by Category:
${Object.entries(findingsByCategory).slice(0, 5).map(([cat, items]) => `- ${cat}: ${items.length} findings (${items.filter(f => f.severity === 'critical').length} critical)`).join('\n')}

CONTROL LANDSCAPE:
Total Controls: ${controls.length}
Ineffective/Weak Controls: ${ineffectiveControls.length}
${ineffectiveControls.slice(0, 5).map(c => `- ${c.name} (${c.domain}): ${c.effectiveness}/5`).join('\n')}

RECENT INCIDENTS (90 days):
Total: ${recentIncidents.length}
${recentIncidents.slice(0, 5).map(i => `- ${i.title} (${i.severity} severity, ${i.incident_type})`).join('\n')}

COMPLIANCE STATUS:
Non-compliant Items: ${nonCompliant.length}
${nonCompliant.slice(0, 5).map(c => `- ${c.framework}: ${c.requirement} (${c.status})`).join('\n')}

Generate a comprehensive audit plan including:

1. **Recommended Audit Scopes** (3-5 audit engagements):
   - Title and type (IT, operational, financial, compliance)
   - Objectives tied to organizational risks
   - Scope definition and boundaries
   - Rationale based on risk profile and past findings
   - Priority level (P1/P2/P3)
   - Estimated duration
   - Expected value/outcomes

2. **Key Focus Areas** (per audit scope):
   - Specific processes, systems, or controls to examine
   - Why this area is critical now (risk signals, trends, findings)
   - Testing approach recommendations
   - Risk level and business impact

3. **Optimal Team Composition** (per audit):
   - Required roles and skills
   - Estimated FTE/hours per role
   - Special expertise needed (technical, industry-specific)
   - Team size recommendation

4. **Industry Trends & Emerging Risks**:
   - Relevant industry audit trends
   - Emerging risks to consider
   - Regulatory changes affecting audit scope

5. **Success Metrics**:
   - How to measure audit effectiveness
   - Key indicators of successful audit outcomes

Be specific, actionable, and aligned with the organization's risk profile. Prioritize based on risk severity, recurrence of issues, and control weaknesses.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            overall_risk_assessment: { type: "string" },
            recommended_audits: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  audit_type: { type: "string" },
                  priority: { type: "string" },
                  objectives: { type: "array", items: { type: "string" } },
                  scope_description: { type: "string" },
                  scope_boundaries: { type: "string" },
                  rationale: { type: "string" },
                  estimated_duration_weeks: { type: "number" },
                  expected_outcomes: { type: "array", items: { type: "string" } },
                  risk_level: { type: "string" },
                  key_focus_areas: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        area: { type: "string" },
                        criticality: { type: "string" },
                        risk_signals: { type: "array", items: { type: "string" } },
                        testing_approach: { type: "string" },
                        business_impact: { type: "string" }
                      }
                    }
                  },
                  team_composition: {
                    type: "object",
                    properties: {
                      team_size: { type: "number" },
                      roles_required: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            role: { type: "string" },
                            skills_required: { type: "array", items: { type: "string" } },
                            estimated_hours: { type: "number" },
                            seniority: { type: "string" }
                          }
                        }
                      },
                      special_expertise: { type: "array", items: { type: "string" } }
                    }
                  }
                }
              }
            },
            industry_trends: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  trend: { type: "string" },
                  relevance: { type: "string" },
                  impact_on_audit: { type: "string" }
                }
              }
            },
            emerging_risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  risk: { type: "string" },
                  indicators: { type: "array", items: { type: "string" } },
                  suggested_audit_response: { type: "string" }
                }
              }
            },
            success_metrics: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setAuditPlan(response);
      toast.success("Audit plan generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate audit plan");
    } finally {
      setLoading(false);
    }
  };

  const severityColors = {
    critical: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    low: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    P1: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    P2: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    P3: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  };

  if (!auditPlan) {
    return (
      <Card className="bg-[#1a2332] border-[#2a3548] p-12 text-center">
        <div className="p-4 rounded-full bg-indigo-500/10 w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <Brain className="h-10 w-10 text-indigo-400" />
        </div>
        <h3 className="text-2xl font-semibold text-white mb-3">AI Audit Planning Assistant</h3>
        <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
          Generate intelligent audit recommendations based on {risks.length} risks, {findings.length} findings, 
          {controls.length} controls, and organizational risk profile
        </p>
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
          <div className="p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg">
            <Target className="h-8 w-8 text-indigo-400 mx-auto mb-2" />
            <div className="text-xs text-slate-500">Audit Scopes & Objectives</div>
          </div>
          <div className="p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg">
            <TrendingUp className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
            <div className="text-xs text-slate-500">Focus Areas & Priorities</div>
          </div>
          <div className="p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg">
            <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className="text-xs text-slate-500">Team Composition</div>
          </div>
        </div>
        <Button onClick={generateAuditPlan} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
          {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating Plan...</> : <><Sparkles className="h-4 w-4 mr-2" />Generate Audit Plan</>}
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-indigo-500/5 border-indigo-500/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">AI-Generated Audit Plan</h3>
          <Button onClick={() => setAuditPlan(null)} variant="outline" className="border-[#2a3548]">
            Generate New Plan
          </Button>
        </div>
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-2">Executive Summary</h4>
            <p className="text-sm text-slate-300">{auditPlan.executive_summary}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-2">Overall Risk Assessment</h4>
            <p className="text-sm text-slate-300">{auditPlan.overall_risk_assessment}</p>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="audits" className="space-y-6">
        <TabsList className="bg-[#1a2332] border border-[#2a3548]">
          <TabsTrigger value="audits">Recommended Audits ({auditPlan.recommended_audits?.length || 0})</TabsTrigger>
          <TabsTrigger value="trends">Industry Trends</TabsTrigger>
          <TabsTrigger value="emerging">Emerging Risks</TabsTrigger>
        </TabsList>

        <TabsContent value="audits">
          <ScrollArea className="h-[700px]">
            <div className="space-y-6 pr-4">
              {auditPlan.recommended_audits?.map((audit, idx) => (
                <Card key={idx} className="bg-[#1a2332] border-[#2a3548] p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">{audit.title}</h3>
                        <Badge className={severityColors[audit.priority]}>
                          {audit.priority}
                        </Badge>
                        <Badge className="bg-slate-500/10 text-slate-400">
                          {audit.audit_type}
                        </Badge>
                      </div>
                      <Badge className={severityColors[audit.risk_level]}>
                        {audit.risk_level} risk
                      </Badge>
                    </div>
                    {onCreateAudit && (
                      <Button
                        onClick={() => onCreateAudit({
                          title: audit.title,
                          type: audit.audit_type,
                          scope: audit.scope_description
                        })}
                        className="bg-emerald-600 hover:bg-emerald-700"
                        size="sm"
                      >
                        Create Audit
                      </Button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-300 mb-3">Objectives</h4>
                      <ul className="space-y-2">
                        {audit.objectives?.map((obj, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                            {obj}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-300 mb-3">Expected Outcomes</h4>
                      <ul className="space-y-2">
                        {audit.expected_outcomes?.map((outcome, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                            <Target className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                            {outcome}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Scope</h4>
                    <div className="p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg space-y-3">
                      <div>
                        <span className="text-xs text-slate-500">Description:</span>
                        <p className="text-sm text-slate-300 mt-1">{audit.scope_description}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500">Boundaries:</span>
                        <p className="text-sm text-slate-300 mt-1">{audit.scope_boundaries}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Rationale</h4>
                    <p className="text-sm text-slate-400 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
                      {audit.rationale}
                    </p>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-300 mb-3">Key Focus Areas</h4>
                    <div className="space-y-3">
                      {audit.key_focus_areas?.map((area, i) => (
                        <Card key={i} className="bg-[#151d2e] border-[#2a3548] p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-white text-sm">{area.area}</h5>
                            <Badge className={severityColors[area.criticality?.toLowerCase() || 'medium']}>
                              {area.criticality}
                            </Badge>
                          </div>
                          
                          {area.risk_signals?.length > 0 && (
                            <div className="mb-3">
                              <div className="text-xs text-slate-500 mb-1">Risk Signals:</div>
                              <div className="flex flex-wrap gap-1">
                                {area.risk_signals.map((signal, j) => (
                                  <Badge key={j} className="bg-amber-500/10 text-amber-400 text-xs">
                                    {signal}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="space-y-2 text-xs">
                            <div>
                              <span className="text-slate-500">Testing Approach:</span>
                              <p className="text-slate-300 mt-1">{area.testing_approach}</p>
                            </div>
                            <div>
                              <span className="text-slate-500">Business Impact:</span>
                              <p className="text-slate-300 mt-1">{area.business_impact}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-400" />
                      Recommended Team Composition
                    </h4>
                    <div className="p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg space-y-4">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-slate-400">Team Size:</span>
                        <Badge className="bg-blue-500/10 text-blue-400">
                          {audit.team_composition?.team_size} members
                        </Badge>
                      </div>

                      <div>
                        <div className="text-xs text-slate-500 mb-2">Required Roles:</div>
                        <div className="space-y-2">
                          {audit.team_composition?.roles_required?.map((role, i) => (
                            <div key={i} className="p-3 bg-[#1a2332] border border-[#2a3548] rounded">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-white text-sm">{role.role}</span>
                                <div className="flex items-center gap-2">
                                  <Badge className="text-xs bg-slate-500/10 text-slate-400">
                                    {role.seniority}
                                  </Badge>
                                  <span className="text-xs text-slate-500">{role.estimated_hours}h</span>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {role.skills_required?.map((skill, j) => (
                                  <Badge key={j} className="text-xs bg-indigo-500/10 text-indigo-400">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {audit.team_composition?.special_expertise?.length > 0 && (
                        <div>
                          <div className="text-xs text-slate-500 mb-2">Special Expertise Required:</div>
                          <div className="flex flex-wrap gap-2">
                            {audit.team_composition.special_expertise.map((exp, i) => (
                              <Badge key={i} className="bg-rose-500/10 text-rose-400">
                                {exp}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-500 pt-4 border-t border-[#2a3548]">
                    <span>Estimated Duration: {audit.estimated_duration_weeks} weeks</span>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="trends">
          <Card className="bg-[#1a2332] border-[#2a3548] p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              Industry Trends & Regulatory Changes
            </h3>
            <ScrollArea className="h-[600px]">
              <div className="space-y-4 pr-4">
                {auditPlan.industry_trends?.map((trend, idx) => (
                  <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-5">
                    <h4 className="font-semibold text-white mb-2">{trend.trend}</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-slate-500">Relevance:</span>
                        <p className="text-slate-300 mt-1">{trend.relevance}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Impact on Audit Planning:</span>
                        <p className="text-emerald-400 mt-1">{trend.impact_on_audit}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="emerging">
          <Card className="bg-[#1a2332] border-[#2a3548] p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              Emerging Risks to Consider
            </h3>
            <ScrollArea className="h-[600px]">
              <div className="space-y-4 pr-4">
                {auditPlan.emerging_risks?.map((risk, idx) => (
                  <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-5">
                    <h4 className="font-semibold text-white mb-3">{risk.risk}</h4>
                    
                    <div className="mb-3">
                      <div className="text-xs text-slate-500 mb-2">Early Warning Indicators:</div>
                      <div className="space-y-1">
                        {risk.indicators?.map((indicator, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-slate-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                            {indicator}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded">
                      <div className="text-xs text-slate-500 mb-1">Suggested Audit Response:</div>
                      <p className="text-sm text-indigo-300">{risk.suggested_audit_response}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>

      {auditPlan.success_metrics?.length > 0 && (
        <Card className="bg-[#1a2332] border-[#2a3548] p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-400" />
            Success Metrics
          </h3>
          <div className="space-y-2">
            {auditPlan.success_metrics.map((metric, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                {metric}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}