import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Brain, Loader2, Network, AlertTriangle, Shield, Activity, FileText, Target, TrendingUp, X } from "lucide-react";
import { toast } from "sonner";

export default function AIRiskControlNetwork({ controls }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [drillDownOpen, setDrillDownOpen] = useState(false);

  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: () => base44.entities.Risk.list()
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => base44.entities.Incident.list()
  });

  const { data: findings = [] } = useQuery({
    queryKey: ['findings'],
    queryFn: () => base44.entities.AuditFinding.list()
  });

  const { data: controlTests = [] } = useQuery({
    queryKey: ['control-tests'],
    queryFn: () => base44.entities.ControlTest.list()
  });

  // Build relationship data
  const networkData = useMemo(() => {
    const nodes = [];
    const edges = [];
    const gaps = [];

    // Add risk nodes
    risks.forEach(risk => {
      const linkedControls = controls.filter(c => c.linked_risks?.includes(risk.id));
      const riskScore = (risk.likelihood || 3) * (risk.impact || 3);
      
      nodes.push({
        id: risk.id,
        type: 'risk',
        name: risk.title,
        category: risk.category,
        score: riskScore,
        controlCount: linkedControls.length,
        status: risk.status
      });

      // Add edges for linked controls
      linkedControls.forEach(control => {
        edges.push({
          from: risk.id,
          to: control.id,
          type: 'mitigates',
          strength: control.effectiveness || 3
        });
      });

      // Identify gaps (high risks with no or weak controls)
      if (riskScore >= 12 && (linkedControls.length === 0 || linkedControls.every(c => (c.effectiveness || 0) < 3))) {
        gaps.push({
          type: 'control_gap',
          risk: risk.title,
          riskId: risk.id,
          severity: riskScore >= 16 ? 'critical' : 'high',
          reason: linkedControls.length === 0 ? 'No controls assigned' : 'Weak controls only'
        });
      }
    });

    // Add control nodes
    controls.forEach(control => {
      const linkedRisks = risks.filter(r => control.linked_risks?.includes(r.id));
      const failedTests = controlTests.filter(t => t.control_id === control.id && t.test_result === 'failed');
      
      nodes.push({
        id: control.id,
        type: 'control',
        name: control.name,
        domain: control.domain,
        category: control.category,
        effectiveness: control.effectiveness || 0,
        status: control.status,
        riskCount: linkedRisks.length,
        testFailures: failedTests.length
      });

      // Flag ineffective controls covering critical risks
      if (control.effectiveness < 3) {
        const criticalRisks = linkedRisks.filter(r => ((r.likelihood || 3) * (r.impact || 3)) >= 12);
        if (criticalRisks.length > 0) {
          gaps.push({
            type: 'weak_control',
            control: control.name,
            controlId: control.id,
            severity: 'high',
            reason: `Ineffective control for ${criticalRisks.length} critical risk(s)`,
            affectedRisks: criticalRisks.map(r => r.title)
          });
        }
      }
    });

    // Link incidents to risks
    incidents.forEach(incident => {
      if (incident.linked_risks?.length > 0) {
        incident.linked_risks.forEach(riskId => {
          edges.push({
            from: incident.id,
            to: riskId,
            type: 'realized',
            severity: incident.severity
          });
        });
      }
    });

    // Link findings to controls
    findings.forEach(finding => {
      if (finding.linked_controls?.length > 0) {
        finding.linked_controls.forEach(controlId => {
          edges.push({
            from: finding.id,
            to: controlId,
            type: 'deficiency',
            severity: finding.severity
          });
        });
      }
    });

    return { nodes, edges, gaps };
  }, [risks, controls, incidents, findings, controlTests]);

  const generateAnalysis = async () => {
    setLoading(true);
    try {
      const { nodes, edges, gaps } = networkData;

      const prompt = `Analyze the risk and control network topology and provide strategic insights.

NETWORK TOPOLOGY:
Total Nodes: ${nodes.length}
- Risks: ${nodes.filter(n => n.type === 'risk').length}
- Controls: ${nodes.filter(n => n.type === 'control').length}

Total Edges: ${edges.length}
- Mitigation Links: ${edges.filter(e => e.type === 'mitigates').length}
- Realized Risks (Incidents): ${edges.filter(e => e.type === 'realized').length}
- Control Deficiencies (Findings): ${edges.filter(e => e.type === 'deficiency').length}

IDENTIFIED GAPS:
Control Gaps: ${gaps.filter(g => g.type === 'control_gap').length}
Weak Controls: ${gaps.filter(g => g.type === 'weak_control').length}

CRITICAL RISKS WITHOUT ADEQUATE COVERAGE:
${gaps.filter(g => g.type === 'control_gap' && g.severity === 'critical').map(g => `- ${g.risk}`).join('\n')}

COVERAGE ANALYSIS:
${nodes.filter(n => n.type === 'risk').map(r => {
  const riskEdges = edges.filter(e => e.from === r.id && e.type === 'mitigates');
  return `Risk "${r.name}" (Score: ${r.score}): ${riskEdges.length} control(s), avg effectiveness: ${riskEdges.length ? (riskEdges.reduce((sum, e) => sum + e.strength, 0) / riskEdges.length).toFixed(1) : 0}`;
}).slice(0, 10).join('\n')}

Provide comprehensive analysis with:

1. Network Health Score (0-100)
2. Coverage Analysis (which areas are well-covered vs. gaps)
3. Critical Remediation Priorities (highest impact actions)
4. Control Optimization Recommendations (redundancies, gaps)
5. Risk Clustering Insights (related risks that should be addressed together)
6. Recommended New Controls or Control Enhancements

Return structured, actionable JSON.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            network_health_score: { type: "number" },
            executive_summary: { type: "string" },
            coverage_analysis: {
              type: "object",
              properties: {
                well_covered_areas: { type: "array", items: { type: "string" } },
                under_covered_areas: { type: "array", items: { type: "string" } },
                redundant_areas: { type: "array", items: { type: "string" } }
              }
            },
            critical_priorities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  priority: { type: "string" },
                  issue: { type: "string" },
                  impact: { type: "string" },
                  action: { type: "string" },
                  timeline: { type: "string" }
                }
              }
            },
            control_optimization: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  description: { type: "string" },
                  rationale: { type: "string" },
                  expected_benefit: { type: "string" }
                }
              }
            },
            risk_clusters: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  cluster_name: { type: "string" },
                  risks: { type: "array", items: { type: "string" } },
                  shared_controls: { type: "array", items: { type: "string" } },
                  recommendation: { type: "string" }
                }
              }
            },
            recommended_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  target: { type: "string" },
                  rationale: { type: "string" },
                  priority: { type: "string" }
                }
              }
            }
          }
        }
      });

      setAnalysis(response);
      toast.success("Network analysis complete");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate network analysis");
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = (node) => {
    const fullNode = networkData.nodes.find(n => n.id === node.id);
    const nodeEdges = networkData.edges.filter(e => e.from === node.id || e.to === node.id);
    
    setSelectedNode({
      ...fullNode,
      edges: nodeEdges,
      relatedNodes: nodeEdges.map(e => {
        const relatedId = e.from === node.id ? e.to : e.from;
        return networkData.nodes.find(n => n.id === relatedId);
      }).filter(Boolean)
    });
    setDrillDownOpen(true);
  };

  const { nodes, edges, gaps } = networkData;

  // Group nodes by type for visualization
  const riskNodes = nodes.filter(n => n.type === 'risk');
  const controlNodes = nodes.filter(n => n.type === 'control');

  const scoreColor = analysis?.network_health_score >= 75 ? "text-emerald-400" : 
                     analysis?.network_health_score >= 50 ? "text-amber-400" : "text-rose-400";

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-[#1a2332] border-[#2a3548] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 mb-1">Network Nodes</div>
              <div className="text-2xl font-bold text-white">{nodes.length}</div>
            </div>
            <Network className="h-8 w-8 text-indigo-400 opacity-50" />
          </div>
        </Card>
        <Card className="bg-[#1a2332] border-[#2a3548] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 mb-1">Relationships</div>
              <div className="text-2xl font-bold text-blue-400">{edges.length}</div>
            </div>
            <Activity className="h-8 w-8 text-blue-400 opacity-50" />
          </div>
        </Card>
        <Card className="bg-[#1a2332] border-[#2a3548] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 mb-1">Identified Gaps</div>
              <div className="text-2xl font-bold text-rose-400">{gaps.length}</div>
            </div>
            <AlertTriangle className="h-8 w-8 text-rose-400 opacity-50" />
          </div>
        </Card>
        <Card className="bg-[#1a2332] border-[#2a3548] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 mb-1">Coverage Rate</div>
              <div className="text-2xl font-bold text-emerald-400">
                {riskNodes.length ? Math.round((riskNodes.filter(r => r.controlCount > 0).length / riskNodes.length) * 100) : 0}%
              </div>
            </div>
            <Target className="h-8 w-8 text-emerald-400 opacity-50" />
          </div>
        </Card>
      </div>

      {/* AI Analysis Button */}
      {!analysis && (
        <Card className="bg-[#1a2332] border-[#2a3548] p-6 text-center">
          <div className="p-4 rounded-full bg-indigo-500/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Brain className="h-8 w-8 text-indigo-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">AI Network Analysis</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-2xl mx-auto">
            Analyze relationships, identify gaps, and get strategic recommendations for optimizing your risk-control network
          </p>
          <Button onClick={generateAnalysis} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Network...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Generate AI Analysis
              </>
            )}
          </Button>
        </Card>
      )}

      {/* AI Analysis Results */}
      {analysis && (
        <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Network Health Analysis</h3>
            <Button onClick={() => setAnalysis(null)} variant="outline" size="sm" className="border-[#2a3548]">
              New Analysis
            </Button>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="text-sm text-slate-400 mb-2">Network Health Score</div>
              <div className={`text-5xl font-bold ${scoreColor} mb-4`}>
                {analysis.network_health_score}
                <span className="text-2xl text-slate-400">/100</span>
              </div>
              <p className="text-sm text-slate-300">{analysis.executive_summary}</p>
            </div>
            <TrendingUp className="h-16 w-16 text-indigo-400 opacity-20" />
          </div>
        </Card>
      )}

      {/* Network Visualization */}
      <Card className="bg-[#1a2332] border-[#2a3548] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Risk-Control Network Map</h3>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-rose-500/30 border border-rose-500" />
              Risk
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500/30 border border-blue-500" />
              Control
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-amber-500/30 border border-amber-500" />
              Gap
            </div>
          </div>
        </div>

        <ScrollArea className="h-[500px]">
          <div className="space-y-6 pr-4">
            {/* Gaps Section */}
            {gaps.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Identified Gaps ({gaps.length})
                </h4>
                <div className="space-y-2">
                  {gaps.map((gap, idx) => (
                    <Card key={idx} className="bg-amber-500/5 border-amber-500/20 p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Badge className={`text-[10px] mb-2 ${gap.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {gap.severity}
                          </Badge>
                          <div className="text-sm font-medium text-white mb-1">
                            {gap.type === 'control_gap' ? gap.risk : gap.control}
                          </div>
                          <div className="text-xs text-slate-400">{gap.reason}</div>
                          {gap.affectedRisks && (
                            <div className="text-xs text-rose-300 mt-2">
                              Affects: {gap.affectedRisks.slice(0, 2).join(', ')}
                              {gap.affectedRisks.length > 2 && ` +${gap.affectedRisks.length - 2} more`}
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleNodeClick({ id: gap.riskId || gap.controlId, type: gap.type === 'control_gap' ? 'risk' : 'control' })}
                          className="h-7 text-xs border-amber-500/30"
                        >
                          Details
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Nodes */}
            <div>
              <h4 className="text-sm font-semibold text-rose-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Risks ({riskNodes.length})
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {riskNodes.slice(0, 10).map(node => (
                  <Card
                    key={node.id}
                    className="bg-[#151d2e] border-[#2a3548] p-3 hover:border-rose-500/50 transition-all cursor-pointer"
                    onClick={() => handleNodeClick(node)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-sm font-medium text-white line-clamp-1">{node.name}</div>
                      <Badge className={`text-[10px] ${node.score >= 16 ? 'bg-rose-500/20 text-rose-400' : node.score >= 9 ? 'bg-orange-500/20 text-orange-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {node.score}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Shield className="h-3 w-3" />
                      {node.controlCount} control{node.controlCount !== 1 ? 's' : ''}
                    </div>
                  </Card>
                ))}
              </div>
              {riskNodes.length > 10 && (
                <div className="text-center mt-3 text-xs text-slate-500">
                  +{riskNodes.length - 10} more risks
                </div>
              )}
            </div>

            {/* Control Nodes */}
            <div>
              <h4 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Controls ({controlNodes.length})
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {controlNodes.slice(0, 10).map(node => (
                  <Card
                    key={node.id}
                    className="bg-[#151d2e] border-[#2a3548] p-3 hover:border-blue-500/50 transition-all cursor-pointer"
                    onClick={() => handleNodeClick(node)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-sm font-medium text-white line-clamp-1">{node.name}</div>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(n => (
                          <div key={n} className={`w-1.5 h-1.5 rounded-full ${n <= node.effectiveness ? 'bg-emerald-500' : 'bg-[#2a3548]'}`} />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <AlertTriangle className="h-3 w-3" />
                      {node.riskCount} risk{node.riskCount !== 1 ? 's' : ''}
                    </div>
                  </Card>
                ))}
              </div>
              {controlNodes.length > 10 && (
                <div className="text-center mt-3 text-xs text-slate-500">
                  +{controlNodes.length - 10} more controls
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </Card>

      {/* Analysis Insights */}
      {analysis && (
        <div className="grid grid-cols-2 gap-4">
          {/* Coverage Analysis */}
          {analysis.coverage_analysis && (
            <Card className="bg-[#1a2332] border-[#2a3548] p-5">
              <h4 className="text-sm font-semibold text-white mb-4">Coverage Analysis</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs text-emerald-400 font-medium mb-1">Well Covered</div>
                  <ul className="space-y-1">
                    {analysis.coverage_analysis.well_covered_areas?.map((area, idx) => (
                      <li key={idx} className="text-slate-300 flex items-start gap-2">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs text-amber-400 font-medium mb-1">Under Covered</div>
                  <ul className="space-y-1">
                    {analysis.coverage_analysis.under_covered_areas?.map((area, idx) => (
                      <li key={idx} className="text-slate-300 flex items-start gap-2">
                        <AlertTriangle className="h-3 w-3 text-amber-400 mt-0.5 flex-shrink-0" />
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {/* Critical Priorities */}
          <Card className="bg-[#1a2332] border-[#2a3548] p-5">
            <h4 className="text-sm font-semibold text-white mb-4">Critical Priorities</h4>
            <ScrollArea className="h-64">
              <div className="space-y-3 pr-3">
                {analysis.critical_priorities?.map((priority, idx) => (
                  <div key={idx} className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-lg">
                    <div className="text-xs font-semibold text-rose-400 mb-1">{priority.priority}</div>
                    <div className="text-sm text-white mb-1">{priority.issue}</div>
                    <div className="text-xs text-slate-400">{priority.action}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>
      )}

      {/* Drill-Down Dialog */}
      <Dialog open={drillDownOpen} onOpenChange={setDrillDownOpen}>
        <DialogContent className="max-w-3xl bg-[#1a2332] border-[#2a3548] text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedNode?.type === 'risk' ? <AlertTriangle className="h-5 w-5 text-rose-400" /> : <Shield className="h-5 w-5 text-blue-400" />}
              {selectedNode?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedNode && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Type</div>
                  <div className="text-sm text-white capitalize">{selectedNode.type}</div>
                </div>
                {selectedNode.type === 'risk' && (
                  <>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Risk Score</div>
                      <div className="text-sm font-bold text-rose-400">{selectedNode.score}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Category</div>
                      <div className="text-sm text-white">{selectedNode.category}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Controls</div>
                      <div className="text-sm text-white">{selectedNode.controlCount}</div>
                    </div>
                  </>
                )}
                {selectedNode.type === 'control' && (
                  <>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Effectiveness</div>
                      <div className="text-sm text-white">{selectedNode.effectiveness}/5</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Domain</div>
                      <div className="text-sm text-white">{selectedNode.domain?.replace(/_/g, ' ')}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Risks Covered</div>
                      <div className="text-sm text-white">{selectedNode.riskCount}</div>
                    </div>
                  </>
                )}
              </div>

              <div>
                <h5 className="text-sm font-semibold text-white mb-3">Related Nodes ({selectedNode.relatedNodes?.length || 0})</h5>
                <ScrollArea className="h-48">
                  <div className="space-y-2 pr-3">
                    {selectedNode.relatedNodes?.map((node, idx) => (
                      <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-3">
                        <div className="flex items-center gap-2">
                          {node.type === 'risk' ? <AlertTriangle className="h-4 w-4 text-rose-400" /> : <Shield className="h-4 w-4 text-blue-400" />}
                          <div className="flex-1">
                            <div className="text-sm text-white">{node.name}</div>
                            <div className="text-xs text-slate-500 capitalize">{node.type}</div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}