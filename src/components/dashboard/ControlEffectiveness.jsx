import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Shield, TrendingUp, BarChart3, Brain, Loader2, Sparkles } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import InteractiveBarChart from "@/components/charts/InteractiveBarChart";
import DrillDownModal from "@/components/ui/drill-down-modal";

export default function ControlEffectiveness({ controls = [] }) {
  const [aiSummary, setAiSummary] = useState(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [visualMode, setVisualMode] = useState("pie"); // pie, bar, radar
  const [drillDown, setDrillDown] = useState({ open: false, title: '', data: null, type: '' });

  const effectiveCount = Array.isArray(controls) ? controls.filter(c => c && c.status === 'effective').length : 0;
  const implementedCount = Array.isArray(controls) ? controls.filter(c => c && c.status === 'implemented').length : 0;
  const ineffectiveCount = Array.isArray(controls) ? controls.filter(c => c && c.status === 'ineffective').length : 0;
  const plannedCount = Array.isArray(controls) ? controls.filter(c => c && c.status === 'planned').length : 0;

  const avgEffectiveness = Array.isArray(controls) && controls.length && controls.filter(c => c && c.effectiveness).length > 0
    ? (controls.filter(c => c).reduce((sum, c) => sum + (c.effectiveness || 0), 0) / controls.filter(c => c && c.effectiveness).length).toFixed(1)
    : 0;

  const effectivenessRate = Array.isArray(controls) && controls.length 
    ? Math.round((effectiveCount / controls.length) * 100)
    : 0;

  const data = [
    { name: 'Effective', value: effectiveCount, color: '#10b981' },
    { name: 'Implemented', value: implementedCount, color: '#3b82f6' },
    { name: 'Ineffective', value: ineffectiveCount, color: '#ef4444' },
    { name: 'Planned', value: plannedCount, color: '#64748b' }
  ].filter(d => d.value > 0);

  // Domain-based breakdown
  const domainBreakdown = Array.isArray(controls) ? controls.reduce((acc, control) => {
    if (!control) return acc;
    const domain = control.domain || 'other';
    if (!acc[domain]) {
      acc[domain] = { effective: 0, implemented: 0, ineffective: 0, planned: 0, total: 0 };
    }
    acc[domain][control.status] = (acc[domain][control.status] || 0) + 1;
    acc[domain].total += 1;
    return acc;
  }, {}) : {};

  const domainData = Object.keys(domainBreakdown).map(domain => ({
    domain: domain.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    effective: domainBreakdown[domain].effective || 0,
    implemented: domainBreakdown[domain].implemented || 0,
    ineffective: domainBreakdown[domain].ineffective || 0,
    planned: domainBreakdown[domain].planned || 0,
    effectiveness: domainBreakdown[domain].total > 0 
      ? Math.round(((domainBreakdown[domain].effective || 0) / domainBreakdown[domain].total) * 100)
      : 0
  }));

  // Radar chart data
  const radarData = domainData.map(d => ({
    domain: d.domain.substring(0, 15),
    effectiveness: d.effectiveness,
    coverage: Math.round((d.effective + d.implemented) / (d.effective + d.implemented + d.ineffective + d.planned) * 100) || 0
  }));

  const generateAISummary = async () => {
    setGeneratingSummary(true);
    try {
      const controlsByCategory = Array.isArray(controls) ? controls.reduce((acc, c) => {
        if (!c) return acc;
        const cat = c.category || 'other';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {}) : {};

      const controlsByDomain = Array.isArray(controls) ? controls.reduce((acc, c) => {
        if (!c) return acc;
        const dom = c.domain || 'other';
        acc[dom] = (acc[dom] || 0) + 1;
        return acc;
      }, {}) : {};

      const avgEffectivenessValue = Array.isArray(controls) && controls.filter(c => c && c.effectiveness).length > 0
        ? (controls.filter(c => c).reduce((sum, c) => sum + (c.effectiveness || 0), 0) / controls.filter(c => c && c.effectiveness).length)
        : 0;

      const prompt = `Analyze this control effectiveness data and provide a concise executive summary:

CONTROL METRICS:
- Total Controls: ${controls.length}
- Effective: ${effectiveCount} (${effectivenessRate}%)
- Implemented: ${implementedCount}
- Ineffective: ${ineffectiveCount}
- Planned: ${plannedCount}
- Average Effectiveness Rating: ${avgEffectivenessValue.toFixed(1)}/5

BY CATEGORY:
${Object.entries(controlsByCategory).map(([cat, count]) => `- ${cat}: ${count} controls`).join('\n')}

BY DOMAIN:
${Object.entries(controlsByDomain).map(([dom, count]) => `- ${dom}: ${count} controls`).join('\n')}

DOMAIN EFFECTIVENESS:
${domainData.map(d => `- ${d.domain}: ${d.effectiveness}% effective (${d.effective} effective, ${d.implemented} implemented, ${d.ineffective} ineffective, ${d.planned} planned)`).join('\n')}

Provide a 2-3 sentence executive summary highlighting:
1. Overall control posture (strong/moderate/weak)
2. Key strengths or concerns
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
          <p className="text-xs text-slate-400">{payload[0].value} controls</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-400" />
              Control Effectiveness Overview
            </CardTitle>
            <p className="text-xs text-slate-500 mt-1">Real-time operational status and performance metrics across all controls</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#151d2e] border border-[#2a3548] rounded-lg p-1">
              <Button
                size="sm"
                variant={visualMode === "pie" ? "default" : "ghost"}
                onClick={() => setVisualMode("pie")}
                className="h-7 px-2"
              >
                <Shield className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant={visualMode === "bar" ? "default" : "ghost"}
                onClick={() => setVisualMode("bar")}
                className="h-7 px-2"
              >
                <BarChart3 className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant={visualMode === "radar" ? "default" : "ghost"}
                onClick={() => setVisualMode("radar")}
                className="h-7 px-2"
              >
                <TrendingUp className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-3 rounded-lg bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-slate-400 uppercase tracking-wide">Effectiveness</span>
            </div>
            <p className="text-3xl font-bold text-emerald-400">{effectivenessRate}%</p>
            <p className="text-xs text-slate-500 mt-1">{effectiveCount} of {controls.length} controls</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border border-indigo-500/20">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Shield className="h-4 w-4 text-indigo-400" />
              <span className="text-xs text-slate-400 uppercase tracking-wide">Avg Rating</span>
            </div>
            <p className="text-3xl font-bold text-indigo-400">{avgEffectiveness}<span className="text-xl text-slate-500">/5</span></p>
            <p className="text-xs text-slate-500 mt-1">Performance score</p>
          </div>
        </div>

        {/* AI Summary */}
        <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
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
            <p className="text-xs text-slate-500 italic">Click "Generate" for AI-powered insights on your control effectiveness posture</p>
          )}
        </div>

        {/* Visualizations */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {visualMode === "pie" && data.length > 0 && (
            <div className="h-44 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
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
            </div>
          )}

          {visualMode === "bar" && domainData.length > 0 && (
            <div className="h-44 col-span-2">
              <InteractiveBarChart
                data={domainData}
                dataKey="effectiveness"
                nameKey="domain"
                height={180}
                color="#6366f1"
                drillDownContent={(data) => (
                  <div className="space-y-2">
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-center">
                        <div className="font-bold text-emerald-400">{data.effective}</div>
                        <div className="text-slate-400">Effective</div>
                      </div>
                      <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20 text-center">
                        <div className="font-bold text-blue-400">{data.implemented}</div>
                        <div className="text-slate-400">Implemented</div>
                      </div>
                      <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-center">
                        <div className="font-bold text-rose-400">{data.ineffective}</div>
                        <div className="text-slate-400">Ineffective</div>
                      </div>
                      <div className="p-2 rounded bg-slate-500/10 border border-slate-500/20 text-center">
                        <div className="font-bold text-slate-400">{data.planned}</div>
                        <div className="text-slate-400">Planned</div>
                      </div>
                    </div>
                  </div>
                )}
              />
            </div>
          )}

          {visualMode === "radar" && radarData.length > 0 && (
            <div className="h-44 col-span-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#2a3548" />
                  <PolarAngleAxis 
                    dataKey="domain" 
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                  />
                  <Radar 
                    name="Effectiveness %" 
                    dataKey="effectiveness" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.3} 
                  />
                  <Radar 
                    name="Coverage %" 
                    dataKey="coverage" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.3} 
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '10px' }}
                    iconSize={8}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a2332', 
                      border: '1px solid #2a3548',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {visualMode === "pie" && (
            <div className="grid grid-cols-1 gap-2">
              <div 
                className="flex items-center justify-between p-2 rounded-lg bg-[#151d2e] border border-emerald-500/20 cursor-pointer hover:bg-emerald-500/5 transition-colors"
                onClick={() => setDrillDown({ open: true, title: 'Effective Controls', data: Array.isArray(controls) ? controls.filter(c => c && c.status === 'effective') : [], type: 'control' })}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs text-slate-400">Effective</span>
                </div>
                <span className="text-sm font-bold text-emerald-400">{effectiveCount}</span>
              </div>
              <div 
                className="flex items-center justify-between p-2 rounded-lg bg-[#151d2e] border border-blue-500/20 cursor-pointer hover:bg-blue-500/5 transition-colors"
                onClick={() => setDrillDown({ open: true, title: 'Implemented Controls', data: Array.isArray(controls) ? controls.filter(c => c && c.status === 'implemented') : [], type: 'control' })}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs text-slate-400">Implemented</span>
                </div>
                <span className="text-sm font-bold text-blue-400">{implementedCount}</span>
              </div>
              <div 
                className="flex items-center justify-between p-2 rounded-lg bg-[#151d2e] border border-rose-500/20 cursor-pointer hover:bg-rose-500/5 transition-colors"
                onClick={() => setDrillDown({ open: true, title: 'Ineffective Controls', data: Array.isArray(controls) ? controls.filter(c => c && c.status === 'ineffective') : [], type: 'control' })}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-xs text-slate-400">Ineffective</span>
                </div>
                <span className="text-sm font-bold text-rose-400">{ineffectiveCount}</span>
              </div>
              <div 
                className="flex items-center justify-between p-2 rounded-lg bg-[#151d2e] border border-slate-500/20 cursor-pointer hover:bg-slate-500/5 transition-colors"
                onClick={() => setDrillDown({ open: true, title: 'Planned Controls', data: Array.isArray(controls) ? controls.filter(c => c && c.status === 'planned') : [], type: 'control' })}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-500" />
                  <span className="text-xs text-slate-400">Planned</span>
                </div>
                <span className="text-sm font-bold text-slate-400">{plannedCount}</span>
              </div>
            </div>
          )}
        </div>

        {/* Domain Performance Summary */}
        {domainData.length > 0 && visualMode !== "bar" && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Domain Performance</h4>
            <div className="grid grid-cols-2 gap-2">
              {domainData.slice(0, 6).map((domain, idx) => (
                <div 
                  key={idx} 
                  className="p-2 rounded-lg bg-[#151d2e] border border-[#2a3548] cursor-pointer hover:border-indigo-500/40 transition-colors"
                  onClick={() => setDrillDown({ 
                    open: true, 
                    title: `${domain.domain} Controls`, 
                    data: Array.isArray(controls) ? controls.filter(c => c && ((c.domain || 'other').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) === domain.domain)) : [], 
                    type: 'control' 
                  })}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">{domain.domain}</span>
                    <span className={`text-xs font-bold ${
                      domain.effectiveness >= 80 ? 'text-emerald-400' :
                      domain.effectiveness >= 60 ? 'text-blue-400' :
                      domain.effectiveness >= 40 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {domain.effectiveness}%
                    </span>
                  </div>
                  <Progress 
                    value={domain.effectiveness} 
                    className="h-1.5"
                  />
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
}