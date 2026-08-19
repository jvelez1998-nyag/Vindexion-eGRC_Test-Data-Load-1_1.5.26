import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, Info } from "lucide-react";

export default function RiskPropagationNetwork({ data }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = 600;

    // Create network nodes from data
    const nodes = [];
    const links = [];

    // Add risk nodes
    data.risks.slice(0, 15).forEach((risk, idx) => {
      const score = (risk.residual_likelihood || 0) * (risk.residual_impact || 0);
      nodes.push({
        id: `risk-${risk.id}`,
        label: risk.risk_title?.substring(0, 20) || `Risk ${idx + 1}`,
        type: 'risk',
        score,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: 0,
        vy: 0
      });
    });

    // Add control nodes
    data.controls.slice(0, 10).forEach((control, idx) => {
      nodes.push({
        id: `control-${control.id}`,
        label: control.control_name?.substring(0, 20) || `Control ${idx + 1}`,
        type: 'control',
        effectiveness: control.effectiveness,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: 0,
        vy: 0
      });
    });

    // Add incident nodes
    data.incidents.slice(0, 8).forEach((incident, idx) => {
      nodes.push({
        id: `incident-${incident.id}`,
        label: incident.incident_title?.substring(0, 20) || `Incident ${idx + 1}`,
        type: 'incident',
        severity: incident.severity,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: 0,
        vy: 0
      });
    });

    // Create links based on relationships
    data.risks.forEach(risk => {
      risk.linked_controls?.forEach(controlId => {
        const controlNode = nodes.find(n => n.id === `control-${controlId}`);
        if (controlNode) {
          links.push({
            source: `risk-${risk.id}`,
            target: `control-${controlId}`,
            type: 'mitigates'
          });
        }
      });
    });

    data.incidents.forEach(incident => {
      incident.linked_risks?.forEach(riskId => {
        const riskNode = nodes.find(n => n.id === `risk-${riskId}`);
        if (riskNode) {
          links.push({
            source: `incident-${incident.id}`,
            target: `risk-${riskId}`,
            type: 'triggers'
          });
        }
      });
    });

    // Simple force-directed layout simulation
    let animationId;
    const simulate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply forces
      nodes.forEach(node => {
        // Center gravity
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const dx = centerX - node.x;
        const dy = centerY - node.y;
        node.vx += dx * 0.0001;
        node.vy += dy * 0.0001;

        // Repulsion between nodes
        nodes.forEach(other => {
          if (node.id !== other.id) {
            const dx = other.x - node.x;
            const dy = other.y - node.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            if (dist < 150) {
              const force = (150 - dist) / dist;
              node.vx -= (dx / dist) * force * 0.1;
              node.vy -= (dy / dist) * force * 0.1;
            }
          }
        });

        // Apply velocity
        node.x += node.vx;
        node.y += node.vy;
        node.vx *= 0.9;
        node.vy *= 0.9;

        // Boundary
        node.x = Math.max(30, Math.min(canvas.width - 30, node.x));
        node.y = Math.max(30, Math.min(canvas.height - 30, node.y));
      });

      // Draw links
      links.forEach(link => {
        const source = nodes.find(n => n.id === link.source);
        const target = nodes.find(n => n.id === link.target);
        if (source && target) {
          ctx.beginPath();
          ctx.moveTo(source.x, source.y);
          ctx.lineTo(target.x, target.y);
          ctx.strokeStyle = link.type === 'mitigates' ? '#3b82f6' : '#ef4444';
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.3;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      });

      // Draw nodes
      nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 
          node.type === 'risk' ? 8 : node.type === 'control' ? 6 : 7, 
          0, 2 * Math.PI
        );
        ctx.fillStyle = 
          node.type === 'risk' ? '#ef4444' :
          node.type === 'control' ? '#3b82f6' :
          '#f59e0b';
        ctx.fill();
        ctx.strokeStyle = '#1a2332';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw label
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y - 12);
      });

      animationId = requestAnimationFrame(simulate);
    };

    simulate();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [data]);

  const propagationScenarios = [
    {
      title: "Cascading Cyber Attack",
      description: "Network breach → Data exfiltration → Regulatory fines → Reputational damage",
      probability: 35,
      severity: "critical"
    },
    {
      title: "Vendor Failure Chain",
      description: "Key vendor bankruptcy → Service disruption → Revenue loss → Customer churn",
      probability: 28,
      severity: "high"
    },
    {
      title: "Compliance Cascade",
      description: "Failed audit → Regulatory action → Trading restrictions → Stock price decline",
      probability: 22,
      severity: "high"
    },
    {
      title: "Control Failure Domino",
      description: "Access control failure → Privilege escalation → System compromise → Data breach",
      probability: 40,
      severity: "critical"
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-rose-500/10 to-pink-500/10 border-rose-500/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Network className="h-5 w-5 text-rose-400" />
            Risk Propagation Network Visualization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 mb-4">
            Interactive network showing how risks propagate through connected systems, controls, and incidents
          </p>

          <div className="mb-4">
            <canvas
              ref={canvasRef}
              className="w-full rounded-lg bg-[#151d2e] border border-[#2a3548]"
            />
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <span className="text-slate-400">Risks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-slate-400">Controls</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-slate-400">Incidents</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-5 w-5 text-indigo-400" />
            Cascade Effect Scenarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {propagationScenarios.map((scenario, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-semibold text-white">{scenario.title}</h4>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-rose-500/20 text-rose-400 text-xs">
                      {scenario.probability}% chance
                    </Badge>
                    <Badge className={`text-xs ${
                      scenario.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {scenario.severity}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-slate-400">{scenario.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}