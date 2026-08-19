import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, Link2 } from "lucide-react";

export default function FrameworkInterdependencies({ mappings = [], frameworks = [] }) {
  const interdependencies = useMemo(() => {
    const connections = new Map();
    
    // Build connection strength matrix
    mappings.forEach(mapping => {
      const key = `${mapping.source_framework}-${mapping.target_framework}`;
      const reverseKey = `${mapping.target_framework}-${mapping.source_framework}`;
      
      const strength = mapping.coverage_percentage || 0;
      
      if (!connections.has(key)) {
        connections.set(key, {
          source: mapping.source_framework,
          target: mapping.target_framework,
          strength,
          status: mapping.status
        });
      }
      
      // Check for bidirectional mappings
      if (connections.has(reverseKey)) {
        const reverse = connections.get(reverseKey);
        reverse.bidirectional = true;
        connections.get(key).bidirectional = true;
      }
    });
    
    return Array.from(connections.values());
  }, [mappings]);

  // Calculate framework centrality (how connected each framework is)
  const frameworkCentrality = useMemo(() => {
    const centrality = {};
    frameworks.forEach(fw => {
      centrality[fw] = {
        connections: 0,
        avgStrength: 0,
        totalStrength: 0
      };
    });
    
    interdependencies.forEach(conn => {
      if (centrality[conn.source]) {
        centrality[conn.source].connections++;
        centrality[conn.source].totalStrength += conn.strength;
      }
      if (centrality[conn.target]) {
        centrality[conn.target].connections++;
        centrality[conn.target].totalStrength += conn.strength;
      }
    });
    
    Object.keys(centrality).forEach(fw => {
      if (centrality[fw].connections > 0) {
        centrality[fw].avgStrength = Math.round(centrality[fw].totalStrength / centrality[fw].connections);
      }
    });
    
    return centrality;
  }, [frameworks, interdependencies]);

  const getStrengthColor = (strength) => {
    if (strength >= 80) return '#10b981';
    if (strength >= 60) return '#3b82f6';
    if (strength >= 40) return '#eab308';
    return '#ef4444';
  };

  const getConnectionWidth = (strength) => {
    if (strength >= 80) return 4;
    if (strength >= 60) return 3;
    if (strength >= 40) return 2;
    return 1;
  };

  // Calculate positions for frameworks in a circle
  const frameworkPositions = useMemo(() => {
    const positions = {};
    const centerX = 250;
    const centerY = 250;
    const radius = 180;
    
    frameworks.forEach((fw, i) => {
      const angle = (i / frameworks.length) * 2 * Math.PI - Math.PI / 2;
      positions[fw] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });
    
    return positions;
  }, [frameworks]);

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Network className="h-5 w-5 text-violet-400" />
          Framework Interdependencies Network
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Network Visualization */}
          <div className="bg-[#151d2e] rounded-lg p-4 border border-[#2a3548]">
            <svg width="500" height="500" className="mx-auto">
              {/* Draw connections */}
              {interdependencies.map((conn, i) => {
                const sourcePos = frameworkPositions[conn.source];
                const targetPos = frameworkPositions[conn.target];
                
                if (!sourcePos || !targetPos) return null;
                
                const color = getStrengthColor(conn.strength);
                const width = getConnectionWidth(conn.strength);
                
                return (
                  <g key={i}>
                    <line
                      x1={sourcePos.x}
                      y1={sourcePos.y}
                      x2={targetPos.x}
                      y2={targetPos.y}
                      stroke={color}
                      strokeWidth={width}
                      strokeOpacity={0.6}
                      strokeDasharray={conn.bidirectional ? "0" : "5,5"}
                    />
                    {/* Connection label */}
                    <text
                      x={(sourcePos.x + targetPos.x) / 2}
                      y={(sourcePos.y + targetPos.y) / 2}
                      fill="#94a3b8"
                      fontSize="10"
                      textAnchor="middle"
                    >
                      {conn.strength}%
                    </text>
                  </g>
                );
              })}
              
              {/* Draw framework nodes */}
              {frameworks.map((fw, i) => {
                const pos = frameworkPositions[fw];
                if (!pos) return null;
                
                const centrality = frameworkCentrality[fw];
                const nodeSize = 15 + (centrality?.connections || 0) * 3;
                
                return (
                  <g key={fw}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={nodeSize}
                      fill="#8b5cf6"
                      stroke="#a78bfa"
                      strokeWidth="2"
                      opacity="0.9"
                    />
                    <text
                      x={pos.x}
                      y={pos.y + nodeSize + 15}
                      fill="#ffffff"
                      fontSize="11"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {fw}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-12 h-1 bg-emerald-500" />
              <span className="text-slate-400">High (≥80%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-1 bg-blue-500" />
              <span className="text-slate-400">Good (60-79%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-1 bg-yellow-500" />
              <span className="text-slate-400">Fair (40-59%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-1 bg-rose-500" />
              <span className="text-slate-400">Low (&lt;40%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-1 border-t-2 border-dashed border-slate-500" />
              <span className="text-slate-400">Unidirectional</span>
            </div>
          </div>

          {/* Framework Centrality Table */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
            {Object.entries(frameworkCentrality)
              .sort(([, a], [, b]) => b.connections - a.connections)
              .map(([fw, data]) => (
                <div key={fw} className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="text-[10px] bg-violet-500/20 text-violet-400">{fw}</Badge>
                    <Link2 className="h-3 w-3 text-violet-400" />
                  </div>
                  <div className="text-xs text-slate-400">
                    {data.connections} connections
                  </div>
                  <div className="text-xs text-slate-500">
                    Avg: {data.avgStrength}% strength
                  </div>
                </div>
              ))}
          </div>

          {/* Key Relationships */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-white mb-3">Strongest Relationships</h4>
            <div className="space-y-2">
              {interdependencies
                .sort((a, b) => b.strength - a.strength)
                .slice(0, 5)
                .map((conn, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                    <div className="flex items-center gap-2">
                      <Badge className="text-[10px] bg-blue-500/20 text-blue-400">{conn.source}</Badge>
                      <span className="text-slate-600">→</span>
                      <Badge className="text-[10px] bg-purple-500/20 text-purple-400">{conn.target}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {conn.bidirectional && (
                        <Badge className="text-[9px] bg-emerald-500/20 text-emerald-400">↔ Bidirectional</Badge>
                      )}
                      <span className="text-sm font-bold text-white">{conn.strength}%</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}