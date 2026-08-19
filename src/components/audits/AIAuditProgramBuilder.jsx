import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Brain, Loader2, Save, FileText, CheckCircle2, Download, Sparkles, Target, ClipboardCheck, PlayCircle, Workflow, Calendar, Users } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

const getIndustryContext = (industry) => {
  const contexts = {
    financial_services: `- Regulatory scrutiny on lending practices, AML, and KYC
- Real-time fraud detection and transaction monitoring
- Open banking and API security
- Cryptocurrency and digital asset controls
- ESG reporting and climate risk disclosures`,
    healthcare: `- HIPAA compliance and patient data protection
- Telehealth and remote monitoring controls
- EHR system integrations and data sharing
- Medical device cybersecurity (FDA regulations)
- Clinical trial data integrity`,
    technology: `- SaaS multi-tenancy and data isolation
- AI/ML model governance and bias testing
- DevSecOps and CI/CD pipeline security
- API security and rate limiting
- Data residency and sovereignty requirements`,
    manufacturing: `- OT/IT convergence security
- Supply chain integrity and counterfeit prevention
- Predictive maintenance data reliability
- Quality management system (ISO 9001) controls
- Environmental compliance (EPA, ISO 14001)`,
    retail: `- PCI-DSS compliance for payment processing
- E-commerce platform security
- Inventory management and shrinkage controls
- Customer data privacy (CCPA, GDPR)
- Omnichannel fraud prevention`,
    energy: `- NERC CIP compliance for critical infrastructure
- SCADA and ICS security
- Environmental monitoring and reporting
- Smart grid cybersecurity
- Carbon emissions tracking and verification`,
    government: `- FISMA compliance and FedRAMP authorization
- Records management (NARA requirements)
- Whistleblower protection controls
- Public procurement integrity
- Citizen data privacy and FOIA compliance`
  };
  return contexts[industry] || 'General audit considerations applicable across industries';
};

