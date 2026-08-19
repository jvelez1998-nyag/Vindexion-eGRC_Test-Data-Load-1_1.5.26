import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DraggableContainer, DraggableItem } from "@/components/ui/draggable-container";
import { Plus, Trash2, GripVertical, Copy, Sparkles, BookOpen, Settings, Eye, Save, Download, Upload, Brain, Zap, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

const examTemplates = [
  { id: "ffiec-comprehensive", name: "FFIEC Comprehensive", categories: ["Cybersecurity", "BSA/AML", "Information Security", "Third-Party Risk", "Business Continuity"], questionCount: 50 },
  { id: "sox-financial", name: "SOX Financial Controls", categories: ["Financial Reporting", "ITGC", "Access Controls", "Change Management"], questionCount: 40 },
  { id: "soc2-security", name: "SOC 2 Security", categories: ["Access", "Availability", "Confidentiality", "Processing Integrity"], questionCount: 35 },
  { id: "iso27001-isms", name: "ISO 27001 ISMS", categories: ["Information Security", "Risk Assessment", "Incident Management"], questionCount: 45 },
  { id: "custom", name: "Custom Exam", categories: [], questionCount: 0 }
];

const questionTypes = [
  { value: "multiple_choice", label: "Multiple Choice", icon: "○" },
  { value: "true_false", label: "True/False", icon: "✓/✗" },
  { value: "scenario", label: "Scenario-Based", icon: "📋" },
  { value: "calculation", label: "Calculation", icon: "🔢" }
];

const difficultyLevels = ["beginner", "intermediate", "advanced", "expert"];

const defaultQuestion = {
  question: "",
  type: "multiple_choice",
  category: "",
  difficulty: "intermediate",
  options: ["", "", "", ""],
  correct_answer: 0,
  explanation: "",
  points: 1,
  tags: []
};

export default function ModernExamBuilder({ onSave, existingExam }) {
  const [examConfig, setExamConfig] = useState({
    title: existingExam?.title || "",
    description: existingExam?.description || "",
    framework: existingExam?.framework || "FFIEC",
    duration_minutes: existingExam?.duration_minutes || 90,
    passing_score: existingExam?.passing_score || 70,
    randomize_questions: existingExam?.randomize_questions || false,
    show_feedback: existingExam?.show_feedback || true,
    allow_review: existingExam?.allow_review || true
  });

  const [questions, setQuestions] = useState(existingExam?.questions || []);
  const [currentQuestion, setCurrentQuestion] = useState(defaultQuestion);
  const [editingIndex, setEditingIndex] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [activeTab, setActiveTab] = useState("builder");
  const [generatingAI, setGeneratingAI] = useState(false);
  const [generatingExplanation, setGeneratingExplanation] = useState(false);
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [customTemplateParams, setCustomTemplateParams] = useState({
    targetAudience: "",
    regulatoryFocus: "",
    industryVertical: "",
    difficultyDistribution: "balanced"
  });

  const queryClient = useQueryClient();

  // Fetch question bank
  const { data: questionBank = [] } = useQuery({
    queryKey: ['question-bank'],
    queryFn: () => base44.entities.QuestionBank.list(),
    initialData: []
  });

  const handleAddQuestion = () => {
    if (!currentQuestion.question.trim()) {
      toast.error("Question text is required");
      return;
    }

    if (currentQuestion.type === "multiple_choice" && currentQuestion.options.some(o => !o.trim())) {
      toast.error("All options must be filled");
      return;
    }

    if (editingIndex !== null) {
      const updated = [...questions];
      updated[editingIndex] = { ...currentQuestion, id: Date.now() };
      setQuestions(updated);
      toast.success("Question updated");
    } else {
      setQuestions([...questions, { ...currentQuestion, id: Date.now() }]);
      toast.success("Question added");
    }

    setCurrentQuestion(defaultQuestion);
    setEditingIndex(null);
  };

  const handleEditQuestion = (index) => {
    setCurrentQuestion(questions[index]);
    setEditingIndex(index);
    setActiveTab("builder");
  };

  const handleDeleteQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
    toast.success("Question deleted");
  };

  const handleDuplicateQuestion = (index) => {
    const duplicated = { ...questions[index], id: Date.now() };
    setQuestions([...questions, duplicated]);
    toast.success("Question duplicated");
  };

  const handleReorderQuestions = (reordered) => {
    setQuestions(reordered);
  };

  const handleLoadTemplate = (template) => {
    setSelectedTemplate(template);
    setExamConfig({
      ...examConfig,
      title: template.name,
      description: `${template.name} examination covering: ${template.categories.join(", ")}`
    });
    toast.success(`Template "${template.name}" loaded`);
  };

  const handleGenerateAIQuestions = async () => {
    if (!selectedTemplate) {
      toast.error("Please select a template first");
      return;
    }

    setGeneratingAI(true);
    try {
      const prompt = `Generate ${selectedTemplate.questionCount} high-quality regulatory exam questions for ${selectedTemplate.name}.

Categories to cover: ${selectedTemplate.categories.join(", ")}

Requirements:
- Mix of difficulty levels (beginner, intermediate, advanced)
- Multiple choice format with 4 options each
- Clear, unambiguous questions
- Detailed explanations for correct answers
- Practical, real-world scenarios
- Compliance with ${examConfig.framework} standards

Return as JSON array with this structure:
[{
  "question": "Question text",
  "category": "Category name",
  "difficulty": "intermediate",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct_answer": 0,
  "explanation": "Detailed explanation"
}]`;

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
                  category: { type: "string" },
                  difficulty: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correct_answer: { type: "number" },
                  explanation: { type: "string" }
                }
              }
            }
          }
        }
      });

      const generatedQuestions = response.questions.map((q, idx) => ({
        ...q,
        id: Date.now() + idx,
        type: "multiple_choice",
        points: 1,
        tags: [q.category, q.difficulty]
      }));

      setQuestions(generatedQuestions);
      toast.success(`Generated ${generatedQuestions.length} questions`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate questions");
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleGenerateExplanation = async () => {
    if (!currentQuestion.question || !currentQuestion.options[currentQuestion.correct_answer]) {
      toast.error("Please complete the question and select correct answer first");
      return;
    }

    setGeneratingExplanation(true);
    try {
      const prompt = `Generate a detailed explanation for this exam question:

Question: ${currentQuestion.question}
Correct Answer: ${currentQuestion.options[currentQuestion.correct_answer]}
Category: ${currentQuestion.category || "General"}
Difficulty: ${currentQuestion.difficulty}
Framework: ${examConfig.framework}

Provide a comprehensive explanation (2-3 sentences) that:
- Explains why this answer is correct
- References relevant regulations or standards
- Provides practical context
- Helps learners understand the concept`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      setCurrentQuestion({ ...currentQuestion, explanation: response });
      toast.success("Explanation generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate explanation");
    } finally {
      setGeneratingExplanation(false);
    }
  };

  const handleGenerateSuggestions = async () => {
    if (!examConfig.title && !examConfig.description) {
      toast.error("Please enter exam title or description first");
      return;
    }

    setGeneratingSuggestions(true);
    try {
      const prompt = `Analyze this exam configuration and suggest appropriate categories and difficulty distribution:

Title: ${examConfig.title}
Description: ${examConfig.description}
Framework: ${examConfig.framework}

Provide suggestions for:
1. Relevant question categories (5-8 categories)
2. Recommended difficulty distribution (percentage for beginner/intermediate/advanced/expert)
3. Key topics to cover
4. Exam focus areas based on title and description`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            categories: { type: "array", items: { type: "string" } },
            difficulty_distribution: {
              type: "object",
              properties: {
                beginner: { type: "number" },
                intermediate: { type: "number" },
                advanced: { type: "number" },
                expert: { type: "number" }
              }
            },
            key_topics: { type: "array", items: { type: "string" } },
            focus_areas: { type: "array", items: { type: "string" } }
          }
        }
      });

      setAiSuggestions(response);
      toast.success("AI suggestions generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate suggestions");
    } finally {
      setGeneratingSuggestions(false);
    }
  };

  const handleGenerateCustomTemplate = async () => {
    if (!customTemplateParams.targetAudience || !customTemplateParams.regulatoryFocus) {
      toast.error("Please specify target audience and regulatory focus");
      return;
    }

    setGeneratingAI(true);
    try {
      const prompt = `Create a custom regulatory exam based on these parameters:

Target Audience: ${customTemplateParams.targetAudience}
Regulatory Focus: ${customTemplateParams.regulatoryFocus}
Industry: ${customTemplateParams.industryVertical || "General Financial Services"}
Difficulty Distribution: ${customTemplateParams.difficultyDistribution}
Framework: ${examConfig.framework}

Generate 30-50 questions that are:
- Tailored to the target audience's knowledge level
- Focused on the specified regulatory areas
- Industry-specific where applicable
- Distributed according to difficulty preference

Include detailed explanations for each answer.`;

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
                  category: { type: "string" },
                  difficulty: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correct_answer: { type: "number" },
                  explanation: { type: "string" }
                }
              }
            }
          }
        }
      });

      const generatedQuestions = response.questions.map((q, idx) => ({
        ...q,
        id: Date.now() + idx,
        type: "multiple_choice",
        points: 1,
        tags: [q.category, q.difficulty]
      }));

      setQuestions(generatedQuestions);
      toast.success(`Custom template generated with ${generatedQuestions.length} questions`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate custom template");
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleImportFromBank = (bankQuestions) => {
    const imported = bankQuestions.map(q => ({
      ...q,
      id: Date.now() + Math.random()
    }));
    setQuestions([...questions, ...imported]);
    toast.success(`Imported ${imported.length} questions`);
  };

  const handleSaveExam = async () => {
    if (!examConfig.title || questions.length === 0) {
      toast.error("Exam title and at least one question required");
      return;
    }

    const exam = {
      ...examConfig,
      questions,
      total_questions: questions.length,
      created_date: new Date().toISOString()
    };

    onSave?.(exam);
    toast.success("Exam saved successfully");
  };

  const handleExportExam = () => {
    const exam = { ...examConfig, questions };
    const blob = new Blob([JSON.stringify(exam, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${examConfig.title.replace(/\s+/g, '_')}.json`;
    a.click();
    toast.success("Exam exported");
  };

  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
  const categoryBreakdown = questions.reduce((acc, q) => {
    acc[q.category] = (acc[q.category] || 0) + 1;
    return acc;
  }, {});
  const difficultyBreakdown = questions.reduce((acc, q) => {
    acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-indigo-500/10 border-violet-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-500/20 border border-violet-500/30">
                <Sparkles className="h-6 w-6 text-violet-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Modern Exam Builder</h2>
                <p className="text-xs text-slate-400">AI-powered regulatory examination creation</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">
                {questions.length} Questions
              </Badge>
              <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                {totalPoints} Points
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar - Templates & Settings */}
        <div className="space-y-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-400" />
                Exam Templates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {examTemplates.map(template => (
                <Button
                  key={template.id}
                  variant={selectedTemplate?.id === template.id ? "default" : "outline"}
                  className={`w-full justify-start text-left h-auto py-3 ${
                    selectedTemplate?.id === template.id 
                      ? 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 border-violet-500/30' 
                      : 'border-[#2a3548] hover:bg-[#0f1623]'
                  }`}
                  onClick={() => handleLoadTemplate(template)}
                >
                  <div className="flex-1">
                    <div className="font-semibold text-xs">{template.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{template.questionCount} questions</div>
                  </div>
                </Button>
              ))}
              
              {selectedTemplate && (
                <Button
                  onClick={handleGenerateAIQuestions}
                  disabled={generatingAI}
                  className="w-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 hover:from-violet-500/30 hover:to-purple-500/30 border border-violet-500/30 text-violet-400"
                >
                  {generatingAI ? (
                    <>
                      <Brain className="h-4 w-4 mr-2 animate-pulse" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate with AI
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="h-4 w-4 text-slate-400" />
                Exam Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-slate-400">Duration (minutes)</Label>
                <Input
                  type="number"
                  value={examConfig.duration_minutes}
                  onChange={(e) => setExamConfig({...examConfig, duration_minutes: parseInt(e.target.value)})}
                  className="bg-[#0f1623] border-[#2a3548] text-white h-9"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-400">Passing Score (%)</Label>
                <Input
                  type="number"
                  value={examConfig.passing_score}
                  onChange={(e) => setExamConfig({...examConfig, passing_score: parseInt(e.target.value)})}
                  className="bg-[#0f1623] border-[#2a3548] text-white h-9"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-sm">Exam Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="text-xs text-slate-400 mb-1">By Category</div>
                {Object.entries(categoryBreakdown).map(([cat, count]) => (
                  <div key={cat} className="flex justify-between text-xs">
                    <span className="text-slate-300">{cat}</span>
                    <Badge variant="outline" className="h-5 text-[10px]">{count}</Badge>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="text-xs text-slate-400 mb-1">By Difficulty</div>
                {Object.entries(difficultyBreakdown).map(([diff, count]) => (
                  <div key={diff} className="flex justify-between text-xs">
                    <span className="text-slate-300 capitalize">{diff}</span>
                    <Badge variant="outline" className="h-5 text-[10px]">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-slate-400">Exam Title</Label>
                  <Input
                    value={examConfig.title}
                    onChange={(e) => setExamConfig({...examConfig, title: e.target.value})}
                    placeholder="e.g., FFIEC Cybersecurity Assessment"
                    className="bg-[#0f1623] border-[#2a3548] text-white h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-400">Framework</Label>
                  <Select value={examConfig.framework} onValueChange={(v) => setExamConfig({...examConfig, framework: v})}>
                    <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="FFIEC">FFIEC</SelectItem>
                      <SelectItem value="SOX">SOX</SelectItem>
                      <SelectItem value="SOC2">SOC 2</SelectItem>
                      <SelectItem value="ISO27001">ISO 27001</SelectItem>
                      <SelectItem value="NIST">NIST CSF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-slate-400">Description</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleGenerateSuggestions}
                    disabled={generatingSuggestions || (!examConfig.title && !examConfig.description)}
                    className="h-7 text-xs border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
                  >
                    {generatingSuggestions ? (
                      <>
                        <Brain className="h-3 w-3 mr-1 animate-pulse" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap className="h-3 w-3 mr-1" />
                        AI Suggestions
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  value={examConfig.description}
                  onChange={(e) => setExamConfig({...examConfig, description: e.target.value})}
                  placeholder="Exam description..."
                  className="bg-[#0f1623] border-[#2a3548] text-white"
                  rows={2}
                />
              </div>

              {/* AI Suggestions Display */}
              {aiSuggestions && (
                <div className="mt-3 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                  <h4 className="text-xs font-semibold text-indigo-400 mb-2">AI Suggestions</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-[10px] text-slate-500 mb-1">Recommended Categories:</p>
                      <div className="flex flex-wrap gap-1">
                        {aiSuggestions.categories?.map((cat, idx) => (
                          <Badge key={idx} className="text-[10px] bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 mb-1">Difficulty Distribution:</p>
                      <div className="grid grid-cols-4 gap-1">
                        {Object.entries(aiSuggestions.difficulty_distribution || {}).map(([level, pct]) => (
                          <div key={level} className="text-center">
                            <div className="text-xs text-white font-semibold">{pct}%</div>
                            <div className="text-[9px] text-slate-500 capitalize">{level}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 mb-1">Focus Areas:</p>
                      <div className="text-xs text-slate-300 space-y-0.5">
                        {aiSuggestions.focus_areas?.map((area, idx) => (
                          <div key={idx}>• {area}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-[#1a2332] border border-[#2a3548]">
              <TabsTrigger value="builder">Question Builder</TabsTrigger>
              <TabsTrigger value="questions">Questions ({questions.length})</TabsTrigger>
              <TabsTrigger value="custom">Custom Template</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="import">Import</TabsTrigger>
            </TabsList>

            <TabsContent value="builder" className="space-y-4">
              <Card className="bg-[#1a2332] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-base">
                    {editingIndex !== null ? "Edit Question" : "Add New Question"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Question</Label>
                    <Textarea
                      value={currentQuestion.question}
                      onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                      placeholder="Enter your question..."
                      className="bg-[#0f1623] border-[#2a3548] text-white"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <Label className="text-xs">Type</Label>
                      <Select value={currentQuestion.type} onValueChange={(v) => setCurrentQuestion({...currentQuestion, type: v})}>
                        <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                          {questionTypes.map(qt => (
                            <SelectItem key={qt.value} value={qt.value}>{qt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs">Category</Label>
                      <Input
                        value={currentQuestion.category}
                        onChange={(e) => setCurrentQuestion({...currentQuestion, category: e.target.value})}
                        placeholder="Category"
                        className="bg-[#0f1623] border-[#2a3548] text-white h-9"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Difficulty</Label>
                      <Select value={currentQuestion.difficulty} onValueChange={(v) => setCurrentQuestion({...currentQuestion, difficulty: v})}>
                        <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                          {difficultyLevels.map(level => (
                            <SelectItem key={level} value={level} className="capitalize">{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs">Points</Label>
                      <Input
                        type="number"
                        value={currentQuestion.points}
                        onChange={(e) => setCurrentQuestion({...currentQuestion, points: parseInt(e.target.value)})}
                        className="bg-[#0f1623] border-[#2a3548] text-white h-9"
                      />
                    </div>
                  </div>

                  {currentQuestion.type === "multiple_choice" && (
                    <div className="space-y-2">
                      <Label>Options</Label>
                      {currentQuestion.options.map((option, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Badge className={currentQuestion.correct_answer === idx ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-slate-500/20"}>
                            {String.fromCharCode(65 + idx)}
                          </Badge>
                          <Input
                            value={option}
                            onChange={(e) => {
                              const updated = [...currentQuestion.options];
                              updated[idx] = e.target.value;
                              setCurrentQuestion({...currentQuestion, options: updated});
                            }}
                            placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                            className="bg-[#0f1623] border-[#2a3548] text-white h-9 flex-1"
                          />
                          <Button
                            size="sm"
                            variant={currentQuestion.correct_answer === idx ? "default" : "outline"}
                            onClick={() => setCurrentQuestion({...currentQuestion, correct_answer: idx})}
                            className={currentQuestion.correct_answer === idx ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-emerald-500/30" : ""}
                          >
                            {currentQuestion.correct_answer === idx ? <CheckCircle2 className="h-4 w-4" /> : "Set Correct"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Explanation</Label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleGenerateExplanation}
                        disabled={generatingExplanation || !currentQuestion.question}
                        className="h-7 text-xs border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
                      >
                        {generatingExplanation ? (
                          <>
                            <Brain className="h-3 w-3 mr-1 animate-pulse" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI Generate
                          </>
                        )}
                      </Button>
                    </div>
                    <Textarea
                      value={currentQuestion.explanation}
                      onChange={(e) => setCurrentQuestion({...currentQuestion, explanation: e.target.value})}
                      placeholder="Explain the correct answer..."
                      className="bg-[#0f1623] border-[#2a3548] text-white"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleAddQuestion} className="bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 border border-violet-500/30">
                      {editingIndex !== null ? "Update Question" : <><Plus className="h-4 w-4 mr-2" />Add Question</>}
                    </Button>
                    {editingIndex !== null && (
                      <Button variant="outline" onClick={() => { setCurrentQuestion(defaultQuestion); setEditingIndex(null); }}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="questions">
              <Card className="bg-[#1a2332] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-base">Question List</CardTitle>
                </CardHeader>
                <CardContent>
                  {questions.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No questions added yet</p>
                      <p className="text-xs mt-1">Add questions or generate with AI</p>
                    </div>
                  ) : (
                    <DraggableContainer items={questions} onReorder={handleReorderQuestions} keyExtractor={(q) => q.id}>
                      {questions.map((question, idx) => (
                        <DraggableItem key={question.id} id={question.id}>
                          <div className="p-4 rounded-lg bg-[#0f1623] border border-[#2a3548] hover:border-violet-500/40 transition-all">
                            <div className="flex items-start gap-3">
                              <GripVertical className="h-5 w-5 text-slate-500 mt-1 flex-shrink-0 cursor-grab" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1 mr-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge variant="outline" className="text-[10px]">Q{idx + 1}</Badge>
                                      <Badge className="text-[10px] capitalize bg-blue-500/20 text-blue-400 border-blue-500/30">{question.difficulty}</Badge>
                                      <Badge className="text-[10px] bg-slate-500/20 text-slate-400">{question.category}</Badge>
                                    </div>
                                    <p className="text-sm text-white font-medium">{question.question}</p>
                                  </div>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <Button size="sm" variant="ghost" onClick={() => handleEditQuestion(idx)} className="h-7 w-7 p-0">
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => handleDuplicateQuestion(idx)} className="h-7 w-7 p-0">
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => handleDeleteQuestion(idx)} className="h-7 w-7 p-0 text-rose-400 hover:text-rose-300">
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                {question.type === "multiple_choice" && (
                                  <div className="text-xs text-slate-400 space-y-1 mt-2">
                                    {question.options.map((opt, optIdx) => (
                                      <div key={optIdx} className={`flex items-center gap-2 ${optIdx === question.correct_answer ? 'text-emerald-400' : ''}`}>
                                        <span>{String.fromCharCode(65 + optIdx)}.</span>
                                        <span>{opt}</span>
                                        {optIdx === question.correct_answer && <CheckCircle2 className="h-3 w-3" />}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </DraggableItem>
                      ))}
                    </DraggableContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="custom">
              <Card className="bg-[#1a2332] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="h-5 w-5 text-violet-400" />
                    AI Custom Template Generator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Target Audience</Label>
                      <Input
                        value={customTemplateParams.targetAudience}
                        onChange={(e) => setCustomTemplateParams({...customTemplateParams, targetAudience: e.target.value})}
                        placeholder="e.g., Bank Compliance Officers, IT Auditors"
                        className="bg-[#0f1623] border-[#2a3548] text-white"
                      />
                    </div>
                    <div>
                      <Label>Regulatory Focus</Label>
                      <Input
                        value={customTemplateParams.regulatoryFocus}
                        onChange={(e) => setCustomTemplateParams({...customTemplateParams, regulatoryFocus: e.target.value})}
                        placeholder="e.g., Cybersecurity, BSA/AML, Fair Lending"
                        className="bg-[#0f1623] border-[#2a3548] text-white"
                      />
                    </div>
                    <div>
                      <Label>Industry Vertical (Optional)</Label>
                      <Input
                        value={customTemplateParams.industryVertical}
                        onChange={(e) => setCustomTemplateParams({...customTemplateParams, industryVertical: e.target.value})}
                        placeholder="e.g., Community Banks, Credit Unions"
                        className="bg-[#0f1623] border-[#2a3548] text-white"
                      />
                    </div>
                    <div>
                      <Label>Difficulty Distribution</Label>
                      <Select 
                        value={customTemplateParams.difficultyDistribution} 
                        onValueChange={(v) => setCustomTemplateParams({...customTemplateParams, difficultyDistribution: v})}
                      >
                        <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                          <SelectItem value="beginner-focused">Beginner Focused</SelectItem>
                          <SelectItem value="balanced">Balanced Mix</SelectItem>
                          <SelectItem value="advanced-focused">Advanced Focused</SelectItem>
                          <SelectItem value="expert-only">Expert Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-violet-500/10 border border-violet-500/20">
                    <h4 className="text-sm font-semibold text-violet-400 mb-2">How Custom Templates Work</h4>
                    <ul className="text-xs text-slate-300 space-y-1">
                      <li>• AI analyzes your target audience to determine appropriate knowledge level</li>
                      <li>• Questions are tailored to specific regulatory areas you specify</li>
                      <li>• Industry-specific scenarios and examples are included when applicable</li>
                      <li>• Difficulty distribution matches your preference automatically</li>
                      <li>• Each question includes comprehensive explanations</li>
                    </ul>
                  </div>

                  <Button
                    onClick={handleGenerateCustomTemplate}
                    disabled={generatingAI || !customTemplateParams.targetAudience || !customTemplateParams.regulatoryFocus}
                    className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                  >
                    {generatingAI ? (
                      <>
                        <Brain className="h-4 w-4 mr-2 animate-pulse" />
                        Generating Custom Exam...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Custom Exam
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview">
              <Card className="bg-[#1a2332] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-base">Exam Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 rounded-lg bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20">
                      <h3 className="text-lg font-bold text-white mb-1">{examConfig.title || "Untitled Exam"}</h3>
                      <p className="text-sm text-slate-300 mb-3">{examConfig.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                          {questions.length} Questions
                        </Badge>
                        <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">
                          {examConfig.duration_minutes} minutes
                        </Badge>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          Passing: {examConfig.passing_score}%
                        </Badge>
                      </div>
                    </div>

                    <ScrollArea className="h-[500px]">
                      <div className="space-y-4 pr-4">
                        {questions.map((q, idx) => (
                          <div key={q.id} className="p-4 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                            <div className="flex items-start gap-3 mb-3">
                              <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">Q{idx + 1}</Badge>
                              <p className="text-sm text-white flex-1">{q.question}</p>
                            </div>
                            {q.type === "multiple_choice" && (
                              <div className="space-y-2 ml-10">
                                {q.options.map((opt, optIdx) => (
                                  <div key={optIdx} className="flex items-center gap-2 text-sm text-slate-300">
                                    <span className="font-mono">{String.fromCharCode(65 + optIdx)}.</span>
                                    <span>{opt}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="import">
              <Card className="bg-[#1a2332] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-base">Import Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <h4 className="text-sm font-semibold text-blue-400 mb-2">From Question Bank</h4>
                    <p className="text-xs text-slate-400 mb-3">Select questions from your existing question bank</p>
                    {questionBank.length === 0 ? (
                      <p className="text-xs text-slate-500">No questions in bank</p>
                    ) : (
                      <Button onClick={() => handleImportFromBank(questionBank.slice(0, 10))} variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
                        <Download className="h-4 w-4 mr-2" />
                        Import {Math.min(10, questionBank.length)} Questions
                      </Button>
                    )}
                  </div>

                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <h4 className="text-sm font-semibold text-amber-400 mb-2">From File</h4>
                    <p className="text-xs text-slate-400 mb-3">Upload JSON file with exam questions</p>
                    <Button variant="outline" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload JSON
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportExam} className="border-[#2a3548]">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-[#2a3548]">
                Cancel
              </Button>
              <Button onClick={handleSaveExam} className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700">
                <Save className="h-4 w-4 mr-2" />
                Save Exam
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}