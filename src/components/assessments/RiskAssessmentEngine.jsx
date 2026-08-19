import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight, CheckCircle2, Circle, Sparkles, Loader2, Target, Shield } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const ASSESSMENT_STEPS = [
  { id: 'context', title: 'Context & Scope', icon: Target },
  { id: 'identification', title: 'Risk Identification', icon: Shield },
  { id: 'analysis', title: 'Risk Analysis', icon: Sparkles },
  { id: 'evaluation', title: 'Risk Evaluation', icon: CheckCircle2 },
  { id: 'treatment', title: 'Treatment Plan', icon: ArrowRight }
];

export default function RiskAssessmentEngine({ onComplete, initialData = null }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [assessmentData, setAssessmentData] = useState({
    title: initialData?.title || '',
    assessment_type: initialData?.assessment_type || '',
    risk_category: initialData?.risk_category || '',
    description: initialData?.description || '',
    business_process: initialData?.business_process || '',
    asset_affected: initialData?.asset_affected || '',
    inherent_likelihood: initialData?.inherent_likelihood || null,
    inherent_impact: initialData?.inherent_impact || null,
    control_effectiveness: initialData?.control_effectiveness || null,
    residual_likelihood: initialData?.residual_likelihood || null,
    residual_impact: initialData?.residual_impact || null,
    risk_treatment: initialData?.risk_treatment || '',
    treatment_plan: initialData?.treatment_plan || '',
    lifecycle_status: 'draft',
    owner: initialData?.owner || '',
    notes: initialData?.notes || ''
  });
  const [useAI, setUseAI] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const updateData = (field, value) => {
    setAssessmentData(prev => ({ ...prev, [field]: value }));
  };

  const generateAIRecommendations = async () => {
    setAiLoading(true);
    try {
      const prompt = `You are a risk management expert. Based on this risk context:

Title: ${assessmentData.title}
Type: ${assessmentData.assessment_type}
Category: ${assessmentData.risk_category}
Description: ${assessmentData.description}
Business Process: ${assessmentData.business_process}
Asset: ${assessmentData.asset_affected}

Provide:
1. Recommended inherent likelihood and impact (1-5 scale)
2. Suggested control effectiveness rating (1-5)
3. Expected residual likelihood and impact after controls
4. Treatment recommendation (accept/mitigate/transfer/avoid)
5. Specific treatment actions`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            inherent_likelihood: { type: "number" },
            inherent_impact: { type: "number" },
            control_effectiveness: { type: "number" },
            residual_likelihood: { type: "number" },
            residual_impact: { type: "number" },
            risk_treatment: { type: "string" },
            treatment_plan: { type: "string" },
            rationale: { type: "string" }
          }
        }
      });

      setAssessmentData(prev => ({
        ...prev,
        ...response,
        notes: (prev.notes ? prev.notes + '\n\n' : '') + 'AI Rationale: ' + response.rationale
      }));
      
      toast.success("AI recommendations applied");
    } catch (error) {
      toast.error("Failed to generate recommendations");
    } finally {
      setAiLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return assessmentData.title && assessmentData.assessment_type && assessmentData.risk_category;
      case 1:
        return assessmentData.description;
      case 2:
        return assessmentData.inherent_likelihood && assessmentData.inherent_impact;
      case 3:
        return assessmentData.control_effectiveness && assessmentData.residual_likelihood && assessmentData.residual_impact;
      case 4:
        return assessmentData.risk_treatment;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < ASSESSMENT_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.(assessmentData);
    }
  };

  const inherentScore = (assessmentData.inherent_likelihood || 0) * (assessmentData.inherent_impact || 0);
  const residualScore = (assessmentData.residual_likelihood || 0) * (assessmentData.residual_impact || 0);

  const progress = ((currentStep + 1) / ASSESSMENT_STEPS.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white">Assessment Progress</h3>
            <span className="text-sm text-slate-400">{currentStep + 1} of {ASSESSMENT_STEPS.length}</span>
          </div>
          <Progress value={progress} className="h-2 mb-4" />
          <div className="flex items-center gap-2 overflow-x-auto">
            {ASSESSMENT_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isComplete = idx < currentStep;
              const isCurrent = idx === currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div 
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      isCurrent ? 'bg-indigo-500/20 border border-indigo-500/40' :
                      isComplete ? 'bg-emerald-500/10 border border-emerald-500/20' :
                      'bg-[#151d2e] border border-[#2a3548]'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <Icon className="h-4 w-4 text-indigo-400" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-600" />
                    )}
                    <span className={`text-xs whitespace-nowrap ${
                      isCurrent ? 'text-indigo-400 font-medium' :
                      isComplete ? 'text-emerald-400' :
                      'text-slate-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {idx < ASSESSMENT_STEPS.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-slate-600 mx-1 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {ASSESSMENT_STEPS[currentStep].title}
            </CardTitle>
            {currentStep >= 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={generateAIRecommendations}
                disabled={aiLoading}
                className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
              >
                {aiLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                AI Assist
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {/* Step 0: Context */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Assessment Title *</Label>
                  <Input
                    value={assessmentData.title}
                    onChange={(e) => updateData('title', e.target.value)}
                    placeholder="e.g., Data Breach Risk Assessment"
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Assessment Type *</Label>
                    <Select value={assessmentData.assessment_type} onValueChange={(v) => updateData('assessment_type', v)}>
                      <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        <SelectItem value="it" className="text-white">IT Risk</SelectItem>
                        <SelectItem value="operational" className="text-white">Operational</SelectItem>
                        <SelectItem value="security" className="text-white">Security</SelectItem>
                        <SelectItem value="financial" className="text-white">Financial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Risk Category *</Label>
                    <Select value={assessmentData.risk_category} onValueChange={(v) => updateData('risk_category', v)}>
                      <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        <SelectItem value="strategic" className="text-white">Strategic</SelectItem>
                        <SelectItem value="operational" className="text-white">Operational</SelectItem>
                        <SelectItem value="financial" className="text-white">Financial</SelectItem>
                        <SelectItem value="compliance" className="text-white">Compliance</SelectItem>
                        <SelectItem value="technology" className="text-white">Technology</SelectItem>
                        <SelectItem value="cyber" className="text-white">Cyber</SelectItem>
                        <SelectItem value="third_party" className="text-white">Third Party</SelectItem>
                        <SelectItem value="reputational" className="text-white">Reputational</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Business Process</Label>
                    <Input
                      value={assessmentData.business_process}
                      onChange={(e) => updateData('business_process', e.target.value)}
                      placeholder="e.g., Payment Processing"
                      className="bg-[#151d2e] border-[#2a3548] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Asset Affected</Label>
                    <Input
                      value={assessmentData.asset_affected}
                      onChange={(e) => updateData('asset_affected', e.target.value)}
                      placeholder="e.g., Customer Database"
                      className="bg-[#151d2e] border-[#2a3548] text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Identification */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Risk Description *</Label>
                  <Textarea
                    value={assessmentData.description}
                    onChange={(e) => updateData('description', e.target.value)}
                    placeholder="Describe the risk in detail..."
                    rows={8}
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                  />
                </div>
                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                  <p className="text-xs text-blue-400 mb-2 font-medium">💡 Pro Tip:</p>
                  <p className="text-xs text-slate-400">Include what could go wrong, causes, and potential consequences</p>
                </div>
              </div>
            )}

            {/* Step 2: Analysis */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                  <h4 className="text-sm font-medium text-white mb-4">Inherent Risk (Before Controls)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Likelihood (1-5) *</Label>
                      <Select value={assessmentData.inherent_likelihood?.toString() || ""} onValueChange={(v) => updateData('inherent_likelihood', parseInt(v))}>
                        <SelectTrigger className="bg-[#1a2332] border-[#2a3548] text-white">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                          {[1,2,3,4,5].map(n => (
                            <SelectItem key={n} value={n.toString()} className="text-white">
                              {n} - {["Rare","Unlikely","Possible","Likely","Almost Certain"][n-1]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Impact (1-5) *</Label>
                      <Select value={assessmentData.inherent_impact?.toString() || ""} onValueChange={(v) => updateData('inherent_impact', parseInt(v))}>
                        <SelectTrigger className="bg-[#1a2332] border-[#2a3548] text-white">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                          {[1,2,3,4,5].map(n => (
                            <SelectItem key={n} value={n.toString()} className="text-white">
                              {n} - {["Negligible","Minor","Moderate","Major","Severe"][n-1]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {inherentScore > 0 && (
                    <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded">
                      <div className="text-sm text-white">
                        Inherent Risk Score: <span className="font-bold">{inherentScore}</span>
                        <Badge className={`ml-2 ${
                          inherentScore >= 16 ? 'bg-rose-500' :
                          inherentScore >= 9 ? 'bg-amber-500' :
                          inherentScore >= 4 ? 'bg-yellow-500' : 'bg-emerald-500'
                        } text-white border-0`}>
                          {inherentScore >= 16 ? 'Critical' : inherentScore >= 9 ? 'High' : inherentScore >= 4 ? 'Medium' : 'Low'}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Evaluation */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Control Effectiveness (1-5) *</Label>
                  <Select value={assessmentData.control_effectiveness?.toString() || ""} onValueChange={(v) => updateData('control_effectiveness', parseInt(v))}>
                    <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      {[1,2,3,4,5].map(n => (
                        <SelectItem key={n} value={n.toString()} className="text-white">
                          {n} - {["Very Low","Low","Moderate","High","Very High"][n-1]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                  <h4 className="text-sm font-medium text-white mb-4">Residual Risk (After Controls)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Likelihood (1-5) *</Label>
                      <Select value={assessmentData.residual_likelihood?.toString() || ""} onValueChange={(v) => updateData('residual_likelihood', parseInt(v))}>
                        <SelectTrigger className="bg-[#1a2332] border-[#2a3548] text-white">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                          {[1,2,3,4,5].map(n => (
                            <SelectItem key={n} value={n.toString()} className="text-white">
                              {n} - {["Rare","Unlikely","Possible","Likely","Almost Certain"][n-1]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Impact (1-5) *</Label>
                      <Select value={assessmentData.residual_impact?.toString() || ""} onValueChange={(v) => updateData('residual_impact', parseInt(v))}>
                        <SelectTrigger className="bg-[#1a2332] border-[#2a3548] text-white">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                          {[1,2,3,4,5].map(n => (
                            <SelectItem key={n} value={n.toString()} className="text-white">
                              {n} - {["Negligible","Minor","Moderate","Major","Severe"][n-1]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {residualScore > 0 && (
                    <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded">
                      <div className="text-sm text-white">
                        Residual Risk Score: <span className="font-bold">{residualScore}</span>
                        <Badge className={`ml-2 ${
                          residualScore >= 16 ? 'bg-rose-500' :
                          residualScore >= 9 ? 'bg-amber-500' :
                          residualScore >= 4 ? 'bg-yellow-500' : 'bg-emerald-500'
                        } text-white border-0`}>
                          {residualScore >= 16 ? 'Critical' : residualScore >= 9 ? 'High' : residualScore >= 4 ? 'Medium' : 'Low'}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Treatment */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Risk Treatment Strategy *</Label>
                  <Select value={assessmentData.risk_treatment} onValueChange={(v) => updateData('risk_treatment', v)}>
                    <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue placeholder="Select strategy" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="accept" className="text-white">Accept - Acknowledge and monitor</SelectItem>
                      <SelectItem value="mitigate" className="text-white">Mitigate - Reduce likelihood/impact</SelectItem>
                      <SelectItem value="transfer" className="text-white">Transfer - Insurance or third party</SelectItem>
                      <SelectItem value="avoid" className="text-white">Avoid - Eliminate the activity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Treatment Plan</Label>
                  <Textarea
                    value={assessmentData.treatment_plan}
                    onChange={(e) => updateData('treatment_plan', e.target.value)}
                    placeholder="Describe specific actions to treat this risk..."
                    rows={6}
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Risk Owner</Label>
                  <Input
                    value={assessmentData.owner}
                    onChange={(e) => updateData('owner', e.target.value)}
                    placeholder="email@company.com"
                    type="email"
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                  />
                </div>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="border-[#2a3548] text-white hover:bg-[#2a3548]"
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          {currentStep === ASSESSMENT_STEPS.length - 1 ? 'Complete Assessment' : 'Next Step'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}