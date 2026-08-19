import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Download,
  TrendingUp,
  Shield,
  AlertTriangle,
  FileCheck,
  BarChart3,
  Target,
  Activity
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const preBuiltReports = [
  {
    id: "risk-landscape",
    name: "Risk Landscape Report",
    description: "Comprehensive overview of organizational risk posture",
    icon: Target,
    color: "from-rose-500/20 to-orange-500/20 border-rose-500/30"
  },
  {
    id: "compliance-status",
    name: "Compliance Status Report",
    description: "Current compliance status across all frameworks",
    icon: FileCheck,
    color: "from-emerald-500/20 to-green-500/20 border-emerald-500/30"
  },
  {
    id: "incident-summary",
    name: "Incident Summary Report",
    description: "Analysis of security incidents and response effectiveness",
    icon: AlertTriangle,
    color: "from-amber-500/20 to-yellow-500/20 border-amber-500/30"
  },
  {
    id: "control-effectiveness",
    name: "Control Effectiveness Report",
    description: "Assessment of security controls and their effectiveness",
    icon: Shield,
    color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30"
  },
  {
    id: "audit-findings",
    name: "Audit Findings Report",
    description: "Summary of audit findings and remediation progress",
    icon: FileText,
    color: "from-purple-500/20 to-indigo-500/20 border-purple-500/30"
  },
  {
    id: "executive-dashboard",
    name: "Executive Dashboard Report",
    description: "High-level GRC metrics for executive leadership",
    icon: BarChart3,
    color: "from-indigo-500/20 to-violet-500/20 border-indigo-500/30"
  }
];

