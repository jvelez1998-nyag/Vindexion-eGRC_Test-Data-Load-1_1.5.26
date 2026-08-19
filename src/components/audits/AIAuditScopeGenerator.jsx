import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Loader2, Target, AlertTriangle, Shield, CheckCircle2, FileText, Copy, ArrowRight, Sparkles, Users, Clock } from "lucide-react";
import { toast } from "sonner";

export default function AIAuditScopeGenerator({ controls = [], risks = [], findings = [], incidents = [], onScopeGenerated }) {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    audit_type: "",
    industry: "",
    audit_scope_area: "",
    regulatory_frameworks: [],
    previous_audit_date: ""
  });
  const [generatedScope, setGeneratedScope] = useState(null);

  const generateScope = async () => {
    if (!config.audit_type || !config.industry) {
      toast.error("Please select audit type and industry");
      return;
    }

    setLoading(true);
    try {
      // Prepare context data
      const recentFindings = findings
        .filter(f => f.severity === 'critical' || f.severity === 'high')
        .slice(0, 10)
        .map(f => ({ title: f.title, severity: f.severity, category: f.category }));

      const highRisks = risks
        .filter(r => (r.likelihood || 0) * (r.impact || 0) >= 12)
        .slice(0, 10)
        .map(r => ({ title: r.title, category: r.category, score: (r.likelihood || 0) * (r.impact || 0) }));

      const recentIncidents = incidents
        .filter(i => {
          const date = new Date(i.occurred_date || i.created_date);
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          return date >= sixMonthsAgo;
        })
        .slice(0, 8)
        .map(i => ({ type: i.incident_type, severity: i.severity, status: i.status }));

      const controlsByDomain = controls.reduce((acc, c) => {
        if (!acc[c.domain]) acc[c.domain] = [];
        acc[c.domain].push({
          name: c.name,
          status: c.status,
          effectiveness: c.effectiveness,
          last_tested: c.last_tested_date
        });
        return acc;
      }, {});

      const ineffectiveControls = controls
        .filter(c => c.status === 'ineffective' || (c.effectiveness && c.effectiveness < 3))
        .map(c => ({ name: c.name, domain: c.domain, effectiveness: c.effectiveness }));

      const prompt = `You are an expert audit planning consultant. Generate a comprehensive initial audit scope and preparation guide.

AUDIT CONFIGURATION:
- Audit Type: ${config.audit_type}
- Industry: ${config.industry}
- Scope Area: ${config.audit_scope_area || 'Full scope'}
- Regulatory Frameworks: ${config.regulatory_frameworks.join(', ') || 'General'}
- Previous Audit: ${config.previous_audit_date || 'N/A'}

ORGANIZATIONAL CONTEXT:
Total Controls: ${controls.length}
Control Domains: ${Object.keys(controlsByDomain).join(', ')}
Ineffective Controls: ${ineffectiveControls.length}

Recent Critical/High Findings (last 12 months):
${JSON.stringify(recentFindings, null, 2)}

High-Priority Risks:
${JSON.stringify(highRisks, null, 2)}

Recent Incidents (last 6 months):
${JSON.stringify(recentIncidents, null, 2)}

GENERATE COMPREHENSIVE AUDIT SCOPE INCLUDING:

1. **Initial Audit Scope Statement**: Clear, professional statement of audit objectives and boundaries
2. **Key Risk Areas**: Top 5-7 risk areas based on industry, findings, incidents, and control weaknesses
3. **Suggested Controls for Review**: Specific controls from the system that need testing/review (by domain)
4. **Testing Priorities**: What to test first and why
5. **Resource Requirements**: Estimated hours, team composition, expertise needed
6. **Timeline Recommendations**: Suggested audit phases and duration
7. **Pre-Audit Actions**: What should be done before the audit starts
8. **Industry-Specific Considerations**: Unique considerations for ${config.industry}

Be specific and actionable. Reference actual findings and risks from the provided data.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            scope_statement: {
              type: "object",
              properties: {
                objective: { type: "string" },
                in_scope: { type: "array", items: { type: "string" } },
                out_of_scope: { type: "array", items: { type: "string" } },
                audit_period: { type: "string" },
                methodology: { type: "string" }
              }
            },
            key_risk_areas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  area: { type: "string" },
                  risk_level: { type: "string" },
                  rationale: { type: "string" },
                  linked_findings: { type: "array", items: { type: "string" } },
                  linked_incidents: { type: "array", items: { type: "string" } },
                  audit_focus: { type: "string" },
                  testing_approach: { type: "string" }
                }
              }
            },
            suggested_controls: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  domain: { type: "string" },
                  controls: { type: "array", items: { type: "string" } },
                  priority: { type: "string" },
                  testing_method: { type: "string" },
                  sample_size: { type: "string" }
                }
              }
            },
            testing_priorities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  priority: { type: "number" },
                  area: { type: "string" },
                  rationale: { type: "string" },
                  estimated_hours: { type: "number" }
                }
              }
            },
            resource_requirements: {
              type: "object",
              properties: {
                total_hours: { type: "number" },
                team_size: { type: "number" },
                required_expertise: { type: "array", items: { type: "string" } },
                external_support_needed: { type: "boolean" },
                external_support_areas: { type: "array", items: { type: "string" } }
              }
            },
            timeline_recommendations: {
              type: "object",
              properties: {
                total_duration_weeks: { type: "number" },
                phases: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      phase: { type: "string" },
                      duration_weeks: { type: "number" },
                      key_activities: { type: "array", items: { type: "string" } }
                    }
                  }
                }
              }
            },
            pre_audit_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  responsible: { type: "string" },
                  deadline_days: { type: "number" }
                }
              }
            },
            industry_considerations: {
              type: "array",
              items: { type: "string" }
            },
            executive_summary: { type: "string" }
          }
        }
      });

      setGeneratedScope(result);
      toast.success("AI audit scope generated successfully");
      
      if (onScopeGenerated) {
        onScopeGenerated(result);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate audit scope");
    } finally {
      setLoading(false);
    }
  };

  const copySection = (data) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast.success("Copied to clipboard");
  };

  const getRiskColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'critical': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'low': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <Brain className="h-6 w-6 text-violet-400" />
            </div>
            <div>
              <CardTitle className="text-white">AI Audit Scope Generator</CardTitle>
              <p className="text-slate-400 text-sm mt-1">
                Generate initial audit scope, risk analysis, and control review recommendations
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {!generatedScope ? (
        /* Configuration Form */
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base">Configure Audit Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-400">Audit Type *</Label>
                <Select value={config.audit_type} onValueChange={(v) => setConfig({...config, audit_type: v})}>
                  <SelectTrigger className="mt-1.5 bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="internal" className="text-white">Internal Audit</SelectItem>
                    <SelectItem value="external" className="text-white">External Audit</SelectItem>
                    <SelectItem value="regulatory" className="text-white">Regulatory Audit</SelectItem>
                    <SelectItem value="it" className="text-white">IT Audit</SelectItem>
                    <SelectItem value="financial" className="text-white">Financial Audit</SelectItem>
                    <SelectItem value="operational" className="text-white">Operational Audit</SelectItem>
                    <SelectItem value="soc2" className="text-white">SOC 2 Audit</SelectItem>
                    <SelectItem value="iso27001" className="text-white">ISO 27001 Audit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-400">Industry *</Label>
                <Select value={config.industry} onValueChange={(v) => setConfig({...config, industry: v})}>
                  <SelectTrigger className="mt-1.5 bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="financial_services" className="text-white">Financial Services</SelectItem>
                    <SelectItem value="healthcare" className="text-white">Healthcare</SelectItem>
                    <SelectItem value="technology" className="text-white">Technology/SaaS</SelectItem>
                    <SelectItem value="retail" className="text-white">Retail/E-commerce</SelectItem>
                    <SelectItem value="manufacturing" className="text-white">Manufacturing</SelectItem>
                    <SelectItem value="government" className="text-white">Government</SelectItem>
                    <SelectItem value="education" className="text-white">Education</SelectItem>
                    <SelectItem value="energy" className="text-white">Energy/Utilities</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-slate-400">Specific Scope Area (optional)</Label>
              <Input
                value={config.audit_scope_area}
                onChange={(e) => setConfig({...config, audit_scope_area: e.target.value})}
                placeholder="e.g., Access Controls, Data Privacy, Change Management..."
                className="mt-1.5 bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>

            <div>
              <Label className="text-slate-400">Regulatory Frameworks (optional)</Label>
              <Input
                value={config.regulatory_frameworks.join(', ')}
                onChange={(e) => setConfig({...config, regulatory_frameworks: e.target.value.split(',').map(s => s.trim())})}
                placeholder="e.g., SOX, GDPR, PCI-DSS"
                className="mt-1.5 bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>

            <div>
              <Label className="text-slate-400">Previous Audit Date (optional)</Label>
              <Input
                type="date"
                value={config.previous_audit_date}
                onChange={(e) => setConfig({...config, previous_audit_date: e.target.value})}
                className="mt-1.5 bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>

            <Button 
              onClick={generateScope}
              disabled={loading || !config.audit_type || !config.industry}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Brain className="h-4 w-4 mr-2" />
              )}
              Generate AI Audit Scope
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Generated Results */
        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList className="bg-[#1a2332] border border-[#2a3548]">
            <TabsTrigger value="summary">
              <Sparkles className="h-4 w-4 mr-2" />
              Executive Summary
            </TabsTrigger>
            <TabsTrigger value="scope">
              <Target className="h-4 w-4 mr-2" />
              Audit Scope
            </TabsTrigger>
            <TabsTrigger value="risks">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Key Risks
            </TabsTrigger>
            <TabsTrigger value="controls">
              <Shield className="h-4 w-4 mr-2" />
              Controls to Review
            </TabsTrigger>
            <TabsTrigger value="plan">
              <FileText className="h-4 w-4 mr-2" />
              Execution Plan
            </TabsTrigger>
          </TabsList>

          <div className="flex justify-end gap-2">
            <Button 
              size="sm"
              variant="outline"
              onClick={() => setGeneratedScope(null)}
              className="border-[#2a3548]"
            >
              New Scope
            </Button>
            <Button 
              size="sm"
              onClick={() => copySection(generatedScope)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Copy className="h-3 w-3 mr-2" />
              Copy All
            </Button>
          </div>

          <TabsContent value="summary">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-violet-400" />
                  Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-violet-500/5 rounded-lg border border-violet-500/20">
                  <p className="text-sm text-slate-300 leading-relaxed">{generatedScope.executive_summary}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#151d2e] rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Audit Type</p>
                    <p className="text-sm text-white font-medium">{config.audit_type}</p>
                  </div>
                  <div className="p-3 bg-[#151d2e] rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Industry</p>
                    <p className="text-sm text-white font-medium">{config.industry}</p>
                  </div>
                  <div className="p-3 bg-[#151d2e] rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Duration</p>
                    <p className="text-sm text-white font-medium">
                      {generatedScope.timeline_recommendations?.total_duration_weeks} weeks
                    </p>
                  </div>
                  <div className="p-3 bg-[#151d2e] rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Team Size</p>
                    <p className="text-sm text-white font-medium">
                      {generatedScope.resource_requirements?.team_size} people
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scope">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Audit Scope Statement</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => copySection(generatedScope.scope_statement)} className="border-[#2a3548]">
                    <Copy className="h-3 w-3 mr-2" /> Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2">Objective</h4>
                  <p className="text-sm text-slate-300 p-3 bg-[#151d2e] rounded-lg">
                    {generatedScope.scope_statement?.objective}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white mb-2">In Scope</h4>
                  <div className="space-y-2">
                    {generatedScope.scope_statement?.in_scope?.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-slate-300">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white mb-2">Out of Scope</h4>
                  <div className="space-y-1">
                    {generatedScope.scope_statement?.out_of_scope?.map((item, idx) => (
                      <div key={idx} className="text-sm text-slate-400 pl-3">• {item}</div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-[#151d2e] rounded-lg">
                    <h4 className="text-xs font-semibold text-slate-400 mb-2">Audit Period</h4>
                    <p className="text-sm text-white">{generatedScope.scope_statement?.audit_period}</p>
                  </div>
                  <div className="p-3 bg-[#151d2e] rounded-lg">
                    <h4 className="text-xs font-semibold text-slate-400 mb-2">Methodology</h4>
                    <p className="text-sm text-white">{generatedScope.scope_statement?.methodology}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risks">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Key Risk Areas</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => copySection(generatedScope.key_risk_areas)} className="border-[#2a3548]">
                    <Copy className="h-3 w-3 mr-2" /> Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {generatedScope.key_risk_areas?.map((riskArea, idx) => (
                      <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-indigo-500/20 text-indigo-400 text-xs">#{idx + 1}</Badge>
                            <h4 className="text-base font-semibold text-white">{riskArea.area}</h4>
                          </div>
                          <Badge className={`text-xs ${getRiskColor(riskArea.risk_level)}`}>
                            {riskArea.risk_level}
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Rationale:</p>
                            <p className="text-sm text-slate-300">{riskArea.rationale}</p>
                          </div>

                          {riskArea.linked_findings?.length > 0 && (
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Related Findings:</p>
                              <div className="flex flex-wrap gap-1">
                                {riskArea.linked_findings.map((f, i) => (
                                  <Badge key={i} className="text-[10px] bg-amber-500/10 text-amber-400">
                                    {f}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div>
                            <p className="text-xs text-slate-500 mb-1">Audit Focus:</p>
                            <p className="text-sm text-slate-300 bg-blue-500/5 p-2 rounded border border-blue-500/10">
                              {riskArea.audit_focus}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500 mb-1">Testing Approach:</p>
                            <p className="text-xs text-slate-400">{riskArea.testing_approach}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="controls">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Suggested Controls for Review</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => copySection(generatedScope.suggested_controls)} className="border-[#2a3548]">
                    <Copy className="h-3 w-3 mr-2" /> Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {generatedScope.suggested_controls?.map((domain, idx) => (
                      <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-400" />
                            <h4 className="text-base font-semibold text-white">{domain.domain}</h4>
                          </div>
                          <Badge className={`text-xs ${getPriorityColor(domain.priority)}`}>
                            {domain.priority} Priority
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-slate-500 mb-2">Controls to Review:</p>
                            <div className="space-y-1">
                              {domain.controls?.map((control, i) => (
                                <div key={i} className="text-sm text-slate-300 flex items-start gap-2 p-2 bg-[#0f1623] rounded">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                                  {control}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#2a3548]">
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Testing Method:</p>
                              <p className="text-xs text-slate-300">{domain.testing_method}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Sample Size:</p>
                              <p className="text-xs text-slate-300">{domain.sample_size}</p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plan">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Testing Priorities */}
              <Card className="bg-[#1a2332] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-base">Testing Priorities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {generatedScope.testing_priorities?.map((item, idx) => (
                      <div key={idx} className="p-3 bg-[#151d2e] rounded-lg border border-[#2a3548]">
                        <div className="flex items-start gap-3">
                          <Badge className="bg-indigo-500/20 text-indigo-400 text-sm">P{item.priority}</Badge>
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-white mb-1">{item.area}</h4>
                            <p className="text-xs text-slate-400 mb-2">{item.rationale}</p>
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <Clock className="h-3 w-3" />
                              {item.estimated_hours}h
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Resource Requirements */}
              <Card className="bg-[#1a2332] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-base">Resource Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[#151d2e] rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Total Hours</p>
                      <p className="text-xl font-bold text-white">
                        {generatedScope.resource_requirements?.total_hours}h
                      </p>
                    </div>
                    <div className="p-3 bg-[#151d2e] rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Team Size</p>
                      <p className="text-xl font-bold text-white flex items-center gap-1">
                        <Users className="h-5 w-5" />
                        {generatedScope.resource_requirements?.team_size}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-2">Required Expertise:</p>
                    <div className="flex flex-wrap gap-2">
                      {generatedScope.resource_requirements?.required_expertise?.map((exp, i) => (
                        <Badge key={i} className="bg-blue-500/10 text-blue-400 text-xs">
                          {exp}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {generatedScope.resource_requirements?.external_support_needed && (
                    <div className="p-3 bg-amber-500/5 rounded-lg border border-amber-500/20">
                      <p className="text-xs font-semibold text-amber-400 mb-2">External Support Recommended</p>
                      <div className="space-y-1">
                        {generatedScope.resource_requirements?.external_support_areas?.map((area, i) => (
                          <p key={i} className="text-xs text-slate-400">• {area}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card className="bg-[#1a2332] border-[#2a3548] lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Audit Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {generatedScope.timeline_recommendations?.phases?.map((phase, idx) => (
                      <div key={idx} className="p-4 bg-[#151d2e] rounded-lg border border-[#2a3548]">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-indigo-500/20 text-indigo-400">Week {
                              generatedScope.timeline_recommendations.phases
                                .slice(0, idx)
                                .reduce((sum, p) => sum + p.duration_weeks, 1)
                            }-{
                              generatedScope.timeline_recommendations.phases
                                .slice(0, idx + 1)
                                .reduce((sum, p) => sum + p.duration_weeks, 0)
                            }</Badge>
                            <h4 className="text-sm font-semibold text-white">{phase.phase}</h4>
                          </div>
                          <span className="text-xs text-slate-500">{phase.duration_weeks} weeks</span>
                        </div>
                        <ul className="space-y-1 mt-2">
                          {phase.key_activities?.map((activity, i) => (
                            <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                              <ArrowRight className="h-3 w-3 text-indigo-400 mt-0.5 flex-shrink-0" />
                              {activity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pre-Audit Actions */}
              <Card className="bg-[#1a2332] border-[#2a3548] lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Pre-Audit Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {generatedScope.pre_audit_actions?.map((action, idx) => (
                      <div key={idx} className="p-3 bg-[#151d2e] rounded-lg border border-[#2a3548] flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-white mb-1">{action.action}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span>Responsible: {action.responsible}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {action.deadline_days} days before audit
                            </span>
                          </div>
                        </div>
                        <CheckCircle2 className="h-4 w-4 text-slate-600" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}