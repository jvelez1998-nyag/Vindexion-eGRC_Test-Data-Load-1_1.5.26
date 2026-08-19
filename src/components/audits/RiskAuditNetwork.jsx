import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, AlertTriangle, Shield, ClipboardCheck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function RiskAuditNetwork({ audits, findings, risks, controls }) {
  const networkData = useMemo(() => {
    const connections = [];
    
    // Map findings to audits
    findings.forEach(finding => {
      const audit = audits.find(a => a.id === finding.audit_id);
      if (audit) {
        connections.push({
          type: 'audit-finding',
          from: { id: audit.id, title: audit.title, type: 'audit' },
          to: { id: finding.id, title: finding.title, type: 'finding', severity: finding.severity }
        });

        // Map findings to risks
        if (finding.linked_risks?.length > 0) {
          finding.linked_risks.forEach(riskId => {
            const risk = risks.find(r => r.id === riskId);
            if (risk) {
              connections.push({
                type: 'finding-risk',
                from: { id: finding.id, title: finding.title, type: 'finding', severity: finding.severity },
                to: { id: risk.id, title: risk.title, type: 'risk', category: risk.category }
              });
            }
          });
        }

        // Map findings to controls
        if (finding.linked_controls?.length > 0) {
          finding.linked_controls.forEach(controlId => {
            const control = controls.find(c => c.id === controlId);
            if (control) {
              connections.push({
                type: 'finding-control',
                from: { id: finding.id, title: finding.title, type: 'finding', severity: finding.severity },
                to: { id: control.id, title: control.name, type: 'control', effectiveness: control.effectiveness }
              });
            }
          });
        }
      }
    });

    // Group by audit
    const auditGroups = {};
    audits.forEach(audit => {
      const auditFindings = findings.filter(f => f.audit_id === audit.id);
      const linkedRisks = new Set();
      const linkedControls = new Set();

      auditFindings.forEach(finding => {
        finding.linked_risks?.forEach(rId => linkedRisks.add(rId));
        finding.linked_controls?.forEach(cId => linkedControls.add(cId));
      });

      auditGroups[audit.id] = {
        audit,
        findings: auditFindings,
        risks: Array.from(linkedRisks).map(id => risks.find(r => r.id === id)).filter(Boolean),
        controls: Array.from(linkedControls).map(id => controls.find(c => c.id === id)).filter(Boolean)
      };
    });

    return { connections, auditGroups };
  }, [audits, findings, risks, controls]);

  const stats = {
    totalConnections: networkData.connections.length,
    auditFindingLinks: networkData.connections.filter(c => c.type === 'audit-finding').length,
    findingRiskLinks: networkData.connections.filter(c => c.type === 'finding-risk').length,
    findingControlLinks: networkData.connections.filter(c => c.type === 'finding-control').length,
    criticalFindings: findings.filter(f => f.severity === 'critical').length
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-[#1a2332] border-[#2a3548] p-4 text-center">
          <Network className="h-5 w-5 text-indigo-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{stats.totalConnections}</div>
          <div className="text-xs text-slate-500">Total Links</div>
        </Card>
        <Card className="bg-[#1a2332] border-[#2a3548] p-4 text-center">
          <ClipboardCheck className="h-5 w-5 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{stats.auditFindingLinks}</div>
          <div className="text-xs text-slate-500">Audit-Finding</div>
        </Card>
        <Card className="bg-[#1a2332] border-[#2a3548] p-4 text-center">
          <AlertTriangle className="h-5 w-5 text-rose-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{stats.findingRiskLinks}</div>
          <div className="text-xs text-slate-500">Finding-Risk</div>
        </Card>
        <Card className="bg-[#1a2332] border-[#2a3548] p-4 text-center">
          <Shield className="h-5 w-5 text-emerald-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{stats.findingControlLinks}</div>
          <div className="text-xs text-slate-500">Finding-Control</div>
        </Card>
        <Card className="bg-[#1a2332] border-[#2a3548] p-4 text-center">
          <AlertTriangle className="h-5 w-5 text-amber-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-rose-400">{stats.criticalFindings}</div>
          <div className="text-xs text-slate-500">Critical</div>
        </Card>
      </div>

      {/* Network Visualization */}
      <Card className="bg-[#1a2332] border-[#2a3548] p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Network className="h-5 w-5 text-indigo-400" />
          Interconnected Risk Network
        </h3>
        <ScrollArea className="h-[600px]">
          <div className="space-y-6 pr-4">
            {Object.values(networkData.auditGroups).map(group => (
              <Card key={group.audit.id} className="bg-[#151d2e] border-[#2a3548] p-5">
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-violet-500/10">
                      <ClipboardCheck className="h-5 w-5 text-violet-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{group.audit.title}</h4>
                      <p className="text-xs text-slate-500">{group.audit.type} audit</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Findings */}
                  {group.findings.length > 0 && (
                    <div className="pl-8 border-l-2 border-indigo-500/30">
                      <h5 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-400" />
                        Findings ({group.findings.length})
                      </h5>
                      <div className="space-y-2">
                        {group.findings.map(finding => (
                          <div key={finding.id} className="p-3 bg-[#1a2332] border border-[#2a3548] rounded-lg">
                            <div className="flex items-start justify-between mb-1">
                              <span className="text-sm text-white">{finding.title}</span>
                              <Badge className={`text-[9px] ${
                                finding.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                                finding.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                'bg-amber-500/20 text-amber-400'
                              }`}>
                                {finding.severity}
                              </Badge>
                            </div>
                            <div className="flex gap-2 text-[10px] text-slate-500">
                              {finding.linked_risks?.length > 0 && (
                                <span>{finding.linked_risks.length} risks linked</span>
                              )}
                              {finding.linked_controls?.length > 0 && (
                                <span>• {finding.linked_controls.length} controls</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Connected Risks */}
                  {group.risks.length > 0 && (
                    <div className="pl-16 border-l-2 border-rose-500/30">
                      <h5 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-rose-400" />
                        Connected Risks ({group.risks.length})
                      </h5>
                      <div className="space-y-2">
                        {group.risks.map(risk => (
                          <div key={risk.id} className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-lg">
                            <div className="flex items-start justify-between">
                              <span className="text-sm text-white">{risk.title}</span>
                              <Badge className="text-[9px] bg-slate-500/10 text-slate-400">
                                {risk.category}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Connected Controls */}
                  {group.controls.length > 0 && (
                    <div className="pl-16 border-l-2 border-emerald-500/30">
                      <h5 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        Connected Controls ({group.controls.length})
                      </h5>
                      <div className="space-y-2">
                        {group.controls.map(control => (
                          <div key={control.id} className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                            <div className="flex items-start justify-between">
                              <span className="text-sm text-white">{control.name}</span>
                              <Badge className={`text-[9px] ${
                                (control.effectiveness || 0) >= 4 ? 'bg-emerald-500/20 text-emerald-400' :
                                (control.effectiveness || 0) >= 3 ? 'bg-amber-500/20 text-amber-400' :
                                'bg-rose-500/20 text-rose-400'
                              }`}>
                                {control.effectiveness || 0}/5
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}