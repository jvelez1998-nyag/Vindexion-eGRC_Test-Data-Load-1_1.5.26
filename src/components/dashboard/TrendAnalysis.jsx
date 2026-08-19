import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Calendar } from "lucide-react";
import { subDays, format, isAfter, isBefore } from "date-fns";
import DrillDownModal from "@/components/ui/drill-down-modal";
import { memo } from "react";

const TrendAnalysis = memo(function TrendAnalysis({ risks = [], compliance = [], controls = [], incidents = [] }) {
  const [period, setPeriod] = useState(30);
  const [drillDown, setDrillDown] = useState({ open: false, title: '', data: null, type: '' });

  const generateTrendData = () => {
    const days = period;
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const dateStr = format(date, 'MMM d');

      // Count items created up to this date
      const risksUpTo = Array.isArray(risks) ? risks.filter(r => r && r.created_date && new Date(r.created_date) <= date).length : 0;
      const complianceUpTo = Array.isArray(compliance) ? compliance.filter(c => c && c.created_date && new Date(c.created_date) <= date).length : 0;
      const controlsUpTo = Array.isArray(controls) ? controls.filter(c => c && c.created_date && new Date(c.created_date) <= date).length : 0;
      const incidentsUpTo = Array.isArray(incidents) ? incidents.filter(i => i && i.created_date && new Date(i.created_date) <= date).length : 0;

      // Count open/active items at this date
      const openRisks = Array.isArray(risks) ? risks.filter(r => 
        r && r.created_date && new Date(r.created_date) <= date && 
        (r.status !== 'closed' || !r.updated_date || new Date(r.updated_date) > date)
      ).length : 0;

      const criticalRisks = Array.isArray(risks) ? risks.filter(r => {
        if (!r) return false;
        const isCreatedBefore = r.created_date && new Date(r.created_date) <= date;
        const score = (r.likelihood || 0) * (r.impact || 0);
        return isCreatedBefore && score >= 16;
      }).length : 0;

      const effectiveControls = Array.isArray(controls) ? controls.filter(c =>
        c && c.created_date && new Date(c.created_date) <= date && c.status === 'effective'
      ).length : 0;

      data.push({
        date: dateStr,
        openRisks,
        criticalRisks,
        effectiveControls,
        totalIncidents: incidentsUpTo
      });
    }

    return data;
  };

  const trendData = generateTrendData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a2332] border border-[#2a3548] rounded-lg px-3 py-2 shadow-xl">
          <p className="text-xs text-white font-medium mb-1">{label}</p>
          {payload.map((entry, idx) => (
            <p key={idx} className="text-xs" style={{ color: entry.color }}>
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
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
              Historical GRC Metrics Trend
            </CardTitle>
            <p className="text-xs text-slate-400 mt-1">Track risk exposure, control effectiveness, and incident volume over time</p>
          </div>
          <Tabs value={period.toString()} onValueChange={(v) => setPeriod(Number(v))}>
            <TabsList className="h-8 bg-[#151d2e] border border-[#2a3548]">
              <TabsTrigger value="30" className="h-6 text-xs data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">30d</TabsTrigger>
              <TabsTrigger value="60" className="h-6 text-xs data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">60d</TabsTrigger>
              <TabsTrigger value="90" className="h-6 text-xs data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">90d</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={trendData}
              onClick={(data) => {
                if (data && data.activePayload && data.activePayload.length > 0) {
                  const point = data.activePayload[0].payload;
                  const date = point.date;
                  setDrillDown({ 
                    open: true, 
                    title: `Metrics for ${date}`, 
                    data: {
                      openRisks: Array.isArray(risks) ? risks.filter(r => r && r.created_date && new Date(r.created_date) <= new Date() && r.status !== 'closed').slice(0, point.openRisks) : [],
                      criticalRisks: Array.isArray(risks) ? risks.filter(r => r && ((r.likelihood || 0) * (r.impact || 0)) >= 16).slice(0, point.criticalRisks) : [],
                      effectiveControls: Array.isArray(controls) ? controls.filter(c => c && c.status === 'effective').slice(0, point.effectiveControls) : [],
                      incidents: incidents.slice(0, point.totalIncidents)
                    }, 
                    type: 'trend' 
                  });
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                fontSize={11}
                tickLine={false}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={11}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '11px' }}
                iconType="line"
              />
              <Line 
                type="monotone" 
                dataKey="openRisks" 
                name="Open Risks"
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 0, cursor: 'pointer' }}
              />
              <Line 
                type="monotone" 
                dataKey="criticalRisks" 
                name="Critical Risks"
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 0, cursor: 'pointer' }}
              />
              <Line 
                type="monotone" 
                dataKey="effectiveControls" 
                name="Effective Controls"
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 0, cursor: 'pointer' }}
              />
              <Line 
                type="monotone" 
                dataKey="totalIncidents" 
                name="Total Incidents"
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 0, cursor: 'pointer' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>

      <DrillDownModal 
        open={drillDown.open}
        onClose={() => setDrillDown({ open: false, title: '', data: null, type: '' })}
        title={drillDown.title}
        data={drillDown.data}
        type={drillDown.type}
      />
    </Card>
  );
});

export default TrendAnalysis;