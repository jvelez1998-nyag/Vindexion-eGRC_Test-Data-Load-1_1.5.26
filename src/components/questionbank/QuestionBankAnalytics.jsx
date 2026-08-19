import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, 
  Target, BarChart3, Shield, FileCheck, Calendar, Eye,
  ThumbsUp, ThumbsDown, Zap
} from "lucide-react";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function QuestionBankAnalytics({ questions, isLoading }) {
  // Fetch user progress data for trend analysis
  const { data: userProgress = [] } = useQuery({
    queryKey: ['user-progress'],
    queryFn: () => base44.entities.UserProgress.list('-created_date', 500),
    initialData: []
  });

  const { data: exams = [] } = useQuery({
    queryKey: ['regulatory-exams'],
    queryFn: () => base44.entities.RegulatoryExam.list('-created_date', 500),
    initialData: []
  });

  const { data: compliance = [] } = useQuery({
    queryKey: ['compliance'],
    queryFn: () => base44.entities.Compliance.list(),
    initialData: []
  });

  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: () => base44.entities.Risk.list(),
    initialData: []
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-32 bg-[#1a2332]" />)}
      </div>
    );
  }

  // Calculate overall statistics
  const totalQuestions = questions.length;
  const totalUsage = questions.reduce((sum, q) => sum + (q.usage_count || 0), 0);
  const verifiedQuestions = questions.filter(q => q.is_verified).length;
  const avgQuality = questions.length > 0 
    ? (questions.reduce((sum, q) => sum + (q.quality_rating || 3), 0) / questions.length).toFixed(2)
    : 0;

  // Calculate pass rates from exam data
  const questionsWithUsage = questions.filter(q => q.usage_count > 0);
  const avgPassRate = exams.length > 0
    ? (exams.reduce((sum, e) => sum + (e.score_percentage || 0), 0) / exams.length).toFixed(1)
    : 0;

  // Framework breakdown
  const frameworkData = Object.entries(
    questions.reduce((acc, q) => {
      acc[q.framework] = (acc[q.framework] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({
    name,
    count,
    usage: questions.filter(q => q.framework === name).reduce((sum, q) => sum + (q.usage_count || 0), 0)
  })).sort((a, b) => b.count - a.count);

  // Difficulty breakdown
  const difficultyData = [
    { 
      name: 'Beginner', 
      count: questions.filter(q => q.difficulty === 'beginner').length,
      avgUsage: questions.filter(q => q.difficulty === 'beginner').reduce((s, q) => s + (q.usage_count || 0), 0) / questions.filter(q => q.difficulty === 'beginner').length || 0,
      color: '#10b981'
    },
    { 
      name: 'Intermediate', 
      count: questions.filter(q => q.difficulty === 'intermediate').length,
      avgUsage: questions.filter(q => q.difficulty === 'intermediate').reduce((s, q) => s + (q.usage_count || 0), 0) / questions.filter(q => q.difficulty === 'intermediate').length || 0,
      color: '#f59e0b'
    },
    { 
      name: 'Advanced', 
      count: questions.filter(q => q.difficulty === 'advanced').length,
      avgUsage: questions.filter(q => q.difficulty === 'advanced').reduce((s, q) => s + (q.usage_count || 0), 0) / questions.filter(q => q.difficulty === 'advanced').length || 0,
      color: '#ef4444'
    }
  ].filter(d => d.count > 0);

  // Question type breakdown
  const typeData = Object.entries(
    questions.reduce((acc, q) => {
      const type = q.question_type || 'other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Low engagement questions (less than average usage)
  const avgUsage = totalUsage / totalQuestions;
  const lowEngagementQuestions = questions
    .filter(q => (q.usage_count || 0) < avgUsage * 0.5 && q.status === 'active')
    .sort((a, b) => (a.usage_count || 0) - (b.usage_count || 0))
    .slice(0, 10);

  // Questions needing review (low quality or no verification)
  const questionsNeedingReview = questions
    .filter(q => !q.is_verified || (q.quality_rating && q.quality_rating < 3))
    .slice(0, 10);

  // Compliance coverage
  const complianceCoverage = compliance.map(comp => ({
    id: comp.id,
    framework: comp.framework,
    requirement: comp.requirement,
    questionCount: questions.filter(q => q.linked_compliance?.includes(comp.id)).length,
    status: comp.status
  })).filter(c => c.questionCount > 0)
    .sort((a, b) => b.questionCount - a.questionCount)
    .slice(0, 10);

  // Risk coverage
  const riskCoverage = risks.map(risk => ({
    id: risk.id,
    title: risk.title,
    category: risk.category,
    questionCount: questions.filter(q => q.linked_risks?.includes(risk.id)).length,
    riskLevel: (risk.likelihood || 0) * (risk.impact || 0)
  })).filter(r => r.questionCount > 0)
    .sort((a, b) => b.questionCount - a.questionCount)
    .slice(0, 10);

  // Usage trends over time (last 30 days)
  const last30Days = [...Array(30)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });

  const usageTrends = last30Days.map(date => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    exams: exams.filter(e => e.start_date?.startsWith(date)).length,
    questionsUsed: exams
      .filter(e => e.start_date?.startsWith(date))
      .reduce((sum, e) => sum + (e.total_questions || 0), 0)
  }));

  // Quality distribution radar
  const qualityRadar = [
    { 
      metric: 'Verification', 
      value: (verifiedQuestions / totalQuestions) * 100 
    },
    { 
      metric: 'Quality Rating', 
      value: (avgQuality / 5) * 100 
    },
    { 
      metric: 'Usage Rate', 
      value: Math.min((questionsWithUsage.length / totalQuestions) * 100, 100) 
    },
    { 
      metric: 'Framework Coverage', 
      value: (frameworkData.length / 14) * 100 
    },
    { 
      metric: 'Compliance Links', 
      value: Math.min((questions.filter(q => q.linked_compliance?.length > 0).length / totalQuestions) * 100, 100) 
    }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20 hover:scale-[1.02] transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-violet-500/20 border border-violet-500/30">
                <BarChart3 className="h-5 w-5 text-violet-400" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{totalUsage}</div>
                <Badge className="mt-1 bg-violet-500/20 text-violet-400 text-[9px]">
                  Total Usage
                </Badge>
              </div>
            </div>
            <div className="text-sm font-semibold text-white">Questions Used</div>
            <div className="text-xs text-violet-400 mt-1">Across {exams.length} exams</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20 hover:scale-[1.02] transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{avgPassRate}%</div>
                <Badge className="mt-1 bg-emerald-500/20 text-emerald-400 text-[9px]">
                  Avg Pass Rate
                </Badge>
              </div>
            </div>
            <div className="text-sm font-semibold text-white">Success Rate</div>
            <div className="text-xs text-emerald-400 mt-1">{verifiedQuestions} verified questions</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 hover:scale-[1.02] transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30">
                <Target className="h-5 w-5 text-amber-400" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{avgQuality}</div>
                <Badge className="mt-1 bg-amber-500/20 text-amber-400 text-[9px]">
                  / 5.0
                </Badge>
              </div>
            </div>
            <div className="text-sm font-semibold text-white">Avg Quality</div>
            <div className="text-xs text-amber-400 mt-1">Question rating</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20 hover:scale-[1.02] transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30">
                <Eye className="h-5 w-5 text-cyan-400" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{questionsWithUsage.length}</div>
                <Badge className="mt-1 bg-cyan-500/20 text-cyan-400 text-[9px]">
                  / {totalQuestions}
                </Badge>
              </div>
            </div>
            <div className="text-sm font-semibold text-white">Active Questions</div>
            <div className="text-xs text-cyan-400 mt-1">{Math.round((questionsWithUsage.length/totalQuestions)*100)}% engagement</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Framework Performance */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Shield className="h-4 w-4 text-violet-400" />
              Questions by Framework
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={frameworkData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Questions" />
                <Bar dataKey="usage" fill="#06b6d4" radius={[8, 8, 0, 0]} name="Usage" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Difficulty Distribution */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-amber-400" />
              Difficulty vs Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={difficultyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} name="Question Count" />
                <Bar dataKey="avgUsage" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Avg Usage" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Question Type Distribution */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Zap className="h-4 w-4 text-indigo-400" />
              Question Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={true}
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quality Radar */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-400" />
              Quality Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={qualityRadar}>
                <PolarGrid stroke="#2a3548" />
                <PolarAngleAxis dataKey="metric" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <Radar name="Score %" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Usage Trends */}
        <Card className="bg-[#1a2332] border-[#2a3548] lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-400" />
              Usage Trends (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={usageTrends}>
                <defs>
                  <linearGradient id="colorExams" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorQuestions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                />
                <Legend />
                <Area type="monotone" dataKey="exams" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorExams)" name="Exams" />
                <Area type="monotone" dataKey="questionsUsed" stroke="#06b6d4" fillOpacity={1} fill="url(#colorQuestions)" name="Questions Used" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Engagement Questions */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <ThumbsDown className="h-4 w-4 text-amber-400" />
              Low Engagement Questions ({lowEngagementQuestions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {lowEngagementQuestions.map(q => (
                  <div key={q.id} className="p-3 rounded-lg bg-[#151d2e] border border-amber-500/20 hover:border-amber-500/40 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className="bg-violet-500/10 text-violet-400 text-[10px]">{q.framework}</Badge>
                      <Badge className="bg-amber-500/10 text-amber-400 text-[10px]">
                        {q.usage_count || 0} uses
                      </Badge>
                    </div>
                    <p className="text-xs text-white line-clamp-2">{q.question_text}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Progress value={(q.usage_count || 0) / avgUsage * 100} className="h-1 flex-1" />
                      <span className="text-[10px] text-slate-500">
                        {Math.round((q.usage_count || 0) / avgUsage * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
                {lowEngagementQuestions.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    All questions have good engagement! 🎉
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Questions Needing Review */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              Questions Needing Review ({questionsNeedingReview.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {questionsNeedingReview.map(q => (
                  <div key={q.id} className="p-3 rounded-lg bg-[#151d2e] border border-rose-500/20 hover:border-rose-500/40 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className="bg-violet-500/10 text-violet-400 text-[10px]">{q.framework}</Badge>
                      <div className="flex gap-1">
                        {!q.is_verified && (
                          <Badge className="bg-rose-500/10 text-rose-400 text-[10px]">Not Verified</Badge>
                        )}
                        {q.quality_rating && q.quality_rating < 3 && (
                          <Badge className="bg-amber-500/10 text-amber-400 text-[10px]">
                            {q.quality_rating}⭐
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-white line-clamp-2">{q.question_text}</p>
                  </div>
                ))}
                {questionsNeedingReview.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    All questions are verified and high quality! ✅
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Compliance Coverage */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-emerald-400" />
              Compliance Coverage ({complianceCoverage.length} Linked)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {complianceCoverage.map(comp => (
                  <div key={comp.id} className="p-3 rounded-lg bg-[#151d2e] border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className="bg-emerald-500/10 text-emerald-400 text-[10px]">{comp.framework}</Badge>
                      <Badge className="bg-violet-500/10 text-violet-400 text-[10px]">
                        {comp.questionCount} questions
                      </Badge>
                    </div>
                    <p className="text-xs text-white">{comp.requirement}</p>
                    <Progress value={Math.min((comp.questionCount / 10) * 100, 100)} className="h-1 mt-2" />
                  </div>
                ))}
                {complianceCoverage.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    No compliance links yet. Link questions to compliance requirements!
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Risk Coverage */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Shield className="h-4 w-4 text-rose-400" />
              Risk Coverage ({riskCoverage.length} Linked)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {riskCoverage.map(risk => (
                  <div key={risk.id} className="p-3 rounded-lg bg-[#151d2e] border border-rose-500/20 hover:border-rose-500/40 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={`text-[10px] capitalize ${
                        risk.riskLevel >= 12 ? 'bg-rose-500/10 text-rose-400' :
                        risk.riskLevel >= 6 ? 'bg-amber-500/10 text-amber-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {risk.category}
                      </Badge>
                      <Badge className="bg-violet-500/10 text-violet-400 text-[10px]">
                        {risk.questionCount} questions
                      </Badge>
                    </div>
                    <p className="text-xs text-white">{risk.title}</p>
                    <Progress value={Math.min((risk.questionCount / 10) * 100, 100)} className="h-1 mt-2" />
                  </div>
                ))}
                {riskCoverage.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    No risk links yet. Link questions to risks!
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}