import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Circle, FileCheck, Target, Brain, Shield, FileText, Sparkles, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const ASSESSMENT_STEPS = [
  { id: 'framework', title: 'Select Framework', icon: FileCheck },
  { id: 'requirement', title: 'Define Requirement', icon: FileText },
  { id: 'assessment', title: 'AI Assessment', icon: Brain },
  { id: 'implementation', title: 'Implementation Plan', icon: Target },
  { id: 'validation', title: 'Validation', icon: Shield }
];

const FRAMEWORKS = ['SOX', 'SOC2', 'ISO27001', 'PCI-DSS', 'HIPAA', 'NIST CSF', 'COBIT', 'GDPR', 'CCPA', 'DORA', 'EU AI Act', 'FFIEC'];

export default function ComplianceAssessmentEngine({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [assessmentData, setAssessmentData] = useState({
    framework: '',
    requirement: '',
    requirement_id: '',
    description: '',
    status: 'not_started',
    priority: 'medium',
    ai_analysis: null,
    implementation_steps: [],
    evidence_needed: [],
    control_mappings: []
  });
  const [aiLoading, setAiLoading] = useState(false);

  const updateData = (field, value) => {
    setAssessmentData(prev => ({ ...prev, [field]: value }));
  };

  const generateAIAssessment = async () => {
    setAiLoading(true);
    try {
      const prompt = `You are a compliance expert. Analyze this requirement:

Framework: ${assessmentData.framework}
Requirement: ${assessmentData.requirement}
Description: ${assessmentData.description || 'N/A'}

Provide:
1. Detailed requirement analysis (what it means, why it matters)
2. Implementation steps (5-7 specific actions)
3. Evidence needed (what documentation/proof is required)
4. Control mappings (suggest relevant controls)
5. Timeline estimate (in weeks)
6. Resources needed (team, tools, budget estimate)
7. Risk if non-compliant

Format in clear markdown.`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      
      setAssessmentData(prev => ({ ...prev, ai_analysis: response }));
      toast.success("AI assessment generated");
    } catch (error) {
      toast.error("Failed to generate assessment");
    } finally {
      setAiLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return assessmentData.framework;
      case 1: return assessmentData.requirement;
      case 2: return assessmentData.ai_analysis;
      case 3: return true;
      case 4: return true;
      default: return true;
    }
  };

  const handleNext = () => {
    if (currentStep < ASSESSMENT_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      if (currentStep === 1) {
        generateAIAssessment();
      }
    } else {
      onComplete?.(assessmentData);
    }
  };

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
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {ASSESSMENT_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isComplete = idx < currentStep;
              const isCurrent = idx === currentStep;
              
              return (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <div 
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      isCurrent ? 'bg-emerald-500/20 border border-emerald-500/40' :
                      isComplete ? 'bg-emerald-500/10 border border-emerald-500/20' :
                      'bg-[#151d2e] border border-[#2a3548]'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <Icon className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-600" />
                    )}
                    <span className={`text-xs whitespace-nowrap ${
                      isCurrent ? 'text-emerald-400 font-medium' :
                      isComplete ? 'text-emerald-400' :
                      'text-slate-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {idx < ASSESSMENT_STEPS.length - 1 && (
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
          <CardTitle className="text-lg">{ASSESSMENT_STEPS[currentStep].title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {/* Step 0: Framework */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Compliance Framework *</Label>
                  <Select value={assessmentData.framework} onValueChange={(v) => updateData('framework', v)}>
                    <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue placeholder="Select framework" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      {FRAMEWORKS.map(fw => (
                        <SelectItem key={fw} value={fw} className="text-white">{fw}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                  <p className="text-xs text-emerald-400 mb-2 font-medium">ℹ️ Framework Selection</p>
                  <p className="text-xs text-slate-400">
                    Choose the regulatory framework or standard that applies to this requirement. The AI will analyze specific requirements within this framework.
                  </p>
                </div>
              </div>
            )}

            {/* Step 1: Requirement */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Requirement ID</Label>
                  <Input
                    value={assessmentData.requirement_id}
                    onChange={(e) => updateData('requirement_id', e.target.value)}
                    placeholder="e.g., SOX-404, ISO-A.8.1.1"
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Requirement Title *</Label>
                  <Input
                    value={assessmentData.requirement}
                    onChange={(e) => updateData('requirement', e.target.value)}
                    placeholder="Enter the requirement title"
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Description</Label>
                  <Textarea
                    value={assessmentData.description}
                    onChange={(e) => updateData('description', e.target.value)}
                    placeholder="Provide additional context about this requirement..."
                    rows={6}
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Priority</Label>
                    <Select value={assessmentData.priority} onValueChange={(v) => updateData('priority', v)}>
                      <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        <SelectItem value="low" className="text-white">Low</SelectItem>
                        <SelectItem value="medium" className="text-white">Medium</SelectItem>
                        <SelectItem value="high" className="text-white">High</SelectItem>
                        <SelectItem value="critical" className="text-white">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Status</Label>
                    <Select value={assessmentData.status} onValueChange={(v) => updateData('status', v)}>
                      <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        <SelectItem value="not_started" className="text-white">Not Started</SelectItem>
                        <SelectItem value="in_progress" className="text-white">In Progress</SelectItem>
                        <SelectItem value="implemented" className="text-white">Implemented</SelectItem>
                        <SelectItem value="verified" className="text-white">Verified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: AI Assessment */}
            {currentStep === 2 && (
              <div className="space-y-4">
                {aiLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-emerald-400 mx-auto mb-4" />
                    <p className="text-white font-medium">Analyzing requirement...</p>
                    <p className="text-slate-400 text-sm mt-2">AI is assessing {assessmentData.framework} compliance</p>
                  </div>
                ) : assessmentData.ai_analysis ? (
                  <div className="bg-[#151d2e] border border-[#2a3548] rounded-xl p-6">
                    <ReactMarkdown 
                      className="prose prose-sm prose-invert max-w-none text-slate-300"
                      components={{
                        h1: ({children}) => <h1 className="text-xl font-bold text-white mb-4 mt-0">{children}</h1>,
                        h2: ({children}) => <h2 className="text-lg font-semibold text-white mb-3 mt-6 first:mt-0">{children}</h2>,
                        h3: ({children}) => <h3 className="text-base font-medium text-white mb-2 mt-4">{children}</h3>,
                        p: ({children}) => <p className="text-slate-300 mb-3 leading-relaxed">{children}</p>,
                        ul: ({children}) => <ul className="list-disc ml-5 mb-4 space-y-1">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal ml-5 mb-4 space-y-1">{children}</ol>,
                        li: ({children}) => <li className="text-slate-300">{children}</li>,
                        strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                        blockquote: ({children}) => (
                          <blockquote className="border-l-4 border-emerald-500 pl-4 my-4 text-slate-400 italic">
                            {children}
                          </blockquote>
                        ),
                      }}
                    >
                      {assessmentData.ai_analysis}
                    </ReactMarkdown>
                  </div>
                ) : null}
              </div>
            )}

            {/* Step 3: Implementation */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                  <p className="text-xs text-blue-400 mb-2 font-medium">💡 Implementation Planning</p>
                  <p className="text-xs text-slate-400">
                    Review the AI-generated assessment and prepare your implementation plan. You can refine this after completion.
                  </p>
                </div>
                {assessmentData.ai_analysis && (
                  <div className="bg-[#151d2e] border border-[#2a3548] rounded-lg p-4">
                    <h4 className="text-sm font-medium text-white mb-2">Key Takeaways</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>AI analysis provides comprehensive breakdown</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>Implementation steps identified</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>Evidence requirements documented</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Validation */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <Card className="bg-[#151d2e] border-[#2a3548]">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-medium text-white mb-3">Assessment Summary</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 rounded bg-[#0f1623]">
                        <span className="text-xs text-slate-400">Framework</span>
                        <Badge className="bg-indigo-500/20 text-indigo-400">{assessmentData.framework}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-[#0f1623]">
                        <span className="text-xs text-slate-400">Requirement</span>
                        <span className="text-xs text-white truncate max-w-[200px]">{assessmentData.requirement}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-[#0f1623]">
                        <span className="text-xs text-slate-400">Priority</span>
                        <Badge className={
                          assessmentData.priority === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                          assessmentData.priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-blue-500/20 text-blue-400'
                        }>
                          {assessmentData.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-[#0f1623]">
                        <span className="text-xs text-slate-400">Status</span>
                        <Badge className="bg-emerald-500/20 text-emerald-400 capitalize">
                          {assessmentData.status?.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                  <p className="text-xs text-emerald-400 mb-2 font-medium">✓ Ready to Complete</p>
                  <p className="text-xs text-slate-400">
                    Click "Complete Assessment" to save this compliance requirement with the AI-generated analysis.
                  </p>
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
          disabled={!canProceed() || (currentStep === 2 && aiLoading)}
          className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
        >
          {currentStep === ASSESSMENT_STEPS.length - 1 ? 'Complete Assessment' : 'Next Step'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}