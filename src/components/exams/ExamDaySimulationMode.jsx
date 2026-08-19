import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { 
  Clock, User, Brain, TrendingUp, TrendingDown, AlertCircle,
  CheckCircle2, Loader2, MessageSquare, Shield, FileText, Zap
} from "lucide-react";

const EXAMINER_PERSONAS = [
  {
    id: 'strict_auditor',
    name: 'Sarah Chen - Senior Auditor',
    role: 'Lead Compliance Examiner',
    style: 'Direct and detail-oriented',
    avatar: '👩‍💼',
    traits: ['demanding', 'precise', 'no-nonsense'],
    questionStyle: 'fact-based',
    feedbackTone: 'critical',
    interactionFrequency: 0.5,
    prompts: [
      "I need you to be more specific about your answer.",
      "Can you explain the regulatory citation for that?",
      "That's partially correct, but you're missing a key component.",
      "Good start, but let's dig deeper into the controls."
    ]
  },
  {
    id: 'supportive_mentor',
    name: 'Michael Rodriguez - Risk Manager',
    role: 'GRC Mentor',
    style: 'Encouraging and educational',
    avatar: '👨‍🏫',
    traits: ['patient', 'educational', 'supportive'],
    questionStyle: 'exploratory',
    feedbackTone: 'encouraging',
    interactionFrequency: 0.7,
    prompts: [
      "That's a good approach. Can you expand on the risk implications?",
      "I like your thinking. Now, how would you document this?",
      "Excellent! What would be your next step in the control process?",
      "You're on the right track. Consider the business impact as well."
    ]
  },
  {
    id: 'technical_expert',
    name: 'Dr. Patricia Kim - CISO',
    role: 'Technical Security Expert',
    style: 'Technical and analytical',
    avatar: '👩‍🔬',
    traits: ['technical', 'analytical', 'thorough'],
    questionStyle: 'technical-deep-dive',
    feedbackTone: 'analytical',
    interactionFrequency: 0.4,
    prompts: [
      "What about the technical implementation details?",
      "Can you walk me through the security architecture?",
      "How does this align with the NIST framework?",
      "Let's discuss the encryption protocols involved."
    ]
  },
  {
    id: 'executive_reviewer',
    name: 'James Thompson - CFO',
    role: 'Executive Board Member',
    style: 'Business-focused and strategic',
    avatar: '👔',
    traits: ['strategic', 'business-focused', 'results-oriented'],
    questionStyle: 'business-value',
    feedbackTone: 'pragmatic',
    interactionFrequency: 0.3,
    prompts: [
      "What's the business value of this control?",
      "How does this impact our bottom line?",
      "Can you quantify the risk reduction?",
      "What's the ROI on this compliance initiative?"
    ]
  },
  {
    id: 'seasoned_regulator',
    name: 'Richard Walsh - Federal Examiner',
    role: 'FFIEC Lead Examiner',
    style: 'Regulatory-focused and methodical',
    avatar: '🕴️',
    traits: ['methodical', 'regulation-focused', 'experienced'],
    questionStyle: 'compliance-verification',
    feedbackTone: 'regulatory',
    interactionFrequency: 0.6,
    prompts: [
      "Show me your documentation trail for this control.",
      "How does this meet the regulatory requirement?",
      "What's your testing frequency for this control?",
      "I need to see evidence of board oversight here."
    ]
  },
  {
    id: 'challenging_skeptic',
    name: 'Dr. Amanda Foster - External Auditor',
    role: 'Independent Audit Partner',
    style: 'Skeptical and probing',
    avatar: '🔍',
    traits: ['skeptical', 'challenging', 'thorough'],
    questionStyle: 'devil-advocate',
    feedbackTone: 'challenging',
    interactionFrequency: 0.8,
    prompts: [
      "I'm not convinced. Prove that this control is effective.",
      "What would happen if this control failed?",
      "Have you considered edge cases and exceptions?",
      "Your competitors do this differently. Why your approach?"
    ]
  }
];

