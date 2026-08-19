import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Award, TrendingUp, Target, Brain, Play, Plus, FileText, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function AdvancedExamDashboard({ onNavigate }) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newExam, setNewExam] = useState({
    exam_title: "",
    exam_type: "FFIEC",
    exam_date: "",
    status: "scheduled"
  });

  const queryClient = useQueryClient();

  const { data: exams = [] } = useQuery({
    queryKey: ['regulatory-exams'],
    queryFn: () => base44.entities.RegulatoryExam.list('-exam_date', 100),
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ['user-progress'],
    queryFn: () => base44.entities.UserProgress.list('-updated_date', 100),
  });

  const createExamMutation = useMutation({
    mutationFn: (data) => base44.entities.RegulatoryExam.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regulatory-exams'] });
      setCreateDialogOpen(false);
      setNewExam({ exam_title: "", exam_type: "FFIEC", exam_date: "", status: "scheduled" });
      toast.success("Exam scheduled successfully");
    }
  });

  const completedExams = exams.filter(e => e.status === 'completed');
  const scheduledExams = exams.filter(e => e.status === 'scheduled');
  const avgScore = completedExams.length > 0 && !isNaN(completedExams.reduce((sum, e) => sum + (e.readiness_score || 0), 0) / completedExams.length)
    ? Math.round(completedExams.reduce((sum, e) => sum + (e.readiness_score || 0), 0) / completedExams.length)
    : 0;

  const totalQuestions = userProgress.length;
  const correctAnswers = userProgress.filter(p => p.correct).length;
  const accuracy = totalQuestions > 0 && !isNaN(correctAnswers / totalQuestions) ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  // Performance data
  const performanceData = completedExams.slice(-6).map(exam => ({
    date: exam.completion_date ? format(new Date(exam.completion_date), 'MMM d') : 'N/A',
    score: exam.readiness_score || 0
  }));

  // Category performance
  const categoryPerformance = {};
  userProgress.forEach(p => {
    if (!categoryPerformance[p.category]) {
      categoryPerformance[p.category] = { correct: 0, total: 0 };
    }
    categoryPerformance[p.category].total++;
    if (p.correct) categoryPerformance[p.category].correct++;
  });

  const categoryData = Object.entries(categoryPerformance)
    .map(([category, stats]) => ({
      category: category.length > 20 ? category.substring(0, 20) + '...' : category,
      accuracy: stats.total > 0 && !isNaN(stats.correct / stats.total) ? Math.round((stats.correct / stats.total) * 100) : 0
    }))
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-violet-500/20">
                <Award className="h-5 w-5 text-violet-400" />
              </div>
              <Badge className="text-xs bg-violet-500/20 text-violet-400">Total</Badge>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{exams.length}</div>
            <div className="text-sm text-slate-400">Exams</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <Badge className="text-xs bg-emerald-500/20 text-emerald-400">Avg</Badge>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{avgScore}%</div>
            <div className="text-sm text-slate-400">Score</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Target className="h-5 w-5 text-blue-400" />
              </div>
              <Badge className="text-xs bg-blue-500/20 text-blue-400">Rate</Badge>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{accuracy}%</div>
            <div className="text-sm text-slate-400">Accuracy</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Calendar className="h-5 w-5 text-amber-400" />
              </div>
              <Badge className="text-xs bg-amber-500/20 text-amber-400">Upcoming</Badge>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{scheduledExams.length}</div>
            <div className="text-sm text-slate-400">Scheduled</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Performance Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {performanceData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">
                No completed exams yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#scoreGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="h-4 w-4 text-blue-400" />
              Category Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">
                No practice data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                  <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[0, 100]} />
                  <YAxis dataKey="category" type="category" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 9 }} width={100} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                  />
                  <Bar dataKey="accuracy" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Button
          onClick={() => onNavigate?.('simulation')}
          className="h-auto flex-col gap-2 p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 hover:bg-orange-500/20"
        >
          <Play className="h-6 w-6 text-orange-400" />
          <span className="text-xs text-white">Start Simulation</span>
        </Button>

        <Button
          onClick={() => onNavigate?.('builder')}
          className="h-auto flex-col gap-2 p-4 bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 hover:bg-violet-500/20"
        >
          <Brain className="h-6 w-6 text-violet-400" />
          <span className="text-xs text-white">Build Exam</span>
        </Button>

        <Button
          onClick={() => onNavigate?.('analytics')}
          className="h-auto flex-col gap-2 p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 hover:bg-blue-500/20"
        >
          <TrendingUp className="h-6 w-6 text-blue-400" />
          <span className="text-xs text-white">Analytics</span>
        </Button>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-auto flex-col gap-2 p-4 bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 hover:bg-emerald-500/20">
              <Plus className="h-6 w-6 text-emerald-400" />
              <span className="text-xs text-white">Schedule Exam</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1a2332] border-[#2a3548]">
            <DialogHeader>
              <DialogTitle className="text-white">Schedule New Exam</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-white">Exam Title</Label>
                <Input
                  value={newExam.exam_title}
                  onChange={(e) => setNewExam({...newExam, exam_title: e.target.value})}
                  placeholder="e.g., FFIEC Cybersecurity Assessment 2025"
                  className="bg-[#0f1623] border-[#2a3548] text-white"
                />
              </div>
              <div>
                <Label className="text-white">Exam Type</Label>
                <Select value={newExam.exam_type} onValueChange={(v) => setNewExam({...newExam, exam_type: v})}>
                  <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="FFIEC">FFIEC</SelectItem>
                    <SelectItem value="SOX">SOX</SelectItem>
                    <SelectItem value="SOC2">SOC 2</SelectItem>
                    <SelectItem value="ISO27001">ISO 27001</SelectItem>
                    <SelectItem value="NIST">NIST CSF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white">Exam Date</Label>
                <Input
                  type="date"
                  value={newExam.exam_date}
                  onChange={(e) => setNewExam({...newExam, exam_date: e.target.value})}
                  className="bg-[#0f1623] border-[#2a3548] text-white"
                />
              </div>
              <Button
                onClick={() => createExamMutation.mutate(newExam)}
                disabled={!newExam.exam_title || !newExam.exam_date || createExamMutation.isPending}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Exam
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Recent Exams */}
      {exams.length > 0 && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-400" />
              Recent & Upcoming Exams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {exams.slice(0, 5).map(exam => (
                <div key={exam.id} className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-white">{exam.exam_title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="text-xs">{exam.exam_type}</Badge>
                        <Badge variant="outline" className="text-xs">{exam.status}</Badge>
                        {exam.exam_date && (
                          <span className="text-xs text-slate-400">
                            {format(new Date(exam.exam_date), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                    {exam.readiness_score && (
                      <Badge className={`${
                        exam.readiness_score >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                        exam.readiness_score >= 60 ? 'bg-amber-500/20 text-amber-400' :
                        'bg-rose-500/20 text-rose-400'
                      }`}>
                        {exam.readiness_score}%
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}