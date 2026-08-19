import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, AlertTriangle, CheckCircle2, Clock, Zap, Target } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";

export default function ComplianceAssistantDashboard({ compliance, onStartChat }) {
  const totalRequirements = compliance.length;
  const implemented = compliance.filter(c => c.status === 'implemented' || c.status === 'verified').length;
  const inProgress = compliance.filter(c => c.status === 'in_progress').length;
  const notStarted = compliance.filter(c => c.status === 'not_started').length;
  const complianceRate = totalRequirements > 0 ? Math.round((implemented / totalRequirements) * 100) : 0;

  const statusData = [
    { name: 'Implemented', value: implemented, color: '#10b981' },
    { name: 'In Progress', value: inProgress, color: '#3b82f6' },
    { name: 'Not Started', value: notStarted, color: '#64748b' },
    { name: 'Non-Compliant', value: compliance.filter(c => c.status === 'non_compliant').length, color: '#ef4444' }
  ];

  const frameworkData = Object.entries(
    compliance.reduce((acc, c) => {
      acc[c.framework] = (acc[c.framework] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const topGaps = compliance.filter(c => c.status === 'not_started' || c.status === 'non_compliant').slice(0, 5);
  const overdueItems = compliance.filter(c => c.due_date && new Date(c.due_date) < new Date() && c.status !== 'implemented');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">🤖 AI Compliance Command Center</h2>
          <p className="text-sm text-slate-400">Intelligent monitoring • Predictive insights • Automated guidance</p>
        </div>
        <Button onClick={onStartChat} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/20">
          <Brain className="h-4 w-4 mr-2" />
          Launch AI Assistant
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20 hover:scale-[1.02] transition-all cursor-pointer">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{complianceRate}%</div>
                <Badge className="mt-1 bg-emerald-500/20 text-emerald-400 text-[9px]">
                  +3% this month
                </Badge>
              </div>
            </div>
            <div className="text-sm font-semibold text-white">Compliance Rate</div>
            <div className="text-xs text-emerald-400 mt-1">{implemented} of {totalRequirements} requirements</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 hover:scale-[1.02] transition-all cursor-pointer">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-500/30 shadow-lg shadow-blue-500/10">
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{inProgress}</div>
                <Badge className="mt-1 bg-blue-500/20 text-blue-400 text-[9px]">
                  {Math.round((inProgress/totalRequirements)*100)}%
                </Badge>
              </div>
            </div>
            <div className="text-sm font-semibold text-white">In Progress</div>
            <div className="text-xs text-blue-400 mt-1">Active implementation</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 hover:scale-[1.02] transition-all cursor-pointer">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 shadow-lg shadow-amber-500/10">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{notStarted}</div>
                <Badge className="mt-1 bg-amber-500/20 text-amber-400 text-[9px]">
                  Needs attention
                </Badge>
              </div>
            </div>
            <div className="text-sm font-semibold text-white">Not Started</div>
            <div className="text-xs text-amber-400 mt-1">Pending requirements</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20 hover:scale-[1.02] transition-all cursor-pointer">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-violet-500/20 border border-violet-500/30 shadow-lg shadow-violet-500/10">
                <Zap className="h-5 w-5 text-violet-400" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{frameworkData.length}</div>
                <Badge className="mt-1 bg-violet-500/20 text-violet-400 text-[9px]">
                  Active
                </Badge>
              </div>
            </div>
            <div className="text-sm font-semibold text-white">Frameworks</div>
            <div className="text-xs text-violet-400 mt-1">Compliance standards</div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Alerts */}
      {(topGaps.length > 0 || overdueItems.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {topGaps.length > 0 && (
            <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                  Priority Gaps ({topGaps.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topGaps.map((item, idx) => (
                    <div key={idx} className="p-2 rounded bg-[#1a2332] border border-rose-500/20 text-xs">
                      <div className="font-semibold text-white mb-1">{item.framework}</div>
                      <div className="text-slate-400 line-clamp-1">{item.requirement}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {overdueItems.length > 0 && (
            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-400" />
                  Overdue Items ({overdueItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {overdueItems.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="p-2 rounded bg-[#1a2332] border border-amber-500/20 text-xs">
                      <div className="font-semibold text-white mb-1">{item.framework}</div>
                      <div className="text-slate-400 line-clamp-1">{item.requirement}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white">Compliance Status</CardTitle>
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

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white">Requirements by Framework</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={frameworkData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548' }} />
                <Bar dataKey="value" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}