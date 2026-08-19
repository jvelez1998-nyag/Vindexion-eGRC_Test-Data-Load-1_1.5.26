import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ScatterChart, Scatter, ComposedChart, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, AreaChart, Area, RadarChart, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, ZAxis
} from "recharts";
import { BarChart3, Target, Layers, TrendingUp, Filter, Download } from "lucide-react";
import InteractiveBarChart from "@/components/charts/InteractiveBarChart";

export default function InteractiveRiskCharts({ risks, controls }) {
  const [chartType, setChartType] = useState("scatter");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const categories = [...new Set(risks.map(r => r.category))].filter(Boolean);
  const statuses = [...new Set(risks.map(r => r.status))].filter(Boolean);

  const filteredRisks = risks.filter(r => {
    const catMatch = categoryFilter === "all" || r.category === categoryFilter;
    const statusMatch = statusFilter === "all" || r.status === statusFilter;
    return catMatch && statusMatch;
  });

  // Scatter plot data (Impact vs Likelihood)
  const scatterData = filteredRisks.map(r => ({
    x: r.likelihood || 0,
    y: r.impact || 0,
    z: r.linked_controls?.length || 1,
    name: r.title,
    category: r.category,
    score: (r.likelihood || 0) * (r.impact || 0),
    id: r.id
  }));

  // Inherent vs Residual comparison
  const inherentVsResidual = filteredRisks.map(r => ({
    name: r.title?.substring(0, 20) + (r.title?.length > 20 ? '...' : ''),
    inherent: (r.inherent_likelihood || 0) * (r.inherent_impact || 0),
    residual: (r.residual_likelihood || 0) * (r.residual_impact || 0),
    reduction: ((r.inherent_likelihood || 0) * (r.inherent_impact || 0)) - ((r.residual_likelihood || 0) * (r.residual_impact || 0))
  })).filter(r => r.inherent > 0 || r.residual > 0);

  // Category risk scores
  const categoryScores = categories.map(cat => {
    const catRisks = filteredRisks.filter(r => r.category === cat);
    const avgScore = catRisks.reduce((sum, r) => sum + ((r.likelihood || 0) * (r.impact || 0)), 0) / catRisks.length;
    const count = catRisks.length;
    const criticalCount = catRisks.filter(r => ((r.likelihood || 0) * (r.impact || 0)) >= 16).length;
    
    return {
      category: cat,
      avgScore: Math.round(avgScore * 10) / 10,
      count,
      critical: criticalCount,
      high: catRisks.filter(r => {
        const s = (r.likelihood || 0) * (r.impact || 0);
        return s >= 12 && s < 16;
      }).length
    };
  });

  // Control coverage by category
  const controlCoverage = categories.map(cat => {
    const catRisks = filteredRisks.filter(r => r.category === cat);
    const withControls = catRisks.filter(r => r.linked_controls?.length > 0).length;
    const avgControls = catRisks.reduce((sum, r) => sum + (r.linked_controls?.length || 0), 0) / catRisks.length;
    
    return {
      category: cat,
      coverage: Math.round((withControls / catRisks.length) * 100),
      avgControls: Math.round(avgControls * 10) / 10,
      total: catRisks.length
    };
  });

  const getScoreColor = (score) => {
    if (score >= 20) return '#ef4444';
    if (score >= 16) return '#f97316';
    if (score >= 12) return '#f59e0b';
    if (score >= 6) return '#eab308';
    return '#10b981';
  };

  const CustomScatterTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0f1623] border border-[#2a3548] rounded-lg px-3 py-2 shadow-xl">
          <p className="text-xs font-semibold text-white mb-1">{data.name}</p>
          <p className="text-xs text-slate-400">Likelihood: {data.x}</p>
          <p className="text-xs text-slate-400">Impact: {data.y}</p>
          <p className="text-xs text-slate-400">Score: {data.score}</p>
          <p className="text-xs text-slate-400">Controls: {data.z}</p>
          <Badge className="mt-1 text-[9px]" style={{ backgroundColor: getScoreColor(data.score) }}>
            {data.score >= 16 ? 'Critical' : data.score >= 12 ? 'High' : data.score >= 6 ? 'Medium' : 'Low'}
          </Badge>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-400">Filters:</span>
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin flex-1">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 text-white text-xs hover:from-violet-500/30 hover:to-purple-500/30"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-white text-xs hover:from-blue-500/30 hover:to-cyan-500/30"
              >
                <option value="all">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <Badge className="bg-indigo-500/20 text-indigo-400 text-xs">
              {filteredRisks.length} risks
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Chart Type Selector */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-2">
        <Button
          size="sm"
          onClick={() => setChartType("scatter")}
          className={chartType === "scatter" 
            ? "flex-shrink-0 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white shadow-lg" 
            : "flex-shrink-0 bg-gradient-to-r from-rose-500/20 to-orange-500/20 border border-rose-500/30 text-white hover:from-rose-500/30 hover:to-orange-500/30"}
        >
          <Target className="h-3 w-3 mr-2" />
          Risk Matrix
        </Button>
        <Button
          size="sm"
          onClick={() => setChartType("comparison")}
          className={chartType === "comparison" 
            ? "flex-shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg" 
            : "flex-shrink-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-white hover:from-indigo-500/30 hover:to-purple-500/30"}
        >
          <BarChart3 className="h-3 w-3 mr-2" />
          Inherent vs Residual
        </Button>
        <Button
          size="sm"
          onClick={() => setChartType("category")}
          className={chartType === "category" 
            ? "flex-shrink-0 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg" 
            : "flex-shrink-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-white hover:from-amber-500/30 hover:to-orange-500/30"}
        >
          <Layers className="h-3 w-3 mr-2" />
          Category Analysis
        </Button>
        <Button
          size="sm"
          onClick={() => setChartType("coverage")}
          className={chartType === "coverage" 
            ? "flex-shrink-0 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg" 
            : "flex-shrink-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-white hover:from-emerald-500/30 hover:to-teal-500/30"}
        >
          <TrendingUp className="h-3 w-3 mr-2" />
          Control Coverage
        </Button>
      </div>

      {/* Interactive Charts */}
      {chartType === "scatter" && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base">Risk Impact-Likelihood Matrix</CardTitle>
              <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg">
                <Download className="h-3 w-3 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={500}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Likelihood" 
                  domain={[0, 5]}
                  ticks={[0, 1, 2, 3, 4, 5]}
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8' }}
                  label={{ value: 'Likelihood', position: 'insideBottom', offset: -10, fill: '#94a3b8' }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Impact"
                  domain={[0, 5]}
                  ticks={[0, 1, 2, 3, 4, 5]}
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8' }}
                  label={{ value: 'Impact', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                />
                <ZAxis type="number" dataKey="z" range={[50, 400]} name="Controls" />
                <Tooltip content={<CustomScatterTooltip />} />
                <Scatter 
                  name="Risks" 
                  data={scatterData}
                  fill="#8884d8"
                >
                  {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
                  ))}
                </Scatter>
                
                {/* Risk zones */}
                <rect x="0" y="0" width="40%" height="40%" fill="#10b981" fillOpacity={0.05} />
                <rect x="60%" y="60%" width="40%" height="40%" fill="#ef4444" fillOpacity={0.1} />
              </ScatterChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 mt-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-400">Low (1-5)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-slate-400">Medium (6-11)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-slate-400">High (12-15)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-slate-400">Critical (16+)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {chartType === "comparison" && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-white text-base">Inherent vs Residual Risk Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={inherentVsResidual.slice(0, 15)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f1623', 
                    border: '1px solid #2a3548', 
                    borderRadius: '8px' 
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="inherent" fill="#ef4444" name="Inherent Risk" />
                <Bar dataKey="residual" fill="#10b981" name="Residual Risk" />
                <Line type="monotone" dataKey="reduction" stroke="#6366f1" strokeWidth={2} name="Risk Reduction" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {chartType === "category" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-white text-base">Category Risk Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <InteractiveBarChart
                data={categoryScores}
                dataKey="avgScore"
                nameKey="category"
                height={350}
                color="#6366f1"
                drillDownContent={(data) => (
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-center">
                      <div className="font-bold text-rose-400">{data.critical}</div>
                      <div className="text-slate-400">Critical</div>
                    </div>
                    <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-center">
                      <div className="font-bold text-amber-400">{data.high}</div>
                      <div className="text-slate-400">High</div>
                    </div>
                    <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20 text-center">
                      <div className="font-bold text-blue-400">{data.count}</div>
                      <div className="text-slate-400">Total</div>
                    </div>
                  </div>
                )}
              />
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-white text-base">Risk Distribution by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={categoryScores}>
                  <PolarGrid stroke="#2a3548" />
                  <PolarAngleAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <PolarRadiusAxis angle={90} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Radar name="Avg Score" dataKey="avgScore" stroke="#ef4444" fill="#ef4444" fillOpacity={0.5} />
                  <Radar name="Count" dataKey="count" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f1623', 
                      border: '1px solid #2a3548', 
                      borderRadius: '8px' 
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {chartType === "coverage" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-white text-base">Control Coverage by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={controlCoverage} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                  <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                  <YAxis 
                    type="category" 
                    dataKey="category" 
                    stroke="#94a3b8" 
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    width={100}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f1623', 
                      border: '1px solid #2a3548', 
                      borderRadius: '8px' 
                    }}
                    formatter={(value) => `${value}%`}
                  />
                  <Bar dataKey="coverage" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                    {controlCoverage.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.coverage >= 80 ? '#10b981' : entry.coverage >= 50 ? '#f59e0b' : '#ef4444'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-white text-base">Average Controls per Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={controlCoverage}>
                  <defs>
                    <linearGradient id="controlGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                  <XAxis 
                    dataKey="category" 
                    stroke="#94a3b8" 
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f1623', 
                      border: '1px solid #2a3548', 
                      borderRadius: '8px' 
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="avgControls" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#controlGradient)"
                    name="Avg Controls"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}