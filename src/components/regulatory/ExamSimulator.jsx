import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  PlayCircle, CheckCircle2, XCircle, Brain, Clock, 
  Target, Award, RefreshCw, TrendingUp, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function ExamSimulator() {
  const [examType, setExamType] = useState(null);
  const [activeExam, setActiveExam] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  const { data: questionBank = [] } = useQuery({
    queryKey: ['question-bank'],
    queryFn: () => base44.entities.QuestionBank.list(null, 200),
    staleTime: 600000
  });

  const examTypes = [
    { id: 'ffiec', name: 'FFIEC Compliance', duration: 120, questions: 50, passingScore: 70 },
    { id: 'sox', name: 'SOX Controls', duration: 90, questions: 40, passingScore: 75 },
    { id: 'iso27001', name: 'ISO 27001', duration: 120, questions: 50, passingScore: 70 },
    { id: 'nist', name: 'NIST CSF', duration: 90, questions: 40, passingScore: 70 },
    { id: 'gdpr', name: 'GDPR Privacy', duration: 60, questions: 30, passingScore: 75 }
  ];

  const startExam = (type) => {
    const exam = examTypes.find(e => e.id === type);
    const questions = questionBank
      .filter(q => q.category?.toLowerCase().includes(type.toLowerCase()) || q.framework?.toLowerCase().includes(type.toLowerCase()))
      .slice(0, exam.questions);
    
    if (questions.length === 0) {
      toast.error("No questions available for this exam type");
      return;
    }

    setActiveExam({
      ...exam,
      questions: questions.length < exam.questions 
        ? [...questions, ...questionBank.slice(0, exam.questions - questions.length)]
        : questions
    });
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setTimeLeft(exam.duration * 60);
  };

  const submitAnswer = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const nextQuestion = () => {
    if (currentQuestion < activeExam.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitExam = () => {
    const score = calculateScore();
    setShowResults(true);
    
    if (score >= activeExam.passingScore) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      toast.success(`Passed! Score: ${score}%`);
    } else {
      toast.error(`Failed. Score: ${score}% (Required: ${activeExam.passingScore}%)`);
    }
  };

  const calculateScore = () => {
    const correct = activeExam.questions.filter(q => answers[q.id] === q.correct_answer).length;
    return Math.round((correct / activeExam.questions.length) * 100);
  };

  const restartExam = () => {
    setActiveExam(null);
    setExamType(null);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  // Timer effect
  useState(() => {
    if (activeExam && timeLeft !== null && timeLeft > 0 && !showResults) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            submitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeExam, timeLeft, showResults]);

  if (!activeExam) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Exam Simulator</h2>
              <p className="text-slate-400 text-sm mt-1">
                Practice with realistic exam scenarios and instant feedback
              </p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {examTypes.map(exam => (
            <Card 
              key={exam.id}
              className="bg-[#1a2332] border-[#2a3548] hover:border-purple-500/40 transition-all cursor-pointer group"
              onClick={() => startExam(exam.id)}
            >
              <CardHeader>
                <CardTitle className="text-base text-white group-hover:text-purple-400 transition-colors">
                  {exam.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Questions:</span>
                  <span className="text-white font-semibold">{exam.questions}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Duration:</span>
                  <span className="text-white font-semibold">{exam.duration} min</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Passing:</span>
                  <span className="text-emerald-400 font-semibold">{exam.passingScore}%</span>
                </div>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 mt-4">
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Start Exam
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const passed = score >= activeExam.passingScore;
    const correct = activeExam.questions.filter(q => answers[q.id] === q.correct_answer).length;

    return (
      <div className="space-y-6">
        <Card className={`bg-gradient-to-r ${passed ? 'from-emerald-500/10 to-green-500/10 border-emerald-500/20' : 'from-rose-500/10 to-red-500/10 border-rose-500/20'} p-8 text-center`}>
          {passed ? (
            <CheckCircle2 className="h-20 w-20 text-emerald-400 mx-auto mb-4" />
          ) : (
            <XCircle className="h-20 w-20 text-rose-400 mx-auto mb-4" />
          )}
          <h2 className="text-3xl font-bold text-white mb-2">
            {passed ? 'Congratulations!' : 'Not Quite There'}
          </h2>
          <p className="text-slate-300 mb-6">
            {passed 
              ? `You passed the ${activeExam.name} exam!` 
              : `You scored below the passing threshold. Keep practicing!`
            }
          </p>
          
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-6">
            <div>
              <div className="text-4xl font-bold text-indigo-400 mb-1">{score}%</div>
              <div className="text-sm text-slate-400">Your Score</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-1">{correct}/{activeExam.questions.length}</div>
              <div className="text-sm text-slate-400">Correct</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-400 mb-1">{activeExam.passingScore}%</div>
              <div className="text-sm text-slate-400">Required</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Button onClick={restartExam} variant="outline" className="border-[#2a3548]">
              Choose Another Exam
            </Button>
            <Button onClick={() => startExam(activeExam.id)} className="bg-purple-600 hover:bg-purple-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retake Exam
            </Button>
          </div>
        </Card>

        {/* Review Answers */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base">Answer Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeExam.questions.map((q, idx) => {
                const userAnswer = answers[q.id];
                const isCorrect = userAnswer === q.correct_answer;
                
                return (
                  <Card key={q.id} className={`bg-[#151d2e] border ${isCorrect ? 'border-emerald-500/30' : 'border-rose-500/30'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-1" />
                        ) : (
                          <XCircle className="h-5 w-5 text-rose-400 mt-1" />
                        )}
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white mb-2">
                            Q{idx + 1}. {q.question_text}
                          </div>
                          <div className="text-xs text-slate-400 mb-2">
                            Your answer: <span className={isCorrect ? 'text-emerald-400' : 'text-rose-400'}>{userAnswer || 'No answer'}</span>
                          </div>
                          {!isCorrect && (
                            <div className="text-xs text-emerald-400">
                              Correct answer: {q.correct_answer}
                            </div>
                          )}
                          {q.explanation && (
                            <div className="mt-2 p-3 rounded bg-[#0f1623] border border-[#2a3548]">
                              <div className="text-xs text-slate-300">{q.explanation}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = activeExam.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / activeExam.questions.length) * 100;

  return (
    <div className="space-y-6">
      {/* Exam Header */}
      <Card className="bg-[#1a2332] border-[#2a3548] p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{activeExam.name} Exam</h2>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="text-slate-400">
                Question {currentQuestion + 1} of {activeExam.questions.length}
              </span>
              <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                {Object.keys(answers).length} answered
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xl font-bold">
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </span>
            </div>
            <div className="text-xs text-slate-400">Time Remaining</div>
          </div>
        </div>
        <Progress value={progress} className="h-2 mt-4" />
      </Card>

      {/* Question */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-lg text-white">
            {question.question_text}
          </CardTitle>
          {question.category && (
            <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 w-fit mt-2">
              {question.category}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup 
            value={answers[question.id] || ''} 
            onValueChange={(value) => submitAnswer(question.id, value)}
          >
            {question.options?.map((option, idx) => (
              <div 
                key={idx}
                className={`flex items-center space-x-3 p-4 rounded-lg border transition-all cursor-pointer ${
                  answers[question.id] === option
                    ? 'bg-indigo-500/20 border-indigo-500/40'
                    : 'bg-[#151d2e] border-[#2a3548] hover:border-[#3a4558]'
                }`}
              >
                <RadioGroupItem value={option} id={`option-${idx}`} />
                <Label htmlFor={`option-${idx}`} className="text-sm text-white cursor-pointer flex-1">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex items-center justify-between pt-4 border-t border-[#2a3548]">
            <Button
              onClick={previousQuestion}
              disabled={currentQuestion === 0}
              variant="outline"
              className="border-[#2a3548]"
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {currentQuestion === activeExam.questions.length - 1 ? (
                <Button 
                  onClick={submitExam}
                  disabled={Object.keys(answers).length !== activeExam.questions.length}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Submit Exam
                </Button>
              ) : (
                <Button onClick={nextQuestion} className="bg-indigo-600 hover:bg-indigo-700">
                  Next Question
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Navigator */}
      <Card className="bg-[#1a2332] border-[#2a3548] p-4">
        <div className="text-xs text-slate-400 mb-3">Quick Navigation</div>
        <div className="grid grid-cols-10 gap-2">
          {activeExam.questions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentQuestion(idx)}
              className={`aspect-square rounded-lg text-xs font-semibold transition-all ${
                answers[q.id]
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : idx === currentQuestion
                  ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
                  : 'bg-[#151d2e] text-slate-500 border-[#2a3548] hover:border-[#3a4558]'
              } border`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}