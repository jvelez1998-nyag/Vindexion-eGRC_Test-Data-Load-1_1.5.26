import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Button } from "@/components/ui/button";
import { Shield, Loader2, Sparkles, BarChart3, TrendingUp, CheckCircle2, Brain } from "lucide-react";
import { base44 } from "@/api/base44Client";
import DrillDownModal from "@/components/ui/drill-down-modal";
import { memo } from "react";

const ComplianceGauge = memo(function ComplianceGauge({ compliance, onSegmentClick }) {
  const [aiSummary, setAiSummary] = useState(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [visualMode, setVisualMode] = useState("gauge"); // gauge, pie, bar, radar
  const [drillDown, setDrillDown] = useState({ open: false, title: '', data: null, type: '' });

  const statusCounts = Array.isArray(compliance) ? compliance.reduce((acc, item) => {
    if (item && item.status) {
      acc[item.status] = (acc[item.status] || 0) + 1;
    }
    return acc;
  }, {}) : {};

  const total = Math.max((Array.isArray(compliance) ? compliance.length : 0), 1);
  const compliant = (statusCounts.implemented || 0) + (statusCounts.verified || 0);
  const percentage = isNaN(compliant / total) ? 0 : Math.round((compliant / total) * 100);

  const data = [
    { name: "Compliant", value: compliant, color: "#10b981" },
    { name: "In Progress", value: statusCounts.in_progress || 0, color: "#f59e0b" },
    { name: "Not Started", value: statusCounts.not_started || 0, color: "#475569" },
    { name: "Non-Compliant", value: statusCounts.non_compliant || 0, color: "#ef4444" }
  ].filter(d => d.value > 0);

  const getScoreColor = () => {
    if (percentage >= 80) return "text-emerald-400";
    if (percentage >= 60) return "text-amber-400";
    return "text-rose-400";
  };

  // Framework-based breakdown
  const frameworks = Array.isArray(compliance) ? [...new Set(compliance.filter(c => c).map(c => c.framework).filter(Boolean))] : [];
  const frameworkData = frameworks.map(framework => {
    const items = Array.isArray(compliance) ? compliance.filter(c => c && c.framework === framework) : [];
    const compliantCount = items.filter(c => c && (c.status === 'implemented' || c.status === 'verified')).length;
    const inProgressCount = items.filter(c => c && c.status === 'in_progress').length;
    const notStartedCount = items.filter(c => c && c.status === 'not_started').length;
    const nonCompliantCount = items.filter(c => c && c.status === 'non_compliant').length;
    const complianceRate = items.length > 0 && !isNaN(compliantCount / items.length) ? Math.round((compliantCount / items.length) * 100) : 0;
    
    return {
      framework: framework.length > 15 ? framework.substring(0, 12) + '...' : framework,
      fullName: framework,
      compliance: complianceRate,
      verified: compliantCount,
      inProgress: inProgressCount,
      notStarted: notStartedCount,
      nonCompliant: nonCompliantCount,
      total: items.length
    };
  });

  const generateAISummary = async () => {
    setGeneratingSummary(true);
    try {
      const frameworkStats = frameworkData.map(f => 
        `${f.fullName}: ${f.compliance}% (${f.verified}/${f.total} compliant, ${f.inProgress} in progress, ${f.notStarted} not started)`
      ).join('\n');

      const highPerforming = frameworkData.filter(f => f && f.compliance >= 80);
      const needsAttention = frameworkData.filter(f => f && f.compliance < 60);
      const atRisk = Array.isArray(compliance) ? compliance.filter(c => c && c.status === 'non_compliant') : [];

      const prompt = `Analyze this compliance data and provide a concise executive summary:

OVERALL METRICS:
- Total Requirements: ${compliance.length}
- Compliant: ${compliant} (${percentage}%)
- Frameworks: ${frameworks.length}
- Non-Compliant Items: ${atRisk.length}

STATUS BREAKDOWN:
- Verified: ${statusCounts.verified || 0}
- Implemented: ${statusCounts.implemented || 0}
- In Progress: ${statusCounts.in_progress || 0}
- Not Started: ${statusCounts.not_started || 0}
- Non-Compliant: ${statusCounts.non_compliant || 0}

FRAMEWORK PERFORMANCE:
${frameworkStats}

High Performers (≥80%): ${highPerforming.map(f => f.fullName).join(', ') || 'None'}
Needs Attention (<60%): ${needsAttention.map(f => f.fullName).join(', ') || 'None'}

Provide a 2-3 sentence executive summary highlighting:
1. Overall compliance posture and readiness
2. Strengths or critical gaps
3. Priority recommendations

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
    <Card className="bg-gradient-to-br from-[#1a2332] to-[#151d2e] border-[#2a3548] shadow-xl">
      <CardHeader className="pb-3 border-b border-[#2a3548]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
              <Shield className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-white">Compliance Score</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Real-time framework compliance tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${
              percentage >= 80 ? 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30' :
              percentage >= 60 ? 'from-amber-500/20 to-orange-500/20 border-amber-500/30' :
              'from-rose-500/20 to-red-500/20 border-rose-500/30'
            } border`}>
              <span className={`text-2xl font-bold ${getScoreColor()}`}>{percentage}%</span>
            </div>
            <div className="flex items-center gap-1 bg-[#0f1623] border border-[#2a3548] rounded-lg p-0.5">
              <Button
                size="sm"
                variant={visualMode === "gauge" ? "default" : "ghost"}
                onClick={() => setVisualMode("gauge")}
                className="h-7 px-2 text-xs"
                title="Gauge View"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant={visualMode === "pie" ? "default" : "ghost"}
                onClick={() => setVisualMode("pie")}
                className="h-7 px-2 text-xs"
                title="Pie Chart"
              >
                <Shield className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant={visualMode === "bar" ? "default" : "ghost"}
                onClick={() => setVisualMode("bar")}
                className="h-7 px-2 text-xs"
                title="Bar Chart"
              >
                <BarChart3 className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant={visualMode === "radar" ? "default" : "ghost"}
                onClick={() => setVisualMode("radar")}
                className="h-7 px-2 text-xs"
                title="Radar Chart"
              >
                <TrendingUp className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {/* AI Summary */}
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/30 shadow-lg">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/20">
                <Brain className="h-4 w-4 text-emerald-400" />
              </div>
              <span className="text-sm font-bold text-emerald-400">AI Executive Summary</span>
            </div>
            {!aiSummary && (
              <Button
                size="sm"
                onClick={generateAISummary}
                disabled={generatingSummary}
                className="h-7 text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 border-0"
              >
                {generatingSummary ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <Sparkles className="h-3 w-3 mr-1" />
                )}
                {generatingSummary ? 'Analyzing...' : 'Generate'}
              </Button>
            )}
          </div>
          {aiSummary ? (
            <p className="text-sm text-slate-200 leading-relaxed">{aiSummary}</p>
          ) : (
            <p className="text-xs text-slate-400 italic">Generate AI-powered insights to understand your compliance posture, identify gaps, and prioritize actions</p>
          )}
        </div>

        {/* Visualizations */}
        {visualMode === "gauge" && (
          <>
            <div className="relative h-52 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-4 rounded-xl bg-[#0f1623]/80 backdrop-blur-sm border border-[#2a3548]">
                  <p className={`text-5xl font-black ${getScoreColor()} mb-1`}>{percentage}%</p>
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Compliant</p>
                  <p className="text-[10px] text-slate-500 mt-1">{compliant} of {Array.isArray(compliance) ? compliance.length : 0}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {data.map(item => (
                <div 
                  key={item.name} 
                  className="group flex items-center gap-3 p-3 rounded-xl bg-[#0f1623] hover:bg-[#1a2332] cursor-pointer transition-all duration-200 border border-[#2a3548] hover:border-[#3a4558] hover:shadow-lg"
                  onClick={() => onSegmentClick && onSegmentClick(item.name)}
                >
                  <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: item.color }} />
                  <div className="flex-1">
                    <span className="text-xs text-slate-300 font-medium block">{item.name}</span>
                    <span className="text-[10px] text-slate-500">{Math.round((item.value/total)*100)}%</span>
                  </div>
                  <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{item.value}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {visualMode === "pie" && data.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 flex items-center justify-center bg-[#0f1623] rounded-xl border border-[#2a3548] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    label={(entry) => `${!isNaN(entry.value/total) ? Math.round((entry.value/total)*100) : 0}%`}
                    labelLine={{ stroke: '#64748b', strokeWidth: 1 }}
                    strokeWidth={2}
                    stroke="#1a2332"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {data.map(item => (
                <div 
                  key={item.name} 
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#0f1623] border border-[#2a3548] hover:border-[#3a4558] transition-all"
                >
                  <div className="w-4 h-4 rounded-lg shadow-lg" style={{ backgroundColor: item.color }} />
                  <div className="flex-1">
                    <span className="text-sm text-slate-300 font-medium block">{item.name}</span>
                    <span className="text-xs text-slate-500">{!isNaN(item.value/total) ? Math.round((item.value/total)*100) : 0}% of total</span>
                  </div>
                  <span className="text-lg font-bold text-white">{item.value}</span>
                </div>
              ))}
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30">
                <div className="text-center">
                  <p className={`text-3xl font-bold ${getScoreColor()} mb-1`}>{percentage}%</p>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Overall Compliance Rate</p>
                  <p className="text-[10px] text-slate-500 mt-1">{compliant} out of {total} requirements</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {visualMode === "bar" && frameworkData.length > 0 && (
          <div className="space-y-4">
            <div className="h-72 bg-[#0f1623] rounded-xl border border-[#2a3548] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={frameworkData} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                  <XAxis 
                    dataKey="framework" 
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    angle={-35}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a2332', 
                      border: '1px solid #2a3548',
                      borderRadius: '12px',
                      fontSize: '12px',
                      padding: '8px 12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} iconSize={10} />
                  <Bar dataKey="verified" fill="#10b981" name="Verified" stackId="a" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="inProgress" fill="#f59e0b" name="In Progress" stackId="a" />
                  <Bar dataKey="notStarted" fill="#64748b" name="Not Started" stackId="a" />
                  <Bar dataKey="nonCompliant" fill="#ef4444" name="Non-Compliant" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {visualMode === "radar" && frameworkData.length > 0 && (
          <div className="h-80 bg-[#0f1623] rounded-xl border border-[#2a3548] p-6">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={frameworkData.slice(0, 8)}>
                <PolarGrid stroke="#2a3548" strokeWidth={1.5} />
                <PolarAngleAxis 
                  dataKey="framework" 
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]}
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <Radar 
                  name="Compliance %" 
                  dataKey="compliance" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fill="#10b981" 
                  fillOpacity={0.5} 
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} iconSize={10} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a2332', 
                    border: '1px solid #2a3548',
                    borderRadius: '12px',
                    fontSize: '12px',
                    padding: '8px 12px'
                  }}
                  formatter={(value) => [`${value}%`, 'Compliance']}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Framework Performance Summary */}
        {frameworkData.length > 0 && visualMode === "gauge" && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white uppercase tracking-wide">Framework Performance</h4>
              <Badge className="bg-slate-500/10 text-slate-400 text-xs">{frameworks.length} Frameworks</Badge>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {frameworkData.slice(0, 6).map((framework, idx) => (
                <div 
                  key={idx} 
                  className="p-3 rounded-xl bg-[#0f1623] border border-[#2a3548] hover:border-[#3a4558] transition-all group cursor-pointer"
                  onClick={() => setDrillDown({ 
                    open: true, 
                    title: `${framework.fullName} Requirements`, 
                    data: Array.isArray(compliance) ? compliance.filter(c => c && c.framework === framework.fullName) : [], 
                    type: 'compliance' 
                  })}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-300 font-medium group-hover:text-white transition-colors">{framework.fullName}</span>
                    <Badge className={`text-xs font-bold ${
                      framework.compliance >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                      framework.compliance >= 60 ? 'bg-amber-500/20 text-amber-400' : 
                      'bg-rose-500/20 text-rose-400'
                    }`}>
                      {framework.compliance}%
                    </Badge>
                  </div>
                  <Progress 
                    value={framework.compliance} 
                    className="h-2"
                  />
                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
                    <span>{framework.verified} verified</span>
                    <span>{framework.inProgress} in progress</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
    });

    export default ComplianceGauge;