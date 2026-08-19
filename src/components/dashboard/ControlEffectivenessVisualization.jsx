import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import DrillDownModal from "@/components/ui/drill-down-modal";

export default function ControlEffectivenessVisualization({ controls, expanded }) {
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [drillDown, setDrillDown] = useState({ open: false, title: '', data: null, type: '' });

  const safeControls = Array.isArray(controls) ? controls.filter(c => c) : [];
  
  const effectivenessData = [
    { name: 'Effective', value: safeControls.filter(c => c.status === 'effective').length, color: '#10b981' },
    { name: 'Implemented', value: safeControls.filter(c => c.status === 'implemented').length, color: '#3b82f6' },
    { name: 'Ineffective', value: safeControls.filter(c => c.status === 'ineffective').length, color: '#ef4444' },
    { name: 'Planned', value: safeControls.filter(c => c.status === 'planned').length, color: '#94a3b8' }
  ];

  const domainData = Object.entries(
    safeControls.reduce((acc, c) => {
      const domain = c.domain || 'other';
      acc[domain] = (acc[domain] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value,
    controls: safeControls.filter(c => c.domain === name)
  }));

  const handleDomainClick = (data) => {
    setSelectedDomain(data);
    setDrillDownOpen(true);
  };

  const stageData = [
    { name: 'Design', value: safeControls.filter(c => c.workflow_stage === 'design' || c.status === 'planned').length, color: '#818cf8' },
    { name: 'Implementation', value: safeControls.filter(c => c.workflow_stage === 'implementation' || c.status === 'implemented').length, color: '#60a5fa' },
    { name: 'Testing', value: safeControls.filter(c => c.workflow_stage === 'testing').length, color: '#fbbf24' },
    { name: 'Operational', value: safeControls.filter(c => c.workflow_stage === 'operational' || c.status === 'effective').length, color: '#34d399' },
    { name: 'Review', value: safeControls.filter(c => c.workflow_stage === 'review' || c.status === 'ineffective').length, color: '#f87171' }
  ].filter(d => d.value > 0);

  return (
    <>
      <div className="space-y-6">
        {/* Control Lifecycle Stage Distribution */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-1">Control Lifecycle Stage Distribution</h3>
          <p className="text-xs text-slate-400 mb-3">Distribution of controls across implementation lifecycle stages</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={stageData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={75}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                style={{ fontSize: '11px', fontWeight: '500', fill: '#e2e8f0' }}
                labelLine={{ stroke: '#94a3b8' }}
              >
                {stageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
                labelStyle={{ color: '#ffffff', fontSize: '12px', fontWeight: '600' }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Stage Summary Grid */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            {stageData.map((stage, idx) => (
              <div 
                key={idx} 
                className="bg-[#151d2e] rounded-lg p-2 border border-[#2a3548] text-center cursor-pointer hover:bg-[#1e2a3d] transition-colors"
                onClick={() => setDrillDown({ 
                  open: true, 
                  title: `${stage.name} Stage Controls`, 
                  data: safeControls.filter(c => {
                    if (stage.name === 'Design') return c.workflow_stage === 'design' || c.status === 'planned';
                    if (stage.name === 'Implementation') return c.workflow_stage === 'implementation' || c.status === 'implemented';
                    if (stage.name === 'Testing') return c.workflow_stage === 'testing';
                    if (stage.name === 'Operational') return c.workflow_stage === 'operational' || c.status === 'effective';
                    if (stage.name === 'Review') return c.workflow_stage === 'review' || c.status === 'ineffective';
                    return false;
                  }), 
                  type: 'control' 
                })}
              >
                <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ backgroundColor: stage.color }} />
                <p className="text-xs text-slate-400">{stage.name}</p>
                <p className="text-base font-bold text-white">{stage.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart by Domain - Horizontal */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-1">Controls by Domain</h3>
          <p className="text-xs text-slate-400 mb-3">Click any bar to view detailed control breakdown by security domain</p>
          <ResponsiveContainer width="100%" height={Math.max(domainData.length * 35, 200)}>
            <BarChart data={domainData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
              <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#e2e8f0', fontSize: 11 }} />
              <YAxis 
                type="category"
                dataKey="name" 
                stroke="#94a3b8" 
                tick={{ fill: '#e2e8f0', fontSize: 11 }}
                width={120}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
                labelStyle={{ color: '#ffffff', fontSize: '12px', fontWeight: '600' }}
                cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
              />
              <Bar 
                dataKey="value" 
                onClick={handleDomainClick}
                cursor="pointer"
                radius={[0, 8, 8, 0]}
              >
                {domainData.map((entry, index) => {
                  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#14b8a6'];
                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#151d2e] rounded-lg p-3 border border-[#2a3548]">
            <p className="text-xs text-slate-500 mb-1">Total Controls</p>
            <p className="text-2xl font-bold text-white">{safeControls.length}</p>
          </div>
          <div className="bg-[#151d2e] rounded-lg p-3 border border-[#2a3548]">
            <p className="text-xs text-slate-500 mb-1">Operational Rate</p>
            <p className="text-2xl font-bold text-emerald-400">
              {safeControls.length ? Math.round((stageData.find(s => s.name === 'Operational')?.value || 0) / safeControls.length * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Drill-down Dialog */}
      <Dialog open={drillDownOpen} onOpenChange={setDrillDownOpen}>
        <DialogContent className="max-w-3xl bg-[#1a2332] border-[#2a3548] text-white">
          <DialogHeader>
            <DialogTitle className="capitalize">
              {selectedDomain?.name} Controls ({selectedDomain?.controls?.length})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {selectedDomain?.controls?.map(control => (
              <div key={control.id} className="bg-[#151d2e] rounded-lg p-4 border border-[#2a3548]">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-white">{control.name}</h3>
                  <Badge className={
                    control.status === 'effective' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    control.status === 'implemented' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    control.status === 'ineffective' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                    'bg-slate-500/10 text-slate-400 border-slate-500/20'
                  }>
                    {control.status}
                  </Badge>
                </div>
                <p className="text-sm text-slate-400 mb-2">{control.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>Category: {control.category}</span>
                  {control.effectiveness && <span>Rating: {control.effectiveness}/5</span>}
                  {control.owner && <span>Owner: {control.owner}</span>}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <DrillDownModal 
        open={drillDown.open}
        onClose={() => setDrillDown({ open: false, title: '', data: null, type: '' })}
        title={drillDown.title}
        data={drillDown.data}
        type={drillDown.type}
      />
    </>
  );
}