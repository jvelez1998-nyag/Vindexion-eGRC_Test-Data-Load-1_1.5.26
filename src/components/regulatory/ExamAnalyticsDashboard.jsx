import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, Target, Brain, Download, Calendar, BarChart3, Award, AlertCircle, Zap, CheckCircle2, Filter, Maximize2, Users, Flame, Clock, RefreshCw } from "lucide-react";
import { LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Scatter, ScatterChart, ZAxis } from "recharts";
import { format, subDays, subMonths, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import InteractiveBarChart from "@/components/charts/InteractiveBarChart";
import DrillDownModal from "@/components/ui/drill-down-modal";

export default function ExamAnalyticsDashboard({ exams, userProgress = [] }) {
  const [timeRange, setTimeRange] = useState(30);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [generatingPrediction, setGeneratingPrediction] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedDrill, setSelectedDrill] = useState(null);
  const [showBenchmarks, setShowBenchmarks] = useState(true);
  const [heatmapView, setHeatmapView] = useState("category");
  const [drillDown, setDrillDown] = useState({ open: false, title: '', data: null, type: '' });
  const [generatingMistakes, setGeneratingMistakes] = useState(false);
  const [commonMistakes, setCommonMistakes] = useState(null);
  const [showTeamComparison, setShowTeamComparison] = useState(false);

  // Industry benchmarks
  const benchmarks = {
    avgScore: 75,
    passRate: 80,
    overallAccuracy: 78,
    categoryBenchmarks: {
      'Cybersecurity': 72,
      'BSA/AML': 76,
      'Information Security': 74,
      'Third-Party Risk': 70,
      'Business Continuity': 73
    }
  };

  // Calculate comprehensive analytics
  const analytics = useMemo(() => {
    const completedExams = exams.filter(e => e.status === 'completed');
    
    // Performance over time
    const performanceTimeline = completedExams
      .filter(e => e.completion_date)
      .sort((a, b) => new Date(a.completion_date) - new Date(b.completion_date))
      .map(e => ({
        date: format(new Date(e.completion_date), 'MMM d'),
        score: e.readiness_score || 0,
        passed: (e.readiness_score || 0) >= 70,
        examType: e.exam_type
      }));

    // Category performance
    const categoryPerformance = {};
    userProgress.forEach(p => {
      if (!categoryPerformance[p.category]) {
        categoryPerformance[p.category] = { correct: 0, total: 0, avgTime: 0 };
      }
      categoryPerformance[p.category].total++;
      if (p.correct) categoryPerformance[p.category].correct++;
      categoryPerformance[p.category].avgTime += p.time_spent || 0;
    });

    const categoryStats = Object.entries(categoryPerformance).map(([category, stats]) => ({
      category,
      accuracy: stats.total > 0 && !isNaN(stats.correct / stats.total) ? Math.round((stats.correct / stats.total) * 100) : 0,
      questions: stats.total,
      avgTime: stats.total > 0 && !isNaN(stats.avgTime / stats.total) ? Math.round(stats.avgTime / stats.total) : 0
    }));

    // Difficulty breakdown
    const difficultyPerformance = {};
    userProgress.forEach(p => {
      const diff = p.difficulty || 'intermediate';
      if (!difficultyPerformance[diff]) {
        difficultyPerformance[diff] = { correct: 0, total: 0 };
      }
      difficultyPerformance[diff].total++;
      if (p.correct) difficultyPerformance[diff].correct++;
    });

    const difficultyStats = Object.entries(difficultyPerformance).map(([difficulty, stats]) => ({
      difficulty,
      accuracy: stats.total > 0 && !isNaN(stats.correct / stats.total) ? Math.round((stats.correct / stats.total) * 100) : 0,
      questions: stats.total
    }));

    // Overall metrics
    const totalQuestions = userProgress.length;
    const correctAnswers = userProgress.filter(p => p.correct).length;
    const overallAccuracy = totalQuestions > 0 && !isNaN(correctAnswers / totalQuestions) ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const avgScore = completedExams.length > 0 && !isNaN(completedExams.reduce((sum, e) => sum + (e.readiness_score || 0), 0) / completedExams.length)
      ? Math.round(completedExams.reduce((sum, e) => sum + (e.readiness_score || 0), 0) / completedExams.length)
      : 0;
    const passRate = completedExams.length > 0 && !isNaN(completedExams.filter(e => (e.readiness_score || 0) >= 70).length / completedExams.length)
      ? Math.round((completedExams.filter(e => (e.readiness_score || 0) >= 70).length / completedExams.length) * 100)
      : 0;

    // Strengths and weaknesses
    const strengths = categoryStats.filter(c => c.accuracy >= 80).sort((a, b) => b.accuracy - a.accuracy);
    const weaknesses = categoryStats.filter(c => c.accuracy < 60).sort((a, b) => a.accuracy - b.accuracy);

    // Recent trend
    const recentExams = performanceTimeline.slice(-5);
    const recentAvg = recentExams.length > 0 
      ? recentExams.reduce((sum, e) => sum + e.score, 0) / recentExams.length 
      : 0;
    const previousTrendAvg = performanceTimeline.slice(-10, -5).length > 0
      ? performanceTimeline.slice(-10, -5).reduce((sum, e) => sum + e.score, 0) / Math.max(performanceTimeline.slice(-10, -5).length, 1)
      : 0;
    const trend = recentAvg - previousTrendAvg;

    // Radar chart data
    const radarData = categoryStats.slice(0, 6).map(c => ({
      subject: c.category,
      score: c.accuracy,
      benchmark: benchmarks.categoryBenchmarks[c.category] || 75,
      fullMark: 100
    }));

    // Heat map data (performance by category over time)
    const weeklyData = eachDayOfInterval({
      start: subDays(new Date(), timeRange),
      end: new Date()
    }).map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayProgress = userProgress.filter(p => 
        p.created_date && format(new Date(p.created_date), 'yyyy-MM-dd') === dateStr
      );
      
      const categoryPerf = {};
      dayProgress.forEach(p => {
        if (!categoryPerf[p.category]) {
          categoryPerf[p.category] = { correct: 0, total: 0 };
        }
        categoryPerf[p.category].total++;
        if (p.correct) categoryPerf[p.category].correct++;
      });

      return {
        date: format(date, 'MMM d'),
        ...Object.fromEntries(
          Object.entries(categoryPerf).map(([cat, perf]) => [
            cat, 
            perf.total > 0 ? Math.round((perf.correct / perf.total) * 100) : 0
          ])
        )
      };
    });

    // Comparison data (current vs previous period)
    const midpoint = Math.floor(timeRange / 2);
    const currentPeriod = performanceTimeline.slice(-midpoint);
    const previousPeriod = performanceTimeline.slice(-timeRange, -midpoint);
    
    const currentAvg = currentPeriod.length > 0 
      ? currentPeriod.reduce((sum, e) => sum + e.score, 0) / currentPeriod.length 
      : 0;
    const previousAvg = previousPeriod.length > 0
      ? previousPeriod.reduce((sum, e) => sum + e.score, 0) / previousPeriod.length
      : 0;

    // Study velocity (questions per day)
    const studyVelocity = weeklyData.map(day => ({
      date: day.date,
      questions: Object.values(day).filter(v => typeof v === 'number' && v > 0).length
    }));

    // Streak analysis
    const streakData = [];
    let currentStreak = 0;
    performanceTimeline.forEach((exam, idx) => {
      if (exam.passed) {
        currentStreak++;
      } else {
        if (currentStreak > 0) {
          streakData.push({ length: currentStreak, endDate: performanceTimeline[idx - 1].date });
        }
        currentStreak = 0;
      }
    });
    const longestStreak = Math.max(...streakData.map(s => s.length), 0);

    return {
      performanceTimeline,
      categoryStats,
      difficultyStats,
      overallAccuracy,
      avgScore,
      passRate,
      totalQuestions,
      completedExams: completedExams.length,
      strengths,
      weaknesses,
      trend,
      radarData,
      weeklyData,
      currentAvg,
      previousAvg,
      studyVelocity,
      longestStreak,
      currentStreak
    };
  }, [exams, userProgress, timeRange, selectedCategory]);

  // Generate common mistakes analysis
  const generateCommonMistakes = async () => {
    setGeneratingMistakes(true);
    try {
      // Analyze incorrect answers
      const incorrectAnswers = userProgress.filter(p => !p.correct);
      const categoryErrors = {};
      incorrectAnswers.forEach(p => {
        categoryErrors[p.category] = (categoryErrors[p.category] || 0) + 1;
      });

      const prompt = `Analyze these exam mistakes and identify common patterns:

OVERALL STATISTICS:
- Total Questions Attempted: ${userProgress.length}
- Incorrect Answers: ${incorrectAnswers.length}
- Error Rate: ${userProgress.length > 0 ? Math.round((incorrectAnswers.length / userProgress.length) * 100) : 0}%

ERRORS BY CATEGORY:
${Object.entries(categoryErrors).map(([cat, count]) => `- ${cat}: ${count} errors`).join('\n')}

TOP ERROR CATEGORIES:
${Object.entries(categoryErrors).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([cat, count]) => `${cat} (${count})`).join(', ')}

DIFFICULTY DISTRIBUTION OF ERRORS:
${incorrectAnswers.reduce((acc, p) => {
  acc[p.difficulty || 'intermediate'] = (acc[p.difficulty || 'intermediate'] || 0) + 1;
  return acc;
}, {})}

Provide detailed analysis including:
1. Top 5 mistake patterns (what concepts are consistently misunderstood)
2. Knowledge gaps (specific topics causing most errors)
3. Remediation strategies (actionable study recommendations)
4. Root causes (why these mistakes are happening)`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            mistake_patterns: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  pattern: { type: "string" },
                  description: { type: "string" },
                  frequency: { type: "string" },
                  categories: { type: "array", items: { type: "string" } }
                }
              }
            },
            knowledge_gaps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  topic: { type: "string" },
                  description: { type: "string" },
                  impact_level: { type: "string" }
                }
              }
            },
            remediation_strategies: { type: "array", items: { type: "string" } },
            root_causes: { type: "array", items: { type: "string" } }
          }
        }
      });

      setCommonMistakes(response);
      toast.success("Mistake analysis complete");
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze mistakes");
    } finally {
      setGeneratingMistakes(false);
    }
  };

  // Generate AI predictions
  const generatePredictions = async () => {
    setGeneratingPrediction(true);
    try {
      const prompt = `Analyze this exam performance data and provide predictive analytics:

Overall Metrics:
- Completed Exams: ${analytics.completedExams}
- Average Score: ${analytics.avgScore}%
- Pass Rate: ${analytics.passRate}%
- Overall Accuracy: ${analytics.overallAccuracy}%
- Recent Trend: ${analytics.trend > 0 ? 'Improving' : analytics.trend < 0 ? 'Declining' : 'Stable'} (${analytics.trend.toFixed(1)}%)

Strengths (High Performance):
${analytics.strengths.slice(0, 3).map(s => `- ${s.category}: ${s.accuracy}%`).join('\n')}

Weaknesses (Need Improvement):
${analytics.weaknesses.slice(0, 3).map(w => `- ${w.category}: ${w.accuracy}%`).join('\n')}

Difficulty Performance:
${analytics.difficultyStats.map(d => `- ${d.difficulty}: ${d.accuracy}%`).join('\n')}

Provide:
1. Predicted readiness score for next exam (0-100)
2. Confidence level in prediction (low/medium/high)
3. Top 3 focus areas for improvement
4. Estimated study hours needed to reach 90% readiness
5. Recommended next steps`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            predicted_readiness: { type: "number" },
            confidence: { type: "string" },
            focus_areas: { type: "array", items: { type: "string" } },
            study_hours_needed: { type: "number" },
            recommendations: { type: "array", items: { type: "string" } },
            insights: { type: "string" }
          }
        }
      });

      setPredictions(response);
      toast.success("Predictive analytics generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate predictions");
    } finally {
      setGeneratingPrediction(false);
    }
  };

  // Export report
  const handleExport = () => {
    const report = {
      generated_date: new Date().toISOString(),
      summary: {
        total_exams: analytics.completedExams,
        average_score: analytics.avgScore,
        pass_rate: analytics.passRate,
        overall_accuracy: analytics.overallAccuracy,
        total_questions_attempted: analytics.totalQuestions
      },
      performance_by_category: analytics.categoryStats,
      performance_by_difficulty: analytics.difficultyStats,
      strengths: analytics.strengths,
      weaknesses: analytics.weaknesses,
      performance_timeline: analytics.performanceTimeline,
      predictions: predictions
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam_analytics_${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    toast.success("Report exported");
  };

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

  // Custom tooltips
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a2332] border border-[#2a3548] rounded-lg p-3 shadow-lg">
          <p className="text-xs text-white font-semibold mb-1">{label}</p>
          {payload.map((entry, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-400">{entry.name}:</span>
              <span className="text-white font-semibold">{entry.value}%</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Heat map cell renderer
  const getHeatColor = (value) => {
    if (value >= 80) return '#10b981';
    if (value >= 70) return '#3b82f6';
    if (value >= 60) return '#f59e0b';
    if (value >= 50) return '#f97316';
    return '#ef4444';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-purple-500/10 border-indigo-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
                <BarChart3 className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Exam Analytics & Performance Insights</h2>
                <p className="text-xs text-slate-400">Comprehensive performance tracking with AI-powered predictions</p>
              </div>
            </div>
            <Button onClick={handleExport} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Key Metrics with Comparisons */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card className="bg-[#1a2332] border-[#2a3548] hover:border-violet-500/40 transition-all cursor-pointer" onClick={() => setDrillDown({ open: true, title: 'Completed Exams', data: analytics.performanceTimeline.filter(p => p.passed).map(p => exams.find(e => e.readiness_score === p.score)), type: 'exam' })}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Award className="h-5 w-5 text-amber-400" />
              <div className={`text-xs flex items-center gap-1 ${analytics.trend > 0 ? 'text-emerald-400' : analytics.trend < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                {analytics.trend > 0 ? <TrendingUp className="h-3 w-3" /> : analytics.trend < 0 ? <TrendingDown className="h-3 w-3" /> : null}
                {analytics.trend > 0 ? '+' : ''}{analytics.trend.toFixed(1)}%
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{analytics.avgScore}%</div>
            <div className="text-xs text-slate-400 flex items-center gap-1">
              Avg Score
              {showBenchmarks && <span className={analytics.avgScore >= benchmarks.avgScore ? 'text-emerald-400' : 'text-amber-400'}>
                ({analytics.avgScore >= benchmarks.avgScore ? '+' : ''}{(analytics.avgScore - benchmarks.avgScore).toFixed(0)})
              </span>}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548] hover:border-emerald-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <Badge className="text-[9px] bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                {analytics.passRate >= benchmarks.passRate ? 'Above' : 'Below'}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-white">{analytics.passRate}%</div>
            <div className="text-xs text-slate-400">Pass Rate</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548] hover:border-blue-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-5 w-5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">{analytics.overallAccuracy}%</div>
            <div className="text-xs text-slate-400">Accuracy</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548] hover:border-violet-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-5 w-5 text-violet-400" />
            </div>
            <div className="text-2xl font-bold text-white">{analytics.completedExams}</div>
            <div className="text-xs text-slate-400">Completed</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548] hover:border-amber-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Flame className="h-5 w-5 text-orange-400" />
            </div>
            <div className="text-2xl font-bold text-white">{analytics.longestStreak}</div>
            <div className="text-xs text-slate-400">Best Streak</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548] hover:border-cyan-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-5 w-5 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-white">{analytics.totalQuestions}</div>
            <div className="text-xs text-slate-400">Questions</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Filters */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 text-slate-400" />
              <Select value={timeRange.toString()} onValueChange={(v) => setTimeRange(Number(v))}>
                <SelectTrigger className="w-32 h-8 bg-[#0f1623] border-[#2a3548]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="180">6 months</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                  <SelectItem value="730">2 years</SelectItem>
                </SelectContent>
              </Select>

              <Button
                size="sm"
                onClick={() => setShowBenchmarks(!showBenchmarks)}
                className="h-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Users className="h-3 w-3 mr-1" />
                {showBenchmarks ? 'Hide' : 'Show'} Benchmarks
              </Button>

              <Button
                size="sm"
                onClick={() => setComparisonMode(!comparisonMode)}
                className="h-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Compare Periods
              </Button>

              <Button
                size="sm"
                onClick={() => setShowTeamComparison(!showTeamComparison)}
                className="h-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Users className="h-3 w-3 mr-1" />
                Team Comparison
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-[#0f1623] border border-[#2a3548] overflow-x-auto p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300 data-[state=active]:border data-[state=active]:border-violet-500/30">Overview</TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 data-[state=active]:border data-[state=active]:border-blue-500/30">Performance Trends</TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300 data-[state=active]:border data-[state=active]:border-emerald-500/30">By Category</TabsTrigger>
          <TabsTrigger value="difficulty" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300 data-[state=active]:border data-[state=active]:border-amber-500/30">By Difficulty</TabsTrigger>
          <TabsTrigger value="predictions" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 data-[state=active]:border data-[state=active]:border-purple-500/30">AI Predictions</TabsTrigger>
          <TabsTrigger value="mistakes" className="data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-300 data-[state=active]:border data-[state=active]:border-rose-500/30">Common Mistakes</TabsTrigger>
          <TabsTrigger value="benchmarks" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 data-[state=active]:border data-[state=active]:border-cyan-500/30">Benchmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Enhanced Performance Radar with Benchmarks */}
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Performance vs Benchmarks</CardTitle>
                  <Badge className="text-[10px] bg-blue-500/20 text-blue-400 border-blue-500/30">
                    Interactive
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={analytics.radarData}>
                    <PolarGrid stroke="#2a3548" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                    <Radar name="Your Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
                    {showBenchmarks && (
                      <Radar name="Industry Avg" dataKey="benchmark" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} strokeDasharray="5 5" />
                    )}
                    <Tooltip content={CustomTooltip} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Strengths & Weaknesses */}
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm">Strengths & Weaknesses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs text-emerald-400 font-semibold mb-2">Top Strengths</h4>
                    <div className="space-y-2">
                      {analytics.strengths.slice(0, 3).map((strength, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                          <span className="text-xs text-white">{strength.category}</span>
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                            {strength.accuracy}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs text-rose-400 font-semibold mb-2">Areas to Improve</h4>
                    <div className="space-y-2">
                      {analytics.weaknesses.slice(0, 3).map((weakness, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded bg-rose-500/10 border border-rose-500/20">
                          <span className="text-xs text-white">{weakness.category}</span>
                          <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-xs">
                            {weakness.accuracy}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {/* Comparison View */}
          {comparisonMode && (
            <Card className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-500/20">
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-xs text-slate-400 mb-1">Previous Period</div>
                    <div className="text-2xl font-bold text-slate-300">{analytics.previousAvg.toFixed(1)}%</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${(analytics.currentAvg - analytics.previousAvg) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {(analytics.currentAvg - analytics.previousAvg) >= 0 ? '+' : ''}{(analytics.currentAvg - analytics.previousAvg).toFixed(1)}%
                    </div>
                    <div className="text-xs text-slate-400">Change</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-slate-400 mb-1">Current Period</div>
                    <div className="text-2xl font-bold text-white">{analytics.currentAvg.toFixed(1)}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Interactive Timeline */}
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Performance Timeline</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className="text-[10px] bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    Passed: {analytics.performanceTimeline.filter(p => p.passed).length}
                  </Badge>
                  <Badge className="text-[10px] bg-rose-500/20 text-rose-400 border-rose-500/30">
                    Failed: {analytics.performanceTimeline.filter(p => !p.passed).length}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={analytics.performanceTimeline}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip content={CustomTooltip} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  {showBenchmarks && (
                    <Line type="monotone" dataKey={() => benchmarks.avgScore} stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="Benchmark" dot={false} />
                  )}
                  <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#scoreGradient)" name="Score" />
                  <Scatter dataKey="score" fill={(entry) => entry.passed ? '#10b981' : '#ef4444'} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Study Velocity */}
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-sm">Study Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <InteractiveBarChart
                data={analytics.studyVelocity}
                dataKey="questions"
                nameKey="date"
                height={200}
                color="#8b5cf6"
                onBarClick={(data) => setSelectedDrill(data)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          {/* Heat Map */}
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Performance Heat Map</CardTitle>
                <Badge className="text-[10px] bg-violet-500/20 text-violet-400 border-violet-500/30">
                  Last {timeRange} Days
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {analytics.categoryStats.slice(0, 8).map((cat, catIdx) => (
                    <div key={catIdx}>
                      <div className="text-xs text-slate-400 mb-1">{cat.category}</div>
                      <div className="flex gap-1">
                        {analytics.weeklyData.slice(-30).map((day, dayIdx) => {
                          const value = day[cat.category] || 0;
                          return (
                            <div
                              key={dayIdx}
                              className="w-3 h-8 rounded cursor-pointer hover:scale-110 transition-transform"
                              style={{ backgroundColor: value > 0 ? getHeatColor(value) : '#1a2332' }}
                              title={`${day.date}: ${value}%`}
                              onClick={() => setSelectedDrill({ category: cat.category, date: day.date, score: value })}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex items-center justify-between mt-3 text-[10px] text-slate-500">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }} />
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f97316' }} />
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f59e0b' }} />
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#3b82f6' }} />
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10b981' }} />
                </div>
                <span>More</span>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Category Comparison */}
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-sm">Category Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <InteractiveBarChart
                data={analytics.categoryStats}
                dataKey="accuracy"
                nameKey="category"
                height={400}
                benchmark={showBenchmarks ? 75 : null}
                onBarClick={(data) => setSelectedDrill(data)}
                drillDownContent={(data) => (
                  <div className="space-y-3">
                    <Card className="bg-[#0f1623] border-[#2a3548]">
                      <CardContent className="p-3">
                        <h4 className="text-xs text-slate-400 mb-2">Question Breakdown</h4>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-slate-400">Total Questions:</span>
                            <span className="text-white font-semibold ml-2">{data.questions || 0}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Avg Time:</span>
                            <span className="text-white font-semibold ml-2">{data.avgTime || 0}s</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="difficulty">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm">Accuracy by Difficulty</CardTitle>
              </CardHeader>
              <CardContent>
                <InteractiveBarChart
                  data={analytics.difficultyStats}
                  dataKey="accuracy"
                  nameKey="difficulty"
                  height={300}
                  color="#8b5cf6"
                  hoverColor="#a78bfa"
                  onBarClick={(data) => setSelectedDrill(data)}
                  drillDownContent={(data) => (
                    <Card className="bg-[#0f1623] border-[#2a3548]">
                      <CardContent className="p-3">
                        <div className="text-xs space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Questions Attempted:</span>
                            <span className="text-white font-semibold">{data.questions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Success Rate:</span>
                            <span className={`font-semibold ${data.accuracy >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>{data.accuracy}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm">Question Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.difficultyStats}
                      dataKey="questions"
                      nameKey="difficulty"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => `${entry.difficulty}: ${entry.questions}`}
                    >
                      {analytics.difficultyStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="h-5 w-5 text-violet-400" />
                  AI-Powered Predictive Analytics
                </CardTitle>
                <Button 
                  onClick={generatePredictions}
                  disabled={generatingPrediction || analytics.completedExams === 0}
                  className="bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 border border-violet-500/30"
                >
                  {generatingPrediction ? (
                    <>
                      <Brain className="h-4 w-4 mr-2 animate-pulse" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Generate Predictions
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!predictions && (
                <div className="text-center py-12">
                  <Brain className="h-16 w-16 mx-auto mb-4 text-violet-400 opacity-50" />
                  <p className="text-slate-400 text-sm mb-2">Click "Generate Predictions" to get AI-powered insights</p>
                  <p className="text-slate-500 text-xs">Based on your performance history and learning patterns</p>
                </div>
              )}

              {predictions && (
                <div className="space-y-6">
                  {/* Readiness Score */}
                  <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-sm font-semibold text-white mb-1">Predicted Exam Readiness</h3>
                          <Badge className={`text-xs ${
                            predictions.confidence === 'high' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                            predictions.confidence === 'medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                            'bg-slate-500/20 text-slate-400 border-slate-500/30'
                          }`}>
                            {predictions.confidence} confidence
                          </Badge>
                        </div>
                        <div className="text-4xl font-bold text-violet-400">{predictions.predicted_readiness}%</div>
                      </div>
                      <p className="text-xs text-slate-300">{predictions.insights}</p>
                    </CardContent>
                  </Card>

                  {/* Focus Areas */}
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4 text-amber-400" />
                      Recommended Focus Areas
                    </h4>
                    <div className="space-y-2">
                      {predictions.focus_areas?.map((area, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <div className="flex items-start gap-2">
                            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 mt-0.5">
                              {idx + 1}
                            </Badge>
                            <span className="text-sm text-white">{area}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Study Plan */}
                  <Card className="bg-blue-500/10 border-blue-500/20">
                    <CardContent className="p-4">
                      <h4 className="text-sm font-semibold text-blue-400 mb-2">Recommended Study Plan</h4>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-3xl font-bold text-blue-400">{predictions.study_hours_needed}h</div>
                        <div className="text-xs text-slate-300">
                          Estimated study time needed<br/>to reach 90% readiness
                        </div>
                      </div>
                      <div className="space-y-1">
                        {predictions.recommendations?.map((rec, idx) => (
                          <div key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                            <CheckCircle2 className="h-3 w-3 text-blue-400 mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mistakes">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-rose-400" />
                  AI-Powered Common Mistakes Analysis
                </CardTitle>
                <Button 
                  onClick={generateCommonMistakes}
                  disabled={generatingMistakes || userProgress.length === 0}
                  className="bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30"
                >
                  {generatingMistakes ? (
                    <>
                      <Brain className="h-4 w-4 mr-2 animate-pulse" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Analyze Mistakes
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!commonMistakes && (
                <div className="text-center py-12">
                  <AlertCircle className="h-16 w-16 mx-auto mb-4 text-rose-400 opacity-50" />
                  <p className="text-slate-400 text-sm mb-2">Click "Analyze Mistakes" to get AI insights</p>
                  <p className="text-slate-500 text-xs">Identifies patterns in incorrect answers across all users and topics</p>
                </div>
              )}

              {commonMistakes && (
                <div className="space-y-6">
                  {/* Top Mistake Patterns */}
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4 text-rose-400" />
                      Most Common Mistake Patterns
                    </h4>
                    <div className="space-y-3">
                      {commonMistakes.mistake_patterns?.map((pattern, idx) => (
                        <Card key={idx} className="bg-rose-500/10 border-rose-500/20">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 mt-0.5">
                                #{idx + 1}
                              </Badge>
                              <div className="flex-1">
                                <h5 className="text-sm font-semibold text-white mb-1">{pattern.pattern}</h5>
                                <p className="text-xs text-slate-300 mb-2">{pattern.description}</p>
                                <div className="flex items-center gap-2">
                                  <Badge className="text-xs bg-amber-500/20 text-amber-400">
                                    {pattern.frequency} occurrences
                                  </Badge>
                                  <Badge className="text-xs bg-blue-500/20 text-blue-400">
                                    {pattern.categories?.join(', ')}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Remediation Strategies */}
                  <Card className="bg-blue-500/10 border-blue-500/20">
                    <CardContent className="p-4">
                      <h4 className="text-sm font-semibold text-blue-400 mb-3">Recommended Remediation Strategies</h4>
                      <div className="space-y-2">
                        {commonMistakes.remediation_strategies?.map((strategy, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                            <CheckCircle2 className="h-3 w-3 text-blue-400 mt-0.5 flex-shrink-0" />
                            <span>{strategy}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Knowledge Gaps */}
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-3">Critical Knowledge Gaps</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {commonMistakes.knowledge_gaps?.map((gap, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-4 w-4 text-amber-400" />
                            <span className="text-sm font-semibold text-white">{gap.topic}</span>
                          </div>
                          <p className="text-xs text-slate-300 mb-2">{gap.description}</p>
                          <Badge className="text-xs bg-rose-500/20 text-rose-400">
                            {gap.impact_level} impact
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmarks">
          <div className="space-y-4">
            {/* Team Comparison */}
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-400" />
                  Performance vs Team Average
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-[#0f1623] border-[#2a3548]">
                    <CardContent className="p-4">
                      <div className="text-xs text-slate-400 mb-1">Your Avg Score</div>
                      <div className="text-3xl font-bold text-indigo-400">{analytics.avgScore}%</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#0f1623] border-[#2a3548]">
                    <CardContent className="p-4">
                      <div className="text-xs text-slate-400 mb-1">Team Average</div>
                      <div className="text-3xl font-bold text-slate-300">{benchmarks.avgScore}%</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#0f1623] border-[#2a3548]">
                    <CardContent className="p-4">
                      <div className="text-xs text-slate-400 mb-1">Difference</div>
                      <div className={`text-3xl font-bold ${analytics.avgScore >= benchmarks.avgScore ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {analytics.avgScore >= benchmarks.avgScore ? '+' : ''}{analytics.avgScore - benchmarks.avgScore}%
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Detailed Comparison */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-white">Category Comparison</h4>
                  {analytics.categoryStats.slice(0, 8).map((cat, idx) => {
                    const benchmark = benchmarks.categoryBenchmarks[cat.category] || benchmarks.avgScore;
                    const diff = cat.accuracy - benchmark;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300">{cat.category}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-indigo-400 font-semibold">{cat.accuracy}%</span>
                            <span className="text-slate-500">vs</span>
                            <span className="text-slate-400">{benchmark}%</span>
                            <Badge className={`text-xs ${diff >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                              {diff >= 0 ? '+' : ''}{diff}%
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Progress value={cat.accuracy} className="h-1.5" />
                          <Progress value={benchmark} className="h-1.5 opacity-50" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Performance Percentile */}
                <Card className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-500/20 mt-6">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-emerald-400 mb-1">Your Performance Ranking</h4>
                        <p className="text-xs text-slate-400">Based on overall accuracy and completion rate</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-emerald-400">Top 25%</div>
                        <div className="text-xs text-slate-400">Estimated percentile</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            {/* Industry Benchmarks */}
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-400" />
                  Industry Benchmark Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                      <div className="text-xs text-slate-400 mb-1">Pass Rate</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-white">{analytics.passRate}%</span>
                        <span className={`text-xs ${analytics.passRate >= benchmarks.passRate ? 'text-emerald-400' : 'text-amber-400'}`}>
                          vs {benchmarks.passRate}%
                        </span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                      <div className="text-xs text-slate-400 mb-1">Accuracy</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-white">{analytics.overallAccuracy}%</span>
                        <span className={`text-xs ${analytics.overallAccuracy >= benchmarks.overallAccuracy ? 'text-emerald-400' : 'text-amber-400'}`}>
                          vs {benchmarks.overallAccuracy}%
                        </span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                      <div className="text-xs text-slate-400 mb-1">Avg Score</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-white">{analytics.avgScore}%</span>
                        <span className={`text-xs ${analytics.avgScore >= benchmarks.avgScore ? 'text-emerald-400' : 'text-amber-400'}`}>
                          vs {benchmarks.avgScore}%
                        </span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                      <div className="text-xs text-slate-400 mb-1">Completed</div>
                      <div className="text-xl font-bold text-white">{analytics.completedExams}</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <h4 className="text-sm font-semibold text-blue-400 mb-2">Benchmark Insights</h4>
                    <ul className="text-xs text-slate-300 space-y-1">
                      <li>• Your average score is {analytics.avgScore >= benchmarks.avgScore ? 'above' : 'below'} the industry benchmark by {Math.abs(analytics.avgScore - benchmarks.avgScore)}%</li>
                      <li>• Your pass rate is {analytics.passRate >= benchmarks.passRate ? 'exceeding' : 'below'} expectations ({analytics.passRate}% vs {benchmarks.passRate}%)</li>
                      <li>• Overall accuracy is {analytics.overallAccuracy >= benchmarks.overallAccuracy ? 'strong' : 'needs improvement'} compared to peer average</li>
                      <li>• {analytics.strengths.length > 0 ? `Strongest in: ${analytics.strengths[0].category}` : 'Continue building expertise across categories'}</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Drill-Down Dialog */}
      <Dialog open={!!selectedDrill} onOpenChange={() => setSelectedDrill(null)}>
        <DialogContent className="bg-[#1a2332] border-[#2a3548] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedDrill?.category || 'Category'} Performance Detail
            </DialogTitle>
          </DialogHeader>
          {selectedDrill && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-[#0f1623] border-[#2a3548]">
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl font-bold text-white">{selectedDrill.accuracy || selectedDrill.score}%</div>
                    <div className="text-xs text-slate-400">Accuracy</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#0f1623] border-[#2a3548]">
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl font-bold text-white">{selectedDrill.questions || 0}</div>
                    <div className="text-xs text-slate-400">Questions</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#0f1623] border-[#2a3548]">
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl font-bold text-white">{selectedDrill.avgTime || 0}s</div>
                    <div className="text-xs text-slate-400">Avg Time</div>
                  </CardContent>
                </Card>
              </div>

              <div className="p-4 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <h4 className="text-sm font-semibold text-violet-400 mb-2">Insights</h4>
                <ul className="text-xs text-slate-300 space-y-1">
                  <li>• {selectedDrill.accuracy >= 80 ? 'Strong performance in this area' : selectedDrill.accuracy >= 60 ? 'Room for improvement' : 'Focus area - needs attention'}</li>
                  <li>• {benchmarks.categoryBenchmarks[selectedDrill.category] ? 
                    `${selectedDrill.accuracy >= benchmarks.categoryBenchmarks[selectedDrill.category] ? 'Above' : 'Below'} industry benchmark (${benchmarks.categoryBenchmarks[selectedDrill.category]}%)` 
                    : 'Continue practicing to maintain consistency'}</li>
                  <li>• Recommended: {selectedDrill.accuracy < 70 ? 'Review fundamentals and practice more questions' : 'Move to advanced topics'}</li>
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}