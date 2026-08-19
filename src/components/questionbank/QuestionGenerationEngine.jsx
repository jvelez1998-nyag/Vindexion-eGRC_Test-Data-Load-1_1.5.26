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
import { ArrowRight, CheckCircle2, Circle, FileQuestion, Brain, Target, Shield, Sparkles, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const GENERATION_STEPS = [
  { id: 'framework', title: 'Select Framework', icon: FileQuestion },
  { id: 'params', title: 'Parameters', icon: Target },
  { id: 'generate', title: 'AI Generation', icon: Brain },
  { id: 'review', title: 'Review & Edit', icon: Shield }
];

const FRAMEWORKS = ['SOX', 'SOC2', 'ISO27001', 'PCI-DSS', 'HIPAA', 'NIST CSF', 'COBIT', 'GDPR', 'CCPA', 'DORA', 'EU AI Act', 'FFIEC'];

export default function QuestionGenerationEngine({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [generationData, setGenerationData] = useState({
    framework: '',
    category: '',
    difficulty: 'medium',
    num_questions: 5,
    question_type: 'multiple_choice',
    focus_areas: ''
  });
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  const updateData = (field, value) => {
    setGenerationData(prev => ({ ...prev, [field]: value }));
  };

  const generateQuestions = async () => {
    setAiLoading(true);
    try {
      const prompt = `You are an exam preparation expert. Generate ${generationData.num_questions} high-quality ${generationData.difficulty} level questions for ${generationData.framework}.

${generationData.category ? `Category: ${generationData.category}` : ''}
${generationData.focus_areas ? `Focus areas: ${generationData.focus_areas}` : ''}

Requirements:
- Question type: ${generationData.question_type}
- Each question must have 4 options (A-D) for multiple choice
- Clear explanations for correct answers
- Relevant regulatory references
- Appropriate difficulty level

Generate comprehensive, realistic exam questions that test deep understanding.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correct_answer: { type: "string" },
                  explanation: { type: "string" },
                  reference: { type: "string" },
                  difficulty: { type: "string" },
                  category: { type: "string" }
                }
              }
            }
          }
        }
      });

      const questions = (response.questions || []).map(q => ({
        ...q,
        framework: generationData.framework,
        question_type: generationData.question_type,
        status: 'draft'
      }));

      setGeneratedQuestions(questions);
      toast.success(`${questions.length} questions generated`);
    } catch (error) {
      toast.error("Failed to generate questions");
    } finally {
      setAiLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return generationData.framework;
      case 1: return generationData.num_questions > 0;
      case 2: return generatedQuestions.length > 0;
      case 3: return true;
      default: return true;
    }
  };

  const handleNext = () => {
    if (currentStep < GENERATION_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      if (currentStep === 1) {
        generateQuestions();
      }
    } else {
      generatedQuestions.forEach(q => onComplete?.(q));
    }
  };

  const progress = ((currentStep + 1) / GENERATION_STEPS.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white">Generation Progress</h3>
            <span className="text-sm text-slate-400">{currentStep + 1} of {GENERATION_STEPS.length}</span>
          </div>
          <Progress value={progress} className="h-2 mb-4" />
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {GENERATION_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isComplete = idx < currentStep;
              const isCurrent = idx === currentStep;
              
              return (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <div 
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      isCurrent ? 'bg-indigo-500/20 border border-indigo-500/40' :
                      isComplete ? 'bg-indigo-500/10 border border-indigo-500/20' :
                      'bg-[#151d2e] border border-[#2a3548]'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                    ) : isCurrent ? (
                      <Icon className="h-4 w-4 text-indigo-400" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-600" />
                    )}
                    <span className={`text-xs whitespace-nowrap ${
                      isCurrent ? 'text-indigo-400 font-medium' :
                      isComplete ? 'text-indigo-400' :
                      'text-slate-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {idx < GENERATION_STEPS.length - 1 && (
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
          <CardTitle className="text-lg">{GENERATION_STEPS[currentStep].title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {/* Step 0: Framework */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Framework *</Label>
                  <Select value={generationData.framework} onValueChange={(v) => updateData('framework', v)}>
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
                <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
                  <p className="text-xs text-indigo-400 mb-2 font-medium">ℹ️ Framework Selection</p>
                  <p className="text-xs text-slate-400">
                    AI will generate exam-quality questions specific to this framework's requirements and best practices.
                  </p>
                </div>
              </div>
            )}

            {/* Step 1: Parameters */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Number of Questions *</Label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={generationData.num_questions}
                    onChange={(e) => updateData('num_questions', parseInt(e.target.value))}
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Difficulty Level</Label>
                  <Select value={generationData.difficulty} onValueChange={(v) => updateData('difficulty', v)}>
                    <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="easy" className="text-white">Easy</SelectItem>
                      <SelectItem value="medium" className="text-white">Medium</SelectItem>
                      <SelectItem value="hard" className="text-white">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Question Type</Label>
                  <Select value={generationData.question_type} onValueChange={(v) => updateData('question_type', v)}>
                    <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="multiple_choice" className="text-white">Multiple Choice</SelectItem>
                      <SelectItem value="true_false" className="text-white">True/False</SelectItem>
                      <SelectItem value="scenario" className="text-white">Scenario-Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Category (Optional)</Label>
                  <Input
                    value={generationData.category}
                    onChange={(e) => updateData('category', e.target.value)}
                    placeholder="e.g., Access Controls, Data Protection"
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Focus Areas (Optional)</Label>
                  <Textarea
                    value={generationData.focus_areas}
                    onChange={(e) => updateData('focus_areas', e.target.value)}
                    placeholder="Specify topics or areas to focus on..."
                    rows={4}
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Generation */}
            {currentStep === 2 && (
              <div className="space-y-4">
                {aiLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-indigo-400 mx-auto mb-4" />
                    <p className="text-white font-medium">Generating questions...</p>
                    <p className="text-slate-400 text-sm mt-2">Creating {generationData.num_questions} {generationData.difficulty} questions</p>
                  </div>
                ) : generatedQuestions.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-white">Generated Questions</h4>
                      <Badge className="bg-indigo-500/20 text-indigo-400">
                        {generatedQuestions.length} questions
                      </Badge>
                    </div>
                    {generatedQuestions.map((q, idx) => (
                      <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1">
                              <p className="text-sm text-white font-medium mb-2">Q{idx + 1}: {q.question}</p>
                              <div className="space-y-1 mb-2">
                                {q.options?.map((opt, i) => (
                                  <div key={i} className={`text-xs p-2 rounded ${opt.startsWith(q.correct_answer) ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400'}`}>
                                    {opt}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <Badge className={
                              q.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400' :
                              q.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-rose-500/20 text-rose-400'
                            }>
                              {q.difficulty}
                            </Badge>
                          </div>
                          {q.explanation && (
                            <div className="text-xs text-slate-400 mt-2 pt-2 border-t border-[#2a3548]">
                              <span className="text-slate-500">Explanation:</span> {q.explanation}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : null}
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <Card className="bg-[#151d2e] border-[#2a3548]">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-medium text-white mb-3">Generation Summary</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 rounded bg-[#0f1623]">
                        <span className="text-xs text-slate-400">Framework</span>
                        <Badge className="bg-indigo-500/20 text-indigo-400">{generationData.framework}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-[#0f1623]">
                        <span className="text-xs text-slate-400">Questions Generated</span>
                        <span className="text-xs text-white">{generatedQuestions.length}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-[#0f1623]">
                        <span className="text-xs text-slate-400">Difficulty</span>
                        <Badge className="bg-amber-500/20 text-amber-400 capitalize">{generationData.difficulty}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-[#0f1623]">
                        <span className="text-xs text-slate-400">Type</span>
                        <span className="text-xs text-white capitalize">{generationData.question_type?.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                  <p className="text-xs text-emerald-400 mb-2 font-medium">✓ Ready to Add</p>
                  <p className="text-xs text-slate-400">
                    Click "Add to Question Bank" to save all {generatedQuestions.length} questions.
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
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          {currentStep === GENERATION_STEPS.length - 1 ? 'Add to Question Bank' : 'Next Step'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}