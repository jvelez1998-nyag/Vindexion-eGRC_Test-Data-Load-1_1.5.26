import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, Sparkles, FileText, Download, Copy, Loader2, 
  Wand2, TrendingUp, AlertTriangle, Target, Lightbulb, BarChart3
} from "lucide-react";
import { 
  ResponsiveContainer, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";

export default function EnhancedAIReportEngine({ data }) {
  const [reportType, setReportType] = useState('executive');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedReport, setGeneratedReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');

  const reportTemplates = [
    {
      id: 'executive',
      name: 'Executive Summary',
      description: 'High-level overview for C-suite and board',
      icon: Target
    },
    {
      id: 'risk-deep-dive',
      name: 'Risk Deep Dive',
      description: 'Comprehensive risk analysis with trends',
      icon: AlertTriangle
    },
    {
      id: 'compliance-gap',
      name: 'Compliance Gap Analysis',
      description: 'Framework gaps and remediation roadmap',
      icon: FileText
    },
    {
      id: 'control-maturity',
      name: 'Control Maturity Assessment',
      description: 'Control effectiveness and maturity scoring',
      icon: TrendingUp
    },
    {
      id: 'board-report',
      name: 'Board Report',
      description: 'Concise executive briefing for board meetings',
      icon: Brain
    },
    {
      id: 'custom',
      name: 'Custom Report',
      description: 'Define your own report requirements',
      icon: Wand2
    }
  ];

  const generateReport = async () => {
    setLoading(true);
    try {
      const template = reportTemplates.find(t => t.id === reportType);
      
      const { risks = [], compliance = [], controls = [], audits = [], incidents = [], findings = [], vendors = [] } = data || {};

      // Calculate statistics
      const stats = {
        risks: {
          total: risks.length,
          critical: risks.filter(r => (r.residual_likelihood || 0) * (r.residual_impact || 0) >= 16).length,
          open: risks.filter(r => r.status !== 'closed').length,
          byCategory: getCategoryBreakdown(risks, 'category')
        },
        compliance: {
          total: compliance.length,
          compliant: compliance.filter(c => c.status === 'implemented' || c.status === 'verified').length,
          rate: compliance.length > 0 ? Math.round((compliance.filter(c => c.status === 'implemented' || c.status === 'verified').length / compliance.length) * 100) : 0,
          byFramework: getCategoryBreakdown(compliance, 'framework')
        },
        controls: {
          total: controls.length,
          effective: controls.filter(c => c.status === 'effective').length,
          avgEffectiveness: controls.length > 0 ? Math.round((controls.reduce((sum, c) => sum + (c.effectiveness || 0), 0) / controls.filter(c => c.effectiveness).length) || 0) : 0,
          byDomain: getCategoryBreakdown(controls, 'domain')
        },
        audits: {
          total: audits.length,
          completed: audits.filter(a => a.status === 'completed').length,
          inProgress: audits.filter(a => a.status === 'in_progress').length
        },
        incidents: {
          total: incidents.length,
          critical: incidents.filter(i => i.severity === 'critical').length,
          open: incidents.filter(i => !['closed', 'remediated'].includes(i.status)).length,
          bySeverity: getCategoryBreakdown(incidents, 'severity')
        },
        findings: {
          total: findings.length,
          critical: findings.filter(f => f.severity === 'critical').length,
          open: findings.filter(f => f.status === 'open').length
        },
        vendors: {
          total: vendors.length,
          highRisk: vendors.filter(v => (v.overall_risk_score || 0) > 60).length
        }
      };

      let basePrompt = '';
      
      switch (reportType) {
        case 'executive':
          basePrompt = `Create a comprehensive executive summary report for the organization's GRC posture. Focus on high-level insights, key metrics, and strategic recommendations suitable for C-suite executives.`;
          break;
        case 'risk-deep-dive':
          basePrompt = `Provide an in-depth risk analysis report covering risk landscape, emerging threats, treatment effectiveness, and detailed recommendations. Include trend analysis and risk appetite alignment.`;
          break;
        case 'compliance-gap':
          basePrompt = `Generate a compliance gap analysis identifying missing requirements, implementation gaps, and a prioritized remediation roadmap. Map gaps to business impact.`;
          break;
        case 'control-maturity':
          basePrompt = `Assess control maturity across all domains. Evaluate effectiveness, coverage gaps, testing results, and provide a maturity scoring with improvement roadmap.`;
          break;
        case 'board-report':
          basePrompt = `Create a concise board-level report (max 2 pages equivalent) highlighting critical risks, compliance status, major incidents, and key decisions needed.`;
          break;
        case 'custom':
          basePrompt = customPrompt;
          break;
      }

      const fullPrompt = `You are a senior GRC analyst preparing a professional report.

${basePrompt}

**CURRENT DATA SUMMARY:**

RISK POSTURE:
- Total Risks: ${stats.risks.total}
- Critical Risks: ${stats.risks.critical}
- Open Risks: ${stats.risks.open}
- Risk Distribution: ${JSON.stringify(stats.risks.byCategory)}

COMPLIANCE STATUS:
- Total Requirements: ${stats.compliance.total}
- Compliant: ${stats.compliance.compliant}
- Compliance Rate: ${stats.compliance.rate}%
- Framework Breakdown: ${JSON.stringify(stats.compliance.byFramework)}

CONTROL EFFECTIVENESS:
- Total Controls: ${stats.controls.total}
- Effective Controls: ${stats.controls.effective}
- Average Effectiveness: ${stats.controls.avgEffectiveness}/5
- Domain Coverage: ${JSON.stringify(stats.controls.byDomain)}

AUDIT & ASSURANCE:
- Total Audits: ${stats.audits.total}
- Completed: ${stats.audits.completed}
- In Progress: ${stats.audits.inProgress}

INCIDENTS:
- Total Incidents: ${stats.incidents.total}
- Critical: ${stats.incidents.critical}
- Open: ${stats.incidents.open}
- By Severity: ${JSON.stringify(stats.incidents.bySeverity)}

FINDINGS:
- Total Findings: ${stats.findings.total}
- Critical Findings: ${stats.findings.critical}
- Open Findings: ${stats.findings.open}

THIRD-PARTY RISK:
- Total Vendors: ${stats.vendors.total}
- High-Risk Vendors: ${stats.vendors.highRisk}

**FORMAT REQUIREMENTS:**
Return a structured JSON report with the following sections:
1. executive_summary (string)
2. key_metrics (array of objects with metric, value, trend, insight)
3. critical_findings (array of strings)
4. positive_trends (array of strings)  
5. recommendations (array of objects with priority, title, description, timeline, impact)
6. risk_assessment (object with overall_score, maturity_level, key_concerns)
7. trends (array of objects with category, direction, significance, data_points)

Be specific, data-driven, and actionable.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: fullPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            key_metrics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  metric: { type: "string" },
                  value: { type: "string" },
                  trend: { type: "string" },
                  insight: { type: "string" }
                }
              }
            },
            critical_findings: { type: "array", items: { type: "string" } },
            positive_trends: { type: "array", items: { type: "string" } },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  priority: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  timeline: { type: "string" },
                  impact: { type: "string" }
                }
              }
            },
            risk_assessment: {
              type: "object",
              properties: {
                overall_score: { type: "number" },
                maturity_level: { type: "string" },
                key_concerns: { type: "array", items: { type: "string" } }
              }
            },
            trends: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  direction: { type: "string" },
                  significance: { type: "string" },
                  data_points: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      setGeneratedReport(result);
      setActiveTab('summary');
      toast.success('AI report generated');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    if (!generatedReport) return;

    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.text('GRC Intelligence Report', 14, y);
    y += 10;

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, y);
    y += 10;

    doc.setFontSize(12);
    doc.text('Executive Summary', 14, y);
    y += 8;

    doc.setFontSize(9);
    const summaryLines = doc.splitTextToSize(generatedReport.executive_summary, 180);
    summaryLines.forEach(line => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 14, y);
      y += 5;
    });

    doc.save(`grc-report-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF exported');
  };

  const copyToClipboard = () => {
    const text = `
EXECUTIVE SUMMARY
${generatedReport.executive_summary}

KEY FINDINGS
${generatedReport.critical_findings?.join('\n- ')}

RECOMMENDATIONS
${generatedReport.recommendations?.map(r => `${r.priority}: ${r.title} - ${r.description}`).join('\n')}
    `;
    navigator.clipboard.writeText(text);
    toast.success('Report copied');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Configuration Panel */}
      <Card className="bg-[#1a2332] border-[#2a3548] lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-purple-400" />
            AI Report Engine
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Report Type</label>
            <div className="space-y-2">
              {reportTemplates.map(template => {
                const Icon = template.icon;
                return (
                  <div
                    key={template.id}
                    onClick={() => setReportType(template.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      reportType === template.id
                        ? 'bg-purple-500/20 border-purple-500/40'
                        : 'bg-[#151d2e] border-[#2a3548] hover:border-[#3a4558]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-purple-400" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{template.name}</div>
                        <div className="text-xs text-slate-400">{template.description}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {reportType === 'custom' && (
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Custom Requirements</label>
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe what analysis and insights you want..."
                className="bg-[#151d2e] border-[#2a3548] text-white min-h-[120px]"
              />
            </div>
          )}

          <div className="pt-4 border-t border-[#2a3548]">
            <h4 className="text-sm font-medium text-white mb-3">Data Sources</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <DataSourceBadge label="Risks" count={data.risks?.length || 0} color="rose" />
              <DataSourceBadge label="Compliance" count={data.compliance?.length || 0} color="emerald" />
              <DataSourceBadge label="Controls" count={data.controls?.length || 0} color="blue" />
              <DataSourceBadge label="Audits" count={data.audits?.length || 0} color="purple" />
              <DataSourceBadge label="Incidents" count={data.incidents?.length || 0} color="amber" />
              <DataSourceBadge label="Findings" count={data.findings?.length || 0} color="orange" />
            </div>
          </div>

          <Button 
            onClick={generateReport} 
            disabled={loading || (reportType === 'custom' && !customPrompt)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" /> Generate AI Report</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Report */}
      <Card className="bg-[#1a2332] border-[#2a3548] lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-5 w-5 text-indigo-400" />
              AI-Generated Intelligence Report
            </CardTitle>
            {generatedReport && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard} className="border-[#2a3548]">
                  <Copy className="h-3 w-3 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={exportToPDF} className="border-[#2a3548]">
                  <Download className="h-3 w-3 mr-2" />
                  PDF
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!generatedReport ? (
            <div className="flex flex-col items-center justify-center h-[700px] text-center">
              <Brain className="h-20 w-20 text-slate-600 mb-6" />
              <h3 className="text-xl font-semibold text-white mb-3">AI-Powered Intelligence</h3>
              <p className="text-slate-400 max-w-lg leading-relaxed">
                Select a report type and generate comprehensive AI analysis with executive summaries, 
                trend identification, critical findings, and strategic recommendations.
              </p>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-[#0f1623] border border-[#2a3548] mb-4">
                <TabsTrigger value="summary">Executive Summary</TabsTrigger>
                <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
                <TabsTrigger value="findings">Findings</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[640px]">
                <TabsContent value="summary" className="space-y-4">
                  <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-indigo-500/20">
                        <FileText className="h-5 w-5 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Executive Summary</h3>
                        <p className="text-xs text-slate-400">AI-generated overview</p>
                      </div>
                      <Badge className="ml-auto bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        Score: {generatedReport.risk_assessment?.overall_score || 'N/A'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {generatedReport.executive_summary}
                    </p>
                  </Card>

                  {generatedReport.risk_assessment && (
                    <Card className="bg-[#151d2e] border-[#2a3548] p-5">
                      <h4 className="text-sm font-semibold text-white mb-3">Risk Assessment</h4>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-indigo-400">{generatedReport.risk_assessment.overall_score}/100</div>
                          <div className="text-xs text-slate-400">Health Score</div>
                        </div>
                        <div className="text-center col-span-2">
                          <div className="text-lg font-bold text-white">{generatedReport.risk_assessment.maturity_level}</div>
                          <div className="text-xs text-slate-400">Maturity Level</div>
                        </div>
                      </div>
                      {generatedReport.risk_assessment.key_concerns?.length > 0 && (
                        <div>
                          <div className="text-xs text-slate-500 mb-2">Key Concerns:</div>
                          <ul className="space-y-1">
                            {generatedReport.risk_assessment.key_concerns.map((concern, idx) => (
                              <li key={idx} className="text-sm text-rose-400 flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                {concern}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="metrics" className="space-y-3">
                  {generatedReport.key_metrics?.map((metric, idx) => (
                    <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-white">{metric.metric}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${
                            metric.trend === 'improving' ? 'bg-emerald-500/20 text-emerald-400' :
                            metric.trend === 'declining' ? 'bg-rose-500/20 text-rose-400' :
                            'bg-slate-500/20 text-slate-400'
                          }`}>
                            {metric.trend}
                          </Badge>
                          <span className="text-lg font-bold text-indigo-400">{metric.value}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400">{metric.insight}</p>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="findings" className="space-y-4">
                  <Card className="bg-rose-500/10 border-rose-500/20 p-5">
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-rose-400" />
                      Critical Findings
                    </h4>
                    <ul className="space-y-2">
                      {generatedReport.critical_findings?.map((finding, idx) => (
                        <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-rose-400 mt-1">•</span>
                          {finding}
                        </li>
                      ))}
                    </ul>
                  </Card>

                  <Card className="bg-emerald-500/10 border-emerald-500/20 p-5">
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                      Positive Trends
                    </h4>
                    <ul className="space-y-2">
                      {generatedReport.positive_trends?.map((trend, idx) => (
                        <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-emerald-400 mt-1">•</span>
                          {trend}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </TabsContent>

                <TabsContent value="trends" className="space-y-3">
                  {generatedReport.trends?.map((trend, idx) => (
                    <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-white">{trend.category}</h4>
                        <Badge className={`text-xs ${
                          trend.direction === 'upward' ? 'bg-emerald-500/20 text-emerald-400' :
                          trend.direction === 'downward' ? 'bg-rose-500/20 text-rose-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {trend.direction} - {trend.significance}
                        </Badge>
                      </div>
                      <ul className="space-y-1">
                        {trend.data_points?.map((point, pidx) => (
                          <li key={pidx} className="text-xs text-slate-400 flex items-start gap-2">
                            <BarChart3 className="h-3 w-3 text-indigo-400 mt-0.5 flex-shrink-0" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-3">
                  {generatedReport.recommendations?.map((rec, idx) => (
                    <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-indigo-500/10">
                            <Lightbulb className="h-5 w-5 text-indigo-400" />
                          </div>
                          <div>
                            <h4 className="text-base font-semibold text-white">{rec.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={`text-[10px] ${
                                rec.priority === 'critical' || rec.priority === 'high' 
                                  ? 'bg-rose-500/20 text-rose-400'
                                  : rec.priority === 'medium'
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-blue-500/20 text-blue-400'
                              }`}>
                                {rec.priority}
                              </Badge>
                              <Badge className="text-[10px] bg-slate-500/20 text-slate-400">
                                {rec.timeline}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-300 mb-3">{rec.description}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500">Expected Impact:</span>
                        <span className="text-emerald-400">{rec.impact}</span>
                      </div>
                    </Card>
                  ))}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DataSourceBadge({ label, count, color }) {
  const colorMap = {
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
  };

  return (
    <div className={`flex items-center justify-between p-2 rounded border ${colorMap[color]}`}>
      <span>{label}</span>
      <Badge className="bg-white/10 text-white">{count}</Badge>
    </div>
  );
}

function getCategoryBreakdown(items, field) {
  const breakdown = {};
  items.forEach(item => {
    const key = item[field] || 'Unknown';
    breakdown[key] = (breakdown[key] || 0) + 1;
  });
  return breakdown;
}