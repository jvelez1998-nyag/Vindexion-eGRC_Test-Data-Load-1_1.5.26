import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, Cell } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

export default function AuditFindingsReport({ audits, onDrillDown }) {
  const findingsData = audits
    .filter(a => a.findings_count > 0)
    .map(a => ({
      name: a.title?.substring(0, 15) + (a.title?.length > 15 ? '...' : ''),
      findings: (a.findings_count || 0) - (a.critical_findings || 0),
      critical: a.critical_findings || 0,
      total: a.findings_count || 0
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const byType = audits.reduce((acc, audit) => {
    const type = audit.type || 'Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const upcomingAudits = audits
    .filter(a => a.status === 'planned' && a.start_date)
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
    .slice(0, 3);

  const totalAudits = audits.length;
  const completedAudits = audits.filter(a => a.status === 'completed').length;
  const totalFindings = audits.reduce((sum, a) => sum + (a.findings_count || 0), 0);
  const criticalFindings = audits.reduce((sum, a) => sum + (a.critical_findings || 0), 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a2332] border border-[#2a3548] rounded-lg px-3 py-2 shadow-xl">
          <p className="text-xs text-white font-medium mb-1">{payload[0]?.payload.name}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div 
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onDrillDown?.('All Audits', audits)}
          >
            <CardTitle className="text-base font-semibold text-white">Audit Findings</CardTitle>
            <p className="text-xs text-slate-500">{totalAudits} audits tracked</p>
          </div>
          <div className="flex gap-4">
            <div 
              className="text-right cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onDrillDown?.('Completed Audits', audits.filter(a => a.status === 'completed'))}
            >
              <p className="text-xl font-bold text-emerald-400">{completedAudits}</p>
              <p className="text-[10px] text-slate-500 uppercase">Completed</p>
            </div>
            <div 
              className="text-right cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onDrillDown?.('Audits with Findings', audits.filter(a => a.findings_count > 0))}
            >
              <p className="text-xl font-bold text-amber-400">{totalFindings}</p>
              <p className="text-[10px] text-slate-500 uppercase">Findings</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {findingsData.length > 0 && (
          <div className="h-36 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={findingsData} layout="vertical" margin={{ left: 0, right: 10 }}>
                <XAxis type="number" hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={70} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#2a3548' }} />
                <Bar 
                  dataKey="findings" 
                  stackId="a" 
                  fill="#6366f1" 
                  name="Other" 
                  radius={[0, 0, 0, 0]} 
                  barSize={14}
                  style={{ cursor: 'pointer' }}
                  onClick={(data) => {
                    const audit = audits.find(a => a.title?.substring(0, 15) === data.name.replace('...', ''));
                    if (audit) onDrillDown?.(`${audit.title}`, [audit]);
                  }}
                />
                <Bar 
                  dataKey="critical" 
                  stackId="a" 
                  fill="#ef4444" 
                  name="Critical" 
                  radius={[0, 4, 4, 0]} 
                  barSize={14}
                  style={{ cursor: 'pointer' }}
                  onClick={(data) => {
                    const audit = audits.find(a => a.title?.substring(0, 15) === data.name.replace('...', ''));
                    if (audit) onDrillDown?.(`${audit.title}`, [audit]);
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#2a3548]">
          <div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">By Type</p>
            <div className="space-y-1">
              {Object.entries(byType).map(([type, count]) => (
                <Badge 
                  key={type} 
                  variant="outline" 
                  className="bg-[#151d2e] text-white border-[#2a3548] capitalize mr-1 cursor-pointer hover:bg-[#2a3548] transition-colors"
                  onClick={() => onDrillDown?.(`${type} Audits`, audits.filter(a => a.type === type))}
                >
                  {type}: {count}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Upcoming</p>
            {upcomingAudits.length === 0 ? (
              <p className="text-xs text-slate-500">No upcoming audits</p>
            ) : (
              <div className="space-y-1">
                {upcomingAudits.map(audit => (
                  <div 
                    key={audit.id} 
                    className="flex items-center gap-2 text-xs cursor-pointer hover:bg-[#151d2e] p-1 -mx-1 rounded transition-colors"
                    onClick={() => onDrillDown?.(`${audit.title}`, [audit])}
                  >
                    <Calendar className="h-3 w-3 text-slate-500" />
                    <span className="text-white truncate">{audit.title}</span>
                    <span className="text-slate-500">{format(new Date(audit.start_date), 'MMM d')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}