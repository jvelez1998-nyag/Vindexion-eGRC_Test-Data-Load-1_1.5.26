import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, Cell } from "recharts";

export default function InteractiveRiskHeatmap({ correlatedFactors = false }) {
  const { data: risks = [], isLoading } = useQuery({
    queryKey: ['risks'],
    queryFn: () => base44.entities.Risk.list('-updated_date', 100)
  });

  const heatmapData = risks.map(risk => ({
    name: risk.title,
    likelihood: risk.residual_likelihood || risk.likelihood || 3,
    impact: risk.residual_impact || risk.impact || 3,
    score: (risk.residual_risk_score || risk.dynamic_score || ((risk.likelihood || 3) * (risk.impact || 3))),
    category: risk.category,
    status: risk.status
  }));

  const getColor = (score) => {
    if (score >= 20) return '#ef4444';
    if (score >= 15) return '#f97316';
    if (score >= 10) return '#f59e0b';
    if (score >= 5) return '#eab308';
    return '#22c55e';
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#1a2332] border border-[#2a3548] p-3 rounded shadow-lg">
          <p className="text-white font-semibold text-sm mb-1">{data.name}</p>
          <p className="text-xs text-slate-400">Likelihood: {data.likelihood}</p>
          <p className="text-xs text-slate-400">Impact: {data.impact}</p>
          <p className="text-xs text-slate-400">Score: {data.score}</p>
          <p className="text-xs text-slate-400">Category: {data.category}</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <CardTitle className="text-base">Risk Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
            <XAxis 
              type="number" 
              dataKey="likelihood" 
              name="Likelihood" 
              domain={[0, 6]}
              label={{ value: 'Likelihood', position: 'insideBottom', offset: -10, fill: '#94a3b8' }}
              stroke="#94a3b8"
            />
            <YAxis 
              type="number" 
              dataKey="impact" 
              name="Impact" 
              domain={[0, 6]}
              label={{ value: 'Impact', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
              stroke="#94a3b8"
            />
            <ZAxis type="number" dataKey="score" range={[100, 1000]} />
            <Tooltip content={<CustomTooltip />} />
            <Scatter data={heatmapData}>
              {heatmapData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.score)} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}