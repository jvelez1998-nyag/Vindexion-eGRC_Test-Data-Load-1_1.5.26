import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell
} from "recharts";
import { TrendingUp, Target, Award, Zap, BarChart3, Activity } from "lucide-react";

export default function PerformanceVisualization({ exams = [], userProgress = [] }) {
  const [timeRange, setTimeRange] = useState("30");

  // Performance metrics
  const completedExams = exams.filter(e => e.status === 'completed');
  const avgScore = completedExams.length > 0
    ? Math.round(completedExams.reduce((sum, e) => sum + (e.readiness_score || 0), 0) / completedExams.length)
    : 0;

  // Category performance
  const categoryPerf = {};
  userProgress.forEach(p => {
    if (!categoryPerf[p.category]) {
      categoryPerf[p.category] = { correct: 0, total: 0 };
    }
    categoryPerf[p.category].total++;
    if (p.correct) categoryPerf[p.category].correct++;
  });

  const radarData = Object.entries(categoryPerf).slice(0, 6).map(([cat, stats]) => ({
    category: cat.length > 15 ? cat.substring(0, 15) + '...' : cat,
    score: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    benchmark: 75
  }));

  // Timeline data
  const timelineData = completedExams
    .sort((a, b) => new Date(a.completion_date || a.created_date) - new Date(b.completion_date || b.created_date))
    .map(e => ({
      date: new Date(e.completion_date || e.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: e.readiness_score || 0,
      passed: (e.readiness_score || 0) >= 70
    }));

  // Score distribution
  const scoreDistribution = [
    { range: '0-50', count: completedExams.filter(e => (e.readiness_score || 0) < 50).length },
    { range: '50-60', count: completedExams.filter(e => (e.readiness_score || 0) >= 50 && (e.readiness_score || 0) < 60).length },
    { range: '60-70', count: completedExams.filter(e => (e.readiness_score || 0) >= 60 && (e.readiness_score || 0) < 70).length },
    { range: '70-80', count: completedExams.filter(e => (e.readiness_score || 0) >= 70 && (e.readiness_score || 0) < 80).length },
    { range: '80-90', count: completedExams.filter(e => (e.readiness_score || 0) >= 80 && (e.readiness_score || 0) < 90).length },
    { range: '90-100', count: completedExams.filter(e => (e.readiness_score || 0) >= 90).length }
  ];

  // Difficulty breakdown
  const difficultyData = {};
  userProgress.forEach(p => {
    const diff = p.difficulty || 'intermediate';
    if (!difficultyData[diff]) {
      difficultyData[diff] = { correct: 0, total: 0 };
    }
    difficultyData[diff].total++;
    if (p.correct) difficultyData[diff].correct++;
  });

  const difficultyChart = Object.entries(difficultyData).map(([diff, stats]) => ({
    difficulty: diff.charAt(0).toUpperCase() + diff.slice(1),
    accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
  }));

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a2332] border border-[#2a3548] rounded-lg p-3 shadow-xl">
          <p className="text-xs text-white font-semibold mb-1">{label}</p>
          {payload.map((entry, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-400">{entry.name}:</span>
              <span className="text-white font-semibold">{entry.value}{entry.unit || '%'}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-indigo-400" />
              <span className="text-xs text-slate-400">Avg Score</span>
            </div>
            <div className="text-3xl font-bold text-white">{avgScore}%</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-slate-400">Completed</span>
            </div>
            <div className="text-3xl font-bold text-white">{completedExams.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-amber-400" />
              <span className="text-xs text-slate-400">Questions</span>
            </div>
            <div className="text-3xl font-bold text-white">{userProgress.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-violet-400" />
              <span className="text-xs text-slate-400">Accuracy</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {userProgress.length > 0 ? Math.round((userProgress.filter(p => p.correct).length / userProgress.length) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-[#1a2332] border border-[#2a3548]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="difficulty">By Difficulty</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-400" />
                  Performance Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                {timelineData.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-slate-500 text-sm">
                    No exam data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={timelineData}>
                      <defs>
                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                      <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[0, 100]} />
                      <Tooltip content={CustomTooltip} />
                      <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#scoreGradient)" name="Score" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4 text-emerald-400" />
                  Category Mastery Radar
                </CardTitle>
              </CardHeader>
              <CardContent>
                {radarData.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-slate-500 text-sm">
                    No category data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#2a3548" />
                      <PolarAngleAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                      <Radar name="Your Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
                      <Radar name="Benchmark" dataKey="benchmark" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} strokeDasharray="5 5" />
                      <Tooltip content={CustomTooltip} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-sm">Category Performance Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {radarData.length === 0 ? (
                <div className="h-[400px] flex items-center justify-center text-slate-500 text-sm">
                  No category data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={radarData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                    <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[0, 100]} />
                    <YAxis dataKey="category" type="category" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} width={120} />
                    <Tooltip content={CustomTooltip} />
                    <Bar dataKey="score" fill="#6366f1" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="difficulty">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-sm">Performance by Difficulty Level</CardTitle>
            </CardHeader>
            <CardContent>
              {difficultyChart.length === 0 ? (
                <div className="h-[400px] flex items-center justify-center text-slate-500 text-sm">
                  No difficulty data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={difficultyChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                    <XAxis dataKey="difficulty" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} />
                    <Tooltip content={CustomTooltip} />
                    <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                      {difficultyChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-sm">Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {scoreDistribution.every(d => d.count === 0) ? (
                <div className="h-[400px] flex items-center justify-center text-slate-500 text-sm">
                  No score data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                    <XAxis dataKey="range" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip content={CustomTooltip} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} unit=" exams" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}