import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Loader2, CheckCircle2, Shield, FileText, ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";
import CustomExamBuilder from "./CustomExamBuilder";
import AIAnswerFeedback from "./AIAnswerFeedback";
import AdaptiveDifficultyEngine from "@/components/exams/AdaptiveDifficultyEngine";
import ExamDaySimulator from "@/components/exams/ExamDaySimulator";
import ExaminerInteractionSimulator from "@/components/exams/ExaminerInteractionSimulator";
import ExaminerPersonaSelector from "@/components/exams/ExaminerPersonaSelector";
import AIQuestionGenerator from "@/components/exams/AIQuestionGenerator";
import EnhancedQuestionDisplay from "@/components/exams/EnhancedQuestionDisplay";
import { processExamCompletion, updateStreak } from "@/components/gamification/GamificationHelper";

const frameworks = [
  { value: "SOX", label: "SOX", description: "Financial reporting controls" },
  { value: "SOC2", label: "SOC 2", description: "Service organization controls" },
  { value: "ISO27001", label: "ISO 27001", description: "Information security" },
  { value: "GDPR", label: "GDPR", description: "Data protection" },
  { value: "PCI-DSS", label: "PCI DSS", description: "Payment card security" },
  { value: "HIPAA", label: "HIPAA", description: "Healthcare data" },
  { value: "NIST", label: "NIST CSF", description: "Cybersecurity framework" },
  { value: "COBIT", label: "COBIT", description: "IT governance" },
  { value: "FFIEC", label: "FFIEC", description: "Financial institution exam" },
  { value: "DORA", label: "DORA", description: "Digital resilience" },
  { value: "EU_AI_ACT", label: "EU AI Act", description: "AI regulation" },
  { value: "CCPA", label: "CCPA", description: "Privacy rights" },
];

const examTypes = [
  { value: "mock_audit", label: "Mock Audit" },
  { value: "readiness_assessment", label: "Readiness Assessment" },
  { value: "gap_analysis", label: "Gap Analysis" },
  { value: "full_simulation", label: "Full Simulation" },
  { value: "custom", label: "Custom Exam" },
];

