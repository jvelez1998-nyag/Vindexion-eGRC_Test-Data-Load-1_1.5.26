import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function ComplianceNetworkGraph() {
  const [selectedNode, setSelectedNode] = useState(null);

  const { data: compliance = [], isLoading } = useQuery({
    queryKey: ['compliance'],
    queryFn: () => base44.entities.Compliance.list('-updated_date', 100)
  });

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: () => base44.entities.Control.list('-updated_date', 100)
  });

  const frameworkStats = {};
  compliance.forEach(item => {
    if (!frameworkStats[item.framework]) {
      frameworkStats[item.framework] = {
        total: 0,
        implemented: 0,
        verified: 0,
        non_compliant: 0
      };
    }
    frameworkStats[item.framework].total++;
    if (item.status === 'implemented') frameworkStats[item.framework].implemented++;
    if (item.status === 'verified') frameworkStats[item.framework].verified++;
    if (item.status === 'non_compliant') frameworkStats[item.framework].non_compliant++;
  });

  const networks = Object.entries(frameworkStats).map(([framework, stats]) => {
    const compliance_rate = Math.round(((stats.implemented + stats.verified) / stats.total) * 100);
    return { framework, ...stats, compliance_rate };
  });

  const getColor = (rate) => {
    if (rate >= 90) return 'bg-emerald-500';
    if (rate >= 70) return 'bg-blue-500';
    if (rate >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
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
        <CardTitle className="text-base">Compliance Network Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {networks.map((network, idx) => (
            <Card
              key={idx}
              className={`bg-[#0f1623] border-2 cursor-pointer transition-all hover:scale-105 ${
                selectedNode === network.framework ? 'border-indigo-500' : 'border-[#2a3548]'
              }`}
              onClick={() => setSelectedNode(network.framework)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="text-xs bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                    {network.framework}
                  </Badge>
                  <div className={`w-3 h-3 rounded-full ${getColor(network.compliance_rate)}`} />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{network.compliance_rate}%</div>
                <div className="text-xs text-slate-400">
                  {network.total} requirements
                </div>
                <div className="mt-2 flex gap-1">
                  <div className="flex-1 h-1 bg-emerald-500 rounded" style={{ width: `${(network.verified / network.total) * 100}%` }} />
                  <div className="flex-1 h-1 bg-blue-500 rounded" style={{ width: `${(network.implemented / network.total) * 100}%` }} />
                  <div className="flex-1 h-1 bg-rose-500 rounded" style={{ width: `${(network.non_compliant / network.total) * 100}%` }} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedNode && (
          <Card className="mt-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30 p-4">
            <h4 className="text-sm font-semibold text-white mb-2">{selectedNode} Details</h4>
            {(() => {
              const stats = frameworkStats[selectedNode];
              return (
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="text-center">
                    <div className="text-lg font-bold text-emerald-400">{stats.verified}</div>
                    <div className="text-slate-400">Verified</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">{stats.implemented}</div>
                    <div className="text-slate-400">Implemented</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-rose-400">{stats.non_compliant}</div>
                    <div className="text-slate-400">Non-Compliant</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{stats.total}</div>
                    <div className="text-slate-400">Total</div>
                  </div>
                </div>
              );
            })()}
          </Card>
        )}
      </CardContent>
    </Card>
  );
}