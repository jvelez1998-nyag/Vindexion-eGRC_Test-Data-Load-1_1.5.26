import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, Treemap, Sankey, FunnelChart, Funnel, LabelList, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Cell, RadialBarChart, RadialBar, Legend } from "recharts";
import { Activity, Network, TrendingDown, Target, Layers } from "lucide-react";

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

export default function ControlVisualizationHub({ controls = [], controlTests = [] }) {
  const [activeViz, setActiveViz] = useState("treemap");

  // Treemap data - controls by domain and category
  const treemapData = {
    name: 'Controls',
    children: Object.entries(
      controls.reduce((acc, c) => {
        const domain = c.domain || 'Other';
        if (!acc[domain]) acc[domain] = {};
        const cat = c.category || 'Other';
        if (!acc[domain][cat]) acc[domain][cat] = 0;
        acc[domain][cat]++;
        return acc;
      }, {})
    ).map(([domain, cats]) => ({
      name: domain.replace(/_/g, ' ').toUpperCase(),
      children: Object.entries(cats).map(([cat, count]) => ({
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        size: count
      }))
    }))
  };

  // Sankey data - control flow from category to status to effectiveness
  const sankeyData = {
    nodes: [
      { name: 'Preventive' }, { name: 'Detective' }, { name: 'Corrective' }, { name: 'Directive' },
      { name: 'Planned' }, { name: 'Implemented' }, { name: 'Effective' }, { name: 'Ineffective' },
      { name: 'High Eff' }, { name: 'Med Eff' }, { name: 'Low Eff' }
    ],
    links: []
  };

  controls.forEach(c => {
    const catIndex = ['preventive', 'detective', 'corrective', 'directive'].indexOf(c.category);
    const statusIndex = ['planned', 'implemented', 'effective', 'ineffective'].indexOf(c.status) + 4;
    if (catIndex >= 0 && statusIndex >= 4) {
      const existing = sankeyData.links.find(l => l.source === catIndex && l.target === statusIndex);
      if (existing) existing.value++;
      else sankeyData.links.push({ source: catIndex, target: statusIndex, value: 1 });
    }
  });

  // Funnel data - control maturity stages
  const funnelData = [
    { name: 'Identified', value: controls.length, fill: '#3b82f6' },
    { name: 'Designed', value: controls.filter(c => c.control_procedures).length, fill: '#8b5cf6' },
    { name: 'Implemented', value: controls.filter(c => c.status === 'implemented' || c.status === 'effective').length, fill: '#10b981' },
    { name: 'Tested', value: controls.filter(c => c.last_tested_date).length, fill: '#f59e0b' },
    { name: 'Effective', value: controls.filter(c => c.status === 'effective').length, fill: '#06b6d4' }
  ];

  // Radial bar - effectiveness by domain
  const radialData = Object.entries(
    controls.reduce((acc, c) => {
      if (!acc[c.domain]) acc[c.domain] = { total: 0, effective: 0 };
      acc[c.domain].total++;
      if (c.status === 'effective') acc[c.domain].effective++;
      return acc;
    }, {})
  ).map(([domain, stats], idx) => ({
    name: domain.replace(/_/g, ' ').substring(0, 15),
    value: stats.total > 0 ? Math.round((stats.effective / stats.total) * 100) : 0,
    fill: COLORS[idx % COLORS.length]
  })).slice(0, 7);

  // Bubble chart - controls by effectiveness, test frequency, and linked risks
  const bubbleData = controls.map(c => ({
    x: c.effectiveness || 0,
    y: controlTests.filter(t => t.control_id === c.id).length,
    z: (c.linked_risks?.length || 0) * 10 + 20,
    name: c.name?.substring(0, 20),
    status: c.status
  })).filter(d => d.x > 0).slice(0, 40);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-purple-500/10 border-pink-500/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20">
              <Activity className="h-7 w-7 text-pink-400" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                Advanced Control Visualizations
                <Badge className="bg-pink-500/20 text-pink-400 text-[10px]">INTERACTIVE CHARTS</Badge>
              </CardTitle>
              <p className="text-sm text-slate-400 mt-1">
                Explore control data through advanced visualization techniques
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeViz} onValueChange={setActiveViz}>
        <TabsList className="bg-[#1a2332] border border-[#2a3548] p-1">
          <TabsTrigger value="treemap" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400">
            <Layers className="h-4 w-4 mr-2" />
            Treemap
          </TabsTrigger>
          <TabsTrigger value="sankey" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Network className="h-4 w-4 mr-2" />
            Flow
          </TabsTrigger>
          <TabsTrigger value="funnel" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <TrendingDown className="h-4 w-4 mr-2" />
            Funnel
          </TabsTrigger>
          <TabsTrigger value="radial" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
            <Target className="h-4 w-4 mr-2" />
            Radial
          </TabsTrigger>
          <TabsTrigger value="bubble" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400">
            <Activity className="h-4 w-4 mr-2" />
            Bubble
          </TabsTrigger>
        </TabsList>

        <TabsContent value="treemap">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-pink-400" />
                Control Distribution Treemap
              </CardTitle>
              <p className="text-xs text-slate-400">Controls organized by domain and category (size = count)</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={500}>
                <Treemap
                  data={treemapData.children}
                  dataKey="size"
                  aspectRatio={4/3}
                  stroke="#2a3548"
                  fill="#3b82f6"
                >
                  <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }} />
                </Treemap>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sankey">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Network className="h-4 w-4 text-purple-400" />
                Control Flow Analysis
              </CardTitle>
              <p className="text-xs text-slate-400">Flow from control type to status</p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16 text-slate-500">
                <Network className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Sankey diagram showing control category → status flow</p>
                <p className="text-xs mt-1">Visual representation of control progression through lifecycle stages</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-blue-400" />
                Control Maturity Funnel
              </CardTitle>
              <p className="text-xs text-slate-400">Progression through control maturity stages</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <FunnelChart>
                  <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }} />
                  <Funnel dataKey="value" data={funnelData}>
                    <LabelList position="right" fill="#fff" stroke="none" dataKey="name" />
                    <LabelList position="inside" fill="#000" stroke="none" dataKey="value" />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="radial">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Target className="h-4 w-4 text-emerald-400" />
                Domain Effectiveness (Radial)
              </CardTitle>
              <p className="text-xs text-slate-400">Effectiveness percentage by domain</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="10%" 
                  outerRadius="90%" 
                  data={radialData}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar
                    minAngle={15}
                    background
                    clockWise={true}
                    dataKey="value"
                  />
                  <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '11px' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }} />
                </RadialBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bubble">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-violet-400" />
                Control Analysis Bubble Chart
              </CardTitle>
              <p className="text-xs text-slate-400">Effectiveness (x) vs Tests (y), bubble size = linked risks</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={450}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                  <XAxis type="number" dataKey="x" name="Effectiveness" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'Effectiveness Rating', position: 'bottom', fill: '#94a3b8', fontSize: 11 }} domain={[0, 5]} />
                  <YAxis type="number" dataKey="y" name="Tests" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'Test Count', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
                  <ZAxis type="number" dataKey="z" range={[50, 400]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                    cursor={{ strokeDasharray: '3 3' }}
                  />
                  <Scatter data={bubbleData} fill="#8b5cf6">
                    {bubbleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}