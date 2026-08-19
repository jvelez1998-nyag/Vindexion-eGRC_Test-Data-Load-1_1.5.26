import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  FileText, Loader2, Sparkles, Download, Copy, CheckCircle2, 
  Shield, BookOpen, AlertTriangle, Zap
} from "lucide-react";
import { toast } from "sonner";

const FRAMEWORKS = [
  { value: "NIST_CSF", label: "NIST Cybersecurity Framework", description: "Comprehensive cybersecurity risk management" },
  { value: "ISO27001", label: "ISO 27001", description: "Information security management systems" },
  { value: "SOC2", label: "SOC 2", description: "Service organization controls" },
  { value: "GDPR", label: "GDPR", description: "EU data protection regulation" },
  { value: "HIPAA", label: "HIPAA", description: "Healthcare data privacy and security" },
  { value: "PCI_DSS", label: "PCI DSS", description: "Payment card industry security" },
  { value: "SOX", label: "SOX", description: "Financial reporting controls" },
  { value: "CCPA", label: "CCPA", description: "California consumer privacy" },
  { value: "COBIT", label: "COBIT", description: "IT governance framework" }
];

const POLICY_TYPES = [
  "Information Security Policy",
  "Access Control Policy",
  "Data Protection Policy",
  "Incident Response Policy",
  "Business Continuity Policy",
  "Acceptable Use Policy",
  "Password Policy",
  "Remote Work Policy",
  "Vendor Management Policy",
  "Change Management Policy",
  "Backup and Recovery Policy",
  "Mobile Device Policy",
  "Email and Communication Policy",
  "Physical Security Policy"
];

