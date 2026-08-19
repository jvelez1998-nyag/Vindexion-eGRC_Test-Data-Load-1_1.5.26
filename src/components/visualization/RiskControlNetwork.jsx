import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Shield, Target, ZoomIn, ZoomOut, Maximize2, AlertCircle, CheckCircle2, Filter } from "lucide-react";

export default function RiskControlNetwork({ risks = [], controls = [], onNodeClick }) {
  const canvasRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [filterView, setFilterView] = useState('all');
  const [highlightGaps, setHighlightGaps] = useState(true);

  // Analyze risk-control relationships
  const analysis = useMemo(() => {
    const uncoveredRisks = risks.filter(r => 
      !r.linked_controls?.length && 
      !controls.some(c => c.linked_risks?.includes(r.id))
    );

    const overCoveredRisks = risks.filter(r => {
      const linkedCount = (r.linked_controls?.length || 0) + 
        controls.filter(c => c.linked_risks?.includes(r.id)).length;
      return linkedCount > 3;
    });

    const ineffectiveControls = controls.filter(c => 
      c.status === 'ineffective' || (c.effectiveness && c.effectiveness < 50)
    );

    const orphanedControls = controls.filter(c => 
      !c.linked_risks?.length && 
      !risks.some(r => r.linked_controls?.includes(c.id))
    );

    return {
      uncoveredRisks,
      overCoveredRisks,
      ineffectiveControls,
      orphanedControls,
      coverageRate: risks.length > 0 ? ((risks.length - uncoveredRisks.length) / risks.length * 100).toFixed(1) : 0
    };
  }, [risks, controls]);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth * 2;
    const height = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Calculate positions
    const centerX = width / 4;
    const centerY = height / 4;
    const radius = Math.min(width, height) / 5;

    // Business objectives (center)
    const objectives = [
      { id: 'obj1', name: 'Financial Integrity', x: centerX, y: centerY - 80 },
      { id: 'obj2', name: 'Operational Efficiency', x: centerX + 80, y: centerY },
      { id: 'obj3', name: 'Compliance', x: centerX, y: centerY + 80 },
      { id: 'obj4', name: 'Data Security', x: centerX - 80, y: centerY }
    ];

    // Filter data based on view
    let filteredRisks = risks;
    let filteredControls = controls;

    if (filterView === 'gaps') {
      filteredRisks = analysis.uncoveredRisks;
    } else if (filterView === 'overlaps') {
      filteredRisks = analysis.overCoveredRisks;
    } else if (filterView === 'ineffective') {
      filteredControls = analysis.ineffectiveControls;
    }

    // Position risks in outer circle
    const riskNodes = filteredRisks.slice(0, 20).map((risk, i) => {
      const angle = (i / Math.min(filteredRisks.length, 20)) * 2 * Math.PI;
      const isUncovered = analysis.uncoveredRisks.some(r => r.id === risk.id);
      const isOverCovered = analysis.overCoveredRisks.some(r => r.id === risk.id);
      return {
        ...risk,
        type: 'risk',
        x: centerX + Math.cos(angle) * radius * 1.8,
        y: centerY + Math.sin(angle) * radius * 1.8,
        score: (risk.likelihood || 1) * (risk.impact || 1),
        isUncovered,
        isOverCovered
      };
    });

    // Position controls between risks and objectives
    const controlNodes = filteredControls.slice(0, 15).map((control, i) => {
      const angle = (i / Math.min(filteredControls.length, 15)) * 2 * Math.PI;
      const isOrphaned = analysis.orphanedControls.some(c => c.id === control.id);
      const isIneffective = analysis.ineffectiveControls.some(c => c.id === control.id);
      return {
        ...control,
        type: 'control',
        x: centerX + Math.cos(angle) * radius * 1.2,
        y: centerY + Math.sin(angle) * radius * 1.2,
        isOrphaned,
        isIneffective
      };
    });

    // Draw connections from risks to controls
    riskNodes.forEach(risk => {
      controlNodes.forEach(control => {
        if (risk.linked_controls?.includes(control.id) || Math.random() > 0.85) {
          ctx.beginPath();
          ctx.moveTo(risk.x, risk.y);
          ctx.lineTo(control.x, control.y);
          ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });
    });

    // Draw connections from controls to objectives
    controlNodes.forEach(control => {
      objectives.forEach(obj => {
        if (Math.random() > 0.7) {
          ctx.beginPath();
          ctx.moveTo(control.x, control.y);
          ctx.lineTo(obj.x, obj.y);
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });
    });

    // Draw objectives
    objectives.forEach(obj => {
      ctx.beginPath();
      ctx.arc(obj.x, obj.y, 25, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(obj.name.slice(0, 15), obj.x, obj.y + 40);
    });

    // Draw risk nodes
    riskNodes.forEach(risk => {
      const size = Math.max(8, Math.min(20, risk.score * 2));
      ctx.beginPath();
      ctx.arc(risk.x, risk.y, size, 0, 2 * Math.PI);
      
      let color = risk.score >= 20 ? '#ef4444' : 
                  risk.score >= 15 ? '#f59e0b' : 
                  risk.score >= 6 ? '#eab308' : '#10b981';
      
      // Highlight gaps and overlaps
      if (highlightGaps && risk.isUncovered) {
        color = '#dc2626'; // Darker red for uncovered
        ctx.fillStyle = color + '60';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (highlightGaps && risk.isOverCovered) {
        ctx.fillStyle = color + '40';
        ctx.fill();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Draw extra ring for overlap
        ctx.beginPath();
        ctx.arc(risk.x, risk.y, size + 4, 0, 2 * Math.PI);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        ctx.fillStyle = color + '40';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      if (selectedNode?.id === risk.id) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    });

    // Draw control nodes
    controlNodes.forEach(control => {
      ctx.beginPath();
      ctx.arc(control.x, control.y, 12, 0, 2 * Math.PI);
      
      if (highlightGaps && control.isOrphaned) {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.3)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.8)';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 2]);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (highlightGaps && control.isIneffective) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      if (selectedNode?.id === control.id) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    });

    ctx.restore();
  }, [risks, controls, zoom, pan, selectedNode, filterView, highlightGaps, analysis]);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev * delta)));
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="space-y-4">
      {/* Filters and Controls */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-400">View:</span>
            </div>
            
            <Select value={filterView} onValueChange={setFilterView}>
              <SelectTrigger className="w-48 h-8 bg-[#151d2e] border-[#2a3548] text-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="all" className="text-white text-xs">All Connections</SelectItem>
                <SelectItem value="gaps" className="text-white text-xs">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-3 w-3 text-rose-400" />
                    Coverage Gaps ({analysis.uncoveredRisks.length})
                  </div>
                </SelectItem>
                <SelectItem value="overlaps" className="text-white text-xs">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3 text-amber-400" />
                    Over-covered ({analysis.overCoveredRisks.length})
                  </div>
                </SelectItem>
                <SelectItem value="ineffective" className="text-white text-xs">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-3 w-3 text-red-400" />
                    Ineffective Controls ({analysis.ineffectiveControls.length})
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => setHighlightGaps(!highlightGaps)}
              variant={highlightGaps ? "default" : "outline"}
              size="sm"
              className={`h-8 text-xs ${highlightGaps ? 'bg-indigo-600 hover:bg-indigo-700' : 'border-[#2a3548]'}`}
            >
              {highlightGaps ? 'Hide' : 'Show'} Issues
            </Button>

            <div className="ml-auto">
              <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
                {analysis.coverageRate}% Coverage
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[700px]">
        <div className="lg:col-span-3">
          <Card className="bg-[#1a2332] border-[#2a3548] h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Risk-Control Network Map</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setZoom(z => Math.min(3, z + 0.2))} className="border-[#2a3548]">
                    <ZoomIn className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} className="border-[#2a3548]">
                    <ZoomOut className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="border-[#2a3548]">
                    <Maximize2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          <CardContent className="p-0">
            <canvas
              ref={canvasRef}
              className="w-full h-[600px] cursor-move"
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </CardContent>
        </Card>
      </div>

        <div className="space-y-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-rose-500/40 border-2 border-rose-500" />
                <span className="text-xs text-slate-400">Critical Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-amber-500/40 border-2 border-amber-500" />
                <span className="text-xs text-slate-400">High Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500/40 border-2 border-emerald-500" />
                <span className="text-xs text-slate-400">Control</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-red-600" style={{ borderStyle: 'dashed' }} />
                <span className="text-xs text-slate-400">Uncovered Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-500/40 border-2 border-slate-500" style={{ borderStyle: 'dashed' }} />
                <span className="text-xs text-slate-400">Orphaned Control</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Gap Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Coverage Rate</span>
                <Badge className="bg-emerald-500/10 text-emerald-400">{analysis.coverageRate}%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Uncovered Risks</span>
                <Badge className="bg-rose-500/10 text-rose-400">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {analysis.uncoveredRisks.length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Over-covered</span>
                <Badge className="bg-amber-500/10 text-amber-400">{analysis.overCoveredRisks.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Ineffective Controls</span>
                <Badge className="bg-red-500/10 text-red-400">{analysis.ineffectiveControls.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Orphaned Controls</span>
                <Badge className="bg-slate-500/10 text-slate-400">{analysis.orphanedControls.length}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Total Risks</span>
                <Badge className="bg-rose-500/10 text-rose-400">{risks.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Total Controls</span>
                <Badge className="bg-emerald-500/10 text-emerald-400">{controls.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Critical Risks</span>
                <Badge className="bg-red-500/10 text-red-400">
                  {risks.filter(r => (r.likelihood || 0) * (r.impact || 0) >= 20).length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Effective Controls</span>
                <Badge className="bg-green-500/10 text-green-400">
                  {controls.filter(c => c.status === 'effective').length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}