export default function AIAuditProgramBuilder({ 
  prefilledData = null,
  onProgramCreated = null,
  integrationMode = false 
}) {
  const [loading, setLoading] = useState(false);
  const [generatedProgram, setGeneratedProgram] = useState(null);
  const [formData, setFormData] = useState(prefilledData || {
    name: "",
    audit_type: "it",
    industry: "",
    scope: "",
    objectives: "",
    risk_areas: "",
    regulatory_requirements: ""
  });
  const [selectedProcedures, setSelectedProcedures] = useState([]);
  const [showWorkflow, setShowWorkflow] = useState(false);

  const queryClient = useQueryClient();

  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: () => base44.entities.Risk.list()
  });

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: () => base44.entities.Control.list()
  });

  const { data: findings = [] } = useQuery({
    queryKey: ['findings'],
    queryFn: () => base44.entities.AuditFinding.list()
  });

  const { data: existingPrograms = [] } = useQuery({
    queryKey: ['audit-programs'],
    queryFn: () => base44.entities.AuditProgram.list()
  });

  const createProgramMutation = useMutation({
    mutationFn: (data) => base44.entities.AuditProgram.create(data),
    onSuccess: (createdProgram) => {
      queryClient.invalidateQueries({ queryKey: ['audit-programs'] });
      toast.success("Audit program saved successfully");
      if (onProgramCreated) onProgramCreated(createdProgram);
      setShowWorkflow(true);
    }
  });

  const generateProgram = async () => {
    if (!formData.name || !formData.objectives) {
      toast.error("Please provide program name and objectives");
      return;
    }

    setLoading(true);
    try {
      // Analyze existing context
      const highRisks = risks.filter(r => (r.likelihood || 0) * (r.impact || 0) >= 15);
      const recentFindings = findings.filter(f => 
        f.severity === 'critical' || f.severity === 'high'
      ).slice(0, 10);
      const ineffectiveControls = controls.filter(c => 
        c.status === 'ineffective' || c.effectiveness <= 2
      );
      const similarPrograms = existingPrograms.filter(p => 
        p.audit_type === formData.audit_type
      ).slice(0, 3);

      const prompt = `As an expert audit program designer with deep knowledge of audit methodologies, industry standards, and regulatory frameworks, generate a comprehensive audit program.

AUDIT PROGRAM DETAILS:
- Name: ${formData.name}
- Audit Type: ${formData.audit_type}
- Industry: ${formData.industry || "General"}
- Scope: ${formData.scope || "To be defined"}
- Primary Objectives:
${formData.objectives}

${formData.risk_areas ? `Key Risk Areas to Address:\n${formData.risk_areas}\n` : ''}
${formData.regulatory_requirements ? `Regulatory Requirements:\n${formData.regulatory_requirements}\n` : ''}

ORGANIZATIONAL CONTEXT:
- High/Critical Risks Identified: ${highRisks.length} (${highRisks.slice(0, 3).map(r => r.title).join(', ')})
- Recent Critical Findings: ${recentFindings.length} (${recentFindings.slice(0, 3).map(f => f.title).join(', ')})
- Ineffective Controls: ${ineffectiveControls.length}
- Similar Past Programs: ${similarPrograms.length}

${formData.industry ? `\nINDUSTRY-SPECIFIC CONSIDERATIONS (${formData.industry}):
${getIndustryContext(formData.industry)}` : ''}

INDUSTRY CONTEXT (2025):
- AI/ML Systems Auditing: GenAI models, ML pipelines, algorithmic bias
- Cloud-Native Infrastructure: Multi-cloud, containerized workloads, serverless
- Zero Trust Security: Identity-centric controls, continuous verification
- Supply Chain Security: Third-party SaaS, open-source dependencies, vendor risk
- Privacy Regulations: GDPR, CCPA, EU AI Act compliance
- ESG & Sustainability Reporting: Data integrity, carbon accounting

GENERATE A COMPREHENSIVE AUDIT PROGRAM WITH:

1. EXECUTIVE SUMMARY:
   - Program purpose and strategic value
   - Key risk areas addressed
   - Expected audit outcomes
   - Estimated timeline and resources

2. DETAILED AUDIT PROCEDURES (10-15 procedures):
   For each procedure provide:
   - Procedure ID (e.g., AUD-001)
   - Procedure Title
   - Detailed Description (what to do, how to do it)
   - Objective (what this procedure validates)
   - Risk Level Addressed (Low/Medium/High/Critical)
   - Testing Approach (inquiry, observation, inspection, reperformance)
   - Sample Size Guidance (e.g., "25 transactions", "5% of population")
   - Evidence to Collect (specific documents, logs, screenshots)
   - Expected Time (hours)
   - Skills Required (e.g., IT auditor, data analyst)

3. TESTING WORKSHEETS:
   For each major audit area, provide a structured worksheet template with:
   - Test objective
   - Sample selection criteria
   - Test steps (numbered, detailed)
   - Pass/Fail criteria
   - Documentation requirements
   - Reviewer sign-off fields

4. WORKPAPER REQUIREMENTS:
   List specific workpapers needed, such as:
   - Planning memos
   - Risk assessments
   - Testing evidence
   - Exception tracking
   - Management response documentation
   - Final reports

5. FRAMEWORK MAPPINGS:
   Map procedures to relevant frameworks:
   - NIST CSF 2.0 (Govern, Identify, Protect, Detect, Respond, Recover)
   - ISO 27001:2022 Controls
   - COBIT 2019 (Governance & Management Objectives)
   - SOX PCAOB AS Standards (if financial)
   - COSO Internal Control Framework
   - Industry-specific standards (PCI-DSS, HIPAA, etc.)

6. SAMPLING STRATEGY:
   - Statistical vs. non-statistical sampling recommendations
   - Sample size calculations
   - Selection criteria
   - Documentation requirements

7. QUALITY ASSURANCE CHECKLIST:
   - Pre-audit review items
   - In-progress quality checks
   - Final review requirements
   - Sign-off procedures

8. RISK ASSESSMENT CRITERIA:
 - Control deficiency definitions (Design vs. Operating)
 - Severity ratings (Low, Medium, High, Critical)
 - Escalation thresholds

9. COMMUNICATION PLAN:
 - Stakeholder identification
 - Meeting cadence
 - Status reporting requirements
 - Final presentation format

10. INTEGRATION TOUCHPOINTS:
 - Links to specific controls that should be tested
 - Risks that procedures address
 - Recommended timing relative to other audits
 - Dependencies on other programs

11. EXECUTION WORKFLOW:
 - Phase 1: Planning (with AI Audit Prep)
 - Phase 2: Fieldwork (with AI Fieldwork Assistant)
 - Phase 3: Reporting
 - Phase 4: Follow-up

Return detailed, actionable JSON with all sections.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: {
              type: "object",
              properties: {
                purpose: { type: "string" },
                risk_areas: { type: "array", items: { type: "string" } },
                expected_outcomes: { type: "array", items: { type: "string" } },
                estimated_hours: { type: "number" },
                team_size: { type: "number" }
              }
            },
            procedures: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  objective: { type: "string" },
                  risk_level: { type: "string" },
                  testing_approach: { type: "string" },
                  sample_size: { type: "string" },
                  evidence_to_collect: { type: "array", items: { type: "string" } },
                  estimated_hours: { type: "number" },
                  skills_required: { type: "array", items: { type: "string" } },
                  framework_mappings: {
                    type: "object",
                    properties: {
                      NIST: { type: "array", items: { type: "string" } },
                      ISO27001: { type: "array", items: { type: "string" } },
                      COBIT: { type: "array", items: { type: "string" } },
                      SOX: { type: "array", items: { type: "string" } },
                      COSO: { type: "array", items: { type: "string" } }
                    }
                  }
                }
              }
            },
            testing_worksheets: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  area: { type: "string" },
                  objective: { type: "string" },
                  sample_criteria: { type: "string" },
                  test_steps: { type: "array", items: { type: "string" } },
                  pass_fail_criteria: { type: "string" },
                  documentation_requirements: { type: "array", items: { type: "string" } }
                }
              }
            },
            workpaper_requirements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  template_needed: { type: "boolean" }
                }
              }
            },
            sampling_strategy: {
              type: "object",
              properties: {
                approach: { type: "string" },
                sample_size_rationale: { type: "string" },
                selection_method: { type: "string" },
                documentation: { type: "array", items: { type: "string" } }
              }
            },
            qa_checklist: {
              type: "array",
              items: { type: "string" }
            },
            risk_criteria: {
              type: "object",
              properties: {
                design_deficiency: { type: "string" },
                operating_deficiency: { type: "string" },
                severity_definitions: {
                  type: "object",
                  properties: {
                    low: { type: "string" },
                    medium: { type: "string" },
                    high: { type: "string" },
                    critical: { type: "string" }
                  }
                }
              }
            },
            communication_plan: {
              type: "object",
              properties: {
                stakeholders: { type: "array", items: { type: "string" } },
                meeting_cadence: { type: "string" },
                reporting_frequency: { type: "string" },
                deliverables: { type: "array", items: { type: "string" } }
              }
            },
            integration_touchpoints: {
              type: "object",
              properties: {
                linked_controls: { type: "array", items: { type: "string" } },
                addressed_risks: { type: "array", items: { type: "string" } },
                timing_considerations: { type: "string" },
                dependencies: { type: "array", items: { type: "string" } }
              }
            },
            execution_workflow: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  phase: { type: "string" },
                  duration: { type: "string" },
                  activities: { type: "array", items: { type: "string" } },
                  ai_tools: { type: "array", items: { type: "string" } },
                  deliverables: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      setGeneratedProgram(response);
      setSelectedProcedures(response.procedures.map(p => p.id));
      toast.success("Audit program generated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate audit program");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProgram = () => {
    if (!generatedProgram) return;

    const selectedProceduresData = generatedProgram.procedures.filter(p => 
      selectedProcedures.includes(p.id)
    );

    const programData = {
      name: formData.name,
      audit_type: formData.audit_type,
      description: formData.scope,
      objectives: formData.objectives.split('\n').filter(Boolean),
      scope: formData.scope,
      procedures: selectedProceduresData,
      testing_worksheets: generatedProgram.testing_worksheets,
      sampling_criteria: generatedProgram.sampling_strategy,
      estimated_hours: generatedProgram.executive_summary.estimated_hours,
      status: "template",
      is_template: true
    };

    createProgramMutation.mutate(programData);
  };

  const toggleProcedure = (id) => {
    setSelectedProcedures(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const exportProgram = () => {
    if (!generatedProgram) return;

    const markdown = `# ${formData.name}

## Executive Summary
${generatedProgram.executive_summary.purpose}

**Risk Areas:** ${generatedProgram.executive_summary.risk_areas.join(', ')}
**Estimated Hours:** ${generatedProgram.executive_summary.estimated_hours}
**Team Size:** ${generatedProgram.executive_summary.team_size}

## Expected Outcomes
${generatedProgram.executive_summary.expected_outcomes.map(o => `- ${o}`).join('\n')}

---

## Audit Procedures

${generatedProgram.procedures.map(proc => `
### ${proc.id}: ${proc.title}

**Risk Level:** ${proc.risk_level}
**Testing Approach:** ${proc.testing_approach}
**Sample Size:** ${proc.sample_size}
**Estimated Hours:** ${proc.estimated_hours}

**Objective:**
${proc.objective}

**Description:**
${proc.description}

**Evidence to Collect:**
${proc.evidence_to_collect.map(e => `- ${e}`).join('\n')}

**Skills Required:** ${proc.skills_required.join(', ')}

**Framework Mappings:**
${Object.entries(proc.framework_mappings).map(([fw, ids]) => ids.length > 0 ? `- **${fw}:** ${ids.join(', ')}` : '').filter(Boolean).join('\n')}

---
`).join('\n')}

## Testing Worksheets

${generatedProgram.testing_worksheets.map(ws => `
### ${ws.area}

**Objective:** ${ws.objective}

**Sample Criteria:** ${ws.sample_criteria}

**Test Steps:**
${ws.test_steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

**Pass/Fail Criteria:** ${ws.pass_fail_criteria}

**Documentation:**
${ws.documentation_requirements.map(d => `- ${d}`).join('\n')}

---
`).join('\n')}

## Workpaper Requirements

${generatedProgram.workpaper_requirements.map(wp => `- **${wp.name}**: ${wp.description}`).join('\n')}

## Sampling Strategy

**Approach:** ${generatedProgram.sampling_strategy.approach}

**Sample Size Rationale:** ${generatedProgram.sampling_strategy.sample_size_rationale}

**Selection Method:** ${generatedProgram.sampling_strategy.selection_method}

## Quality Assurance Checklist

${generatedProgram.qa_checklist.map((item, i) => `${i + 1}. ${item}`).join('\n')}

## Communication Plan

**Stakeholders:** ${generatedProgram.communication_plan.stakeholders.join(', ')}
**Meeting Cadence:** ${generatedProgram.communication_plan.meeting_cadence}
**Reporting Frequency:** ${generatedProgram.communication_plan.reporting_frequency}

**Deliverables:**
${generatedProgram.communication_plan.deliverables.map(d => `- ${d}`).join('\n')}
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.name.replace(/\s+/g, '-')}-audit-program.md`;
    a.click();
    toast.success("Program exported successfully");
  };

  if (!generatedProgram) {
    return (
      <div className="space-y-6">
        <Card className="bg-[#1a2332] border-[#2a3548] p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <Brain className="h-6 w-6 text-indigo-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2">AI Audit Program Builder</h3>
              <p className="text-slate-400 text-sm">
                Generate comprehensive audit programs with detailed procedures, testing steps, workpaper requirements, 
                and framework mappings tailored to your audit objectives and risk areas.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-slate-400">Program Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., IT General Controls Audit 2025"
                className="bg-[#151d2e] border-[#2a3548] text-white mt-1.5"
              />
            </div>

            <div>
              <Label className="text-slate-400">Audit Type *</Label>
              <Select value={formData.audit_type} onValueChange={(value) => setFormData({ ...formData, audit_type: value })}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  <SelectItem value="it" className="text-white">IT Audit</SelectItem>
                  <SelectItem value="internal" className="text-white">Internal Audit</SelectItem>
                  <SelectItem value="financial" className="text-white">Financial Audit</SelectItem>
                  <SelectItem value="operational" className="text-white">Operational Audit</SelectItem>
                  <SelectItem value="regulatory" className="text-white">Regulatory Compliance</SelectItem>
                  <SelectItem value="external" className="text-white">External Audit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-400">Industry</Label>
              <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white mt-1.5">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  <SelectItem value="financial_services" className="text-white">Financial Services</SelectItem>
                  <SelectItem value="healthcare" className="text-white">Healthcare</SelectItem>
                  <SelectItem value="technology" className="text-white">Technology</SelectItem>
                  <SelectItem value="manufacturing" className="text-white">Manufacturing</SelectItem>
                  <SelectItem value="retail" className="text-white">Retail</SelectItem>
                  <SelectItem value="energy" className="text-white">Energy</SelectItem>
                  <SelectItem value="government" className="text-white">Government</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-400">Audit Scope</Label>
              <Textarea
                value={formData.scope}
                onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                placeholder="Define what systems, processes, or areas will be covered (e.g., 'Cloud infrastructure, access management, change control for AWS production environment')"
                className="bg-[#151d2e] border-[#2a3548] text-white mt-1.5 h-24"
              />
            </div>

            <div>
              <Label className="text-slate-400">Primary Objectives *</Label>
              <Textarea
                value={formData.objectives}
                onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                placeholder="List the main objectives (one per line, e.g., 'Validate access controls are properly configured', 'Ensure SOX compliance for financial systems')"
                className="bg-[#151d2e] border-[#2a3548] text-white mt-1.5 h-28"
              />
            </div>

            <div>
              <Label className="text-slate-400">Key Risk Areas (Optional)</Label>
              <Textarea
                value={formData.risk_areas}
                onChange={(e) => setFormData({ ...formData, risk_areas: e.target.value })}
                placeholder="Identify specific risk areas to focus on (e.g., 'Privileged access management', 'Data encryption at rest and in transit')"
                className="bg-[#151d2e] border-[#2a3548] text-white mt-1.5 h-24"
              />
            </div>

            <div>
              <Label className="text-slate-400">Regulatory Requirements (Optional)</Label>
              <Textarea
                value={formData.regulatory_requirements}
                onChange={(e) => setFormData({ ...formData, regulatory_requirements: e.target.value })}
                placeholder="Specify relevant regulations or standards (e.g., 'SOX Section 404', 'GDPR Article 32', 'ISO 27001 Annex A')"
                className="bg-[#151d2e] border-[#2a3548] text-white mt-1.5 h-24"
              />
            </div>

            <Button 
              onClick={generateProgram}
              disabled={loading || !formData.name || !formData.objectives}
              className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating Comprehensive Audit Program...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Audit Program
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const riskColors = {
    Low: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    High: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    Critical: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Generated Audit Program: {formData.name}</h3>
        <div className="flex items-center gap-3">
          <Button onClick={exportProgram} variant="outline" className="border-[#2a3548] text-slate-400 hover:text-white">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={handleSaveProgram}
            disabled={createProgramMutation.isPending || selectedProcedures.length === 0}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {createProgramMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save as Template
          </Button>
          <Button onClick={() => setGeneratedProgram(null)} variant="outline" className="border-[#2a3548]">
            New Program
          </Button>
        </div>
      </div>

      {/* Executive Summary */}
      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 p-6">
        <div className="flex items-start gap-4">
          <Target className="h-8 w-8 text-indigo-400 mt-1" />
          <div className="flex-1">
            <h4 className="font-semibold text-white text-lg mb-3">Executive Summary</h4>
            <p className="text-slate-300 text-sm mb-4">{generatedProgram.executive_summary.purpose}</p>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-[#1a2332]/50 rounded-lg border border-indigo-500/20">
                <div className="text-2xl font-bold text-white">{generatedProgram.executive_summary.estimated_hours}h</div>
                <div className="text-xs text-slate-400 mt-1">Estimated Hours</div>
              </div>
              <div className="p-3 bg-[#1a2332]/50 rounded-lg border border-indigo-500/20">
                <div className="text-2xl font-bold text-white">{generatedProgram.executive_summary.team_size}</div>
                <div className="text-xs text-slate-400 mt-1">Team Members</div>
              </div>
              <div className="p-3 bg-[#1a2332]/50 rounded-lg border border-indigo-500/20">
                <div className="text-2xl font-bold text-white">{generatedProgram.procedures.length}</div>
                <div className="text-xs text-slate-400 mt-1">Procedures</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-sm font-medium text-slate-400 mb-2">Expected Outcomes:</div>
              <ul className="space-y-1">
                {generatedProgram.executive_summary.expected_outcomes.map((outcome, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    {outcome}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4">
              <div className="text-sm font-medium text-slate-400 mb-2">Key Risk Areas:</div>
              <div className="flex flex-wrap gap-2">
                {generatedProgram.executive_summary.risk_areas.map((area, i) => (
                  <Badge key={i} className="bg-rose-500/10 text-rose-400 border-rose-500/30">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="procedures" className="space-y-4">
        <TabsList className="bg-[#1a2332] border border-[#2a3548] flex-wrap h-auto">
          <TabsTrigger value="procedures">Procedures ({generatedProgram.procedures.length})</TabsTrigger>
          <TabsTrigger value="worksheets">Testing Worksheets</TabsTrigger>
          <TabsTrigger value="workpapers">Workpapers</TabsTrigger>
          <TabsTrigger value="sampling">Sampling</TabsTrigger>
          <TabsTrigger value="qa">QA & Risk</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
          <TabsTrigger value="workflow">Execution Workflow</TabsTrigger>
        </TabsList>

        <TabsContent value="procedures">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4 pr-4">
              <div className="flex items-center justify-between p-3 bg-[#1a2332] border border-[#2a3548] rounded-lg">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedProcedures.length === generatedProgram.procedures.length}
                    onCheckedChange={(checked) => {
                      setSelectedProcedures(checked ? generatedProgram.procedures.map(p => p.id) : []);
                    }}
                  />
                  <span className="text-sm text-slate-400">
                    Select all procedures ({selectedProcedures.length} of {generatedProgram.procedures.length} selected)
                  </span>
                </div>
                <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30">
                  {selectedProcedures.reduce((sum, id) => {
                    const proc = generatedProgram.procedures.find(p => p.id === id);
                    return sum + (proc?.estimated_hours || 0);
                  }, 0)}h total
                </Badge>
              </div>

              {generatedProgram.procedures.map((proc, idx) => (
                <Card key={idx} className="bg-[#1a2332] border-[#2a3548] p-5">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={selectedProcedures.includes(proc.id)}
                      onCheckedChange={() => toggleProcedure(proc.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20 font-mono text-xs">
                              {proc.id}
                            </Badge>
                            <h5 className="font-semibold text-white text-base">{proc.title}</h5>
                          </div>
                          <p className="text-sm text-slate-400 mb-3">{proc.description}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 ml-4">
                          <Badge className={riskColors[proc.risk_level]}>
                            {proc.risk_level}
                          </Badge>
                          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs">
                            {proc.estimated_hours}h
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
                          <span className="font-medium text-indigo-400">Objective: </span>
                          <span className="text-slate-300">{proc.objective}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-slate-500 font-medium">Testing Approach:</span>
                            <div className="text-slate-300 mt-1">{proc.testing_approach}</div>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium">Sample Size:</span>
                            <div className="text-slate-300 mt-1">{proc.sample_size}</div>
                          </div>
                        </div>

                        <div>
                          <span className="text-slate-500 font-medium">Evidence to Collect:</span>
                          <ul className="mt-1 space-y-1">
                            {proc.evidence_to_collect.map((evidence, i) => (
                              <li key={i} className="flex items-start gap-2 text-slate-300">
                                <FileText className="h-3 w-3 mt-0.5 flex-shrink-0 text-slate-500" />
                                {evidence}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <span className="text-slate-500 font-medium">Skills Required:</span>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {proc.skills_required.map((skill, i) => (
                              <Badge key={i} className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {Object.entries(proc.framework_mappings).some(([_, ids]) => ids.length > 0) && (
                          <div>
                            <span className="text-slate-500 font-medium">Framework Mappings:</span>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {Object.entries(proc.framework_mappings).map(([framework, ids]) =>
                                ids.length > 0 && (
                                  <Badge key={framework} className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                                    {framework}: {ids.join(', ')}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="worksheets">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4 pr-4">
              {generatedProgram.testing_worksheets.map((worksheet, idx) => (
                <Card key={idx} className="bg-[#1a2332] border-[#2a3548] p-5">
                  <h5 className="font-semibold text-white text-base mb-3 flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-indigo-400" />
                    {worksheet.area}
                  </h5>

                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-slate-500 font-medium">Test Objective:</span>
                      <p className="text-slate-300 mt-1">{worksheet.objective}</p>
                    </div>

                    <div>
                      <span className="text-slate-500 font-medium">Sample Selection Criteria:</span>
                      <p className="text-slate-300 mt-1">{worksheet.sample_criteria}</p>
                    </div>

                    <div>
                      <span className="text-slate-500 font-medium">Test Steps:</span>
                      <ol className="mt-2 space-y-2 list-decimal list-inside">
                        {worksheet.test_steps.map((step, i) => (
                          <li key={i} className="text-slate-300 pl-2">{step}</li>
                        ))}
                      </ol>
                    </div>

                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                      <span className="text-slate-500 font-medium">Pass/Fail Criteria:</span>
                      <p className="text-slate-300 mt-1">{worksheet.pass_fail_criteria}</p>
                    </div>

                    <div>
                      <span className="text-slate-500 font-medium">Documentation Requirements:</span>
                      <ul className="mt-1 space-y-1">
                        {worksheet.documentation_requirements.map((req, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-300">
                            <CheckCircle2 className="h-3 w-3 mt-0.5 flex-shrink-0 text-emerald-400" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="workpapers">
          <div className="grid gap-3">
            {generatedProgram.workpaper_requirements.map((wp, idx) => (
              <Card key={idx} className="bg-[#1a2332] border-[#2a3548] p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-semibold text-white mb-1">{wp.name}</h5>
                    <p className="text-sm text-slate-400">{wp.description}</p>
                  </div>
                  {wp.template_needed && (
                    <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs">
                      Template Required
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sampling">
          <Card className="bg-[#1a2332] border-[#2a3548] p-6">
            <h5 className="font-semibold text-white text-base mb-4">Sampling Strategy</h5>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-slate-500 font-medium">Approach:</span>
                <p className="text-slate-300 mt-1">{generatedProgram.sampling_strategy.approach}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Sample Size Rationale:</span>
                <p className="text-slate-300 mt-1">{generatedProgram.sampling_strategy.sample_size_rationale}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Selection Method:</span>
                <p className="text-slate-300 mt-1">{generatedProgram.sampling_strategy.selection_method}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Documentation:</span>
                <ul className="mt-2 space-y-1">
                  {generatedProgram.sampling_strategy.documentation.map((doc, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-300">
                      <FileText className="h-3 w-3 mt-0.5 flex-shrink-0 text-slate-500" />
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="qa">
          <div className="grid gap-4">
            <Card className="bg-[#1a2332] border-[#2a3548] p-6">
              <h5 className="font-semibold text-white text-base mb-4">Quality Assurance Checklist</h5>
              <div className="space-y-2">
                {generatedProgram.qa_checklist.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-[#151d2e] rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548] p-6">
              <h5 className="font-semibold text-white text-base mb-4">Risk Assessment Criteria</h5>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-slate-500 font-medium">Design Deficiency:</span>
                  <p className="text-slate-300 mt-1">{generatedProgram.risk_criteria.design_deficiency}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Operating Deficiency:</span>
                  <p className="text-slate-300 mt-1">{generatedProgram.risk_criteria.operating_deficiency}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Severity Definitions:</span>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {Object.entries(generatedProgram.risk_criteria.severity_definitions).map(([level, def]) => (
                      <div key={level} className="p-3 bg-[#151d2e] rounded-lg">
                        <Badge className={riskColors[level.charAt(0).toUpperCase() + level.slice(1)] + ' mb-2'}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </Badge>
                        <p className="text-slate-300 text-xs">{def}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="communication">
          <Card className="bg-[#1a2332] border-[#2a3548] p-6">
            <h5 className="font-semibold text-white text-base mb-4">Communication Plan</h5>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-slate-500 font-medium">Stakeholders:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {generatedProgram.communication_plan.stakeholders.map((stakeholder, i) => (
                    <Badge key={i} className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                      {stakeholder}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 font-medium">Meeting Cadence:</span>
                  <p className="text-slate-300 mt-1">{generatedProgram.communication_plan.meeting_cadence}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Reporting Frequency:</span>
                  <p className="text-slate-300 mt-1">{generatedProgram.communication_plan.reporting_frequency}</p>
                </div>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Deliverables:</span>
                <ul className="mt-2 space-y-1">
                  {generatedProgram.communication_plan.deliverables.map((deliverable, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-300">
                      <FileText className="h-3 w-3 mt-0.5 flex-shrink-0 text-slate-500" />
                      {deliverable}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="integration">
          {generatedProgram.integration_touchpoints && (
            <div className="grid gap-4">
              <Card className="bg-[#1a2332] border-[#2a3548] p-6">
                <h5 className="font-semibold text-white text-base mb-4 flex items-center gap-2">
                  <Workflow className="h-5 w-5 text-cyan-400" />
                  Integration Touchpoints
                </h5>
                <div className="space-y-4 text-sm">
                  {generatedProgram.integration_touchpoints.linked_controls?.length > 0 && (
                    <div>
                      <span className="text-slate-500 font-medium">Linked Controls to Test:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {generatedProgram.integration_touchpoints.linked_controls.map((control, i) => (
                          <Badge key={i} className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                            {control}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {generatedProgram.integration_touchpoints.addressed_risks?.length > 0 && (
                    <div>
                      <span className="text-slate-500 font-medium">Risks Addressed:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {generatedProgram.integration_touchpoints.addressed_risks.map((risk, i) => (
                          <Badge key={i} className="bg-rose-500/10 text-rose-400 border-rose-500/30">
                            {risk}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {generatedProgram.integration_touchpoints.timing_considerations && (
                    <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                      <span className="text-slate-500 font-medium">Timing Considerations:</span>
                      <p className="text-slate-300 mt-1">{generatedProgram.integration_touchpoints.timing_considerations}</p>
                    </div>
                  )}
                  {generatedProgram.integration_touchpoints.dependencies?.length > 0 && (
                    <div>
                      <span className="text-slate-500 font-medium">Dependencies:</span>
                      <ul className="mt-2 space-y-1">
                        {generatedProgram.integration_touchpoints.dependencies.map((dep, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-300">
                            <FileText className="h-3 w-3 mt-0.5 flex-shrink-0 text-slate-500" />
                            {dep}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="workflow">
          {generatedProgram.execution_workflow && (
            <div className="space-y-4">
              <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20 p-6">
                <div className="flex items-start gap-4">
                  <PlayCircle className="h-8 w-8 text-emerald-400 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-white text-lg mb-2">Execution Workflow</h4>
                    <p className="text-slate-300 text-sm mb-4">
                      Integrated workflow leveraging AI-powered tools throughout the audit lifecycle
                    </p>
                  </div>
                </div>
              </Card>

              {generatedProgram.execution_workflow.map((phase, idx) => (
                <Card key={idx} className="bg-[#1a2332] border-[#2a3548] p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-500/10 border-2 border-indigo-500/30 flex-shrink-0">
                      <span className="text-indigo-400 font-bold">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-semibold text-white text-base">{phase.phase}</h5>
                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                          <Calendar className="h-3 w-3 mr-1" />
                          {phase.duration}
                        </Badge>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-slate-500 font-medium">Activities:</span>
                          <ul className="mt-1 space-y-1">
                            {phase.activities.map((activity, i) => (
                              <li key={i} className="flex items-start gap-2 text-slate-300">
                                <CheckCircle2 className="h-3 w-3 mt-0.5 flex-shrink-0 text-emerald-400" />
                                {activity}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {phase.ai_tools?.length > 0 && (
                          <div className="p-3 bg-violet-500/5 border border-violet-500/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Brain className="h-4 w-4 text-violet-400" />
                              <span className="text-slate-500 font-medium">AI Tools Available:</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {phase.ai_tools.map((tool, i) => (
                                <Badge key={i} className="bg-violet-500/20 text-violet-400 text-xs">
                                  {tool}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {phase.deliverables?.length > 0 && (
                          <div>
                            <span className="text-slate-500 font-medium">Deliverables:</span>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {phase.deliverables.map((deliverable, i) => (
                                <Badge key={i} className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                                  {deliverable}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Workflow Navigation */}
      {showWorkflow && (
        <Card className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border-indigo-500/20 p-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Ready to Begin Audit Execution?</h4>
              <p className="text-slate-400 text-sm">
                Use the integrated AI workflow to seamlessly execute this audit program
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
                <Users className="h-4 w-4 mr-2" />
                AI Audit Prep
              </Button>
              <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700">
                <PlayCircle className="h-4 w-4 mr-2" />
                Start Fieldwork
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}