import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Sparkles, Loader2, Plus, Trash2, Eye, Download, Shuffle } from "lucide-react";
import QuestionCard from "./QuestionCard";

const FRAMEWORKS = ["SOX", "SOC2", "ISO27001", "GDPR", "PCI-DSS", "HIPAA", "NIST", "COBIT", "FFIEC", "DORA", "EU_AI_ACT", "CCPA"];

export default function AIQuizGenerator({ questions, onSave }) {
  const [generating, setGenerating] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Configuration state
  const [config, setConfig] = useState({
    questionCount: 20,
    frameworks: ["SOX"],
    difficulty: { beginner: 30, intermediate: 50, advanced: 20 },
    includeCompliance: [],
    includeRisks: [],
    topics: []
  });

  const [topicInput, setTopicInput] = useState("");

  // Fetch compliance and risks for selection
  const [compliance, setCompliance] = useState([]);
  const [risks, setRisks] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const loadOptions = async () => {
    setLoadingOptions(true);
    try {
      const [compData, riskData] = await Promise.all([
        base44.entities.Compliance.list('-created_date', 100),
        base44.entities.Risk.list('-created_date', 100)
      ]);
      setCompliance(compData);
      setRisks(riskData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const toggleFramework = (framework) => {
    setConfig(prev => ({
      ...prev,
      frameworks: prev.frameworks.includes(framework)
        ? prev.frameworks.filter(f => f !== framework)
        : [...prev.frameworks, framework]
    }));
  };

  const updateDifficulty = (level, value) => {
    setConfig(prev => ({
      ...prev,
      difficulty: { ...prev.difficulty, [level]: value }
    }));
  };

  const addTopic = () => {
    if (topicInput.trim() && !config.topics.includes(topicInput.trim())) {
      setConfig(prev => ({ ...prev, topics: [...prev.topics, topicInput.trim()] }));
      setTopicInput("");
    }
  };

  const removeTopic = (topic) => {
    setConfig(prev => ({ ...prev, topics: prev.topics.filter(t => t !== topic) }));
  };

  const generateQuiz = async () => {
    if (config.frameworks.length === 0) {
      toast.error("Please select at least one framework");
      return;
    }

    setGenerating(true);
    try {
      // Calculate difficulty distribution
      const difficultyBreakdown = {
        beginner: Math.round(config.questionCount * (config.difficulty.beginner / 100)),
        intermediate: Math.round(config.questionCount * (config.difficulty.intermediate / 100)),
        advanced: Math.round(config.questionCount * (config.difficulty.advanced / 100))
      };

      // Curate existing questions first
      let curatedQuestions = [];
      const availableQuestions = questions.filter(q => 
        config.frameworks.includes(q.framework) &&
        q.status === 'active'
      );

      // Filter by topics if specified
      let filteredByTopic = availableQuestions;
      if (config.topics.length > 0) {
        filteredByTopic = availableQuestions.filter(q =>
          config.topics.some(topic => 
            q.question_text?.toLowerCase().includes(topic.toLowerCase()) ||
            q.tags?.some(tag => tag.toLowerCase().includes(topic.toLowerCase()))
          )
        );
      }

      // Filter by compliance if specified
      if (config.includeCompliance.length > 0) {
        filteredByTopic = filteredByTopic.filter(q =>
          q.linked_compliance?.some(id => config.includeCompliance.includes(id))
        );
      }

      // Filter by risks if specified
      if (config.includeRisks.length > 0) {
        filteredByTopic = filteredByTopic.filter(q =>
          q.linked_risks?.some(id => config.includeRisks.includes(id))
        );
      }

      // Select questions by difficulty
      ['beginner', 'intermediate', 'advanced'].forEach(diff => {
        const diffQuestions = filteredByTopic.filter(q => q.difficulty === diff);
        const shuffled = diffQuestions.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, difficultyBreakdown[diff]);
        curatedQuestions = [...curatedQuestions, ...selected];
      });

      const remaining = config.questionCount - curatedQuestions.length;

      // Generate additional questions if needed
      let generatedQuestions = [];
      if (remaining > 0) {
        const prompt = `Generate ${remaining} exam questions for the following specifications:

Frameworks: ${config.frameworks.join(', ')}
${config.topics.length > 0 ? `Topics: ${config.topics.join(', ')}` : ''}
${config.includeCompliance.length > 0 ? `Must relate to compliance: ${compliance.filter(c => config.includeCompliance.includes(c.id)).map(c => c.requirement).join(', ')}` : ''}
${config.includeRisks.length > 0 ? `Must relate to risks: ${risks.filter(r => config.includeRisks.includes(r.id)).map(r => r.title).join(', ')}` : ''}

Difficulty distribution needed:
- Beginner: ${Math.max(0, difficultyBreakdown.beginner - curatedQuestions.filter(q => q.difficulty === 'beginner').length)} questions
- Intermediate: ${Math.max(0, difficultyBreakdown.intermediate - curatedQuestions.filter(q => q.difficulty === 'intermediate').length)} questions
- Advanced: ${Math.max(0, difficultyBreakdown.advanced - curatedQuestions.filter(q => q.difficulty === 'advanced').length)} questions

For each question provide:
- question_text
- options (array of 4 options starting with A), B), C), D))
- correct_answer (A, B, C, or D)
- explanation
- difficulty (beginner, intermediate, or advanced)
- question_type (scenario, definition, technical, or conceptual)
- tags (array of relevant tags)

Generate diverse, realistic exam questions that test practical knowledge and compliance understanding.`;

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
                    question_text: { type: "string" },
                    options: { type: "array", items: { type: "string" } },
                    correct_answer: { type: "string" },
                    explanation: { type: "string" },
                    difficulty: { type: "string" },
                    question_type: { type: "string" },
                    tags: { type: "array", items: { type: "string" } }
                  }
                }
              }
            }
          }
        });

        generatedQuestions = response.questions.map(q => ({
          ...q,
          framework: config.frameworks[0],
          source_module: 'AI Generated',
          linked_compliance: config.includeCompliance,
          linked_risks: config.includeRisks,
          is_generated: true,
          status: 'draft'
        }));
      }

      const finalQuiz = [...curatedQuestions, ...generatedQuestions].slice(0, config.questionCount);

      setGeneratedQuiz({
        title: `${config.frameworks.join(', ')} Assessment`,
        config: config,
        questions: finalQuiz,
        stats: {
          curated: curatedQuestions.length,
          generated: generatedQuestions.length,
          total: finalQuiz.length
        }
      });

      setPreviewMode(true);
      toast.success(`Quiz generated with ${finalQuiz.length} questions!`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate quiz");
    } finally {
      setGenerating(false);
    }
  };

  const removeQuestion = (index) => {
    setGeneratedQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const saveQuiz = async () => {
    if (!generatedQuiz) return;

    try {
      // Save generated questions to the bank
      for (const question of generatedQuiz.questions) {
        if (question.is_generated) {
          await base44.entities.QuestionBank.create({
            ...question,
            usage_count: 0,
            is_verified: false
          });
        }
      }

      toast.success("Quiz saved to Question Bank!");
      if (onSave) onSave();
      setGeneratedQuiz(null);
      setPreviewMode(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save quiz");
    }
  };

  if (previewMode && generatedQuiz) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-400" />
                Generated Quiz Preview
              </CardTitle>
              <Button onClick={() => setPreviewMode(false)} variant="outline" className="border-emerald-500/30 text-emerald-400">
                ← Back to Config
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{generatedQuiz.title}</h3>
                <div className="flex gap-2">
                  <Badge className="bg-emerald-500/20 text-emerald-400">
                    {generatedQuiz.stats.curated} Curated
                  </Badge>
                  <Badge className="bg-violet-500/20 text-violet-400">
                    {generatedQuiz.stats.generated} Generated
                  </Badge>
                  <Badge className="bg-blue-500/20 text-blue-400">
                    {generatedQuiz.stats.total} Total
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={saveQuiz} className="bg-emerald-600 hover:bg-emerald-700">
                  <Download className="h-4 w-4 mr-2" />
                  Save to Bank
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <ScrollArea className="h-[600px]">
          <div className="space-y-4 pr-4">
            {generatedQuiz.questions.map((question, index) => (
              <div key={index} className="relative">
                <div className="absolute top-2 left-2 z-10 flex gap-2">
                  <Badge className="bg-slate-900 text-white">Q{index + 1}</Badge>
                  {question.is_generated && (
                    <Badge className="bg-violet-500/90 text-white">AI Generated</Badge>
                  )}
                </div>
                <div className="absolute top-2 right-2 z-10">
                  <Button
                    onClick={() => removeQuestion(index)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="pt-12">
                  <QuestionCard question={question} onEdit={() => {}} onDelete={() => {}} />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-400" />
            AI Quiz Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 mb-4">
            Configure your quiz parameters and let AI curate existing questions and generate new ones to meet your requirements.
          </p>

          <div className="space-y-6">
            {/* Question Count */}
            <div>
              <Label className="text-white mb-2 block">Number of Questions</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[config.questionCount]}
                  onValueChange={([value]) => setConfig(prev => ({ ...prev, questionCount: value }))}
                  min={5}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={config.questionCount}
                  onChange={(e) => setConfig(prev => ({ ...prev, questionCount: parseInt(e.target.value) || 20 }))}
                  className="w-20 bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
            </div>

            {/* Frameworks */}
            <div>
              <Label className="text-white mb-2 block">Target Frameworks *</Label>
              <div className="flex flex-wrap gap-2">
                {FRAMEWORKS.map(fw => (
                  <Badge
                    key={fw}
                    onClick={() => toggleFramework(fw)}
                    className={`cursor-pointer transition-all ${
                      config.frameworks.includes(fw)
                        ? 'bg-violet-600 text-white'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                    {fw}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Topics */}
            <div>
              <Label className="text-white mb-2 block">Topics (Optional)</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
                  placeholder="e.g., access control, encryption"
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
                <Button onClick={addTopic} size="sm" variant="outline" className="border-violet-500/30 text-violet-400">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {config.topics.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {config.topics.map(topic => (
                    <Badge key={topic} className="bg-blue-500/20 text-blue-400">
                      {topic}
                      <button onClick={() => removeTopic(topic)} className="ml-2 hover:text-white">×</button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Difficulty Distribution */}
            <div>
              <Label className="text-white mb-3 block">Difficulty Distribution (%)</Label>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-emerald-400">Beginner</span>
                    <span className="text-sm text-white font-semibold">{config.difficulty.beginner}%</span>
                  </div>
                  <Slider
                    value={[config.difficulty.beginner]}
                    onValueChange={([value]) => updateDifficulty('beginner', value)}
                    max={100}
                    className="flex-1"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-amber-400">Intermediate</span>
                    <span className="text-sm text-white font-semibold">{config.difficulty.intermediate}%</span>
                  </div>
                  <Slider
                    value={[config.difficulty.intermediate]}
                    onValueChange={([value]) => updateDifficulty('intermediate', value)}
                    max={100}
                    className="flex-1"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-rose-400">Advanced</span>
                    <span className="text-sm text-white font-semibold">{config.difficulty.advanced}%</span>
                  </div>
                  <Slider
                    value={[config.difficulty.advanced]}
                    onValueChange={([value]) => updateDifficulty('advanced', value)}
                    max={100}
                    className="flex-1"
                  />
                </div>
                <div className="text-xs text-slate-500">
                  Total: {config.difficulty.beginner + config.difficulty.intermediate + config.difficulty.advanced}%
                </div>
              </div>
            </div>

            {/* Compliance & Risk Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white mb-2 block">Link to Compliance (Optional)</Label>
                <Button
                  onClick={loadOptions}
                  disabled={loadingOptions || compliance.length > 0}
                  variant="outline"
                  size="sm"
                  className="mb-2 border-emerald-500/30 text-emerald-400"
                >
                  {loadingOptions ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Load Options'}
                </Button>
                {compliance.length > 0 && (
                  <ScrollArea className="h-32 bg-[#151d2e] rounded-lg border border-[#2a3548] p-2">
                    {compliance.slice(0, 20).map(comp => (
                      <div key={comp.id} className="flex items-center gap-2 mb-2">
                        <Checkbox
                          checked={config.includeCompliance.includes(comp.id)}
                          onCheckedChange={(checked) => {
                            setConfig(prev => ({
                              ...prev,
                              includeCompliance: checked
                                ? [...prev.includeCompliance, comp.id]
                                : prev.includeCompliance.filter(id => id !== comp.id)
                            }));
                          }}
                        />
                        <span className="text-xs text-slate-300">{comp.requirement}</span>
                      </div>
                    ))}
                  </ScrollArea>
                )}
              </div>

              <div>
                <Label className="text-white mb-2 block">Link to Risks (Optional)</Label>
                <Button
                  onClick={loadOptions}
                  disabled={loadingOptions || risks.length > 0}
                  variant="outline"
                  size="sm"
                  className="mb-2 border-rose-500/30 text-rose-400"
                >
                  {loadingOptions ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Load Options'}
                </Button>
                {risks.length > 0 && (
                  <ScrollArea className="h-32 bg-[#151d2e] rounded-lg border border-[#2a3548] p-2">
                    {risks.slice(0, 20).map(risk => (
                      <div key={risk.id} className="flex items-center gap-2 mb-2">
                        <Checkbox
                          checked={config.includeRisks.includes(risk.id)}
                          onCheckedChange={(checked) => {
                            setConfig(prev => ({
                              ...prev,
                              includeRisks: checked
                                ? [...prev.includeRisks, risk.id]
                                : prev.includeRisks.filter(id => id !== risk.id)
                            }));
                          }}
                        />
                        <span className="text-xs text-slate-300">{risk.title}</span>
                      </div>
                    ))}
                  </ScrollArea>
                )}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={generateQuiz}
              disabled={generating || config.frameworks.length === 0}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                <>
                  <Shuffle className="h-4 w-4 mr-2" />
                  Generate Quiz
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}