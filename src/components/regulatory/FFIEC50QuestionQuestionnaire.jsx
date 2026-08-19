import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Clock, AlertCircle, Award, BarChart3, Brain, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function FFIEC50QuestionQuestionnaire({ onComplete }) {
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [examQuestions, setExamQuestions] = useState([]);

  const { data: questionBank = [] } = useQuery({
    queryKey: ['question-bank'],
    queryFn: () => base44.entities.QuestionBank.list('-created_date', 200),
  });

  const ffiecQuestions = questionBank.filter(q => 
    q.framework === 'FFIEC' && q.status === 'approved'
  ).slice(0, 50);

  const handleGenerateQuestions = async () => {
    setGeneratingQuestions(true);
    try {
      const prompt = `Generate 50 comprehensive FFIEC regulatory examination questions covering all key domains:

Required Categories (distribute evenly):
- Information Security & Cybersecurity
- BSA/AML Compliance
- Third-Party Risk Management
- IT Governance & Risk Management
- Business Continuity & Disaster Recovery
- Data Protection & Privacy
- E-Banking & Digital Services

Requirements:
- Mix of difficulty levels (20% beginner, 50% intermediate, 30% advanced)
- Multiple choice with 4 options each
- Clear, practical, real-world scenarios
- Detailed explanations referencing FFIEC guidelines
- Test both knowledge and application

Return 50 high-quality questions.`;

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
                  category: { type: "string" },
                  question: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correct: { type: "number" },
                  explanation: { type: "string" },
                  difficulty: { type: "string" }
                }
              }
            }
          }
        }
      });

      setExamQuestions(response.questions.map((q, idx) => ({
        ...q,
        id: idx + 1
      })));
      toast.success("50 FFIEC questions generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate questions");
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const questionsToUse = examQuestions.length > 0 ? examQuestions : ffiecQuestions;

  const handleStart = () => {
    if (questionsToUse.length === 0) {
      toast.error("No questions available. Generate questions first.");
      return;
    }
    setStarted(true);
    setStartTime(Date.now());
    setAnswers({});
    setCurrentQuestion(0);
    setShowResults(false);
  };

  const handleAnswer = (questionId, answerIndex) => {
    setAnswers({ ...answers, [questionId]: answerIndex });
  };

  const handleSubmit = () => {
    const minutes = Math.round((Date.now() - startTime) / 60000);
    setTimeSpent(minutes);
    setShowResults(true);
    
    const correct = Object.entries(answers).filter(([qId, ans]) => {
      const question = questionsToUse.find(q => q.id === parseInt(qId));
      return question && ans === question.correct;
    }).length;
    
    const percentage = Math.round((correct / questionsToUse.length) * 100);
    
    if (onComplete) {
      onComplete({ score: percentage, correct, total: questionsToUse.length, timeSpent: minutes });
    }
    
    toast.success(`Exam completed! Score: ${percentage}%`);
  };

  const calculateResults = () => {
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    const categoryScores = {};

    questionsToUse.forEach(q => {
      const answer = answers[q.id];
      if (answer === undefined) {
        unanswered++;
      } else if (answer === q.correct) {
        correct++;
        categoryScores[q.category] = categoryScores[q.category] || { correct: 0, total: 0 };
        categoryScores[q.category].correct++;
      } else {
        incorrect++;
      }
      
      categoryScores[q.category] = categoryScores[q.category] || { correct: 0, total: 0 };
      categoryScores[q.category].total++;
    });

    return { correct, incorrect, unanswered, categoryScores, percentage: Math.round((correct / questionsToUse.length) * 100) };
  };

  if (showResults) {
    const results = calculateResults();
    const passed = results.percentage >= 70;

    return (
      <div className="space-y-4">
        <Card className={`bg-gradient-to-r ${passed ? 'from-emerald-500/10 to-green-500/10 border-emerald-500/20' : 'from-rose-500/10 to-red-500/10 border-rose-500/20'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${passed ? 'bg-emerald-500/20' : 'bg-rose-500/20'} border ${passed ? 'border-emerald-500/30' : 'border-rose-500/30'}`}>
                  {passed ? (
                    <Award className="h-8 w-8 text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-rose-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {passed ? 'Congratulations!' : 'Keep Studying'}
                  </h2>
                  <p className="text-sm text-slate-400">
                    {passed ? 'You passed the FFIEC examination' : 'Review the material and try again'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-4xl font-bold ${passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {results.percentage}%
                </div>
                <div className="text-sm text-slate-400">Final Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-4 gap-3">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span className="text-2xl font-bold text-white">{results.correct}</span>
              </div>
              <div className="text-xs text-slate-400">Correct</div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <XCircle className="h-5 w-5 text-rose-400" />
                <span className="text-2xl font-bold text-white">{results.incorrect}</span>
              </div>
              <div className="text-xs text-slate-400">Incorrect</div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="h-5 w-5 text-amber-400" />
                <span className="text-2xl font-bold text-white">{results.unanswered}</span>
              </div>
              <div className="text-xs text-slate-400">Unanswered</div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-5 w-5 text-indigo-400" />
                <span className="text-2xl font-bold text-white">{timeSpent}</span>
              </div>
              <div className="text-xs text-slate-400">Minutes</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-violet-400" />
              Category Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(results.categoryScores).map(([category, scores]) => {
                const percentage = Math.round((scores.correct / scores.total) * 100);
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-300">{category}</span>
                      <span className="text-sm text-slate-400">
                        {scores.correct}/{scores.total} ({percentage}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button onClick={handleStart} className="bg-indigo-600 hover:bg-indigo-700">
            Retake Exam
          </Button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardContent className="p-8 text-center">
          <div className="inline-flex p-4 rounded-full bg-indigo-500/20 border border-indigo-500/30 mb-4">
            <Award className="h-12 w-12 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">FFIEC Comprehensive Exam</h2>
          <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
            Test your knowledge of FFIEC examination requirements across all domains. 
            This comprehensive exam covers Information Security, Business Continuity, Third-Party Risk Management, 
            IT Governance, and more. Passing score is 70%.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6 max-w-2xl mx-auto">
            <div className="p-4 rounded-lg bg-[#0f1623] border border-[#2a3548]">
              <div className="text-2xl font-bold text-indigo-400 mb-1">{questionsToUse.length || 50}</div>
              <div className="text-xs text-slate-400">Questions</div>
            </div>
            <div className="p-4 rounded-lg bg-[#0f1623] border border-[#2a3548]">
              <div className="text-2xl font-bold text-emerald-400 mb-1">70%</div>
              <div className="text-xs text-slate-400">Pass Rate</div>
            </div>
            <div className="p-4 rounded-lg bg-[#0f1623] border border-[#2a3548]">
              <div className="text-2xl font-bold text-amber-400 mb-1">90</div>
              <div className="text-xs text-slate-400">Minutes</div>
            </div>
          </div>

          {questionsToUse.length === 0 ? (
            <div className="space-y-4">
              <p className="text-amber-400 text-sm">No questions available in your question bank.</p>
              <Button onClick={handleGenerateQuestions} disabled={generatingQuestions} size="lg" className="bg-violet-600 hover:bg-violet-700">
                {generatingQuestions ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generating 50 Questions...
                  </>
                ) : (
                  <>
                    <Brain className="h-5 w-5 mr-2" />
                    Generate FFIEC Questions with AI
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button onClick={handleStart} size="lg" className="bg-indigo-600 hover:bg-indigo-700">
              Start Exam
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const question = questionsToUse[currentQuestion];
  if (!question) {
    return <div className="text-center py-8 text-slate-400">No question available</div>;
  }

  const progress = ((currentQuestion + 1) / questionsToUse.length) * 100;

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border-indigo-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Badge className="bg-indigo-500/20 text-indigo-400">
              Question {currentQuestion + 1} of {questionsToUse.length}
            </Badge>
            <Badge className="bg-violet-500/20 text-violet-400">
              {question.category}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-white leading-relaxed">
            {question.question || question.question_text}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={answers[question.id]?.toString()} onValueChange={(val) => handleAnswer(question.id, parseInt(val))}>
            <div className="space-y-3">
              {(question.options || question.answer_options || []).map((option, idx) => (
                <div key={idx} className="flex items-center space-x-3 p-4 rounded-lg border border-[#2a3548] hover:border-indigo-500/40 transition-all">
                  <RadioGroupItem value={idx.toString()} id={`q${question.id}-opt${idx}`} />
                  <Label htmlFor={`q${question.id}-opt${idx}`} className="text-sm text-slate-300 cursor-pointer flex-1">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className="border-[#2a3548]"
        >
          Previous
        </Button>

        {currentQuestion === questionsToUse.length - 1 ? (
          <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Submit Exam
          </Button>
        ) : (
          <Button onClick={() => setCurrentQuestion(currentQuestion + 1)} className="bg-indigo-600">
            Next Question
          </Button>
        )}
      </div>
    </div>
  );
}