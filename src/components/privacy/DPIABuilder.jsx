import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, FileText, AlertTriangle, CheckCircle2, Brain, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

const DATA_CATEGORIES = [
  "Name", "Email", "Phone", "Address", "IP Address", "Location Data", 
  "Financial Data", "Health Data", "Biometric Data", "Racial/Ethnic Origin",
  "Political Opinions", "Religious Beliefs", "Trade Union Membership",
  "Sexual Orientation", "Genetic Data", "Children's Data"
];

const LAWFUL_BASES = [
  { value: "consent", label: "Consent" },
  { value: "contract", label: "Performance of Contract" },
  { value: "legal_obligation", label: "Legal Obligation" },
  { value: "vital_interests", label: "Vital Interests" },
  { value: "public_task", label: "Public Task" },
  { value: "legitimate_interests", label: "Legitimate Interests" }
];

export default function DPIABuilder() {
  const [step, setStep] = useState(1);
  const [assessment, setAssessment] = useState({
    assessment_name: "",
    assessment_type: "dpia",
    primary_regulation: "GDPR",
    processing_activity: "",
    data_categories: [],
    special_categories: [],
    data_subjects: [],
    lawful_basis: "consent",
    processing_purposes: [],
    cross_border_transfers: false,
    transfer_mechanisms: [],
    technical_measures: [],
    organizational_measures: [],
    likelihood_score: 3,
    severity_score: 3,
    status: "draft"
  });
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PrivacyAssessment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privacy-assessments'] });
      toast.success("DPIA created successfully");
      setStep(1);
      setAssessment({
        assessment_name: "",
        assessment_type: "dpia",
        primary_regulation: "GDPR",
        processing_activity: "",
        data_categories: [],
        special_categories: [],
        data_subjects: [],
        lawful_basis: "consent",
        processing_purposes: [],
        cross_border_transfers: false,
        transfer_mechanisms: [],
        technical_measures: [],
        organizational_measures: [],
        likelihood_score: 3,
        severity_score: 3,
        status: "draft"
      });
    }
  });

  const runAIRiskAnalysis = async () => {
    setAiAnalyzing(true);
    try {
      const prompt = `Analyze this data processing activity for GDPR DPIA compliance:

PROCESSING DETAILS:
- Activity: ${assessment.processing_activity}
- Data Categories: ${assessment.data_categories.join(', ')}
- Special Categories: ${assessment.special_categories.join(', ')}
- Data Subjects: ${assessment.data_subjects.join(', ')}
- Lawful Basis: ${assessment.lawful_basis}
- Cross-Border Transfers: ${assessment.cross_border_transfers}
- Technical Measures: ${assessment.technical_measures.join(', ')}
- Organizational Measures: ${assessment.organizational_measures.join(', ')}

Provide:
1. Privacy risks identified (detailed list)
2. Likelihood score (1-5)
3. Severity/impact score (1-5)
4. Recommended mitigation measures
5. Residual risk level (low/medium/high/unacceptable)
6. AI recommendations for compliance
7. GDPR articles most relevant`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            privacy_risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  risk_title: { type: "string" },
                  description: { type: "string" },
                  affected_rights: { type: "array", items: { type: "string" } },
                  severity: { type: "string" }
                }
              }
            },
            likelihood_score: { type: "number" },
            severity_score: { type: "number" },
            mitigation_measures: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  measure: { type: "string" },
                  priority: { type: "string" },
                  implementation_effort: { type: "string" }
                }
              }
            },
            residual_risk: { type: "string" },
            recommendations: { type: "array", items: { type: "string" } },
            relevant_articles: { type: "array", items: { type: "string" } }
          }
        }
      });

      setAssessment({
        ...assessment,
        likelihood_score: result.likelihood_score,
        severity_score: result.severity_score,
        risk_score: result.likelihood_score * result.severity_score,
        privacy_risks_identified: result.privacy_risks,
        mitigation_measures: result.mitigation_measures,
        residual_risk_level: result.residual_risk,
        ai_recommendations: result.recommendations
      });

      toast.success("AI risk analysis completed");
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze risks");
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleSubmit = () => {
    if (!assessment.assessment_name || !assessment.processing_activity) {
      toast.error("Please fill in required fields");
      return;
    }
    createMutation.mutate(assessment);
  };

  const toggleDataCategory = (category) => {
    const isSpecial = ["Health Data", "Biometric Data", "Racial/Ethnic Origin", "Political Opinions", "Religious Beliefs", "Trade Union Membership", "Sexual Orientation", "Genetic Data"].includes(category);
    
    if (assessment.data_categories.includes(category)) {
      setAssessment({
        ...assessment,
        data_categories: assessment.data_categories.filter(c => c !== category),
        special_categories: isSpecial ? assessment.special_categories.filter(c => c !== category) : assessment.special_categories
      });
    } else {
      setAssessment({
        ...assessment,
        data_categories: [...assessment.data_categories, category],
        special_categories: isSpecial ? [...assessment.special_categories, category] : assessment.special_categories
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-500 to-violet-600 shadow-xl">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Data Protection Impact Assessment (DPIA) Builder</h3>
              <p className="text-sm text-slate-400">GDPR Article 35 compliant assessment workflow</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={`step${step}`} onValueChange={(v) => setStep(parseInt(v.replace('step', '')))}>
        <TabsList className="bg-[#1a2332] border border-[#2a3548] grid grid-cols-4 w-full">
          <TabsTrigger value="step1" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            1. Basics
          </TabsTrigger>
          <TabsTrigger value="step2" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">
            2. Data
          </TabsTrigger>
          <TabsTrigger value="step3" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400">
            3. Measures
          </TabsTrigger>
          <TabsTrigger value="step4" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
            4. Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="step1" className="space-y-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base">Assessment Basics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Assessment Name *</Label>
                <Input
                  value={assessment.assessment_name}
                  onChange={(e) => setAssessment({ ...assessment, assessment_name: e.target.value })}
                  placeholder="e.g., Customer Analytics Platform DPIA"
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>

              <div className="space-y-2">
                <Label>Primary Regulation *</Label>
                <Select value={assessment.primary_regulation} onValueChange={(v) => setAssessment({ ...assessment, primary_regulation: v })}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    {["GDPR", "CCPA", "CPRA", "PIPEDA", "LGPD", "PDPA_Singapore", "POPIA"].map(reg => (
                      <SelectItem key={reg} value={reg}>{reg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Processing Activity Description *</Label>
                <Textarea
                  value={assessment.processing_activity}
                  onChange={(e) => setAssessment({ ...assessment, processing_activity: e.target.value })}
                  placeholder="Describe the data processing activity in detail..."
                  className="bg-[#151d2e] border-[#2a3548] text-white h-24"
                />
              </div>

              <div className="space-y-2">
                <Label>Lawful Basis for Processing *</Label>
                <Select value={assessment.lawful_basis} onValueChange={(v) => setAssessment({ ...assessment, lawful_basis: v })}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    {LAWFUL_BASES.map(basis => (
                      <SelectItem key={basis.value} value={basis.value}>{basis.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="step2" className="space-y-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base">Data Categories & Subjects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Personal Data Categories *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-[#151d2e] rounded-lg border border-[#2a3548] max-h-64 overflow-y-auto">
                  {DATA_CATEGORIES.map(cat => {
                    const isSpecial = ["Health Data", "Biometric Data", "Racial/Ethnic Origin", "Political Opinions", "Religious Beliefs", "Trade Union Membership", "Sexual Orientation", "Genetic Data"].includes(cat);
                    return (
                      <div key={cat} className="flex items-center gap-2">
                        <Checkbox
                          checked={assessment.data_categories.includes(cat)}
                          onCheckedChange={() => toggleDataCategory(cat)}
                        />
                        <Label className="text-xs text-white cursor-pointer flex items-center gap-1">
                          {cat}
                          {isSpecial && <Badge className="bg-rose-500/20 text-rose-400 text-[8px] px-1">Art. 9</Badge>}
                        </Label>
                      </div>
                    );
                  })}
                </div>
                {assessment.special_categories.length > 0 && (
                  <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">
                    {assessment.special_categories.length} special categories detected
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 p-3 bg-[#151d2e] rounded-lg border border-[#2a3548]">
                <Checkbox
                  checked={assessment.cross_border_transfers}
                  onCheckedChange={(checked) => setAssessment({ ...assessment, cross_border_transfers: checked })}
                />
                <Label className="text-white">Cross-Border Data Transfers (Chapter V)</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="step3" className="space-y-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base">Security & Safeguards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Technical Measures (GDPR Art. 32)</Label>
                <div className="space-y-2">
                  {["Encryption at rest", "Encryption in transit", "Access controls", "Pseudonymization", "Regular backups", "Intrusion detection"].map(measure => (
                    <div key={measure} className="flex items-center gap-2">
                      <Checkbox
                        checked={assessment.technical_measures?.includes(measure)}
                        onCheckedChange={(checked) => {
                          const updated = checked 
                            ? [...(assessment.technical_measures || []), measure]
                            : (assessment.technical_measures || []).filter(m => m !== measure);
                          setAssessment({ ...assessment, technical_measures: updated });
                        }}
                      />
                      <Label className="text-sm text-white">{measure}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Organizational Measures</Label>
                <div className="space-y-2">
                  {["Staff training", "Access policies", "DPO oversight", "Privacy by design", "Regular audits", "Breach response plan"].map(measure => (
                    <div key={measure} className="flex items-center gap-2">
                      <Checkbox
                        checked={assessment.organizational_measures?.includes(measure)}
                        onCheckedChange={(checked) => {
                          const updated = checked 
                            ? [...(assessment.organizational_measures || []), measure]
                            : (assessment.organizational_measures || []).filter(m => m !== measure);
                          setAssessment({ ...assessment, organizational_measures: updated });
                        }}
                      />
                      <Label className="text-sm text-white">{measure}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="step4" className="space-y-4">
          <Card className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">AI Risk Analysis</h3>
                  <p className="text-sm text-slate-400">Generate privacy risk assessment using AI</p>
                </div>
                <Button
                  onClick={runAIRiskAnalysis}
                  disabled={aiAnalyzing}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600"
                >
                  {aiAnalyzing ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Analyzing...</> : <><Brain className="h-4 w-4 mr-2" />Analyze Risks</>}
                </Button>
              </div>

              {assessment.privacy_risks_identified && (
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-[#1a2332] rounded-lg border border-amber-500/20">
                      <div className="text-xs text-slate-400 mb-1">Likelihood</div>
                      <div className="text-2xl font-bold text-amber-400">{assessment.likelihood_score}/5</div>
                    </div>
                    <div className="p-3 bg-[#1a2332] rounded-lg border border-rose-500/20">
                      <div className="text-xs text-slate-400 mb-1">Severity</div>
                      <div className="text-2xl font-bold text-rose-400">{assessment.severity_score}/5</div>
                    </div>
                    <div className="p-3 bg-[#1a2332] rounded-lg border border-purple-500/20">
                      <div className="text-xs text-slate-400 mb-1">Risk Score</div>
                      <div className="text-2xl font-bold text-purple-400">{assessment.risk_score}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Identified Privacy Risks:</Label>
                    {assessment.privacy_risks_identified.map((risk, idx) => (
                      <div key={idx} className="p-3 bg-[#151d2e] rounded border border-rose-500/20">
                        <div className="font-semibold text-white text-sm mb-1">{risk.risk_title}</div>
                        <p className="text-xs text-slate-400">{risk.description}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">AI Recommendations:</Label>
                    <ul className="space-y-1">
                      {assessment.ai_recommendations?.map((rec, idx) => (
                        <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                          <Sparkles className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button onClick={() => setStep(3)} variant="outline" className="flex-1 border-[#2a3548]">
              Previous
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={createMutation.isPending}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600"
            >
              {createMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Creating...</> : <><CheckCircle2 className="h-4 w-4 mr-2" />Complete DPIA</>}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {step < 4 && (
        <div className="flex justify-between">
          <Button onClick={() => setStep(Math.max(1, step - 1))} variant="outline" className="border-[#2a3548]" disabled={step === 1}>
            Previous
          </Button>
          <Button onClick={() => setStep(Math.min(4, step + 1))} className="bg-indigo-600">
            Next
          </Button>
        </div>
      )}
    </div>
  );
}