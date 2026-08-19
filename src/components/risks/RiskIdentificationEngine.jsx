import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Circle, Target, AlertTriangle, Shield, Zap, Sparkles, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const RISK_STEPS = [
  { id: 'identify', title: 'Identify Risk', icon: Target },
  { id: 'classify', title: 'Classify', icon: Shield },
  { id: 'assess', title: 'Assess Impact', icon: AlertTriangle },
  { id: 'evaluate', title: 'Evaluate Likelihood', icon: Zap },
  { id: 'plan', title: 'Treatment Plan', icon: CheckCircle2 }
];

export default function RiskIdentificationEngine({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [riskData, setRiskData] = useState({
    title: '',
    category: '',
    description: '',
    root_cause: '',
    impact: null,
    likelihood: null,
    treatment_strategy: '',
    mitigation_plan: '',
    owner: '',
    due_date: '',
    status: 'identified'
  });
  const [aiLoading, setAiLoading] = useState(false);

  const updateData = (field, value) => {
    setRiskData(prev => ({ ...prev, [field]: value }));
  };

  const generateAIInsights = async () => {
    setAiLoading(true);
    try {
      const prompt = `You are a risk management expert. Analyze this risk:

Title: ${riskData.title}
Category: ${riskData.category}
Description: ${riskData.description}
Root Cause: ${riskData.root_cause}

Provide:
1. Recommended impact score (1-5) with justification
2. Recommended likelihood score (1-5) with justification
3. Treatment strategy (accept/mitigate/transfer/avoid)
4. Specific mitigation actions
5. Key risk indicators to monitor`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            impact: { type: "number" },
            impact_justification: { type: "string" },
            likelihood: { type: "number" },
            likelihood_justification: { type: "string" },
            treatment_strategy: { type: "string" },
            mitigation_actions: { type: "array", items: { type: "string" } },
            key_indicators: { type: "array", items: { type: "string" } }
          }
        }
      });

      setRiskData(prev => ({
        ...prev,
        impact: response.impact,
        likelihood: response.likelihood,
        treatment_strategy: response.treatment_strategy,
        mitigation_plan: response.mitigation_actions?.join('\n• ') || '',
        notes: `Impact: ${response.impact_justification}\n\nLikelihood: ${response.likelihood_justification}\n\nKRIs: ${response.key_indicators?.join(', ') || 'None'}`
      }));

      toast.success("AI insights applied");
    } catch (error) {
      toast.error("Failed to generate insights");
    } finally {
      setAiLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return riskData.title && riskData.description;
      case 1: return riskData.category;
      case 2: return riskData.impact;
      case 3: return riskData.likelihood;
      case 4: return riskData.treatment_strategy;
      default: return true;
    }
  };

  const handleNext = () => {
    if (currentStep < RISK_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.(riskData);
    }
  };

  const progress = ((currentStep + 1) / RISK_STEPS.length) * 100;
  const riskScore = (riskData.impact || 0) * (riskData.likelihood || 0);

  return (
    <div className="space-y-6">
      {/* Progress */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white">Risk Identification Progress</h3>
            <span className="text-sm text-slate-400">{currentStep + 1} of {RISK_STEPS.length}</span>
          </div>
          <Progress value={progress} className="h-2 mb-4" />
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {RISK_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isComplete = idx < currentStep;
              const isCurrent = idx === currentStep;
              
              return (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <div 
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      isCurrent ? 'bg-rose-500/20 border border-rose-500/40' :
                      isComplete ? 'bg-emerald-500/10 border border-emerald-500/20' :
                      'bg-[#151d2e] border border-[#2a3548]'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <Icon className="h-4 w-4 text-rose-400" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-600" />
                    )}
                    <span className={`text-xs whitespace-nowrap ${
                      isCurrent ? 'text-rose-400 font-medium' :
                      isComplete ? 'text-emerald-400' :
                      'text-slate-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {idx < RISK_STEPS.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-slate-600 mx-1" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Step */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{RISK_STEPS[currentStep].title}</CardTitle>
            {currentStep >= 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={generateAIInsights}
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
            {/* Step 0: Identify */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Risk Title *</Label>
                  <Input
                    value={riskData.title}
                    onChange={(e) => updateData('title', e.target.value)}
                    placeholder="e.g., Unauthorized Data Access"
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Risk Description *</Label>
                  <Textarea
                    value={riskData.description}
                    onChange={(e) => updateData('description', e.target.value)}
                    placeholder="Describe what could go wrong and its potential consequences..."
                    rows={6}
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Root Cause</Label>
                  <Textarea
                    value={riskData.root_cause}
                    onChange={(e) => updateData('root_cause', e.target.value)}
                    placeholder="What underlying factors could trigger this risk?"
                    rows={3}
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                  />
                </div>
              </div>
            )}

            {/* Step 1: Classify */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Risk Category *</Label>
                  <Select value={riskData.category} onValueChange={(v) => updateData('category', v)}>
                    <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="operational" className="text-white">Operational</SelectItem>
                      <SelectItem value="financial" className="text-white">Financial</SelectItem>
                      <SelectItem value="strategic" className="text-white">Strategic</SelectItem>
                      <SelectItem value="compliance" className="text-white">Compliance</SelectItem>
                      <SelectItem value="cybersecurity" className="text-white">Cybersecurity</SelectItem>
                      <SelectItem value="reputational" className="text-white">Reputational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                  <p className="text-xs text-blue-400 mb-2 font-medium">💡 Category Guide:</p>
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li>• <strong>Operational:</strong> Business process failures, service disruptions</li>
                    <li>• <strong>Financial:</strong> Revenue loss, cost overruns, fraud</li>
                    <li>• <strong>Strategic:</strong> Market changes, competitive threats</li>
                    <li>• <strong>Compliance:</strong> Regulatory violations, legal issues</li>
                    <li>• <strong>Cybersecurity:</strong> Data breaches, system compromises</li>
                    <li>• <strong>Reputational:</strong> Brand damage, customer trust</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 2: Impact */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Impact Level (1-5) *</Label>
                  <Select value={riskData.impact?.toString() || ""} onValueChange={(v) => updateData('impact', parseInt(v))}>
                    <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue placeholder="Select impact" />
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
                <div className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                  <h4 className="text-sm font-medium text-white mb-3">Impact Scale Guide</h4>
                  <div className="space-y-2 text-xs text-slate-400">
                    <div className="flex items-start gap-2">
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] px-1.5">1</Badge>
                      <span>Negligible - Minor inconvenience, no business impact</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] px-1.5">2</Badge>
                      <span>Minor - Limited business impact, easily recoverable</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-[10px] px-1.5">3</Badge>
                      <span>Moderate - Significant business impact, recovery required</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] px-1.5">4</Badge>
                      <span>Major - Severe business disruption, major resources needed</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[10px] px-1.5">5</Badge>
                      <span>Severe - Catastrophic impact, business survival threatened</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Likelihood */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Likelihood Level (1-5) *</Label>
                  <Select value={riskData.likelihood?.toString() || ""} onValueChange={(v) => updateData('likelihood', parseInt(v))}>
                    <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue placeholder="Select likelihood" />
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
                <div className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                  <h4 className="text-sm font-medium text-white mb-3">Likelihood Scale Guide</h4>
                  <div className="space-y-2 text-xs text-slate-400">
                    <div className="flex items-start gap-2">
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] px-1.5">1</Badge>
                      <span>Rare - May occur only in exceptional circumstances (&lt;10%)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] px-1.5">2</Badge>
                      <span>Unlikely - Could occur at some time (10-30%)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-[10px] px-1.5">3</Badge>
                      <span>Possible - Might occur at some time (30-60%)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] px-1.5">4</Badge>
                      <span>Likely - Will probably occur in most circumstances (60-90%)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[10px] px-1.5">5</Badge>
                      <span>Almost Certain - Expected to occur in most circumstances (&gt;90%)</span>
                    </div>
                  </div>
                </div>
                {riskScore > 0 && (
                  <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-sm text-slate-400 mb-2">Calculated Risk Score</div>
                        <div className="text-4xl font-bold text-white mb-2">{riskScore}</div>
                        <Badge className={`${
                          riskScore >= 16 ? 'bg-rose-500' :
                          riskScore >= 9 ? 'bg-amber-500' :
                          riskScore >= 4 ? 'bg-yellow-500' : 'bg-emerald-500'
                        } text-white border-0`}>
                          {riskScore >= 16 ? 'Critical' : riskScore >= 9 ? 'High' : riskScore >= 4 ? 'Medium' : 'Low'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Step 4: Treatment Plan */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Treatment Strategy *</Label>
                  <Select value={riskData.treatment_strategy} onValueChange={(v) => updateData('treatment_strategy', v)}>
                    <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue placeholder="Select strategy" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="accept" className="text-white">Accept - Acknowledge and monitor</SelectItem>
                      <SelectItem value="mitigate" className="text-white">Mitigate - Reduce likelihood/impact</SelectItem>
                      <SelectItem value="transfer" className="text-white">Transfer - Insurance or outsource</SelectItem>
                      <SelectItem value="avoid" className="text-white">Avoid - Eliminate the activity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Mitigation Plan</Label>
                  <Textarea
                    value={riskData.mitigation_plan}
                    onChange={(e) => updateData('mitigation_plan', e.target.value)}
                    placeholder="Detail specific actions to address this risk..."
                    rows={6}
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Risk Owner</Label>
                    <Input
                      value={riskData.owner}
                      onChange={(e) => updateData('owner', e.target.value)}
                      placeholder="email@company.com"
                      type="email"
                      className="bg-[#151d2e] border-[#2a3548] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Target Date</Label>
                    <Input
                      value={riskData.due_date}
                      onChange={(e) => updateData('due_date', e.target.value)}
                      type="date"
                      className="bg-[#151d2e] border-[#2a3548] text-white"
                    />
                  </div>
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
          className="bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700"
        >
          {currentStep === RISK_STEPS.length - 1 ? 'Complete & Save' : 'Next Step'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}