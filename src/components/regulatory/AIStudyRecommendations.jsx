import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Brain, Loader2, Target, BookOpen, Clock, Zap, TrendingUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function AIStudyRecommendations({ exams, onStartTargetedExam }) {
  const [generating, setGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  const generateRecommendations = async () => {
    setGenerating(true);
    try {
      const completedExams = exams.filter(e => e.status === 'passed' || e.status === 'failed');
      
      // Aggregate performance data
      const weakAreas = {};
      const frameworkPerformance = {};
      const timeSpentByArea = {};
      
      completedExams.forEach(exam => {
        if (!frameworkPerformance[exam.framework]) {
          frameworkPerformance[exam.framework] = {
            attempts: 0,
            avgScore: 0,
            totalScore: 0,
            passed: 0
          };
        }
        
        frameworkPerformance[exam.framework].attempts++;
        frameworkPerformance[exam.framework].totalScore += exam.score_percentage || 0;
        if (exam.status === 'passed') frameworkPerformance[exam.framework].passed++;
        
        exam.responses?.forEach(resp => {
          if (!resp.is_correct) {
            const area = resp.reference || 'Unknown';
            if (!weakAreas[area]) {
              weakAreas[area] = {
                count: 0,
                riskLevels: [],
                regulationSections: new Set(),
                frameworks: new Set()
              };
            }
            weakAreas[area].count++;
            if (resp.risk_level) weakAreas[area].riskLevels.push(resp.risk_level);
            if (resp.regulation_section) weakAreas[area].regulationSections.add(resp.regulation_section);
            weakAreas[area].frameworks.add(exam.framework);
          }
        });
      });

      Object.keys(frameworkPerformance).forEach(fw => {
        frameworkPerformance[fw].avgScore = Math.round(
          frameworkPerformance[fw].totalScore / frameworkPerformance[fw].attempts
        );
      });

      const performanceData = {
        totalExams: completedExams.length,
        frameworks: frameworkPerformance,
        weakAreas: Object.entries(weakAreas)
          .map(([area, data]) => ({
            area,
            errorCount: data.count,
            criticalityLevel: data.riskLevels.filter(r => r === 'critical' || r === 'high').length > data.count / 2 ? 'high' : 'medium',
            regulationSections: Array.from(data.regulationSections),
            frameworks: Array.from(data.frameworks)
          }))
          .sort((a, b) => b.errorCount - a.errorCount)
          .slice(0, 10)
      };

      const prompt = `You are an expert GRC exam preparation coach. Analyze this student's performance data and create a personalized study plan.

PERFORMANCE DATA:
${JSON.stringify(performanceData, null, 2)}

ANALYSIS REQUIREMENTS:

1. **Performance Assessment**
   - Overall readiness level (Beginner/Intermediate/Advanced/Expert)
   - Strengths (areas where they perform well)
   - Critical weaknesses requiring immediate attention
   - Improvement trajectory

2. **Prioritized Study Plan**
   Create a 4-week study plan with:
   - Week-by-week focus areas
   - Specific topics to review
   - Estimated study hours per week
   - Practice exam recommendations

3. **Framework-Specific Recommendations**
   For each framework they've tested:
   - Current mastery level (%)
   - Key gaps to address
   - Study materials focus areas
   - Next exam readiness date

4. **Targeted Practice Areas**
   - Top 5 areas requiring immediate practice
   - Specific regulation sections to review
   - Related control concepts to study
   - Real-world application scenarios

5. **Study Techniques**
   - Recommended study methods based on performance patterns
   - Time allocation suggestions
   - Practice frequency recommendations

6. **Next Steps**
   - Immediate actions (this week)
   - Short-term goals (1 month)
   - Long-term mastery goals (3 months)

7. **Exam Strategy Tips**
   - Based on common mistakes
   - Time management suggestions
   - Question-answering strategies

Format as structured markdown with clear sections, bullet points, and actionable items. Be specific and encouraging.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      // Extract targeted exam config
      const topWeakAreas = performanceData.weakAreas.slice(0, 5);
      const suggestedFramework = Object.entries(frameworkPerformance)
        .sort((a, b) => a[1].avgScore - b[1].avgScore)[0]?.[0];

      setRecommendations({
        studyPlan: response,
        targetedExamConfig: {
          framework: suggestedFramework,
          focusAreas: topWeakAreas.map(a => a.area),
          difficulty: performanceData.frameworks[suggestedFramework]?.avgScore < 70 ? 'intermediate' : 'advanced',
          regulationSections: topWeakAreas.flatMap(a => a.regulationSections)
        },
        performanceData
      });

      toast.success("Study plan generated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate recommendations");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            AI Study Recommendations
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Personalized study plan based on your performance
          </p>
        </div>
        {!recommendations && (
          <Button 
            onClick={generateRecommendations}
            disabled={generating || exams.filter(e => e.status === 'passed' || e.status === 'failed').length === 0}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Generate Plan
              </>
            )}
          </Button>
        )}
      </div>

      {!recommendations ? (
        <div className="text-center py-12">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 inline-block mb-4">
            <Target className="h-12 w-12 text-purple-400" />
          </div>
          <p className="text-slate-400 mb-2">Complete at least one exam to get personalized recommendations</p>
          <p className="text-xs text-slate-500">AI will analyze your weak areas and create a targeted study plan</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-[#151d2e] border-[#2a3548] p-4">
              <div className="text-center">
                <Target className="h-5 w-5 text-blue-400 mx-auto mb-2" />
                <div className="text-lg font-bold text-white">
                  {recommendations.performanceData.weakAreas.length}
                </div>
                <div className="text-xs text-slate-500">Focus Areas</div>
              </div>
            </Card>
            <Card className="bg-[#151d2e] border-[#2a3548] p-4">
              <div className="text-center">
                <BookOpen className="h-5 w-5 text-emerald-400 mx-auto mb-2" />
                <div className="text-lg font-bold text-white">4 Weeks</div>
                <div className="text-xs text-slate-500">Study Plan</div>
              </div>
            </Card>
            <Card className="bg-[#151d2e] border-[#2a3548] p-4">
              <div className="text-center">
                <Zap className="h-5 w-5 text-amber-400 mx-auto mb-2" />
                <div className="text-lg font-bold text-white">
                  {Object.keys(recommendations.performanceData.frameworks).length}
                </div>
                <div className="text-xs text-slate-500">Frameworks</div>
              </div>
            </Card>
          </div>

          {/* Top Weak Areas */}
          <Card className="bg-[#151d2e] border-[#2a3548] p-5">
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-400" />
              Priority Study Areas
            </h4>
            <div className="space-y-2">
              {recommendations.performanceData.weakAreas.slice(0, 5).map((area, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-slate-300">{area.area}</span>
                      {area.criticalityLevel === 'high' && (
                        <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-xs">
                          High Priority
                        </Badge>
                      )}
                    </div>
                    <Progress value={(area.errorCount / Math.max(...recommendations.performanceData.weakAreas.map(a => a.errorCount))) * 100} className="h-1.5" />
                  </div>
                  <span className="text-xs text-slate-500 ml-3">{area.errorCount} errors</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Suggested Targeted Exam */}
          {recommendations.targetedExamConfig && (
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-white flex items-center gap-2">
                    <Zap className="h-4 w-4 text-purple-400" />
                    Recommended Practice Exam
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Targeted at your weak areas for maximum improvement
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => onStartTargetedExam && onStartTargetedExam(recommendations.targetedExamConfig)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Start Now
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                  {recommendations.targetedExamConfig.framework}
                </Badge>
                <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                  {recommendations.targetedExamConfig.difficulty}
                </Badge>
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                  {recommendations.targetedExamConfig.focusAreas.length} focus areas
                </Badge>
              </div>
            </Card>
          )}

          {/* Study Plan */}
          <Card className="bg-[#151d2e] border-[#2a3548] p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-white">Personalized Study Plan</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={generateRecommendations}
                disabled={generating}
                className="border-[#2a3548] hover:bg-[#2a3548] text-xs"
              >
                Regenerate
              </Button>
            </div>
            <ScrollArea className="h-[500px]">
              <ReactMarkdown 
                className="prose prose-sm prose-invert max-w-none text-slate-300 pr-4"
                components={{
                  h1: ({children}) => <h1 className="text-xl font-bold text-white mb-3 mt-5 first:mt-0 border-b border-[#2a3548] pb-2">{children}</h1>,
                  h2: ({children}) => <h2 className="text-lg font-semibold text-white mb-3 mt-4">{children}</h2>,
                  h3: ({children}) => <h3 className="text-base font-medium text-white mb-2 mt-3">{children}</h3>,
                  p: ({children}) => <p className="text-slate-300 mb-3 leading-relaxed text-sm">{children}</p>,
                  ul: ({children}) => <ul className="list-disc ml-5 mb-4 space-y-1.5">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal ml-5 mb-4 space-y-1.5">{children}</ol>,
                  li: ({children}) => <li className="text-slate-300 text-sm">{children}</li>,
                  strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                  blockquote: ({children}) => (
                    <blockquote className="border-l-4 border-purple-500 pl-4 my-4 text-slate-400 italic bg-purple-500/5 py-2 rounded-r">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {recommendations.studyPlan}
              </ReactMarkdown>
            </ScrollArea>
          </Card>
        </div>
      )}
    </Card>
  );
}