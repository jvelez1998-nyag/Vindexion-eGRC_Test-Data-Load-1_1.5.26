import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, Target, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function AIAuditAreaSuggestions({ risks, controls, incidents, compliance, onSelectAuditArea }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const highRisks = risks.filter(r => (r.likelihood || 0) * (r.impact || 0) >= 15);
      const ineffectiveControls = controls.filter(c => c.effectiveness && c.effectiveness < 3);
      const recentIncidents = incidents.filter(i => {
        const incidentDate = new Date(i.occurred_date || i.created_date);
        const monthsAgo = new Date();
        monthsAgo.setMonth(monthsAgo.getMonth() - 6);
        return incidentDate > monthsAgo;
      });
      const nonCompliant = compliance.filter(c => c.status === 'non_compliant' || c.status === 'not_started');

      const prompt = `As an expert audit strategist, analyze this organization's GRC data and suggest priority audit areas.

DATA ANALYSIS:
High Risks (${highRisks.length}): ${highRisks.map(r => `${r.title} (Score: ${(r.likelihood || 0) * (r.impact || 0)})`).join(', ')}

Ineffective Controls (${ineffectiveControls.length}): ${ineffectiveControls.map(c => `${c.name} (Effectiveness: ${c.effectiveness}/5)`).join(', ')}

Recent Incidents (${recentIncidents.length}): ${recentIncidents.map(i => `${i.title} (${i.severity})`).join(', ')}

Non-Compliant Requirements (${nonCompliant.length}): ${nonCompliant.map(c => `${c.framework} - ${c.requirement}`).join(', ')}

Provide comprehensive audit recommendations in JSON format:

{
  "priority_areas": [
    {
      "area": "string",
      "priority": "critical/high/medium",
      "rationale": "string",
      "risk_exposure": "string",
      "estimated_effort": "string",
      "recommended_scope": "string",
      "key_risks": ["string"],
      "related_controls": ["string"],
      "regulatory_drivers": ["string"]
    }
  ],
  "audit_sequence": {
    "immediate": ["string"],
    "next_quarter": ["string"],
    "annual_plan": ["string"]
  },
  "resource_requirements": {
    "internal_auditors": "number",
    "external_expertise": "string",
    "estimated_hours": "number"
  },
  "key_insights": "string"
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            priority_areas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  area: { type: "string" },
                  priority: { type: "string" },
                  rationale: { type: "string" },
                  risk_exposure: { type: "string" },
                  estimated_effort: { type: "string" },
                  recommended_scope: { type: "string" },
                  key_risks: { type: "array", items: { type: "string" } },
                  related_controls: { type: "array", items: { type: "string" } },
                  regulatory_drivers: { type: "array", items: { type: "string" } }
                }
              }
            },
            audit_sequence: {
              type: "object",
              properties: {
                immediate: { type: "array", items: { type: "string" } },
                next_quarter: { type: "array", items: { type: "string" } },
                annual_plan: { type: "array", items: { type: "string" } }
              }
            },
            resource_requirements: {
              type: "object",
              properties: {
                internal_auditors: { type: "number" },
                external_expertise: { type: "string" },
                estimated_hours: { type: "number" }
              }
            },
            key_insights: { type: "string" }
          }
        }
      });

      setSuggestions(response);
      toast.success("AI suggestions generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate suggestions");
    } finally {
      setLoading(false);
    }
  };

  const priorityColors = {
    critical: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    low: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-400" />
          AI Audit Area Suggestions
        </h3>
        <Button onClick={generateSuggestions} disabled={loading} size="sm" className="bg-purple-600 hover:bg-purple-700">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Generate Suggestions
            </>
          )}
        </Button>
      </div>

      {!suggestions ? (
        <Card className="bg-[#1a2332] border-[#2a3548] p-12 text-center">
          <Target className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-white mb-2">AI-Powered Audit Planning</h4>
          <p className="text-slate-400 mb-4">
            Let AI analyze your risks, controls, incidents, and compliance data to suggest priority audit areas
          </p>
        </Card>
      ) : (
        <>
          {/* Key Insights */}
          {suggestions.key_insights && (
            <Card className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/30 p-5">
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-400" />
                Key Insights
              </h4>
              <p className="text-sm text-slate-300">{suggestions.key_insights}</p>
            </Card>
          )}

          {/* Priority Areas */}
          <div className="space-y-3">
            {suggestions.priority_areas?.map((area, idx) => (
              <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-5 hover:border-[#3a4558] transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-white">{area.area}</h4>
                      <Badge className={`text-xs border ${priorityColors[area.priority]}`}>
                        {area.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{area.rationale}</p>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Risk Exposure</div>
                        <div className="text-sm text-rose-400">{area.risk_exposure}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Estimated Effort</div>
                        <div className="text-sm text-blue-400">{area.estimated_effort}</div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-xs text-slate-500 mb-2">Recommended Scope</div>
                      <p className="text-sm text-slate-300">{area.recommended_scope}</p>
                    </div>

                    {area.key_risks?.length > 0 && (
                      <div className="mb-2">
                        <div className="text-xs text-slate-500 mb-1">Key Risks:</div>
                        <div className="flex flex-wrap gap-1">
                          {area.key_risks.map((risk, i) => (
                            <Badge key={i} className="bg-rose-500/10 text-rose-400 text-xs">
                              {risk}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {area.regulatory_drivers?.length > 0 && (
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Regulatory Drivers:</div>
                        <div className="flex flex-wrap gap-1">
                          {area.regulatory_drivers.map((driver, i) => (
                            <Badge key={i} className="bg-amber-500/10 text-amber-400 text-xs">
                              {driver}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {onSelectAuditArea && (
                  <Button
                    onClick={() => onSelectAuditArea(area)}
                    size="sm"
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Schedule Audit for This Area
                  </Button>
                )}
              </Card>
            ))}
          </div>

          {/* Audit Sequence */}
          {suggestions.audit_sequence && (
            <Card className="bg-[#151d2e] border-[#2a3548] p-5">
              <h4 className="text-sm font-semibold text-white mb-4">Recommended Audit Sequence</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-rose-400 font-semibold mb-2">Immediate (0-30 days)</div>
                  <div className="space-y-1">
                    {suggestions.audit_sequence.immediate?.map((item, i) => (
                      <div key={i} className="text-sm text-slate-300">• {item}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-amber-400 font-semibold mb-2">Next Quarter</div>
                  <div className="space-y-1">
                    {suggestions.audit_sequence.next_quarter?.map((item, i) => (
                      <div key={i} className="text-sm text-slate-300">• {item}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-blue-400 font-semibold mb-2">Annual Plan</div>
                  <div className="space-y-1">
                    {suggestions.audit_sequence.annual_plan?.map((item, i) => (
                      <div key={i} className="text-sm text-slate-300">• {item}</div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Resource Requirements */}
          {suggestions.resource_requirements && (
            <Card className="bg-[#151d2e] border-[#2a3548] p-5">
              <h4 className="text-sm font-semibold text-white mb-4">Resource Requirements</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{suggestions.resource_requirements.internal_auditors}</div>
                  <div className="text-xs text-slate-500">Internal Auditors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-400">{suggestions.resource_requirements.estimated_hours}h</div>
                  <div className="text-xs text-slate-500">Estimated Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-violet-400 px-2">{suggestions.resource_requirements.external_expertise}</div>
                  <div className="text-xs text-slate-500">External Expertise</div>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}