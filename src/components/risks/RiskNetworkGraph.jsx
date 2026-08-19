import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Network, Download, ZoomIn, Maximize2, Info } from "lucide-react";
import { Sankey, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import DrillDownModal from "@/components/ui/drill-down-modal";

export default function RiskNetworkGraph({ risks = [], controls = [], incidents = [] }) {
  const [viewType, setViewType] = useState("category");
  const [drillDown, setDrillDown] = useState({ open: false, title: '', data: null });

  // Build network data based on view type
  const networkData = useMemo(() => {
    if (viewType === "category") {
      // Risk categories -> Risk level -> Treatment strategy
      const categories = {};
      const levels = { critical: 0, high: 0, medium: 0, low: 0 };
      const treatments = { avoid: 0, reduce: 0, transfer: 0, accept: 0 };

      risks.forEach(risk => {
        const category = risk.category || 'other';
        categories[category] = (categories[category] || 0) + 1;

        const score = risk.residual_risk_score || ((risk.residual_likelihood || 0) * (risk.residual_impact || 0));
        if (score >= 16) levels.critical++;
        else if (score >= 12) levels.high++;
        else if (score >= 6) levels.medium++;
        else levels.low++;

        const treatment = risk.risk_treatment_strategy || 'accept';
        treatments[treatment] = (treatments[treatment] || 0) + 1;
      });

      const nodes = [
        ...Object.keys(categories).map(cat => ({ name: cat })),
        { name: 'Critical' }, { name: 'High' }, { name: 'Medium' }, { name: 'Low' },
        { name: 'Avoid' }, { name: 'Reduce' }, { name: 'Transfer' }, { name: 'Accept' }
      ];

      const links = [];
      
      // Category to Level connections
      risks.forEach(risk => {
        const score = risk.residual_risk_score || ((risk.residual_likelihood || 0) * (risk.residual_impact || 0));
        let level;
        if (score >= 16) level = 'Critical';
        else if (score >= 12) level = 'High';
        else if (score >= 6) level = 'Medium';
        else level = 'Low';

        const sourceIdx = nodes.findIndex(n => n.name === (risk.category || 'other'));
        const targetIdx = nodes.findIndex(n => n.name === level);
        
        if (sourceIdx !== -1 && targetIdx !== -1) {
          const existing = links.find(l => l.source === sourceIdx && l.target === targetIdx);
          if (existing) existing.value++;
          else links.push({ source: sourceIdx, target: targetIdx, value: 1 });
        }
      });

      // Level to Treatment connections
      risks.forEach(risk => {
        const score = risk.residual_risk_score || ((risk.residual_likelihood || 0) * (risk.residual_impact || 0));
        let level;
        if (score >= 16) level = 'Critical';
        else if (score >= 12) level = 'High';
        else if (score >= 6) level = 'Medium';
        else level = 'Low';

        const treatment = risk.risk_treatment_strategy || 'Accept';
        const treatmentName = treatment.charAt(0).toUpperCase() + treatment.slice(1);

        const sourceIdx = nodes.findIndex(n => n.name === level);
        const targetIdx = nodes.findIndex(n => n.name === treatmentName);
        
        if (sourceIdx !== -1 && targetIdx !== -1) {
          const existing = links.find(l => l.source === sourceIdx && l.target === targetIdx);
          if (existing) existing.value++;
          else links.push({ source: sourceIdx, target: targetIdx, value: 1 });
        }
      });

      return { nodes, links };
    } else {
      // Risk -> Controls flow
      const riskNodes = risks.slice(0, 10).map(r => ({ name: r.title?.substring(0, 20) || 'Unknown' }));
      const controlNodes = controls.slice(0, 10).map(c => ({ name: c.name?.substring(0, 20) || 'Unknown' }));
      const nodes = [...riskNodes, ...controlNodes];

      const links = [];
      risks.slice(0, 10).forEach((risk, idx) => {
        if (risk.linked_controls?.length > 0) {
          risk.linked_controls.slice(0, 2).forEach(controlId => {
            const control = controls.find(c => c.id === controlId);
            if (control) {
              const targetIdx = nodes.findIndex(n => n.name === (control.name?.substring(0, 20) || 'Unknown'));
              if (targetIdx !== -1) {
                links.push({ source: idx, target: targetIdx, value: 1 });
              }
            }
          });
        }
      });

      return { nodes, links };
    }
  }, [risks, controls, viewType]);

  // Convert to visualization format
  const vizData = useMemo(() => {
    if (!networkData.nodes.length) return [];

    const nodeMap = new Map();
    networkData.nodes.forEach((node, idx) => {
      nodeMap.set(idx, node.name);
    });

    return networkData.links.map(link => ({
      source: nodeMap.get(link.source),
      target: nodeMap.get(link.target),
      value: link.value
    }));
  }, [networkData]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f1623] border border-[#2a3548] rounded-lg p-3 shadow-lg">
          <p className="text-xs text-white font-semibold mb-1">
            {payload[0].payload.source} → {payload[0].payload.target}
          </p>
          <p className="text-xs text-slate-400">
            {payload[0].value} risk{payload[0].value !== 1 ? 's' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  const handleExport = () => {
    const json = JSON.stringify({ nodes: networkData.nodes, links: networkData.links }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `risk-network-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success("Network data exported");
  };

  return (
    <>
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                <Network className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Risk Interdependency Network</CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visualizing risk relationships and flows
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={viewType} onValueChange={setViewType}>
                <SelectTrigger className="w-48 h-9 bg-[#0f1623] border-[#2a3548] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  <SelectItem value="category">Category → Level → Treatment</SelectItem>
                  <SelectItem value="controls">Risk → Controls</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="bg-[#0f1623] border-[#2a3548] text-slate-300 hover:bg-[#1a2332]"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Info Banner */}
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
              <Info className="h-4 w-4 text-purple-400 flex-shrink-0" />
              <p className="text-xs text-slate-300">
                This network diagram shows how risks flow through categories, severity levels, and treatment strategies, helping identify patterns and dependencies.
              </p>
            </div>

            {/* Network Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-[#0f1623] rounded-lg border border-[#2a3548] text-center">
                <div className="text-xl font-bold text-white mb-1">{networkData.nodes.length}</div>
                <div className="text-xs text-slate-400">Nodes</div>
              </div>
              <div className="p-3 bg-[#0f1623] rounded-lg border border-[#2a3548] text-center">
                <div className="text-xl font-bold text-white mb-1">{networkData.links.length}</div>
                <div className="text-xs text-slate-400">Connections</div>
              </div>
              <div className="p-3 bg-[#0f1623] rounded-lg border border-[#2a3548] text-center">
                <div className="text-xl font-bold text-white mb-1">
                  {networkData.links.reduce((sum, l) => sum + l.value, 0)}
                </div>
                <div className="text-xs text-slate-400">Total Flow</div>
              </div>
            </div>

            {/* Simplified Network View */}
            <div className="p-6 bg-[#0f1623] rounded-lg border border-[#2a3548]">
              <div className="space-y-4">
                {viewType === "category" ? (
                  <div className="grid grid-cols-3 gap-6">
                    {/* Column 1: Categories */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Categories</h4>
                      {[...new Set(risks.map(r => r.category))].filter(Boolean).slice(0, 6).map((cat, idx) => (
                        <div key={cat} className="p-2 bg-[#1a2332] rounded border border-[#2a3548] text-xs text-white">
                          {cat}
                          <Badge className="ml-2 text-[10px]">
                            {risks.filter(r => r.category === cat).length}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    {/* Column 2: Severity */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Severity</h4>
                      <div className="p-2 bg-rose-500/10 rounded border border-rose-500/30 text-xs text-white">
                        Critical
                        <Badge className="ml-2 text-[10px] bg-rose-500/20 text-rose-400">
                          {risks.filter(r => ((r.residual_likelihood || 0) * (r.residual_impact || 0)) >= 16).length}
                        </Badge>
                      </div>
                      <div className="p-2 bg-orange-500/10 rounded border border-orange-500/30 text-xs text-white">
                        High
                        <Badge className="ml-2 text-[10px] bg-orange-500/20 text-orange-400">
                          {risks.filter(r => {
                            const s = ((r.residual_likelihood || 0) * (r.residual_impact || 0));
                            return s >= 12 && s < 16;
                          }).length}
                        </Badge>
                      </div>
                      <div className="p-2 bg-amber-500/10 rounded border border-amber-500/30 text-xs text-white">
                        Medium
                        <Badge className="ml-2 text-[10px] bg-amber-500/20 text-amber-400">
                          {risks.filter(r => {
                            const s = ((r.residual_likelihood || 0) * (r.residual_impact || 0));
                            return s >= 6 && s < 12;
                          }).length}
                        </Badge>
                      </div>
                      <div className="p-2 bg-emerald-500/10 rounded border border-emerald-500/30 text-xs text-white">
                        Low
                        <Badge className="ml-2 text-[10px] bg-emerald-500/20 text-emerald-400">
                          {risks.filter(r => ((r.residual_likelihood || 0) * (r.residual_impact || 0)) < 6).length}
                        </Badge>
                      </div>
                    </div>

                    {/* Column 3: Treatment */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Treatment</h4>
                      {['avoid', 'reduce', 'transfer', 'accept'].map(treatment => (
                        <div key={treatment} className="p-2 bg-[#1a2332] rounded border border-[#2a3548] text-xs text-white capitalize">
                          {treatment}
                          <Badge className="ml-2 text-[10px]">
                            {risks.filter(r => r.risk_treatment_strategy === treatment).length}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Top Risks</h4>
                      {risks.slice(0, 8).map(risk => (
                        <div key={risk.id} className="p-2 bg-rose-500/10 rounded border border-rose-500/30 text-xs text-white truncate">
                          {risk.title}
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Linked Controls</h4>
                      {controls.slice(0, 8).map(control => (
                        <div key={control.id} className="p-2 bg-emerald-500/10 rounded border border-emerald-500/30 text-xs text-white truncate">
                          {control.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Connection Details */}
            <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg border border-indigo-500/20">
              <h4 className="text-sm font-semibold text-white mb-3">Key Insights</h4>
              <div className="grid gap-2 text-xs">
                <div className="flex items-center justify-between p-2 bg-[#0f1623]/50 rounded">
                  <span className="text-slate-300">Most connected category:</span>
                  <Badge className="bg-indigo-500/20 text-indigo-400">
                    {risks.length > 0 ? (risks.reduce((acc, r) => {
                      acc[r.category] = (acc[r.category] || 0) + 1;
                      return acc;
                    }, {})) && Object.entries(risks.reduce((acc, r) => {
                      acc[r.category] = (acc[r.category] || 0) + 1;
                      return acc;
                    }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A' : 'N/A'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-[#0f1623]/50 rounded">
                  <span className="text-slate-300">Primary treatment strategy:</span>
                  <Badge className="bg-purple-500/20 text-purple-400">
                    {risks.length > 0 ? (risks.reduce((acc, r) => {
                      acc[r.risk_treatment_strategy] = (acc[r.risk_treatment_strategy] || 0) + 1;
                      return acc;
                    }, {})) && Object.entries(risks.reduce((acc, r) => {
                      acc[r.risk_treatment_strategy] = (acc[r.risk_treatment_strategy] || 0) + 1;
                      return acc;
                    }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A' : 'N/A'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <DrillDownModal
        open={drillDown.open}
        onClose={() => setDrillDown({ open: false, title: '', data: null })}
        title={drillDown.title}
        data={drillDown.data}
        type="risk"
      />
    </>
  );
}