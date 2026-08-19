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
import { ArrowRight, CheckCircle2, Circle, Shield, Target, Settings, Zap, Sparkles, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const CONTROL_STEPS = [
  { id: 'define', title: 'Define Control', icon: Shield },
  { id: 'classify', title: 'Classify', icon: Target },
  { id: 'design', title: 'Design Details', icon: Settings },
  { id: 'effectiveness', title: 'Effectiveness Criteria', icon: CheckCircle2 },
  { id: 'implement', title: 'Implementation Plan', icon: Zap }
];

export default function ControlDesignEngine({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [controlData, setControlData] = useState({
    name: '',
    description: '',
    domain: '',
    category: 'preventive',
    status: 'planned',
    control_objective: '',
    control_procedures: '',
    owner: '',
    implementation_date: ''
  });
  const [aiLoading, setAiLoading] = useState(false);

  const updateData = (field, value) => {
    setControlData(prev => ({ ...prev, [field]: value }));
  };

  const generateAIGuidance = async () => {
    setAiLoading(true);
    try {
      const prompt = `You are a control design expert. Provide guidance for this control:

Name: ${controlData.name}
Domain: ${controlData.domain}
Type: ${controlData.type}
Description: ${controlData.description}

Provide:
1. Detailed control objective
2. Step-by-step control procedure
3. Effectiveness criteria
4. Testing procedure recommendations
5. Best practices for this control type`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            control_objective: { type: "string" },
            control_procedures: { type: "string" },
            best_practices: { type: "array", items: { type: "string" } }
          }
        }
      });

      setControlData(prev => ({
        ...prev,
        control_objective: response.control_objective,
        control_procedures: response.control_procedures
      }));

      toast.success("AI guidance applied");
    } catch (error) {
      toast.error("Failed to generate guidance");
    } finally {
      setAiLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return controlData.name && controlData.description;
      case 1: return controlData.domain;
      case 2: return controlData.control_objective && controlData.control_procedures;
      case 3: return true;
      case 4: return controlData.owner;
      default: return true;
    }
  };

  const handleNext = () => {
    if (currentStep < CONTROL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.(controlData);
    }
  };

  const progress = ((currentStep + 1) / CONTROL_STEPS.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white">Control Design Progress</h3>
            <span className="text-sm text-slate-400">{currentStep + 1} of {CONTROL_STEPS.length}</span>
          </div>
          <Progress value={progress} className="h-2 mb-4" />
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {CONTROL_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isComplete = idx < currentStep;
              const isCurrent = idx === currentStep;
              
              return (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <div 
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      isCurrent ? 'bg-blue-500/20 border border-blue-500/40' :
                      isComplete ? 'bg-emerald-500/10 border border-emerald-500/20' :
                      'bg-[#151d2e] border border-[#2a3548]'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <Icon className="h-4 w-4 text-blue-400" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-600" />
                    )}
                    <span className={`text-xs whitespace-nowrap ${
                      isCurrent ? 'text-blue-400 font-medium' :
                      isComplete ? 'text-emerald-400' :
                      'text-slate-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {idx < CONTROL_STEPS.length - 1 && (
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
            <CardTitle className="text-lg">{CONTROL_STEPS[currentStep].title}</CardTitle>
            {currentStep >= 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={generateAIGuidance}
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
            {/* Step 0: Define */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Control Name *</Label>
                  <Input
                    value={controlData.name}
                    onChange={(e) => updateData('name', e.target.value)}
                    placeholder="e.g., User Access Review"
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Control Description *</Label>
                  <Textarea
                    value={controlData.description}
                    onChange={(e) => updateData('description', e.target.value)}
                    placeholder="Describe what this control does and why it's important..."
                    rows={6}
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                  />
                </div>
              </div>
            )}

            {/* Step 1: Classify */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Control Domain *</Label>
                  <Select value={controlData.domain} onValueChange={(v) => updateData('domain', v)}>
                    <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue placeholder="Select domain" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="access_control" className="text-white">Access Control</SelectItem>
                      <SelectItem value="change_management" className="text-white">Change Management</SelectItem>
                      <SelectItem value="data_protection" className="text-white">Data Protection</SelectItem>
                      <SelectItem value="incident_response" className="text-white">Incident Response</SelectItem>
                      <SelectItem value="business_continuity" className="text-white">Business Continuity</SelectItem>
                      <SelectItem value="compliance" className="text-white">Compliance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Control Category</Label>
                  <Select value={controlData.category} onValueChange={(v) => updateData('category', v)}>
                    <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="preventive" className="text-white">Preventive</SelectItem>
                      <SelectItem value="detective" className="text-white">Detective</SelectItem>
                      <SelectItem value="corrective" className="text-white">Corrective</SelectItem>
                      <SelectItem value="directive" className="text-white">Directive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 2: Design Details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Control Objective *</Label>
                  <Textarea
                    value={controlData.control_objective}
                    onChange={(e) => updateData('control_objective', e.target.value)}
                    placeholder="What is the specific objective of this control?"
                    rows={3}
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Control Procedures *</Label>
                  <Textarea
                    value={controlData.control_procedures}
                    onChange={(e) => updateData('control_procedures', e.target.value)}
                    placeholder="Detailed step-by-step procedure for executing this control..."
                    rows={8}
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-400 mb-3">Control Review</h4>
                  <div className="space-y-2 text-xs text-slate-400">
                    <div><strong className="text-white">Name:</strong> {controlData.name}</div>
                    <div><strong className="text-white">Domain:</strong> {controlData.domain?.replace(/_/g, ' ')}</div>
                    <div><strong className="text-white">Category:</strong> {controlData.category}</div>
                    <div><strong className="text-white">Objective:</strong> {controlData.control_objective}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Implementation */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Control Owner *</Label>
                  <Input
                    value={controlData.owner}
                    onChange={(e) => updateData('owner', e.target.value)}
                    placeholder="Who is responsible for this control?"
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Implementation Date</Label>
                  <Input
                    value={controlData.implementation_date}
                    onChange={(e) => updateData('implementation_date', e.target.value)}
                    type="date"
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                  />
                </div>
                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-400 mb-2">📋 Control Summary</h4>
                  <div className="space-y-2 text-xs text-slate-400">
                    <div><strong className="text-white">Name:</strong> {controlData.name}</div>
                    <div><strong className="text-white">Domain:</strong> {controlData.domain?.replace(/_/g, ' ')}</div>
                    <div><strong className="text-white">Category:</strong> {controlData.category}</div>
                    <div><strong className="text-white">Owner:</strong> {controlData.owner}</div>
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
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
        >
          {currentStep === CONTROL_STEPS.length - 1 ? 'Complete & Save' : 'Next Step'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}