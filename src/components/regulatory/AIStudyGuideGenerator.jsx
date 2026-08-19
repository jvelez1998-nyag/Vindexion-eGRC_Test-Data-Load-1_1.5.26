import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Loader2, Download, Lightbulb, Target, BookMarked, FileText, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function AIStudyGuideGenerator({ exams, prepResults }) {
  const [loading, setLoading] = useState(false);
  const [studyGuide, setStudyGuide] = useState(null);
  const [selectedFramework, setSelectedFramework] = useState(null);
  const [practiceAnswers, setPracticeAnswers] = useState({});
  const [moduleProgress, setModuleProgress] = useState({});
  const [showFeedback, setShowFeedback] = useState({});
  const [spacedRepetitionData, setSpacedRepetitionData] = useState({});
  const [showCustomWeaknessDialog, setShowCustomWeaknessDialog] = useState(false);
  const [selectedWeaknesses, setSelectedWeaknesses] = useState([]);

  const handlePracticeAnswer = (moduleIdx, questionIdx, isCorrect) => {
    const key = `${moduleIdx}-${questionIdx}`;
    setShowFeedback({ ...showFeedback, [key]: true });
    
    // Spaced repetition tracking
    const now = new Date().getTime();
    const currentData = spacedRepetitionData[key] || { attempts: 0, lastReview: 0, interval: 1 };
    
    const newInterval = isCorrect 
      ? Math.min(currentData.interval * 2, 30) // Max 30 days
      : 1; // Reset to 1 day on incorrect
    
    setSpacedRepetitionData({
      ...spacedRepetitionData,
      [key]: {
        attempts: currentData.attempts + 1,
        lastReview: now,
        interval: newInterval,
        nextReview: now + (newInterval * 24 * 60 * 60 * 1000),
        correct: isCorrect
      }
    });
  };

  const markModule = (moduleIdx, status) => {
    setModuleProgress({ ...moduleProgress, [moduleIdx]: status });
    toast.success(`Module marked as ${status === 'completed' ? 'completed' : 'needs review'}`);
  };

  const analyzePerformanceAndGenerateGuide = async (framework, customWeaknesses = null) => {
    setLoading(true);
    setSelectedFramework(framework);
    setPracticeAnswers({});
    setModuleProgress({});
    setShowFeedback({});

    try {
      // Gather all performance data for this framework
      const frameworkExams = exams.filter(e => e.framework === framework && e.status !== 'in_progress');
      const frameworkPrepResults = prepResults?.filter(p => p.framework === framework) || [];

      const hasPerformanceData = frameworkExams.length > 0 || frameworkPrepResults.length > 0;

      let prompt;
      let performanceStats = { averageScore: 0, totalQuestions: 0, examsTaken: 0 };
      let topWeakAreas = [];

      // Custom weakness-focused guide
      if (customWeaknesses && customWeaknesses.length > 0) {
        prompt = `You are an expert ${framework} compliance instructor. Create a HIGHLY FOCUSED study guide targeting these specific weakness areas identified by the student:

TARGETED WEAKNESS AREAS:
${customWeaknesses.join('\n- ')}

This is a CUSTOM WEAKNESS-FOCUSED guide. Provide:
1. Deep dive explanations for each weakness area
2. Multiple practice scenarios for each weakness
3. Common mistakes and how to avoid them
4. Step-by-step mastery plan for each area
5. Interactive exercises with increasing difficulty
6. Real-world application examples
7. Memory aids and quick reference materials
8. Assessment questions to verify understanding

Make it extremely practical and actionable. Focus 100% on these weaknesses.`;

        performanceStats = { averageScore: 0, totalQuestions: 0, examsTaken: 0, customFocus: true };
        topWeakAreas = customWeaknesses.map(w => ({ area: w, count: 1 }));
      } else if (hasPerformanceData) {
        // Collect all incorrect answers and weak areas
        const weakAreas = [];
        const incorrectQuestions = [];
        
        frameworkExams.forEach(exam => {
          if (exam.responses) {
            exam.responses.forEach(resp => {
              if (!resp.is_correct) {
                incorrectQuestions.push({
                  question: resp.question,
                  userAnswer: resp.user_answer,
                  correctAnswer: resp.correct_answer,
                  explanation: resp.explanation,
                  reference: resp.reference,
                  regulationSection: resp.regulation_section,
                  relatedControls: resp.related_controls
                });
                
                if (resp.reference) {
                  weakAreas.push({
                    area: resp.reference,
                    riskLevel: exam.responses.find(r => r.question === resp.question)?.risk_level || 'medium',
                    regulationSection: resp.regulation_section
                  });
                }
              }
            });
          }
        });

        // Add prep assessment gaps
        frameworkPrepResults.forEach(prep => {
          if (prep.incorrectAnswers) {
            prep.incorrectAnswers.forEach(q => {
              weakAreas.push({
                area: q.knowledge_area,
                riskLevel: 'medium',
                regulationSection: q.regulation_section
              });
            });
          }
        });

        // Calculate statistics
        const totalQuestions = frameworkExams.reduce((sum, exam) => sum + (exam.total_questions || 0), 0);
        const totalCorrect = frameworkExams.reduce((sum, exam) => sum + (exam.correct_answers || 0), 0);
        const averageScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

        performanceStats = { averageScore, totalQuestions, examsTaken: frameworkExams.length };

        // Group weak areas by frequency
        const areaFrequency = {};
        weakAreas.forEach(area => {
          const key = area.area || area.regulationSection || 'General';
          areaFrequency[key] = (areaFrequency[key] || 0) + 1;
        });

        topWeakAreas = Object.entries(areaFrequency)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([area, count]) => ({ area, count }));

        prompt = `You are an expert ${framework} compliance instructor. Create a comprehensive, personalized study guide based on this student's exam performance.

PERFORMANCE SUMMARY:
- Framework: ${framework}
- Exams Taken: ${frameworkExams.length}
- Average Score: ${averageScore}%
- Total Questions Answered: ${totalQuestions}
- Total Incorrect: ${totalQuestions - totalCorrect}

TOP WEAK AREAS (by frequency):
${topWeakAreas.map(wa => `- ${wa.area}: ${wa.count} mistakes`).join('\n')}

INCORRECT QUESTIONS SAMPLE (first 15):
${incorrectQuestions.slice(0, 15).map((q, i) => `
${i + 1}. Question: ${q.question}
   Student's Answer: ${q.userAnswer}
   Correct Answer: ${q.correctAnswer}
   Reference: ${q.reference}
   Regulation Section: ${q.regulationSection}
   Explanation: ${q.explanation}
`).join('\n')}

Create a comprehensive study guide with the following structure:`;
      } else {
        // Generate general comprehensive study guide
        prompt = `You are an expert ${framework} compliance instructor. Create a comprehensive study guide for someone preparing to learn ${framework} compliance from scratch or preparing for certification.

This is a GENERAL study guide (no specific performance data available), so cover ALL major topics comprehensively.

Create a comprehensive study guide with the following structure:`;
      }

      // Add previous module progress feedback if available
      const savedProgress = Object.entries(moduleProgress);
      if (savedProgress.length > 0) {
        prompt += `\n\nPREVIOUS STUDY SESSION FEEDBACK:`;
        savedProgress.forEach(([idx, status]) => {
          prompt += `\nModule ${parseInt(idx) + 1}: ${status}`;
        });
        prompt += `\n\nConsider this feedback when structuring the guide. Emphasize areas marked as "needs review".`;
      }

      prompt += `

1. **Executive Summary**: Overall assessment of student's knowledge level and readiness
2. **Priority Learning Path**: Step-by-step learning sequence for the top weak areas
3. **Deep Dive Modules**: For each top weak area (max 8), provide:
   - Comprehensive explanation of the concept
   - Why it matters (business context and regulatory importance)
   - Common misconceptions and pitfalls
   - Key requirements and control objectives
   - Real-world application scenarios
   - Practice questions (3-5 per module)
   - Recommended resources

4. **Quick Reference Guide**: Key facts, definitions, and mnemonics
5. **Study Schedule**: Suggested timeline and milestones (2-4 weeks)
6. **Practice Scenarios**: 5 complex scenarios integrating multiple concepts
7. **Exam Strategy Tips**: Specific to ${framework} exams

Make it detailed, actionable, and focused on the student's specific gaps. Use concrete examples and avoid generic advice.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: {
              type: "object",
              properties: {
                readiness_level: { type: "string" },
                knowledge_gaps: { type: "array", items: { type: "string" } },
                estimated_study_time: { type: "string" },
                key_message: { type: "string" }
              }
            },
            priority_learning_path: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  step: { type: "number" },
                  topic: { type: "string" },
                  duration: { type: "string" },
                  objectives: { type: "array", items: { type: "string" } }
                }
              }
            },
            deep_dive_modules: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  importance: { type: "string" },
                  concept_explanation: { type: "string" },
                  why_it_matters: { type: "string" },
                  common_misconceptions: { type: "array", items: { type: "string" } },
                  key_requirements: { type: "array", items: { type: "string" } },
                  real_world_scenarios: { type: "array", items: { type: "string" } },
                  practice_questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                        answer: { type: "string" },
                        difficulty: { type: "string" },
                        hints: { type: "array", items: { type: "string" } }
                      }
                    }
                  },
                  interactive_exercises: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        exercise_type: { type: "string" },
                        scenario: { type: "string" },
                        tasks: { type: "array", items: { type: "string" } },
                        success_criteria: { type: "string" }
                      }
                    }
                  },
                  recommended_resources: { type: "array", items: { type: "string" } }
                }
              }
            },
            quick_reference: {
              type: "object",
              properties: {
                key_definitions: { type: "array", items: { type: "object" } },
                mnemonics: { type: "array", items: { type: "string" } },
                critical_numbers: { type: "array", items: { type: "string" } }
              }
            },
            study_schedule: {
              type: "object",
              properties: {
                total_duration: { type: "string" },
                weekly_plan: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      week: { type: "number" },
                      focus: { type: "string" },
                      activities: { type: "array", items: { type: "string" } },
                      milestones: { type: "array", items: { type: "string" } }
                    }
                  }
                }
              }
            },
            practice_scenarios: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  scenario: { type: "string" },
                  questions: { type: "array", items: { type: "string" } },
                  solution_approach: { type: "string" }
                }
              }
            },
            exam_strategy_tips: { type: "array", items: { type: "string" } }
          }
        }
      });

      setStudyGuide({
        framework,
        performance: performanceStats,
        topWeakAreas,
        hasPerformanceData,
        ...response
      });

      toast.success("Study guide generated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate study guide");
    } finally {
      setLoading(false);
    }
  };

  const downloadStudyGuide = () => {
    if (!studyGuide) return;

    let content = `# ${studyGuide.framework} Personalized Study Guide\n\n`;
    content += `## Performance Overview\n`;
    content += `- Average Score: ${studyGuide.performance.averageScore}%\n`;
    content += `- Exams Taken: ${studyGuide.performance.examsTaken}\n`;
    content += `- Total Questions: ${studyGuide.performance.totalQuestions}\n\n`;

    content += `## Executive Summary\n`;
    content += `**Readiness Level:** ${studyGuide.executive_summary?.readiness_level}\n\n`;
    content += `**Estimated Study Time:** ${studyGuide.executive_summary?.estimated_study_time}\n\n`;
    content += `${studyGuide.executive_summary?.key_message}\n\n`;

    studyGuide.deep_dive_modules?.forEach((module, idx) => {
      content += `## Module ${idx + 1}: ${module.title}\n\n`;
      content += `${module.concept_explanation}\n\n`;
      content += `**Why It Matters:** ${module.why_it_matters}\n\n`;
      content += `**Key Requirements:**\n`;
      module.key_requirements?.forEach(req => content += `- ${req}\n`);
      content += `\n`;
    });

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${studyGuide.framework}-Study-Guide.md`;
    a.click();
    toast.success("Study guide downloaded");
  };

  // All available frameworks
  const allFrameworks = [
    'SOX', 'SOC2', 'ISO27001', 'GDPR', 'PCI-DSS', 
    'HIPAA', 'NIST', 'COBIT', 'FFIEC', 'DORA',
    'EU_AI_ACT', 'CCPA', 'NYDFS', 'DSA'
  ];

  // Get frameworks with exam data
  const frameworksWithData = [...new Set(exams.map(e => e.framework))];

  // Extract unique weakness areas from exam history
  const extractWeaknessAreas = () => {
    const weaknessSet = new Set();
    exams.forEach(exam => {
      if (exam.responses) {
        exam.responses.forEach(resp => {
          if (!resp.is_correct && resp.reference) {
            weaknessSet.add(resp.reference);
          }
        });
      }
    });
    return Array.from(weaknessSet);
  };

  const availableWeaknesses = extractWeaknessAreas();

  const generateCustomWeaknessGuide = () => {
    if (selectedWeaknesses.length === 0) {
      toast.error("Please select at least one weakness area");
      return;
    }
    setShowCustomWeaknessDialog(false);
    analyzePerformanceAndGenerateGuide(selectedFramework, selectedWeaknesses);
  };

  if (!studyGuide) {
    return (
      <Card className="bg-[#1a2332] border-[#2a3548] p-6">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-indigo-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">AI Study Guide Generator</h3>
          <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
            Generate comprehensive study guides for any framework. Personalized guides for frameworks you've tested on, or general guides for new frameworks.
          </p>

          <p className="text-sm text-slate-400 mb-4">Select a framework to generate your study guide:</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-7 gap-3 max-w-7xl mx-auto">
            {allFrameworks.map(fw => {
              const hasData = frameworksWithData.includes(fw);
              return (
                <Button
                  key={fw}
                  onClick={() => analyzePerformanceAndGenerateGuide(fw)}
                  disabled={loading}
                  className={`h-auto py-4 relative ${
                    hasData 
                      ? 'bg-indigo-600 hover:bg-indigo-700' 
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  {hasData && (
                    <Badge className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] px-1.5 py-0.5">
                      Data
                    </Badge>
                  )}
                  {loading && selectedFramework === fw ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <BookMarked className="h-4 w-4 mr-2" />
                      {fw}
                    </>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </Card>
    );
  }

  const importanceColors = {
    critical: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  };

  return (
    <>
      {/* Custom Weakness Dialog */}
      {showCustomWeaknessDialog && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <Card className="bg-[#1a2332] border-[#2a3548] max-w-2xl w-full max-h-[80vh] overflow-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-violet-400" />
                Custom Weakness-Focused Study Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-400">
                Select specific weakness areas to generate a highly focused study guide targeting only these topics.
              </p>
              
              {availableWeaknesses.length > 0 ? (
                <>
                  <div className="space-y-2 max-h-60 overflow-y-auto border border-[#2a3548] rounded p-3">
                    {availableWeaknesses.map(weakness => (
                      <div key={weakness} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={weakness}
                          checked={selectedWeaknesses.includes(weakness)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedWeaknesses([...selectedWeaknesses, weakness]);
                            } else {
                              setSelectedWeaknesses(selectedWeaknesses.filter(w => w !== weakness));
                            }
                          }}
                          className="rounded border-[#2a3548]"
                        />
                        <label htmlFor={weakness} className="text-sm text-slate-300 cursor-pointer">
                          {weakness}
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-slate-500">
                    Selected: {selectedWeaknesses.length} weakness area(s)
                  </div>
                </>
              ) : (
                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded text-center">
                  <p className="text-sm text-amber-400">
                    No weakness data available yet. Complete some exams first to identify weak areas.
                  </p>
                </div>
              )}
              
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCustomWeaknessDialog(false);
                    setSelectedWeaknesses([]);
                  }}
                  className="border-[#2a3548]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={generateCustomWeaknessGuide}
                  disabled={selectedWeaknesses.length === 0 || loading}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Generate Custom Guide
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-6">
        <Card className="bg-[#1a2332] border-[#2a3548] p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-indigo-400" />
              {studyGuide.framework} Study Guide
            </h2>
            <p className="text-slate-400 text-sm">Personalized based on your performance</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={downloadStudyGuide}
              variant="outline"
              className="border-[#2a3548] hover:bg-[#2a3548]"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              onClick={() => {
                setShowCustomWeaknessDialog(true);
              }}
              variant="outline"
              className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
            >
              <Target className="h-4 w-4 mr-2" />
              Custom Weakness Focus
            </Button>
            <Button
              onClick={() => setStudyGuide(null)}
              variant="outline"
              className="border-[#2a3548] hover:bg-[#2a3548]"
            >
              Generate Another
            </Button>
          </div>
        </div>

        {/* Performance Stats */}
        {studyGuide.hasPerformanceData ? (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg text-center">
              <div className="text-2xl font-bold text-white mb-1">{studyGuide.performance.averageScore}%</div>
              <div className="text-xs text-slate-500">Average Score</div>
            </div>
            <div className="p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg text-center">
              <div className="text-2xl font-bold text-indigo-400 mb-1">{studyGuide.performance.examsTaken}</div>
              <div className="text-xs text-slate-500">Exams Taken</div>
            </div>
            <div className="p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg text-center">
              <div className="text-2xl font-bold text-amber-400 mb-1">{studyGuide.topWeakAreas.length}</div>
              <div className="text-xs text-slate-500">Focus Areas</div>
            </div>
            <div className="p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg text-center">
              <div className="text-2xl font-bold text-emerald-400 mb-1">
                {Object.values(moduleProgress).filter(p => p === 'completed').length}
              </div>
              <div className="text-xs text-slate-500">Modules Completed</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg text-center">
              <BookOpen className="h-5 w-5 text-blue-400 mx-auto mb-2" />
              <p className="text-sm text-blue-300">General comprehensive study guide</p>
            </div>
            <div className="p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg text-center">
              <div className="text-2xl font-bold text-emerald-400 mb-1">
                {Object.values(moduleProgress).filter(p => p === 'completed').length}
              </div>
              <div className="text-xs text-slate-500">Modules Completed</div>
            </div>
          </div>
        )}

        {/* Executive Summary */}
        <Card className="bg-indigo-500/5 border-indigo-500/20 p-5 mb-6">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-400" />
            Executive Summary
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Readiness Level:</span>
              <Badge className="bg-indigo-500/20 text-indigo-300">
                {studyGuide.executive_summary?.readiness_level}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Estimated Study Time:</span>
              <span className="text-sm text-white">{studyGuide.executive_summary?.estimated_study_time}</span>
            </div>
            <p className="text-sm text-slate-300 pt-2 border-t border-indigo-500/20">
              {studyGuide.executive_summary?.key_message}
            </p>
          </div>
        </Card>

        <Tabs defaultValue="learning-path" className="space-y-6">
          <TabsList className="bg-[#151d2e] border border-[#2a3548]">
            <TabsTrigger value="learning-path">Learning Path</TabsTrigger>
            <TabsTrigger value="modules">Deep Dive</TabsTrigger>
            <TabsTrigger value="schedule">Study Schedule</TabsTrigger>
            <TabsTrigger value="practice">Practice</TabsTrigger>
            <TabsTrigger value="reference">Quick Reference</TabsTrigger>
          </TabsList>

          <TabsContent value="learning-path" className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Priority Learning Path</h3>
            {studyGuide.priority_learning_path?.map((step, idx) => (
              <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-5">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 font-bold">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">{step.topic}</h4>
                      <Badge className="bg-slate-500/10 text-slate-400">{step.duration}</Badge>
                    </div>
                    <div className="space-y-1">
                      {step.objectives?.map((obj, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                          {obj}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="modules">
            <ScrollArea className="h-[600px]">
              <div className="space-y-6 pr-4">
                {studyGuide.deep_dive_modules?.map((module, idx) => (
                  <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">Module {idx + 1}: {module.title}</h3>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => markModule(idx, 'completed')}
                            size="sm"
                            variant={moduleProgress[idx] === 'completed' ? 'default' : 'outline'}
                            className={moduleProgress[idx] === 'completed' 
                              ? 'bg-emerald-600 hover:bg-emerald-700' 
                              : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {moduleProgress[idx] === 'completed' ? 'Completed' : 'Mark Complete'}
                          </Button>
                          <Button
                            onClick={() => markModule(idx, 'needs_review')}
                            size="sm"
                            variant={moduleProgress[idx] === 'needs_review' ? 'default' : 'outline'}
                            className={moduleProgress[idx] === 'needs_review' 
                              ? 'bg-amber-600 hover:bg-amber-700' 
                              : 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'}
                          >
                            <BookOpen className="h-3 w-3 mr-1" />
                            {moduleProgress[idx] === 'needs_review' ? 'Needs Review' : 'Mark for Review'}
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        {module.importance && (
                          <Badge className={importanceColors[module.importance.toLowerCase()] || importanceColors.medium}>
                            {module.importance}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-indigo-400 mb-2">Concept Explanation</h4>
                        <p className="text-sm text-slate-300">{module.concept_explanation}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-emerald-400 mb-2">Why It Matters</h4>
                        <p className="text-sm text-slate-300">{module.why_it_matters}</p>
                      </div>

                      {module.common_misconceptions?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-rose-400 mb-2">Common Misconceptions</h4>
                          <div className="space-y-1">
                            {module.common_misconceptions.map((misc, i) => (
                              <div key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                <span className="text-rose-400">•</span>
                                {misc}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {module.key_requirements?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-blue-400 mb-2">Key Requirements</h4>
                          <div className="space-y-1">
                            {module.key_requirements.map((req, i) => (
                              <div key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                {req}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {module.real_world_scenarios?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-amber-400 mb-2">Real-World Scenarios</h4>
                          <div className="space-y-2">
                            {module.real_world_scenarios.map((scenario, i) => (
                              <div key={i} className="p-3 bg-amber-500/5 border border-amber-500/20 rounded text-sm text-slate-300">
                                {scenario}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Interactive Practice Questions with Spaced Repetition */}
                      {module.practice_questions?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-violet-400 mb-2 flex items-center gap-2">
                            Practice Questions (Interactive + Spaced Repetition)
                            <Badge className="bg-violet-500/10 text-violet-400 text-[10px]">
                              {module.practice_questions.filter((_, i) => {
                                const key = `${idx}-${i}`;
                                const data = spacedRepetitionData[key];
                                return data?.correct;
                              }).length} / {module.practice_questions.length} mastered
                            </Badge>
                          </h4>
                          <div className="space-y-3">
                            {module.practice_questions.map((pq, i) => {
                              const answerKey = `${idx}-${i}`;
                              const userAnswer = practiceAnswers[answerKey];
                              const showAnswer = showFeedback[answerKey];
                              const srData = spacedRepetitionData[answerKey];
                              
                              // Check if due for review
                              const isDue = !srData || (srData.nextReview && new Date().getTime() >= srData.nextReview);
                              
                              return (
                                <div key={i} className={`p-4 rounded border ${
                                  isDue ? 'bg-amber-500/5 border-amber-500/20' : 'bg-[#1a2332] border-[#2a3548]'
                                }`}>
                                  <div className="flex items-start justify-between mb-2">
                                    <p className="text-sm text-white font-medium">Q{i + 1}: {pq.question}</p>
                                    {pq.difficulty && (
                                      <Badge className="bg-slate-500/10 text-slate-400 text-[10px]">{pq.difficulty}</Badge>
                                    )}
                                  </div>
                                  
                                  {isDue && srData && (
                                    <div className="mb-2 text-xs text-amber-400 flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      Due for review (Last: {Math.floor((new Date().getTime() - srData.lastReview) / (24*60*60*1000))} days ago)
                                    </div>
                                  )}
                                  
                                  {!showAnswer ? (
                                    <div className="space-y-2">
                                      {pq.hints && pq.hints.length > 0 && (
                                        <details className="text-xs">
                                          <summary className="text-blue-400 cursor-pointer hover:text-blue-300">Show hints</summary>
                                          <div className="mt-2 space-y-1 pl-3">
                                            {pq.hints.map((hint, hi) => (
                                              <p key={hi} className="text-slate-400">💡 {hint}</p>
                                            ))}
                                          </div>
                                        </details>
                                      )}
                                      <textarea
                                        value={userAnswer || ''}
                                        onChange={(e) => setPracticeAnswers({ ...practiceAnswers, [answerKey]: e.target.value })}
                                        placeholder="Type your answer here..."
                                        className="w-full p-2 bg-[#151d2e] border border-[#2a3548] rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        rows={2}
                                      />
                                      <Button
                                        onClick={() => handlePracticeAnswer(idx, i, true)}
                                        disabled={!userAnswer || userAnswer.trim().length === 0}
                                        size="sm"
                                        className="bg-violet-600 hover:bg-violet-700"
                                      >
                                        Check Answer
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded">
                                        <div className="flex items-start gap-2 mb-2">
                                          <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                          <span className="text-xs font-semibold text-emerald-400">Model Answer:</span>
                                        </div>
                                        <p className="text-xs text-slate-300">{pq.answer}</p>
                                      </div>
                                      {userAnswer && (
                                        <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded">
                                          <div className="text-xs font-semibold text-blue-400 mb-1">Your Answer:</div>
                                          <p className="text-xs text-slate-300">{userAnswer}</p>
                                        </div>
                                      )}
                                      {srData && (
                                        <div className="text-xs text-slate-500">
                                          Next review in {Math.ceil((srData.nextReview - new Date().getTime()) / (24*60*60*1000))} days 
                                          • Attempts: {srData.attempts}
                                        </div>
                                      )}
                                      <div className="flex gap-2">
                                        <Button
                                          onClick={() => {
                                            setPracticeAnswers({ ...practiceAnswers, [answerKey]: '' });
                                            setShowFeedback({ ...showFeedback, [answerKey]: false });
                                          }}
                                          size="sm"
                                          variant="outline"
                                          className="border-[#2a3548] hover:bg-[#2a3548]"
                                        >
                                          Try Again
                                        </Button>
                                        <Button
                                          onClick={() => handlePracticeAnswer(idx, i, false)}
                                          size="sm"
                                          variant="outline"
                                          className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                                        >
                                          Mark as Incorrect
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Interactive Exercises */}
                      {module.interactive_exercises?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-indigo-400 mb-2">Interactive Exercises</h4>
                          <div className="space-y-3">
                            {module.interactive_exercises.map((ex, i) => (
                              <div key={i} className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded">
                                <Badge className="bg-indigo-500/10 text-indigo-400 text-xs mb-2">{ex.exercise_type}</Badge>
                                <p className="text-sm text-slate-300 mb-3">{ex.scenario}</p>
                                <div className="mb-3">
                                  <div className="text-xs text-slate-500 mb-2">Tasks:</div>
                                  <div className="space-y-1">
                                    {ex.tasks?.map((task, ti) => (
                                      <div key={ti} className="text-sm text-slate-300 flex items-start gap-2">
                                        <span className="text-indigo-400">{ti + 1}.</span>
                                        {task}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="text-xs text-emerald-400">
                                  <strong>Success Criteria:</strong> {ex.success_criteria}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {module.recommended_resources?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-slate-400 mb-2">Recommended Resources</h4>
                          <div className="space-y-1">
                            {module.recommended_resources.map((resource, i) => (
                              <div key={i} className="text-xs text-slate-400 flex items-start gap-2">
                                <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                {resource}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">Study Schedule</h3>
              <p className="text-sm text-slate-400">
                Total Duration: {studyGuide.study_schedule?.total_duration}
              </p>
            </div>
            {studyGuide.study_schedule?.weekly_plan?.map((week, idx) => (
              <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Badge className="bg-indigo-500/20 text-indigo-300">Week {week.week}</Badge>
                  <h4 className="font-semibold text-white">{week.focus}</h4>
                </div>
                <div className="space-y-3">
                  {week.activities?.length > 0 && (
                    <div>
                      <h5 className="text-xs font-semibold text-slate-500 mb-2 uppercase">Activities</h5>
                      <div className="space-y-1">
                        {week.activities.map((activity, i) => (
                          <div key={i} className="text-sm text-slate-300 flex items-start gap-2">
                            <span className="text-indigo-400">•</span>
                            {activity}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {week.milestones?.length > 0 && (
                    <div>
                      <h5 className="text-xs font-semibold text-slate-500 mb-2 uppercase">Milestones</h5>
                      <div className="space-y-1">
                        {week.milestones.map((milestone, i) => (
                          <div key={i} className="text-sm text-emerald-300 flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            {milestone}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="practice" className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Practice Scenarios</h3>
            {studyGuide.practice_scenarios?.map((scenario, idx) => (
              <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-5">
                <h4 className="font-semibold text-white mb-3">{scenario.title}</h4>
                <div className="space-y-3">
                  <div>
                    <h5 className="text-xs font-semibold text-slate-500 mb-2 uppercase">Scenario</h5>
                    <p className="text-sm text-slate-300">{scenario.scenario}</p>
                  </div>
                  {scenario.questions?.length > 0 && (
                    <div>
                      <h5 className="text-xs font-semibold text-slate-500 mb-2 uppercase">Questions to Consider</h5>
                      <div className="space-y-1">
                        {scenario.questions.map((q, i) => (
                          <div key={i} className="text-sm text-slate-300 flex items-start gap-2">
                            <span className="text-indigo-400">{i + 1}.</span>
                            {q}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <h5 className="text-xs font-semibold text-slate-500 mb-2 uppercase">Solution Approach</h5>
                    <p className="text-sm text-emerald-300">{scenario.solution_approach}</p>
                  </div>
                </div>
              </Card>
            ))}

            {studyGuide.exam_strategy_tips?.length > 0 && (
              <Card className="bg-blue-500/5 border-blue-500/20 p-5 mt-6">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-blue-400" />
                  Exam Strategy Tips
                </h4>
                <div className="space-y-2">
                  {studyGuide.exam_strategy_tips.map((tip, i) => (
                    <div key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      {tip}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reference">
            <div className="space-y-6">
              {studyGuide.quick_reference?.key_definitions?.length > 0 && (
                <Card className="bg-[#151d2e] border-[#2a3548] p-5">
                  <h4 className="font-semibold text-white mb-3">Key Definitions</h4>
                  <div className="space-y-2">
                    {studyGuide.quick_reference.key_definitions.map((def, i) => (
                      <div key={i} className="text-sm">
                        <span className="text-indigo-400 font-medium">{def.term || def.name}:</span>{' '}
                        <span className="text-slate-300">{def.definition || def.description}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {studyGuide.quick_reference?.mnemonics?.length > 0 && (
                <Card className="bg-[#151d2e] border-[#2a3548] p-5">
                  <h4 className="font-semibold text-white mb-3">Memory Aids & Mnemonics</h4>
                  <div className="space-y-2">
                    {studyGuide.quick_reference.mnemonics.map((mnemonic, i) => (
                      <div key={i} className="text-sm text-slate-300 p-2 bg-purple-500/5 border border-purple-500/20 rounded">
                        {mnemonic}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {studyGuide.quick_reference?.critical_numbers?.length > 0 && (
                <Card className="bg-[#151d2e] border-[#2a3548] p-5">
                  <h4 className="font-semibold text-white mb-3">Critical Numbers & Facts</h4>
                  <div className="space-y-2">
                    {studyGuide.quick_reference.critical_numbers.map((num, i) => (
                      <div key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-amber-400">•</span>
                        {num}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
      </div>
    </>
  );
}