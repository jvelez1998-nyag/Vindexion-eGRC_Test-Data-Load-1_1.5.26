import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Loader2, Download, Eye, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const REPORT_SECTIONS = [
  { id: "executive_summary", label: "Executive Summary", category: "Overview" },
  { id: "client_profile", label: "Client Profile", category: "Overview" },
  { id: "risk_assessment", label: "Risk Assessment", category: "Risk" },
  { id: "compliance_status", label: "Compliance Status", category: "Compliance" },
  { id: "control_maturity", label: "Control Maturity Analysis", category: "Controls" },
  { id: "security_posture", label: "Security Posture", category: "Security" },
  { id: "incident_analysis", label: "Incident Analysis", category: "Risk" },
  { id: "audit_findings", label: "Audit Findings", category: "Compliance" },
  { id: "gap_analysis", label: "Compliance Gap Analysis", category: "Compliance" },
  { id: "recommendations", label: "Recommendations", category: "Strategy" },
  { id: "industry_benchmark", label: "Industry Benchmarking", category: "Analysis" },
  { id: "trends", label: "Trend Analysis", category: "Analysis" },
  { id: "roadmap", label: "Improvement Roadmap", category: "Strategy" },
  { id: "appendix", label: "Technical Appendix", category: "Reference" }
];

const AUDIENCES = [
  { value: "executive", label: "Executive/Board", description: "High-level, strategic focus" },
  { value: "technical", label: "Technical Team", description: "Detailed technical analysis" },
  { value: "management", label: "Management", description: "Balanced overview with actionable insights" },
  { value: "audit", label: "Audit Committee", description: "Compliance and control-focused" },
  { value: "comprehensive", label: "Comprehensive", description: "All details for stakeholders" }
];

