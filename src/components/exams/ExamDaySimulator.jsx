import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, AlertCircle, Brain, Play, Pause, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function ExamDaySimulator({ 
  questions, 
  currentIndex, 
  onAnswer, 
  onComplete,
  timeLimit = 120,
  examinerMode = true 
}) {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [isPaused, setIsPaused] = useState(false);
  const [examinerComment, setExaminerComment] = useState(null);
  const [pressure, setPressure] = useState('normal');
  const [responses, setResponses] = useState([]);
  const [scenarioStage, setScenarioStage] = useState(0);
  const [consultingPolicy, setConsultingPolicy] = useState(false);
  const [requestedClarification, setRequestedClarification] = useState(false);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (!isPaused && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimeout();
            return 0;
          }
          
          // Simulate examiner pressure
          if (examinerMode) {
            if (prev === 30) {
              setExaminerComment({
                type: 'warning',
                message: "Please be mindful of the time. We need to move forward soon."
              });
              setPressure('high');
            } else if (prev === 60) {
              setExaminerComment({
                type: 'info',
                message: "Take your time, but remember we have other areas to cover."
              });
              setPressure('medium');
            }
          }
          
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isPaused, timeRemaining, examinerMode]);

  const handleTimeout = () => {
    if (examinerMode) {
      setExaminerComment({
        type: 'critical',
        message: "I'm going to need to move us along. Let's proceed to the next question."
      });
      toast.error("Time expired - moving to next question");
    }
    setTimeout(() => {
      handleSkip();
    }, 2000);
  };

  const handleSkip = () => {
    const response = {
      question_id: currentQuestion.id,
      skipped: true,
      time_spent: timeLimit - timeRemaining,
      is_correct: false
    };
    setResponses([...responses, response]);
    onAnswer(response);
    resetQuestion();
  };

  const handleConsultPolicy = () => {
    setConsultingPolicy(true);
    setIsPaused(true);
    if (examinerMode) {
      setExaminerComment({
        type: 'neutral',
        message: "Go ahead, take a moment to review your policy. I'll wait."
      });
    }
    setTimeout(() => {
      setConsultingPolicy(false);
      toast.info("You may now resume with your answer");
    }, 10000);
  };

  const handleRequestClarification = () => {
    setRequestedClarification(true);
    if (examinerMode) {
      const clarifications = [
        "Let me rephrase: I'm looking for your specific process and documented evidence.",
        "To clarify - I need to understand not just what you do, but how you verify it's being done.",
        "What I'm really asking is: how do you ensure this control is operating effectively?",
        "Let me be more specific: can you walk me through the last time you performed this activity?"
      ];
      setExaminerComment({
        type: 'info',
        message: clarifications[Math.floor(Math.random() * clarifications.length)]
      });
    }
    setTimeout(() => setRequestedClarification(false), 3000);
  };

  const handleAnswerSubmit = (answer, isCorrect) => {
    const timeSpent = timeLimit - timeRemaining;
    const response = {
      question_id: currentQuestion.id,
      answer,
      is_correct: isCorrect,
      time_spent: timeSpent,
      difficulty: currentQuestion.difficulty,
      category: currentQuestion.category,
      scenario_stage: scenarioStage,
      consulted_policy: consultingPolicy,
      requested_clarification: requestedClarification
    };

    setResponses([...responses, response]);

    // Multi-stage scenario progression
    if (currentQuestion.multi_stage && scenarioStage < (currentQuestion.stages?.length - 1 || 0)) {
      setScenarioStage(scenarioStage + 1);
      if (examinerMode) {
        setExaminerComment({
          type: 'probing',
          message: isCorrect 
            ? "Now let's dig deeper on that. What happens next in your process?" 
            : "Let me probe that answer. Can you elaborate on how you'd handle this specific aspect?"
        });
      }
      setTimeout(() => {
        setExaminerComment(null);
      }, 3000);
      return;
    }

    // Simulate examiner reaction
    if (examinerMode) {
      if (isCorrect && timeSpent < 60) {
        setExaminerComment({
          type: 'positive',
          message: consultingPolicy 
            ? "Good that you referenced your policy. Let's continue." 
            : "Good. Let's continue."
        });
      } else if (isCorrect && timeSpent > 90) {
        setExaminerComment({
          type: 'neutral',
          message: "Okay. We'll need to pick up the pace."
        });
      } else if (!isCorrect) {
        setExaminerComment({
          type: 'probing',
          message: "Let me ask you this - can you walk me through your reasoning?"
        });
      }
    }

    setTimeout(() => {
      onAnswer(response);
      resetQuestion();
      setScenarioStage(0);
    }, 2000);
  };

  const resetQuestion = () => {
    setTimeRemaining(timeLimit);
    setExaminerComment(null);
    setPressure('normal');
  };

  const timePercentage = (timeRemaining / timeLimit) * 100;
  const isUrgent = timeRemaining <= 30;

  const getPressureIndicator = () => {
    switch (pressure) {
      case 'high': return { color: 'text-rose-400', label: 'High Pressure' };
      case 'medium': return { color: 'text-amber-400', label: 'Moderate Pressure' };
      default: return { color: 'text-emerald-400', label: 'Normal Pace' };
    }
  };

  return (
    <div className="space-y-4">
      {/* Timer & Status Bar */}
      <Card className={`border-2 transition-all ${
        isUrgent ? 'border-rose-500/50 bg-rose-500/5' : 'border-[#2a3548] bg-[#1a2332]'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Clock className={`h-5 w-5 ${isUrgent ? 'text-rose-400 animate-pulse' : 'text-indigo-400'}`} />
              <div>
                <div className="text-2xl font-bold text-white">
                  {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-xs text-slate-400">Time Remaining</div>
              </div>
            </div>
            <div className="text-right">
              <Badge className={`${getPressureIndicator().color} bg-opacity-20`}>
                {getPressureIndicator().label}
              </Badge>
              <div className="text-xs text-slate-500 mt-1">
                Question {currentIndex + 1} of {questions.length}
              </div>
            </div>
          </div>
          <Progress 
            value={timePercentage} 
            className={`h-2 ${isUrgent ? 'bg-rose-500/20' : ''}`}
          />
        </CardContent>
      </Card>

      {/* Examiner Comments */}
      <AnimatePresence>
        {examinerMode && examinerComment && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className={`border ${
              examinerComment.type === 'critical' ? 'border-rose-500/50 bg-rose-500/10' :
              examinerComment.type === 'warning' ? 'border-amber-500/50 bg-amber-500/10' :
              examinerComment.type === 'positive' ? 'border-emerald-500/50 bg-emerald-500/10' :
              'border-blue-500/50 bg-blue-500/10'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-white/10">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-slate-400 mb-1">Examiner:</div>
                    <p className="text-sm text-white italic">"{examinerComment.message}"</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question Display */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{currentQuestion.question}</CardTitle>
            <Badge className={
              currentQuestion.difficulty === 'advanced' ? 'bg-rose-500/20 text-rose-400' :
              currentQuestion.difficulty === 'intermediate' ? 'bg-amber-500/20 text-amber-400' :
              'bg-emerald-500/20 text-emerald-400'
            }>
              {currentQuestion.difficulty}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.options?.map((option, idx) => (
            <Button
              key={idx}
              onClick={() => handleAnswerSubmit(option, option === currentQuestion.correct_answer)}
              variant="outline"
              className="w-full justify-start text-left h-auto py-3 hover:bg-indigo-500/20 hover:border-indigo-500/50"
            >
              <span className="text-indigo-400 font-bold mr-3">{String.fromCharCode(65 + idx)}.</span>
              <span className="text-white">{option}</span>
            </Button>
          ))}
          
          <div className="space-y-2 mt-4 pt-4 border-t border-[#2a3548]">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsPaused(!isPaused)}
                className="flex-1 border-[#2a3548]"
                disabled={consultingPolicy}
              >
                {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSkip}
                className="flex-1 border-amber-500/30 hover:bg-amber-500/10"
                disabled={consultingPolicy}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Skip Question
              </Button>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleRequestClarification}
                className="flex-1 border-blue-500/30 hover:bg-blue-500/10"
                disabled={requestedClarification || consultingPolicy}
              >
                <Brain className="h-4 w-4 mr-2" />
                {requestedClarification ? 'Clarifying...' : 'Request Clarification'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleConsultPolicy}
                className="flex-1 border-purple-500/30 hover:bg-purple-500/10"
                disabled={consultingPolicy}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                {consultingPolicy ? 'Consulting...' : 'Consult Policy'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary (Bottom) */}
      <div className="grid grid-cols-4 gap-2">
        <div className="text-center p-2 rounded bg-[#1a2332] border border-[#2a3548]">
          <div className="text-lg font-bold text-emerald-400">
            {responses.filter(r => r.is_correct).length}
          </div>
          <div className="text-xs text-slate-500">Correct</div>
        </div>
        <div className="text-center p-2 rounded bg-[#1a2332] border border-[#2a3548]">
          <div className="text-lg font-bold text-rose-400">
            {responses.filter(r => !r.is_correct && !r.skipped).length}
          </div>
          <div className="text-xs text-slate-500">Incorrect</div>
        </div>
        <div className="text-center p-2 rounded bg-[#1a2332] border border-[#2a3548]">
          <div className="text-lg font-bold text-amber-400">
            {responses.filter(r => r.skipped).length}
          </div>
          <div className="text-xs text-slate-500">Skipped</div>
        </div>
        <div className="text-center p-2 rounded bg-[#1a2332] border border-[#2a3548]">
          <div className="text-lg font-bold text-white">
            {responses.length > 0 ? Math.round((responses.filter(r => r.is_correct).length / responses.length) * 100) : 0}%
          </div>
          <div className="text-xs text-slate-500">Accuracy</div>
        </div>
      </div>
    </div>
  );
}