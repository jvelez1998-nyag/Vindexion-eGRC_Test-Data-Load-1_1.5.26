import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, CheckCircle2, FileText, Download } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function AIVendorAuditPlanner({ vendor }) {
  const [auditPlan, setAuditPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const generateAuditPlan = async () => {
    setLoading(true);
    try {
      const prompt = `Generate comprehensive vendor audit plan based on risk profile:

**VENDOR:** ${vendor.name}
**CATEGORY:** ${vendor.vendor_category}
**TIER:** ${vendor.tier}
**RISK SCORE:** ${vendor.ai_risk_score || 'Not assessed'}
**DATA ACCESS:** ${vendor.data_access_level}
**SERVICES:** ${vendor.services_provided}
**COMPLIANCE REQUIREMENTS:** ${vendor.regulatory_requirements?.join(', ') || 'Not specified'}

Generate detailed audit plan including:
1. **Audit Scope** - What will be audited
2. **Audit Objectives** - Key goals and outcomes
3. **Audit Checklist** - 15-20 specific audit procedures organized by domain (Security, Compliance, Operations, Financial, Data Privacy)
4. **Evidence Requirements** - Documents and data needed
5. **Audit Timeline** - Estimated duration and phases
6. **Resource Requirements** - Team composition and skills
7. **Risk Areas** - High-priority areas based on vendor risk profile
8. **Testing Procedures** - How controls will be tested

Each checklist item should include:
- Procedure name
- Domain/category
- Description
- Evidence needed
- Testing method
- Expected outcome`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            audit_scope: { type: "string" },
            audit_objectives: {
              type: "array",
              items: { type: "string" }
            },
            checklist: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  procedure_name: { type: "string" },
                  domain: { type: "string" },
                  description: { type: "string" },
                  evidence_required: {
                    type: "array",
                    items: { type: "string" }
                  },
                  testing_method: { type: "string" },
                  expected_outcome: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            evidence_requirements: {
              type: "array",
              items: { type: "string" }
            },
            timeline: {
              type: "object",
              properties: {
                total_duration: { type: "string" },
                phases: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      phase: { type: "string" },
                      duration: { type: "string" },
                      activities: {
                        type: "array",
                        items: { type: "string" }
                      }
                    }
                  }
                }
              }
            },
            resource_requirements: {
              type: "object",
              properties: {
                team_size: { type: "string" },
                required_skills: {
                  type: "array",
                  items: { type: "string" }
                },
                estimated_hours: { type: "number" }
              }
            },
            high_risk_areas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  area: { type: "string" },
                  risk_level: { type: "string" },
                  focus_points: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            }
          }
        }
      });

      setAuditPlan(result);
      toast.success("Audit plan generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate audit plan");
    } finally {
      setLoading(false);
    }
  };

  const createAuditMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.VendorAudit.create({
        vendor_id: vendor.id,
        audit_name: `${vendor.name} - Vendor Audit ${new Date().getFullYear()}`,
        audit_type: 'vendor_assessment',
        status: 'planned',
        scope: auditPlan.audit_scope,
        objectives: auditPlan.audit_objectives,
        planned_start_date: new Date().toISOString(),
        estimated_duration_days: parseInt(auditPlan.timeline?.total_duration) || 30,
        audit_plan: auditPlan
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-audits'] });
      toast.success("Audit created from plan");
    }
  });

  const domainColors = {
    'Security': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    'Compliance': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Operations': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Financial': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'Data Privacy': 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-400" />
            AI Audit Plan Generator
          </CardTitle>
          <Button
            onClick={generateAuditPlan}
            disabled={loading}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
            ) : (
              <><Brain className="h-4 w-4 mr-2" /> Generate Plan</>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!auditPlan ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">AI will generate customized audit plan based on vendor risk profile</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Scope & Objectives */}
            <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30 p-4">
              <h4 className="text-sm font-semibold text-white mb-2">Audit Scope</h4>
              <p className="text-sm text-slate-300 mb-3">{auditPlan.audit_scope}</p>
              <div>
                <p className="text-xs text-slate-400 mb-2">Key Objectives:</p>
                <div className="space-y-1">
                  {auditPlan.audit_objectives?.map((obj, idx) => (
                    <div key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{obj}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* High Risk Areas */}
            {auditPlan.high_risk_areas?.length > 0 && (
              <Card className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/30 p-4">
                <h4 className="text-sm font-semibold text-white mb-3">High Risk Focus Areas</h4>
                <div className="space-y-2">
                  {auditPlan.high_risk_areas.map((area, idx) => (
                    <div key={idx} className="p-2 bg-[#151d2e] rounded border border-rose-500/30">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="text-sm font-medium text-white">{area.area}</h5>
                        <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">
                          {area.risk_level}
                        </Badge>
                      </div>
                      <div className="space-y-0.5">
                        {area.focus_points?.map((point, i) => (
                          <div key={i} className="text-xs text-slate-300">• {point}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Audit Checklist */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-white">Audit Checklist ({auditPlan.checklist?.length} procedures)</h4>
                <Button
                  onClick={() => createAuditMutation.mutate()}
                  disabled={createAuditMutation.isPending}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Create Audit
                </Button>
              </div>
              <div className="space-y-2">
                {auditPlan.checklist?.map((item, idx) => (
                  <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h5 className="text-sm font-semibold text-white mb-1">{item.procedure_name}</h5>
                        <p className="text-sm text-slate-300 mb-2">{item.description}</p>
                      </div>
                      <Badge className={domainColors[item.domain] || 'bg-slate-500/20 text-slate-400'}>
                        {item.domain}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                      <div>
                        <span className="text-slate-500">Testing:</span>
                        <p className="text-slate-300">{item.testing_method}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Expected:</span>
                        <p className="text-slate-300">{item.expected_outcome}</p>
                      </div>
                    </div>

                    {item.evidence_required?.length > 0 && (
                      <div className="text-xs">
                        <span className="text-slate-500">Evidence Required:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.evidence_required.map((ev, i) => (
                            <Badge key={i} className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">
                              {ev}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <Card className="bg-[#151d2e] border-[#2a3548] p-4">
              <h4 className="text-sm font-semibold text-white mb-3">Audit Timeline</h4>
              <div className="mb-3">
                <span className="text-xs text-slate-400">Total Duration: </span>
                <span className="text-sm text-white">{auditPlan.timeline?.total_duration}</span>
              </div>
              <div className="space-y-2">
                {auditPlan.timeline?.phases?.map((phase, idx) => (
                  <div key={idx} className="p-2 bg-[#0f1623] rounded">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white">{phase.phase}</span>
                      <span className="text-xs text-slate-400">{phase.duration}</span>
                    </div>
                    <div className="space-y-0.5">
                      {phase.activities?.map((activity, i) => (
                        <div key={i} className="text-xs text-slate-300">• {activity}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}