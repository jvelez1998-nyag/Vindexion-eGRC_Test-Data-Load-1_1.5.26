import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Award, 
  Clock, 
  CheckCircle2,
  BarChart3,
  Target,
  AlertCircle,
  Brain,
  TrendingDown,
  Trash2,
  MoreVertical
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function ExamProgressDashboard({ exams, onDeleteExam }) {
  const completedExams = exams.filter(e => e.status === 'completed' || e.status === 'passed' || e.status === 'failed');
  const passedExams = exams.filter(e => e.status === 'passed');
  const inProgressExams = exams.filter(e => e.status === 'in_progress' || e.status === 'paused');

  const avgScore = completedExams.length > 0 
    ? Math.round(completedExams.reduce((sum, e) => sum + (e.score_percentage || 0), 0) / completedExams.length)
    : 0;

  const totalTime = exams.reduce((sum, e) => sum + (e.time_spent_minutes || 0), 0);

  // Performance trends over time
  const performanceTrend = completedExams
    .sort((a, b) => new Date(a.completion_date) - new Date(b.completion_date))
    .map((exam, idx) => ({
      exam: `Exam ${idx + 1}`,
      score: exam.score_percentage || 0,
      date: format(new Date(exam.completion_date), 'MMM d'),
      framework: exam.framework
    }));

  // Calculate improvement trend
  const improvementRate = performanceTrend.length >= 2
    ? ((performanceTrend[performanceTrend.length - 1].score - performanceTrend[0].score) / performanceTrend.length).toFixed(1)
    : 0;

  // Framework statistics
  const frameworkStats = {};
  completedExams.forEach(exam => {
    if (!frameworkStats[exam.framework]) {
      frameworkStats[exam.framework] = { total: 0, passed: 0, avgScore: 0, totalScore: 0 };
    }
    frameworkStats[exam.framework].total++;
    if (exam.status === 'passed') frameworkStats[exam.framework].passed++;
    frameworkStats[exam.framework].totalScore += exam.score_percentage || 0;
  });

  Object.keys(frameworkStats).forEach(fw => {
    frameworkStats[fw].avgScore = Math.round(frameworkStats[fw].totalScore / frameworkStats[fw].total);
    frameworkStats[fw].passRate = Math.round((frameworkStats[fw].passed / frameworkStats[fw].total) * 100);
  });

  // Common incorrect answers analysis
  const incorrectAnswersMap = {};
  const frameworkWeakAreas = {};

  completedExams.forEach(exam => {
    if (!exam.responses) return;

    exam.responses.forEach(resp => {
      if (!resp.is_correct) {
        const key = resp.reference || 'Unknown Area';
        
        if (!incorrectAnswersMap[key]) {
          incorrectAnswersMap[key] = {
            area: key,
            count: 0,
            questions: new Set(),
            frameworks: new Set(),
            avgRiskLevel: []
          };
        }
        
        incorrectAnswersMap[key].count++;
        incorrectAnswersMap[key].questions.add(resp.question);
        incorrectAnswersMap[key].frameworks.add(exam.framework);
        
        if (resp.risk_level) {
          incorrectAnswersMap[key].avgRiskLevel.push(resp.risk_level);
        }

        // Framework-specific weak areas
        if (!frameworkWeakAreas[exam.framework]) {
          frameworkWeakAreas[exam.framework] = {};
        }
        if (!frameworkWeakAreas[exam.framework][key]) {
          frameworkWeakAreas[exam.framework][key] = 0;
        }
        frameworkWeakAreas[exam.framework][key]++;
      }
    });
  });

  const commonIncorrectAreas = Object.values(incorrectAnswersMap)
    .map(area => ({
      ...area,
      frameworks: Array.from(area.frameworks),
      uniqueQuestions: area.questions.size,
      dominantRisk: area.avgRiskLevel.length > 0 
        ? area.avgRiskLevel.sort((a, b) => 
            area.avgRiskLevel.filter(v => v === b).length - 
            area.avgRiskLevel.filter(v => v === a).length
          )[0]
        : 'medium'
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Prepare chart data for framework weak areas
  const frameworkWeakAreasChart = Object.entries(frameworkWeakAreas).map(([framework, areas]) => {
    const sortedAreas = Object.entries(areas)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    return {
      framework,
      weakAreas: sortedAreas.map(([area, count]) => ({ area, count }))
    };
  });

  const COLORS = ['#ef4444', '#f59e0b', '#eab308', '#3b82f6', '#8b5cf6', '#ec4899'];
  const riskColors = {
    critical: '#ef4444',
    high: '#f59e0b',
    medium: '#eab308',
    low: '#3b82f6'
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#1a2332] border-[#2a3548] p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10">
              <BarChart3 className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{completedExams.length}</div>
              <div className="text-xs text-slate-500">Completed Exams</div>
            </div>
          </div>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548] p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Award className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{passedExams.length}</div>
              <div className="text-xs text-slate-500">Passed Exams</div>
            </div>
          </div>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548] p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <TrendingUp className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{avgScore}%</div>
              <div className="text-xs text-slate-500">Average Score</div>
            </div>
          </div>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548] p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{totalTime}</div>
              <div className="text-xs text-slate-500">Total Minutes</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Trends */}
      {completedExams.length >= 2 && (
        <Card className="bg-[#1a2332] border-[#2a3548] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
              Performance Trends Over Time
            </h3>
            <div className="flex items-center gap-2">
              {parseFloat(improvementRate) > 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              ) : parseFloat(improvementRate) < 0 ? (
                <TrendingDown className="h-4 w-4 text-rose-400" />
              ) : null}
              <span className={`text-sm font-semibold ${
                parseFloat(improvementRate) > 0 ? 'text-emerald-400' : 
                parseFloat(improvementRate) < 0 ? 'text-rose-400' : 'text-slate-400'
              }`}>
                {improvementRate > 0 ? '+' : ''}{improvementRate}% per exam
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
              <XAxis dataKey="exam" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#6366f1" 
                strokeWidth={3}
                dot={{ fill: '#6366f1', r: 5 }}
                activeDot={{ r: 7 }}
                name="Score (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Common Incorrect Areas */}
      {commonIncorrectAreas.length > 0 && (
        <Card className="bg-[#1a2332] border-[#2a3548] p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-rose-400" />
            Most Challenging Areas
          </h3>
          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={commonIncorrectAreas.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                  <XAxis dataKey="area" stroke="#94a3b8" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Bar dataKey="count" fill="#ef4444" name="Incorrect Answers" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {commonIncorrectAreas.slice(0, 5).map((area, idx) => (
                <div key={idx} className="p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-white text-sm">{area.area}</h4>
                    <Badge className={`${
                      area.dominantRisk === 'critical' ? 'bg-rose-500/10 text-rose-400' :
                      area.dominantRisk === 'high' ? 'bg-orange-500/10 text-orange-400' :
                      area.dominantRisk === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-blue-500/10 text-blue-400'
                    } text-xs`}>
                      {area.dominantRisk} risk
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>{area.count} incorrect</span>
                    <span>{area.uniqueQuestions} unique questions</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {area.frameworks.map((fw, i) => (
                      <Badge key={i} className="bg-indigo-500/10 text-indigo-400 text-xs">
                        {fw}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Framework-Specific Weak Areas */}
      {frameworkWeakAreasChart.length > 0 && (
        <Card className="bg-[#1a2332] border-[#2a3548] p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Brain className="h-5 w-5 text-violet-400" />
            Struggle Areas by Framework
          </h3>
          <div className="space-y-6">
            {frameworkWeakAreasChart.map((fwData, idx) => (
              <div key={idx}>
                <div className="flex items-center gap-3 mb-3">
                  <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                    {fwData.framework}
                  </Badge>
                  <span className="text-sm text-slate-500">Top 5 Weak Areas</span>
                </div>
                <div className="grid gap-2">
                  {fwData.weakAreas.map((area, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-slate-300">{area.area}</span>
                          <span className="text-xs text-slate-500">{area.count} errors</span>
                        </div>
                        <Progress 
                          value={(area.count / Math.max(...fwData.weakAreas.map(a => a.count))) * 100} 
                          className="h-1.5" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Framework Performance */}
      <Card className="bg-[#1a2332] border-[#2a3548] p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-indigo-400" />
          Framework Performance
        </h3>
        <div className="space-y-4">
          {Object.keys(frameworkStats).length === 0 ? (
            <p className="text-slate-500 text-center py-4">No completed exams yet</p>
          ) : (
            Object.entries(frameworkStats).map(([framework, stats]) => (
              <div key={framework} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                      {framework}
                    </Badge>
                    <span className="text-sm text-slate-400">
                      {stats.total} exam{stats.total !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-400">
                      Pass Rate: <span className="text-emerald-400 font-semibold">{stats.passRate}%</span>
                    </span>
                    <span className="text-slate-400">
                      Avg Score: <span className="text-white font-semibold">{stats.avgScore}%</span>
                    </span>
                  </div>
                </div>
                <Progress value={stats.avgScore} className="h-2" />
              </div>
            ))
          )}
        </div>
      </Card>

      {/* In Progress Exams */}
      {inProgressExams.length > 0 && (
        <Card className="bg-[#1a2332] border-[#2a3548] p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-400" />
            In Progress ({inProgressExams.length})
          </h3>
          <div className="space-y-3">
            {inProgressExams.map(exam => (
              <div key={exam.id} className="flex items-center justify-between p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs">
                      {exam.framework}
                    </Badge>
                    <span className="text-white font-medium text-sm">{exam.exam_type?.replace(/_/g, ' ')}</span>
                    {exam.status === 'paused' && (
                      <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">
                        Paused
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>{exam.questions_answered || 0} / {exam.total_questions} answered</span>
                    <span>Started {format(new Date(exam.start_date), 'MMM d')}</span>
                  </div>
                  <Progress 
                    value={exam.total_questions ? (exam.questions_answered / exam.total_questions) * 100 : 0} 
                    className="h-1 mt-2" 
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Completed Exams */}
      <Card className="bg-[#1a2332] border-[#2a3548] p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          Recent Results
        </h3>
        <div className="space-y-3">
          {completedExams.length === 0 ? (
            <p className="text-slate-500 text-center py-4">No completed exams yet</p>
          ) : (
            completedExams.slice(0, 5).map(exam => (
              <div key={exam.id} className="flex items-center justify-between p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs">
                      {exam.framework}
                    </Badge>
                    <span className="text-white font-medium text-sm">{exam.exam_type?.replace(/_/g, ' ')}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {format(new Date(exam.completion_date), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className={`text-xl font-bold ${exam.status === 'passed' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {exam.score_percentage}%
                    </div>
                    <Badge className={`text-xs ${exam.status === 'passed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {exam.status}
                    </Badge>
                  </div>
                  {onDeleteExam && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-white hover:bg-[#2a3548]">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#1a2332] border-[#2a3548]">
                        <DropdownMenuItem onClick={() => onDeleteExam(exam)} className="text-rose-400 hover:bg-rose-500/10">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}