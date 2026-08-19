import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Brain, MessageSquare, AlertTriangle, CheckCircle2, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function ExaminerInteractionSimulator({ 
  context, 
  examType, 
  currentTopic,
  onFeedback 
}) {
  const [conversation, setConversation] = useState([]);
  const [userResponse, setUserResponse] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [scenarioContext, setScenarioContext] = useState(null);
  const [branchingPath, setBranchingPath] = useState([]);
  const [consultingPolicy, setConsultingPolicy] = useState(false);
  const [clarificationRequested, setClarificationRequested] = useState(false);

  const examinerPersonalities = {
    FFIEC: {
      style: 'methodical, detail-oriented, asks for specific evidence and documentation',
      tone: 'professional and direct',
      focus: 'IT controls, cybersecurity, vendor management, incident response',
      probing: 'asks for specific examples, dates, and evidence of testing'
    },
    OCC: {
      style: 'risk-focused, challenges assumptions, probes governance and board oversight',
      tone: 'formal and thorough',
      focus: 'risk appetite, capital adequacy, loan quality, management competency',
      probing: 'tests depth of knowledge, asks "what if" scenarios'
    },
    SEC: {
      style: 'compliance-driven, document-focused, regulatory citations',
      tone: 'precise and regulatory',
      focus: 'disclosure accuracy, internal controls, financial reporting',
      probing: 'references specific SEC rules, asks about control design'
    },
    FDIC: {
      style: 'safety and soundness focused, examines processes and documentation',
      tone: 'thorough and methodical',
      focus: 'deposit insurance, liquidity, asset quality, earnings',
      probing: 'asks about policies, procedures, and board approval'
    },
    NCUA: {
      style: 'member-focused, risk-based examination approach',
      tone: 'direct and practical',
      focus: 'member service, financial performance, strategic planning',
      probing: 'asks about member impact and service delivery'
    },
    SOX: {
      style: 'control-focused, process-oriented, evidence-driven',
      tone: 'technical and precise',
      focus: 'internal controls, financial reporting, SOD, documentation',
      probing: 'asks about control design, operating effectiveness, testing'
    },
    ISO27001: {
      style: 'systematic, process-based, continuous improvement focused',
      tone: 'structured and analytical',
      focus: 'ISMS, risk assessment, asset management, access control',
      probing: 'asks about metrics, monitoring, and improvement cycles'
    }
  };

  const handleConsultPolicy = () => {
    setConsultingPolicy(true);
    const policyNote = {
      role: 'system',
      content: 'Candidate is consulting their policy documentation...',
      timestamp: new Date()
    };
    setConversation([...conversation, policyNote]);
    
    setTimeout(() => {
      const examinerResponse = {
        role: 'examiner',
        content: "Take your time. When you're ready, please continue with your answer based on your policy.",
        timestamp: new Date()
      };
      setConversation(prev => [...prev, examinerResponse]);
      setConsultingPolicy(false);
    }, 8000);
  };

  const handleRequestClarification = async () => {
    setClarificationRequested(true);
    const clarificationRequest = {
      role: 'candidate',
      content: '[Requested clarification]',
      is_clarification_request: true,
      timestamp: new Date()
    };
    
    setConversation([...conversation, clarificationRequest]);
    
    try {
      const lastExaminerQ = conversation.filter(m => m.role === 'examiner').slice(-1)[0];
      
      const prompt = `You are a ${examType} examiner. The candidate requested clarification on your question: "${lastExaminerQ.content}"
      
Provide a realistic examiner clarification that:
1. Rephrases or elaborates on the original question
2. Gives a bit more context or specificity
3. Maintains examiner tone but is helpful
4. Doesn't give away the answer

Return JSON: { "clarification": "examiner's clarifying statement" }`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            clarification: { type: "string" }
          }
        }
      });

      const clarificationResponse = {
        role: 'examiner',
        content: response.clarification,
        is_clarification: true,
        timestamp: new Date()
      };
      
      setConversation(prev => [...prev, clarificationResponse]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate clarification");
    } finally {
      setClarificationRequested(false);
    }
  };

  const generateExaminerQuestion = async (isFollowUp = false, previousEvaluation = null) => {
    setEvaluating(true);
    try {
      const personality = examinerPersonalities[examType] || examinerPersonalities.FFIEC;
      const conversationDepth = conversation.filter(m => m.role === 'examiner').length;
      const difficultyProgression = conversationDepth < 2 ? 'basic' : conversationDepth < 4 ? 'intermediate' : 'advanced';
      
      let scenarioInfo = "";
      if (scenarioContext) {
        scenarioInfo = `\nONGOING SCENARIO: ${JSON.stringify(scenarioContext)}
BRANCHING PATH: ${branchingPath.join(' -> ')}`;
      }

      const branchingInstruction = isFollowUp && previousEvaluation 
        ? `\nThis is a FOLLOW-UP question based on the candidate's previous response (score: ${previousEvaluation.score}).
Generate a branching follow-up that:
- Probes deeper if their answer was weak (score < 70)
- Explores related scenarios if their answer was strong (score >= 70)
- Creates a multi-stage scenario that evolves based on their understanding`
        : '';
      
      const prompt = `You are a ${examType} regulatory examiner conducting a real exam. Generate a realistic, challenging ${isFollowUp ? 'FOLLOW-UP' : ''} question.

EXAMINER PROFILE:
- Style: ${personality.style}
- Tone: ${personality.tone}
- Focus Areas: ${personality.focus}
- Probing Technique: ${personality.probing}

CONTEXT:
- Topic: ${currentTopic}
- Conversation Depth: ${conversationDepth} questions asked
- Target Difficulty: ${difficultyProgression}
- Previous exchanges: ${JSON.stringify(conversation.slice(-3))}${scenarioInfo}${branchingInstruction}

Generate a ${isFollowUp ? 'branching follow-up' : 'multi-stage scenario'} question that:
1. Tests ${difficultyProgression} level understanding of ${currentTopic}
2. Uses realistic examiner language ("Walk me through...", "How do you ensure...", "Can you provide an example...")
3. Probes for specifics: processes, evidence, metrics, frequency
4. ${conversationDepth > 0 ? 'Builds on or challenges previous answers' : 'Establishes baseline understanding'}
5. Matches ${examType} examination priorities
6. ${isFollowUp ? 'Creates a realistic follow-up that branches based on their previous response' : 'Sets up a scenario that can evolve based on their answers'}

CRITICAL: Make it sound like a real examiner, not academic. Be direct and specific.

Return JSON with:
{
  "question": "realistic examiner question",
  "focus_area": "specific aspect being tested",
  "difficulty": "basic/intermediate/advanced",
  "expected_elements": ["specific point 1", "specific point 2", "specific point 3"],
  "follow_up_prompts": ["potential probe 1", "potential probe 2"],
  "scenario_context": "brief description of the scenario/situation being explored",
  "is_multi_stage": true/false,
  "stage_number": 1/2/3
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            question: { type: "string" },
            focus_area: { type: "string" },
            difficulty: { type: "string" },
            expected_elements: { type: "array", items: { type: "string" } },
            follow_up_prompts: { type: "array", items: { type: "string" } },
            scenario_context: { type: "string" },
            is_multi_stage: { type: "boolean" },
            stage_number: { type: "number" }
          }
        }
      });

      if (response.scenario_context && !scenarioContext) {
        setScenarioContext(response.scenario_context);
      }

      const examinerMessage = {
        role: 'examiner',
        content: response.question,
        focus_area: response.focus_area,
        difficulty: response.difficulty,
        expected_elements: response.expected_elements,
        follow_up_prompts: response.follow_up_prompts || [],
        scenario_context: response.scenario_context,
        is_multi_stage: response.is_multi_stage,
        stage_number: response.stage_number,
        timestamp: new Date()
      };

      setConversation([...conversation, examinerMessage]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate question");
    } finally {
      setEvaluating(false);
    }
  };

  const evaluateResponse = async () => {
    if (!userResponse.trim()) return;

    const userMessage = {
      role: 'candidate',
      content: userResponse,
      timestamp: new Date()
    };

    setConversation([...conversation, userMessage]);
    setEvaluating(true);

    try {
      const lastExaminerQ = conversation[conversation.length - 1];
      
      const prompt = `You are a ${examType} examiner evaluating a candidate's response in a live exam setting.

EXAMINER QUESTION: "${lastExaminerQ.content}"
FOCUS AREA: ${lastExaminerQ.focus_area}
EXPECTED ELEMENTS: ${JSON.stringify(lastExaminerQ.expected_elements)}
CANDIDATE RESPONSE: "${userResponse}"

Evaluate this response as a real examiner would:

SCORING CRITERIA:
- Completeness: Did they address all expected elements?
- Specificity: Did they provide concrete examples, metrics, or evidence?
- Accuracy: Is the information technically correct?
- Clarity: Can they articulate their point clearly?
- Depth: Do they understand the underlying concepts?

PROVIDE REALISTIC FEEDBACK:
{
  "score": 0-100,
  "assessment": "2-3 sentence evaluator comment (use examiner language)",
  "strengths": ["what they did well - be specific"],
  "gaps": ["what's missing or unclear - reference expected elements"],
  "missed_elements": ["which expected elements were not addressed"],
  "follow_up": "realistic examiner response (e.g., 'That's helpful, but I need more detail on...', 'Okay, let me ask this...', 'I'm not seeing evidence of...')",
  "probing_questions": ["specific follow-up probe 1", "specific follow-up probe 2"] // if gaps exist,
  "tone": "positive/neutral/concerned/critical",
  "adequate": true/false,
  "examiner_notes": "brief note on candidate's understanding (internal examiner perspective)"
}

Be tough but fair. Real examiners probe weaknesses and don't accept vague answers.`;

      const evaluation = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            score: { type: "number" },
            assessment: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            gaps: { type: "array", items: { type: "string" } },
            missed_elements: { type: "array", items: { type: "string" } },
            follow_up: { type: "string" },
            probing_questions: { type: "array", items: { type: "string" } },
            tone: { type: "string" },
            adequate: { type: "boolean" },
            examiner_notes: { type: "string" }
          }
        }
      });

      const feedbackMessage = {
        role: 'feedback',
        ...evaluation,
        timestamp: new Date()
      };

      setConversation([...conversation, userMessage, feedbackMessage]);
      setUserResponse('');

      if (onFeedback) {
        onFeedback({
          score: evaluation.score,
          adequate: evaluation.adequate,
          topic: currentTopic
        });
      }

      // Dynamic branching follow-up based on response quality
      if (evaluation.score < 70 || (evaluation.gaps && evaluation.gaps.length > 0)) {
        setBranchingPath([...branchingPath, `weak_response_${lastExaminerQ.focus_area}`]);
        setTimeout(() => {
          generateExaminerQuestion(true, evaluation);
        }, 2000);
      } else if (evaluation.adequate && lastExaminerQ.is_multi_stage) {
        setBranchingPath([...branchingPath, `strong_response_${lastExaminerQ.focus_area}`]);
        setTimeout(() => {
          generateExaminerQuestion(true, evaluation);
        }, 2000);
      } else if (evaluation.follow_up) {
        setTimeout(() => {
          const followUpMessage = {
            role: 'examiner',
            content: evaluation.follow_up,
            timestamp: new Date()
          };
          setConversation(prev => [...prev, followUpMessage]);
        }, 1500);
      }

    } catch (error) {
      console.error(error);
      toast.error("Failed to evaluate response");
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-400" />
          Simulated Examiner Interaction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {conversation.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 mb-4">Start a realistic examiner conversation</p>
            <Button onClick={generateExaminerQuestion} className="bg-purple-600 hover:bg-purple-700">
              <Brain className="h-4 w-4 mr-2" />
              Begin Interaction
            </Button>
          </div>
        )}

        <div className="space-y-3 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {conversation.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={msg.role === 'examiner' ? 'mr-12' : msg.role === 'candidate' ? 'ml-12' : ''}
              >
                {msg.role === 'examiner' && (
                  <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4 text-indigo-400" />
                      <span className="text-xs text-indigo-400 font-semibold">Examiner</span>
                      {msg.difficulty && (
                        <Badge className="text-xs bg-indigo-500/20 text-indigo-400 ml-auto">
                          {msg.difficulty}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-white">{msg.content}</p>
                    {msg.focus_area && (
                      <div className="text-xs text-slate-500 mt-2">Focus: {msg.focus_area}</div>
                    )}
                  </div>
                )}

                {msg.role === 'candidate' && (
                  <div className="p-4 rounded-lg bg-slate-500/10 border border-slate-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-slate-400" />
                      <span className="text-xs text-slate-400 font-semibold">You</span>
                    </div>
                    <p className="text-sm text-slate-300">{msg.content}</p>
                  </div>
                )}

                {msg.role === 'feedback' && (
                  <div className={`p-4 rounded-lg border ${
                    msg.tone === 'positive' ? 'bg-emerald-500/10 border-emerald-500/20' :
                    msg.tone === 'concerned' ? 'bg-rose-500/10 border-rose-500/20' :
                    'bg-amber-500/10 border-amber-500/20'
                  }`}>
                    <div className="flex items-center gap-2 mb-3">
                      {msg.adequate ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-400" />
                      )}
                      <span className="text-xs font-semibold text-white">Evaluation</span>
                      <Badge className="ml-auto">{msg.score}/100</Badge>
                    </div>
                    <p className="text-sm text-slate-300 mb-3">{msg.assessment}</p>
                    
                    {msg.strengths?.length > 0 && (
                      <div className="mb-2">
                        <div className="text-xs text-emerald-400 mb-1">Strengths:</div>
                        <ul className="text-xs text-slate-300 space-y-1">
                          {msg.strengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {msg.gaps?.length > 0 && (
                      <div className="mb-2">
                        <div className="text-xs text-amber-400 mb-1">Areas to Address:</div>
                        <ul className="text-xs text-slate-300 space-y-1">
                          {msg.gaps.map((g, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Lightbulb className="h-3 w-3 text-amber-400 mt-0.5" />
                              <span>{g}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {msg.missed_elements?.length > 0 && (
                      <div className="mb-2">
                        <div className="text-xs text-rose-400 mb-1">Missing Elements:</div>
                        <ul className="text-xs text-slate-300 space-y-1">
                          {msg.missed_elements.map((m, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <AlertTriangle className="h-3 w-3 text-rose-400 mt-0.5" />
                              <span>{m}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {msg.probing_questions?.length > 0 && (
                      <div className="mt-3 p-2 rounded bg-indigo-500/10 border border-indigo-500/20">
                        <div className="text-xs text-indigo-400 mb-1">Examiner May Ask:</div>
                        <ul className="text-xs text-slate-300 space-y-1">
                          {msg.probing_questions.map((q, i) => (
                            <li key={i} className="italic">"...{q}..."</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {msg.examiner_notes && (
                      <div className="mt-3 p-2 rounded bg-slate-500/10 border border-slate-500/20">
                        <div className="text-xs text-slate-500 mb-1">Internal Notes:</div>
                        <p className="text-xs text-slate-400 italic">{msg.examiner_notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {conversation.length > 0 && (conversation[conversation.length - 1].role === 'examiner' || conversation[conversation.length - 1].role === 'system') && (
          <div className="space-y-3">
            {scenarioContext && (
              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <div className="text-xs text-indigo-400 mb-1">📋 Scenario Context:</div>
                <p className="text-xs text-slate-300">{scenarioContext}</p>
                {branchingPath.length > 0 && (
                  <div className="mt-2 text-xs text-slate-500">
                    Path: {branchingPath.join(' → ')}
                  </div>
                )}
              </div>
            )}
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="text-xs text-purple-400 mb-1">💡 Tip for Strong Answers:</div>
              <p className="text-xs text-slate-300">
                Be specific. Reference policies, procedures, frequencies, metrics, and provide concrete examples. 
                Examiners want evidence, not generalities.
              </p>
            </div>
            <Textarea
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              placeholder="Type your response to the examiner... (Be specific: mention processes, frequencies, examples, evidence)"
              className="bg-[#0f1623] border-[#2a3548] text-white min-h-32"
              disabled={consultingPolicy}
            />
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button 
                  onClick={evaluateResponse} 
                  disabled={!userResponse.trim() || evaluating || consultingPolicy}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  {evaluating ? 'Evaluating...' : 'Submit Response'}
                </Button>
                <Button 
                  onClick={() => generateExaminerQuestion(false, null)}
                  variant="outline"
                  className="border-[#2a3548]"
                  disabled={evaluating || consultingPolicy}
                >
                  Skip / Next
                </Button>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleRequestClarification}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-blue-500/30 hover:bg-blue-500/10 text-xs"
                  disabled={clarificationRequested || evaluating || consultingPolicy}
                >
                  <Brain className="h-3 w-3 mr-1" />
                  {clarificationRequested ? 'Requesting...' : 'Request Clarification'}
                </Button>
                <Button 
                  onClick={handleConsultPolicy}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-purple-500/30 hover:bg-purple-500/10 text-xs"
                  disabled={consultingPolicy || evaluating}
                >
                  <Lightbulb className="h-3 w-3 mr-1" />
                  {consultingPolicy ? 'Consulting...' : 'Consult Policy'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {conversation.length > 5 && (
          <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-indigo-400" />
              <span className="text-sm font-semibold text-white">Session Summary</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 rounded bg-[#0f1623]">
                <div className="text-lg font-bold text-white">{conversation.filter(m => m.role === 'examiner').length}</div>
                <div className="text-xs text-slate-500">Questions</div>
              </div>
              <div className="text-center p-2 rounded bg-[#0f1623]">
                <div className="text-lg font-bold text-emerald-400">
                  {conversation.filter(m => m.role === 'feedback' && m.adequate).length}
                </div>
                <div className="text-xs text-slate-500">Adequate</div>
              </div>
              <div className="text-center p-2 rounded bg-[#0f1623]">
                <div className="text-lg font-bold text-amber-400">
                  {conversation.filter(m => m.role === 'feedback' && !m.adequate).length}
                </div>
                <div className="text-xs text-slate-500">Needs Work</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}