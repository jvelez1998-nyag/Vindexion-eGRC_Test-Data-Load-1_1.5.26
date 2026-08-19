import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ComposedChart, BarChart, Bar, LineChart, Line, AreaChart, Area,
  ScatterChart, Scatter, RadarChart, Radar,
  XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell
} from "recharts";
import { TrendingUp, Layers, Target, Activity, Download, Filter } from "lucide-react";
import { format } from "date-fns";
import InteractiveBarChart from "@/components/charts/InteractiveBarChart";

export default function InteractiveAssessmentCharts({ assessments }) {
  const [chartView, setChartView] = useState("risk-evolution");
  const [typeFilter, setTypeFilter] = useState("all");

  const types = [...new Set(assessments.map(a => a.assessment_type))].filter(Boolean);
  
  const filteredAssessments = typeFilter === "all" 
    ? assessments 
    : assessments.filter(a => a.assessment_type === typeFilter);

  // Risk evolution data (inherent to residual)
  const evolutionData = filteredAssessments.map((a, idx) => ({
    id: idx + 1,
    name: a.title?.substring(0, 15) + '...',
    inherentLikelihood: a.inherent_likelihood || 0,
    inherentImpact: a.inherent_impact || 0,
    residualLikelihood: a.residual_likelihood || 0,
    residualImpact: a.residual_impact || 0,
    inherentScore: (a.inherent_likelihood || 0) * (a.inherent_impact || 0),
    residualScore: (a.residual_likelihood || 0) * (a.residual_impact || 0),
    controlEffectiveness: a.control_effectiveness || 0,
    riskReduction: ((a.inherent_likelihood || 0) * (a.inherent_impact || 0)) - ((a.residual_likelihood || 0) * (a.residual_impact || 0))
  })).filter(a => a.inherentScore > 0 || a.residualScore > 0);

  // Treatment effectiveness
  const treatmentData = Object.entries(
    filteredAssessments.reduce((acc, a) => {
      const treatment = a.risk_treatment || 'not_set';
      if (!acc[treatment]) {
        acc[treatment] = { count: 0, avgReduction: 0, totalReduction: 0 };
      }
      acc[treatment].count++;
      const reduction = ((a.inherent_likelihood || 0) * (a.inherent_impact || 0)) - 
                       ((a.residual_likelihood || 0) * (a.residual_impact || 0));
      acc[treatment].totalReduction += reduction;
      return acc;
    }, {})
  ).map(([treatment, data]) => ({
    treatment: treatment.replace(/_/g, ' ').toUpperCase(),
    count: data.count,
    avgReduction: Math.round((data.totalReduction / data.count) * 10) / 10
  }));

  // Type breakdown with risk levels
  const typeBreakdown = types.map(type => {
    const typeAssessments = filteredAssessments.filter(a => a.assessment_type === type);
    return {
      type: type.toUpperCase(),
      total: typeAssessments.length,
      critical: typeAssessments.filter(a => ((a.residual_likelihood || 0) * (a.residual_impact || 0)) >= 16).length,
      high: typeAssessments.filter(a => {
        const s = (a.residual_likelihood || 0) * (a.residual_impact || 0);
        return s >= 9 && s < 16;
      }).length,
      medium: typeAssessments.filter(a => {
        const s = (a.residual_likelihood || 0) * (a.residual_impact || 0);
        return s >= 4 && s < 9;
      }).length
    };
  });

  // Control effectiveness distribution
  const effectivenessData = [
    { range: '4.0-5.0', count: filteredAssessments.filter(a => a.control_effectiveness >= 4).length, color: '#10b981' },
    { range: '3.0-3.9', count: filteredAssessments.filter(a => a.control_effectiveness >= 3 && a.control_effectiveness < 4).length, color: '#3b82f6' },
    { range: '2.0-2.9', count: filteredAssessments.filter(a => a.control_effectiveness >= 2 && a.control_effectiveness < 3).length, color: '#f59e0b' },
    { range: '1.0-1.9', count: filteredAssessments.filter(a => a.control_effectiveness >= 1 && a.control_effectiveness < 2).length, color: '#ef4444' },
    { range: 'Not Rated', count: filteredAssessments.filter(a => !a.control_effectiveness).length, color: '#64748b' }
  ].filter(d => d.count > 0);

  return (
    <div className="space-y-4">
      {/* Filters & Controls */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-400">View:</span>
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin flex-1">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-[#151d2e] border border-[#2a3548] text-white text-xs"
              >
                <option value="all">All Types</option>
                {types.map(type => (
                  <option key={type} value={type}>{type.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <Badge className="bg-indigo-500/20 text-indigo-400 text-xs">
              {filteredAssessments.length} assessments
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Chart Type Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-2">
        <Button
          size="sm"
          onClick={() => setChartView("risk-evolution")}
          className={chartView === "risk-evolution" 
            ? "flex-shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700" 
            : "flex-shrink-0 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500"}
        >
          <TrendingUp className="h-3 w-3 mr-2" />
          Risk Evolution
        </Button>
        <Button
          size="sm"
          onClick={() => setChartView("treatment")}
          className={chartView === "treatment" 
            ? "flex-shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700" 
            : "flex-shrink-0 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500"}
        >
          <Target className="h-3 w-3 mr-2" />
          Treatment Analysis
        </Button>
        <Button
          size="sm"
          onClick={() => setChartView("type-breakdown")}
          className={chartView === "type-breakdown" 
            ? "flex-shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700" 
            : "flex-shrink-0 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500"}
        >
          <Layers className="h-3 w-3 mr-2" />
          Type Breakdown
        </Button>
        <Button
          size="sm"
          onClick={() => setChartView("effectiveness")}
          className={chartView === "effectiveness" 
            ? "flex-shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700" 
            : "flex-shrink-0 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500"}
        >
          <Activity className="h-3 w-3 mr-2" />
          Control Effectiveness
        </Button>
      </div>

      {/* Charts */}
      {chartView === "risk-evolution" && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base">Risk Score Evolution (Inherent → Residual)</CardTitle>
              <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Download className="h-3 w-3 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={450}>
              <ComposedChart data={evolutionData.slice(0, 20)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  tick={{ fill: '#94a3b8', fontSize: 9 }}
                  angle={-45}
                  textAnchor="end"
                  height={120}
                />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} label={{ value: 'Risk Score', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f1623', 
                    border: '1px solid #2a3548', 
                    borderRadius: '8px' 
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="inherentScore" fill="#ef4444" name="Inherent Risk" />
                <Bar dataKey="residualScore" fill="#10b981" name="Residual Risk" />
                <Line type="monotone" dataKey="controlEffectiveness" stroke="#6366f1" strokeWidth={2} name="Control Effectiveness" yAxisId={1} />
                <YAxis yAxisId={1} orientation="right" domain={[0, 5]} stroke="#6366f1" tick={{ fill: '#6366f1', fontSize: 10 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {chartView === "treatment" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-white text-base">Treatment Strategy Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <InteractiveBarChart
                data={treatmentData}
                dataKey="count"
                nameKey="treatment"
                height={350}
                color="#8b5cf6"
                drillDownContent={(data) => (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between p-2 rounded bg-violet-500/10 border border-violet-500/20">
                      <span className="text-slate-400">Assessments:</span>
                      <span className="text-white font-bold">{data.count}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-slate-400">Avg Risk Reduction:</span>
                      <span className="text-emerald-400 font-bold">{data.avgReduction}</span>
                    </div>
                  </div>
                )}
              />
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-white text-base">Risk Reduction Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={evolutionData.sort((a, b) => b.riskReduction - a.riskReduction).slice(0, 15)}>
                  <defs>
                    <linearGradient id="reductionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    tick={{ fill: '#94a3b8', fontSize: 9 }}
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
                  <Area 
                    type="monotone" 
                    dataKey="riskReduction" 
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#reductionGradient)"
                    name="Risk Reduction"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {chartView === "type-breakdown" && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-white text-base">Risk Severity by Assessment Type</CardTitle>
          </CardHeader>
          <CardContent>
            <InteractiveBarChart
              data={typeBreakdown}
              dataKey="total"
              nameKey="type"
              height={400}
              color="#6366f1"
              drillDownContent={(data) => (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 rounded bg-rose-500/10 border border-rose-500/20">
                    <span className="text-slate-400">Critical Risks:</span>
                    <span className="text-rose-400 font-bold">{data.critical}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-amber-500/10 border border-amber-500/20">
                    <span className="text-slate-400">High Risks:</span>
                    <span className="text-amber-400 font-bold">{data.high}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-blue-500/10 border border-blue-500/20">
                    <span className="text-slate-400">Medium Risks:</span>
                    <span className="text-blue-400 font-bold">{data.medium}</span>
                  </div>
                </div>
              )}
            />
          </CardContent>
        </Card>
      )}

      {chartView === "effectiveness" && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-white text-base">Control Effectiveness Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <InteractiveBarChart
              data={effectivenessData}
              dataKey="count"
              nameKey="range"
              height={400}
              color="#6366f1"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}