export default function ExamEngine({ userEmail }) {
  const queryClient = useQueryClient();
  const [selectedFramework, setSelectedFramework] = useState(null);
  const [selectedExamType, setSelectedExamType] = useState(null);
  const [difficulty, setDifficulty] = useState("intermediate");
  const [examMode, setExamMode] = useState("practice");
  const [responses, setResponses] = useState([]);
  const [currentExam, setCurrentExam] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  const [showAIFeedback, setShowAIFeedback] = useState(false);
  const [showPersonaSelector, setShowPersonaSelector] = useState(false);

  const createExamMutation = useMutation({
    mutationFn: (data) => base44.entities.RegulatoryExam.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['regulatory-exams'] }),
  });

  const updateExamMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.RegulatoryExam.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['regulatory-exams'] }),
  });

  const handleDifficultyChange = (newDifficulty, reason) => {
    setDifficulty(newDifficulty);
    toast.success(`Difficulty adjusted to ${newDifficulty}`, { description: reason });
  };

  const handleExamAnswer = (response) => {
    setResponses([...responses, response]);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      submitExam();
    }
  };

  const handleAIQuestions = (aiQuestions) => {
    setQuestions(aiQuestions);
    setShowCustomBuilder(false);
    startExamWithQuestions(aiQuestions);
  };

  const generateQuestions = async (customConfig = null) => {
    // This method is now deprecated in favor of AIQuestionGenerator component
    // Kept for backward compatibility
    return null;
  };

  const startExamWithQuestions = async (generatedQuestions) => {
    if (!selectedFramework || !selectedExamType) {
      toast.error("Please select framework and exam type");
      return;
    }

    try {
      setStartTime(new Date());

      const exam = await createExamMutation.mutateAsync({
        framework: selectedFramework,
        exam_type: selectedExamType,
        difficulty,
        total_questions: generatedQuestions.length,
        passing_score: 70,
        status: "in_progress",
        start_date: new Date().toISOString(),
        questions_data: generatedQuestions,
        saved_answers: {},
        current_question_index: 0,
        responses: []
      });

      setCurrentExam(exam);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setShowPersonaSelector(examMode === 'interview');
      toast.success("Exam started!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to start exam");
    }
  };

  const handleAnswerSelect = (questionIndex, answer) => {
    setUserAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    setShowAIFeedback(true);
  };

  const submitExam = async () => {
    const timeSpent = Math.floor((new Date() - startTime) / 60000);
    let correctCount = 0;
    const examResponses = [];

    questions.forEach((q, idx) => {
      const userAnswer = userAnswers[idx];
      const isCorrect = userAnswer === q.correct_answer?.charAt(0);
      if (isCorrect) correctCount++;

      examResponses.push({
        question: q.question,
        user_answer: userAnswer,
        correct_answer: q.correct_answer,
        is_correct: isCorrect,
        explanation: q.explanation
      });
    });

    const scorePercentage = Math.round((correctCount / questions.length) * 100);
    const passed = scorePercentage >= currentExam.passing_score;

    await updateExamMutation.mutateAsync({
      id: currentExam.id,
      data: {
        questions_answered: questions.length,
        correct_answers: correctCount,
        score_percentage: scorePercentage,
        status: passed ? "passed" : "failed",
        time_spent_minutes: timeSpent,
        completion_date: new Date().toISOString(),
        responses: examResponses
      }
    });

    if (userEmail) {
      await processExamCompletion(userEmail, { 
        status: passed ? "passed" : "failed", 
        score_percentage: scorePercentage, 
        framework: currentExam.framework 
      });
      await updateStreak(userEmail);
      queryClient.invalidateQueries({ queryKey: ['user-progress'] });
    }

    toast.success("Exam submitted!");
    resetExam();
  };

  const resetExam = () => {
    setCurrentExam(null);
    setQuestions([]);
    setUserAnswers({});
    setResponses([]);
    setCurrentQuestionIndex(0);
    setSelectedFramework(null);
    setSelectedExamType(null);
  };

  if (currentExam && questions.length > 0) {
    if (examMode === 'timed' || examMode === 'exam_day') {
      return (
        <div className="space-y-6">
          <Button variant="ghost" onClick={resetExam} className="gap-2 text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Exit Exam
          </Button>

          <AdaptiveDifficultyEngine 
            responses={responses}
            currentDifficulty={difficulty}
            onDifficultyChange={handleDifficultyChange}
          />
          
          <ExamDaySimulator
            questions={questions}
            currentIndex={currentQuestionIndex}
            onAnswer={handleExamAnswer}
            onComplete={submitExam}
            timeLimit={examMode === 'exam_day' ? 90 : 120}
            examinerMode={examMode === 'exam_day'}
          />
        </div>
      );
    }

    if (examMode === 'interview') {
      return (
        <div className="space-y-6">
          <Button variant="ghost" onClick={resetExam} className="gap-2 text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Exit Interview
          </Button>

          {showPersonaSelector ? (
            <ExaminerPersonaSelector
              selectedFramework={selectedFramework}
              onSelect={() => setShowPersonaSelector(false)}
            />
          ) : (
            <ExaminerInteractionSimulator
              context={{ framework: selectedFramework }}
              examType={selectedFramework}
              currentTopic={questions[currentQuestionIndex]?.category || 'General'}
              onFeedback={(feedback) => {
                setResponses([...responses, feedback]);
                if (feedback.score >= 70) {
                  if (currentQuestionIndex < questions.length - 1) {
                    setCurrentQuestionIndex(currentQuestionIndex + 1);
                  } else {
                    submitExam();
                  }
                }
              }}
            />
          )}
        </div>
      );
    }

    // Practice mode
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={resetExam} className="gap-2 text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Exit Exam
          </Button>
          <div className="flex items-center gap-2">
            <Badge className="bg-indigo-500/10 text-indigo-400">{selectedFramework}</Badge>
            <span className="text-slate-400 text-sm">
              Question {currentQuestionIndex + 1} / {questions.length}
            </span>
          </div>
        </div>

        <Progress value={progress} className="h-2" />

        <EnhancedQuestionDisplay
          question={currentQuestion}
          onAnswer={(value) => handleAnswerSelect(currentQuestionIndex, value)}
          showFeedback={userAnswers[currentQuestionIndex] !== undefined}
          selectedAnswer={userAnswers[currentQuestionIndex]}
        />

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="border-[#2a3548]"
          >
            Previous
          </Button>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button onClick={submitExam} className="bg-emerald-600 hover:bg-emerald-700">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Submit Exam
            </Button>
          ) : (
            <Button onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)} className="bg-indigo-600">
              Next Question
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showCustomBuilder ? (
        <Card className="bg-[#1a2332] border-[#2a3548] p-6">
          <Button variant="ghost" onClick={() => setShowCustomBuilder(false)} className="gap-2 text-slate-400 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-6 w-6 text-violet-400" />
            <h2 className="text-xl font-bold text-white">Custom Exam Builder</h2>
          </div>
          <CustomExamBuilder onGenerate={generateQuestions} loading={loadingQuestions} />
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-[#1a2332] border-[#2a3548] p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-400" />
              Select Framework
            </h3>
            <ScrollArea className="h-[500px]">
              <div className="space-y-2 pr-4">
                {frameworks.map(fw => (
                  <button
                    key={fw.value}
                    onClick={() => setSelectedFramework(fw.value)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedFramework === fw.value
                        ? 'bg-indigo-500/10 border-indigo-500/50 text-white'
                        : 'bg-[#151d2e] border-[#2a3548] text-slate-400 hover:border-[#3a4558]'
                    }`}
                  >
                    <div className="font-medium">{fw.label}</div>
                    <div className="text-sm opacity-75">{fw.description}</div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </Card>

          <Card className="bg-[#1a2332] border-[#2a3548] p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-400" />
              Exam Configuration
            </h3>
            <ScrollArea className="h-[500px]">
              <div className="space-y-4 pr-4">
                <div className="space-y-2">
                  {examTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => {
                        setSelectedExamType(type.value);
                        if (type.value === 'custom') setShowCustomBuilder(true);
                      }}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        selectedExamType === type.value
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                          : 'bg-[#151d2e] border-[#2a3548] text-slate-400 hover:border-[#3a4558]'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>

                {selectedExamType && selectedExamType !== 'custom' && (
                  <>
                    <div>
                      <Label className="text-slate-300 mb-2 block">Exam Mode</Label>
                      <Select value={examMode} onValueChange={setExamMode}>
                        <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                          <SelectItem value="practice" className="text-white">Practice Mode</SelectItem>
                          <SelectItem value="timed" className="text-white">Timed Challenge</SelectItem>
                          <SelectItem value="exam_day" className="text-white">Exam Day Simulation</SelectItem>
                          <SelectItem value="interview" className="text-white">Examiner Interview</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <AIQuestionGenerator
                      framework={selectedFramework}
                      onQuestionsGenerated={handleAIQuestions}
                    />
                  </>
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>
      )}
    </div>
  );
}