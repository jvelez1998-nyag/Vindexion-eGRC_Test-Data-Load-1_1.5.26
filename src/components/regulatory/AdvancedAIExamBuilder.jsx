import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, Sparkles, Wand2, Plus, Save, Loader2, 
  FileText, CheckCircle2, Target, AlertCircle, Zap
} from "lucide-react";
import { toast } from "sonner";

export default function AdvancedAIExamBuilder() {
  const [config, setConfig] = useState({
    examType: 'FFIEC',
    difficulty: 'intermediate',
    focusAreas: [],
    questionCount: 30,
    includeScenarios: true,
    customRequirements: ''
  });
  const [generatedExam, setGeneratedExam] = useState(null);
  const [loading, setLoading] = useState(false);

  const queryClient = useQueryClient();

  const examTypes = ['FFIEC', 'SOX', 'ISO 27001', 'NIST CSF', 'GDPR', 'PCI-DSS', 'HIPAA'];
  
  const focusAreasByType = {
    'FFIEC': ['IT Governance', 'Cybersecurity', 'Third-Party Risk', 'Business Continuity', 'Audit & Compliance'],
    'SOX': ['Entity-Level Controls', 'Process Controls', 'ITGC', 'Financial Reporting', 'Control Testing'],
    'ISO 27001': ['ISMS', 'Annex A Controls', 'Risk Assessment', 'Audit Process', 'Certification'],
    'NIST CSF': ['Identify', 'Protect', 'Detect', 'Respond', 'Recover'],
    'GDPR': ['Principles', 'Rights', 'Obligations', 'DPO', 'DPIA', 'Breach Management'],
    'PCI-DSS': ['Network Security', 'Access Control', 'Monitoring', 'Testing', 'Security Policy'],
    'HIPAA': ['Privacy Rule', 'Security Rule', 'Breach Notification', 'BAA', 'Risk Analysis']
  };

  const createExamMutation = useMutation({
    mutationFn: (examData) => base44.entities.RegulatoryExam.create(examData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regulatory-exams'] });
      toast.success("Exam created successfully");
    }
  });

  const generateExam = async () => {
    setLoading(true);
    try {
      const prompt = `You are an expert exam designer for ${config.examType} regulatory compliance.

Create a comprehensive practice exam with the following specifications:

EXAM PARAMETERS:
- Type: ${config.examType}
- Difficulty Level: ${config.difficulty}
- Number of Questions: ${config.questionCount}
- Focus Areas: ${config.focusAreas.join(', ') || 'All areas'}
- Include Scenarios: ${config.includeScenarios ? 'Yes' : 'No'}
${config.customRequirements ? `- Custom Requirements: ${config.customRequirements}` : ''}

REQUIREMENTS:
1. Generate ${config.questionCount} high-quality multiple-choice questions
2. Each question must have 4 answer options (A, B, C, D)
3. Include detailed explanations for correct answers
4. Reference specific regulations or framework sections
5. ${config.includeScenarios ? 'Include realistic scenario-based questions' : 'Focus on knowledge-based questions'}
6. Ensure questions cover breadth and depth of ${config.examType}
7. Mix question types: definitions, applications, scenarios, best practices
8. Align with actual ${config.examType} examination patterns

Return a structured exam with title, description, and array of questions.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            exam_title: { type: "string" },
            exam_description: { type: "string" },
            passing_score: { type: "number" },
            time_limit_minutes: { type: "number" },
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question_text: { type: "string" },
                  question_type: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correct_answer: { type: "string" },
                  explanation: { type: "string" },
                  difficulty: { type: "string" },
                  category: { type: "string" },
                  reference: { type: "string" },
                  points: { type: "number" }
                }
              }
            },
            study_tips: { type: "array", items: { type: "string" } },
            key_topics: { type: "array", items: { type: "string" } }
          }
        }
      });

      setGeneratedExam(result);
      toast.success("Exam generated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate exam");
    } finally {
      setLoading(false);
    }
  };

  const saveExam = () => {
    if (!generatedExam) return;

    createExamMutation.mutate({
      exam_title: generatedExam.exam_title,
      exam_type: config.examType,
      description: generatedExam.exam_description,
      status: 'scheduled',
      workflow_stage: 'preparation',
      scope_areas: config.focusAreas,
      pre_exam_assessment: {
        ai_generated: true,
        question_count: generatedExam.questions?.length || 0,
        difficulty: config.difficulty,
        time_limit: generatedExam.time_limit_minutes
      }
    });
  };

  const saveToQuestionBank = async () => {
    if (!generatedExam?.questions) return;

    try {
      for (const question of generatedExam.questions) {
        await base44.entities.QuestionBank.create({
          question_text: question.question_text,
          question_type: question.question_type || 'multiple_choice',
          category: question.category || config.examType,
          framework: config.examType,
          difficulty_level: question.difficulty || config.difficulty,
          options: question.options,
          correct_answer: question.correct_answer,
          explanation: question.explanation,
          reference: question.reference,
          points: question.points || 1,
          status: 'active'
        });
      }
      toast.success(`${generatedExam.questions.length} questions added to bank`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save questions");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Configuration Panel */}
      <Card className="bg-[#1a2332] border-[#2a3548] lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-purple-400" />
            AI Exam Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm text-slate-400 mb-2">Exam Type</Label>
            <Select value={config.examType} onValueChange={(value) => setConfig({ ...config, examType: value, focusAreas: [] })}>
              <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                {examTypes.map(type => (
                  <SelectItem key={type} value={type} className="text-white">{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm text-slate-400 mb-2">Difficulty Level</Label>
            <Select value={config.difficulty} onValueChange={(value) => setConfig({ ...config, difficulty: value })}>
              <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="beginner" className="text-white">Beginner</SelectItem>
                <SelectItem value="intermediate" className="text-white">Intermediate</SelectItem>
                <SelectItem value="advanced" className="text-white">Advanced</SelectItem>
                <SelectItem value="expert" className="text-white">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm text-slate-400 mb-2">Number of Questions</Label>
            <Input 
              type="number"
              value={config.questionCount}
              onChange={(e) => setConfig({ ...config, questionCount: parseInt(e.target.value) || 30 })}
              min="10"
              max="100"
              className="bg-[#151d2e] border-[#2a3548] text-white"
            />
          </div>

          <div>
            <Label className="text-sm text-slate-400 mb-2">Focus Areas (optional)</Label>
            <div className="space-y-2">
              {focusAreasByType[config.examType]?.map(area => (
                <div 
                  key={area}
                  onClick={() => {
                    const isSelected = config.focusAreas.includes(area);
                    setConfig({
                      ...config,
                      focusAreas: isSelected 
                        ? config.focusAreas.filter(a => a !== area)
                        : [...config.focusAreas, area]
                    });
                  }}
                  className={`p-2 rounded-lg border text-sm cursor-pointer transition-all ${
                    config.focusAreas.includes(area)
                      ? 'bg-indigo-500/20 border-indigo-500/40 text-white'
                      : 'bg-[#151d2e] border-[#2a3548] text-slate-400 hover:border-[#3a4558]'
                  }`}
                >
                  {area}
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm text-slate-400 mb-2">Custom Requirements</Label>
            <Textarea
              value={config.customRequirements}
              onChange={(e) => setConfig({ ...config, customRequirements: e.target.value })}
              placeholder="Specific topics, scenarios, or requirements..."
              className="bg-[#151d2e] border-[#2a3548] text-white min-h-[80px]"
            />
          </div>

          <Button 
            onClick={generateExam}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" /> Generate AI Exam</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Exam */}
      <Card className="bg-[#1a2332] border-[#2a3548] lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-400" />
              Generated Exam Preview
            </CardTitle>
            {generatedExam && (
              <div className="flex gap-2">
                <Button 
                  onClick={saveToQuestionBank}
                  variant="outline"
                  className="gap-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                >
                  <Plus className="h-4 w-4" />
                  Save to Question Bank
                </Button>
                <Button 
                  onClick={saveExam}
                  disabled={createExamMutation.isPending}
                  className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                >
                  <Save className="h-4 w-4" />
                  Create Exam
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!generatedExam ? (
            <div className="flex flex-col items-center justify-center h-[600px] text-center">
              <Brain className="h-20 w-20 text-slate-600 mb-6" />
              <h3 className="text-xl font-semibold text-white mb-3">AI Exam Generation</h3>
              <p className="text-slate-400 max-w-lg leading-relaxed">
                Configure your exam parameters and let AI create a comprehensive, 
                realistic practice exam with detailed questions, scenarios, and explanations.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-6">
                {/* Exam Header */}
                <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 p-5">
                  <h3 className="text-xl font-bold text-white mb-2">{generatedExam.exam_title}</h3>
                  <p className="text-sm text-slate-300 mb-4">{generatedExam.exam_description}</p>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                      {generatedExam.questions?.length || 0} Questions
                    </Badge>
                    <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">
                      {generatedExam.time_limit_minutes} minutes
                    </Badge>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      Passing: {generatedExam.passing_score}%
                    </Badge>
                  </div>
                </Card>

                {/* Study Tips */}
                {generatedExam.study_tips && (
                  <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-400" />
                      Study Tips
                    </h4>
                    <ul className="space-y-2">
                      {generatedExam.study_tips.map((tip, idx) => (
                        <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Questions */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-white">Exam Questions</h4>
                  {generatedExam.questions?.map((q, idx) => (
                    <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">
                          Q{idx + 1}
                        </Badge>
                        <Badge className={`text-[10px] ${
                          q.difficulty === 'hard' ? 'bg-rose-500/20 text-rose-400' :
                          q.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {q.difficulty}
                        </Badge>
                        {q.category && (
                          <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-[10px]">
                            {q.category}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-white font-medium mb-3">{q.question_text}</p>
                      
                      <div className="space-y-2 mb-4">
                        {q.options?.map((option, oidx) => (
                          <div 
                            key={oidx}
                            className={`p-3 rounded-lg border text-sm ${
                              option === q.correct_answer
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-[#0f1623] border-[#2a3548] text-slate-400'
                            }`}
                          >
                            <span className="font-semibold mr-2">{String.fromCharCode(65 + oidx)}.</span>
                            {option}
                          </div>
                        ))}
                      </div>

                      <Card className="bg-[#0f1623] border-emerald-500/20 p-3">
                        <div className="text-xs text-emerald-400 font-semibold mb-1">
                          ✓ Correct Answer: {q.correct_answer}
                        </div>
                        <p className="text-xs text-slate-400 mb-2">{q.explanation}</p>
                        {q.reference && (
                          <div className="text-xs text-slate-500">
                            Reference: {q.reference}
                          </div>
                        )}
                      </Card>
                    </Card>
                  ))}
                </div>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}