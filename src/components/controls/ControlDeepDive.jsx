import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, ZAxis } from "recharts";
import { Target, Brain, TrendingUp, AlertTriangle, Shield, Zap, Activity, FileCheck, Network } from "lucide-react";

export default function ControlDeepDive({ controls = [], controlTests = [] }) {
  const [activeView, setActiveView] = useState("effectiveness");

  // Control effectiveness analysis
  const effectivenessAnalysis = controls.map(c => ({
    name: c.name?.substring(0, 30) + '...',
    effectiveness: c.effectiveness || 0,
    status: c.status,
    domain: c.domain,
    category: c.category,
    testCount: controlTests.filter(t => t.control_id === c.id).length
  }));

  // Control maturity by domain
  const domainMaturity = Object.entries(
    controls.reduce((acc, c) => {
      if (!acc[c.domain]) {
        acc[c.domain] = { total: 0, effective: 0, tested: 0, documented: 0 };
      }
      acc[c.domain].total++;
      if (c.status === 'effective') acc[c.domain].effective++;
      if (c.last_tested_date) acc[c.domain].tested++;
      if (c.control_procedures) acc[c.domain].documented++;
      return acc;
    }, {})
  ).map(([domain, stats]) => ({
    domain: domain.replace(/_/g, ' ').toUpperCase(),
    effectiveness: Math.round((stats.effective / stats.total) * 100),
    testCoverage: Math.round((stats.tested / stats.total) * 100),
    documentation: Math.round((stats.documented / stats.total) * 100),
    controls: stats.total
  }));

  // Control risk heat map
  const controlRiskData = controls.map(c => {
    const linkedRisksCount = c.linked_risks?.length || 0;
    const testFailures = controlTests.filter(t => t.control_id === c.id && t.test_result === 'failed').length;
    
    return {
      name: c.name?.substring(0, 25),
      x: c.effectiveness || 0,
      y: linkedRisksCount,
      z: testFailures + 1,
      status: c.status
    };
  }).slice(0, 30);

  // Framework coverage analysis
  const frameworkCoverage = [
    { framework: 'COSO', controls: controls.filter(c => c.framework_mappings?.COSO?.length > 0).length },
    { framework: 'COBIT', controls: controls.filter(c => c.framework_mappings?.COBIT?.length > 0).length },
    { framework: 'ISO27001', controls: controls.filter(c => c.framework_mappings?.ISO27001?.length > 0).length },
    { framework: 'NIST', controls: controls.filter(c => c.framework_mappings?.NIST?.length > 0).length },
    { framework: 'SOX', controls: controls.filter(c => c.framework_mappings?.SOX?.length > 0).length }
  ].filter(f => f.controls > 0);

  // Test frequency analysis
  const testFrequencyData = [
    { frequency: 'Never', count: controls.filter(c => !c.last_tested_date).length, color: '#ef4444' },
    { frequency: 'Overdue', count: controls.filter(c => c.next_test_date && new Date(c.next_test_date) < new Date()).length, color: '#f59e0b' },
    { frequency: 'Up-to-date', count: controls.filter(c => c.last_tested_date && (!c.next_test_date || new Date(c.next_test_date) >= new Date())).length, color: '#10b981' }
  ].filter(d => d.count > 0);

  // Control category distribution with effectiveness
  const categoryEffectiveness = ['preventive', 'detective', 'corrective', 'directive'].map(cat => {
    const catControls = controls.filter(c => c.category === cat);
    const effective = catControls.filter(c => c.status === 'effective').length;
    return {
      category: cat.charAt(0).toUpperCase() + cat.slice(1),
      total: catControls.length,
      effective,
      rate: catControls.length > 0 ? Math.round((effective / catControls.length) * 100) : 0
    };
  }).filter(d => d.total > 0);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border-blue-500/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20">
              <Brain className="h-7 w-7 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                Control Framework Deep Dive
                <Badge className="bg-blue-500/20 text-blue-400 text-[10px]">ADVANCED ANALYTICS</Badge>
              </CardTitle>
              <p className="text-sm text-slate-400 mt-1">
                Comprehensive analysis of control effectiveness, maturity, and risk coverage
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="bg-[#1a2332] border border-[#2a3548] p-1">
          <TabsTrigger value="effectiveness" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <Target className="h-4 w-4 mr-2" />
            Effectiveness
          </TabsTrigger>
          <TabsTrigger value="maturity" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
            <TrendingUp className="h-4 w-4 mr-2" />
            Maturity
          </TabsTrigger>
          <TabsTrigger value="coverage" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400">
            <Shield className="h-4 w-4 mr-2" />
            Coverage
          </TabsTrigger>
          <TabsTrigger value="testing" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <FileCheck className="h-4 w-4 mr-2" />
            Testing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="effectiveness" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-400" />
                  Control Risk Scatter
                </CardTitle>
                <p className="text-xs text-slate-400">Effectiveness vs Linked Risks (size = test failures)</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                    <XAxis type="number" dataKey="x" name="Effectiveness" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'Effectiveness', position: 'bottom', fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis type="number" dataKey="y" name="Risks" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'Linked Risks', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
                    <ZAxis type="number" dataKey="z" range={[50, 500]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                      cursor={{ strokeDasharray: '3 3' }}
                    />
                    <Scatter data={controlRiskData} fill="#3b82f6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  Category Effectiveness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryEffectiveness}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                    <XAxis dataKey="category" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }} />
                    <Bar dataKey="total" fill="#6366f1" name="Total" />
                    <Bar dataKey="effective" fill="#10b981" name="Effective" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {categoryEffectiveness.map((cat, i) => (
                    <div key={i} className="text-xs text-slate-400">
                      <span className="font-semibold text-white">{cat.category}:</span> {cat.rate}% effective
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maturity" className="space-y-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                Domain Maturity Analysis
              </CardTitle>
              <p className="text-xs text-slate-400">Comprehensive maturity metrics across all control domains</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={domainMaturity.slice(0, 8)}>
                  <PolarGrid stroke="#2a3548" />
                  <PolarAngleAxis dataKey="domain" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <Radar name="Effectiveness" dataKey="effectiveness" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Radar name="Test Coverage" dataKey="testCoverage" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Radar name="Documentation" dataKey="documentation" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coverage" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                  <Shield className="h-4 w-4 text-violet-400" />
                  Framework Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={frameworkCoverage} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                    <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis type="category" dataKey="framework" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} width={80} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }} />
                    <Bar dataKey="controls" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-white">Coverage Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {frameworkCoverage.map((fw, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-300">{fw.framework}</span>
                        <Badge className="bg-violet-500/20 text-violet-400">{fw.controls} controls</Badge>
                      </div>
                      <div className="h-2 bg-[#151d2e] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all"
                          style={{ width: `${(fw.controls / controls.length) * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-slate-500">
                        {Math.round((fw.controls / controls.length) * 100)}% of total controls
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-amber-400" />
                  Test Coverage Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={testFrequencyData}
                      dataKey="count"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ frequency, count, percent }) => `${frequency}: ${count} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {testFrequencyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-white">Testing Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-rose-400" />
                      <span className="text-sm font-semibold text-white">Never Tested</span>
                    </div>
                    <p className="text-2xl font-bold text-rose-400">{testFrequencyData.find(d => d.frequency === 'Never')?.count || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">Controls without any test evidence</p>
                  </div>

                  <div className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-amber-400" />
                      <span className="text-sm font-semibold text-white">Overdue Testing</span>
                    </div>
                    <p className="text-2xl font-bold text-amber-400">{testFrequencyData.find(d => d.frequency === 'Overdue')?.count || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">Controls past their test due date</p>
                  </div>

                  <div className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                    <div className="flex items-center gap-2 mb-2">
                      <FileCheck className="h-4 w-4 text-emerald-400" />
                      <span className="text-sm font-semibold text-white">Up-to-Date</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-400">{testFrequencyData.find(d => d.frequency === 'Up-to-date')?.count || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">Controls with current test results</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}