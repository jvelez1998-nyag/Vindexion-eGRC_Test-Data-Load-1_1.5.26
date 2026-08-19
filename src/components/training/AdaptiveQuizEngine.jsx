import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Brain, Zap, CheckCircle2, XCircle, Target, 
  TrendingUp, AlertCircle, Sparkles, RefreshCw, Loader2
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function AdaptiveQuizEngine({ userEmail, progress = [] }) {
  const [selectedModule, setSelectedModule] = useState('risk_management');
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const queryClient = useQueryClient();

  const updateProgressMutation = useMutation({
    mutationFn: (data) => base44.entities.TrainingProgress.create({ ...data, user_email: userEmail }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-progress'] });
    }
  });

  const modules = [
    { id: 'risk_management', name: 'Risk Management' },
    { id: 'controls', name: 'Controls' },
    { id: 'compliance', name: 'Compliance' },
    { id: 'audits', name: 'Audits' },
    { id: 'incidents', name: 'Incidents' }
  ];

  const generateAdaptiveQuiz = async () => {
    setGenerating(true);
    try {
      const moduleProgress = progress.filter(p => p.module === selectedModule);
      const avgScore = moduleProgress.length > 0 
        ? Math.round(moduleProgress.reduce((sum, p) => sum + (p.score || 0), 0) / moduleProgress.filter(p => p.score).length)
        : 0;
      
      const weakAreas = moduleProgress
        .flatMap(p => p.weak_areas || [])
        .reduce((acc, area) => {
          acc[area] = (acc[area] || 0) + 1;
          return acc;
        }, {});

      const difficulty = avgScore >= 80 ? 'advanced' : avgScore >= 60 ? 'intermediate' : 'beginner';

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate an adaptive quiz for ${selectedModule.replace(/_/g, ' ')} module.

USER PERFORMANCE DATA:
- Average Score: ${avgScore}%
- Completed Lessons: ${moduleProgress.length}
- Weak Areas: ${JSON.stringify(weakAreas)}
- Recommended Difficulty: ${difficulty}

Create 10 questions that:
1. Focus on weak areas if identified
2. Match the user's skill level (${difficulty})
3. Include practical scenarios
4. Provide detailed explanations
5. Test both knowledge and application

Return structured quiz with questions, options, correct answers, and explanations.`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            difficulty: { type: "string" },
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  text: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correct: { type: "string" },
                  explanation: { type: "string" },
                  topic: { type: "string" }
                }
              }
            }
          }
        }
      });

      setQuiz(result);
      setCurrentQuestion(0);
      setAnswers({});
      setShowResults(false);
      toast.success("Adaptive quiz generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate quiz");
    } finally {
      setGenerating(false);
    }
  };

  const submitQuiz = async () => {
    const correct = quiz.questions.filter(q => answers[q.id] === q.correct).length;
    const score = Math.round((correct / quiz.questions.length) * 100);
    
    setShowResults(true);

    // Identify weak areas
    const weakTopics = quiz.questions
      .filter(q => answers[q.id] !== q.correct)
      .map(q => q.topic);

    // Save progress
    updateProgressMutation.mutate({
      module: selectedModule,
      lesson_id: `quiz-${Date.now()}`,
      lesson_title: quiz.title,
      status: score >= 70 ? 'completed' : 'in_progress',
      score,
      attempts: 1,
      quiz_answers: quiz.questions.map(q => ({
        question: q.text,
        user_answer: answers[q.id],
        correct_answer: q.correct,
        is_correct: answers[q.id] === q.correct
      })),
      weak_areas: weakTopics,
      mastery_level: score,
      last_accessed: new Date().toISOString()
    });

    // Generate AI feedback
    try {
      const feedbackResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide personalized feedback for a student who scored ${score}% on a ${selectedModule.replace(/_/g, ' ')} quiz.

PERFORMANCE:
- Score: ${score}%
- Correct: ${correct}/${quiz.questions.length}
- Weak Topics: ${weakTopics.join(', ')}

Provide:
1. Brief performance assessment (encouraging tone)
2. Specific areas to review
3. Next steps for improvement
4. Motivational message`,
        response_json_schema: {
          type: "object",
          properties: {
            assessment: { type: "string" },
            review_areas: { type: "array", items: { type: "string" } },
            next_steps: { type: "array", items: { type: "string" } },
            motivation: { type: "string" }
          }
        }
      });
      setFeedback(feedbackResult);
    } catch (error) {
      console.error(error);
    }

    if (score >= 90) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  if (showResults && feedback) {
    const score = Math.round((quiz.questions.filter(q => answers[q.id] === q.correct).length / quiz.questions.length) * 100);

    return (
      <div className="space-y-6">
        <Card className={`bg-gradient-to-r ${score >= 70 ? 'from-emerald-500/10 to-green-500/10 border-emerald-500/20' : 'from-amber-500/10 to-orange-500/10 border-amber-500/20'} p-8 text-center`}>
          {score >= 70 ? (
            <CheckCircle2 className="h-20 w-20 text-emerald-400 mx-auto mb-4" />
          ) : (
            <Target className="h-20 w-20 text-amber-400 mx-auto mb-4" />
          )}
          <h2 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h2>
          <p className="text-xl text-slate-300 mb-6">{feedback.assessment}</p>
          
          <div className="text-6xl font-bold text-indigo-400 mb-2">{score}%</div>
          <p className="text-slate-400 mb-6">
            {quiz.questions.filter(q => answers[q.id] === q.correct).length} of {quiz.questions.length} correct
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">
            <Card className="bg-amber-500/10 border-amber-500/20 p-4">
              <h4 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Review These Areas
              </h4>
              <ul className="space-y-1">
                {feedback.review_areas?.map((area, idx) => (
                  <li key={idx} className="text-sm text-slate-300">• {area}</li>
                ))}
              </ul>
            </Card>

            <Card className="bg-indigo-500/10 border-indigo-500/20 p-4">
              <h4 className="text-sm font-semibold text-indigo-400 mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Next Steps
              </h4>
              <ul className="space-y-1">
                {feedback.next_steps?.map((step, idx) => (
                  <li key={idx} className="text-sm text-slate-300">• {step}</li>
                ))}
              </ul>
            </Card>
          </div>

          <p className="text-sm text-purple-400 italic mt-6">{feedback.motivation}</p>

          <div className="flex justify-center gap-3 mt-8">
            <Button onClick={() => setQuiz(null)} variant="outline" className="border-[#2a3548]">
              Back to Quizzes
            </Button>
            <Button onClick={generateAdaptiveQuiz} className="bg-indigo-600 hover:bg-indigo-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Another Quiz
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (quiz) {
    const question = quiz.questions[currentQuestion];
    const progressPercent = ((currentQuestion + 1) / quiz.questions.length) * 100;

    return (
      <div className="space-y-6">
        <Card className="bg-[#1a2332] border-[#2a3548] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">{quiz.title}</h2>
              <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 mt-2">
                {quiz.difficulty} Level
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400">Question {currentQuestion + 1} of {quiz.questions.length}</div>
              <div className="text-xs text-indigo-400">{Object.keys(answers).length} answered</div>
            </div>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-lg text-white">{question.text}</CardTitle>
            <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 w-fit mt-2 text-xs">
              {question.topic}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={answers[question.id] || ''} onValueChange={(val) => setAnswers({ ...answers, [question.id]: val })}>
              {question.options.map((option, idx) => (
                <div 
                  key={idx}
                  className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${
                    answers[question.id] === option
                      ? 'bg-indigo-500/20 border-indigo-500/40'
                      : 'bg-[#151d2e] border-[#2a3548] hover:border-[#3a4558]'
                  }`}
                >
                  <RadioGroupItem value={option} id={`opt-${idx}`} />
                  <Label htmlFor={`opt-${idx}`} className="text-sm text-white cursor-pointer flex-1">{option}</Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex justify-between pt-4 border-t border-[#2a3548]">
              <Button
                onClick={() => setCurrentQuestion(currentQuestion - 1)}
                disabled={currentQuestion === 0}
                variant="outline"
                className="border-[#2a3548]"
              >
                Previous
              </Button>

              {currentQuestion === quiz.questions.length - 1 ? (
                <Button 
                  onClick={submitQuiz}
                  disabled={Object.keys(answers).length !== quiz.questions.length}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Submit Quiz
                </Button>
              ) : (
                <Button 
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Next Question
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20 p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
            <Zap className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Adaptive Quiz Engine</h2>
            <p className="text-slate-400 text-sm mt-1">
              AI-generated quizzes that adapt to your skill level and focus on your weak areas
            </p>
          </div>
        </div>
      </Card>

      <Card className="bg-[#1a2332] border-[#2a3548] p-4">
        <Label className="text-sm text-slate-400 mb-3 block">Select Module</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {modules.map(module => (
            <Button
              key={module.id}
              onClick={() => setSelectedModule(module.id)}
              variant={selectedModule === module.id ? "default" : "outline"}
              className={selectedModule === module.id ? "bg-purple-600" : "border-[#2a3548]"}
            >
              {module.name}
            </Button>
          ))}
        </div>
      </Card>

      <Card className="bg-[#1a2332] border-[#2a3548] p-12 text-center">
        <Brain className="h-20 w-20 text-purple-400 mx-auto mb-6" />
        <h3 className="text-xl font-semibold text-white mb-3">AI-Powered Adaptive Learning</h3>
        <p className="text-slate-400 max-w-2xl mx-auto mb-6 leading-relaxed">
          Our AI analyzes your performance history and generates personalized quizzes 
          targeting your specific areas for improvement. Questions adapt to your skill level 
          and focus on topics where you need the most practice.
        </p>
        <Button 
          onClick={generateAdaptiveQuiz}
          disabled={generating}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {generating ? (
            <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Generating Quiz...</>
          ) : (
            <><Sparkles className="h-5 w-5 mr-2" /> Generate Adaptive Quiz</>
          )}
        </Button>
      </Card>
    </div>
  );
}