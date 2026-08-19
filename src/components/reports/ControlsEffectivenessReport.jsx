import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { Badge } from "@/components/ui/badge";

export default function ControlsEffectivenessReport({ controls, onDrillDown }) {
  const byDomain = controls.reduce((acc, control) => {
    const domain = control.domain?.replace(/_/g, ' ') || 'Other';
    if (!acc[domain]) {
      acc[domain] = { total: 0, totalEffectiveness: 0 };
    }
    acc[domain].total++;
    acc[domain].totalEffectiveness += control.effectiveness || 0;
    return acc;
  }, {});

  const domainData = Object.entries(byDomain)
    .map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      effectiveness: data.total > 0 ? Math.round((data.totalEffectiveness / data.total) * 20) : 0,
      count: data.total
    }))
    .sort((a, b) => b.effectiveness - a.effectiveness)
    .slice(0, 6);

  const byCategory = controls.reduce((acc, control) => {
    const category = control.category || 'Other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const effectiveControls = controls.filter(c => c.status === 'effective').length;
  const avgEffectiveness = controls.length > 0 
    ? Math.round(controls.reduce((sum, c) => sum + (c.effectiveness || 0), 0) / controls.length * 20)
    : 0;

  const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a2332] border border-[#2a3548] rounded-lg px-3 py-2 shadow-xl">
          <p className="text-xs text-white font-medium">{payload[0].payload.name}</p>
          <p className="text-xs text-indigo-400">{payload[0].value}% effectiveness</p>
          <p className="text-xs text-slate-400">{payload[0].payload.count} controls</p>
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
            onClick={() => onDrillDown?.('All Controls', controls)}
          >
            <CardTitle className="text-base font-semibold text-white">Controls Effectiveness</CardTitle>
            <p className="text-xs text-slate-500">{controls.length} controls tracked</p>
          </div>
          <div className="flex gap-4">
            <div 
              className="text-right cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onDrillDown?.('Effective Controls', controls.filter(c => c.status === 'effective'))}
            >
              <p className="text-xl font-bold text-emerald-400">{effectiveControls}</p>
              <p className="text-[10px] text-slate-500 uppercase">Effective</p>
            </div>
            <div 
              className="text-right cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onDrillDown?.('All Controls', controls)}
            >
              <p className="text-xl font-bold text-indigo-400">{avgEffectiveness}%</p>
              <p className="text-[10px] text-slate-500 uppercase">Avg Rating</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-44 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={domainData} layout="vertical" margin={{ left: 0, right: 10 }}>
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={80} 
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#2a3548' }} />
              <Bar 
                dataKey="effectiveness" 
                radius={[0, 4, 4, 0]}
                barSize={16}
                style={{ cursor: 'pointer' }}
                onClick={(data) => {
                  const domainControls = controls.filter(c => (c.domain?.replace(/_/g, ' ') || 'Other').toLowerCase() === data.name.toLowerCase());
                  onDrillDown?.(`${data.name} Controls`, domainControls);
                }}
              >
                {domainData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="pt-3 border-t border-[#2a3548]">
          <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">By Category</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(byCategory).map(([category, count]) => (
              <Badge 
                key={category} 
                variant="outline" 
                className="bg-[#151d2e] text-white border-[#2a3548] capitalize cursor-pointer hover:bg-[#2a3548] transition-colors"
                onClick={() => onDrillDown?.(`${category} Controls`, controls.filter(c => c.category === category))}
              >
                {category}: {count}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}