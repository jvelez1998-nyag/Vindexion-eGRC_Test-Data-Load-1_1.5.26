import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle2, XCircle, AlertTriangle, TrendingDown, BookOpen, Target } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function PrepQuestionnaireBuilder({ framework, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState(null);
  const [difficulty, setDifficulty] = useState("intermediate");

  const generatePrepQuestions = async () => {
    setLoading(true);
    try {
      const prompt = `Generate 15 comprehensive readiness assessment questions for ${framework} compliance exam preparation.

These are PREP questions to assess current knowledge level, NOT the actual exam questions.

For each question, provide:
1. Question text (assess understanding of key concepts)
2. Four answer options
3. Correct answer
4. Detailed explanation
5. Knowledge area/domain
6. Difficulty level
7. Common misconceptions
8. Study resources needed if answered incorrectly

Return JSON:
{
  "questions": [
    {
      "question": "string",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct": "A",
      "explanation": "string",
      "knowledge_area": "string",
      "difficulty": "beginner/intermediate/advanced",
      "common_misconceptions": ["string"],
      "study_focus": "string"
    }
  ]
}`;

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
                  options: { type: "array", items: { type: "string" } },
                  correct: { type: "string" },
                  explanation: { type: "string" },
                  knowledge_area: { type: "string" },
                  difficulty: { type: "string" },
                  common_misconceptions: { type: "array", items: { type: "string" } },
                  study_focus: { type: "string" }
                }
              }
            }
          }
        }
      });

      setQuestions(response.questions || []);
      setCurrentIndex(0);
      setAnswers({});
      toast.success("Prep questionnaire ready");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate questions");
    } finally {
      setLoading(false);
    }
  };

  const generateGapAnalysisAndStudyPlan = async () => {
    setLoading(true);
    try {
      const incorrectAnswers = questions.filter((q, idx) => answers[idx] !== q.correct);
      const correctCount = questions.length - incorrectAnswers.length;
      const scorePercentage = Math.round((correctCount / questions.length) * 100);

      const knowledgeGaps = {};
      incorrectAnswers.forEach(q => {
        if (!knowledgeGaps[q.knowledge_area]) {
          knowledgeGaps[q.knowledge_area] = {
            area: q.knowledge_area,
            questions: [],
            difficulty: []
          };
        }
        knowledgeGaps[q.knowledge_area].questions.push(q.question);
        knowledgeGaps[q.knowledge_area].difficulty.push(q.difficulty);
      });

      const prompt = `You are an expert ${framework} compliance exam coach. Analyze this prep questionnaire performance and create a comprehensive study plan.

PERFORMANCE DATA:
Framework: ${framework}
Score: ${scorePercentage}% (${correctCount}/${questions.length} correct)

INCORRECT ANSWERS (Knowledge Gaps):
${incorrectAnswers.map((q, i) => `
${i + 1}. Knowledge Area: ${q.knowledge_area}
   Difficulty: ${q.difficulty}
   Question: ${q.question}
   Study Focus: ${q.study_focus}
   Common Misconceptions: ${q.common_misconceptions.join(', ')}
`).join('\n')}

KNOWLEDGE GAP SUMMARY:
${Object.values(knowledgeGaps).map(gap => `- ${gap.area}: ${gap.questions.length} gaps`).join('\n')}

Create a DETAILED, ACTIONABLE study plan including:

1. **Readiness Assessment**: Overall readiness level and exam risk
2. **Critical Gaps**: Priority areas requiring immediate focus
3. **Knowledge Gap Analysis**: Detailed breakdown by domain
4. **Exposure Points**: Where candidate is most likely to fail
5. **Study Plan**: Week-by-week structured plan (4-6 weeks)
6. **Daily Study Schedule**: Hour-by-hour breakdown
7. **Recommended Resources**: Specific materials for each gap
8. **Practice Exercises**: Types of questions to focus on
9. **Exam Day Strategy**: Tips for approaching the actual exam
10. **Risk Mitigation**: How to address specific weaknesses

Return detailed JSON with structured study plan.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            readiness_assessment: {
              type: "object",
              properties: {
                readiness_level: { type: "string" },
                exam_risk: { type: "string" },
                predicted_score_range: { type: "string" },
                weeks_to_ready: { type: "number" },
                key_message: { type: "string" }
              }
            },
            critical_gaps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  gap: { type: "string" },
                  severity: { type: "string" },
                  why_critical: { type: "string" },
                  study_hours_needed: { type: "number" }
                }
              }
            },
            knowledge_gap_analysis: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  domain: { type: "string" },
                  proficiency: { type: "string" },
                  gaps: { type: "array", items: { type: "string" } },
                  resources: { type: "array", items: { type: "string" } }
                }
              }
            },
            exposure_points: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  exposure: { type: "string" },
                  risk_level: { type: "string" },
                  mitigation: { type: "string" }
                }
              }
            },
            study_plan: {
              type: "object",
              properties: {
                total_weeks: { type: "number" },
                total_hours: { type: "number" },
                weekly_breakdown: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      week: { type: "number" },
                      focus_areas: { type: "array", items: { type: "string" } },
                      daily_hours: { type: "number" },
                      milestones: { type: "array", items: { type: "string" } }
                    }
                  }
                }
              }
            },
            daily_schedule: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  time_block: { type: "string" },
                  activity: { type: "string" },
                  duration: { type: "string" }
                }
              }
            },
            recommended_resources: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  resource_type: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            practice_strategy: {
              type: "object",
              properties: {
                question_types_to_focus: { type: "array", items: { type: "string" } },
                practice_schedule: { type: "string" },
                mock_exam_timing: { type: "string" }
              }
            },
            exam_day_strategy: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setResults({
        score: scorePercentage,
        correctCount,
        totalQuestions: questions.length,
        analysis: response,
        incorrectAnswers
      });

      if (onComplete) {
        onComplete({
          score: scorePercentage,
          analysis: response,
          framework
        });
      }

      toast.success("Gap analysis complete");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate analysis");
    } finally {
      setLoading(false);
    }
  };

  if (!questions.length && !loading) {
    return (
      <Card className="bg-[#1a2332] border-[#2a3548] p-12">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-indigo-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Prep Questionnaire</h3>
          <p className="text-slate-400 mb-6 max-w-lg mx-auto">
            Take a 15-question readiness assessment to identify knowledge gaps and get a personalized study plan for {framework}
          </p>
          <div className="max-w-xs mx-auto mb-6">
            <Label className="text-slate-300 mb-2 block">Select Difficulty Level</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="beginner" className="text-white hover:bg-[#2a3548]">Beginner</SelectItem>
                <SelectItem value="intermediate" className="text-white hover:bg-[#2a3548]">Intermediate</SelectItem>
                <SelectItem value="advanced" className="text-white hover:bg-[#2a3548]">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={generatePrepQuestions}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading Questions...
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4 mr-2" />
                Start Prep Assessment
              </>
            )}
          </Button>
        </div>
      </Card>
    );
  }

  if (results) {
    const analysis = results.analysis;
    const severityColors = {
      critical: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      low: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
    };

    return (
      <div className="space-y-6">
        {/* Score Overview */}
        <Card className="bg-[#1a2332] border-[#2a3548] p-6">
          <div className="text-center mb-6">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${
              results.score >= 80 ? 'bg-emerald-500/10' :
              results.score >= 60 ? 'bg-amber-500/10' :
              'bg-rose-500/10'
            }`}>
              <div className="text-3xl font-bold text-white">{results.score}%</div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Readiness Assessment Complete</h3>
            <p className="text-slate-400">
              {results.correctCount} / {results.totalQuestions} questions correct
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg text-center">
              <div className="text-sm text-slate-500 mb-1">Readiness Level</div>
              <div className="text-lg font-semibold text-indigo-400">
                {analysis.readiness_assessment?.readiness_level}
              </div>
            </div>
            <div className="p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg text-center">
              <div className="text-sm text-slate-500 mb-1">Exam Risk</div>
              <div className="text-lg font-semibold text-rose-400">
                {analysis.readiness_assessment?.exam_risk}
              </div>
            </div>
            <div className="p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg text-center">
              <div className="text-sm text-slate-500 mb-1">Study Weeks</div>
              <div className="text-lg font-semibold text-white">
                {analysis.readiness_assessment?.weeks_to_ready}
              </div>
            </div>
          </div>

          {analysis.readiness_assessment?.key_message && (
            <div className="mt-4 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
              <p className="text-sm text-slate-300">{analysis.readiness_assessment.key_message}</p>
            </div>
          )}
        </Card>

        {/* Critical Gaps */}
        <Card className="bg-[#1a2332] border-[#2a3548] p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
            Critical Knowledge Gaps ({analysis.critical_gaps?.length || 0})
          </h3>
          <div className="space-y-3">
            {analysis.critical_gaps?.map((gap, idx) => (
              <div key={idx} className="p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-white">{gap.gap}</h4>
                  <Badge className={severityColors[gap.severity]}>{gap.severity}</Badge>
                </div>
                <p className="text-sm text-slate-400 mb-2">{gap.why_critical}</p>
                <div className="text-xs text-slate-500">Study Hours Needed: {gap.study_hours_needed}h</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Knowledge Gap Analysis by Domain */}
        <Card className="bg-[#1a2332] border-[#2a3548] p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-orange-400" />
            Knowledge Gap Analysis
          </h3>
          <div className="space-y-4">
            {analysis.knowledge_gap_analysis?.map((domain, idx) => (
              <div key={idx} className="p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white">{domain.domain}</h4>
                  <Badge className="bg-indigo-500/10 text-indigo-400">{domain.proficiency}</Badge>
                </div>
                {domain.gaps?.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs text-slate-500 mb-2">Specific Gaps:</div>
                    <div className="space-y-1">
                      {domain.gaps.map((gap, i) => (
                        <div key={i} className="text-sm text-rose-400">• {gap}</div>
                      ))}
                    </div>
                  </div>
                )}
                {domain.resources?.length > 0 && (
                  <div>
                    <div className="text-xs text-slate-500 mb-2">Recommended Resources:</div>
                    <div className="space-y-1">
                      {domain.resources.map((resource, i) => (
                        <div key={i} className="text-sm text-emerald-400">• {resource}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Exposure Points */}
        <Card className="bg-[#1a2332] border-[#2a3548] p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-amber-400" />
            Exam Failure Points
          </h3>
          <div className="space-y-3">
            {analysis.exposure_points?.map((exp, idx) => (
              <div key={idx} className="p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-white">{exp.exposure}</h4>
                  <Badge className={severityColors[exp.risk_level]}>{exp.risk_level} risk</Badge>
                </div>
                <div className="text-sm text-slate-400 mb-2">
                  <span className="text-slate-500">Mitigation:</span> {exp.mitigation}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Study Plan */}
        <Card className="bg-[#1a2332] border-[#2a3548] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Personalized Study Plan</h3>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div className="p-3 bg-[#151d2e] border border-[#2a3548] rounded-lg">
              <div className="text-xs text-slate-500 mb-1">Total Duration</div>
              <div className="text-lg font-semibold text-white">
                {analysis.study_plan?.total_weeks} weeks
              </div>
            </div>
            <div className="p-3 bg-[#151d2e] border border-[#2a3548] rounded-lg">
              <div className="text-xs text-slate-500 mb-1">Study Hours</div>
              <div className="text-lg font-semibold text-white">
                {analysis.study_plan?.total_hours}h total
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {analysis.study_plan?.weekly_breakdown?.map((week, idx) => (
              <div key={idx} className="p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white">Week {week.week}</h4>
                  <span className="text-sm text-slate-400">{week.daily_hours}h/day</span>
                </div>
                <div className="mb-2">
                  <div className="text-xs text-slate-500 mb-1">Focus Areas:</div>
                  <div className="flex flex-wrap gap-2">
                    {week.focus_areas?.map((area, i) => (
                      <Badge key={i} className="bg-indigo-500/10 text-indigo-400 text-xs">{area}</Badge>
                    ))}
                  </div>
                </div>
                {week.milestones?.length > 0 && (
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Milestones:</div>
                    <div className="space-y-1">
                      {week.milestones.map((milestone, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          {milestone}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Daily Schedule */}
        {analysis.daily_schedule?.length > 0 && (
          <Card className="bg-[#1a2332] border-[#2a3548] p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Daily Study Schedule</h3>
            <div className="space-y-2">
              {analysis.daily_schedule.map((slot, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-[#151d2e] border border-[#2a3548] rounded-lg">
                  <div className="text-sm font-medium text-indigo-400 w-24">{slot.time_block}</div>
                  <div className="flex-1 text-sm text-slate-300">{slot.activity}</div>
                  <div className="text-xs text-slate-500">{slot.duration}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Recommended Resources */}
        {analysis.recommended_resources?.length > 0 && (
          <Card className="bg-[#1a2332] border-[#2a3548] p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recommended Resources</h3>
            <div className="space-y-3">
              {analysis.recommended_resources.map((resource, idx) => (
                <div key={idx} className="p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <Badge className="bg-slate-500/10 text-slate-400 text-xs mb-2">
                        {resource.resource_type}
                      </Badge>
                      <h4 className="font-medium text-white">{resource.title}</h4>
                    </div>
                    <Badge className={severityColors[resource.priority]}>{resource.priority}</Badge>
                  </div>
                  <p className="text-sm text-slate-400">{resource.description}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Exam Day Strategy */}
        {analysis.exam_day_strategy?.length > 0 && (
          <Card className="bg-[#1a2332] border-[#2a3548] p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Exam Day Strategy</h3>
            <div className="space-y-2">
              {analysis.exam_day_strategy.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5" />
                  {tip}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548] p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <Badge className="bg-indigo-500/10 text-indigo-400">
              {currentQuestion.difficulty}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="mb-4">
          <Badge className="bg-slate-500/10 text-slate-400 mb-3">
            {currentQuestion.knowledge_area}
          </Badge>
          <h3 className="text-lg text-white font-medium mb-4">{currentQuestion.question}</h3>
        </div>

        <RadioGroup
          value={answers[currentIndex]}
          onValueChange={(value) => setAnswers({ ...answers, [currentIndex]: value })}
        >
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const letter = option.charAt(0);
              return (
                <div
                  key={idx}
                  className={`flex items-start space-x-3 p-4 rounded-lg border transition-all cursor-pointer ${
                    answers[currentIndex] === letter
                      ? 'bg-indigo-500/10 border-indigo-500/50'
                      : 'bg-[#151d2e] border-[#2a3548] hover:border-[#3a4558]'
                  }`}
                  onClick={() => setAnswers({ ...answers, [currentIndex]: letter })}
                >
                  <RadioGroupItem value={letter} id={`q${currentIndex}-${letter}`} />
                  <Label
                    htmlFor={`q${currentIndex}-${letter}`}
                    className="flex-1 text-slate-300 cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              );
            })}
          </div>
        </RadioGroup>

        <div className="flex justify-between items-center pt-6 border-t border-[#2a3548] mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="border-[#2a3548] hover:bg-[#2a3548]"
          >
            Previous
          </Button>

          <div className="text-sm text-slate-400">
            {Object.keys(answers).length} / {questions.length} answered
          </div>

          {currentIndex === questions.length - 1 ? (
            <Button
              onClick={generateGapAnalysisAndStudyPlan}
              disabled={Object.keys(answers).length < questions.length || loading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Complete Assessment
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentIndex(currentIndex + 1)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Next
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}