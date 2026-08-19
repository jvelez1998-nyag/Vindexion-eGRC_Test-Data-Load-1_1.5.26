import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, CheckCircle2, AlertCircle, Brain, Loader2, Sparkles, BarChart3, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { base44 } from "@/api/base44Client";
import DrillDownModal from "@/components/ui/drill-down-modal";

export default function CompactComplianceFramework({ compliance, onFrameworkClick }) {
  const [aiSummary, setAiSummary] = useState(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [visualMode, setVisualMode] = useState("list"); // list, pie, bar, radar
  const [drillDown, setDrillDown] = useState({ open: false, title: '', data: null, type: '' });

  const frameworks = Array.isArray(compliance) ? [...new Set(compliance.filter(c => c).map(c => c.framework).filter(Boolean))] : [];
  
  const getFrameworkStats = (framework) => {
    const items = Array.isArray(compliance) ? compliance.filter(c => c && c.framework === framework) : [];
    const compliant = items.filter(c => c && (c.status === 'implemented' || c.status === 'verified')).length;
    const inProgress = items.filter(c => c && c.status === 'in_progress').length;
    const notStarted = items.filter(c => c && c.status === 'not_started').length;
    const percentage = items.length > 0 ? Math.round((compliant / items.length) * 100) : 0;
    return { total: items.length, compliant, inProgress, notStarted, percentage };
  };

  const totalCompliant = Array.isArray(compliance) ? compliance.filter(c => c && (c.status === 'implemented' || c.status === 'verified')).length : 0;
  const overallRate = Array.isArray(compliance) && compliance.length > 0 ? Math.round((totalCompliant / compliance.length) * 100) : 0;

  // Status breakdown for pie chart
  const statusData = [
    { name: 'Verified', value: Array.isArray(compliance) ? compliance.filter(c => c && c.status === 'verified').length : 0, color: '#10b981' },
    { name: 'Implemented', value: Array.isArray(compliance) ? compliance.filter(c => c && c.status === 'implemented').length : 0, color: '#3b82f6' },
    { name: 'In Progress', value: Array.isArray(compliance) ? compliance.filter(c => c && c.status === 'in_progress').length : 0, color: '#f59e0b' },
    { name: 'Not Started', value: Array.isArray(compliance) ? compliance.filter(c => c && c.status === 'not_started').length : 0, color: '#ef4444' },
    { name: 'Non-Compliant', value: Array.isArray(compliance) ? compliance.filter(c => c && c.status === 'non_compliant').length : 0, color: '#dc2626' }
  ].filter(d => d.value > 0);

  // Framework breakdown for bar/radar charts
  const frameworkData = frameworks.map(framework => {
    const stats = getFrameworkStats(framework);
    return {
      framework: framework.length > 20 ? framework.substring(0, 17) + '...' : framework,
      fullName: framework,
      compliance: stats.percentage,
      verified: stats.compliant,
      inProgress: stats.inProgress,
      notStarted: stats.notStarted,
      total: stats.total
    };
  });

  const generateAISummary = async () => {
    setGeneratingSummary(true);
    try {
      const frameworkStats = frameworks.map(f => {
        const stats = getFrameworkStats(f);
        return `${f}: ${stats.percentage}% (${stats.compliant}/${stats.total} compliant, ${stats.inProgress} in progress)`;
      }).join('\n');

      const highPerforming = frameworks.filter(f => getFrameworkStats(f).percentage >= 80);
      const needsAttention = frameworks.filter(f => getFrameworkStats(f).percentage < 60);

      const prompt = `Analyze this compliance data and provide a concise executive summary:

OVERALL METRICS:
- Total Requirements: ${compliance.length}
- Compliant: ${totalCompliant} (${overallRate}%)
- Frameworks Tracked: ${frameworks.length}

FRAMEWORK PERFORMANCE:
${frameworkStats}

STATUS BREAKDOWN:
- Verified: ${Array.isArray(compliance) ? compliance.filter(c => c && c.status === 'verified').length : 0}
- Implemented: ${Array.isArray(compliance) ? compliance.filter(c => c && c.status === 'implemented').length : 0}
- In Progress: ${Array.isArray(compliance) ? compliance.filter(c => c && c.status === 'in_progress').length : 0}
- Not Started: ${Array.isArray(compliance) ? compliance.filter(c => c && c.status === 'not_started').length : 0}
- Non-Compliant: ${Array.isArray(compliance) ? compliance.filter(c => c && c.status === 'non_compliant').length : 0}

High Performing Frameworks: ${highPerforming.join(', ') || 'None'}
Needs Attention: ${needsAttention.join(', ') || 'None'}

Provide a 2-3 sentence executive summary highlighting:
1. Overall compliance posture (strong/moderate/at-risk)
2. Key achievements or gaps
3. Priority actions needed

Be direct, actionable, and data-driven.`;

      const summary = await base44.integrations.Core.InvokeLLM({ prompt });
      setAiSummary(summary);
    } catch (error) {
      console.error(error);
      setAiSummary("Unable to generate AI summary at this time.");
    } finally {
      setGeneratingSummary(false);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a2332] border border-[#2a3548] rounded-lg px-3 py-2 shadow-xl">
          <p className="text-xs text-white font-medium">{payload[0].name}</p>
          <p className="text-xs text-slate-400">{payload[0].value} requirements</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader className="pb-3 px-3 sm:px-6">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400 flex-shrink-0" />
              <span className="truncate">Compliance Performance</span>
            </CardTitle>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1 hidden sm:block">Real-time compliance status across regulatory frameworks and standards</p>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 bg-[#151d2e] border border-[#2a3548] rounded-lg p-0.5 sm:p-1 flex-shrink-0 overflow-x-auto scrollbar-thin">
            <Button
              size="sm"
              onClick={() => setVisualMode("list")}
              className={`h-5 sm:h-6 px-1.5 sm:px-2 text-xs flex-shrink-0 ${
                visualMode === "list" 
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700" 
                  : "bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500"
              }`}
            >
              <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </Button>
            <Button
              size="sm"
              onClick={() => setVisualMode("pie")}
              className={`h-5 sm:h-6 px-1.5 sm:px-2 text-xs flex-shrink-0 ${
                visualMode === "pie" 
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700" 
                  : "bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500"
              }`}
            >
              <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </Button>
            <Button
              size="sm"
              onClick={() => setVisualMode("bar")}
              className={`h-5 sm:h-6 px-1.5 sm:px-2 text-xs flex-shrink-0 ${
                visualMode === "bar" 
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700" 
                  : "bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500"
              }`}
            >
              <BarChart3 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </Button>
            <Button
              size="sm"
              onClick={() => setVisualMode("radar")}
              className={`h-5 sm:h-6 px-1.5 sm:px-2 text-xs flex-shrink-0 ${
                visualMode === "radar" 
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700" 
                  : "bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500"
              }`}
            >
              <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="space-y-2 sm:space-y-3">
          {/* Overall Compliance */}
          <div 
            className="p-2 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-lg cursor-pointer hover:bg-emerald-500/15 transition-colors"
            onClick={() => setDrillDown({ open: true, title: 'All Compliance Requirements', data: compliance, type: 'compliance' })}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-white font-medium">Overall Compliance</span>
              <span className="text-base font-bold text-emerald-400">{overallRate}%</span>
            </div>
            <Progress value={overallRate} className="h-1.5 [&>div]:bg-emerald-500" />
            <p className="text-[10px] text-slate-400 mt-1">{totalCompliant} of {compliance.length} requirements</p>
          </div>

          {/* AI Summary */}
          <div className="p-3 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-semibold text-indigo-400">AI Executive Summary</span>
              </div>
              {!aiSummary && (
                <Button
                  size="sm"
                  onClick={generateAISummary}
                  disabled={generatingSummary}
                  className="h-6 text-xs bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  {generatingSummary ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3 mr-1" />
                      Generate
                    </>
                  )}
                </Button>
              )}
            </div>
            {aiSummary ? (
              <p className="text-xs text-slate-300 leading-relaxed">{aiSummary}</p>
            ) : (
              <p className="text-xs text-slate-500 italic">Click "Generate" for AI-powered insights on your compliance posture</p>
            )}
          </div>

          {/* Visualizations */}
          {visualMode === "list" && (
            <div className="space-y-1">
              {frameworks.slice(0, 5).map((framework, idx) => {
                const stats = getFrameworkStats(framework);
                return (
                  <div 
                    key={idx} 
                    className="p-2 rounded-lg bg-[#0f1623] border border-[#2a3548] hover:bg-[#151d2e] transition-colors cursor-pointer"
                    onClick={() => onFrameworkClick?.(framework)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white font-medium">{framework}</span>
                      <Badge className={`text-[10px] ${
                        stats.percentage >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                        stats.percentage >= 60 ? 'bg-amber-500/20 text-amber-400' :
                        'bg-rose-500/20 text-rose-400'
                      }`}>
                        {stats.percentage}%
                      </Badge>
                    </div>
                    <Progress value={stats.percentage} className="h-1" />
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-slate-400">{stats.compliant}/{stats.total}</span>
                      <span className="text-[10px] text-slate-500">{stats.inProgress} in progress</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {visualMode === "pie" && statusData.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="h-44 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {statusData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-slate-400">{item.name}</span>
                    </div>
                    <span className="text-xs font-bold text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {visualMode === "bar" && frameworkData.length > 0 && (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={frameworkData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                  <XAxis 
                    dataKey="framework" 
                    tick={{ fill: '#94a3b8', fontSize: 9 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a2332', 
                      border: '1px solid #2a3548',
                      borderRadius: '8px',
                      fontSize: '11px'
                    }}
                    formatter={(value, name) => {
                      if (name === 'compliance') return [`${value}%`, 'Compliance'];
                      return [value, name];
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} iconSize={8} />
                  <Bar dataKey="verified" fill="#10b981" name="Verified" stackId="a" />
                  <Bar dataKey="inProgress" fill="#f59e0b" name="In Progress" stackId="a" />
                  <Bar dataKey="notStarted" fill="#ef4444" name="Not Started" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {visualMode === "radar" && frameworkData.length > 0 && (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={frameworkData.slice(0, 8)}>
                  <PolarGrid stroke="#2a3548" />
                  <PolarAngleAxis 
                    dataKey="framework" 
                    tick={{ fill: '#94a3b8', fontSize: 9 }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]}
                    tick={{ fill: '#94a3b8', fontSize: 9 }}
                  />
                  <Radar 
                    name="Compliance %" 
                    dataKey="compliance" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.4} 
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} iconSize={8} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a2332', 
                      border: '1px solid #2a3548',
                      borderRadius: '8px',
                      fontSize: '11px'
                    }}
                    formatter={(value) => [`${value}%`, 'Compliance']}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>

      <DrillDownModal 
        open={drillDown.open}
        onClose={() => setDrillDown({ open: false, title: '', data: null, type: '' })}
        title={drillDown.title}
        data={drillDown.data}
        type={drillDown.type}
      />
    </Card>
  );
}