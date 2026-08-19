import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Sparkles, Loader2, Zap, Target, TrendingUp, CheckCircle2, Shuffle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import AIQuizGenerator from "./AIQuizGenerator";

const FRAMEWORKS = ["SOX", "SOC2", "ISO27001", "GDPR", "PCI-DSS", "HIPAA", "NIST", "COBIT"];

export default function QuestionBankAIHub({ questions, onGenerate }) {
  const [generating, setGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [config, setConfig] = useState({
    framework: 'SOX',
    difficulty: 'intermediate',
    count: 5,
    topic: '',
    style: 'scenario'
  });

  const generateQuestions = async () => {
    if (!config.topic.trim()) {
      toast.error("Please specify a topic");
      return;
    }

    setGenerating(true);
    setGeneratedQuestions([]);

    try {
      const prompt = `You are an expert GRC exam question writer. Generate ${config.count} high-quality exam questions.

REQUIREMENTS:
- Framework: ${config.framework}
- Difficulty: ${config.difficulty}
- Topic: ${config.topic}
- Style: ${config.style}

For each question, provide:
1. Clear, professional question text
2. Four answer options (A, B, C, D)
3. Correct answer
4. Detailed explanation
5. Relevant tags
6. Risk level assessment

Format as JSON array:
[{
  "question_text": "...",
  "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
  "correct_answer": "A",
  "explanation": "...",
  "framework": "${config.framework}",
  "difficulty": "${config.difficulty}",
  "question_type": "${config.style}",
  "risk_level": "medium|high|critical",
  "tags": ["tag1", "tag2"],
  "regulation_section": "..."
}]

Make questions realistic, relevant, and professionally written.`;

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
                  options: { type: "array" },
                  correct_answer: { type: "string" },
                  explanation: { type: "string" },
                  framework: { type: "string" },
                  difficulty: { type: "string" },
                  question_type: { type: "string" },
                  risk_level: { type: "string" },
                  tags: { type: "array" },
                  regulation_section: { type: "string" }
                }
              }
            }
          }
        }
      });

      setGeneratedQuestions(response.questions || []);
      toast.success(`Generated ${response.questions?.length || 0} questions`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate questions");
    } finally {
      setGenerating(false);
    }
  };

  const saveQuestion = (question) => {
    onGenerate({
      ...question,
      is_verified: false,
      status: 'active',
      usage_count: 0,
      quality_rating: 4
    });
  };

  const saveAllQuestions = () => {
    generatedQuestions.forEach(q => saveQuestion(q));
    setGeneratedQuestions([]);
    toast.success("All questions saved to bank");
  };

  // AI Analytics
  const totalQuestions = questions.length;
  const aiGeneratedCount = questions.filter(q => q.source === 'ai_generated').length;
  const avgQuality = questions.length > 0 
    ? (questions.reduce((sum, q) => sum + (q.quality_rating || 3), 0) / questions.length).toFixed(1)
    : 0;
  const gapAnalysis = FRAMEWORKS.map(fw => ({
    framework: fw,
    count: questions.filter(q => q.framework === fw).length,
    target: 50
  }));

  return (
    <div className="space-y-6">
      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="bg-[#1a2332] border border-[#2a3548]">
          <TabsTrigger value="generate">
            <Sparkles className="h-4 w-4 mr-2" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="quiz">
            <Shuffle className="h-4 w-4 mr-2" />
            Quiz Generator
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="gaps">
            <Target className="h-4 w-4 mr-2" />
            Gap Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          {/* Generator Form */}
          <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-500/20">
                  <Brain className="h-5 w-5 text-indigo-400" />
                </div>
                AI Question Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Framework</Label>
                  <Select value={config.framework} onValueChange={(v) => setConfig({...config, framework: v})}>
                    <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      {FRAMEWORKS.map(fw => (
                        <SelectItem key={fw} value={fw} className="text-white">{fw}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Difficulty</Label>
                  <Select value={config.difficulty} onValueChange={(v) => setConfig({...config, difficulty: v})}>
                    <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="beginner" className="text-white">Beginner</SelectItem>
                      <SelectItem value="intermediate" className="text-white">Intermediate</SelectItem>
                      <SelectItem value="advanced" className="text-white">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Question Style</Label>
                  <Select value={config.style} onValueChange={(v) => setConfig({...config, style: v})}>
                    <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="scenario" className="text-white">Scenario-Based</SelectItem>
                      <SelectItem value="definition" className="text-white">Definition</SelectItem>
                      <SelectItem value="technical" className="text-white">Technical</SelectItem>
                      <SelectItem value="conceptual" className="text-white">Conceptual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Number of Questions</Label>
                  <Input
                    type="number"
                    value={config.count}
                    onChange={(e) => setConfig({...config, count: parseInt(e.target.value) || 5})}
                    min="1"
                    max="20"
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                  />
                </div>
              </div>

              <div>
                <Label>Topic / Focus Area</Label>
                <Textarea
                  value={config.topic}
                  onChange={(e) => setConfig({...config, topic: e.target.value})}
                  placeholder="E.g., Access controls, data encryption, vendor risk management..."
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                  rows={3}
                />
              </div>

              <Button
                onClick={generateQuestions}
                disabled={generating || !config.topic.trim()}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Questions
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Results */}
          {generatedQuestions.length > 0 && (
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Generated Questions ({generatedQuestions.length})</CardTitle>
                  <Button onClick={saveAllQuestions} className="bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Save All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {generatedQuestions.map((question, idx) => (
                  <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-violet-500/10 text-violet-400">{question.framework}</Badge>
                          <Badge className="bg-amber-500/10 text-amber-400 capitalize">{question.difficulty}</Badge>
                          <Badge className="bg-blue-500/10 text-blue-400 capitalize">{question.question_type}</Badge>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => saveQuestion(question)}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          Save
                        </Button>
                      </div>
                      
                      <div>
                        <h4 className="text-white font-medium mb-2">{question.question_text}</h4>
                        <div className="space-y-1">
                          {question.options?.map((opt, i) => (
                            <div 
                              key={i} 
                              className={`p-2 rounded text-sm ${
                                opt.charAt(0) === question.correct_answer 
                                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' 
                                  : 'bg-[#1a2332] text-slate-300'
                              }`}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="text-xs text-slate-400 pt-2 border-t border-[#2a3548]">
                        <strong className="text-white">Explanation:</strong> {question.explanation}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="quiz">
          <AIQuizGenerator questions={questions} onSave={onGenerate} />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <Brain className="h-8 w-8 text-indigo-400" />
                  <div className="text-3xl font-bold text-white">{aiGeneratedCount}</div>
                </div>
                <div className="text-sm text-white font-semibold">AI Generated</div>
                <div className="text-xs text-slate-400 mt-1">
                  {totalQuestions > 0 ? Math.round((aiGeneratedCount/totalQuestions)*100) : 0}% of total
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <Zap className="h-8 w-8 text-emerald-400" />
                  <div className="text-3xl font-bold text-white">{avgQuality}</div>
                </div>
                <div className="text-sm text-white font-semibold">Avg Quality</div>
                <div className="text-xs text-slate-400 mt-1">Out of 5.0</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <Target className="h-8 w-8 text-amber-400" />
                  <div className="text-3xl font-bold text-white">{totalQuestions}</div>
                </div>
                <div className="text-sm text-white font-semibold">Total Bank</div>
                <div className="text-xs text-slate-400 mt-1">Questions available</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gaps">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base">Coverage Gap Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gapAnalysis.map((item) => {
                  const percentage = Math.round((item.count / item.target) * 100);
                  const isLow = percentage < 50;
                  
                  return (
                    <div key={item.framework}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{item.framework}</span>
                          {isLow && (
                            <Badge className="bg-amber-500/10 text-amber-400 text-[10px]">
                              Low Coverage
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-slate-400">{item.count} / {item.target}</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#151d2e] overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            isLow ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}