import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Download, Info } from "lucide-react";
import { toast } from "sonner";

export default function SankeyRiskPropagation({ data }) {
  const canvasRef = useRef(null);
  const [selectedFlow, setSelectedFlow] = useState(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = 600;

    // Build Sankey data structure
    const nodes = [];
    const flows = [];

    // Create node categories
    const categories = {
      risks: { x: 50, y: 100, width: 120, items: [] },
      controls: { x: 250, y: 100, width: 120, items: [] },
      incidents: { x: 450, y: 100, width: 120, items: [] },
      compliance: { x: 650, y: 100, width: 120, items: [] }
    };

    // Add top risks
    data.risks
      .sort((a, b) => 
        ((b.residual_likelihood || 0) * (b.residual_impact || 0)) -
        ((a.residual_likelihood || 0) * (a.residual_impact || 0))
      )
      .slice(0, 8)
      .forEach((risk, idx) => {
        categories.risks.items.push({
          id: `risk-${risk.id}`,
          label: risk.risk_title?.substring(0, 15) || `Risk ${idx}`,
          value: (risk.residual_likelihood || 0) * (risk.residual_impact || 0),
          data: risk
        });
      });

    // Add controls
    data.controls.slice(0, 6).forEach((control, idx) => {
      categories.controls.items.push({
        id: `control-${control.id}`,
        label: control.control_name?.substring(0, 15) || `Control ${idx}`,
        value: 5,
        data: control
      });
    });

    // Add incidents
    data.incidents.slice(0, 5).forEach((incident, idx) => {
      categories.incidents.items.push({
        id: `incident-${incident.id}`,
        label: incident.incident_title?.substring(0, 15) || `Incident ${idx}`,
        value: incident.severity === 'critical' ? 8 : incident.severity === 'high' ? 6 : 4,
        data: incident
      });
    });

    // Add compliance
    data.compliance.slice(0, 5).forEach((comp, idx) => {
      categories.compliance.items.push({
        id: `compliance-${comp.id}`,
        label: comp.requirement_name?.substring(0, 15) || `Policy ${idx}`,
        value: 4,
        data: comp
      });
    });

    // Calculate positions
    let currentY = categories.risks.y;
    Object.entries(categories).forEach(([key, cat]) => {
      const spacing = Math.min(60, (canvas.height - 200) / Math.max(cat.items.length, 1));
      cat.items.forEach((item, idx) => {
        const height = Math.max(20, item.value * 3);
        nodes.push({
          ...item,
          category: key,
          x: cat.x,
          y: currentY + idx * spacing,
          width: cat.width,
          height
        });
      });
    });

    // Create flows based on relationships
    data.risks.forEach(risk => {
      const riskNode = nodes.find(n => n.id === `risk-${risk.id}`);
      if (!riskNode) return;

      // Risk → Control flows
      risk.linked_controls?.forEach(controlId => {
        const controlNode = nodes.find(n => n.id === `control-${controlId}`);
        if (controlNode) {
          flows.push({
            source: riskNode,
            target: controlNode,
            value: Math.min(riskNode.value, 8),
            color: 'rgba(59, 130, 246, 0.3)'
          });
        }
      });
    });

    // Control → Compliance flows
    data.controls.forEach(control => {
      const controlNode = nodes.find(n => n.id === `control-${control.id}`);
      if (!controlNode) return;

      control.linked_compliance?.forEach(compId => {
        const compNode = nodes.find(n => n.id === `compliance-${compId}`);
        if (compNode) {
          flows.push({
            source: controlNode,
            target: compNode,
            value: 4,
            color: 'rgba(34, 197, 94, 0.3)'
          });
        }
      });
    });

    // Incident → Risk flows
    data.incidents.forEach(incident => {
      const incidentNode = nodes.find(n => n.id === `incident-${incident.id}`);
      if (!incidentNode) return;

      incident.linked_risks?.forEach(riskId => {
        const riskNode = nodes.find(n => n.id === `risk-${riskId}`);
        if (riskNode) {
          flows.push({
            source: incidentNode,
            target: riskNode,
            value: incidentNode.value,
            color: 'rgba(239, 68, 68, 0.3)'
          });
        }
      });
    });

    // Draw flows (curved paths)
    flows.forEach(flow => {
      const sx = flow.source.x + flow.source.width;
      const sy = flow.source.y + flow.source.height / 2;
      const tx = flow.target.x;
      const ty = flow.target.y + flow.target.height / 2;
      
      const cpx1 = sx + (tx - sx) / 2;
      const cpx2 = tx - (tx - sx) / 2;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.bezierCurveTo(cpx1, sy, cpx2, ty, tx, ty);
      ctx.strokeStyle = flow.color;
      ctx.lineWidth = Math.max(2, flow.value);
      ctx.stroke();
    });

    // Draw nodes
    nodes.forEach(node => {
      // Node rectangle
      const gradient = ctx.createLinearGradient(node.x, node.y, node.x + node.width, node.y);
      gradient.addColorStop(0, 
        node.category === 'risks' ? '#ef4444' :
        node.category === 'controls' ? '#3b82f6' :
        node.category === 'incidents' ? '#f59e0b' :
        '#10b981'
      );
      gradient.addColorStop(1, 
        node.category === 'risks' ? '#dc2626' :
        node.category === 'controls' ? '#2563eb' :
        node.category === 'incidents' ? '#d97706' :
        '#059669'
      );
      
      ctx.fillStyle = gradient;
      ctx.fillRect(node.x, node.y, node.width, node.height);

      // Border
      ctx.strokeStyle = '#1a2332';
      ctx.lineWidth = 2;
      ctx.strokeRect(node.x, node.y, node.width, node.height);

      // Label
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, node.x + node.width / 2, node.y - 5);
    });

    // Category labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('RISKS', categories.risks.x + 60, 80);
    ctx.fillText('CONTROLS', categories.controls.x + 60, 80);
    ctx.fillText('INCIDENTS', categories.incidents.x + 60, 80);
    ctx.fillText('COMPLIANCE', categories.compliance.x + 60, 80);

  }, [data]);

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-purple-400" />
            Sankey Risk Propagation Flow
          </CardTitle>
          <Button 
            onClick={() => toast.success("Exporting diagram...")}
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-indigo-400 mt-0.5" />
              <p className="text-xs text-slate-300">
                This Sankey diagram visualizes how risks flow through your organization: from risk identification → control mitigation → compliance requirements. 
                Flow thickness represents risk severity or impact level.
              </p>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            className="w-full rounded-lg bg-[#151d2e] border border-[#2a3548]"
          />

          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <div className="text-xs text-slate-400 mb-1">Risks</div>
              <div className="text-xl font-bold text-rose-400">
                {data.risks.filter(r => ((r.residual_likelihood || 0) * (r.residual_impact || 0)) >= 12).length}
              </div>
              <div className="text-xs text-slate-500">High-severity</div>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="text-xs text-slate-400 mb-1">Controls</div>
              <div className="text-xl font-bold text-blue-400">
                {data.controls.filter(c => c.effectiveness === 'effective').length}
              </div>
              <div className="text-xs text-slate-500">Effective</div>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="text-xs text-slate-400 mb-1">Incidents</div>
              <div className="text-xl font-bold text-amber-400">
                {data.incidents.filter(i => i.status !== 'closed').length}
              </div>
              <div className="text-xs text-slate-500">Active</div>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="text-xs text-slate-400 mb-1">Compliance</div>
              <div className="text-xl font-bold text-emerald-400">
                {data.compliance.filter(c => c.compliance_status === 'compliant').length}
              </div>
              <div className="text-xs text-slate-500">Compliant</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}