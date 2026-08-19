import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function IncidentReport({ incidents, onDrillDown }) {
  const severityData = [
    { name: 'Critical', value: incidents.filter(i => i.severity === 'critical').length, color: '#ef4444' },
    { name: 'High', value: incidents.filter(i => i.severity === 'high').length, color: '#f59e0b' },
    { name: 'Medium', value: incidents.filter(i => i.severity === 'medium').length, color: '#eab308' },
    { name: 'Low', value: incidents.filter(i => i.severity === 'low').length, color: '#10b981' }
  ];

  const typeData = incidents.reduce((acc, i) => {
    const type = i.incident_type || 'other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const typeChartData = Object.entries(typeData).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value
  }));

  const openIncidents = incidents.filter(i => !['closed', 'remediated'].includes(i.status)).length;
  const avgResolutionTime = incidents.filter(i => i.resolution_date && i.reported_date).length;

  return (
    <Card className="bg-[#1a2332] border-[#2a3548] p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-rose-500/10">
          <AlertTriangle className="h-5 w-5 text-rose-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Incident Management</h3>
          <p className="text-sm text-slate-500">{incidents.length} total incidents</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#151d2e] rounded-lg p-3 border border-[#2a3548]">
          <p className="text-xs text-slate-500 mb-1">Open Incidents</p>
          <p className="text-2xl font-bold text-white">{openIncidents}</p>
        </div>
        <div className="bg-[#151d2e] rounded-lg p-3 border border-[#2a3548]">
          <p className="text-xs text-slate-500 mb-1">Critical</p>
          <p className="text-2xl font-bold text-rose-400">{severityData[0].value}</p>
        </div>
        <div className="bg-[#151d2e] rounded-lg p-3 border border-[#2a3548]">
          <p className="text-xs text-slate-500 mb-1">This Month</p>
          <p className="text-2xl font-bold text-white">
            {incidents.filter(i => new Date(i.reported_date) > new Date(Date.now() - 30*24*60*60*1000)).length}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-3">Incidents by Severity</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={severityData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-3">Incidents by Type</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={typeChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548' }} />
              <Bar dataKey="value" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}