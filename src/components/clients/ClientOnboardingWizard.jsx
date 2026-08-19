import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles, ArrowRight, ArrowLeft, Check, 
  Brain, Loader2, CheckCircle2, Users 
} from "lucide-react";
import { toast } from "sonner";

const STEPS = [
  { id: 'basic', title: 'Basic Information', icon: Users },
  { id: 'ai-analysis', title: 'AI Analysis', icon: Brain },
  { id: 'assessment', title: 'Initial Assessment', icon: CheckCircle2 },
  { id: 'review', title: 'Review & Complete', icon: Check }
];

export default function ClientOnboardingWizard({ open, onOpenChange, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    client_type: "enterprise",
    contact_name: "",
    contact_email: "",
    address: "",
    description: ""
  });
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [assessmentData, setAssessmentData] = useState(null);

  const runAIAnalysis = async () => {
    setLoading(true);
    try {
      const prompt = `As a GRC expert, analyze this new client profile and provide comprehensive onboarding recommendations:

CLIENT INFO:
- Name: ${formData.name}
- Industry: ${formData.industry}
- Type: ${formData.client_type}
- Description: ${formData.description || 'Not provided'}

PROVIDE:
1. **Industry Risk Profile** - Key risks specific to their industry
2. **Recommended Initial Assessment Areas** - What to assess first
3. **Regulatory Frameworks** - Applicable compliance frameworks
4. **Initial Risk Score Estimate** (0-100) - Based on industry standards
5. **Compliance Baseline** (0-100) - Expected starting maturity
6. **Priority Focus Areas** - Top 3 areas requiring immediate attention
7. **Onboarding Recommendations** - Specific steps for successful engagement

Return JSON with scores and detailed analysis.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            industry_risks: { type: "array", items: { type: "string" } },
            assessment_areas: { type: "array", items: { type: "string" } },
            regulatory_frameworks: { type: "array", items: { type: "string" } },
            risk_score: { type: "number" },
            compliance_baseline: { type: "number" },
            control_maturity: { type: "number" },
            security_posture: { type: "number" },
            priority_areas: { type: "array", items: { type: "string" } },
            recommendations: { type: "string" },
            risk_level: { type: "string" }
          }
        }
      });

      setAiAnalysis(response);
      setAssessmentData({
        risk_score: response.risk_score,
        compliance_score: response.compliance_baseline,
        control_maturity: response.control_maturity,
        security_posture: response.security_posture,
        risk_level: response.risk_level,
        regulatory_frameworks: response.regulatory_frameworks
      });
      setCurrentStep(2);
      toast.success("AI analysis complete!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to run AI analysis");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    const clientData = {
      ...formData,
      ...assessmentData,
      status: "active",
      onboarding_date: new Date().toISOString().split('T')[0],
      data_classification: "internal"
    };
    onComplete?.(clientData);
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            AI-Powered Client Onboarding
          </DialogTitle>
        </DialogHeader>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-2 ${idx <= currentStep ? 'text-cyan-400' : 'text-slate-500'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx < currentStep ? 'bg-cyan-500 text-white' :
                    idx === currentStep ? 'bg-cyan-500/20 border-2 border-cyan-500' :
                    'bg-slate-700'
                  }`}>
                    {idx < currentStep ? <Check className="h-4 w-4" /> : idx + 1}
                  </div>
                  <span className="text-xs font-medium hidden sm:inline">{step.title}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${idx < currentStep ? 'bg-cyan-500' : 'bg-slate-700'}`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <ScrollArea className="max-h-[calc(90vh-280px)]">
          {/* Step 1: Basic Info */}
          {currentStep === 0 && (
            <div className="space-y-4 pr-4">
              <div>
                <Label className="text-slate-300">Client Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter client name"
                  className="mt-1.5 bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-300">Industry *</Label>
                  <Input
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="e.g., Financial Services"
                    className="mt-1.5 bg-[#151d2e] border-[#2a3548] text-white"
                  />
                </div>

                <div>
                  <Label className="text-slate-300">Client Type</Label>
                  <Select value={formData.client_type} onValueChange={(value) => setFormData({ ...formData, client_type: value })}>
                    <SelectTrigger className="mt-1.5 bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="enterprise" className="text-white">Enterprise</SelectItem>
                      <SelectItem value="mid_market" className="text-white">Mid-Market</SelectItem>
                      <SelectItem value="small_business" className="text-white">Small Business</SelectItem>
                      <SelectItem value="government" className="text-white">Government</SelectItem>
                      <SelectItem value="non_profit" className="text-white">Non-Profit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-slate-300">Primary Contact</Label>
                <Input
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  placeholder="Contact person name"
                  className="mt-1.5 bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>

              <div>
                <Label className="text-slate-300">Contact Email</Label>
                <Input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="email@example.com"
                  className="mt-1.5 bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>

              <div>
                <Label className="text-slate-300">Business Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of client's business, operations, and key concerns..."
                  className="mt-1.5 bg-[#151d2e] border-[#2a3548] text-white h-24"
                />
              </div>
            </div>
          )}

          {/* Step 2: AI Analysis */}
          {currentStep === 1 && (
            <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
              <CardContent className="p-6 text-center">
                <Brain className="h-16 w-16 text-violet-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">AI Analysis Ready</h3>
                <p className="text-sm text-slate-400 mb-6">
                  Our AI will analyze the client profile and provide initial risk assessment, 
                  compliance baseline, and onboarding recommendations.
                </p>
                <Button 
                  onClick={runAIAnalysis}
                  disabled={loading}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Run AI Analysis
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Assessment Results */}
          {currentStep === 2 && aiAnalysis && (
            <div className="space-y-4 pr-4">
              <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">AI Assessment Results</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Risk Score</div>
                      <div className="text-2xl font-bold text-white">{aiAnalysis.risk_score}</div>
                      <Progress value={aiAnalysis.risk_score} className="mt-2 h-1.5" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Compliance Baseline</div>
                      <div className="text-2xl font-bold text-white">{aiAnalysis.compliance_baseline}</div>
                      <Progress value={aiAnalysis.compliance_baseline} className="mt-2 h-1.5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#151d2e] border-[#2a3548]">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Regulatory Frameworks</h4>
                  <div className="flex flex-wrap gap-2">
                    {aiAnalysis.regulatory_frameworks?.map((framework, idx) => (
                      <Badge key={idx} className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                        {framework}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#151d2e] border-[#2a3548]">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Priority Focus Areas</h4>
                  <div className="space-y-2">
                    {aiAnalysis.priority_areas?.map((area, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold flex-shrink-0">
                          {idx + 1}
                        </div>
                        <span className="text-slate-300">{area}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#151d2e] border-[#2a3548]">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Industry Risks</h4>
                  <div className="space-y-1">
                    {aiAnalysis.industry_risks?.map((risk, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs p-2 rounded bg-rose-500/10 border border-rose-500/20">
                        <span className="text-slate-300">{risk}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 3 && (
            <div className="space-y-4 pr-4">
              <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
                <CardContent className="p-4">
                  <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white text-center mb-2">Ready to Onboard</h3>
                  <p className="text-sm text-slate-400 text-center">
                    Review the information below and click Complete to create the client profile.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#151d2e] border-[#2a3548]">
                <CardContent className="p-4 space-y-3">
                  <div>
                    <div className="text-xs text-slate-500">Client Name</div>
                    <div className="text-sm text-white font-semibold">{formData.name}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-slate-500">Industry</div>
                      <div className="text-sm text-white">{formData.industry}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Type</div>
                      <div className="text-sm text-white">{formData.client_type.replace(/_/g, ' ')}</div>
                    </div>
                  </div>
                  {assessmentData && (
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#2a3548]">
                      <div>
                        <div className="text-xs text-slate-500">Risk Score</div>
                        <Badge className="mt-1 bg-rose-500/20 text-rose-400">{assessmentData.risk_score}</Badge>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Compliance</div>
                        <Badge className="mt-1 bg-blue-500/20 text-blue-400">{assessmentData.compliance_score}</Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </ScrollArea>

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-4 border-t border-[#2a3548]">
          <Button
            variant="outline"
            onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : onOpenChange(false)}
            disabled={loading || currentStep === 1}
            className="border-[#2a3548] text-slate-400 hover:bg-[#2a3548] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            onClick={() => {
              if (currentStep === 0) setCurrentStep(1);
              else if (currentStep === 3) handleComplete();
            }}
            disabled={loading || (currentStep === 0 && (!formData.name || !formData.industry)) || currentStep === 1 || currentStep === 2}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            {currentStep === 3 ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Complete Onboarding
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}