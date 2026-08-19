import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Brain, Zap, CheckCircle2, Clock, Target, AlertCircle, Play, Save } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useQueryClient, useMutation } from "@tanstack/react-query";

export default function AIExamBuilder() {
  const [parameters, setParameters] = useState({
    topic: "",
    examType: "FFIEC",
    difficulty: "intermediate",
    questionCount: 25,
    targetScore: 80,
    focusAreas: "",
    timeLimit: 60
  });
  
  const [generating, setGenerating] = useState(false);
  const [generatedExam, setGeneratedExam] = useState(null);
  const queryClient = useQueryClient();

  const createExamMutation = useMutation({
    mutationFn: (examData) => base44.entities.RegulatoryExam.create(examData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regulatory-exams'] });
      toast.success("Exam saved successfully");
    },
  });

  const generateExam = async () => {
    if (!parameters.topic) {
      toast.error("Please enter a topic");
      return;
    }

    setGenerating(true);
    try {
      const prompt = `Generate a comprehensive regulatory compliance practice exam with the following specifications:

EXAM PARAMETERS:
- Topic/Focus: ${parameters.topic}
- Exam Type: ${parameters.examType}
- Difficulty Level: ${parameters.difficulty}
- Number of Questions: ${parameters.questionCount}
- Target Passing Score: ${parameters.targetScore}%
- Specific Focus Areas: ${parameters.focusAreas || 'General coverage'}
- Time Limit: ${parameters.timeLimit} minutes

REQUIREMENTS:
1. Generate exactly ${parameters.questionCount} multiple-choice questions
2. Questions should be ${parameters.difficulty} difficulty level
3. Each question must have 4 answer options (A, B, C, D)
4. Include detailed explanations for correct answers
5. Cover key concepts related to ${parameters.topic}
6. Mix question types: definition, scenario-based, application, and analysis
7. Ensure questions test practical knowledge and regulatory understanding
8. Include reference to relevant frameworks/regulations where applicable

${parameters.focusAreas ? `SPECIAL FOCUS: Pay extra attention to these areas: ${parameters.focusAreas}` : ''}

Format each question with:
- Question text (clear, unambiguous, professionally written)
- Four options (A, B, C, D)
- Correct answer (letter only)
- Detailed explanation (why correct answer is right and others are wrong)
- Category/topic tag
- Estimated difficulty rating
- Reference to regulation/framework if applicable`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            exam_title: { type: "string" },
            exam_description: { type: "string" },
            total_points: { type: "number" },
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question_number: { type: "number" },
                  question_text: { type: "string" },
                  options: {
                    type: "object",
                    properties: {
                      A: { type: "string" },
                      B: { type: "string" },
                      C: { type: "string" },
                      D: { type: "string" }
                    }
                  },
                  correct_answer: { type: "string" },
                  explanation: { type: "string" },
                  category: { type: "string" },
                  difficulty: { type: "string" },
                  reference: { type: "string" },
                  points: { type: "number" }
                }
              }
            }
          }
        }
      });

      setGeneratedExam(response);
      toast.success("Exam generated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate exam");
    } finally {
      setGenerating(false);
    }
  };

  const saveExam = async () => {
    if (!generatedExam) return;

    const examData = {
      exam_title: generatedExam.exam_title,
      exam_type: parameters.examType,
      exam_date: new Date().toISOString(),
      status: "scheduled",
      readiness_score: 0,
      exam_content: JSON.stringify(generatedExam),
      difficulty_level: parameters.difficulty,
      question_count: parameters.questionCount,
      time_limit_minutes: parameters.timeLimit,
      target_score: parameters.targetScore
    };

    createExamMutation.mutate(examData);
  };

  const difficultyColors = {
    beginner: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30",
    intermediate: "text-amber-400 bg-amber-500/20 border-amber-500/30",
    advanced: "text-rose-400 bg-rose-500/20 border-rose-500/30"
  };

  return (
    <div className="space-y-6">
      {/* Builder Interface */}
      {!generatedExam ? (
        <Card className="bg-gradient-to-br from-violet-500/10 via-indigo-500/10 to-purple-500/10 border-violet-500/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-500/20 border border-violet-500/30">
                <Sparkles className="h-6 w-6 text-violet-400" />
              </div>
              <div>
                <CardTitle className="text-white">AI-Powered Exam Builder</CardTitle>
                <p className="text-xs text-slate-400 mt-1">Generate custom practice exams tailored to your needs</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Exam Parameters Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Topic */}
              <div className="space-y-2">
                <Label className="text-white">Exam Topic *</Label>
                <Input
                  placeholder="e.g., FFIEC Cybersecurity Assessment"
                  value={parameters.topic}
                  onChange={(e) => setParameters({ ...parameters, topic: e.target.value })}
                  className="bg-[#0f1623] border-[#2a3548] text-white"
                />
              </div>

              {/* Exam Type */}
              <div className="space-y-2">
                <Label className="text-white">Exam Type</Label>
                <Select value={parameters.examType} onValueChange={(v) => setParameters({ ...parameters, examType: v })}>
                  <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="FFIEC">FFIEC</SelectItem>
                    <SelectItem value="SOX">SOX</SelectItem>
                    <SelectItem value="SOC2">SOC 2</SelectItem>
                    <SelectItem value="ISO27001">ISO 27001</SelectItem>
                    <SelectItem value="NIST">NIST CSF</SelectItem>
                    <SelectItem value="GDPR">GDPR</SelectItem>
                    <SelectItem value="PCI-DSS">PCI-DSS</SelectItem>
                    <SelectItem value="HIPAA">HIPAA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Difficulty */}
              <div className="space-y-2">
                <Label className="text-white">Difficulty Level</Label>
                <Select value={parameters.difficulty} onValueChange={(v) => setParameters({ ...parameters, difficulty: v })}>
                  <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Question Count */}
              <div className="space-y-2">
                <Label className="text-white">Number of Questions: {parameters.questionCount}</Label>
                <Slider
                  value={[parameters.questionCount]}
                  onValueChange={([v]) => setParameters({ ...parameters, questionCount: v })}
                  min={10}
                  max={100}
                  step={5}
                  className="py-4"
                />
              </div>

              {/* Target Score */}
              <div className="space-y-2">
                <Label className="text-white">Target Passing Score: {parameters.targetScore}%</Label>
                <Slider
                  value={[parameters.targetScore]}
                  onValueChange={([v]) => setParameters({ ...parameters, targetScore: v })}
                  min={50}
                  max={100}
                  step={5}
                  className="py-4"
                />
              </div>

              {/* Time Limit */}
              <div className="space-y-2">
                <Label className="text-white">Time Limit (minutes): {parameters.timeLimit}</Label>
                <Slider
                  value={[parameters.timeLimit]}
                  onValueChange={([v]) => setParameters({ ...parameters, timeLimit: v })}
                  min={15}
                  max={180}
                  step={15}
                  className="py-4"
                />
              </div>
            </div>

            {/* Focus Areas */}
            <div className="space-y-2">
              <Label className="text-white">Specific Focus Areas (Optional)</Label>
              <Input
                placeholder="e.g., Access controls, incident response, data encryption"
                value={parameters.focusAreas}
                onChange={(e) => setParameters({ ...parameters, focusAreas: e.target.value })}
                className="bg-[#0f1623] border-[#2a3548] text-white"
              />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="bg-[#0f1623] border-[#2a3548]">
                <CardContent className="p-3 text-center">
                  <Target className="h-5 w-5 mx-auto mb-1 text-violet-400" />
                  <div className="text-lg font-bold text-white">{parameters.questionCount}</div>
                  <div className="text-xs text-slate-400">Questions</div>
                </CardContent>
              </Card>
              <Card className="bg-[#0f1623] border-[#2a3548]">
                <CardContent className="p-3 text-center">
                  <Clock className="h-5 w-5 mx-auto mb-1 text-blue-400" />
                  <div className="text-lg font-bold text-white">{parameters.timeLimit}m</div>
                  <div className="text-xs text-slate-400">Time Limit</div>
                </CardContent>
              </Card>
              <Card className="bg-[#0f1623] border-[#2a3548]">
                <CardContent className="p-3 text-center">
                  <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-emerald-400" />
                  <div className="text-lg font-bold text-white">{parameters.targetScore}%</div>
                  <div className="text-xs text-slate-400">Target</div>
                </CardContent>
              </Card>
              <Card className="bg-[#0f1623] border-[#2a3548]">
                <CardContent className="p-3 text-center">
                  <Zap className="h-5 w-5 mx-auto mb-1 text-amber-400" />
                  <div className="text-sm font-bold text-white capitalize">{parameters.difficulty}</div>
                  <div className="text-xs text-slate-400">Difficulty</div>
                </CardContent>
              </Card>
            </div>

            {/* Generate Button */}
            <Button
              onClick={generateExam}
              disabled={generating || !parameters.topic}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
              size="lg"
            >
              {generating ? (
                <>
                  <Brain className="h-5 w-5 mr-2 animate-pulse" />
                  Generating Exam...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Custom Exam
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Generated Exam Display */
        <div className="space-y-4">
          {/* Exam Header */}
          <Card className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-500/20">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                    <h2 className="text-xl font-bold text-white">Exam Generated Successfully!</h2>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{generatedExam.exam_title}</h3>
                  <p className="text-sm text-slate-300 mb-3">{generatedExam.exam_description}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">
                      {parameters.examType}
                    </Badge>
                    <Badge className={difficultyColors[parameters.difficulty]}>
                      {parameters.difficulty}
                    </Badge>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {generatedExam.questions.length} Questions
                    </Badge>
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                      {parameters.timeLimit} minutes
                    </Badge>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      Target: {parameters.targetScore}%
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={saveExam}
                  className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Exam
                </Button>
                <Button
                  onClick={() => toast.info("Exam simulation feature coming soon")}
                  className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Exam
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setGeneratedExam(null)}
                  className="border-[#2a3548] text-slate-400"
                >
                  Generate New Exam
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Questions Preview */}
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-white">Exam Questions Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6">
                  {generatedExam.questions.map((question, idx) => (
                    <Card key={idx} className="bg-[#0f1623] border-[#2a3548]">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">
                              Q{question.question_number}
                            </Badge>
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                              {question.category}
                            </Badge>
                            <Badge className={`${difficultyColors[question.difficulty]} text-xs`}>
                              {question.difficulty}
                            </Badge>
                          </div>
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                            {question.points} pts
                          </Badge>
                        </div>

                        <div className="mb-4">
                          <p className="text-white font-medium leading-relaxed">{question.question_text}</p>
                        </div>

                        <div className="space-y-2 mb-4">
                          {Object.entries(question.options).map(([letter, text]) => (
                            <div
                              key={letter}
                              className={`p-3 rounded-lg border transition-all ${
                                letter === question.correct_answer
                                  ? 'bg-emerald-500/10 border-emerald-500/30'
                                  : 'bg-[#1a2332] border-[#2a3548]'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`font-bold ${
                                  letter === question.correct_answer ? 'text-emerald-400' : 'text-slate-400'
                                }`}>
                                  {letter}.
                                </div>
                                <div className="flex-1 text-sm text-slate-300">{text}</div>
                                {letter === question.correct_answer && (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          <div className="flex items-start gap-2 mb-1">
                            <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                            <span className="text-xs font-semibold text-blue-400">Explanation:</span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed ml-6">{question.explanation}</p>
                        </div>

                        {question.reference && (
                          <div className="mt-2 text-xs text-slate-500">
                            Reference: {question.reference}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}