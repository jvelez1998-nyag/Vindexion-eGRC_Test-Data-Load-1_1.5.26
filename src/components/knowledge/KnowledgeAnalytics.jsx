import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { FileText, TrendingUp, Users, Activity } from "lucide-react";

export default function KnowledgeAnalytics({ knowledgeData, searchHistory }) {
  // Module usage statistics
  const moduleStats = {
    risks: knowledgeData.risks.length,
    incidents: knowledgeData.incidents.length,
    controls: knowledgeData.controls.length,
    compliance: knowledgeData.compliance.length,
    assessments: knowledgeData.assessments.length,
    audits: knowledgeData.audits.length,
    vendors: knowledgeData.vendors.length,
    guidance: knowledgeData.guidance.length
  };

  const moduleChartData = Object.entries(moduleStats).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  // Search patterns
  const searchPatternData = searchHistory.slice(0, 20).reduce((acc, item) => {
    const words = item.query.toLowerCase().split(' ');
    words.forEach(word => {
      if (word.length > 3) {
        acc[word] = (acc[word] || 0) + 1;
      }
    });
    return acc;
  }, {});

  const topSearchTerms = Object.entries(searchPatternData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([term, count]) => ({ term, count }));

  // Status distribution across all modules
  const statusData = [
    { 
      name: 'Active/Open', 
      value: knowledgeData.risks.filter(r => r.status !== 'closed').length +
             knowledgeData.incidents.filter(i => !['closed', 'remediated'].includes(i.status)).length +
             knowledgeData.audits.filter(a => a.status === 'in_progress').length,
      color: '#f59e0b'
    },
    { 
      name: 'Completed/Closed', 
      value: knowledgeData.risks.filter(r => r.status === 'closed').length +
             knowledgeData.incidents.filter(i => ['closed', 'remediated'].includes(i.status)).length +
             knowledgeData.audits.filter(a => a.status === 'completed').length,
      color: '#10b981'
    },
    { 
      name: 'Planned/Pending', 
      value: knowledgeData.controls.filter(c => c.status === 'planned').length +
             knowledgeData.audits.filter(a => a.status === 'planned').length +
             knowledgeData.compliance.filter(c => c.status === 'not_started').length,
      color: '#6366f1'
    }
  ];

  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#14b8a6', '#f43f5e'];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-8 w-8 text-indigo-400" />
              <Badge className="bg-indigo-500/20 text-indigo-400">Total</Badge>
            </div>
            <p className="text-3xl font-bold text-white">
              {Object.values(moduleStats).reduce((sum, val) => sum + val, 0)}
            </p>
            <p className="text-xs text-slate-500">Total Records</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-8 w-8 text-emerald-400" />
              <Badge className="bg-emerald-500/20 text-emerald-400">Active</Badge>
            </div>
            <p className="text-3xl font-bold text-white">
              {statusData.find(s => s.name === 'Active/Open')?.value || 0}
            </p>
            <p className="text-xs text-slate-500">Active Items</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8 text-amber-400" />
              <Badge className="bg-amber-500/20 text-amber-400">Queries</Badge>
            </div>
            <p className="text-3xl font-bold text-white">{searchHistory.length}</p>
            <p className="text-xs text-slate-500">Search History</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-blue-400" />
              <Badge className="bg-blue-500/20 text-blue-400">Modules</Badge>
            </div>
            <p className="text-3xl font-bold text-white">8</p>
            <p className="text-xs text-slate-500">Active Modules</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module Distribution */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base">Knowledge Distribution by Module</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={moduleChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {moduleChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base">Overall Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  dataKey="value"
                  style={{ fontSize: '11px' }}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Search Terms */}
      {topSearchTerms.length > 0 && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base">Most Searched Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topSearchTerms.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-[#151d2e] rounded-lg">
                  <span className="text-sm text-slate-400 capitalize">{item.term}</span>
                  <Badge className="bg-indigo-500/20 text-indigo-400">{item.count}x</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}