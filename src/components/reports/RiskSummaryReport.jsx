import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Badge } from "@/components/ui/badge";

export default function RiskSummaryReport({ risks, onDrillDown }) {
  const byCategoryData = risks.reduce((acc, risk) => {
    const category = risk.category || 'Other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const bySeverityData = risks.reduce((acc, risk) => {
    const score = (risk.likelihood || 0) * (risk.impact || 0);
    let severity = 'Low';
    if (score >= 16) severity = 'Critical';
    else if (score >= 9) severity = 'High';
    else if (score >= 4) severity = 'Medium';
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {});

  const byStatusData = risks.reduce((acc, risk) => {
    acc[risk.status] = (acc[risk.status] || 0) + 1;
    return acc;
  }, {});

  const categoryData = Object.entries(byCategoryData).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  const severityData = [
    { name: 'Critical', value: bySeverityData['Critical'] || 0, color: '#ef4444' },
    { name: 'High', value: bySeverityData['High'] || 0, color: '#f59e0b' },
    { name: 'Medium', value: bySeverityData['Medium'] || 0, color: '#eab308' },
    { name: 'Low', value: bySeverityData['Low'] || 0, color: '#10b981' }
  ].filter(d => d.value > 0);

  const categoryColors = ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a2332] border border-[#2a3548] rounded-lg px-3 py-2 shadow-xl">
          <p className="text-xs text-white font-medium">{payload[0].name}</p>
          <p className="text-xs text-slate-400">{payload[0].value} risks</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader className="pb-2">
        <div 
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => onDrillDown?.('All Risks', risks)}
        >
          <CardTitle className="text-base font-semibold text-white">Risk Summary</CardTitle>
          <p className="text-xs text-slate-500">{risks.length} total risks tracked</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">By Category</p>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={55}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                    style={{ cursor: 'pointer' }}
                    onClick={(data) => {
                      const categoryRisks = risks.filter(r => (r.category || 'Other').toLowerCase() === data.name.toLowerCase());
                      onDrillDown?.(`${data.name} Risks`, categoryRisks);
                    }}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">By Severity</p>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={55}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                    style={{ cursor: 'pointer' }}
                    onClick={(data) => {
                      const severityRisks = risks.filter(r => {
                        const score = (r.likelihood || 0) * (r.impact || 0);
                        if (data.name === 'Critical') return score >= 16;
                        if (data.name === 'High') return score >= 9 && score < 16;
                        if (data.name === 'Medium') return score >= 4 && score < 9;
                        return score < 4;
                      });
                      onDrillDown?.(`${data.name} Severity Risks`, severityRisks);
                    }}
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-[#2a3548]">
          <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">By Status</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(byStatusData).map(([status, count]) => (
              <Badge 
                key={status} 
                variant="outline" 
                className="bg-[#151d2e] text-white border-[#2a3548] cursor-pointer hover:bg-[#2a3548] transition-colors"
                onClick={() => onDrillDown?.(`${status.replace(/_/g, ' ')} Risks`, risks.filter(r => r.status === status))}
              >
                {status.replace(/_/g, ' ')}: {count}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}