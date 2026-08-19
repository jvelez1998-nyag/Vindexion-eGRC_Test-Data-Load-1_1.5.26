import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Sparkles, Loader2, AlertTriangle, Target, Zap } from "lucide-react";
import { toast } from "sonner";

export default function AIRiskIdentification({ risks, controls, compliance, securityEvents, onCreateRisk }) {
  const [loading, setLoading] = useState(false);
  const [identifiedRisks, setIdentifiedRisks] = useState(null);

  async function runAIIdentification() {
    setLoading(true);
    try {
      const controlGaps = controls.filter(c => c.effectiveness < 3 || c.status === 'ineffective');
      const criticalEvents = securityEvents.filter(e => e.severity === 'critical' || e.severity === 'high');
      
      const prompt = `As a cybersecurity and GRC expert, analyze the organization's security posture and identify potential new risks.

CURRENT RISK LANDSCAPE:
${risks.slice(0, 20).map(r => `- ${r.title} (${r.category}, Score: ${(r.residual_likelihood || 0) * (r.residual_impact || 0)})`).join('\n')}

CONTROL GAPS & WEAKNESSES:
${controlGaps.slice(0, 15).map(c => `- ${c.name} (${c.domain}, Effectiveness: ${c.effectiveness}/5)`).join('\n')}

RECENT SECURITY EVENTS:
${criticalEvents.slice(0, 10).map(e => `- ${e.event_type} (${e.severity}): ${e.details || 'N/A'}`).join('\n')}

COMPLIANCE STATUS:
${compliance.slice(0, 15).map(c => `- ${c.framework}: ${c.requirement} (${c.status})`).join('\n')}

IDENTIFY NEW POTENTIAL RISKS:

1. **Control Gap Risks** (8-12 risks): Analyze control weaknesses and identify specific risks that arise from inadequate or ineffective controls.

2. **Threat Intelligence Risks** (6-10 risks): Based on recent security events, identify emerging threats and attack vectors.

3. **Compliance Risks** (5-8 risks): Identify risks from compliance gaps and unmet requirements.

4. **Emerging Technology Risks** (4-6 risks): Identify risks from new technologies, digital transformation, AI/ML adoption.

For each identified risk, provide:
- Risk title and detailed description
- Category and subcategory
- Estimated likelihood (1-5) and impact (1-5)
- Root cause and potential consequences
- Recommended controls to mitigate
- Priority level (Critical/High/Medium)

Focus on actionable, specific risks that aren't already in the register.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            control_gap_risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  category: { type: "string" },
                  subcategory: { type: "string" },
                  likelihood: { type: "number" },
                  impact: { type: "number" },
                  root_cause: { type: "string" },
                  potential_consequences: { type: "string" },
                  recommended_controls: { type: "array", items: { type: "string" } },
                  priority: { type: "string" }
                }
              }
            },
            threat_intelligence_risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  category: { type: "string" },
                  likelihood: { type: "number" },
                  impact: { type: "number" },
                  threat_actor: { type: "string" },
                  attack_vector: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            compliance_risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  category: { type: "string" },
                  likelihood: { type: "number" },
                  impact: { type: "number" },
                  related_regulations: { type: "array", items: { type: "string" } },
                  priority: { type: "string" }
                }
              }
            },
            emerging_tech_risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  category: { type: "string" },
                  technology: { type: "string" },
                  likelihood: { type: "number" },
                  impact: { type: "number" },
                  priority: { type: "string" }
                }
              }
            }
          }
        }
      });

      setIdentifiedRisks(result);
      toast.success("AI risk identification complete");
    } catch (error) {
      console.error(error);
      toast.error("Risk identification failed");
    } finally {
      setLoading(false);
    }
  }

  const createRisk = async (riskData) => {
    try {
      const newRisk = {
        title: riskData.title,
        description: riskData.description,
        category: riskData.category || 'operational',
        subcategory: riskData.subcategory,
        likelihood: riskData.likelihood,
        impact: riskData.impact,
        residual_likelihood: riskData.likelihood,
        residual_impact: riskData.impact,
        status: 'identified',
        date_identified: new Date().toISOString().split('T')[0]
      };

      await base44.entities.Risk.create(newRisk);
      toast.success(`Risk "${riskData.title}" created`);
      if (onCreateRisk) onCreateRisk(newRisk);
    } catch (error) {
      toast.error("Failed to create risk");
    }
  };

  const allRisks = identifiedRisks ? [
    ...identifiedRisks.control_gap_risks || [],
    ...identifiedRisks.threat_intelligence_risks || [],
    ...identifiedRisks.compliance_risks || [],
    ...identifiedRisks.emerging_tech_risks || []
  ] : [];

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-blue-500/10 border-indigo-500/20">
        <CardContent className="p-6">
          {!identifiedRisks ? (
            <div className="text-center">
              <Brain className="h-12 w-12 text-indigo-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Risk Identification</h3>
              <p className="text-sm text-slate-400 mb-4">
                Leverage AI to identify potential risks from control gaps, threat intelligence, compliance status, and emerging technologies.
              </p>
              <Button onClick={runAIIdentification} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Identify New Risks
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Identified Risks</h3>
                  <p className="text-sm text-slate-400">{allRisks.length} potential risks identified</p>
                </div>
                <Button onClick={runAIIdentification} variant="outline" className="border-indigo-500/30 text-indigo-400">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
              {identifiedRisks.executive_summary && (
                <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                  <p className="text-sm text-slate-300">{identifiedRisks.executive_summary}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {identifiedRisks && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[
            { key: 'control_gap_risks', title: 'Control Gap Risks', icon: Target, color: 'rose' },
            { key: 'threat_intelligence_risks', title: 'Threat Intelligence', icon: AlertTriangle, color: 'amber' },
            { key: 'compliance_risks', title: 'Compliance Risks', icon: Zap, color: 'blue' },
            { key: 'emerging_tech_risks', title: 'Emerging Tech Risks', icon: Brain, color: 'purple' }
          ].map(section => (
            <Card key={section.key} className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <section.icon className={`h-4 w-4 text-${section.color}-400`} />
                  {section.title} ({identifiedRisks[section.key]?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {identifiedRisks[section.key]?.map((risk, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm font-semibold text-white flex-1">{risk.title}</h4>
                          <Badge className={`${
                            risk.priority === 'Critical' ? 'bg-red-500/20 text-red-400' :
                            risk.priority === 'High' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {risk.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">{risk.description}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">{risk.category}</Badge>
                          <div className="text-xs text-slate-500">
                            L:{risk.likelihood} × I:{risk.impact} = {risk.likelihood * risk.impact}
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => createRisk(risk)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-xs"
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          Add to Register
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}