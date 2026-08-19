import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, CheckCircle2, Circle, Lock, TrendingUp, 
  Brain, Sparkles, Clock, Award, Loader2
} from "lucide-react";
import { toast } from "sonner";

export default function LearningPath({ userEmail, progress = [] }) {
  const [aiPath, setAiPath] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userEmail) {
      generatePersonalizedPath();
    }
  }, [userEmail]);

  const generatePersonalizedPath = async () => {
    setLoading(true);
    try {
      const moduleStats = ['risk_management', 'controls', 'compliance', 'audits'].map(module => {
        const moduleProgress = progress.filter(p => p.module === module);
        const avgScore = moduleProgress.length > 0 
          ? Math.round(moduleProgress.reduce((sum, p) => sum + (p.score || 0), 0) / moduleProgress.filter(p => p.score).length)
          : 0;
        return {
          module,
          lessonsCompleted: moduleProgress.filter(p => p.status === 'completed' || p.status === 'mastered').length,
          avgScore,
          weakAreas: moduleProgress.flatMap(p => p.weak_areas || [])
        };
      });

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a personalized 4-week learning path for a GRC professional based on their progress.

CURRENT PERFORMANCE:
${JSON.stringify(moduleStats, null, 2)}

Generate a structured learning path with:
- Weekly milestones (4 weeks)
- Each week has 3-5 lessons/activities
- Prioritize weak areas
- Progressive difficulty
- Mix of theory and practice
- Expected outcomes`,
        response_json_schema: {
          type: "object",
          properties: {
            path_title: { type: "string" },
            total_duration: { type: "string" },
            weeks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  week_number: { type: "number" },
                  theme: { type: "string" },
                  lessons: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        module: { type: "string" },
                        duration: { type: "string" },
                        description: { type: "string" },
                        difficulty: { type: "string" }
                      }
                    }
                  },
                  milestone: { type: "string" }
                }
              }
            }
          }
        }
      });

      setAiPath(result);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate learning path");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-[#1a2332] border-[#2a3548] p-12 text-center">
        <Loader2 className="h-16 w-16 text-indigo-400 mx-auto mb-4 animate-spin" />
        <p className="text-slate-400">Generating your personalized learning path...</p>
      </Card>
    );
  }

  if (!aiPath) return null;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20 p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
            <Target className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">{aiPath.path_title}</h2>
            <p className="text-slate-400 text-sm mt-1">
              AI-personalized learning journey • {aiPath.total_duration}
            </p>
          </div>
          <Button 
            onClick={generatePersonalizedPath}
            variant="outline"
            className="gap-2 border-purple-500/30 text-purple-400"
          >
            <Sparkles className="h-4 w-4" />
            Regenerate
          </Button>
        </div>
      </Card>

      {/* Weekly Milestones */}
      <div className="space-y-4">
        {aiPath.weeks?.map((week, idx) => {
          const weekProgress = progress.filter(p => 
            week.lessons.some(l => l.title.toLowerCase().includes(p.lesson_title?.toLowerCase() || ''))
          );
          const weekCompletion = week.lessons.length > 0 
            ? Math.round((weekProgress.filter(p => p.status === 'completed' || p.status === 'mastered').length / week.lessons.length) * 100)
            : 0;

          return (
            <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 mb-2">
                      Week {week.week_number}
                    </Badge>
                    <CardTitle className="text-lg text-white">{week.theme}</CardTitle>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-400">{weekCompletion}%</div>
                    <div className="text-xs text-slate-400">Complete</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Progress value={weekCompletion} className="h-2" />
                
                <div className="space-y-2">
                  {week.lessons.map((lesson, lidx) => {
                    const isCompleted = weekProgress.some(p => 
                      p.lesson_title?.toLowerCase().includes(lesson.title.toLowerCase()) && 
                      (p.status === 'completed' || p.status === 'mastered')
                    );

                    return (
                      <div 
                        key={lidx}
                        className={`p-4 rounded-lg border ${
                          isCompleted 
                            ? 'bg-emerald-500/10 border-emerald-500/30' 
                            : 'bg-[#151d2e] border-[#2a3548]'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5" />
                          ) : (
                            <Circle className="h-5 w-5 text-slate-600 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-white">{lesson.title}</span>
                              <Badge className={`text-[10px] ${
                                lesson.difficulty === 'Beginner' ? 'bg-blue-500/20 text-blue-400' :
                                lesson.difficulty === 'Intermediate' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-rose-500/20 text-rose-400'
                              }`}>
                                {lesson.difficulty}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-400 mb-2">{lesson.description}</p>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span>{lesson.module}</span>
                              <span>•</span>
                              <span>{lesson.duration}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Card className="bg-indigo-500/10 border-indigo-500/20 p-3 mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-indigo-400" />
                    <span className="text-white font-medium">Milestone:</span>
                    <span className="text-slate-300">{week.milestone}</span>
                  </div>
                </Card>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}