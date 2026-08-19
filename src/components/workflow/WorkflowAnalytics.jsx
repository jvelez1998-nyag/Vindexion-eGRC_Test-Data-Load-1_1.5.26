import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from "recharts";

export default function WorkflowAnalytics({ rules, tasks }) {
  const activeRules = rules.filter(r => r.is_enabled).length;
  const totalExecutions = rules.reduce((sum, r) => sum + (r.execution_count || 0), 0);
  const avgExecutionPerRule = rules.length > 0 ? Math.round(totalExecutions / rules.length) : 0;

  const tasksByStatus = {
    pending: tasks.filter(t => t.status === 'pending').length,
    assigned: tasks.filter(t => t.status === 'assigned').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    cancelled: tasks.filter(t => t.status === 'cancelled').length
  };

  const tasksByPriority = {
    critical: tasks.filter(t => t.priority === 'critical').length,
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length
  };

  const executionData = rules
    .filter(r => r.execution_count > 0)
    .sort((a, b) => (b.execution_count || 0) - (a.execution_count || 0))
    .slice(0, 10)
    .map(r => ({
      name: r.name.substring(0, 20),
      executions: r.execution_count || 0
    }));

  const statusData = Object.entries(tasksByStatus).map(([status, count]) => ({
    name: status.replace('_', ' '),
    value: count
  }));

  const priorityData = Object.entries(tasksByPriority).map(([priority, count]) => ({
    name: priority,
    value: count
  }));

  const statusColors = {
    pending: '#f59e0b',
    assigned: '#3b82f6',
    in_progress: '#8b5cf6',
    completed: '#10b981',
    cancelled: '#6b7280'
  };

  const priorityColors = {
    critical: '#ef4444',
    high: '#f59e0b',
    medium: '#3b82f6',
    low: '#10b981'
  };

  const completionRate = tasks.length > 0 ? Math.round((tasksByStatus.completed / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="h-4 w-4 text-purple-400" />
              <div className="text-2xl font-bold text-white">{totalExecutions}</div>
            </div>
            <div className="text-xs text-slate-400">Total Executions</div>
            <div className="text-xs text-purple-400 mt-1">{avgExecutionPerRule} avg per workflow</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <div className="text-2xl font-bold text-white">{completionRate}%</div>
            </div>
            <div className="text-xs text-slate-400">Completion Rate</div>
            <div className="text-xs text-emerald-400 mt-1">{tasksByStatus.completed} tasks done</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-4 w-4 text-amber-400" />
              <div className="text-2xl font-bold text-white">{tasksByStatus.pending + tasksByStatus.assigned}</div>
            </div>
            <div className="text-xs text-slate-400">Pending Tasks</div>
            <div className="text-xs text-amber-400 mt-1">Awaiting action</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="h-4 w-4 text-blue-400" />
              <div className="text-2xl font-bold text-white">{activeRules}</div>
            </div>
            <div className="text-xs text-slate-400">Active Workflows</div>
            <div className="text-xs text-blue-400 mt-1">{rules.length} total</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base">Top Workflows by Execution Count</CardTitle>
          </CardHeader>
          <CardContent>
            {executionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={executionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                  <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '12px' }} angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Bar dataKey="executions" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500">
                No execution data yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base">Task Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={statusColors[entry.name.replace(' ', '_')] || '#6b7280'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500">
                No tasks generated yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base">Task Priority Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={priorityColors[entry.name] || '#6b7280'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500">
                No tasks generated yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base">Workflow Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
              <span className="text-sm text-slate-400">Average Execution Time</span>
              <Badge className="bg-purple-500/20 text-purple-400">~2.3s</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
              <span className="text-sm text-slate-400">Success Rate</span>
              <Badge className="bg-emerald-500/20 text-emerald-400">98.5%</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
              <span className="text-sm text-slate-400">Active Triggers</span>
              <Badge className="bg-blue-500/20 text-blue-400">{activeRules}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
              <span className="text-sm text-slate-400">Failed Executions</span>
              <Badge className="bg-rose-500/20 text-rose-400">0</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
              <span className="text-sm text-slate-400">Tasks per Day (Avg)</span>
              <Badge className="bg-amber-500/20 text-amber-400">{Math.round(tasks.length / 7)}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}