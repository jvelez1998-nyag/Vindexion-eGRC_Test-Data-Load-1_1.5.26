import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Network, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

export default function ControlRiskComplianceNetwork({ controls, risks, compliance }) {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    const width = rect.width;
    const height = rect.height;

    const nodes = [];
    const links = [];

    // Create nodes with null safety
    const safeControls = Array.isArray(controls) ? controls.filter(c => c) : [];
    const safeRisks = Array.isArray(risks) ? risks.filter(r => r) : [];
    const safeCompliance = Array.isArray(compliance) ? compliance.filter(c => c) : [];

    safeControls.forEach((control, idx) => {
      nodes.push({
        id: control.id,
        type: 'control',
        label: control.name,
        x: Math.cos((idx / controls.length) * 2 * Math.PI) * 150 + width / 2,
        y: Math.sin((idx / controls.length) * 2 * Math.PI) * 150 + height / 2,
        effectiveness: control.effectiveness || 3,
        data: control
      });
    });

    safeRisks.forEach((risk, idx) => {
      nodes.push({
        id: risk.id,
        type: 'risk',
        label: risk.title,
        x: Math.cos((idx / safeRisks.length) * 2 * Math.PI + Math.PI) * 120 + width / 2,
        y: Math.sin((idx / safeRisks.length) * 2 * Math.PI + Math.PI) * 120 + height / 2,
        severity: (risk.likelihood || 0) * (risk.impact || 0),
        data: risk
      });
    });

    safeCompliance.forEach((comp, idx) => {
      nodes.push({
        id: comp.id,
        type: 'compliance',
        label: comp.framework,
        x: Math.cos((idx / safeCompliance.length) * 2 * Math.PI + Math.PI / 2) * 200 + width / 2,
        y: Math.sin((idx / safeCompliance.length) * 2 * Math.PI + Math.PI / 2) * 200 + height / 2,
        status: comp.status,
        data: comp
      });
    });

    // Create links with null safety
    safeControls.forEach(control => {
      const linkedRisks = Array.isArray(control.linked_risks) ? control.linked_risks : [];
      linkedRisks.forEach(riskId => {
        links.push({ source: control.id, target: riskId, type: 'control-risk' });
      });
    });

    safeCompliance.forEach(comp => {
      safeControls.forEach(control => {
        if (control.framework_mappings?.[comp.framework]?.length > 0) {
          links.push({ source: control.id, target: comp.id, type: 'control-compliance' });
        }
      });
    });

    // Draw
    ctx.clearRect(0, 0, width, height);

    // Draw links
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
    ctx.lineWidth = 1;
    links.forEach(link => {
      const source = nodes.find(n => n.id === link.source);
      const target = nodes.find(n => n.id === link.target);
      if (source && target) {
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        if (link.type === 'control-risk') {
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
        } else {
          ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
        }
        ctx.stroke();
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      const isHovered = hoveredNode?.id === node.id;
      const isSelected = selectedNode?.id === node.id;
      const radius = isHovered || isSelected ? 12 : 8;

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);

      if (node.type === 'control') {
        const effectiveness = node.effectiveness || 3;
        ctx.fillStyle = effectiveness >= 4 ? '#10b981' : effectiveness >= 3 ? '#3b82f6' : '#f59e0b';
      } else if (node.type === 'risk') {
        const severity = node.severity || 0;
        ctx.fillStyle = severity >= 15 ? '#ef4444' : severity >= 9 ? '#f59e0b' : '#3b82f6';
      } else {
        ctx.fillStyle = node.status === 'verified' ? '#10b981' : '#6366f1';
      }
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw label
      if (isHovered || isSelected) {
        ctx.fillStyle = '#fff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.label.substring(0, 20) + '...', node.x, node.y - 15);
      }
    });

    canvas.onclick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width) / 2;
      const y = (e.clientY - rect.top) * (canvas.height / rect.height) / 2;

      const clicked = nodes.find(n => {
        const dx = n.x - x;
        const dy = n.y - y;
        return Math.sqrt(dx * dx + dy * dy) < 12;
      });

      setSelectedNode(clicked || null);
    };

    canvas.onmousemove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width) / 2;
      const y = (e.clientY - rect.top) * (canvas.height / rect.height) / 2;

      const hovered = nodes.find(n => {
        const dx = n.x - x;
        const dy = n.y - y;
        return Math.sqrt(dx * dx + dy * dy) < 12;
      });

      setHoveredNode(hovered || null);
      canvas.style.cursor = hovered ? 'pointer' : 'default';
    };

  }, [controls, risks, compliance, zoom, hoveredNode, selectedNode]);

  const safeControlsDisplay = Array.isArray(controls) ? controls.filter(c => c) : [];
  const safeRisksDisplay = Array.isArray(risks) ? risks.filter(r => r) : [];
  const safeComplianceDisplay = Array.isArray(compliance) ? compliance.filter(c => c) : [];

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-indigo-400" />
            <CardTitle className="text-base">Control-Risk-Compliance Network</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>
              <ZoomOut className="h-3 w-3" />
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700" onClick={() => setZoom(z => Math.min(2, z + 0.1))}>
              <ZoomIn className="h-3 w-3" />
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700" onClick={() => setZoom(1)}>
              <Maximize2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Real-time Summary */}
          <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-lg">
            <h4 className="text-sm font-semibold text-white mb-2">Network Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-slate-400 font-medium">Controls ({safeControlsDisplay.length})</span>
                </div>
                <p className="text-slate-300 text-[10px] leading-relaxed">
                  {safeControlsDisplay.filter(c => (c.effectiveness || 0) >= 4).length} highly effective, 
                  {safeControlsDisplay.filter(c => (c.effectiveness || 0) < 3).length} need improvement
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <span className="text-slate-400 font-medium">Risks ({safeRisksDisplay.length})</span>
                </div>
                <p className="text-slate-300 text-[10px] leading-relaxed">
                  {safeRisksDisplay.filter(r => ((r.likelihood || 0) * (r.impact || 0)) >= 15).length} critical,
                  {safeRisksDisplay.filter(r => ((r.likelihood || 0) * (r.impact || 0)) >= 9 && ((r.likelihood || 0) * (r.impact || 0)) < 15).length} high priority
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                  <span className="text-slate-400 font-medium">Compliance ({safeComplianceDisplay.length})</span>
                </div>
                <p className="text-slate-300 text-[10px] leading-relaxed">
                  {safeComplianceDisplay.filter(c => c.status === 'verified' || c.status === 'implemented').length} compliant,
                  {safeComplianceDisplay.filter(c => c.status === 'non_compliant').length} gaps identified
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-indigo-500/20">
              <p className="text-[10px] text-slate-400 leading-relaxed">
                <span className="text-indigo-400 font-medium">Network Insight:</span> This visualization shows interconnections between controls, risks, and compliance requirements. 
                Lines indicate relationships—controls mitigate risks and map to compliance frameworks. Click any node for details.
              </p>
            </div>
          </div>

          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-slate-400">Controls ({safeControlsDisplay.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <span className="text-slate-400">Risks ({safeRisksDisplay.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
              <span className="text-slate-400">Compliance ({safeComplianceDisplay.length})</span>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            className="w-full h-[500px] rounded-lg bg-[#0f1623]"
            style={{ transform: `scale(${zoom})` }}
          />

          {selectedNode && (
            <div className="p-4 bg-[#0f1623] border border-[#2a3548] rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-semibold text-white">{selectedNode.label}</h4>
                <Badge className={
                  selectedNode.type === 'control' ? 'bg-blue-500/20 text-blue-400' :
                  selectedNode.type === 'risk' ? 'bg-rose-500/20 text-rose-400' :
                  'bg-indigo-500/20 text-indigo-400'
                }>
                  {selectedNode.type}
                </Badge>
              </div>
              {selectedNode.type === 'control' && (
                <div className="text-xs text-slate-400">
                  Effectiveness: {selectedNode.effectiveness}/5 • Domain: {selectedNode.data.domain}
                </div>
              )}
              {selectedNode.type === 'risk' && (
                <div className="text-xs text-slate-400">
                  Risk Score: {selectedNode.severity} • Category: {selectedNode.data.category}
                </div>
              )}
              {selectedNode.type === 'compliance' && (
                <div className="text-xs text-slate-400">
                  Status: {selectedNode.status} • Framework: {selectedNode.data.framework}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}