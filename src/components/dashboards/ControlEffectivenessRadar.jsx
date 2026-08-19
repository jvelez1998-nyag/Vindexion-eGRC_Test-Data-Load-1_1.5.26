import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts";

export default function ControlEffectivenessRadar() {
  const { data: controls = [], isLoading } = useQuery({
    queryKey: ['controls'],
    queryFn: () => base44.entities.Control.list('-updated_date', 100)
  });

  const domainMap = {};
  controls.forEach(control => {
    if (!domainMap[control.domain]) {
      domainMap[control.domain] = { total: 0, effectiveness: 0 };
    }
    domainMap[control.domain].total++;
    domainMap[control.domain].effectiveness += (control.effectiveness || 3);
  });

  const radarData = Object.entries(domainMap).map(([domain, data]) => ({
    domain: domain.replace(/_/g, ' '),
    effectiveness: Math.round((data.effectiveness / data.total) * 20),
    target: 80
  }));

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
        <CardTitle className="text-base">Control Effectiveness by Domain</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#2a3548" />
            <PolarAngleAxis dataKey="domain" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
            <Radar name="Current" dataKey="effectiveness" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
            <Radar name="Target" dataKey="target" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}