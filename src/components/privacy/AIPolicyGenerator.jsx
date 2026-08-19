import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Loader2, FileText, Download, Edit, CheckCircle2, AlertTriangle, Shield, Globe } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const POLICY_TYPES = [
  { value: "privacy_policy", label: "Privacy Policy", icon: Shield },
  { value: "dpa", label: "Data Processing Agreement", icon: FileText },
  { value: "cookie_policy", label: "Cookie Policy", icon: Globe },
  { value: "consent_notice", label: "Consent Notice", icon: CheckCircle2 }
];

const REGULATIONS = [
  { value: "GDPR", label: "EU GDPR", clauses: ["Art. 13-14 (Information)", "Art. 15-22 (Rights)", "Art. 33-34 (Breach)", "Art. 6 (Lawful Basis)"] },
  { value: "CCPA", label: "California CCPA/CPRA", clauses: ["Notice at Collection", "Do Not Sell", "Disclosure Categories", "Consumer Rights"] },
  { value: "PIPEDA", label: "Canada PIPEDA", clauses: ["Consent", "Accountability", "Safeguards", "Individual Access"] },
  { value: "LGPD", label: "Brazil LGPD", clauses: ["Legal Bases", "Data Subject Rights", "DPO", "International Transfer"] }
];

export default function AIPolicyGenerator() {
  const [policyConfig, setPolicyConfig] = useState({
    policy_type: "privacy_policy",
    regulation: "GDPR",
    company_name: "",
    company_address: "",
    dpo_contact: "",
    language: "english"
  });
  const [generating, setGenerating] = useState(false);
  const [generatedPolicy, setGeneratedPolicy] = useState(null);
  const [customizing, setCustomizing] = useState(false);
  const [customText, setCustomText] = useState("");

  const queryClient = useQueryClient();

  const { data: processingActivities = [] } = useQuery({
    queryKey: ['processing-activities'],
    queryFn: () => base44.entities.DataProcessingActivity.list('-created_date', 100),
    staleTime: 600000,
    cacheTime: 900000
  });

  const { data: privacyAssessments = [] } = useQuery({
    queryKey: ['privacy-assessments'],
    queryFn: () => base44.entities.PrivacyAssessment.list('-created_date', 100),
    staleTime: 600000,
    cacheTime: 900000
  });

  const generatePolicy = async () => {
    if (!policyConfig.company_name) {
      toast.error("Please provide company name");
      return;
    }

    setGenerating(true);
    try {
      const regulation = REGULATIONS.find(r => r.value === policyConfig.regulation);
      
      const processingActivitiesSummary = processingActivities.map(a => ({
        name: a.activity_name,
        purposes: a.processing_purposes,
        lawful_basis: a.lawful_basis,
        data_categories: a.data_categories,
        retention: a.retention_period,
        cross_border: a.cross_border_transfers
      }));

      const assessmentsSummary = privacyAssessments.map(a => ({
        type: a.assessment_type,
        regulation: a.primary_regulation,
        special_categories: a.special_categories,
        risks: a.privacy_risks_identified
      }));

      let prompt = "";
      
      if (policyConfig.policy_type === "privacy_policy") {
        prompt = `You are a legal expert specializing in privacy law. Generate a comprehensive Privacy Policy for ${policyConfig.company_name}.

COMPANY INFORMATION:
- Company Name: ${policyConfig.company_name}
- Address: ${policyConfig.company_address || "To be provided"}
- DPO Contact: ${policyConfig.dpo_contact || "To be provided"}

TARGET REGULATION: ${regulation.label}
REQUIRED CLAUSES: ${regulation.clauses.join(', ')}

DATA PROCESSING CONTEXT:
${JSON.stringify(processingActivitiesSummary, null, 2)}

PRIVACY ASSESSMENTS:
${JSON.stringify(assessmentsSummary, null, 2)}

REQUIREMENTS:
1. Create a complete, professional privacy policy compliant with ${regulation.label}
2. Include all mandatory sections:
   - Introduction & Controller Information
   - Types of Personal Data Collected
   - Purposes and Legal Bases for Processing
   - Data Subject Rights (specific to ${regulation.label})
   - Data Retention Periods
   - International Data Transfers (if applicable)
   - Security Measures
   - Cookies and Tracking (if applicable)
   - Third-Party Sharing
   - Breach Notification Procedures
   - Contact Information for Privacy Inquiries
   - Policy Updates

3. Use clear, accessible language (not overly legal jargon)
4. Include specific references to ${regulation.label} articles where appropriate
5. Format using markdown with proper headings and structure
6. Add [CUSTOMIZE] tags where company should add specific details
7. Make it professional and ready for legal review

Generate the complete privacy policy document now.`;
      } else if (policyConfig.policy_type === "dpa") {
        prompt = `You are a legal expert. Generate a Data Processing Agreement (DPA) for ${policyConfig.company_name} as Data Controller.

COMPANY INFORMATION:
- Company Name: ${policyConfig.company_name}
- Address: ${policyConfig.company_address || "To be provided"}

TARGET REGULATION: ${regulation.label}

DATA PROCESSING ACTIVITIES:
${JSON.stringify(processingActivitiesSummary, null, 2)}

REQUIREMENTS:
1. Create a comprehensive DPA compliant with ${regulation.label}
2. Include standard DPA sections:
   - Parties and Definitions
   - Subject Matter and Duration
   - Nature and Purpose of Processing
   - Types of Personal Data and Categories of Data Subjects
   - Controller and Processor Obligations
   - Security Measures (Art. 32 for GDPR)
   - Sub-processors
   - Data Subject Rights Assistance
   - Data Breach Notification
   - International Transfers
   - Audit Rights
   - Liability and Indemnification
   - Term and Termination
   - Governing Law

3. Use professional legal language appropriate for contracts
4. Include [PROCESSOR NAME] and other placeholders for customization
5. Reference specific ${regulation.label} articles
6. Format using markdown

Generate the complete DPA document now.`;
      } else if (policyConfig.policy_type === "cookie_policy") {
        prompt = `Generate a Cookie Policy for ${policyConfig.company_name} compliant with ${regulation.label}.

Include sections on:
- What are cookies
- Types of cookies used (essential, analytics, marketing)
- Cookie consent management
- How to control/delete cookies
- Third-party cookies
- Cookie retention periods

Make it user-friendly and compliant. Use markdown formatting.`;
      } else if (policyConfig.policy_type === "consent_notice") {
        prompt = `Generate a concise Consent Notice for ${policyConfig.company_name} for collecting personal data.

Based on processing activities: ${JSON.stringify(processingActivitiesSummary, null, 2)}

Include:
- Clear description of what data is collected
- Why it's collected (purposes)
- Legal basis
- How long it's kept
- Rights of data subjects
- How to withdraw consent
- Contact for questions

Compliant with ${regulation.label}. Keep it concise (1-2 pages max). Use markdown.`;
      }

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setGeneratedPolicy({
        type: policyConfig.policy_type,
        regulation: policyConfig.regulation,
        content: result,
        generated_date: new Date().toISOString(),
        config: policyConfig
      });
      
      toast.success("Policy document generated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate policy");
    } finally {
      setGenerating(false);
    }
  };

  const downloadPolicy = (format = "markdown") => {
    if (!generatedPolicy) return;

    const content = customizing ? customText : generatedPolicy.content;
    const policyType = POLICY_TYPES.find(p => p.value === generatedPolicy.type);
    
    if (format === "markdown") {
      const blob = new Blob([content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${policyType.label.replace(/ /g, '_')}_${policyConfig.company_name.replace(/ /g, '_')}.md`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Downloaded as Markdown");
    } else if (format === "text") {
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${policyType.label.replace(/ /g, '_')}_${policyConfig.company_name.replace(/ /g, '_')}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Downloaded as Text");
    }
  };

  const startCustomizing = () => {
    setCustomText(generatedPolicy.content);
    setCustomizing(true);
  };

  const saveCustomization = () => {
    setGeneratedPolicy({
      ...generatedPolicy,
      content: customText
    });
    setCustomizing(false);
    toast.success("Customization saved");
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/5 border border-blue-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-xl">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">AI Policy Document Generator</h3>
                <p className="text-sm text-slate-400">Automated privacy policy & DPA generation with compliance context</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">Data Sources</div>
              <div className="flex gap-2 mt-1">
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                  {processingActivities.length} Activities
                </Badge>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                  {privacyAssessments.length} Assessments
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="bg-[#1a2332] border border-[#2a3548] w-full grid grid-cols-2">
          <TabsTrigger value="generate" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            1. Configure & Generate
          </TabsTrigger>
          <TabsTrigger value="review" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400" disabled={!generatedPolicy}>
            2. Review & Customize
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base">Policy Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Policy Type *</Label>
                  <Select value={policyConfig.policy_type} onValueChange={(v) => setPolicyConfig({ ...policyConfig, policy_type: v })}>
                    <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      {POLICY_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Primary Regulation *</Label>
                  <Select value={policyConfig.regulation} onValueChange={(v) => setPolicyConfig({ ...policyConfig, regulation: v })}>
                    <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      {REGULATIONS.map(reg => (
                        <SelectItem key={reg.value} value={reg.value}>{reg.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Company/Organization Name *</Label>
                <Input
                  value={policyConfig.company_name}
                  onChange={(e) => setPolicyConfig({ ...policyConfig, company_name: e.target.value })}
                  placeholder="Your Company Inc."
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>

              <div className="space-y-2">
                <Label>Company Address (Optional)</Label>
                <Input
                  value={policyConfig.company_address}
                  onChange={(e) => setPolicyConfig({ ...policyConfig, company_address: e.target.value })}
                  placeholder="123 Main Street, City, Country"
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>

              <div className="space-y-2">
                <Label>Data Protection Officer Contact (Optional)</Label>
                <Input
                  value={policyConfig.dpo_contact}
                  onChange={(e) => setPolicyConfig({ ...policyConfig, dpo_contact: e.target.value })}
                  placeholder="dpo@company.com or +1-234-567-8900"
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>

              <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Context from Your Data</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400">Processing Activities:</span>
                      <div className="text-indigo-400 font-semibold">{processingActivities.length} identified</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Privacy Assessments:</span>
                      <div className="text-purple-400 font-semibold">{privacyAssessments.length} completed</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Special Categories:</span>
                      <div className="text-rose-400 font-semibold">
                        {privacyAssessments.reduce((sum, a) => sum + (a.special_categories?.length || 0), 0)} detected
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Cross-Border:</span>
                      <div className="text-amber-400 font-semibold">
                        {processingActivities.filter(a => a.cross_border_transfers).length} activities
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={generatePolicy}
                disabled={generating}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {generating ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating Policy Document...</>
                ) : (
                  <><Brain className="h-4 w-4 mr-2" /> Generate {POLICY_TYPES.find(p => p.value === policyConfig.policy_type)?.label}</>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base">What Will Be Included</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {REGULATIONS.find(r => r.value === policyConfig.regulation)?.clauses.map((clause, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">{clause}</span>
                  </div>
                ))}
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">Tailored to your {processingActivities.length} processing activities</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">References to identified privacy risks and controls</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="space-y-6">
          {generatedPolicy && (
            <>
              <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                      <div>
                        <h4 className="text-base font-semibold text-white">
                          {POLICY_TYPES.find(p => p.value === generatedPolicy.type)?.label} Generated
                        </h4>
                        <p className="text-xs text-slate-400">
                          Generated on {new Date(generatedPolicy.generated_date).toLocaleString()} • {generatedPolicy.regulation}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!customizing && (
                        <Button onClick={startCustomizing} variant="outline" size="sm" className="border-indigo-500/30">
                          <Edit className="h-4 w-4 mr-2" />
                          Customize
                        </Button>
                      )}
                      <Button onClick={() => downloadPolicy("markdown")} size="sm" className="bg-blue-600">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {customizing ? (
                <Card className="bg-[#1a2332] border-[#2a3548]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Edit Policy Document</CardTitle>
                      <div className="flex gap-2">
                        <Button onClick={() => setCustomizing(false)} variant="outline" size="sm" className="border-[#2a3548]">
                          Cancel
                        </Button>
                        <Button onClick={saveCustomization} size="sm" className="bg-emerald-600">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      className="bg-[#151d2e] border-[#2a3548] text-white font-mono text-xs h-[600px]"
                      placeholder="Edit your policy document..."
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-[#1a2332] border-[#2a3548]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Policy Preview</CardTitle>
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Draft - Legal Review Required
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[600px] pr-4">
                      <div className="prose prose-sm prose-invert max-w-none">
                        <ReactMarkdown
                          components={{
                            h1: ({children}) => <h1 className="text-2xl font-bold text-white mb-4 mt-6 first:mt-0">{children}</h1>,
                            h2: ({children}) => <h2 className="text-xl font-semibold text-white mb-3 mt-5">{children}</h2>,
                            h3: ({children}) => <h3 className="text-lg font-semibold text-slate-200 mb-2 mt-4">{children}</h3>,
                            p: ({children}) => <p className="text-slate-300 mb-3 leading-relaxed">{children}</p>,
                            ul: ({children}) => <ul className="list-disc ml-6 mb-3 space-y-1">{children}</ul>,
                            ol: ({children}) => <ol className="list-decimal ml-6 mb-3 space-y-1">{children}</ol>,
                            li: ({children}) => <li className="text-slate-300">{children}</li>,
                            strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                            em: ({children}) => <em className="text-indigo-400">{children}</em>,
                            code: ({inline, children}) => inline ? (
                              <code className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-xs">{children}</code>
                            ) : (
                              <code className="block px-3 py-2 rounded bg-[#151d2e] text-slate-300 text-xs my-2">{children}</code>
                            ),
                            blockquote: ({children}) => (
                              <blockquote className="border-l-4 border-indigo-500 pl-4 italic text-slate-400 my-3">
                                {children}
                              </blockquote>
                            ),
                            hr: () => <hr className="border-[#2a3548] my-6" />
                          }}
                        >
                          {generatedPolicy.content}
                        </ReactMarkdown>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-white mb-2">Important Notice</h4>
                      <ul className="text-xs text-slate-300 space-y-1">
                        <li>• This is an AI-generated draft and requires legal review before use</li>
                        <li>• Review all [CUSTOMIZE] tags and fill in specific details</li>
                        <li>• Ensure all sections align with your actual data practices</li>
                        <li>• Consult with legal counsel to verify compliance with {generatedPolicy.regulation}</li>
                        <li>• Update the policy whenever your processing activities change</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button onClick={() => setGeneratedPolicy(null)} variant="outline" className="flex-1 border-[#2a3548]">
                  Generate New Policy
                </Button>
                <Button onClick={() => downloadPolicy("text")} variant="outline" className="flex-1 border-[#2a3548]">
                  <Download className="h-4 w-4 mr-2" />
                  Download as Text
                </Button>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}