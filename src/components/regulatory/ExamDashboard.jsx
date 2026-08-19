import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, Award, Target, Clock, Brain, 
  Zap, CheckCircle2, AlertCircle, Play, Trash2, Calendar, Plus, Gauge, BarChart3, FileCheck, Activity, Shield
} from "lucide-react";
import { format, subDays, subMonths } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { useState } from "react";

export default function ExamDashboard({ exams, userEmail }) {
  const [timeRange, setTimeRange] = useState(30);
  const queryClient = useQueryClient();

  const deleteExamMutation = useMutation({
    mutationFn: (id) => base44.entities.RegulatoryExam.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regulatory-exams'] });
      toast.success("Exam deleted");
    },
  });

  // Enhanced Analytics
  const scheduledExams = exams.filter(e => e.status === 'scheduled');
  const inPrepExams = exams.filter(e => e.status === 'in_preparation');
  const inProgressExams = exams.filter(e => e.status === 'in_progress');
  const completedExams = exams.filter(e => e.status === 'completed');
  const passedExams = exams.filter(e => e.status === 'completed' && (e.readiness_score || 0) >= 70).length;
  
  const avgReadiness = exams.length > 0 
    ? Math.round(exams.reduce((sum, e) => sum + (e.readiness_score || 0), 0) / exams.length)
    : 0;

  const highReadiness = exams.filter(e => (e.readiness_score || 0) >= 80).length;
  const lowReadiness = exams.filter(e => (e.readiness_score || 0) < 60 && e.status !== 'completed').length;

  const upcomingExams = exams
    .filter(e => e.exam_date && new Date(e.exam_date) > new Date())
    .sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date))
    .slice(0, 3);

  // Exam type distribution
  const examTypeData = Object.entries(
    exams.reduce((acc, e) => {
      acc[e.exam_type] = (acc[e.exam_type] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Status distribution
  const statusData = [
    { name: 'Scheduled', value: scheduledExams.length, color: '#6366f1' },
    { name: 'Preparing', value: inPrepExams.length, color: '#f59e0b' },
    { name: 'In Progress', value: inProgressExams.length, color: '#3b82f6' },
    { name: 'Completed', value: completedExams.length, color: '#10b981' }
  ].filter(d => d.value > 0);

  const getReadinessColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  // Trend data
  const generateTrendData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = timeRange - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const dateStr = format(date, 'MMM d');
      
      const dayExams = exams.filter(exam => {
        const examDate = new Date(exam.created_date);
        return format(examDate, 'MMM d') === dateStr;
      });
      
      const total = dayExams.length;
      const prep = dayExams.filter(e => e.status === 'in_preparation').length;
      const completed = dayExams.filter(e => e.status === 'completed').length;
      
      data.push({ date: dateStr, total, prep, completed });
    }
    
    return data;
  };

  const trendData = generateTrendData();

  // Monthly comparison
  const monthlyData = (() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthExams = exams.filter(exam => {
        const examDate = new Date(exam.created_date);
        return examDate >= monthStart && examDate <= monthEnd;
      });
      
      data.push({
        month: format(date, 'MMM'),
        total: monthExams.length,
        completed: monthExams.filter(e => e.status === 'completed').length,
        avgReadiness: monthExams.length > 0 ? Math.round(monthExams.reduce((sum, e) => sum + (e.readiness_score || 0), 0) / monthExams.length) : 0
      });
    }
    return data;
  })();

  // Exam preparation maturity radar
  const maturityData = [
    { 
      subject: 'Readiness', 
      score: avgReadiness
    },
    { 
      subject: 'Planning', 
      score: exams.filter(e => e.workflow_stage).length > 0 ? (exams.filter(e => e.workflow_stage).length / exams.length) * 100 : 0
    },
    { 
      subject: 'Completion', 
      score: exams.length > 0 ? (completedExams.length / exams.length) * 100 : 0
    },
    { 
      subject: 'Performance', 
      score: completedExams.length > 0 ? (passedExams / completedExams.length) * 100 : 0
    },
    { 
      subject: 'Schedule', 
      score: exams.filter(e => e.exam_date).length > 0 ? (exams.filter(e => e.exam_date).length / exams.length) * 100 : 0
    }
  ];

  return (
    <div className="space-y-5">
      {/* AI-Powered Header */}
      <Card className="bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-indigo-500/10 border-violet-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30">
                <Brain className="h-6 w-6 text-violet-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Regulatory Exam Intelligence
                  <Badge className="bg-violet-500/20 text-violet-400 text-[10px] border-violet-500/30">AI-POWERED</Badge>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Real-time exam analytics and adaptive learning intelligence</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                <Activity className="h-3 w-3 mr-1" />
                Live
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20 hover:border-violet-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <Target className="h-4 w-4 text-violet-400" />
              </div>
              <div className="text-2xl font-bold text-white">{exams.length}</div>
            </div>
            <div className="text-xs text-slate-400">Total</div>
            <div className="text-[10px] text-violet-400 mt-0.5">Exams</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 hover:border-blue-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Clock className="h-4 w-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">{scheduledExams.length}</div>
            </div>
            <div className="text-xs text-slate-400">Scheduled</div>
            <div className="text-[10px] text-blue-400 mt-0.5">Upcoming</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 hover:border-amber-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Activity className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white">{inPrepExams.length}</div>
            </div>
            <div className="text-xs text-slate-400">Preparing</div>
            <div className="text-[10px] text-amber-400 mt-0.5">Active prep</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20 hover:border-cyan-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <Zap className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-white">{inProgressExams.length}</div>
            </div>
            <div className="text-xs text-slate-400">In Progress</div>
            <div className="text-[10px] text-cyan-400 mt-0.5">Active</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20 hover:border-emerald-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white">{completedExams.length}</div>
            </div>
            <div className="text-xs text-slate-400">Completed</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Finished</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 hover:border-green-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                <Award className="h-4 w-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white">{passedExams}</div>
            </div>
            <div className="text-xs text-slate-400">Passed</div>
            <div className="text-[10px] text-green-400 mt-0.5">Success</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border-indigo-500/20 hover:border-indigo-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <Gauge className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-white">{avgReadiness}%</div>
            </div>
            <div className="text-xs text-slate-400">Readiness</div>
            <div className="text-[10px] text-indigo-400 mt-0.5">Average</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20 hover:border-rose-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <AlertCircle className="h-4 w-4 text-rose-400" />
              </div>
              <div className="text-2xl font-bold text-white">{lowReadiness}</div>
            </div>
            <div className="text-xs text-slate-400">Low Ready</div>
            <div className="text-[10px] text-rose-400 mt-0.5">Needs prep</div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Exams Highlight */}
      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-400" />
              Upcoming Exams
            </CardTitle>
            <Badge className="bg-indigo-500/20 text-indigo-400 text-[10px]">
              {upcomingExams.length} scheduled
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {upcomingExams.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No upcoming exams</p>
              <p className="text-xs mt-1">Schedule your next exam</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingExams.map(exam => (
                <div key={exam.id} className="p-3 rounded-lg bg-gradient-to-br from-[#0f1623] to-[#151d2e] border border-[#2a3548] hover:border-indigo-500/40 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 mr-3">
                      <h4 className="text-sm font-semibold text-white truncate">{exam.exam_title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="text-[9px] h-4 px-1.5 bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                          {exam.exam_type}
                        </Badge>
                        {exam.exam_date && (
                          <span className="text-[10px] text-slate-500">
                            <Calendar className="h-2.5 w-2.5 inline mr-1" />
                            {format(new Date(exam.exam_date), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge className={`text-[10px] flex-shrink-0 ${
                      (exam.readiness_score || 0) >= 80 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      (exam.readiness_score || 0) >= 60 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                      'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    }`}>
                      {exam.readiness_score || 0}%
                    </Badge>
                  </div>
                  <Progress value={exam.readiness_score || 0} className="h-1.5" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Exam Type Distribution */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-violet-400" />
              Exam Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InteractiveBarChart
              data={examTypeData}
              dataKey="value"
              nameKey="name"
              height={200}
              color="#6366f1"
            />
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Gauge className="h-4 w-4 text-indigo-400" />
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {statusData.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-400 text-[11px]">{item.name}</span>
                  <span className="text-white font-semibold ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Readiness Score Distribution */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Readiness Levels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'High (≥80%)', value: highReadiness, color: '#10b981' },
                    { name: 'Medium (60-79%)', value: exams.filter(e => (e.readiness_score || 0) >= 60 && (e.readiness_score || 0) < 80).length, color: '#f59e0b' },
                    { name: 'Low (<60%)', value: exams.filter(e => (e.readiness_score || 0) < 60).length, color: '#ef4444' }
                  ].filter(d => d.value > 0)}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {[
                    { name: 'High (≥80%)', value: highReadiness, color: '#10b981' },
                    { name: 'Medium (60-79%)', value: exams.filter(e => (e.readiness_score || 0) >= 60 && (e.readiness_score || 0) < 80).length, color: '#f59e0b' },
                    { name: 'Low (<60%)', value: exams.filter(e => (e.readiness_score || 0) < 60).length, color: '#ef4444' }
                  ].filter(d => d.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-1 gap-2 mt-3">
              {[
                { name: 'High', value: highReadiness, color: '#10b981' },
                { name: 'Medium', value: exams.filter(e => (e.readiness_score || 0) >= 60 && (e.readiness_score || 0) < 80).length, color: '#f59e0b' },
                { name: 'Low', value: exams.filter(e => (e.readiness_score || 0) < 60).length, color: '#ef4444' }
              ].filter(d => d.value > 0).map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-400 text-[11px]">{item.name}</span>
                  <span className="text-white font-semibold ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Trend */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              6-Month Exam Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="examTotalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="examCompletedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#examTotalGrad)" name="Total" />
                <Area type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#examCompletedGrad)" name="Completed" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Exam Maturity Radar */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-400" />
              Exam Preparation Maturity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={maturityData}>
                <PolarGrid stroke="#2a3548" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Radar name="Maturity Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                  formatter={(value) => `${value.toFixed(0)}%`}
                />
              </RadarChart>
            </ResponsiveContainer>
            <div className="mt-2 text-center">
              <Badge className="bg-violet-500/20 text-violet-400 text-xs">
                Overall: {(maturityData.reduce((sum, d) => sum + d.score, 0) / maturityData.length).toFixed(0)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Trend with Time Selection */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-violet-400" />
              Exam Activity Trend
            </CardTitle>
            <Tabs value={timeRange.toString()} onValueChange={(v) => setTimeRange(Number(v))}>
              <TabsList className="h-7 bg-[#151d2e] border border-[#2a3548] p-0.5">
                <TabsTrigger value="30" className="h-6 text-[10px] px-2">30d</TabsTrigger>
                <TabsTrigger value="60" className="h-6 text-[10px] px-2">60d</TabsTrigger>
                <TabsTrigger value="90" className="h-6 text-[10px] px-2">90d</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <defs>
                <linearGradient id="examTrendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2.5} dot={false} name="All Exams" />
              <Line type="monotone" dataKey="prep" stroke="#f59e0b" strokeWidth={2.5} dot={false} name="In Prep" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} dot={false} name="Completed" strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* All Exams List */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Shield className="h-4 w-4 text-slate-400" />
              All Regulatory Exams
            </CardTitle>
            <Badge className="bg-slate-500/20 text-slate-400 text-[10px]">
              {exams.length} total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {exams.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No exams scheduled</p>
                <p className="text-xs mt-1">Create your first exam</p>
              </div>
            ) : (
              exams.slice(0, 10).map(exam => (
                <div key={exam.id} className="group p-3 rounded-lg bg-gradient-to-r from-[#151d2e] to-[#1a2332] border border-[#2a3548] hover:border-violet-500/40 cursor-pointer transition-all hover:shadow-lg hover:shadow-violet-500/10">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 mr-3">
                      <h4 className="text-sm font-semibold text-white truncate group-hover:text-violet-400 transition-colors">
                        {exam.exam_title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge className="text-[9px] h-4 px-1.5 bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                          {exam.exam_type}
                        </Badge>
                        <Badge className={`text-[9px] h-4 px-1.5 ${
                          exam.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                          exam.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                          exam.status === 'in_preparation' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                          'bg-slate-500/20 text-slate-400 border-slate-500/30'
                        }`}>
                          {exam.status?.replace(/_/g, ' ')}
                        </Badge>
                        {exam.exam_date && (
                          <span className="text-[10px] text-slate-500">
                            <Calendar className="h-2.5 w-2.5 inline mr-1" />
                            {format(new Date(exam.exam_date), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {exam.readiness_score !== undefined && (
                        <Badge className={`text-[10px] flex-shrink-0 ${
                          exam.readiness_score >= 80 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                          exam.readiness_score >= 60 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                          'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        }`}>
                          {exam.readiness_score}%
                        </Badge>
                      )}
                      {exam.status !== 'completed' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Delete this exam?')) {
                              deleteExamMutation.mutate(exam.id);
                            }
                          }}
                          className="h-6 w-6 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}