export default function PreBuiltReports() {
  const [generating, setGenerating] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [reportData, setReportData] = useState(null);

  const { data: risks = [] } = useQuery({ queryKey: ['risks'], queryFn: () => base44.entities.Risk.list() });
  const { data: controls = [] } = useQuery({ queryKey: ['controls'], queryFn: () => base44.entities.Control.list() });
  const { data: compliance = [] } = useQuery({ queryKey: ['compliance'], queryFn: () => base44.entities.Compliance.list() });
  const { data: incidents = [] } = useQuery({ queryKey: ['incidents'], queryFn: () => base44.entities.Incident.list() });
  const { data: audits = [] } = useQuery({ queryKey: ['audits'], queryFn: () => base44.entities.Audit.list() });
  const { data: findings = [] } = useQuery({ queryKey: ['findings'], queryFn: () => base44.entities.AuditFinding.list() });
  const { data: assessments = [] } = useQuery({ queryKey: ['risk-assessments'], queryFn: () => base44.entities.RiskAssessment.list() });

  const generateReport = async (reportId) => {
    setGenerating(true);
    setCurrentReport(reportId);

    try {
      let data;
      
      switch (reportId) {
        case "risk-landscape":
          data = generateRiskLandscape();
          break;
        case "compliance-status":
          data = generateComplianceStatus();
          break;
        case "incident-summary":
          data = generateIncidentSummary();
          break;
        case "control-effectiveness":
          data = generateControlEffectiveness();
          break;
        case "audit-findings":
          data = generateAuditFindings();
          break;
        case "executive-dashboard":
          data = generateExecutiveDashboard();
          break;
        default:
          data = {};
      }

      setReportData(data);
      toast.success("Report generated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const generateRiskLandscape = () => {
    const totalRisks = risks.length;
    const criticalRisks = risks.filter(r => ((r.residual_likelihood || 0) * (r.residual_impact || 0)) >= 12).length;
    const highRisks = risks.filter(r => {
      const score = (r.residual_likelihood || 0) * (r.residual_impact || 0);
      return score >= 9 && score < 12;
    }).length;
    
    const risksByCategory = risks.reduce((acc, r) => {
      const cat = r.category || "Uncategorized";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    const avgLikelihood = (risks.reduce((sum, r) => sum + (r.residual_likelihood || 0), 0) / totalRisks).toFixed(2);
    const avgImpact = (risks.reduce((sum, r) => sum + (r.residual_impact || 0), 0) / totalRisks).toFixed(2);

    return {
      title: "Risk Landscape Report",
      generatedAt: new Date().toISOString(),
      summary: {
        totalRisks,
        criticalRisks,
        highRisks,
        avgLikelihood,
        avgImpact,
        risksByCategory
      },
      topRisks: risks
        .sort((a, b) => ((b.residual_likelihood || 0) * (b.residual_impact || 0)) - ((a.residual_likelihood || 0) * (a.residual_impact || 0)))
        .slice(0, 10),
      riskTrends: "Risk levels have remained stable with focus areas in cybersecurity and operational resilience."
    };
  };

  const generateComplianceStatus = () => {
    const totalRequirements = compliance.length;
    const compliant = compliance.filter(c => c.status === "compliant").length;
    const nonCompliant = compliance.filter(c => c.status === "non_compliant").length;
    const inProgress = compliance.filter(c => c.status === "in_progress").length;

    const byFramework = compliance.reduce((acc, c) => {
      acc[c.framework] = acc[c.framework] || { total: 0, compliant: 0 };
      acc[c.framework].total++;
      if (c.status === "compliant") acc[c.framework].compliant++;
      return acc;
    }, {});

    return {
      title: "Compliance Status Report",
      generatedAt: new Date().toISOString(),
      summary: {
        totalRequirements,
        compliant,
        nonCompliant,
        inProgress,
        complianceRate: ((compliant / totalRequirements) * 100).toFixed(1) + "%"
      },
      byFramework,
      gapsAndRecommendations: compliance
        .filter(c => c.status === "non_compliant")
        .slice(0, 5)
        .map(c => ({
          framework: c.framework,
          requirement: c.requirement,
          gap: "Control implementation required"
        }))
    };
  };

  const generateIncidentSummary = () => {
    const totalIncidents = incidents.length;
    const critical = incidents.filter(i => i.severity === "critical").length;
    const high = incidents.filter(i => i.severity === "high").length;
    const open = incidents.filter(i => !["closed", "remediated"].includes(i.status)).length;

    const byType = incidents.reduce((acc, i) => {
      acc[i.incident_type || "Unknown"] = (acc[i.incident_type || "Unknown"] || 0) + 1;
      return acc;
    }, {});

    const closed = incidents.filter(i => i.status === "closed" && i.resolution_date && i.occurred_date);
    const avgResolution = closed.length > 0
      ? (closed.reduce((sum, i) => sum + (new Date(i.resolution_date) - new Date(i.occurred_date)) / (1000 * 60 * 60 * 24), 0) / closed.length).toFixed(1)
      : "N/A";

    return {
      title: "Incident Summary Report",
      generatedAt: new Date().toISOString(),
      summary: {
        totalIncidents,
        critical,
        high,
        open,
        avgResolutionDays: avgResolution,
        byType
      },
      recentIncidents: incidents.slice(0, 10),
      recommendations: [
        "Enhance detection capabilities for early threat identification",
        "Implement automated incident response workflows",
        "Conduct post-incident reviews for all critical incidents"
      ]
    };
  };

  const generateControlEffectiveness = () => {
    const totalControls = controls.length;
    const effective = controls.filter(c => c.status === "effective").length;
    const ineffective = controls.filter(c => c.status === "ineffective").length;

    const avgEffectiveness = (controls.reduce((sum, c) => sum + (c.effectiveness || 0), 0) / totalControls).toFixed(2);

    const byDomain = controls.reduce((acc, c) => {
      acc[c.domain || "Unknown"] = (acc[c.domain || "Unknown"] || 0) + 1;
      return acc;
    }, {});

    return {
      title: "Control Effectiveness Report",
      generatedAt: new Date().toISOString(),
      summary: {
        totalControls,
        effective,
        ineffective,
        avgEffectiveness: avgEffectiveness + "/5",
        effectivenessRate: ((effective / totalControls) * 100).toFixed(1) + "%",
        byDomain
      },
      ineffectiveControls: controls.filter(c => c.status === "ineffective").slice(0, 10),
      recommendations: [
        "Review and update ineffective controls",
        "Conduct regular control testing",
        "Implement continuous monitoring for critical controls"
      ]
    };
  };

  const generateAuditFindings = () => {
    const totalFindings = findings.length;
    const critical = findings.filter(f => f.severity === "critical").length;
    const high = findings.filter(f => f.severity === "high").length;
    const open = findings.filter(f => f.status === "open").length;

    const byCategory = findings.reduce((acc, f) => {
      acc[f.category || "Unknown"] = (acc[f.category || "Unknown"] || 0) + 1;
      return acc;
    }, {});

    return {
      title: "Audit Findings Report",
      generatedAt: new Date().toISOString(),
      summary: {
        totalFindings,
        critical,
        high,
        open,
        remediationRate: (((totalFindings - open) / totalFindings) * 100).toFixed(1) + "%",
        byCategory
      },
      openFindings: findings.filter(f => f.status === "open").slice(0, 10),
      recommendations: [
        "Prioritize remediation of critical findings",
        "Establish remediation timelines and accountability",
        "Track remediation progress with regular follow-ups"
      ]
    };
  };

  const generateExecutiveDashboard = () => {
    return {
      title: "Executive Dashboard Report",
      generatedAt: new Date().toISOString(),
      summary: {
        totalRisks: risks.length,
        highRisks: risks.filter(r => ((r.residual_likelihood || 0) * (r.residual_impact || 0)) >= 9).length,
        totalControls: controls.length,
        effectiveControls: controls.filter(c => c.status === "effective").length,
        complianceRate: ((compliance.filter(c => c.status === "compliant").length / compliance.length) * 100).toFixed(1) + "%",
        openIncidents: incidents.filter(i => !["closed", "remediated"].includes(i.status)).length,
        openFindings: findings.filter(f => f.status === "open").length,
        auditsCompleted: audits.filter(a => a.status === "completed").length
      },
      keyInsights: [
        `${risks.filter(r => ((r.residual_likelihood || 0) * (r.residual_impact || 0)) >= 9).length} high/critical risks require immediate attention`,
        `${controls.filter(c => c.status === "ineffective").length} controls need remediation`,
        `Compliance rate at ${((compliance.filter(c => c.status === "compliant").length / compliance.length) * 100).toFixed(1)}%`,
        `${incidents.filter(i => i.severity === "critical").length} critical incidents reported`
      ],
      recommendations: [
        "Focus on high-risk areas with enhanced controls",
        "Accelerate compliance gap closure initiatives",
        "Strengthen incident response capabilities"
      ]
    };
  };

  const exportToPDF = async () => {
    const element = document.getElementById('report-preview');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${reportData.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("Report exported as PDF");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export PDF");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {preBuiltReports.map(report => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className={`bg-gradient-to-br ${report.color} hover:scale-105 transition-transform cursor-pointer`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-white/10">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{report.name}</h3>
                    <p className="text-xs text-slate-300">{report.description}</p>
                  </div>
                </div>
                <Button
                  onClick={() => generateReport(report.id)}
                  disabled={generating}
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
                  size="sm"
                >
                  {generating && currentReport === report.id ? "Generating..." : "Generate Report"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {reportData && (
        <Card id="report-preview" className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{reportData.title}</CardTitle>
                <p className="text-xs text-slate-500">Generated: {new Date(reportData.generatedAt).toLocaleString()}</p>
              </div>
              <Button onClick={exportToPDF} variant="outline" className="border-blue-500/30 text-blue-400">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Summary Section */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(reportData.summary).map(([key, value]) => {
                    if (typeof value === 'object') return null;
                    return (
                      <Card key={key} className="bg-[#151d2e] border-[#2a3548]">
                        <CardContent className="p-4">
                          <div className="text-xs text-slate-400 mb-1 capitalize">{key.replace(/_/g, ' ')}</div>
                          <div className="text-2xl font-bold text-white">{value}</div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Breakdown by Category/Type */}
              {Object.entries(reportData.summary).map(([key, value]) => {
                if (typeof value !== 'object') return null;
                return (
                  <div key={key}>
                    <h3 className="text-lg font-semibold text-white mb-3 capitalize">{key.replace(/_/g, ' ')}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(value).map(([subKey, subValue]) => (
                        <div key={subKey} className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                          <div className="text-sm text-white">{subKey}</div>
                          <div className="text-lg font-bold text-indigo-400">{typeof subValue === 'object' ? JSON.stringify(subValue) : subValue}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Recommendations */}
              {reportData.recommendations && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Recommendations</h3>
                  <ul className="space-y-2">
                    {reportData.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-300">
                        <Activity className="h-4 w-4 text-emerald-400 mt-1 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Additional Sections */}
              {reportData.topRisks && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Top Risks</h3>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {reportData.topRisks.map((risk, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-white">{risk.title}</div>
                              <div className="text-xs text-slate-400">{risk.category}</div>
                            </div>
                            <Badge className={`${((risk.residual_likelihood || 0) * (risk.residual_impact || 0)) >= 12 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'} border-0`}>
                              Score: {((risk.residual_likelihood || 0) * (risk.residual_impact || 0)).toFixed(0)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {reportData.openFindings && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Open Findings</h3>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {reportData.openFindings.map((finding, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-white">{finding.title}</div>
                              <div className="text-xs text-slate-400">{finding.category}</div>
                            </div>
                            <Badge className={`${finding.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'} border-0`}>
                              {finding.severity}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}