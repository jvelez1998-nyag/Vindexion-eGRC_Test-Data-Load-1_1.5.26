import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Network, CheckCircle2, AlertCircle, Activity, TrendingUp, Plus, Link2 } from "lucide-react";

export default function CrossWalkDashboard({ mappings = [], frameworks = [], onStartMapping }) {
  const totalMappings = mappings.length;
  const completeMappings = mappings.filter(m => m.status === 'complete').length;
  const inProgressMappings = mappings.filter(m => m.status === 'in_progress').length;
  const avgCoverage = mappings.length > 0
    ? Math.round(mappings.reduce((sum, m) => sum + (m.coverage_percentage || 0), 0) / mappings.length)
    : 0;

  // Framework coverage with better aggregation
  const frameworkPairs = new Map();
  mappings.forEach(m => {
    const key = `${m.source_framework} → ${m.target_framework}`;
    if (!frameworkPairs.has(key)) {
      frameworkPairs.set(key, {
        name: key,
        count: 0,
        avgCoverage: 0,
        completions: 0
      });
    }
    const pair = frameworkPairs.get(key);
    pair.count++;
    pair.avgCoverage += (m.coverage_percentage || 0);
    if (m.status === 'complete') pair.completions++;
  });
  
  const frameworkCoverage = Array.from(frameworkPairs.values())
    .map(pair => ({
      name: pair.name,
      value: pair.count,
      avgCoverage: Math.round(pair.avgCoverage / pair.count),
      completions: pair.completions
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Status distribution
  const statusData = [
    { name: 'Complete', value: completeMappings, color: '#10b981' },
    { name: 'In Progress', value: mappings.filter(m => m.status === 'in_progress').length, color: '#f59e0b' },
    { name: 'Draft', value: mappings.filter(m => m.status === 'draft').length, color: '#6366f1' },
    { name: 'Review', value: mappings.filter(m => m.status === 'review').length, color: '#8b5cf6' }
  ];

  // Enhanced gap analysis
  const fullCoverage = mappings.filter(m => (m.coverage_percentage || 0) >= 90).length;
  const partialCoverage = mappings.filter(m => (m.coverage_percentage || 0) >= 50 && (m.coverage_percentage || 0) < 90).length;
  const lowCoverage = mappings.filter(m => (m.coverage_percentage || 0) < 50).length;
  
  const gapData = [
    { name: 'Full Coverage (≥90%)', value: fullCoverage, color: '#10b981' },
    { name: 'Partial Coverage (50-89%)', value: partialCoverage, color: '#eab308' },
    { name: 'Low Coverage (<50%)', value: lowCoverage, color: '#ef4444' }
  ].filter(d => d.value > 0);

  // Recent mappings
  const recentMappings = mappings
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Cross-Walk Mapping Overview</h2>
          <p className="text-sm text-slate-400">Framework alignment and coverage analytics</p>
        </div>
        <Button onClick={onStartMapping} className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          New Mapping
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <Network className="h-5 w-5 text-violet-400" />
              </div>
              <div className="text-3xl font-bold text-white">{totalMappings}</div>
            </div>
            <div className="text-sm text-slate-400">Total Mappings</div>
            <div className="text-xs text-violet-400 mt-1">{completeMappings} complete</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-white">{avgCoverage}%</div>
            </div>
            <div className="text-sm text-slate-400">Avg Coverage</div>
            <div className="text-xs text-emerald-400 mt-1">Framework alignment</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Activity className="h-5 w-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white">{frameworks?.length || 0}</div>
            </div>
            <div className="text-sm text-slate-400">Frameworks</div>
            <div className="text-xs text-blue-400 mt-1">Supported</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertCircle className="h-5 w-5 text-amber-400" />
              </div>
              <div className="text-3xl font-bold text-white">{lowCoverage}</div>
            </div>
            <div className="text-sm text-slate-400">Gaps Identified</div>
            <div className="text-xs text-amber-400 mt-1">{inProgressMappings} in progress</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-violet-400" />
              Mapping Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                  labelLine={false}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Coverage Distribution */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              Coverage Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={gapData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                  labelLine={false}
                >
                  {gapData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Framework Mappings - Enhanced */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <Network className="h-5 w-5 text-violet-400" />
            Framework Mappings Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {frameworkCoverage.length === 0 ? (
            <div className="text-center py-12">
              <Network className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No framework mappings yet</p>
              <p className="text-slate-500 text-sm mt-1">Create your first mapping to get started</p>
              <Button onClick={onStartMapping} className="mt-4 bg-violet-600 hover:bg-violet-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Mapping
              </Button>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(300, frameworkCoverage.length * 50)}>
              <BarChart data={frameworkCoverage} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  width={140}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548' }}
                  formatter={(value, name, props) => {
                    if (name === 'value') return [`${value} mappings`, 'Count'];
                    if (name === 'avgCoverage') return [`${value}%`, 'Avg Coverage'];
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar dataKey="value" fill="#8b5cf6" name="Mappings" />
                <Bar dataKey="avgCoverage" fill="#10b981" name="Avg Coverage %" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Recent Mappings */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-white">Recent Mappings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentMappings.length === 0 ? (
              <div className="text-center py-8">
                <Link2 className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No mappings yet</p>
              </div>
            ) : (
              recentMappings.map(mapping => {
                const statusColor = 
                  mapping.status === 'complete' ? 'bg-emerald-500/20 text-emerald-400' :
                  mapping.status === 'in_progress' ? 'bg-amber-500/20 text-amber-400' :
                  mapping.status === 'review' ? 'bg-violet-500/20 text-violet-400' :
                  'bg-indigo-500/20 text-indigo-400';
                
                return (
                  <div 
                    key={mapping.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-[#151d2e] border border-[#2a3548] hover:border-[#3a4558] transition-all"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="text-[10px] bg-blue-500/10 text-blue-400">
                          {mapping.source_framework}
                        </Badge>
                        <span className="text-slate-600">→</span>
                        <Badge className="text-[10px] bg-purple-500/10 text-purple-400">
                          {mapping.target_framework}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-500">
                        Coverage: {mapping.coverage_percentage || 0}%
                      </div>
                    </div>
                    <Badge className={`${statusColor} capitalize text-[10px]`}>
                      {mapping.status?.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}