export default function AIClientReportGenerator({ client, risks, audits, incidents, findings, allClients }) {
  const [selectedSections, setSelectedSections] = useState([
    "executive_summary", "client_profile", "risk_assessment", "compliance_status", "recommendations"
  ]);
  const [audience, setAudience] = useState("executive");
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const toggleSection = (sectionId) => {
    setSelectedSections(prev =>
      prev.includes(sectionId) ? prev.filter(id => id !== sectionId) : [...prev, sectionId]
    );
  };

  const toggleCategory = (category) => {
    const categorySections = REPORT_SECTIONS.filter(s => s.category === category).map(s => s.id);
    const allSelected = categorySections.every(id => selectedSections.includes(id));
    
    if (allSelected) {
      setSelectedSections(prev => prev.filter(id => !categorySections.includes(id)));
    } else {
      setSelectedSections(prev => [...new Set([...prev, ...categorySections])]);
    }
  };

  const generateReport = async () => {
    if (selectedSections.length === 0) {
      toast.error("Please select at least one report section");
      return;
    }

    setGenerating(true);
    try {
      // Calculate benchmarks
      const industryPeers = allClients?.filter(c => c.industry === client.industry && c.id !== client.id) || [];
      const industryAvgRisk = industryPeers.length > 0 
        ? industryPeers.reduce((sum, c) => sum + (c.risk_score || 50), 0) / industryPeers.length 
        : 50;
      const industryAvgCompliance = industryPeers.length > 0
        ? industryPeers.reduce((sum, c) => sum + (c.compliance_score || 50), 0) / industryPeers.length
        : 50;

      // Prepare comprehensive data
      const clientRisks = risks?.filter(r => client.linked_risks?.includes(r.id)) || [];
      const clientAudits = audits?.filter(a => client.linked_audits?.includes(a.id)) || [];
      const clientIncidents = incidents?.filter(i => client.linked_incidents?.includes(i.id)) || [];
      const clientFindings = findings?.filter(f => client.linked_audits?.includes(f.audit_id)) || [];

      const audienceInfo = AUDIENCES.find(a => a.value === audience);

      const prompt = `You are a professional GRC report writer. Generate a comprehensive client report in markdown format.

TARGET AUDIENCE: ${audienceInfo.label}
${audienceInfo.description}

CLIENT INFORMATION:
- Name: ${client.name}
- Industry: ${client.industry}
- Type: ${client.client_type}
- Status: ${client.status}
- Data Classification: ${client.data_classification || 'Not specified'}

METRICS:
- Risk Score: ${client.risk_score || 'N/A'} (Industry Avg: ${industryAvgRisk.toFixed(1)})
- Risk Level: ${client.risk_level || 'Not assessed'}
- Compliance Score: ${client.compliance_score || 'N/A'} (Industry Avg: ${industryAvgCompliance.toFixed(1)})
- Control Maturity: ${client.control_maturity || 'N/A'}
- Security Posture: ${client.security_posture || 'N/A'}

REGULATORY FRAMEWORKS:
${(client.regulatory_frameworks || []).join(', ') || 'None specified'}

STATISTICS:
- Total Risks: ${clientRisks.length}
- High/Critical Risks: ${clientRisks.filter(r => r.risk_level === 'high' || r.risk_level === 'critical').length}
- Incidents: ${client.incident_count || 0}
- Audit Findings: ${client.finding_count || 0}
- Critical Issues: ${client.critical_issues || 0}

COMPLIANCE GAPS:
${(client.compliance_gaps || []).join(', ') || 'None identified'}

SELECTED REPORT SECTIONS:
${selectedSections.map(id => REPORT_SECTIONS.find(s => s.id === id)?.label).join(', ')}

REPORT REQUIREMENTS:
1. Professional business writing style appropriate for ${audienceInfo.label}
2. Include only the selected sections
3. Use clear markdown formatting with headings, bullet points, and tables
4. Include specific data points and metrics
5. For executive audience: focus on high-level insights, strategic impact, business outcomes
6. For technical audience: include detailed technical analysis, control specifics, implementation details
7. For audit audience: emphasize compliance status, control effectiveness, findings
8. Use appropriate visualizations suggestions (describe charts/graphs)
9. Include executive recommendations and next steps

Generate a comprehensive report covering the selected sections. Use professional formatting with:
- Clear section headers (##)
- Subsections (###)
- Bullet points for lists
- Tables where appropriate (use markdown tables)
- Bold for emphasis
- Metrics and data visualization descriptions

Structure the report logically and ensure it flows well for the target audience.`;

      const reportContent = await base44.integrations.Core.InvokeLLM({
        prompt
      });

      const reportData = {
        content: reportContent,
        metadata: {
          client_name: client.name,
          generated_date: new Date().toISOString(),
          audience: audienceInfo.label,
          sections: selectedSections.map(id => REPORT_SECTIONS.find(s => s.id === id)?.label),
          generated_by: "AI Report Generator"
        }
      };

      setReport(reportData);
      setPreviewOpen(true);
      toast.success("Report generated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate report: " + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;

    const blob = new Blob([report.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${client.name.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  };

  const categories = [...new Set(REPORT_SECTIONS.map(s => s.category))];

  return (
    <>
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <FileText className="h-5 w-5 text-blue-400" />
            AI Client Report Generator
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Audience Selection */}
          <div>
            <label className="text-white font-semibold mb-2 block">Target Audience</label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                {AUDIENCES.map(aud => (
                  <SelectItem key={aud.value} value={aud.value} className="text-white hover:bg-[#2a3548]">
                    <div>
                      <div className="font-medium">{aud.label}</div>
                      <div className="text-xs text-slate-400">{aud.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Section Selection */}
          <div>
            <label className="text-white font-semibold mb-3 block">Report Sections</label>
            <div className="space-y-4">
              {categories.map(category => {
                const categorySections = REPORT_SECTIONS.filter(s => s.category === category);
                const allSelected = categorySections.every(s => selectedSections.includes(s.id));
                const someSelected = categorySections.some(s => selectedSections.includes(s.id));

                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center gap-2 p-2 rounded bg-[#151d2e] border border-[#2a3548]">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={() => toggleCategory(category)}
                        className={someSelected && !allSelected ? "opacity-50" : ""}
                      />
                      <span className="text-white font-medium">{category}</span>
                      <span className="text-xs text-slate-500 ml-auto">
                        {categorySections.filter(s => selectedSections.includes(s.id)).length}/{categorySections.length}
                      </span>
                    </div>
                    <div className="ml-6 space-y-1">
                      {categorySections.map(section => (
                        <div key={section.id} className="flex items-center gap-2 p-2 rounded hover:bg-[#151d2e]">
                          <Checkbox
                            checked={selectedSections.includes(section.id)}
                            onCheckedChange={() => toggleSection(section.id)}
                          />
                          <span className="text-sm text-slate-300">{section.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              onClick={generateReport}
              disabled={generating || selectedSections.length === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
            {report && (
              <Button
                onClick={() => setPreviewOpen(true)}
                variant="outline"
                className="border-[#2a3548] hover:bg-[#2a3548]"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{selectedSections.length}</div>
              <div className="text-xs text-slate-500">Sections Selected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{AUDIENCES.find(a => a.value === audience)?.label}</div>
              <div className="text-xs text-slate-500">Target Audience</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">Client Report Preview</DialogTitle>
              <Button
                onClick={downloadReport}
                variant="outline"
                size="sm"
                className="border-[#2a3548] hover:bg-[#2a3548]"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </DialogHeader>

          {report && (
            <div className="space-y-4">
              {/* Metadata */}
              <div className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548] text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500">Client:</span>
                    <span className="text-white ml-2">{report.metadata.client_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Generated:</span>
                    <span className="text-white ml-2">
                      {new Date(report.metadata.generated_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Audience:</span>
                    <span className="text-white ml-2">{report.metadata.audience}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Sections:</span>
                    <span className="text-white ml-2">{report.metadata.sections.length}</span>
                  </div>
                </div>
              </div>

              {/* Report Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6 rounded-lg bg-white text-gray-900">
                <ReactMarkdown
                  className="prose prose-sm max-w-none"
                  components={{
                    h1: ({ children }) => <h1 className="text-3xl font-bold mb-4 text-gray-900 border-b pb-2">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-2xl font-bold mt-6 mb-3 text-gray-900">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-800">{children}</h3>,
                    p: ({ children }) => <p className="mb-3 text-gray-700 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc ml-6 mb-3 text-gray-700">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal ml-6 mb-3 text-gray-700">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    table: ({ children }) => <table className="min-w-full border-collapse border border-gray-300 my-4">{children}</table>,
                    thead: ({ children }) => <thead className="bg-gray-100">{children}</thead>,
                    tbody: ({ children }) => <tbody>{children}</tbody>,
                    tr: ({ children }) => <tr className="border-b border-gray-200">{children}</tr>,
                    th: ({ children }) => <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900">{children}</th>,
                    td: ({ children }) => <td className="border border-gray-300 px-4 py-2 text-gray-700">{children}</td>,
                    strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                    blockquote: ({ children }) => <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-3">{children}</blockquote>
                  }}
                >
                  {report.content}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}