export default function ExamDaySimulationMode({ questions, framework, onComplete, risks = [], controls = [] }) {
  const [simulationMode, setSimulationMode] = useState(null); // null, 'standard', 'stress', 'risk-scenario'
  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [examinerPersona, setExaminerPersona] = useState(null);
  const [examinerComments, setExaminerComments] = useState([]);
  const [performance, setPerformance] = useState({ correct: 0, total: 0, streak: 0, recentAnswers: [] });
  const [difficulty, setDifficulty] = useState('intermediate');
  const [adaptiveQuestions, setAdaptiveQuestions] = useState([]);
  const [showExaminerInteraction, setShowExaminerInteraction] = useState(false);
  const [generatingComment, setGeneratingComment] = useState(false);
  const [examComplete, setExamComplete] = useState(false);
  const [realtimeFeedback, setRealtimeFeedback] = useState(null);
  const [confidenceLevel, setConfidenceLevel] = useState(0);
  const [responseTime, setResponseTime] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const timerRef = useRef(null);
  
  // Stress test features
  const [stressLevel, setStressLevel] = useState('medium'); // low, medium, high, extreme
  const [distractions, setDistractions] = useState([]);
  const [timeMultiplier, setTimeMultiplier] = useState(1);
  const [pressureEvents, setPressureEvents] = useState([]);
  
  // Risk scenario features
  const [currentScenario, setCurrentScenario] = useState(null);
  const [scenarioProgress, setScenarioProgress] = useState(0);

  // Initialize exam based on mode
  const startExam = (mode) => {
    setSimulationMode(mode);
    
    // Select random examiner
    const persona = EXAMINER_PERSONAS[Math.floor(Math.random() * EXAMINER_PERSONAS.length)];
    setExaminerPersona(persona);

    let initialQuestions = [];
    let timePerQuestion = 120;
    
    if (mode === 'standard') {
      initialQuestions = selectQuestionsByDifficulty(questions, 'intermediate', 10);
      timePerQuestion = 120;
    } else if (mode === 'stress') {
      initialQuestions = selectQuestionsByDifficulty(questions, 'advanced', 15);
      // Apply stress multiplier
      const stressMultipliers = { low: 0.8, medium: 0.6, high: 0.4, extreme: 0.3 };
      timePerQuestion = Math.floor(120 * stressMultipliers[stressLevel]);
      setTimeMultiplier(stressMultipliers[stressLevel]);
      
      // Schedule stress events
      scheduleStressEvents(initialQuestions.length);
      toast.warning(`Stress Test Mode: ${timePerQuestion}s per question!`);
    } else if (mode === 'risk-scenario') {
      initialQuestions = generateRiskScenarioQuestions();
      timePerQuestion = 180; // More time for complex scenarios
      toast.info("Risk Management Scenario Mode activated");
    }
    
    setAdaptiveQuestions(initialQuestions);
    setTimeRemaining(initialQuestions.length * timePerQuestion);
    setExamStarted(true);

    toast.success(`Exam started with ${persona.name} as your examiner`);
  };
  
  // Generate risk-based scenario questions
  const generateRiskScenarioQuestions = () => {
    const scenarios = [];
    const highRisks = risks.filter(r => (r.likelihood || 0) * (r.impact || 0) >= 12).slice(0, 5);
    
    highRisks.forEach((risk, idx) => {
      const relatedControls = controls.filter(c => 
        c.linked_risks?.includes(risk.id) || c.domain === risk.category
      ).slice(0, 3);
      
      scenarios.push({
        id: `scenario-${idx}`,
        type: 'risk-scenario',
        question: `SCENARIO ${idx + 1}: Your organization faces the following risk:\n\n"${risk.title}"\n\nCategory: ${risk.category}\nInherent Risk Score: ${(risk.inherent_likelihood || 0) * (risk.inherent_impact || 0)}\n\n${risk.description || 'Critical risk requiring immediate attention'}\n\nWhich control strategy would be MOST effective?`,
        options: [
          relatedControls[0] ? `Implement ${relatedControls[0].name} (${relatedControls[0].category} control)` : 'Accept the risk and monitor',
          relatedControls[1] ? `Deploy ${relatedControls[1].name} (${relatedControls[1].category} control)` : 'Transfer risk through insurance',
          relatedControls[2] ? `Activate ${relatedControls[2].name} (${relatedControls[2].category} control)` : 'Avoid the risk entirely',
          risk.mitigation_plan || 'Develop comprehensive mitigation framework'
        ],
        correct_answer: 0,
        difficulty: 'expert',
        category: risk.category,
        riskData: risk,
        controlData: relatedControls,
        explanation: `This scenario requires understanding of ${risk.category} risks and appropriate ${relatedControls[0]?.category || 'preventive'} controls. The best approach considers both likelihood (${risk.inherent_likelihood}) and impact (${risk.inherent_impact}).`
      });
    });
    
    return scenarios.length > 0 ? scenarios : selectQuestionsByDifficulty(questions, 'expert', 10);
  };
  
  // Schedule stress test events
  const scheduleStressEvents = (questionCount) => {
    const events = [];
    const distractionMessages = [
      "⚠️ URGENT: Executive meeting in 5 minutes!",
      "📧 Critical email requires immediate response",
      "🔔 System alert: Potential security breach detected",
      "📞 Regulatory examiner calling...",
      "⏰ Board presentation moved up 30 minutes",
      "🚨 Incident response team activated"
    ];
    
    // Schedule 3-5 distractions throughout exam
    const numDistractions = Math.floor(Math.random() * 3) + 3;
    for (let i = 0; i < numDistractions; i++) {
      const questionNum = Math.floor(Math.random() * questionCount);
      events.push({
        questionIndex: questionNum,
        type: 'distraction',
        message: distractionMessages[Math.floor(Math.random() * distractionMessages.length)],
        duration: 5000
      });
    }
    
    setPressureEvents(events);
  };
  
  // Trigger stress event
  const triggerStressEvent = (questionIndex) => {
    const event = pressureEvents.find(e => e.questionIndex === questionIndex);
    if (event && !distractions.find(d => d.questionIndex === questionIndex)) {
      setDistractions(prev => [...prev, event]);
      setTimeout(() => {
        setDistractions(prev => prev.filter(d => d.questionIndex !== questionIndex));
      }, event.duration);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (examStarted && !examComplete && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleExamTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timerRef.current);
    }
  }, [examStarted, examComplete, timeRemaining]);

  // Select questions by difficulty
  const selectQuestionsByDifficulty = (allQuestions, targetDifficulty, count) => {
    const filtered = allQuestions.filter(q => q.difficulty === targetDifficulty);
    return filtered.sort(() => 0.5 - Math.random()).slice(0, count);
  };

  // Enhanced adaptive difficulty with multiple factors
  const adjustDifficulty = () => {
    const recentPerformance = performance.recentAnswers.slice(-5);
    const recentSuccessRate = recentPerformance.length > 0 
      ? recentPerformance.filter(a => a).length / recentPerformance.length 
      : 0.5;
    
    const overallSuccessRate = performance.total > 0 ? performance.correct / performance.total : 0.5;
    
    // Average response time for recent questions
    const avgResponseTime = responseTime.slice(-3).reduce((a, b) => a + b, 0) / Math.max(responseTime.slice(-3).length, 1);
    const fastResponse = avgResponseTime < 60; // Under 1 minute
    
    // Consider streak
    const onStreak = performance.streak >= 3;
    
    let newDifficulty = difficulty;
    
    // Advanced progression
    if (recentSuccessRate >= 0.8 && onStreak && fastResponse && difficulty !== 'expert') {
      newDifficulty = difficulty === 'beginner' ? 'intermediate' : 
                      difficulty === 'intermediate' ? 'advanced' : 'expert';
      toast.success(`🔥 Excellent streak! Moving to ${newDifficulty} level.`);
    }
    // Gradual increase
    else if (recentSuccessRate >= 0.7 && overallSuccessRate >= 0.65 && difficulty !== 'advanced') {
      newDifficulty = difficulty === 'beginner' ? 'intermediate' : 'advanced';
      toast.info(`Strong performance! Increasing to ${newDifficulty} questions.`);
    }
    // Gradual decrease
    else if (recentSuccessRate <= 0.4 && difficulty !== 'beginner') {
      newDifficulty = difficulty === 'expert' ? 'advanced' : 
                      difficulty === 'advanced' ? 'intermediate' : 'beginner';
      toast.info(`Let's adjust difficulty to reinforce concepts.`);
    }
    
    setDifficulty(newDifficulty);
    return newDifficulty;
  };

  // Enhanced examiner comment with persona-specific feedback
  const generateExaminerComment = async (question, userAnswer, isCorrect, timeTaken) => {
    setGeneratingComment(true);
    try {
      const fastAnswer = timeTaken < 45;
      const slowAnswer = timeTaken > 90;
      
      const prompt = `You are ${examinerPersona.name}, a ${examinerPersona.role}. 

Your personality traits: ${examinerPersona.traits.join(', ')}
Your feedback tone: ${examinerPersona.feedbackTone}
Your questioning style: ${examinerPersona.questionStyle}

The candidate answered a ${framework} question ${isCorrect ? 'correctly' : 'incorrectly'} in ${timeTaken} seconds ${fastAnswer ? '(very quick)' : slowAnswer ? '(took time to think)' : ''}.

Question Category: ${question.category || framework}
Difficulty: ${question.difficulty || difficulty}
Their Answer: ${userAnswer}
Correct Answer: ${question.correct_answer}

Current Performance Context:
- Overall Success Rate: ${Math.round((performance.correct / Math.max(performance.total, 1)) * 100)}%
- Current Streak: ${performance.streak} ${isCorrect ? '(continuing)' : '(broken)'}
- Recent Pattern: ${performance.recentAnswers.slice(-3).map(a => a ? '✓' : '✗').join('')}

Provide feedback (2-3 sentences) that:
${isCorrect ? `
- Acknowledges their success in your ${examinerPersona.feedbackTone} tone
- ${fastAnswer ? 'Comments on their quick thinking' : slowAnswer ? 'Appreciates their careful consideration' : 'Reinforces the concept'}
- Asks a ${examinerPersona.questionStyle} follow-up that deepens understanding
- ${performance.streak >= 3 ? 'Acknowledges their strong streak' : 'Encourages continued progress'}
` : `
- Points out the gap in their ${examinerPersona.feedbackTone} style
- Provides a ${examinerPersona.questionStyle} hint without giving the answer
- ${performance.streak > 0 ? 'Encourages them to regain momentum' : 'Suggests focusing on fundamentals'}
- Maintains your ${examinerPersona.style} persona
`}

Stay in character. Be realistic and professional.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            comment: { type: "string" },
            follow_up_question: { type: "string" }
          }
        }
      });

      return response;
    } catch (error) {
      console.error(error);
      return {
        comment: examinerPersona.prompts[Math.floor(Math.random() * examinerPersona.prompts.length)],
        follow_up_question: null
      };
    } finally {
      setGeneratingComment(false);
    }
  };
  
  // Real-time feedback as user considers answer
  const generateRealtimeFeedback = async (questionText) => {
    try {
      const prompt = `As ${examinerPersona.name}, provide a brief encouraging hint (1 sentence) for this question without giving away the answer:

"${questionText}"

Make it sound like you're observing them think. Keep it brief and in character with your ${examinerPersona.style} style.`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      setRealtimeFeedback(response);
    } catch (error) {
      console.error(error);
    }
  };

  // Handle answer submission with enhanced tracking
  const submitAnswer = async (selectedAnswer) => {
    const currentQuestion = adaptiveQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);

    // Update answers
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: { answer: selectedAnswer, correct: isCorrect, timeTaken }
    }));

    // Enhanced performance tracking
    const newStreak = isCorrect ? performance.streak + 1 : 0;
    const newRecentAnswers = [...performance.recentAnswers.slice(-9), isCorrect];
    
    const newPerformance = {
      correct: performance.correct + (isCorrect ? 1 : 0),
      total: performance.total + 1,
      streak: newStreak,
      recentAnswers: newRecentAnswers
    };
    setPerformance(newPerformance);
    
    // Track response times
    setResponseTime(prev => [...prev, timeTaken]);
    
    // Update confidence based on speed and accuracy
    const newConfidence = isCorrect && timeTaken < 60 ? Math.min(confidenceLevel + 10, 100) : Math.max(confidenceLevel - 5, 0);
    setConfidenceLevel(newConfidence);

    // Dynamic examiner interaction based on persona frequency and context
    const shouldInteract = Math.random() < examinerPersona.interactionFrequency || 
                          newStreak >= 3 || 
                          (newStreak === 0 && performance.streak >= 2) ||
                          performance.total % 5 === 0;
    
    if (shouldInteract) {
      const feedback = await generateExaminerComment(currentQuestion, selectedAnswer, isCorrect, timeTaken);
      setExaminerComments(prev => [...prev, {
        questionIndex: currentQuestionIndex,
        comment: feedback.comment,
        followUp: feedback.follow_up_question,
        isCorrect,
        timeTaken,
        timestamp: Date.now()
      }]);
      setShowExaminerInteraction(true);
      setTimeout(() => setShowExaminerInteraction(false), 6000);
    }

    // Adaptive difficulty every 3 questions with enhanced logic
    if ((currentQuestionIndex + 1) % 3 === 0 && currentQuestionIndex < adaptiveQuestions.length - 1) {
      const newDifficulty = adjustDifficulty();
      if (newDifficulty !== difficulty) {
        const additionalQuestions = selectQuestionsByDifficulty(questions, newDifficulty, 4);
        setAdaptiveQuestions(prev => [...prev.slice(0, currentQuestionIndex + 1), ...additionalQuestions]);
      }
    }

    // Clear real-time feedback
    setRealtimeFeedback(null);

    // Trigger stress events in stress mode
    if (simulationMode === 'stress' && currentQuestionIndex < adaptiveQuestions.length - 1) {
      triggerStressEvent(currentQuestionIndex + 1);
    }

    // Update scenario progress
    if (simulationMode === 'risk-scenario') {
      setScenarioProgress(Math.round(((currentQuestionIndex + 1) / adaptiveQuestions.length) * 100));
    }

    // Move to next question or complete exam
    if (currentQuestionIndex < adaptiveQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
    } else {
      completeExam();
    }
  };

  const handleExamTimeout = () => {
    toast.error("Time's up! Exam has ended.");
    completeExam();
  };

  const completeExam = async () => {
    clearInterval(timerRef.current);
    setExamComplete(true);

    // Calculate final score
    const score = Math.round((performance.correct / performance.total) * 100);

    // Save exam results
    try {
      await base44.entities.RegulatoryExam.create({
        framework,
        total_questions: performance.total,
        correct_answers: performance.correct,
        score_percentage: score,
        time_taken: adaptiveQuestions.length * 120 - timeRemaining,
        difficulty: difficulty,
        examiner_persona: examinerPersona.id,
        simulation_mode: true,
        status: 'completed'
      });
    } catch (error) {
      console.error(error);
    }

    if (onComplete) {
      onComplete({
        score,
        correct: performance.correct,
        total: performance.total,
        difficulty,
        examiner: examinerPersona
      });
    }
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = adaptiveQuestions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / adaptiveQuestions.length) * 100;

  if (!examStarted) {
    return (
      <div className="space-y-4">
        <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="h-6 w-6 text-indigo-400" />
              Advanced Exam Simulation Center
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mode Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Standard Mode */}
              <Card className="bg-[#151d2e] border-blue-500/20 hover:border-blue-500/40 transition-all cursor-pointer" onClick={() => startExam('standard')}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <CheckCircle2 className="h-5 w-5 text-blue-400" />
                    </div>
                    <h3 className="text-white font-semibold">Standard Mode</h3>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5">
                    <li>• 2 minutes per question</li>
                    <li>• Adaptive difficulty</li>
                    <li>• AI examiner feedback</li>
                    <li>• Real-time guidance</li>
                  </ul>
                  <Button className="w-full mt-4 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30">
                    Start Standard
                  </Button>
                </CardContent>
              </Card>

              {/* Stress Test Mode */}
              <Card className="bg-[#151d2e] border-orange-500/20 hover:border-orange-500/40 transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-orange-500/20">
                      <Zap className="h-5 w-5 text-orange-400" />
                    </div>
                    <h3 className="text-white font-semibold">Stress Test</h3>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5 mb-3">
                    <li>• Extreme time pressure</li>
                    <li>• Simulated distractions</li>
                    <li>• Pressure scenarios</li>
                    <li>• Advanced questions</li>
                  </ul>
                  <Select value={stressLevel} onValueChange={setStressLevel}>
                    <SelectTrigger className="w-full h-8 text-xs bg-[#0f1623] border-orange-500/30 mb-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="low">Low Stress (80s/q)</SelectItem>
                      <SelectItem value="medium">Medium (72s/q)</SelectItem>
                      <SelectItem value="high">High (48s/q)</SelectItem>
                      <SelectItem value="extreme">Extreme (36s/q)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    className="w-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30"
                    onClick={() => startExam('stress')}
                  >
                    Start Stress Test
                  </Button>
                </CardContent>
              </Card>

              {/* Risk Scenario Mode */}
              <Card className="bg-[#151d2e] border-violet-500/20 hover:border-violet-500/40 transition-all cursor-pointer" onClick={() => startExam('risk-scenario')}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-violet-500/20">
                      <Shield className="h-5 w-5 text-violet-400" />
                    </div>
                    <h3 className="text-white font-semibold">Risk Scenarios</h3>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5">
                    <li>• Real risk data integration</li>
                    <li>• Control effectiveness</li>
                    <li>• Strategic decision-making</li>
                    <li>• Complex scenarios (3min)</li>
                  </ul>
                  <Badge className="mt-3 bg-violet-500/20 text-violet-400 text-[10px] border-violet-500/30">
                    {risks.length} Active Risks • {controls.length} Controls
                  </Badge>
                  <Button className="w-full mt-2 bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 border border-violet-500/30">
                    Start Risk Challenge
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Info Notice */}
            <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-200">
                  <strong>Important:</strong> All modes are immersive simulations. Once started, you cannot pause or review previous questions. Choose your challenge level carefully.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (examComplete) {
    const score = Math.round((performance.correct / performance.total) * 100);
    const passed = score >= 70;

    return (
      <Card className={`bg-gradient-to-br ${passed ? 'from-emerald-500/10 to-green-500/10 border-emerald-500/20' : 'from-amber-500/10 to-orange-500/10 border-amber-500/20'}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            {passed ? <CheckCircle2 className="h-6 w-6 text-emerald-400" /> : <AlertCircle className="h-6 w-6 text-amber-400" />}
            Exam Simulation Complete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-6xl font-bold text-white mb-2">{score}%</div>
            <Badge className={`${passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
              {passed ? 'PASSED' : 'NEEDS REVIEW'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-[#151d2e] border-[#2a3548]">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-emerald-400">{performance.correct}</div>
                <div className="text-xs text-slate-400">Correct</div>
              </CardContent>
            </Card>
            <Card className="bg-[#151d2e] border-[#2a3548]">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-rose-400">{performance.total - performance.correct}</div>
                <div className="text-xs text-slate-400">Incorrect</div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-[#151d2e] rounded-lg p-4 border border-[#2a3548]">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-4xl">{examinerPersona.avatar}</div>
              <div>
                <h4 className="text-white font-semibold">{examinerPersona.name}</h4>
                <p className="text-xs text-slate-400">{examinerPersona.role}</p>
              </div>
            </div>
            <p className="text-sm text-slate-300">
              {passed 
                ? "Excellent work! You've demonstrated strong understanding of the material. Keep up the good preparation."
                : "You're on the right track, but there's room for improvement. Review the areas you struggled with and practice more."
              }
            </p>
          </div>

          {examinerComments.length > 0 && (
            <div>
              <h4 className="text-white font-semibold mb-3">Examiner Feedback</h4>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {examinerComments.map((comment, idx) => (
                    <div key={idx} className="bg-[#151d2e] rounded-lg p-3 border border-[#2a3548]">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="text-[10px] bg-violet-500/10 text-violet-400">Q{comment.questionIndex + 1}</Badge>
                        {comment.isCorrect ? (
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-amber-400" />
                        )}
                      </div>
                      <p className="text-xs text-slate-300">{comment.comment}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Exam Header */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-400" />
                <span className={`text-2xl font-bold ${timeRemaining < 60 ? 'text-rose-400' : 'text-white'}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-300">
                  Question {currentQuestionIndex + 1} of {adaptiveQuestions.length}
                </span>
              </div>
              {simulationMode === 'stress' && (
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  Stress: {stressLevel.toUpperCase()}
                </Badge>
              )}
              {simulationMode === 'risk-scenario' && (
                <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Risk Scenario
                </Badge>
              )}
            </div>
            <Badge className={`${
              difficulty === 'beginner' ? 'bg-emerald-500/20 text-emerald-400' :
              difficulty === 'intermediate' ? 'bg-amber-500/20 text-amber-400' :
              'bg-rose-500/20 text-rose-400'
            }`}>
              {difficulty}
            </Badge>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </CardContent>
      </Card>

      {/* Stress Test Distractions */}
      {simulationMode === 'stress' && distractions.length > 0 && (
        <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/40 animate-in fade-in slide-in-from-top-2">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-400 animate-pulse" />
              <span className="text-sm text-white font-semibold">{distractions[0].message}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Examiner Persona */}
      <Card className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{examinerPersona.avatar}</div>
            <div className="flex-1">
              <h4 className="text-white font-semibold">{examinerPersona.name}</h4>
              <p className="text-xs text-slate-400">{examinerPersona.role}</p>
            </div>
            <Badge className="bg-violet-500/20 text-violet-400 text-[10px]">
              {performance.correct}/{performance.total} Correct
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Feedback Hint */}
      {realtimeFeedback && (
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <Brain className="h-4 w-4 text-blue-400 mt-0.5 animate-pulse" />
              <div>
                <p className="text-xs text-blue-400 font-semibold mb-0.5">Examiner Observing:</p>
                <p className="text-xs text-slate-300 italic">{realtimeFeedback}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Examiner Interaction */}
      {showExaminerInteraction && examinerComments.length > 0 && (
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 animate-in fade-in slide-in-from-top-2">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">{examinerPersona.avatar}</div>
              <div className="flex-1">
                <p className="text-xs text-amber-400 font-semibold mb-1">{examinerPersona.name}:</p>
                <p className="text-sm text-white leading-relaxed mb-2">
                  {examinerComments[examinerComments.length - 1].comment}
                </p>
                {examinerComments[examinerComments.length - 1].followUp && (
                  <div className="mt-2 p-2 rounded bg-amber-500/10 border-l-2 border-amber-500">
                    <p className="text-xs text-amber-300 italic">
                      "{examinerComments[examinerComments.length - 1].followUp}"
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  {examinerComments[examinerComments.length - 1].isCorrect ? (
                    <Badge className="text-[10px] bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Correct
                    </Badge>
                  ) : (
                    <Badge className="text-[10px] bg-rose-500/20 text-rose-400 border-rose-500/30">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Review Needed
                    </Badge>
                  )}
                  <span className="text-[10px] text-slate-500">
                    Response time: {examinerComments[examinerComments.length - 1].timeTaken}s
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Indicators */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardContent className="p-3">
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-xs text-slate-400 mb-1">Streak</div>
              <div className={`text-lg font-bold ${performance.streak >= 3 ? 'text-emerald-400' : 'text-slate-300'}`}>
                {performance.streak >= 3 && '🔥'} {performance.streak}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400 mb-1">Confidence</div>
              <div className="text-lg font-bold text-blue-400">{confidenceLevel}%</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400 mb-1">Accuracy</div>
              <div className="text-lg font-bold text-violet-400">
                {Math.round((performance.correct / Math.max(performance.total, 1)) * 100)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400 mb-1">Avg Time</div>
              <div className="text-lg font-bold text-amber-400">
                {Math.round(responseTime.reduce((a, b) => a + b, 0) / Math.max(responseTime.length, 1))}s
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Question */}
      {currentQuestion && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-6">
            {/* Risk Scenario Context */}
            {simulationMode === 'risk-scenario' && currentQuestion.type === 'risk-scenario' && currentQuestion.riskData && (
              <div className="mb-4 p-4 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <div className="flex items-start gap-3 mb-3">
                  <Shield className="h-5 w-5 text-violet-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-violet-400 mb-1">Risk Context</h4>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400">Category:</span>
                        <span className="text-white ml-1 font-semibold">{currentQuestion.riskData.category}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Likelihood:</span>
                        <span className="text-amber-400 ml-1 font-semibold">{currentQuestion.riskData.inherent_likelihood || 0}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Impact:</span>
                        <span className="text-rose-400 ml-1 font-semibold">{currentQuestion.riskData.inherent_impact || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {currentQuestion.controlData && currentQuestion.controlData.length > 0 && (
                  <div className="text-xs text-slate-300">
                    <span className="text-slate-400">Available Controls:</span> {currentQuestion.controlData.length} deployed
                  </div>
                )}
              </div>
            )}

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-indigo-500/10 text-indigo-400">{currentQuestion.framework || currentQuestion.category}</Badge>
                {simulationMode === 'risk-scenario' && (
                  <Badge className="bg-violet-500/10 text-violet-400">Scenario-Based</Badge>
                )}
              </div>
              <h3 className="text-lg text-white font-medium leading-relaxed whitespace-pre-line">{currentQuestion.question || currentQuestion.question_text}</h3>
            </div>

            <div className="space-y-3">
              {currentQuestion.options?.map((option, idx) => (
                <Button
                  key={idx}
                  onClick={() => submitAnswer(option.charAt(0))}
                  onMouseEnter={() => {
                    // Generate real-time hint after 5 seconds of hovering
                    if (!realtimeFeedback && performance.total > 2) {
                      setTimeout(() => {
                        if (!realtimeFeedback) generateRealtimeFeedback(currentQuestion.question_text);
                      }, 5000);
                    }
                  }}
                  disabled={generatingComment}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-4 px-4 border-[#2a3548] hover:border-indigo-500/50 hover:bg-indigo-500/10 text-white transition-all hover:scale-[1.01]"
                >
                  <span className="font-mono text-indigo-400 mr-3">{String.fromCharCode(65 + idx)}.</span>
                  {option}
                </Button>
              ))}
            </div>

            {generatingComment && (
              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Examiner is reviewing your answer...</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}