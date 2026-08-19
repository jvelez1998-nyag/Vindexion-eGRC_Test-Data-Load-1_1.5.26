import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";
import { FileQuestion, CheckCircle2, Star, Layers, TrendingUp, Sparkles, Target, Brain, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function QuestionBankDashboard({ questions, isLoading, onAddNew, onQuestionClick }) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-32 bg-[#1a2332]" />)}
      </div>
    );
  }

  const totalQuestions = questions.length;
  const approvedQuestions = questions.filter(q => q.status === 'approved' || q.is_verified).length;
  const uniqueFrameworks = new Set(questions.map(q => q.framework)).size;
  const avgQuality = questions.length > 0 
    ? (questions.reduce((sum, q) => sum + (q.quality_rating || 3), 0) / questions.length).toFixed(1)
    : 0;

  // Framework distribution
  const frameworkData = Object.entries(
    questions.reduce((acc, q) => {
      acc[q.framework] = (acc[q.framework] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value, fill: `hsl(${Math.random() * 360}, 70%, 50%)` }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // Difficulty distribution
  const difficultyData = [
    { name: 'Beginner', value: questions.filter(q => q.difficulty === 'beginner').length, color: '#10b981' },
    { name: 'Intermediate', value: questions.filter(q => q.difficulty === 'intermediate').length, color: '#f59e0b' },
    { name: 'Advanced', value: questions.filter(q => q.difficulty === 'advanced').length, color: '#ef4444' }
  ].filter(d => d.value > 0);

  // Module distribution
  const moduleData = Object.entries(
    questions.reduce((acc, q) => {
      const module = q.source_module || 'General';
      acc[module] = (acc[module] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ module: name, count: value }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Quality radar
  const qualityRadar = [
    { category: 'Accuracy', value: questions.length > 0 ? (questions.filter(q => q.is_verified).length / questions.length) * 100 : 0 },
    { category: 'Coverage', value: (uniqueFrameworks / 15) * 100 },
    { category: 'Difficulty Mix', value: Math.min((difficultyData.length / 3) * 100, 100) },
    { category: 'Usage', value: questions.length > 0 ? Math.min((questions.reduce((sum, q) => sum + (q.usage_count || 0), 0) / questions.length / 10) * 100, 100) : 0 },
    { category: 'Avg Quality', value: (avgQuality / 5) * 100 }
  ];

  // Top performing questions
  const topQuestions = [...questions]
    .filter(q => q.usage_count && q.usage_count > 0)
    .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20 hover:scale-[1.02] transition-all cursor-pointer">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-violet-500/20 border border-violet-500/30 shadow-lg shadow-violet-500/10">
                <FileQuestion className="h-5 w-5 text-violet-400" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{totalQuestions}</div>
                <Badge className="mt-1 bg-violet-500/20 text-violet-400 text-[9px]">
                  Total Bank
                </Badge>
              </div>
            </div>
            <div className="text-sm font-semibold text-white">Questions</div>
            <div className="text-xs text-violet-400 mt-1">{approvedQuestions} verified</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20 hover:scale-[1.02] transition-all cursor-pointer">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{Math.round((approvedQuestions/totalQuestions)*100)}%</div>
                <Badge className="mt-1 bg-emerald-500/20 text-emerald-400 text-[9px]">
                  Quality Rate
                </Badge>
              </div>
            </div>
            <div className="text-sm font-semibold text-white">Verified</div>
            <div className="text-xs text-emerald-400 mt-1">{approvedQuestions} approved</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 hover:scale-[1.02] transition-all cursor-pointer">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 shadow-lg shadow-amber-500/10">
                <Star className="h-5 w-5 text-amber-400" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{avgQuality}</div>
                <Badge className="mt-1 bg-amber-500/20 text-amber-400 text-[9px]">
                  / 5.0
                </Badge>
              </div>
            </div>
            <div className="text-sm font-semibold text-white">Avg Quality</div>
            <div className="text-xs text-amber-400 mt-1">Rating score</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20 hover:scale-[1.02] transition-all cursor-pointer">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
                <Layers className="h-5 w-5 text-cyan-400" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{uniqueFrameworks}</div>
                <Badge className="mt-1 bg-cyan-500/20 text-cyan-400 text-[9px]">
                  Coverage
                </Badge>
              </div>
            </div>
            <div className="text-sm font-semibold text-white">Frameworks</div>
            <div className="text-xs text-cyan-400 mt-1">Standards covered</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Framework Distribution */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Target className="h-4 w-4 text-violet-400" />
              Questions by Framework
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={frameworkData}>
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
                <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Difficulty Mix */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-400" />
              Difficulty Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={difficultyData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={true}
                >
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Module Coverage */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              Questions by Module
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={moduleData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <YAxis 
                  dataKey="module" 
                  type="category" 
                  stroke="#94a3b8" 
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  width={100}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quality Radar */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Brain className="h-4 w-4 text-indigo-400" />
              Quality Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={qualityRadar}>
                <PolarGrid stroke="#2a3548" />
                <PolarAngleAxis dataKey="category" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <Radar name="Quality Score" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Questions */}
      {topQuestions.length > 0 && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Top Performing Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topQuestions.map((question, idx) => (
                <div 
                  key={question.id}
                  onClick={() => onQuestionClick(question)}
                  className="flex items-center justify-between p-4 rounded-lg bg-[#151d2e] border border-[#2a3548] hover:border-emerald-500/30 cursor-pointer transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-bold text-emerald-400">#{idx + 1}</span>
                      <Badge className="bg-violet-500/10 text-violet-400 text-[10px]">
                        {question.framework}
                      </Badge>
                    </div>
                    <h4 className="text-sm text-white line-clamp-1">{question.question_text}</h4>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <div className="text-right">
                      <div className="text-xl font-bold text-white">{question.usage_count}</div>
                      <div className="text-[10px] text-slate-500">uses</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-semibold text-white">{question.quality_rating || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 cursor-pointer hover:scale-[1.02] transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-indigo-500/20">
                <Sparkles className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">AI Generator</h3>
                <p className="text-xs text-slate-400">Generate questions with AI</p>
              </div>
            </div>
            <Button 
              onClick={onAddNew}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              Generate Now
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20 cursor-pointer hover:scale-[1.02] transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-emerald-500/20">
                <Zap className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Bulk Import</h3>
                <p className="text-xs text-slate-400">Import from other modules</p>
              </div>
            </div>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
              Import Questions
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 cursor-pointer hover:scale-[1.02] transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-amber-500/20">
                <Target className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Quality Check</h3>
                <p className="text-xs text-slate-400">Review unverified questions</p>
              </div>
            </div>
            <Button className="w-full bg-amber-600 hover:bg-amber-700">
              Review Now
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}