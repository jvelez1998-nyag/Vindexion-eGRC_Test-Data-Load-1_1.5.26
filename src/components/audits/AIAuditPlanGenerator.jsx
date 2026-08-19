import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Loader2, FileText, CheckCircle2, AlertTriangle, Clock, Users } from "lucide-react";
import { toast } from "sonner";

export default function AIAuditPlanGenerator({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [auditPlan, setAuditPlan] = useState(null);
  const queryClient = useQueryClient();

  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: () => base44.entities.Risk.list()
  });

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: () => base44.entities.Control.list()
  });

  const { data: controlTests = [] } = useQuery({
    queryKey: ['control-tests'],
    queryFn: () => base44.entities.ControlTest.list()
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => base44.entities.Incident.list()
  });

  const { data: findings = [] } = useQuery({
    queryKey: ['findings'],
    queryFn: () => base44.entities.AuditFinding.list()
  });

  const createAuditMutation = useMutation({
    mutationFn: (data) => base44.entities.Audit.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      toast.success("Audit created from plan");
    }
  });

  const generateAuditPlan = async () => {
    setLoading(true);
    try {
      const criticalRisks = risks.filter(r => (r.likelihood || 3) * (r.impact || 3) >= 12);
      const weakControls = controls.filter(c => c.effectiveness < 3 || c.status === 'ineffective');
      const failedTests = controlTests.filter(t => t.test_result === 'failed');
      const openFindings = findings.filter(f => f.status === 'open');
      const recentIncidents = incidents.filter(i => 
        new Date(i.created_date) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      );

      const prompt = `As an AI audit planning expert, generate a comprehensive risk-based audit plan.

RISK LANDSCAPE:
Total Risks: ${risks.length}
Critical Risks (Score ≥12): ${criticalRisks.length}
Top Critical Risks:
${criticalRisks.slice(0, 5).map(r => `- ${r.title} (Score: ${(r.likelihood || 3) * (r.impact || 3)})`).join('\n')}

CONTROL ENVIRONMENT:
Total Controls: ${controls.length}
Weak/Ineffective Controls: ${weakControls.length}
Failed Tests: ${failedTests.length}
Test Failure Rate: ${controlTests.length ? ((failedTests.length / controlTests.length) * 100).toFixed(1) : 0}%

Key Control Weaknesses:
${weakControls.slice(0, 5).map(c => `- ${c.name} (Effectiveness: ${c.effectiveness || 0}/5)`).join('\n')}

INCIDENT & FINDINGS DATA:
Recent Incidents (90d): ${recentIncidents.length}
Open Audit Findings: ${openFindings.length}
Critical Findings: ${findings.filter(f => f.severity === 'critical').length}

Generate a prioritized audit plan with 5-7 audit areas that should be examined. For each audit:

1. Focus on high-risk areas, weak controls, and incident-prone domains
2. Include specific audit objectives tied to risk mitigation
3. Define audit scope and key focus areas
4. Recommend testing procedures and sampling strategies
5. Identify required resources and timeline
6. Map to relevant regulatory frameworks
7. Define expected deliverables and success criteria

Return structured JSON.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            risk_based_rationale: { type: "string" },
            total_estimated_hours: { type: "number" },
            recommended_audits: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  audit_title: { type: "string" },
                  audit_type: { type: "string" },
                  priority: { type: "string" },
                  risk_rating: { type: "string" },
                  objectives: { type: "array", items: { type: "string" } },
                  scope: { type: "string" },
                  key_focus_areas: { type: "array", items: { type: "string" } },
                  linked_risks: { type: "array", items: { type: "string" } },
                  linked_controls: { type: "array", items: { type: "string" } },
                  testing_procedures: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        procedure: { type: "string" },
                        sample_size: { type: "string" },
                        evidence_type: { type: "string" }
                      }
                    }
                  },
                  team_composition: {
                    type: "object",
                    properties: {
                      lead_auditor: { type: "string" },
                      team_size: { type: "string" },
                      required_skills: { type: "array", items: { type: "string" } }
                    }
                  },
                  estimated_duration: { type: "string" },
                  timeline: { type: "string" },
                  regulatory_frameworks: { type: "array", items: { type: "string" } },
                  expected_deliverables: { type: "array", items: { type: "string" } },
                  success_criteria: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      setAuditPlan(response);
      toast.success("AI audit plan generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate audit plan");
    } finally {
      setLoading(false);
    }
  };

  const createAuditFromPlan = (audit) => {
    createAuditMutation.mutate({
      title: audit.audit_title,
      type: audit.audit_type === 'internal' ? 'internal' : audit.audit_type === 'external' ? 'external' : 'regulatory',
      scope: audit.scope,
      status: 'planned',
      notes: `AI-Generated Audit Plan\n\nObjectives:\n${audit.objectives.join('\n')}\n\nKey Focus Areas:\n${audit.key_focus_areas.join('\n')}`
    });
  };

  const priorityColors = {
    critical: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    low: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  };

  if (!auditPlan) {
    return (
      <Card className="bg-[#1a2332] border-[#2a3548] p-8 text-center">
        <div className="p-4 rounded-full bg-indigo-500/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Brain className="h-8 w-8 text-indigo-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">AI Audit Plan Generator</h3>
        <p className="text-slate-400 text-sm mb-6 max-w-2xl mx-auto">
          Generate a comprehensive, risk-based audit plan by analyzing {risks.length} risks, {controls.length} controls, and recent incidents
        </p>
        <div className="grid grid-cols-4 gap-4 mb-6 max-w-2xl mx-auto">
          <div className="p-3 bg-[#151d2e] rounded-lg border border-[#2a3548]">
            <div className="text-2xl font-bold text-rose-400">{risks.filter(r => (r.likelihood || 3) * (r.impact || 3) >= 12).length}</div>
            <div className="text-xs text-slate-500">Critical Risks</div>
          </div>
          <div className="p-3 bg-[#151d2e] rounded-lg border border-[#2a3548]">
            <div className="text-2xl font-bold text-amber-400">{controls.filter(c => c.effectiveness < 3).length}</div>
            <div className="text-xs text-slate-500">Weak Controls</div>
          </div>
          <div className="p-3 bg-[#151d2e] rounded-lg border border-[#2a3548]">
            <div className="text-2xl font-bold text-orange-400">{controlTests.filter(t => t.test_result === 'failed').length}</div>
            <div className="text-xs text-slate-500">Failed Tests</div>
          </div>
          <div className="p-3 bg-[#151d2e] rounded-lg border border-[#2a3548]">
            <div className="text-2xl font-bold text-blue-400">{findings.filter(f => f.status === 'open').length}</div>
            <div className="text-xs text-slate-500">Open Findings</div>
          </div>
        </div>
        <Button onClick={generateAuditPlan} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Plan...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Generate AI Audit Plan
            </>
          )}
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">AI-Generated Audit Plan</h3>
        <Button onClick={() => setAuditPlan(null)} variant="outline" className="border-[#2a3548]">
          Generate New Plan
        </Button>
      </div>

      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 p-6">
        <h4 className="text-sm text-slate-400 mb-2">Executive Summary</h4>
        <p className="text-sm text-slate-300 mb-4">{auditPlan.executive_summary}</p>
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-slate-500">Total Audits:</span>
            <span className="text-white font-semibold ml-2">{auditPlan.recommended_audits?.length || 0}</span>
          </div>
          <div>
            <span className="text-slate-500">Estimated Hours:</span>
            <span className="text-white font-semibold ml-2">{auditPlan.total_estimated_hours}</span>
          </div>
        </div>
      </Card>

      <Card className="bg-[#1a2332] border-[#2a3548] p-5">
        <h4 className="font-semibold text-white mb-2">Risk-Based Rationale</h4>
        <p className="text-sm text-slate-300">{auditPlan.risk_based_rationale}</p>
      </Card>

      <div className="space-y-4">
        <h4 className="font-semibold text-white">Recommended Audits ({auditPlan.recommended_audits?.length || 0})</h4>
        <ScrollArea className="h-[600px]">
          <div className="space-y-4 pr-4">
            {auditPlan.recommended_audits?.map((audit, idx) => (
              <Card key={idx} className="bg-[#1a2332] border-[#2a3548] p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h5 className="text-lg font-semibold text-white mb-2">{audit.audit_title}</h5>
                    <div className="flex items-center gap-2">
                      <Badge className={priorityColors[audit.priority?.toLowerCase() || 'medium']}>
                        {audit.priority} Priority
                      </Badge>
                      <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20">
                        {audit.audit_type}
                      </Badge>
                      <Badge className={priorityColors[audit.risk_rating?.toLowerCase() || 'medium']}>
                        {audit.risk_rating} Risk
                      </Badge>
                    </div>
                  </div>
                  <Button onClick={() => createAuditFromPlan(audit)} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                    Create Audit
                  </Button>
                </div>

                <Tabs defaultValue="overview" className="mt-4">
                  <TabsList className="bg-[#151d2e] border border-[#2a3548]">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="procedures">Procedures</TabsTrigger>
                    <TabsTrigger value="resources">Resources</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4 mt-4">
                    <div>
                      <h6 className="text-sm font-semibold text-slate-400 mb-2">Scope</h6>
                      <p className="text-sm text-slate-300">{audit.scope}</p>
                    </div>

                    <div>
                      <h6 className="text-sm font-semibold text-slate-400 mb-2">Objectives</h6>
                      <ul className="space-y-1">
                        {audit.objectives?.map((obj, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                            {obj}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h6 className="text-sm font-semibold text-slate-400 mb-2">Key Focus Areas</h6>
                      <div className="flex flex-wrap gap-2">
                        {audit.key_focus_areas?.map((area, i) => (
                          <Badge key={i} className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {audit.regulatory_frameworks?.length > 0 && (
                      <div>
                        <h6 className="text-sm font-semibold text-slate-400 mb-2">Regulatory Frameworks</h6>
                        <div className="flex flex-wrap gap-2">
                          {audit.regulatory_frameworks.map((fw, i) => (
                            <Badge key={i} className="bg-violet-500/10 text-violet-400 border-violet-500/20">
                              {fw}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="procedures" className="space-y-4 mt-4">
                    <div>
                      <h6 className="text-sm font-semibold text-slate-400 mb-3">Testing Procedures</h6>
                      <div className="space-y-3">
                        {audit.testing_procedures?.map((proc, i) => (
                          <div key={i} className="p-3 bg-[#151d2e] rounded-lg border border-[#2a3548]">
                            <div className="text-sm text-white font-medium mb-2">{proc.procedure}</div>
                            <div className="flex items-center gap-4 text-xs text-slate-400">
                              <div>Sample Size: {proc.sample_size}</div>
                              <div>Evidence: {proc.evidence_type}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h6 className="text-sm font-semibold text-slate-400 mb-2">Success Criteria</h6>
                      <ul className="space-y-1">
                        {audit.success_criteria?.map((criteria, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                            {criteria}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>

                  <TabsContent value="resources" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h6 className="text-sm font-semibold text-slate-400 mb-2">Timeline</h6>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Clock className="h-4 w-4" />
                          {audit.estimated_duration} ({audit.timeline})
                        </div>
                      </div>
                      <div>
                        <h6 className="text-sm font-semibold text-slate-400 mb-2">Team Size</h6>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Users className="h-4 w-4" />
                          {audit.team_composition?.team_size}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h6 className="text-sm font-semibold text-slate-400 mb-2">Required Skills</h6>
                      <div className="flex flex-wrap gap-2">
                        {audit.team_composition?.required_skills?.map((skill, i) => (
                          <Badge key={i} className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px]">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h6 className="text-sm font-semibold text-slate-400 mb-2">Expected Deliverables</h6>
                      <ul className="space-y-1">
                        {audit.expected_deliverables?.map((deliverable, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                            <FileText className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                            {deliverable}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}