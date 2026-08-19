import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calendar, Award, TrendingUp, TrendingDown, Target, Brain, 
  Zap, BarChart3, BookOpen, Sparkles, Clock, CheckCircle2, 
  AlertCircle, ArrowRight, Play, FileText, GitBranch, ClipboardCheck,
  Gauge, Activity, Flame, Trophy
} from "lucide-react";
import { format, isBefore, isAfter, addDays, subMonths } from "date-fns";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import DrillDownModal from "@/components/ui/drill-down-modal";

export default function UnifiedExamDashboard({ exams = [], userProgress = [], onNavigate }) {
  const [drillDown, setDrillDown] = useState({ open: false, title: '', data: null, type: '' });
  // Calculate key metrics
  const scheduledExams = exams.filter(e => e.status === 'scheduled');
  const inPrepExams = exams.filter(e => e.status === 'in_preparation');
  const completedExams = exams.filter(e => e.status === 'completed');
  const inProgressExams = exams.filter(e => e.status === 'in_progress');
  
  const avgReadiness = exams.length > 0 && !isNaN(exams.reduce((sum, e) => sum + (e.readiness_score || 0), 0) / exams.length)
    ? Math.round(exams.reduce((sum, e) => sum + (e.readiness_score || 0), 0) / exams.length)
    : 0;
  
  const passedExams = completedExams.filter(e => (e.readiness_score || 0) >= 70).length;
  const passRate = completedExams.length > 0 && !isNaN(passedExams / completedExams.length)
    ? Math.round((passedExams / completedExams.length) * 100)
    : 0;

  // Upcoming exams (all future exams)
  const upcomingExams = exams
    .filter(e => e.exam_date && isAfter(new Date(e.exam_date), new Date()))
    .sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date));

  // Recent performance (last 6 months)
  const recentPerformance = (() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthExams = exams.filter(exam => {
        const examDate = exam.completion_date ? new Date(exam.completion_date) : exam.created_date ? new Date(exam.created_date) : null;
        return examDate && examDate >= monthStart && examDate <= monthEnd;
      });
      
      const monthCompleted = monthExams.filter(e => e.status === 'completed');
      
      data.push({
        month: format(date, 'MMM'),
        completed: monthCompleted.length,
        avgScore: monthCompleted.length > 0 ? Math.round(monthCompleted.reduce((sum, e) => sum + (e.readiness_score || 0), 0) / monthCompleted.length) : 0
      });
    }
    return data;
  })();

  // Study activity (questions answered)
  const totalQuestions = userProgress.length;
  const correctAnswers = userProgress.filter(p => p.correct).length;
  const overallAccuracy = totalQuestions > 0 && !isNaN(correctAnswers / totalQuestions) ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  // Calculate streak
  const currentStreak = (() => {
    const sortedProgress = [...userProgress]
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    
    let streak = 0;
    for (const p of sortedProgress) {
      if (p.correct) streak++;
      else break;
    }
    return streak;
  })();

  // Risk areas
  const categoryPerformance = {};
  userProgress.forEach(p => {
    if (!categoryPerformance[p.category]) {
      categoryPerformance[p.category] = { correct: 0, total: 0 };
    }
    categoryPerformance[p.category].total++;
    if (p.correct) categoryPerformance[p.category].correct++;
  });
  
  const weakAreas = Object.entries(categoryPerformance)
    .map(([category, stats]) => ({
      category,
      accuracy: stats.total > 0 && !isNaN(stats.correct / stats.total) ? Math.round((stats.correct / stats.total) * 100) : 0,
      total: stats.total
    }))
    .filter(c => c.accuracy < 70 && c.total >= 3)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);

  // Recent trend
  const recentTrend = (() => {
    const recent = userProgress.slice(-10);
    const recentCorrect = recent.filter(p => p.correct).length;
    const recentAccuracy = recent.length > 0 ? (recentCorrect / recent.length) * 100 : 0;
    const previousRecent = userProgress.slice(-20, -10);
    const previousCorrect = previousRecent.filter(p => p.correct).length;
    const previousAccuracy = previousRecent.length > 0 ? (previousCorrect / previousRecent.length) * 100 : 0;
    return recentAccuracy - previousAccuracy;
  })();

  const quickActions = [
    { label: "Start Simulation", icon: Zap, color: "from-orange-500 to-red-500", tab: "simulation" },
    { label: "Build Exam", icon: Sparkles, color: "from-violet-500 to-purple-500", tab: "builder" },
    { label: "View Analytics", icon: BarChart3, color: "from-blue-500 to-cyan-500", tab: "analytics" },
    { label: "Study Plan", icon: Calendar, color: "from-emerald-500 to-green-500", tab: "studyplan" },
    { label: "Knowledge Center", icon: BookOpen, color: "from-amber-500 to-orange-500", tab: "knowledge" },
    { label: "Deep Dive", icon: Target, color: "from-pink-500 to-rose-500", tab: "deepdive" }
  ];

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <Card className="bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-purple-500/20 border-indigo-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to Exam Central</h2>
              <p className="text-slate-300 text-sm">
                Your comprehensive regulatory exam preparation platform
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30">
              <Brain className="h-8 w-8 text-indigo-300" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#0f1623]/50 rounded-lg p-3 border border-indigo-500/20 cursor-pointer hover:bg-[#151d2e] transition-colors" onClick={() => setDrillDown({ open: true, title: 'All Exams', data: exams, type: 'exam' })}>
              <div className="text-3xl font-bold text-white mb-1">{exams.length}</div>
              <div className="text-xs text-slate-400">Total Exams</div>
            </div>
            <div className="bg-[#0f1623]/50 rounded-lg p-3 border border-emerald-500/20 cursor-pointer hover:bg-[#151d2e] transition-colors" onClick={() => setDrillDown({ open: true, title: 'Completed Exams', data: completedExams, type: 'exam' })}>
              <div className="text-3xl font-bold text-emerald-400 mb-1">{completedExams.length}</div>
              <div className="text-xs text-slate-400">Completed</div>
            </div>
            <div className="bg-[#0f1623]/50 rounded-lg p-3 border border-amber-500/20 cursor-pointer hover:bg-[#151d2e] transition-colors" onClick={() => setDrillDown({ open: true, title: 'Scheduled Exams', data: scheduledExams, type: 'exam' })}>
              <div className="text-3xl font-bold text-amber-400 mb-1">{avgReadiness}%</div>
              <div className="text-xs text-slate-400">Avg Readiness</div>
            </div>
            <div className="bg-[#0f1623]/50 rounded-lg p-3 border border-violet-500/20 cursor-pointer hover:bg-[#151d2e] transition-colors" onClick={() => setDrillDown({ open: true, title: 'In Preparation', data: inPrepExams, type: 'exam' })}>
              <div className="text-3xl font-bold text-violet-400 mb-1">{overallAccuracy}%</div>
              <div className="text-xs text-slate-400">Accuracy</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Calendar className="h-5 w-5 text-blue-400" />
              </div>
              <Badge className="bg-blue-500/20 text-blue-400 text-xs">All Upcoming</Badge>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{upcomingExams.length}</div>
            <div className="text-sm text-slate-400 mb-2">Upcoming Exams</div>
            {upcomingExams.length > 0 && (
              <div className="text-xs text-blue-400">
                Next: {format(new Date(upcomingExams[0].exam_date), 'MMM d')}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Trophy className="h-5 w-5 text-emerald-400" />
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">Success Rate</Badge>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{passRate}%</div>
            <div className="text-sm text-slate-400 mb-2">Pass Rate</div>
            <div className="text-xs text-emerald-400">
              {passedExams} of {completedExams.length} passed
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Activity className="h-5 w-5 text-amber-400" />
              </div>
              <Badge className={`text-xs ${recentTrend >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {recentTrend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              </Badge>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{totalQuestions}</div>
            <div className="text-sm text-slate-400 mb-2">Questions Practiced</div>
            <div className={`text-xs ${recentTrend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {recentTrend >= 0 ? '+' : ''}{recentTrend.toFixed(1)}% recent trend
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-violet-500/20">
                <Flame className="h-5 w-5 text-orange-400" />
              </div>
              <Badge className="bg-orange-500/20 text-orange-400 text-xs">Current</Badge>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{currentStreak}</div>
            <div className="text-sm text-slate-400 mb-2">Correct Streak</div>
            <div className="text-xs text-violet-400">
              {currentStreak >= 5 ? '🔥 On fire!' : 'Keep going!'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming Exams */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-400" />
                Upcoming Exams
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onNavigate?.('schedule')}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingExams.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No upcoming exams scheduled</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingExams.map(exam => (
                  <div key={exam.id} className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548] hover:border-blue-500/40 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate">{exam.exam_title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="text-[9px] h-4 px-1.5 bg-blue-500/10 text-blue-400 border-blue-500/20">
                            {exam.exam_type}
                          </Badge>
                          <span className="text-[10px] text-slate-500">
                            {format(new Date(exam.exam_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                      {exam.readiness_score && (
                        <Badge className={`text-[10px] ${
                          exam.readiness_score >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                          exam.readiness_score >= 60 ? 'bg-amber-500/20 text-amber-400' :
                          'bg-rose-500/20 text-rose-400'
                        }`}>
                          {exam.readiness_score}%
                        </Badge>
                      )}
                    </div>
                    <Progress value={exam.readiness_score || 0} className="h-1.5" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Trend */}
        <Card className="bg-gradient-to-br from-emerald-900/30 via-green-900/30 to-teal-900/30 border-emerald-500/30 backdrop-blur">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between mb-3">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                </div>
                6-Month Performance Trend
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onNavigate?.('analytics')}
                className="text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
              >
                View Analytics <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>

            {/* Performance Summary Metrics */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-[10px] text-emerald-400 mb-0.5 uppercase tracking-wider">Best Month</div>
                <div className="text-lg font-bold text-white">
                  {recentPerformance.length > 0 ? Math.max(...recentPerformance.map(d => d.avgScore)) : 0}%
                </div>
                <div className="text-[9px] text-slate-400">
                  {recentPerformance.length > 0 ? recentPerformance.find(d => d.avgScore === Math.max(...recentPerformance.map(m => m.avgScore)))?.month : '-'}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="text-[10px] text-blue-400 mb-0.5 uppercase tracking-wider">Avg Score</div>
                <div className="text-lg font-bold text-white">
                  {recentPerformance.length > 0 ? Math.round(recentPerformance.reduce((sum, d) => sum + d.avgScore, 0) / recentPerformance.length) : 0}%
                </div>
                <div className="text-[9px] text-slate-400">6-month avg</div>
              </div>
              <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <div className="text-[10px] text-violet-400 mb-0.5 uppercase tracking-wider">Trend</div>
                <div className="text-lg font-bold text-white flex items-center gap-1">
                  {recentPerformance.length >= 2 && recentPerformance[recentPerformance.length - 1].avgScore >= recentPerformance[0].avgScore ? (
                    <>
                      <TrendingUp className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400">Up</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3 w-3 text-rose-400" />
                      <span className="text-rose-400">Down</span>
                    </>
                  )}
                </div>
                <div className="text-[9px] text-slate-400">
                  {recentPerformance.length >= 2 ? `${Math.abs(recentPerformance[recentPerformance.length - 1].avgScore - recentPerformance[0].avgScore).toFixed(0)}pts` : '-'}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={recentPerformance}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  stroke="#94a3b8" 
                  tick={{ fill: '#94a3b8', fontSize: 10 }} 
                  axisLine={{ stroke: '#2a3548' }}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  tick={{ fill: '#94a3b8', fontSize: 10 }} 
                  domain={[0, 100]} 
                  axisLine={{ stroke: '#2a3548' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a2332', 
                    border: '1px solid #10b981', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                  }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="avgScore" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#scoreGrad)" 
                  name="Avg Score"
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Strengths & Weaknesses */}
        <Card className="bg-gradient-to-br from-slate-800/50 via-slate-900/50 to-slate-800/50 border-slate-700/50 backdrop-blur">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Target className="h-4 w-4 text-violet-400" />
                Strengths & Weaknesses
              </CardTitle>
              <Badge variant="outline" className="text-[10px] border-slate-600 text-slate-400">
                Performance Analysis
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Strengths Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Top Strengths</span>
              </div>
              {Object.entries(categoryPerformance)
                .map(([category, stats]) => ({
                  category,
                  accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
                  total: stats.total
                }))
                .filter(c => c.accuracy >= 70 && c.total >= 3)
                .sort((a, b) => b.accuracy - a.accuracy)
                .slice(0, 3)
                .length > 0 ? (
                Object.entries(categoryPerformance)
                  .map(([category, stats]) => ({
                    category,
                    accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
                    total: stats.total
                  }))
                  .filter(c => c.accuracy >= 70 && c.total >= 3)
                  .sort((a, b) => b.accuracy - a.accuracy)
                  .slice(0, 3)
                  .map((area, idx) => (
                    <div key={idx} className="group p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/15 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white font-medium flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          {area.category}
                        </span>
                        <Badge className="bg-emerald-500/30 text-emerald-300 text-xs border-emerald-500/40">
                          {area.accuracy}%
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <Progress value={area.accuracy} className="h-2 bg-slate-800/50" />
                        <div className="flex items-center justify-between text-[10px] text-emerald-400/70">
                          <span>{area.total} questions</span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Strong
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-4 text-slate-500 text-xs">
                  <div className="p-2 rounded-lg bg-slate-800/50 inline-block mb-1">
                    <Target className="h-5 w-5 opacity-30" />
                  </div>
                  <p>Complete more questions to identify strengths</p>
                </div>
              )}
            </div>

            {/* Weaknesses Section */}
            <div className="space-y-2 pt-3 border-t border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Focus Areas</span>
              </div>
              {weakAreas.length === 0 ? (
                <div className="text-center py-4 text-slate-500 text-xs">
                  <div className="p-2 rounded-lg bg-slate-800/50 inline-block mb-1">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 opacity-50" />
                  </div>
                  <p className="text-emerald-400">No weak areas detected - great job!</p>
                </div>
              ) : (
                weakAreas.map((area, idx) => (
                  <div key={idx} className="group p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/15 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white font-medium flex items-center gap-2">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                        {area.category}
                      </span>
                      <Badge className="bg-rose-500/30 text-rose-300 text-xs border-rose-500/40">
                        {area.accuracy}%
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <Progress value={area.accuracy} className="h-2 bg-slate-800/50" />
                      <div className="flex items-center justify-between text-[10px] text-amber-400/70">
                        <span>{area.total} questions</span>
                        <span className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Needs Practice
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance vs Benchmarks */}
        <Card className="bg-gradient-to-br from-indigo-900/30 via-violet-900/30 to-purple-900/30 border-indigo-500/30 backdrop-blur">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-indigo-400" />
                Performance vs Benchmarks
              </CardTitle>
              <Badge variant="outline" className="text-[10px] border-indigo-500/30 text-indigo-400">
                Comparative
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overall Performance Card */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Your Performance</span>
                <Trophy className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-white">{overallAccuracy}%</span>
                <span className="text-sm text-slate-400">accuracy</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${
                  recentTrend >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {recentTrend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span>{Math.abs(recentTrend).toFixed(1)}%</span>
                </div>
                <span className="text-slate-500">vs last 10 questions</span>
              </div>
            </div>

            {/* Benchmark Comparison */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">Industry Standards</span>
              </div>

              {/* Pass Rate Benchmark */}
              <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-300">Pass Rate</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] border-violet-500/30 text-violet-400">
                      Target: 70%
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Progress value={passRate} className="h-2.5 bg-slate-800/50" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{passRate}%</span>
                    <span className={`text-xs flex items-center gap-1 ${
                      passRate >= 70 ? 'text-emerald-400' : passRate >= 50 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {passRate >= 70 ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          Above Target
                        </>
                      ) : passRate >= 50 ? (
                        <>
                          <Clock className="h-3 w-3" />
                          Near Target
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3" />
                          Below Target
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Readiness Benchmark */}
              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-300">Avg Readiness</span>
                  <Badge variant="outline" className="text-[10px] border-indigo-500/30 text-indigo-400">
                    Target: 80%
                  </Badge>
                </div>
                <div className="space-y-1.5">
                  <Progress value={avgReadiness} className="h-2.5 bg-slate-800/50" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{avgReadiness}%</span>
                    <span className={`text-xs flex items-center gap-1 ${
                      avgReadiness >= 80 ? 'text-emerald-400' : avgReadiness >= 60 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {avgReadiness >= 80 ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          Excellent
                        </>
                      ) : avgReadiness >= 60 ? (
                        <>
                          <Clock className="h-3 w-3" />
                          Good Progress
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3" />
                          More Prep Needed
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Study Volume Benchmark */}
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-300">Questions Completed</span>
                  <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-400">
                    Recommended: 500+
                  </Badge>
                </div>
                <div className="space-y-1.5">
                  <Progress value={Math.min((totalQuestions / 500) * 100, 100)} className="h-2.5 bg-slate-800/50" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{totalQuestions}</span>
                    <span className={`text-xs flex items-center gap-1 ${
                      totalQuestions >= 500 ? 'text-emerald-400' : totalQuestions >= 250 ? 'text-amber-400' : 'text-blue-400'
                    }`}>
                      {totalQuestions >= 500 ? (
                        <>
                          <Trophy className="h-3 w-3" />
                          Well Prepared
                        </>
                      ) : totalQuestions >= 250 ? (
                        <>
                          <Activity className="h-3 w-3" />
                          On Track
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3" />
                          Keep Going
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map((action, idx) => (
              <Button
                key={idx}
                onClick={() => onNavigate?.(action.tab)}
                className="h-auto flex-col gap-2 p-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color} bg-opacity-20`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs text-white">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <DrillDownModal 
        open={drillDown.open}
        onClose={() => setDrillDown({ open: false, title: '', data: null, type: '' })}
        title={drillDown.title}
        data={drillDown.data}
        type={drillDown.type}
      />
    </div>
  );
}