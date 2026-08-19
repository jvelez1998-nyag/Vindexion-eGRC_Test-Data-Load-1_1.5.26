import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Calendar, Target, AlertTriangle, CheckCircle2, TrendingUp, BarChart3 } from "lucide-react";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

export default function RegExamStats() {
  const [viewMode, setViewMode] = useState('list'); // list, pie, radar

  const { data: exams = [] } = useQuery({
    queryKey: ['regulatory-exams'],
    queryFn: async () => {
      const data = await base44.entities.RegulatoryExam.list('-exam_date', 20);
      return data || [];
    },
    staleTime: 120000,
    refetchOnWindowFocus: false
  });

  const safeExams = Array.isArray(exams) ? exams.filter(e => e) : [];

  const upcomingExams = safeExams.filter(e => e.status === 'scheduled' || e.status === 'in_preparation');
  const inProgress = safeExams.filter(e => e.status === 'in_progress').length;
  const completed = safeExams.filter(e => e.status === 'completed').length;
  const avgReadiness = safeExams.length > 0 
    ? Math.round(safeExams.reduce((sum, e) => sum + (e.readiness_score || 0), 0) / safeExams.length)
    : 0;

  const getReadinessColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  // Chart data
  const pieData = [
    { name: 'Upcoming', value: upcomingExams.length, color: '#8b5cf6' },
    { name: 'Active', value: inProgress, color: '#3b82f6' },
    { name: 'Complete', value: completed, color: '#10b981' }
  ].filter(item => item.value > 0);

  const radarData = [
    { category: 'Readiness', score: avgReadiness, fullMark: 100 },
    { category: 'Coverage', score: 85, fullMark: 100 },
    { category: 'Documentation', score: 78, fullMark: 100 },
    { category: 'Training', score: 82, fullMark: 100 },
    { category: 'Resources', score: 75, fullMark: 100 }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f1623] border border-[#2a3548] rounded-lg p-2 shadow-lg">
          <p className="text-xs text-white font-semibold">{payload[0].name || payload[0].payload?.category}</p>
          <p className="text-xs text-slate-400">{payload[0].value}{payload[0].payload?.category ? '%' : ' exams'}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-violet-400" />
          Regulatory Exam Status
        </CardTitle>
        <p className="text-xs text-slate-500 mt-1">FFIEC, OCC, FRB, NCUA assessments</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-lg p-2 text-center">
              <div className="text-base font-bold text-white">{upcomingExams.length}</div>
              <div className="text-[10px] text-slate-400">Upcoming</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-2 text-center">
              <div className="text-base font-bold text-white">{inProgress}</div>
              <div className="text-[10px] text-slate-400">Active</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-lg p-2 text-center">
              <div className="text-base font-bold text-white">{completed}</div>
              <div className="text-[10px] text-slate-400">Complete</div>
            </div>
          </div>

          {/* View Mode Toggle */}
          {safeExams.length > 0 && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setViewMode('list')}
                className={`flex-1 h-7 text-xs ${
                  viewMode === 'list' 
                    ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400' 
                    : 'bg-[#0f1623] border-[#2a3548] text-slate-400 hover:bg-[#1a2332]'
                }`}
              >
                List
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setViewMode('pie')}
                className={`flex-1 h-7 text-xs ${
                  viewMode === 'pie' 
                    ? 'bg-purple-500/20 border-purple-500/40 text-purple-400' 
                    : 'bg-[#0f1623] border-[#2a3548] text-slate-400 hover:bg-[#1a2332]'
                }`}
              >
                <BarChart3 className="h-3 w-3 mr-1" />
                Chart
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setViewMode('radar')}
                className={`flex-1 h-7 text-xs ${
                  viewMode === 'radar' 
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                    : 'bg-[#0f1623] border-[#2a3548] text-slate-400 hover:bg-[#1a2332]'
                }`}
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                Analysis
              </Button>
            </div>
          )}

          {/* Conditional Views */}
          {viewMode === 'list' && (
            <>
              {/* Readiness Score */}
              <div className="p-2 bg-[#0f1623] rounded-lg border border-[#2a3548]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">Overall Readiness</span>
                  <span className={`text-sm font-bold ${getReadinessColor(avgReadiness)}`}>{avgReadiness}%</span>
                </div>
                <Progress 
                  value={avgReadiness} 
                  className={`h-1.5 ${
                    avgReadiness >= 80 ? '[&>div]:bg-emerald-500' :
                    avgReadiness >= 60 ? '[&>div]:bg-amber-500' :
                    '[&>div]:bg-rose-500'
                  }`}
                />
              </div>

              {/* Upcoming Exams */}
              {upcomingExams.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">Next Scheduled</p>
                  {upcomingExams.slice(0, 2).map((exam, idx) => {
                    const readiness = exam.readiness_score || 0;
                    const isReady = readiness >= 80;
                    
                    return (
                      <div key={idx} className="p-2 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white font-medium truncate">{exam.exam_title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className="bg-violet-500/20 text-violet-400 text-[10px]">
                                {exam.exam_type}
                              </Badge>
                              {exam.exam_date && (
                                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(exam.exam_date).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {isReady ? (
                              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <AlertTriangle className="h-3 w-3 text-amber-400" />
                            )}
                            <span className={`text-xs font-medium ${getReadinessColor(readiness)}`}>
                              {readiness}% ready
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500">{exam.workflow_stage || 'preparation'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Target className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No upcoming exams scheduled</p>
                </div>
              )}
            </>
          )}

          {viewMode === 'pie' && exams.length > 0 && (
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-[#2a3548] p-4">
              <ResponsiveContainer width="100%" height={200}>
                <RechartsPie>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </RechartsPie>
              </ResponsiveContainer>
              <div className="mt-2 flex justify-center gap-4">
                {pieData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-xs text-slate-400">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {viewMode === 'radar' && exams.length > 0 && (
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-[#2a3548] p-4">
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#2a3548" />
                  <PolarAngleAxis
                    dataKey="category"
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: "#64748b", fontSize: 9 }}
                  />
                  <Radar
                    name="Exam Preparation"
                    dataKey="score"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.5}
                    strokeWidth={2}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}