export default function AIPolicyGenerator() {
  const [config, setConfig] = useState({
    policy_type: "",
    organization_name: "",
    industry: "",
    organization_size: "medium",
    existing_frameworks: [],
    target_frameworks: [],
    specific_requirements: "",
    tone: "formal",
    compliance_level: "standard"
  });
  const [generating, setGenerating] = useState(false);
  const [generatedPolicy, setGeneratedPolicy] = useState(null);

  const toggleFramework = (list, framework) => {
    const current = config[list] || [];
    const updated = current.includes(framework)
      ? current.filter(f => f !== framework)
      : [...current, framework];
    setConfig({ ...config, [list]: updated });
  };

  const generatePolicy = async () => {
    if (!config.policy_type || !config.organization_name) {
      toast.error("Please provide policy type and organization name");
      return;
    }

    setGenerating(true);
    try {
      const prompt = `You are an expert compliance and policy writer with deep knowledge of cybersecurity frameworks and regulatory requirements.

Generate a comprehensive, professional, and implementation-ready policy document based on the following specifications:

POLICY DETAILS:
Policy Type: ${config.policy_type}
Organization: ${config.organization_name}
Industry: ${config.industry || 'General'}
Organization Size: ${config.organization_size}
Compliance Tone: ${config.tone}
Compliance Rigor: ${config.compliance_level}

FRAMEWORK REQUIREMENTS:
Target Frameworks to Comply With: ${config.target_frameworks.length > 0 ? config.target_frameworks.join(', ') : 'Best practices'}
Existing Frameworks in Place: ${config.existing_frameworks.length > 0 ? config.existing_frameworks.join(', ') : 'None'}

SPECIFIC REQUIREMENTS:
${config.specific_requirements || 'None specified - use industry best practices'}

INSTRUCTIONS:
1. Create a complete, professional policy document with proper structure
2. Include all standard policy sections (Purpose, Scope, Policy Statements, Procedures, Roles & Responsibilities, etc.)
3. Map each policy requirement to specific framework controls where applicable
4. Provide specific, actionable procedures rather than generic statements
5. Include compliance requirements and audit evidence suggestions
6. Highlight critical areas that need immediate attention
7. Provide implementation guidance and best practices
8. Make it ready for executive review and approval

The policy should be:
- Professional and legally sound
- Specific to the organization's context
- Actionable with clear procedures
- Aligned with selected frameworks
- Ready for immediate use with minimal customization`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            policy_title: { type: "string" },
            version: { type: "string" },
            effective_date: { type: "string" },
            executive_summary: { type: "string" },
            sections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  section_number: { type: "string" },
                  section_title: { type: "string" },
                  content: { type: "string" },
                  framework_mappings: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        framework: { type: "string" },
                        control_ids: { type: "array", items: { type: "string" } }
                      }
                    }
                  }
                }
              }
            },
            compliance_requirements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  requirement: { type: "string" },
                  framework: { type: "string" },
                  evidence_needed: { type: "string" },
                  implementation_priority: { type: "string" }
                }
              }
            },
            roles_responsibilities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  role: { type: "string" },
                  responsibilities: { type: "array", items: { type: "string" } }
                }
              }
            },
            implementation_guide: {
              type: "object",
              properties: {
                quick_wins: { type: "array", items: { type: "string" } },
                short_term: { type: "array", items: { type: "string" } },
                long_term: { type: "array", items: { type: "string" } },
                critical_actions: { type: "array", items: { type: "string" } }
              }
            },
            best_practices: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  practice: { type: "string" },
                  benefit: { type: "string" }
                }
              }
            },
            audit_preparation: {
              type: "object",
              properties: {
                key_evidence: { type: "array", items: { type: "string" } },
                common_findings: { type: "array", items: { type: "string" } },
                documentation_tips: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      });

      setGeneratedPolicy(response);
      toast.success("Policy generated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate policy. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const downloadPolicy = () => {
    if (!generatedPolicy) return;

    let markdown = `# ${generatedPolicy.policy_title}\n\n`;
    markdown += `**Version:** ${generatedPolicy.version}\n`;
    markdown += `**Effective Date:** ${generatedPolicy.effective_date}\n`;
    markdown += `**Organization:** ${config.organization_name}\n\n`;
    markdown += `---\n\n`;
    markdown += `## Executive Summary\n\n${generatedPolicy.executive_summary}\n\n`;
    markdown += `---\n\n`;

    generatedPolicy.sections?.forEach(section => {
      markdown += `## ${section.section_number} ${section.section_title}\n\n`;
      markdown += `${section.content}\n\n`;
      
      if (section.framework_mappings?.length > 0) {
        markdown += `**Framework Mappings:**\n`;
        section.framework_mappings.forEach(fm => {
          markdown += `- ${fm.framework}: ${fm.control_ids.join(', ')}\n`;
        });
        markdown += `\n`;
      }
    });

    markdown += `\n---\n\n## Roles and Responsibilities\n\n`;
    generatedPolicy.roles_responsibilities?.forEach(role => {
      markdown += `### ${role.role}\n\n`;
      role.responsibilities.forEach(resp => {
        markdown += `- ${resp}\n`;
      });
      markdown += `\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedPolicy.policy_title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Policy downloaded successfully!");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
      case 'immediate':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'high':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'low':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
              <Sparkles className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <CardTitle className="text-xl text-white">AI Policy Generator</CardTitle>
              <p className="text-sm text-slate-400 mt-1">
                Generate comprehensive, framework-aligned policies with AI assistance
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Configuration Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Policy Type</label>
              <Select value={config.policy_type} onValueChange={(val) => setConfig({ ...config, policy_type: val })}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue placeholder="Select policy type" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  {POLICY_TYPES.map(type => (
                    <SelectItem key={type} value={type} className="text-white">{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Organization Name</label>
              <Input
                value={config.organization_name}
                onChange={(e) => setConfig({ ...config, organization_name: e.target.value })}
                placeholder="e.g., Acme Corporation"
                className="bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Industry</label>
              <Input
                value={config.industry}
                onChange={(e) => setConfig({ ...config, industry: e.target.value })}
                placeholder="e.g., Healthcare, Finance, Technology"
                className="bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Organization Size</label>
              <Select value={config.organization_size} onValueChange={(val) => setConfig({ ...config, organization_size: val })}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  <SelectItem value="small" className="text-white">Small (1-50 employees)</SelectItem>
                  <SelectItem value="medium" className="text-white">Medium (51-500 employees)</SelectItem>
                  <SelectItem value="large" className="text-white">Large (501-5000 employees)</SelectItem>
                  <SelectItem value="enterprise" className="text-white">Enterprise (5000+ employees)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Tone</label>
              <Select value={config.tone} onValueChange={(val) => setConfig({ ...config, tone: val })}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  <SelectItem value="formal" className="text-white">Formal & Legal</SelectItem>
                  <SelectItem value="professional" className="text-white">Professional</SelectItem>
                  <SelectItem value="friendly" className="text-white">Friendly & Accessible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Compliance Level</label>
              <Select value={config.compliance_level} onValueChange={(val) => setConfig({ ...config, compliance_level: val })}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  <SelectItem value="basic" className="text-white">Basic</SelectItem>
                  <SelectItem value="standard" className="text-white">Standard</SelectItem>
                  <SelectItem value="comprehensive" className="text-white">Comprehensive</SelectItem>
                  <SelectItem value="strict" className="text-white">Strict (High Regulation)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Framework Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300 block">Target Frameworks (Select frameworks to comply with)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {FRAMEWORKS.map(framework => (
                <div
                  key={framework.value}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    config.target_frameworks.includes(framework.value)
                      ? 'bg-indigo-500/10 border-indigo-500/30'
                      : 'bg-[#151d2e] border-[#2a3548] hover:border-[#3a4558]'
                  }`}
                  onClick={() => toggleFramework('target_frameworks', framework.value)}
                >
                  <div className="flex items-start gap-2">
                    <Checkbox
                      checked={config.target_frameworks.includes(framework.value)}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-sm font-medium text-white">{framework.label}</div>
                      <div className="text-xs text-slate-400">{framework.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Specific Requirements */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Specific Requirements (Optional)</label>
            <Textarea
              value={config.specific_requirements}
              onChange={(e) => setConfig({ ...config, specific_requirements: e.target.value })}
              placeholder="Any specific requirements, constraints, or focus areas for this policy..."
              className="bg-[#151d2e] border-[#2a3548] text-white h-24"
            />
          </div>

          <Button
            onClick={generatePolicy}
            disabled={generating}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Policy...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Policy
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Policy Display */}
      {generatedPolicy && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">{generatedPolicy.policy_title}</CardTitle>
              <div className="flex gap-2">
                <Button onClick={downloadPolicy} variant="outline" size="sm" className="gap-2 border-[#2a3548]">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400 mt-2">
              <span>Version {generatedPolicy.version}</span>
              <span>•</span>
              <span>Effective: {generatedPolicy.effective_date}</span>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="policy" className="w-full">
              <TabsList className="bg-[#151d2e] border border-[#2a3548]">
                <TabsTrigger value="policy">Policy Document</TabsTrigger>
                <TabsTrigger value="compliance">Compliance Requirements</TabsTrigger>
                <TabsTrigger value="roles">Roles & Responsibilities</TabsTrigger>
                <TabsTrigger value="implementation">Implementation Guide</TabsTrigger>
                <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
                <TabsTrigger value="audit">Audit Preparation</TabsTrigger>
              </TabsList>

              <TabsContent value="policy" className="space-y-4 mt-4">
                {/* Executive Summary */}
                <div className="p-4 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-indigo-400">Executive Summary</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(generatedPolicy.executive_summary)}
                      className="h-7"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{generatedPolicy.executive_summary}</p>
                </div>

                {/* Policy Sections */}
                {generatedPolicy.sections?.map((section, idx) => (
                  <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-base font-semibold text-white">
                          {section.section_number} {section.section_title}
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(section.content)}
                          className="h-7"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap mb-3">{section.content}</p>
                      
                      {section.framework_mappings?.length > 0 && (
                        <div className="pt-3 border-t border-[#2a3548]">
                          <div className="text-xs font-medium text-slate-400 mb-2">Framework Mappings:</div>
                          <div className="flex flex-wrap gap-2">
                            {section.framework_mappings.map((fm, fmIdx) => (
                              <Badge key={fmIdx} className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs">
                                {fm.framework}: {fm.control_ids.join(', ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="compliance" className="space-y-3 mt-4">
                {generatedPolicy.compliance_requirements?.map((req, idx) => (
                  <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                          {req.framework}
                        </Badge>
                        <Badge className={getPriorityColor(req.implementation_priority)}>
                          {req.implementation_priority}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-white mb-2">{req.requirement}</h4>
                      <div className="text-sm text-slate-400">
                        <span className="text-slate-500">Evidence Needed:</span>
                        <p className="mt-1">{req.evidence_needed}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="roles" className="space-y-3 mt-4">
                {generatedPolicy.roles_responsibilities?.map((role, idx) => (
                  <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-indigo-400" />
                        {role.role}
                      </h4>
                      <ul className="space-y-2">
                        {role.responsibilities.map((resp, rIdx) => (
                          <li key={rIdx} className="flex items-start gap-2 text-sm text-slate-300">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="implementation" className="space-y-4 mt-4">
                <Card className="bg-[#151d2e] border-rose-500/30">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold text-rose-400 mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Critical Actions
                    </h4>
                    <ul className="space-y-2">
                      {generatedPolicy.implementation_guide?.critical_actions?.map((action, idx) => (
                        <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-rose-400">•</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-[#151d2e] border-emerald-500/30">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Quick Wins
                    </h4>
                    <ul className="space-y-2">
                      {generatedPolicy.implementation_guide?.quick_wins?.map((win, idx) => (
                        <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-emerald-400">•</span>
                          {win}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-[#151d2e] border-[#2a3548]">
                    <CardContent className="p-4">
                      <h4 className="text-sm font-semibold text-amber-400 mb-3">Short-term (1-3 months)</h4>
                      <ul className="space-y-2">
                        {generatedPolicy.implementation_guide?.short_term?.map((item, idx) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-amber-400">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#151d2e] border-[#2a3548]">
                    <CardContent className="p-4">
                      <h4 className="text-sm font-semibold text-blue-400 mb-3">Long-term (3-12 months)</h4>
                      <ul className="space-y-2">
                        {generatedPolicy.implementation_guide?.long_term?.map((item, idx) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-blue-400">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="best-practices" className="space-y-3 mt-4">
                {generatedPolicy.best_practices?.map((practice, idx) => (
                  <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <BookOpen className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-white mb-1">{practice.practice}</h4>
                          <p className="text-sm text-slate-400">{practice.benefit}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="audit" className="space-y-4 mt-4">
                <Card className="bg-[#151d2e] border-[#2a3548]">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold text-white mb-3">Key Evidence to Maintain</h4>
                    <ul className="space-y-2">
                      {generatedPolicy.audit_preparation?.key_evidence?.map((evidence, idx) => (
                        <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          {evidence}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-[#151d2e] border-amber-500/30">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold text-amber-400 mb-3">Common Audit Findings</h4>
                    <ul className="space-y-2">
                      {generatedPolicy.audit_preparation?.common_findings?.map((finding, idx) => (
                        <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-amber-400">•</span>
                          {finding}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-[#151d2e] border-[#2a3548]">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold text-white mb-3">Documentation Tips</h4>
                    <ul className="space-y-2">
                      {generatedPolicy.audit_preparation?.documentation_tips?.map((tip, idx) => (
                        <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                          <FileText className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}