import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle2, XCircle, FileText, Download } from "lucide-react";

const frameworkRequirements = {
  ISO27001: [
    { id: "A.5.1", name: "Policies for information security", critical: true },
    { id: "A.8.2", name: "Privileged access rights", critical: true },
    { id: "A.8.3", name: "Information access restriction", critical: true },
    { id: "A.10.1", name: "Cryptographic controls", critical: true },
    { id: "A.12.1", name: "Event logging", critical: false },
    { id: "A.13.1", name: "Network security", critical: true },
    { id: "A.15.1", name: "Incident management", critical: true }
  ],
  NIST: [
    { id: "ID.AM-1", name: "Physical devices inventory", critical: true },
    { id: "PR.AC-1", name: "Identity management", critical: true },
    { id: "PR.DS-1", name: "Data-at-rest protection", critical: true },
    { id: "DE.CM-1", name: "Network monitoring", critical: true },
    { id: "RS.RP-1", name: "Response plan", critical: true }
  ],
  SOC2: [
    { id: "CC6.1", name: "Logical access controls", critical: true },
    { id: "CC6.6", name: "Encryption of data", critical: true },
    { id: "CC7.2", name: "Security incident detection", critical: true },
    { id: "CC8.1", name: "Change management", critical: false }
  ]
};

export default function ComplianceGapAnalysis({ framework, controls, risks }) {
  const requirements = frameworkRequirements[framework] || [];
  
  const gaps = requirements.map(req => {
    const mappedControls = controls.filter(c => 
      c.framework_mappings?.[framework]?.includes(req.id)
    );
    
    const effectiveControls = mappedControls.filter(c => c.status === 'effective');
    const hasCoverage = effectiveControls.length > 0;
    const hasPartialCoverage = mappedControls.length > 0 && effectiveControls.length === 0;
    
    return {
      ...req,
      mappedControls: mappedControls.length,
      effectiveControls: effectiveControls.length,
      hasCoverage,
      hasPartialCoverage,
      status: hasCoverage ? 'compliant' : hasPartialCoverage ? 'partial' : 'gap'
    };
  });

  const criticalGaps = gaps.filter(g => g.critical && g.status === 'gap');
  const totalGaps = gaps.filter(g => g.status === 'gap');
  const partialGaps = gaps.filter(g => g.status === 'partial');
  const compliant = gaps.filter(g => g.status === 'compliant');
  const complianceRate = Math.round((compliant.length / gaps.length) * 100);

  const generateReport = () => {
    const report = `
COMPLIANCE GAP ANALYSIS REPORT
Framework: ${framework}
Generated: ${new Date().toLocaleDateString()}

EXECUTIVE SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Compliance Rate: ${complianceRate}%
Total Requirements: ${gaps.length}
Compliant: ${compliant.length}
Partial Coverage: ${partialGaps.length}
Critical Gaps: ${criticalGaps.length}

CRITICAL GAPS (${criticalGaps.length})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${criticalGaps.map(g => `${g.id}: ${g.name}`).join('\n')}

ALL GAPS (${totalGaps.length})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${totalGaps.map(g => `${g.id}: ${g.name} ${g.critical ? '(CRITICAL)' : ''}`).join('\n')}

PARTIAL COVERAGE (${partialGaps.length})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${partialGaps.map(g => `${g.id}: ${g.name} - ${g.mappedControls} controls mapped but not effective`).join('\n')}

COMPLIANT REQUIREMENTS (${compliant.length})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${compliant.map(g => `${g.id}: ${g.name} - ${g.effectiveControls} effective controls`).join('\n')}

RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Address critical gaps immediately
2. Implement or enhance controls for partial coverage items
3. Test and validate mapped controls for effectiveness
4. Review control procedures and documentation
5. Schedule regular compliance assessments
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${framework}_gap_analysis_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                {complianceRate}%
              </Badge>
            </div>
            <div className="text-2xl font-bold text-white">{compliant.length}</div>
            <div className="text-xs text-slate-400">Compliant</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                Partial
              </Badge>
            </div>
            <div className="text-2xl font-bold text-white">{partialGaps.length}</div>
            <div className="text-xs text-slate-400">Partial Coverage</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="h-5 w-5 text-rose-400" />
              <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">
                Gaps
              </Badge>
            </div>
            <div className="text-2xl font-bold text-white">{totalGaps.length}</div>
            <div className="text-xs text-slate-400">Total Gaps</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-5 w-5 text-purple-400" />
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                Critical
              </Badge>
            </div>
            <div className="text-2xl font-bold text-white">{criticalGaps.length}</div>
            <div className="text-xs text-slate-400">Critical Gaps</div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Progress */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Compliance Progress</CardTitle>
            <Button onClick={generateReport} size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/20">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Overall Compliance</span>
              <span className="text-white font-semibold">{complianceRate}%</span>
            </div>
            <Progress value={complianceRate} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Critical Gaps */}
      {criticalGaps.length > 0 && (
        <Card className="bg-rose-500/5 border-rose-500/30">
          <CardHeader>
            <CardTitle className="text-rose-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Critical Gaps Requiring Immediate Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2 pr-4">
                {criticalGaps.map(gap => (
                  <Card key={gap.id} className="bg-[#1a2332] border-rose-500/30 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white text-sm">{gap.id}</h4>
                        <p className="text-xs text-slate-400 mt-1">{gap.name}</p>
                      </div>
                      <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">
                        CRITICAL
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* All Gaps */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle>Detailed Gap Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2 pr-4">
              {gaps.map(gap => (
                <Card
                  key={gap.id}
                  className={`p-4 ${
                    gap.status === 'compliant'
                      ? 'bg-emerald-500/5 border-emerald-500/30'
                      : gap.status === 'partial'
                      ? 'bg-amber-500/5 border-amber-500/30'
                      : 'bg-rose-500/5 border-rose-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-white text-sm">{gap.id}</h4>
                        {gap.critical && (
                          <Badge className="text-[10px] bg-rose-500/20 text-rose-400 border-rose-500/30">
                            Critical
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{gap.name}</p>
                    </div>
                    <div className="ml-4">
                      {gap.status === 'compliant' ? (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Compliant
                        </Badge>
                      ) : gap.status === 'partial' ? (
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Partial
                        </Badge>
                      ) : (
                        <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">
                          <XCircle className="h-3 w-3 mr-1" />
                          Gap
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>{gap.mappedControls} controls mapped</span>
                    <span>{gap.effectiveControls} effective</span>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}