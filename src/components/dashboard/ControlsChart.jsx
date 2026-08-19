import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

export default function ControlsChart({ controls, onBarClick }) {
  const domainCounts = controls.reduce((acc, control) => {
    const domain = control.domain?.replace(/_/g, ' ') || 'Other';
    acc[domain] = (acc[domain] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(domainCounts)
    .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a2332] border border-[#2a3548] rounded-lg px-3 py-2 shadow-xl">
          <p className="text-xs text-white font-medium">{payload[0].payload.name}</p>
          <p className="text-xs text-indigo-400">{payload[0].value} controls</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-white">Controls by Domain</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Distribution across security domains</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{controls.length}</p>
            <p className="text-[10px] text-slate-500 uppercase">Total Controls</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={100} 
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#2a3548' }} />
              <Bar 
                dataKey="value" 
                radius={[0, 6, 6, 0]}
                barSize={20}
                cursor="pointer"
                onClick={(data) => onBarClick && onBarClick(data.name)}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}