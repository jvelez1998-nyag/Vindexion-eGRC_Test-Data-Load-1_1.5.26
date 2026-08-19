import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, Target, TrendingUp, AlertCircle, Sparkles, 
  Award, BookOpen, CheckCircle2, ArrowRight, Loader2
} from "lucide-react";
import { toast } from "sonner";

export default function PersonalizedTrainingDashboard({ userEmail, progress = [] }) {
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userEmail && progress.length > 0) {
      generateRecommendations();
    }
  }, [userEmail, progress.length]);

  const modules = [
    { id: 'risk_management', name: 'Risk Management', icon: AlertCircle, color: 'rose' },
    { id: 'controls', name: 'Controls', icon: CheckCircle2, color: 'blue' },
    { id: 'compliance', name: 'Compliance', icon: Target, color: 'emerald' },
    { id: 'audits', name: 'Audits', icon: BookOpen, color: 'purple' },
    { id: 'incidents', name: 'Incidents', icon: AlertCircle, color: 'amber' },
    { id: 'vendors', name: 'Third-Party Risk', icon: Users, color: 'cyan' },
    { id: 'privacy', name: 'Privacy', icon: Shield, color: 'violet' },
    { id: 'reports', name: 'Reporting', icon: BarChart3, color: 'indigo' }
  ];

  const getModuleStats = (moduleId) => {
    const moduleProgress = progress.filter(p => p.module === moduleId);
    const completed = moduleProgress.filter(p => p.status === 'completed' || p.status === 'mastered').length;
    const avgScore = moduleProgress.length > 0 
      ? Math.round(moduleProgress.reduce((sum, p) => sum + (p.score || 0), 0) / moduleProgress.filter(p => p.score).length)
      : 0;
    return { total: moduleProgress.length, completed, avgScore };
  };

  const overallProgress = progress.length > 0 
    ? Math.round((progress.filter(p => p.status === 'completed' || p.status === 'mastered').length / progress.length) * 100)
    : 0;

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      const stats = modules.map(m => {
        const moduleStats = getModuleStats(m.id);
        return {
          module: m.name,
          completed: moduleStats.completed,
          total: moduleStats.total,
          avgScore: moduleStats.avgScore
        };
      });

      const weakAreas = progress
        .flatMap(p => p.weak_areas || [])
        .reduce((acc, area) => {
          acc[area] = (acc[area] || 0) + 1;
          return acc;
        }, {});

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `As an AI learning advisor, analyze this user's GRC training progress and provide personalized recommendations.

PROGRESS SUMMARY:
${JSON.stringify(stats, null, 2)}

IDENTIFIED WEAK AREAS:
${JSON.stringify(weakAreas, null, 2)}

OVERALL COMPLETION: ${overallProgress}%

Provide:
1. Top 3 recommended next lessons (with specific module and topic)
2. Areas needing immediate focus (based on low scores or weak areas)
3. Strengths to leverage (high-performing areas)
4. Personalized study plan for next 7 days
5. Motivational insight based on progress`,
        response_json_schema: {
          type: "object",
          properties: {
            recommended_lessons: { 
              type: "array", 
              items: { 
                type: "object",
                properties: {
                  module: { type: "string" },
                  topic: { type: "string" },
                  reason: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            focus_areas: { type: "array", items: { type: "string" } },
            strengths: { type: "array", items: { type: "string" } },
            study_plan: { type: "array", items: { type: "string" } },
            motivation: { type: "string" }
          }
        }
      });

      setAiRecommendations(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const colorMap = {
    rose: 'from-rose-500/20 to-red-500/20 border-rose-500/30',
    blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    emerald: 'from-emerald-500/20 to-green-500/20 border-emerald-500/30',
    purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    amber: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30',
    cyan: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30',
    violet: 'from-violet-500/20 to-purple-500/20 border-violet-500/30',
    indigo: 'from-indigo-500/20 to-blue-500/20 border-indigo-500/30'
  };

  return (
    <div className="space-y-6">
      {/* AI Recommendations */}
      {aiRecommendations && (
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">AI Personalized Recommendations</h3>
              <p className="text-sm text-slate-300 italic mb-4">{aiRecommendations.motivation}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                  <h4 className="text-xs font-semibold text-indigo-400 mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Next Up
                  </h4>
                  <div className="space-y-2">
                    {aiRecommendations.recommended_lessons?.slice(0, 3).map((lesson, idx) => (
                      <div key={idx} className="text-xs">
                        <div className="text-white font-medium">{lesson.topic}</div>
                        <div className="text-slate-400">{lesson.module}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <h4 className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Focus Areas
                  </h4>
                  <ul className="space-y-1">
                    {aiRecommendations.focus_areas?.slice(0, 3).map((area, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-1">
                        <span className="text-amber-400">•</span>
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <h4 className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Your Strengths
                  </h4>
                  <ul className="space-y-1">
                    {aiRecommendations.strengths?.slice(0, 3).map((strength, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-1">
                        <span className="text-emerald-400">•</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Overall Progress */}
      <Card className="bg-[#1a2332] border-[#2a3548] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">Your Learning Journey</h3>
            <p className="text-sm text-slate-400">Track your progress across all modules</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-indigo-400">{overallProgress}%</div>
            <div className="text-xs text-slate-400">Complete</div>
          </div>
        </div>
        <Progress value={overallProgress} className="h-3 mb-6" />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Lessons Completed" value={progress.filter(p => p.status === 'completed' || p.status === 'mastered').length} icon={CheckCircle2} color="emerald" />
          <StatCard label="Avg Quiz Score" value={`${Math.round(progress.reduce((sum, p) => sum + (p.score || 0), 0) / progress.filter(p => p.score).length) || 0}%`} icon={Target} color="blue" />
          <StatCard label="Time Invested" value={`${Math.round(progress.reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0) / 60)}h`} icon={Clock} color="purple" />
          <StatCard label="Mastered Topics" value={progress.filter(p => p.status === 'mastered').length} icon={Award} color="amber" />
        </div>
      </Card>

      {/* Module Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {modules.map(module => {
          const stats = getModuleStats(module.id);
          const Icon = module.icon;
          
          return (
            <Card 
              key={module.id}
              className={`bg-gradient-to-br ${colorMap[module.color]} border hover:scale-105 transition-transform cursor-pointer`}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <Icon className={`h-6 w-6 text-${module.color}-400`} />
                  <Badge className="bg-white/10 text-white text-[10px]">
                    {stats.completed}/{stats.total}
                  </Badge>
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">{module.name}</h4>
                {stats.avgScore > 0 && (
                  <div className="text-xs text-slate-400">Avg: {stats.avgScore}%</div>
                )}
                <Progress value={stats.total > 0 ? (stats.completed / stats.total) * 100 : 0} className="h-2 mt-3" />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  const colorMap = {
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    amber: 'text-amber-400'
  };

  return (
    <div className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
      <Icon className={`h-5 w-5 ${colorMap[color]} mb-2`} />
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  );
}