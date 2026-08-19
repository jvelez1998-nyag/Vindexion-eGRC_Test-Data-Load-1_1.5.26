import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";
import { 
  TrendingUp, Target, Award, Clock, Brain, 
  CheckCircle2, AlertTriangle, Zap
} from "lucide-react";

export default function TrainingAnalytics({ userEmail, progress = [] }) {
  const modules = ['risk_management', 'controls', 'compliance', 'audits', 'incidents', 'vendors', 'privacy', 'reports'];

  const getModuleStats = (moduleId) => {
    const moduleProgress = progress.filter(p => p.module === moduleId);
    const completed = moduleProgress.filter(p => p.status === 'completed' || p.status === 'mastered').length;
    const avgScore = moduleProgress.length > 0 
      ? Math.round(moduleProgress.reduce((sum, p) => sum + (p.score || 0), 0) / moduleProgress.filter(p => p.score).length)
      : 0;
    return { total: moduleProgress.length, completed, avgScore };
  };

  const radarData = modules.map(m => {
    const stats = getModuleStats(m);
    return {
      module: m.replace(/_/g, ' ').slice(0, 10),
      score: stats.avgScore
    };
  });

  const scoreDistribution = progress
    .filter(p => p.score)
    .reduce((acc, p) => {
      const range = p.score >= 90 ? '90-100' : p.score >= 80 ? '80-89' : p.score >= 70 ? '70-79' : p.score >= 60 ? '60-69' : 'Below 60';
      acc[range] = (acc[range] || 0) + 1;
      return acc;
    }, {});

  const scoreData = Object.entries(scoreDistribution).map(([range, count]) => ({ range, count }));

  const progressOverTime = progress
    .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
    .slice(-20)
    .map((p, idx) => ({
      lesson: idx + 1,
      score: p.score || 0
    }));

  const totalTime = Math.round(progress.reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0) / 60);
  const avgScore = Math.round(progress.reduce((sum, p) => sum + (p.score || 0), 0) / progress.filter(p => p.score).length) || 0;
  const masteredTopics = progress.filter(p => p.status === 'mastered').length;
  const completionRate = progress.length > 0 ? Math.round((progress.filter(p => p.status === 'completed' || p.status === 'mastered').length / progress.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/30">
          <CardContent className="p-5 text-center">
            <Target className="h-8 w-8 text-indigo-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white mb-1">{avgScore}%</div>
            <div className="text-xs text-slate-400">Average Score</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 border-emerald-500/30">
          <CardContent className="p-5 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white mb-1">{completionRate}%</div>
            <div className="text-xs text-slate-400">Completion Rate</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/30">
          <CardContent className="p-5 text-center">
            <Award className="h-8 w-8 text-amber-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white mb-1">{masteredTopics}</div>
            <div className="text-xs text-slate-400">Mastered Topics</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30">
          <CardContent className="p-5 text-center">
            <Clock className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white mb-1">{totalTime}h</div>
            <div className="text-xs text-slate-400">Time Invested</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base">Performance by Module</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#2a3548" />
                <PolarAngleAxis dataKey="module" stroke="#64748b" fontSize={11} />
                <PolarRadiusAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
                <Tooltip contentStyle={{ backgroundColor: '#0f1623', border: '1px solid #2a3548' }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base">Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis dataKey="range" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f1623', border: '1px solid #2a3548' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548] lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Progress Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis dataKey="lesson" stroke="#64748b" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f1623', border: '1px solid #2a3548' }} />
                <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}